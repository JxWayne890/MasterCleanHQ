import { verifyPublicGuide } from '../../scripts/verify-guide-publication.mjs';
import {
  CANONICAL_ORIGIN, PRODUCTION_BRANCH, PUBLISH_WORKFLOW, REPOSITORY,
  PublishingError, canonicalPayload, hashGuidePayload, parsePublicationRunName,
  serializeGuide, validateGuidePayload,
} from './contract.mjs';

const API_ORIGIN = 'https://api.github.com';
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_PUBLICATION_ATTEMPTS = 3;
const encoded = (value) => encodeURIComponent(value);
const sleepFreeStatuses = new Set(['queued', 'in_progress', 'requested', 'waiting', 'pending']);
const isActive = (run) => sleepFreeStatuses.has(run.status) || !run.conclusion;
const attemptsFor = (run) => Number.isInteger(run.run_attempt) && run.run_attempt > 0 ? run.run_attempt : 1;

export function createGuidePublisher({ env = process.env, fetchImpl = fetch } = {}) {
  async function request(url, options = {}) {
    let response;
    try { response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(10_000), redirect: 'error' }); }
    catch { throw new PublishingError('UPSTREAM_UNAVAILABLE', 'Publishing services are temporarily unavailable. Retry with the same requestId.', 503); }
    return response;
  }

  async function github(route, { method = 'GET', body, optional = false } = {}) {
    if (!env.MCC_PUBLISHER_GITHUB_TOKEN) throw new PublishingError('PUBLISHER_NOT_CONFIGURED', 'The publisher GitHub connection is not configured.', 503);
    const response = await request(`${API_ORIGIN}/repos/${REPOSITORY}${route}`, {
      method,
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${env.MCC_PUBLISHER_GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', 'User-Agent': 'MasterCommercialClean-GuidePublisher' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (response.status === 404 && optional) return null;
    if (!response.ok) throw new PublishingError(response.status === 403 || response.status === 429 ? 'GITHUB_LIMIT_OR_PERMISSION' : 'GITHUB_REQUEST_FAILED', 'GitHub could not complete the publishing request. Check the publisher connection and retry with the same requestId.', 503);
    if (response.status === 204) return null;
    const raw = await response.text();
    if (response.status === 201 && !raw.trim()) return null;
    if (Buffer.byteLength(raw) > MAX_RESPONSE_BYTES) throw new PublishingError('UPSTREAM_RESPONSE_INVALID', 'Publishing service returned an unexpected response.', 502);
    try { return JSON.parse(raw); } catch { throw new PublishingError('UPSTREAM_RESPONSE_INVALID', 'Publishing service returned an unexpected response.', 502); }
  }

  async function sourceFile(path, { optional = false } = {}) {
    const entry = await github(`/contents/${path.split('/').map(encoded).join('/')}?ref=${PRODUCTION_BRANCH}`, { optional });
    if (entry === null) return null;
    if (entry.type !== 'file' || entry.encoding !== 'base64' || typeof entry.content !== 'string' || entry.size > MAX_RESPONSE_BYTES) throw new PublishingError('REPOSITORY_NOT_READY', 'The production repository contains unexpected publishing files.', 409);
    return Buffer.from(entry.content.replace(/\s/g, ''), 'base64').toString('utf8');
  }

  async function publicText(path) {
    const response = await request(`${CANONICAL_ORIGIN}${path}`, { headers: { Accept: 'text/html, application/json, application/xml;q=0.9, */*;q=0.1', 'Cache-Control': 'no-cache' }, cache: 'no-store' });
    if (!response.ok) throw new PublishingError('LIVE_VERIFICATION_PENDING', 'The expected public page is not available yet.', 409);
    const raw = await response.text();
    if (Buffer.byteLength(raw) > MAX_RESPONSE_BYTES) throw new PublishingError('LIVE_VERIFICATION_PENDING', 'The public page returned an unexpected response.', 409);
    return raw;
  }

  async function requireReadiness() {
    if (env.MCC_GUIDES_PUBLISHING_ENABLED !== 'true') throw new PublishingError('INITIAL_LAUNCH_REQUIRED', 'Automatic guide publication is disabled until John approves and completes the initial website launch.', 409);
    const files = ['docs/GUIDE_PUBLISHING.md', 'scripts/publish-guide.mjs', 'scripts/verify-guide-publication.mjs', `.github/workflows/${PUBLISH_WORKFLOW}`];
    const [setup, index, head, manifestText] = await Promise.all([Promise.all(files.map((path) => sourceFile(path, { optional: true }))), publicText('/guides'), github(`/git/ref/heads/${PRODUCTION_BRANCH}`), publicText('/guide-publication-manifest.json')]);
    let manifest;
    try { manifest = JSON.parse(manifestText); } catch { throw new PublishingError('INITIAL_LAUNCH_REQUIRED', 'The approved publication manifest must be live before a guide can be dispatched.', 409); }
    if (setup.some((source) => !source) || !index.includes('href="/guides/') || !index.includes('Commercial cleaning guides') || !/^[0-9a-f]{40}$/.test(head?.object?.sha || '') || manifest.schemaVersion !== 1 || manifest.commit !== head.object.sha) throw new PublishingError('INITIAL_LAUNCH_REQUIRED', 'The approved guide publishing setup must be live at the current production commit before a guide can be dispatched.', 409);
  }

  async function findRuns(requestId) {
    const found = [];
    for (let page = 1; page <= 5; page++) {
      const data = await github(`/actions/workflows/${PUBLISH_WORKFLOW}/runs?branch=${PRODUCTION_BRANCH}&event=workflow_dispatch&per_page=100&page=${page}`, { optional: true });
      if (data === null) return found;
      if (!Array.isArray(data.workflow_runs)) throw new PublishingError('UPSTREAM_RESPONSE_INVALID', 'GitHub returned an unexpected workflow response.', 502);
      for (const run of data.workflow_runs) {
        const identity = parsePublicationRunName(run.display_title);
        if (identity?.requestId === requestId) found.push({ ...run, publication: identity });
      }
      if (data.workflow_runs.length < 100 || found.length) return found;
    }
    return found;
  }

  async function verifyLive(payload) {
    const manifestText = await publicText(`/guide-publication-manifest.json?request=${payload.requestId}`);
    let manifest;
    try { manifest = JSON.parse(manifestText); } catch { throw new PublishingError('LIVE_VERIFICATION_PENDING', 'The live publication manifest is not available yet.', 409); }
    const entry = manifest.guides?.find((guide) => guide.slug === payload.slug && guide.requestId === payload.requestId && guide.contentHash === hashGuidePayload(payload));
    if (manifest.schemaVersion !== 1 || !/^[0-9a-f]{40}$/.test(manifest.commit || '') || !entry) throw new PublishingError('LIVE_VERIFICATION_PENDING', 'The live production manifest does not match this guide publication yet.', 409);
    try {
      const verified = await verifyPublicGuide(payload, { fetchImpl: request });
      const after = JSON.parse(await publicText(`/guide-publication-manifest.json?request=${payload.requestId}`));
      if (JSON.stringify(after) !== JSON.stringify(manifest)) throw new Error('Production changed during verification.');
      return { liveUrl: verified.liveUrl, commit: manifest.commit, verifiedAt: new Date().toISOString() };
    } catch {
      throw new PublishingError('LIVE_VERIFICATION_PENDING', 'The deployment has not passed every public article, index, sitemap and quote destination check yet.', 409);
    }
  }

  async function publicationStatus({ requestId }, knownRuns) {
    const normalizedId = requestId.toLowerCase();
    const runs = knownRuns || await findRuns(normalizedId);
    if (!runs.length) return { status: 'not_found', requestId: normalizedId, message: 'No matching workflow run is visible yet. After dispatch, retry this status call with the same requestId.' };
    const identities = new Set(runs.map((run) => `${run.publication.contentHash}:${run.publication.slug}`));
    if (identities.size !== 1) throw new PublishingError('REQUEST_ID_CONFLICT', 'This requestId is associated with different guide content. Do not reuse it.', 409);
    const run = runs.find((entry) => entry.conclusion === 'success') || runs.find(isActive) || runs[0];
    const base = { requestId: normalizedId, jobId: String(run.id), workflowUrl: run.html_url, slug: run.publication.slug, contentHash: run.publication.contentHash };
    if (isActive(run)) return { ...base, status: run.status === 'in_progress' ? 'running' : 'queued' };
    if (run.conclusion !== 'success') return { ...base, status: 'failed', conclusion: run.conclusion, message: 'The publishing job did not finish successfully. Inspect the workflow and retry the same request only after resolving the cause.' };
    const source = await sourceFile(`content/guides/${run.publication.slug}.md`, { optional: true });
    if (!source) return { ...base, status: 'verification_pending', message: 'The workflow completed, but its guide is not present on production main.' };
    // The slug is the fixed contents path, never a field supplied by source metadata.
    const frontmatter = /^---\n([\s\S]+?)\n---\n\n([\s\S]*)$/.exec(source);
    const metadata = {};
    try {
      if (!frontmatter) throw new Error();
      for (const line of frontmatter[1].split('\n')) {
        const pair = /^([A-Za-z]+): (.+)$/.exec(line);
        if (!pair || Object.hasOwn(metadata, pair[1])) throw new Error();
        metadata[pair[1]] = JSON.parse(pair[2]);
      }
      const payload = validateGuidePayload({ requestId: metadata.publicationRequestId, slug: run.publication.slug, title: metadata.title, description: metadata.description, date: metadata.date, category: metadata.category, related: metadata.related, markdown: frontmatter[2] });
      if (payload.requestId !== normalizedId || hashGuidePayload(payload) !== run.publication.contentHash || serializeGuide(payload) !== source) throw new PublishingError('SOURCE_MISMATCH', 'The guide source does not match this publication request.', 409);
      return { ...base, status: 'published', ...(await verifyLive(payload)) };
    } catch (error) {
      if (error instanceof PublishingError && ['LIVE_VERIFICATION_PENDING', 'UPSTREAM_UNAVAILABLE'].includes(error.code)) return { ...base, status: 'verification_pending', message: error.message };
      throw new PublishingError('SOURCE_MISMATCH', 'The guide source does not match this publication request.', 409);
    }
  }

  async function publishGuide(input) {
    const payload = validateGuidePayload(input);
    await requireReadiness();
    const [runs, existing] = await Promise.all([findRuns(payload.requestId), sourceFile(`content/guides/${payload.slug}.md`, { optional: true })]);
    const hash = hashGuidePayload(payload);
    if (runs.some((run) => run.publication.contentHash !== hash || run.publication.slug !== payload.slug)) throw new PublishingError('REQUEST_ID_CONFLICT', 'This requestId has already been used for different guide content.', 409);
    if (existing && existing !== serializeGuide(payload)) throw new PublishingError('SLUG_EXISTS', 'That guide slug already exists. This tool can only add a new guide and cannot replace existing content.', 409);
    if (runs.length) {
      if (runs.some((run) => run.conclusion === 'success' || isActive(run))) return publicationStatus({ requestId: payload.requestId }, runs);
      const candidate = runs[0];
      const runId = String(candidate.id);
      if (!/^[1-9][0-9]{0,19}$/.test(runId)) throw new PublishingError('UPSTREAM_RESPONSE_INVALID', 'GitHub returned an invalid workflow run identity.', 502);
      // Recheck the exact existing job immediately before its only permitted
      // mutation. Rerunning keeps GitHub's original inputs and workflow rather
      // than dispatching a new request or modifying existing guide content.
      const latest = await github(`/actions/runs/${runId}`);
      const identity = parsePublicationRunName(latest?.display_title);
      if (String(latest?.id) !== runId || latest.path !== `.github/workflows/${PUBLISH_WORKFLOW}` || latest.event !== 'workflow_dispatch' || latest.head_branch !== PRODUCTION_BRANCH || latest.repository?.full_name !== REPOSITORY || identity?.requestId !== payload.requestId || identity.contentHash !== hash || identity.slug !== payload.slug) throw new PublishingError('REQUEST_ID_CONFLICT', 'The existing workflow identity does not match this exact guide request. Nothing was retried.', 409);
      const refreshed = { ...latest, publication: identity };
      if (latest.conclusion === 'success' || isActive(latest)) return publicationStatus({ requestId: payload.requestId }, [refreshed, ...runs.slice(1)]);
      const attempts = attemptsFor(latest) + runs.slice(1).reduce((sum, run) => sum + attemptsFor(run), 0);
      if (attempts >= MAX_PUBLICATION_ATTEMPTS) throw new PublishingError('RETRY_LIMIT_REACHED', 'This guide request has reached three workflow attempts. Review its failure before requesting another retry.', 409);
      if (latest.status !== 'completed') throw new PublishingError('UPSTREAM_RESPONSE_INVALID', 'The existing workflow is not ready to retry. Check its status first.', 409);
      await github(`/actions/runs/${runId}/rerun`, { method: 'POST', body: { enable_debug_logging: false } });
      return { status: 'accepted', retried: true, requestId: payload.requestId, jobId: runId, workflowUrl: latest.html_url, slug: payload.slug, contentHash: hash, attempt: attemptsFor(latest) + 1, maxAttempts: MAX_PUBLICATION_ATTEMPTS, message: 'The same guide workflow was accepted for another attempt with its original content and inputs. Check get_publication_status. It is published only after live verification succeeds.' };
    }
    if (existing) return { status: 'verification_pending', requestId: payload.requestId, slug: payload.slug, contentHash: hash, message: 'Matching guide content already exists, but no matching workflow receipt is visible. No duplicate job was created.' };
    await github(`/actions/workflows/${PUBLISH_WORKFLOW}/dispatches`, { method: 'POST', body: { ref: PRODUCTION_BRANCH, inputs: { request_id: payload.requestId, content_hash: hash, slug: payload.slug, payload: canonicalPayload(payload) } } });
    return { status: 'accepted', requestId: payload.requestId, jobId: payload.requestId, slug: payload.slug, contentHash: hash, message: 'The publishing job was accepted. Check get_publication_status with this requestId. Publication is complete only after status is published.' };
  }

  async function listGuides() {
    let manifest;
    try { manifest = JSON.parse(await publicText('/content-manifest.json')); } catch { throw new PublishingError('CATALOG_UNAVAILABLE', 'The live guide catalog is not available yet.', 409); }
    if (!Array.isArray(manifest.guides)) throw new PublishingError('CATALOG_UNAVAILABLE', 'The live guide catalog is not available yet.', 409);
    return { guides: manifest.guides.filter((guide) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug) && typeof guide.title === 'string').map(({ slug, title, date }) => ({ slug, title, date, url: `${CANONICAL_ORIGIN}/guides/${slug}` })) };
  }

  return { publishGuide, publicationStatus, listGuides };
}
