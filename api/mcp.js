import { createHash, timingSafeEqual } from 'node:crypto';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import * as z from 'zod/v4';
import { CANONICAL_ORIGIN, PAYLOAD_BYTES_LIMIT, PublishingError, guidePayloadSchema, publicationStatusSchema } from '../lib/guide-publishing/contract.mjs';
import { createGuidePublisher } from '../lib/guide-publishing/github.mjs';

const REQUEST_BYTES_LIMIT = PAYLOAD_BYTES_LIMIT + 8 * 1024;
const digest = (value) => createHash('sha256').update(value).digest();

export function publisherAuthorized(authorization, expected) {
  if (typeof expected !== 'string' || expected.length < 32 || typeof authorization !== 'string' || authorization.length > 512) return false;
  const match = /^Bearer ([A-Za-z0-9._~+/-]+=*)$/.exec(authorization);
  return Boolean(match && timingSafeEqual(digest(match[1]), digest(expected)));
}

const toolResult = (value) => ({ content: [{ type: 'text', text: JSON.stringify(value) }], structuredContent: value });
const toolFailure = (error) => {
  const safe = error instanceof PublishingError ? { code: error.code, message: error.message } : { code: 'PUBLISHER_UNAVAILABLE', message: 'The publisher could not complete the request. Retry with the same requestId.' };
  return { ...toolResult({ ok: false, error: safe }), isError: true };
};

export function createPublisherMcpHandler({ env = process.env, fetchImpl = fetch } = {}) {
  const publisher = createGuidePublisher({ env, fetchImpl });
  const mcp = createMcpHandler(() => {
    const server = new McpServer({ name: 'mcc-guide-publisher', version: '1.0.0' });
    const run = (operation) => async (input) => {
      try { return toolResult(await operation(input)); } catch (error) { return toolFailure(error); }
    };
    server.registerTool('publish_guide', {
      title: 'Publish an MCC cleaning guide',
      description: 'Add one new Markdown guide to Master Commercial Clean production after the initial launch is approved. Cannot change code or replace existing pages. Reuse the same UUID requestId and content for retries. A failed request can retry its original workflow, with at most three total attempts. An accepted job is not yet published. Poll get_publication_status until published or failed.',
      inputSchema: guidePayloadSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, run(publisher.publishGuide));
    server.registerTool('get_publication_status', {
      title: 'Check an MCC guide publication',
      description: 'Read the trusted cloud workflow and verify the actual live article, guide index, publication manifest and sitemap. Reports published only after all checks pass.',
      inputSchema: publicationStatusSchema,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    }, run(publisher.publicationStatus));
    server.registerTool('list_guides', {
      title: 'List live MCC guides',
      description: 'Read public guide titles and slugs to choose related articles and avoid duplicate topics. Does not expose credentials or unpublished source.',
      inputSchema: z.strictObject({}),
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    }, run(publisher.listGuides));
    return server;
  }, { legacy: 'stateless', maxRequestBodySize: REQUEST_BYTES_LIMIT, keepAliveMs: 0 });
  const nodeHandler = toNodeHandler(mcp, { maxRequestBodySize: REQUEST_BYTES_LIMIT });

  async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    const reject = (status, message) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: message }));
    };
    if (!env.MCC_GUIDE_PUBLISHER_TOKEN || env.MCC_GUIDE_PUBLISHER_TOKEN.length < 32) return reject(503, 'The guide publisher connection is not configured.');
    if (!publisherAuthorized(req.headers.authorization, env.MCC_GUIDE_PUBLISHER_TOKEN)) {
      res.setHeader('WWW-Authenticate', 'Bearer realm="mcc-guide-publisher"');
      return reject(401, 'A valid guide publisher credential is required.');
    }
    const allowedOrigins = new Set([CANONICAL_ORIGIN, ...(env.MCC_GUIDE_PUBLISHER_ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean)]);
    if (req.headers.origin && !allowedOrigins.has(req.headers.origin)) return reject(403, 'This browser origin is not allowed to use the guide publisher.');
    if (Number(req.headers['content-length'] || 0) > REQUEST_BYTES_LIMIT) return reject(413, 'Request is too large.');
    if (req.body !== undefined) {
      let serialized;
      try { serialized = typeof req.body === 'string' ? req.body : JSON.stringify(req.body); } catch { return reject(400, 'Send a valid MCP request.'); }
      if (Buffer.byteLength(serialized || '') > REQUEST_BYTES_LIMIT) return reject(413, 'Request is too large.');
    }
    // Vercel can parse JSON before this handler. The official adapter accepts
    // that parsed body and also supports an untouched Node request stream.
    return nodeHandler(req, res, req.body);
  }
  handler.close = () => mcp.close();
  return handler;
}

export default createPublisherMcpHandler();
