import { createHash } from 'node:crypto';
import * as z from 'zod/v4';

export const REPOSITORY = 'JxWayne890/MasterCleanHQ';
export const PRODUCTION_BRANCH = 'main';
export const PUBLISH_WORKFLOW = 'mcc-guide-publish.yml';
export const CANONICAL_ORIGIN = 'https://www.mastercleanhq.com';
export const PAYLOAD_BYTES_LIMIT = 48 * 1024;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Reject control and direction override characters before persistence.
// eslint-disable-next-line no-control-regex
const unsafeControls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/;
const text = (minimum, maximum) => z.string().min(minimum).max(maximum).refine((value) => !unsafeControls.test(value), 'Unsupported control character.');
export const slugSchema = z.string().min(3).max(100).regex(SLUG_PATTERN);
export const requestIdSchema = z.string().regex(UUID_PATTERN);
export const guidePayloadSchema = z.strictObject({
  requestId: requestIdSchema,
  slug: slugSchema,
  title: text(10, 160),
  description: text(40, 320),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: text(2, 80),
  related: z.array(slugSchema).min(1).max(6),
  markdown: text(100, 32 * 1024),
});
export const publicationStatusSchema = z.strictObject({ requestId: requestIdSchema });
export const GUIDE_PAYLOAD_SCHEMA = z.toJSONSchema(guidePayloadSchema);

export class PublishingError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'PublishingError';
    this.code = code;
    this.status = status;
  }
}

export function validateGuidePayload(input, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const parsed = guidePayloadSchema.safeParse(input);
  if (!parsed.success) throw new PublishingError('INVALID_GUIDE', parsed.error.issues.map(({ path, message }) => `${path.join('.') || 'guide'}: ${message}`).join(' '));
  const payload = { ...parsed.data, requestId: parsed.data.requestId.toLowerCase() };
  for (const key of ['title', 'description', 'category']) {
    if (payload[key].trim() !== payload[key] || /[\r\n]/.test(payload[key])) throw new PublishingError('INVALID_GUIDE', `${key} must be one trimmed line.`);
  }
  const date = new Date(`${payload.date}T00:00:00Z`);
  if (payload.date.startsWith('0000-') || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== payload.date || payload.date > today) throw new PublishingError('INVALID_GUIDE', 'date must be a real calendar date that is not in the future.');
  if (payload.related.includes(payload.slug) || new Set(payload.related).size !== payload.related.length) throw new PublishingError('INVALID_GUIDE', 'Related guides must be unique and cannot include this guide.');
  if (/^---\s*\r?\n/.test(payload.markdown) || /<\/?[A-Za-z][^>]*>/.test(payload.markdown) || /!\[/.test(payload.markdown)) throw new PublishingError('INVALID_GUIDE', 'Send plain article Markdown without frontmatter, HTML or images.');
  const body = payload.markdown.replace(/\r\n?/g, '\n').trim();
  if ((body.match(/^##\s+\S/gm) || []).length < 2) throw new PublishingError('INVALID_GUIDE', 'Include at least two useful second level headings.');
  if (!/\[Get a free quote from Master Commercial Clean\]\(\/contact\)\.?\s*$/.test(body)) throw new PublishingError('INVALID_GUIDE', 'End with the Master Commercial Clean free quote link to /contact.');
  const wordCount = body.replace(/\[[^\]]*\]\([^)]*\)/g, (value) => value.slice(1, value.indexOf(']'))).split(/\s+/).filter(Boolean).length;
  if (wordCount < 900 || wordCount > 1500) throw new PublishingError('INVALID_GUIDE', `Expected 900 to 1500 words, found ${wordCount}.`);
  const normalized = { ...payload, markdown: `${body}\n` };
  if (Buffer.byteLength(JSON.stringify(normalized)) > PAYLOAD_BYTES_LIMIT) throw new PublishingError('INVALID_GUIDE', 'Guide payload is too large.');
  return normalized;
}

export function canonicalPayload(payload) {
  return JSON.stringify({ requestId: payload.requestId, slug: payload.slug, title: payload.title, description: payload.description, date: payload.date, category: payload.category, related: payload.related, markdown: payload.markdown });
}

// requestId is intentionally excluded, so retrying identical content can be recognized.
export function hashGuidePayload(payload) {
  const content = JSON.parse(canonicalPayload(payload));
  delete content.requestId;
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

export function serializeGuide(payload) {
  const metadata = ['title', 'description', 'date', 'category'].map((key) => `${key}: ${JSON.stringify(payload[key])}`);
  metadata.push(`related: ${JSON.stringify(payload.related)}`);
  metadata.push(`publicationRequestId: ${JSON.stringify(payload.requestId)}`);
  metadata.push(`publicationContentHash: ${JSON.stringify(hashGuidePayload(payload))}`);
  return `---\n${metadata.join('\n')}\n---\n\n${payload.markdown.trim()}\n`;
}

export function publicationRunName(payload) {
  return `MCC guide ${payload.requestId} ${hashGuidePayload(payload)} ${payload.slug}`;
}

export function parsePublicationRunName(value) {
  const match = /^MCC guide ([0-9a-f-]{36}) ([0-9a-f]{64}) ([a-z0-9-]{3,100})$/.exec(String(value));
  if (!match || !UUID_PATTERN.test(match[1]) || !SLUG_PATTERN.test(match[3])) return null;
  return { requestId: match[1], contentHash: match[2], slug: match[3] };
}
