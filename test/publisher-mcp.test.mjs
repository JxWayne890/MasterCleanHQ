import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { parse as parseYaml } from 'yaml';
import MarkdownIt from 'markdown-it';
import { createPublisherMcpHandler, publisherAuthorized } from '../api/mcp.js';
import { createGuidePublisher } from '../lib/guide-publishing/github.mjs';
import { CANONICAL_ORIGIN, PUBLISH_WORKFLOW, canonicalPayload, hashGuidePayload, publicationRunName, serializeGuide, validateGuidePayload } from '../lib/guide-publishing/contract.mjs';

const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
const requestId = 'a8ee1680-1258-4d80-b0d6-186df47f5df3';
const secret = 'a'.repeat(64);
const payload = () => validateGuidePayload({
  requestId,
  slug: 'tenant-turnover-cleaning-planning',
  title: 'Planning commercial tenant turnover cleaning',
  description: 'Practical planning guidance for commercial tenant turnover cleaning, with scope questions for San Angelo building managers.',
  date: '2026-10-21',
  category: 'Property management',
  related: ['commercial-cleaning-cost-san-angelo'],
  markdown: `A building manager should agree on the cleaning scope before scheduling access to the property. ${'Discuss responsibility for each room and inspect surfaces with the cleaning company before work begins. '.repeat(30)}\n\n## Plan access and responsibilities\n\n${'Confirm that the building is ready for cleaning and document questions about finishes and tenant access. '.repeat(20)}\n\n## Inspect the completed work\n\n${'Use the agreed scope during the walkthrough and ask the cleaning company to explain any unfinished items. '.repeat(12)}\n\n[Get a free quote from Master Commercial Clean](/contact).`,
});
const env = { MCC_GUIDE_PUBLISHER_TOKEN: secret, MCC_PUBLISHER_GITHUB_TOKEN: 'private-github-credential', MCC_GUIDES_PUBLISHING_ENABLED: 'true' };
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
const text = (value, status = 200) => new Response(value, { status });

function fixture({ runs = [], refreshedRun, source, liveValid = true, setupReady = true, manifestHash, liveCommit = 'b'.repeat(40) } = {}) {
  const calls = [];
  const guide = payload();
  const liveUrl = `${CANONICAL_ORIGIN}/guides/${guide.slug}`;
  return {
    calls,
    fetchImpl: async (url, options) => {
      calls.push({ url, ...options });
      const parsed = new URL(url);
      if (parsed.origin === 'https://api.github.com') {
        assert.equal(options.headers.Authorization, 'Bearer private-github-credential');
        assert.ok(parsed.pathname.startsWith('/repos/JxWayne890/MasterCleanHQ/'));
        if (parsed.pathname.endsWith('/git/ref/heads/main')) return json({ object: { sha: 'b'.repeat(40) } });
        if (/\/actions\/runs\/[0-9]+\/rerun$/.test(parsed.pathname)) return new Response(null, { status: 201 });
        if (/\/actions\/runs\/[0-9]+$/.test(parsed.pathname)) return json(refreshedRun || runs.find((run) => String(run.id) === parsed.pathname.split('/').at(-1)));
        if (parsed.pathname.endsWith('/dispatches')) return new Response(null, { status: 204 });
        if (parsed.pathname.includes('/actions/workflows/')) return json({ workflow_runs: runs });
        if (parsed.pathname.includes('/contents/content/guides/')) return source === undefined ? json({}, 404) : json({ type: 'file', encoding: 'base64', content: Buffer.from(source).toString('base64'), size: Buffer.byteLength(source) });
        if (parsed.pathname.includes('/contents/')) return setupReady ? json({ type: 'file', encoding: 'base64', content: Buffer.from('trusted setup').toString('base64'), size: 13 }) : json({}, 404);
      }
      assert.equal(parsed.origin, CANONICAL_ORIGIN);
      if (parsed.pathname === '/guides') return text('Commercial cleaning guides <a href="/guides/' + guide.slug + '">Guide</a>');
      if (parsed.pathname === '/guide-publication-manifest.json') return json({ schemaVersion: 1, commit: liveCommit, guides: [{ slug: guide.slug, requestId: guide.requestId, contentHash: manifestHash || hashGuidePayload(guide) }] });
      if (parsed.pathname === `/guides/${guide.slug}`) return text(liveValid ? `<meta name="robots" content="index, follow"><link rel="canonical" href="${liveUrl}"><meta name="description" content="${guide.description}"><h1>${guide.title}</h1><script type="application/ld+json">${JSON.stringify({ '@type': 'Article', headline: guide.title, description: guide.description, datePublished: `${guide.date}T09:00:00-05:00`, author: { name: 'Master Commercial Clean' }, mainEntityOfPage: liveUrl })}</script><article class="article-body">${md.render(guide.markdown)}</article>` : '<h1>Homepage fallback</h1>');
      if (parsed.pathname === '/sitemap.xml') return text(`<urlset><url><loc>${liveUrl}</loc></url></urlset>`);
      if (parsed.pathname === '/robots.txt') return text(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`);
      if (parsed.pathname === '/contact') return text('<form class="mcc-quote-form" action="/api/quote"><input name="full_name"><input name="phone"></form>');
      if (parsed.pathname === '/content-manifest.json') return json({ guides: [{ slug: guide.slug, title: guide.title, date: guide.date, secret: 'must-not-return' }] });
      throw new Error(`Unexpected mocked route ${parsed.pathname}`);
    },
  };
}
const runFor = (guide, overrides = {}) => ({ id: 42, run_attempt: 1, path: `.github/workflows/${PUBLISH_WORKFLOW}`, event: 'workflow_dispatch', head_branch: 'main', repository: { full_name: 'JxWayne890/MasterCleanHQ' }, display_title: publicationRunName(guide), status: 'completed', conclusion: 'success', html_url: 'https://github.com/JxWayne890/MasterCleanHQ/actions/runs/42', ...overrides });

test('guide contract confines paths and quotes every frontmatter string without executable content', () => {
  const guide = payload();
  const source = serializeGuide({ ...guide, title: 'A title: "quoted" with # punctuation' });
  const metadata = parseYaml(source.match(/^---\n([\s\S]*?)\n---/)[1]);
  assert.equal(metadata.title, 'A title: "quoted" with # punctuation');
  assert.equal(metadata.publicationRequestId, requestId);
  assert.match(metadata.publicationContentHash, /^[a-f0-9]{64}$/);
  assert.throws(() => validateGuidePayload({ ...guide, slug: '../../api/run' }), /slug/);
  assert.throws(() => validateGuidePayload({ ...guide, repository: 'somewhere/else' }), /Unrecognized key/);
  assert.throws(() => validateGuidePayload({ ...guide, title: 'Title\n---\nrepository: other' }), /one trimmed line/);
  assert.throws(() => validateGuidePayload({ ...guide, markdown: guide.markdown + '\n<script>bad()</script>' }), /without frontmatter, HTML or images/);
  assert.throws(() => validateGuidePayload({ ...guide, date: '2026-02-30' }), /real calendar date/);
  assert.throws(() => validateGuidePayload({ ...guide, date: '0000-01-01' }), /real calendar date/);
  assert.throws(() => validateGuidePayload({ ...guide, markdown: guide.markdown + '\n![External image][ref]' }), /without frontmatter, HTML or images/);
  assert.throws(() => validateGuidePayload({ ...guide, date: '2099-01-01' }), /future/);
  assert.throws(() => validateGuidePayload({ ...guide, related: [guide.slug] }), /cannot include/);
});

test('canonical hashes ignore retry identity but retain content and normalize body boundaries', () => {
  const guide = payload();
  const retry = validateGuidePayload({ ...guide, requestId: '4429aca8-2554-49d5-a6cb-cda108fb2841', markdown: `\n${guide.markdown}\n` });
  assert.equal(hashGuidePayload(retry), hashGuidePayload(guide));
  assert.equal(hashGuidePayload(validateGuidePayload({ ...guide, markdown: guide.markdown.replace(/\n/g, '\r\n') })), hashGuidePayload(guide));
  assert.notEqual(hashGuidePayload({ ...guide, title: guide.title + ' today' }), hashGuidePayload(guide));
  assert.equal(JSON.parse(canonicalPayload(guide)).requestId, requestId);
});

test('dedicated publisher bearer authentication refuses missing, wrong and undersized credentials', () => {
  assert.equal(publisherAuthorized(`Bearer ${secret}`, secret), true);
  for (const header of [undefined, '', `Basic ${secret}`, `Bearer ${'b'.repeat(64)}`, `Bearer ${secret} extra`]) assert.equal(publisherAuthorized(header, secret), false);
  assert.equal(publisherAuthorized('Bearer short', 'short'), false);
});

test('disabled or incomplete initial launch never dispatches a publication', async () => {
  for (const variant of [{ env: { ...env, MCC_GUIDES_PUBLISHING_ENABLED: 'false' }, setupReady: true }, { env, setupReady: false }]) {
    const mock = fixture(variant);
    const publisher = createGuidePublisher({ env: variant.env, fetchImpl: mock.fetchImpl });
    await assert.rejects(publisher.publishGuide(payload()), (error) => error.code === 'INITIAL_LAUNCH_REQUIRED');
    assert.equal(mock.calls.some((call) => call.method === 'POST'), false);
  }
});

test('new guide dispatch targets only trusted repository main workflow and reports accepted', async () => {
  const mock = fixture();
  const result = await createGuidePublisher({ env, fetchImpl: mock.fetchImpl }).publishGuide(payload());
  assert.equal(result.status, 'accepted');
  assert.equal(result.requestId, requestId);
  const mutations = mock.calls.filter((call) => call.method === 'POST');
  assert.equal(mutations.length, 1);
  assert.equal(mutations[0].url, `https://api.github.com/repos/JxWayne890/MasterCleanHQ/actions/workflows/${PUBLISH_WORKFLOW}/dispatches`);
  const dispatch = JSON.parse(mutations[0].body);
  assert.equal(dispatch.ref, 'main');
  assert.equal(dispatch.inputs.request_id, requestId);
  assert.equal(dispatch.inputs.content_hash, hashGuidePayload(payload()));
  assert.deepEqual(JSON.parse(dispatch.inputs.payload), payload());
  assert.equal('liveUrl' in result, false);
});

test('same request retries return its running job without dispatch and conflicts cannot change a guide', async () => {
  const guide = payload();
  const mock = fixture({ runs: [runFor(guide, { status: 'in_progress', conclusion: null })] });
  const publisher = createGuidePublisher({ env, fetchImpl: mock.fetchImpl });
  assert.equal((await publisher.publishGuide(guide)).status, 'running');
  await assert.rejects(publisher.publishGuide({ ...guide, title: guide.title + ' changed' }), (error) => error.code === 'REQUEST_ID_CONFLICT');
  assert.equal(mock.calls.some((call) => call.method === 'POST'), false);
  const existing = fixture({ source: 'already an unrelated guide' });
  await assert.rejects(createGuidePublisher({ env, fetchImpl: existing.fetchImpl }).publishGuide(guide), (error) => error.code === 'SLUG_EXISTS');
  assert.equal(existing.calls.some((call) => call.method === 'POST'), false);
});

test('an identical failed request reruns only its original trusted job, including recovery after its guide commit', async () => {
  const guide = payload();
  for (const source of [undefined, serializeGuide(guide)]) {
    const mock = fixture({ runs: [runFor(guide, { conclusion: 'failure' })], source });
    const result = await createGuidePublisher({ env, fetchImpl: mock.fetchImpl }).publishGuide(guide);
    assert.equal(result.status, 'accepted');
    assert.equal(result.retried, true);
    assert.equal(result.jobId, '42');
    assert.equal(result.attempt, 2);
    assert.equal(result.maxAttempts, 3);
    assert.equal('liveUrl' in result, false);
    const mutations = mock.calls.filter((call) => call.method === 'POST');
    assert.equal(mutations.length, 1);
    assert.equal(mutations[0].url, 'https://api.github.com/repos/JxWayne890/MasterCleanHQ/actions/runs/42/rerun');
    assert.deepEqual(JSON.parse(mutations[0].body), { enable_debug_logging: false });
  }
});

test('retry refresh observes an active or successful original job instead of rerunning it', async () => {
  const guide = payload();
  for (const refreshedRun of [runFor(guide, { status: 'in_progress', conclusion: null }), runFor(guide)]) {
    const mock = fixture({ runs: [runFor(guide, { conclusion: 'failure' })], refreshedRun, source: serializeGuide(guide) });
    const result = await createGuidePublisher({ env, fetchImpl: mock.fetchImpl }).publishGuide(guide);
    assert.equal(result.status, refreshedRun.conclusion === 'success' ? 'published' : 'running');
    assert.equal(mock.calls.some((call) => call.method === 'POST'), false);
  }
  const mixed = fixture({ runs: [runFor(guide, { id: 43, conclusion: 'failure' }), runFor(guide, { status: 'queued', conclusion: null })] });
  assert.equal((await createGuidePublisher({ env, fetchImpl: mixed.fetchImpl }).publishGuide(guide)).status, 'queued');
  assert.equal(mixed.calls.some((call) => call.method === 'POST'), false);
});

test('failed retries reject changed identities, wrong workflows, changed source and exhausted attempts', async () => {
  const guide = payload();
  const failed = runFor(guide, { conclusion: 'failure' });
  for (const refreshedRun of [
    runFor({ ...guide, title: `${guide.title} changed` }, { conclusion: 'failure' }),
    runFor(guide, { conclusion: 'failure', path: '.github/workflows/unrelated.yml' }),
    runFor(guide, { conclusion: 'failure', head_branch: 'different' }),
    runFor(guide, { conclusion: 'failure', repository: { full_name: 'other/repository' } }),
  ]) {
    const mock = fixture({ runs: [failed], refreshedRun });
    await assert.rejects(createGuidePublisher({ env, fetchImpl: mock.fetchImpl }).publishGuide(guide), (error) => error.code === 'REQUEST_ID_CONFLICT');
    assert.equal(mock.calls.some((call) => call.method === 'POST'), false);
  }
  const changed = fixture({ runs: [failed], source: serializeGuide({ ...guide, title: guide.title + ' changed' }) });
  await assert.rejects(createGuidePublisher({ env, fetchImpl: changed.fetchImpl }).publishGuide(guide), (error) => error.code === 'SLUG_EXISTS');
  assert.equal(changed.calls.some((call) => call.method === 'POST'), false);
  for (const runs of [[runFor(guide, { conclusion: 'failure', run_attempt: 3 })], [failed, runFor(guide, { id: 43, conclusion: 'failure', run_attempt: 2 })]]) {
    const mock = fixture({ runs });
    await assert.rejects(createGuidePublisher({ env, fetchImpl: mock.fetchImpl }).publishGuide(guide), (error) => error.code === 'RETRY_LIMIT_REACHED');
    assert.equal(mock.calls.some((call) => call.method === 'POST'), false);
  }
});

test('published status requires successful workflow exact committed source and actual live site receipt', async () => {
  const guide = payload();
  const mock = fixture({ runs: [runFor(guide)], source: serializeGuide(guide) });
  const result = await createGuidePublisher({ env, fetchImpl: mock.fetchImpl }).publicationStatus({ requestId });
  assert.equal(result.status, 'published');
  assert.equal(result.commit, 'b'.repeat(40));
  assert.equal(result.liveUrl, `${CANONICAL_ORIGIN}/guides/${guide.slug}`);
  assert.ok(result.verifiedAt);
  for (const options of [{ liveValid: false }, { manifestHash: 'c'.repeat(64) }, { liveCommit: '' }]) {
    const invalid = fixture({ runs: [runFor(guide)], source: serializeGuide(guide), ...options });
    assert.equal((await createGuidePublisher({ env, fetchImpl: invalid.fetchImpl }).publicationStatus({ requestId })).status, 'verification_pending');
  }
});

test('workflow failure is never called published and source substitutions are rejected', async () => {
  const guide = payload();
  const failed = fixture({ runs: [runFor(guide, { conclusion: 'failure' })], source: serializeGuide(guide) });
  assert.equal((await createGuidePublisher({ env, fetchImpl: failed.fetchImpl }).publicationStatus({ requestId })).status, 'failed');
  assert.equal(failed.calls.some((call) => call.url.startsWith(CANONICAL_ORIGIN)), false);
  const swapped = fixture({ runs: [runFor(guide)], source: serializeGuide({ ...guide, title: guide.title + ' replaced' }) });
  await assert.rejects(createGuidePublisher({ env, fetchImpl: swapped.fetchImpl }).publicationStatus({ requestId }), (error) => error.code === 'SOURCE_MISMATCH');
});

test('guide catalog returns only public metadata and uses no GitHub credential', async () => {
  const mock = fixture();
  const result = await createGuidePublisher({ env: {}, fetchImpl: mock.fetchImpl }).listGuides();
  assert.equal(result.guides.length, 1);
  assert.deepEqual(Object.keys(result.guides[0]), ['slug', 'title', 'date', 'url']);
  assert.equal(mock.calls.some((call) => call.headers.Authorization), false);
});

for (const preParsed of [false, true]) {
  test(`official SDK stateless HTTP handles ${preParsed ? 'Vercel pre parsed JSON bodies' : 'raw Node request streams'} with authentication and narrow tools`, async (t) => {
    const mock = fixture();
    const handler = createPublisherMcpHandler({ env, fetchImpl: mock.fetchImpl });
    let parsedRequests = 0;
    const server = createServer(async (req, res) => {
      if (preParsed) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        req.body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        parsedRequests += 1;
      }
      return handler(req, res);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    t.after(async () => { await handler.close(); await new Promise((resolve) => server.close(resolve)); });
    const url = `http://127.0.0.1:${server.address().port}/api/mcp`;
    const call = async (body, authorization = `Bearer ${secret}`, extraHeaders = {}) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...(authorization ? { Authorization: authorization } : {}), ...extraHeaders }, body: JSON.stringify(body) });
    const unauthenticated = await call({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, null);
    assert.equal(unauthenticated.status, 401);
    assert.equal(unauthenticated.headers.get('cache-control'), 'no-store');
    assert.equal((await call({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, undefined, { Origin: 'https://untrusted.example' })).status, 403);
    const parseMcp = async (response) => {
      assert.equal(response.status, 200);
      const raw = await response.text();
      if (response.headers.get('content-type').includes('application/json')) return JSON.parse(raw);
      const message = raw.split('\n').filter((line) => line.startsWith('data: ')).at(-1);
      assert.ok(message, raw);
      return JSON.parse(message.slice(6));
    };
    const initialized = await parseMcp(await call({ jsonrpc: '2.0', id: 3, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test-groku', version: '1.0.0' } } }));
    assert.equal(initialized.result.serverInfo.name, 'mcc-guide-publisher');
    const tools = await parseMcp(await call({ jsonrpc: '2.0', id: 4, method: 'tools/list' }));
    assert.deepEqual(tools.result.tools.map((tool) => tool.name), ['publish_guide', 'get_publication_status', 'list_guides']);
    const catalog = await parseMcp(await call({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'list_guides', arguments: {} } }));
    assert.equal(catalog.result.structuredContent.guides[0].slug, payload().slug);
    const accepted = await parseMcp(await call({ jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name: 'publish_guide', arguments: payload() } }));
    assert.equal(accepted.result.structuredContent.status, 'accepted');
    const invalid = await parseMcp(await call({ jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'publish_guide', arguments: { ...payload(), slug: '../forbidden' } } }));
    assert.equal(invalid.result.isError, true);
    const unknown = await parseMcp(await call({ jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'run_command', arguments: { command: 'whoami' } } }));
    assert.ok(unknown.error || unknown.result.isError);
    assert.equal(mock.calls.filter((entry) => entry.method === 'POST').length, 1);
    assert.equal(parsedRequests, preParsed ? 8 : 0);
  });
}
