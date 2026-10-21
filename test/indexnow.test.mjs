import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { INDEXNOW, changedGuideUrls, submitGuideIndexNow } from '../lib/guide-publishing/indexnow.mjs';
import { CANONICAL_ORIGIN, hashGuidePayload, serializeGuide, validateGuidePayload } from '../lib/guide-publishing/contract.mjs';
import { md } from '../scripts/content.mjs';
import { publishGuide } from '../scripts/publish-guide.mjs';

const liveUrl = `${CANONICAL_ORIGIN}/guides/office-cleaning-scope`;

test('IndexNow submits only the verified guide and changed guide catalog after an exact ownership check', async () => {
  const calls = [];
  const result = await submitGuideIndexNow(liveUrl, { fetchImpl: async (url, options) => {
    calls.push({ url, options });
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(url === INDEXNOW.keyLocation ? `${INDEXNOW.key}\n` : '', { status: 200 });
  } });
  assert.equal(result.status, 'accepted');
  assert.equal(result.httpStatus, 200);
  assert.equal(result.keyVerified, true);
  assert.equal(result.keyCheckAttempts, 1);
  assert.equal(result.submissionAttempts, 1);
  assert.ok(result.submittedAt);
  assert.deepEqual(calls.map(({ url }) => url), [INDEXNOW.keyLocation, INDEXNOW.endpoint]);
  assert.equal(calls[1].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    host: INDEXNOW.host, key: INDEXNOW.key, keyLocation: INDEXNOW.keyLocation,
    urlList: [liveUrl, `${CANONICAL_ORIGIN}/guides`],
  });
});

test('HTTP 202 records pending IndexNow validation without claiming indexing or retrying', async () => {
  let calls = 0;
  const result = await submitGuideIndexNow(liveUrl, { fetchImpl: async (url) => {
    calls += 1;
    return new Response(url === INDEXNOW.keyLocation ? INDEXNOW.key : '', { status: url === INDEXNOW.keyLocation ? 200 : 202 });
  } });
  assert.equal(result.status, 'validation_pending');
  assert.equal(result.httpStatus, 202);
  assert.equal(calls, 2);
});

test('a 200 HTML fallback, incorrect key or excessive ownership body never reaches IndexNow', async () => {
  for (const body of ['<html>Homepage</html>', 'another-key', `${INDEXNOW.key}${' '.repeat(256)}`]) {
    let calls = 0;
    const result = await submitGuideIndexNow(liveUrl, { fetchImpl: async (url) => {
      assert.equal(url, INDEXNOW.keyLocation);
      calls += 1;
      return new Response(body);
    } });
    assert.equal(result.status, 'retry_required');
    assert.equal(result.reason, 'ownership_key_mismatch');
    assert.equal(result.submissionAttempts, 0);
    assert.equal(calls, 1);
  }
});

test('arbitrary hosts, paths, credentials, encodings, queries and fragments make no requests', async () => {
  for (const invalid of [
    undefined, null, {}, '', '/guides/office-cleaning-scope',
    'http://www.mastercleanhq.com/guides/office-cleaning-scope',
    'https://mastercleanhq.com/guides/office-cleaning-scope',
    'https://attacker.example/guides/office-cleaning-scope',
    'https://www.mastercleanhq.com.attacker.example/guides/office-cleaning-scope',
    'https://user:password@www.mastercleanhq.com/guides/office-cleaning-scope',
    'https://www.mastercleanhq.com:443/guides/office-cleaning-scope',
    `${CANONICAL_ORIGIN}/contact`, `${CANONICAL_ORIGIN}/guides`, `${liveUrl}/`,
    `${CANONICAL_ORIGIN}/guides/a`, `${CANONICAL_ORIGIN}/guides/${'a'.repeat(101)}`,
    `${CANONICAL_ORIGIN}/guides/Office`, `${CANONICAL_ORIGIN}/guides/%6fffice`,
    `${CANONICAL_ORIGIN}/guides/a/../office-cleaning-scope`,
    `${liveUrl}?x=1`, `${liveUrl}?`, `${liveUrl}#section`, `${liveUrl}#`, ` ${liveUrl}`,
  ]) {
    assert.throws(() => changedGuideUrls(invalid));
    const result = await submitGuideIndexNow(invalid, { fetchImpl: async () => assert.fail('Invalid URLs must not be fetched.') });
    assert.equal(result.status, 'retry_required');
    assert.equal(result.reason, 'invalid_guide_url');
    assert.equal(result.keyCheckAttempts, 0);
    assert.equal(result.submissionAttempts, 0);
  }
});

test('transient key and submission failures retry once each and retain the final outcome', async () => {
  const calls = [];
  const sleeps = [];
  const responses = [new Response('', { status: 503 }), new Response(INDEXNOW.key), new Response('', { status: 429 }), new Response('', { status: 200 })];
  const result = await submitGuideIndexNow(liveUrl, {
    fetchImpl: async (url) => { calls.push(url); return responses.shift(); },
    sleep: async (ms) => sleeps.push(ms),
  });
  assert.equal(result.status, 'accepted');
  assert.equal(result.keyCheckAttempts, 2);
  assert.equal(result.submissionAttempts, 2);
  assert.deepEqual(calls, [INDEXNOW.keyLocation, INDEXNOW.keyLocation, INDEXNOW.endpoint, INDEXNOW.endpoint]);
  assert.deepEqual(sleeps, [250, 250]);
});

test('timeouts and an unavailable submission endpoint stop after two attempts with a retry receipt', async () => {
  for (const failure of ['timeout', 'service_unavailable']) {
    let submissions = 0;
    const sleeps = [];
    const result = await submitGuideIndexNow(liveUrl, {
      fetchImpl: async (url) => {
        if (url === INDEXNOW.keyLocation) return new Response(INDEXNOW.key);
        submissions += 1;
        if (failure === 'timeout') throw new DOMException('Timed out', 'TimeoutError');
        return new Response('', { status: 503 });
      },
      sleep: async (ms) => sleeps.push(ms),
    });
    assert.equal(result.status, 'retry_required');
    assert.equal(result.reason, failure === 'timeout' ? 'submission_unavailable' : 'submission_http_error');
    assert.equal(result.keyVerified, true);
    assert.equal(submissions, 2);
    assert.equal(result.submissionAttempts, 2);
    assert.deepEqual(sleeps, [250]);
  }
});

test('permanent ownership and submission errors are never retried', async () => {
  for (const status of [400, 403, 422]) {
    for (const keyFailure of [true, false]) {
      let calls = 0;
      const result = await submitGuideIndexNow(liveUrl, { fetchImpl: async (url) => {
        calls += 1;
        return url === INDEXNOW.keyLocation && !keyFailure ? new Response(INDEXNOW.key) : new Response('', { status });
      }, sleep: async () => assert.fail('Permanent errors must not be retried.') });
      assert.equal(result.status, 'retry_required');
      assert.equal(result.httpStatus, status);
      assert.equal(calls, keyFailure ? 1 : 2);
    }
  }
});

test('the real publication worker retains a verified published receipt during an IndexNow outage', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mcc-indexnow-publication-'));
  const cwd = path.join(directory, 'repo');
  const bin = path.join(directory, 'bin');
  await fs.mkdir(path.join(cwd, 'content/guides'), { recursive: true });
  await fs.mkdir(path.join(cwd, 'docs'));
  await fs.mkdir(bin);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  // Block the worker's fetch in this isolated fixture. Every other Git operation
  // remains real, including fixed origin, clean source and original commit checks.
  await fs.writeFile(path.join(bin, 'git'), '#!/bin/sh\nif [ "$1" = "--no-optional-locks" ] && [ "$2" = "fetch" ]; then exit 0; fi\nexec /usr/bin/git "$@"\n', { mode: 0o700 });
  const git = (...args) => execFileSync('/usr/bin/git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '--quiet', '--initial-branch=main');
  git('config', 'user.name', 'Fixture owner');
  git('config', 'user.email', 'fixture@example.test');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'core.hooksPath', path.join(directory, 'disabled-hooks'));
  git('remote', 'add', 'origin', 'https://github.com/JxWayne890/MasterCleanHQ.git');
  const payload = validateGuidePayload({
    requestId: '82539596-f16b-4ade-9ba4-b109f465ca07', slug: 'office-cleaning-scope',
    title: 'A practical office cleaning scope planning guide',
    description: 'Agree on office cleaning responsibilities and service frequency before comparing written proposals.',
    date: '2026-01-01', category: 'Office planning', related: ['existing-guide'],
    markdown: `## Agree on the work\n\n${'Write down the room list and agreed cleaning responsibilities. '.repeat(50)}\n\n## Review the schedule\n\n${'Review access and service frequency with the building manager. '.repeat(50)}\n\n[Get a free quote from Master Commercial Clean](/contact).\n`,
  });
  await fs.writeFile(path.join(cwd, `content/guides/${payload.slug}.md`), serializeGuide(payload));
  await fs.writeFile(path.join(cwd, 'content/guides/existing-guide.md'), '---\ntitle: Existing guide\n---\n\nExisting article.\n');
  await fs.writeFile(path.join(cwd, 'docs/GUIDE_PUBLISHING.md'), 'Fixture instructions.\n');
  git('add', '--all');
  git('commit', '--quiet', '-m', 'Existing verified guide fixture');
  const commit = git('rev-parse', 'HEAD');
  git('update-ref', 'refs/remotes/origin/main', commit);
  const route = `/guides/${payload.slug}`;
  const schema = { '@type': 'Article', headline: payload.title, description: payload.description, mainEntityOfPage: liveUrl, datePublished: `${payload.date}T09:00:00-05:00`, author: { name: 'Master Commercial Clean' } };
  const pages = new Map([
    ['/guide-publication-manifest.json', JSON.stringify({ schemaVersion: 1, commit, guides: [{ slug: payload.slug, requestId: payload.requestId, contentHash: hashGuidePayload(payload) }] })],
    [route, `<link rel="canonical" href="${liveUrl}"><meta name="robots" content="index, follow"><h1>${payload.title}</h1><article class="article-body">${md.render(payload.markdown)}</article><script type="application/ld+json">${JSON.stringify(schema)}</script>`],
    ['/guides', `<meta name="robots" content="index, follow"><script>{"@type":"CollectionPage"}</script><div class="resource-grid"><a href="${route}">Guide</a></div>`],
    ['/sitemap.xml', `<urlset><url><loc>${liveUrl}</loc></url></urlset>`],
    ['/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`],
    ['/contact', '<form class="mcc-quote-form"><input name="full_name"><input name="phone"></form>'],
    [new URL(INDEXNOW.keyLocation).pathname, INDEXNOW.key],
  ]);
  const oldPath = process.env.PATH;
  process.env.PATH = `${bin}${path.delimiter}${oldPath}`;
  t.after(() => { process.env.PATH = oldPath; });
  let submissions = 0;
  const receipt = await publishGuide({ cwd, env: {
    GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'JxWayne890/MasterCleanHQ', GITHUB_REF: 'refs/heads/main',
    GITHUB_WORKFLOW_REF: 'JxWayne890/MasterCleanHQ/.github/workflows/mcc-guide-publish.yml@refs/heads/main',
    MCC_GUIDES_LAUNCH_APPROVED: 'true', MCC_GUIDE_COMMIT_NAME: 'Fixture owner', MCC_GUIDE_COMMIT_EMAIL: 'fixture@example.test',
    RUNNER_TEMP: directory, MCC_GUIDE_PAYLOAD: JSON.stringify(payload), MCC_GUIDE_REQUEST_ID: payload.requestId,
    MCC_GUIDE_CONTENT_HASH: hashGuidePayload(payload), MCC_GUIDE_SLUG: payload.slug,
  }, fetchImpl: async (url, options) => {
    if (String(url) === INDEXNOW.endpoint) {
      submissions += 1;
      assert.equal(options.method, 'POST');
      return new Response('', { status: 503 });
    }
    const body = pages.get(new URL(url).pathname);
    assert.notEqual(body, undefined, 'Only known fixture pages may be requested.');
    return new Response(body);
  }, runValidation: async () => assert.fail('An identical published request must not create another release.') });
  assert.equal(submissions, 2);
  assert.equal(receipt.status, 'published');
  assert.equal(receipt.liveUrl, liveUrl);
  assert.equal(receipt.commit, commit);
  assert.equal(receipt.indexNow.status, 'retry_required');
  assert.equal(receipt.indexNow.httpStatus, 503);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(directory, 'mcc-guide-publication/receipt.json'), 'utf8')), receipt);
  assert.equal(git('rev-parse', 'HEAD'), commit);
});
