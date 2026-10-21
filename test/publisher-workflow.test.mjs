import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { md } from '../scripts/content.mjs';
import { validateGuidePayload, serializeGuide, hashGuidePayload } from '../lib/guide-publishing/contract.mjs';
import { validateRunnerEnvironment, validateDispatchInput, inspectTrustedCheckout, inspectPublicationRequest, checkPreparedRelease, publishGuide } from '../scripts/publish-guide.mjs';
import { readPublicationManifest, verifyLaunchReadiness, verifyPublicGuide, waitForPublication, PUBLISH_TARGET } from '../scripts/verify-guide-publication.mjs';

const payload = () => validateGuidePayload({
  requestId: '82539596-f16b-4ade-9ba4-b109f465ca07', slug: 'fixture-office-guide', title: 'A useful office cleaning planning guide',
  description: 'A practical planning guide for an office cleaning scope, with room responsibilities and service frequency.',
  date: '2026-01-01', category: 'Office planning', related: ['existing-guide'],
  markdown: `## Agree on the work\n\n${'Write down the room list and agreed cleaning responsibilities. '.repeat(50)}\n\n## Review the schedule\n\n${'Review access and service frequency with the building manager. '.repeat(50)}\n\n[Get a free quote from Master Commercial Clean](/contact).\n`,
});
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = async (cwd, filename, value = 'fixture\n') => {
  const target = path.join(cwd, filename);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, value);
};
const commit = (cwd, message = 'Fixture commit') => { git(cwd, 'add', '--all'); git(cwd, 'commit', '--quiet', '-m', message); return git(cwd, 'rev-parse', 'HEAD'); };
async function repository(t) {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'mcc-publisher-workflow-'));
  t.after(() => fs.rm(cwd, { recursive: true, force: true }));
  git(cwd, 'init', '--quiet', '--initial-branch=main');
  git(cwd, 'config', 'user.name', 'Fixture owner'); git(cwd, 'config', 'user.email', 'fixture@example.test');
  git(cwd, 'config', 'commit.gpgsign', 'false'); git(cwd, 'config', 'core.hooksPath', path.join(cwd, 'disabled-hooks'));
  git(cwd, 'remote', 'add', 'origin', 'https://github.com/JxWayne890/MasterCleanHQ.git');
  await write(cwd, 'content/guides/existing-guide.md', '---\ntitle: Existing guide\n---\n\nExisting article.\n');
  await write(cwd, 'docs/GUIDE_PUBLISHING.md');
  const base = commit(cwd);
  git(cwd, 'update-ref', 'refs/remotes/origin/main', base);
  return { cwd, base };
}
const runner = () => ({
  GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'JxWayne890/MasterCleanHQ', GITHUB_REF: 'refs/heads/main',
  GITHUB_WORKFLOW_REF: 'JxWayne890/MasterCleanHQ/.github/workflows/mcc-guide-publish.yml@refs/heads/main',
  MCC_GUIDES_LAUNCH_APPROVED: 'true', MCC_GUIDE_COMMIT_NAME: 'Verified owner', MCC_GUIDE_COMMIT_EMAIL: 'owner@example.test',
});

test('the cloud worker fails closed on absent initial approval, wrong repository, branch or owner identity', () => {
  assert.doesNotThrow(() => validateRunnerEnvironment(runner()));
  for (const [key, value] of Object.entries({ GITHUB_ACTIONS: '', GITHUB_REPOSITORY: 'elsewhere/repository', GITHUB_REF: 'refs/heads/preview', GITHUB_WORKFLOW_REF: 'JxWayne890/MasterCleanHQ/.github/workflows/other.yml@refs/heads/main', MCC_GUIDES_LAUNCH_APPROVED: '', MCC_GUIDE_COMMIT_NAME: 'bot\nforged', MCC_GUIDE_COMMIT_EMAIL: '' })) {
    assert.throws(() => validateRunnerEnvironment({ ...runner(), [key]: value }));
  }
  const value = payload();
  const env = { MCC_GUIDE_REQUEST_ID: value.requestId, MCC_GUIDE_CONTENT_HASH: hashGuidePayload(value), MCC_GUIDE_SLUG: value.slug };
  assert.doesNotThrow(() => validateDispatchInput(value, env));
  for (const key of Object.keys(env)) assert.throws(() => validateDispatchInput(value, { ...env, [key]: 'different' }));
});

test('trusted checkout requires the fixed Git origin, clean tree and fresh main commit', async (t) => {
  const { cwd, base } = await repository(t);
  assert.equal(inspectTrustedCheckout(cwd), base);
  await write(cwd, 'unexpected.txt');
  assert.throws(() => inspectTrustedCheckout(cwd), /clean/);
  await fs.rm(path.join(cwd, 'unexpected.txt'));
  git(cwd, 'remote', 'set-url', 'origin', 'https://github.com/attacker/repo.git');
  assert.throws(() => inspectTrustedCheckout(cwd), /fixed MCC repository/);
});

test('an unapproved launch preserves a valid draft and failure receipt without network or Git writes', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mcc-publisher-draft-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const value = payload();
  const env = { ...runner(), MCC_GUIDES_LAUNCH_APPROVED: '', RUNNER_TEMP: directory, MCC_GUIDE_PAYLOAD: JSON.stringify(value), MCC_GUIDE_REQUEST_ID: value.requestId, MCC_GUIDE_CONTENT_HASH: hashGuidePayload(value), MCC_GUIDE_SLUG: value.slug };
  await assert.rejects(publishGuide({ cwd: directory, env, fetchImpl: async () => { assert.fail('An unapproved release must not make network requests.'); } }), /not approved/);
  const receipt = JSON.parse(await fs.readFile(path.join(directory, 'mcc-guide-publication/receipt.json'), 'utf8'));
  assert.equal(receipt.status, 'failed');
  assert.equal(receipt.requestId, value.requestId);
  assert.equal(await fs.readFile(path.join(directory, `mcc-guide-publication/${value.slug}.md`), 'utf8'), serializeGuide(value));
  await assert.rejects(fs.access(path.join(directory, 'content/guides')));
});

test('publication refuses overwrites, duplicate titles, reused request IDs, symlinks and deleted prior publications', async (t) => {
  const { cwd } = await repository(t);
  const value = payload();
  assert.equal((await inspectPublicationRequest({ cwd, payload: value })).reused, false);
  await write(cwd, `content/guides/${value.slug}.md`, '---\ntitle: Different content\n---\n');
  await assert.rejects(inspectPublicationRequest({ cwd, payload: value }), /already exists/);
  await write(cwd, `content/guides/${value.slug}.md`, serializeGuide(value));
  commit(cwd, `Publish fixture\n\nMCC-Guide-Request: ${value.requestId}\nMCC-Guide-Payload-SHA256: ${hashGuidePayload(value)}`);
  assert.equal((await inspectPublicationRequest({ cwd, payload: value })).reused, true);
  await assert.rejects(inspectPublicationRequest({ cwd, payload: { ...value, title: 'A changed guide title that must be refused' } }), /different content/);
  await assert.rejects(inspectPublicationRequest({ cwd, payload: { ...value, requestId: '4c56fcbe-987f-4cf7-a199-ed60bbeb0451', slug: 'other-topic' } }), /already uses this title/);
  await fs.rm(path.join(cwd, `content/guides/${value.slug}.md`));
  commit(cwd, 'Deliberately remove a former article');
  await assert.rejects(inspectPublicationRequest({ cwd, payload: value }), /no longer in production/);
  await fs.symlink('existing-guide.md', path.join(cwd, `content/guides/${value.slug}.md`));
  await assert.rejects(inspectPublicationRequest({ cwd, payload: value }), /ordinary files/);
});

test('the committed cloud scope permits exactly its one new non executable Markdown file', async (t) => {
  const { cwd, base } = await repository(t);
  await write(cwd, 'content/guides/fixture-office-guide.md', serializeGuide(payload()));
  commit(cwd);
  assert.doesNotThrow(() => checkPreparedRelease(cwd, base, 'content/guides/fixture-office-guide.md'));
  assert.throws(() => checkPreparedRelease(cwd, base, 'content/guides/some-other-guide.md'), /single ordinary Markdown/);
  await write(cwd, 'src/unrelated.js', 'export const unsafe = true;\n');
  commit(cwd);
  assert.throws(() => checkPreparedRelease(cwd, base, 'content/guides/fixture-office-guide.md'), /guard refused/);
});

function publicFixture(value = payload()) {
  const origin = PUBLISH_TARGET.origin;
  const route = `/guides/${value.slug}`;
  const schema = { '@type': 'Article', headline: value.title, description: value.description, mainEntityOfPage: `${origin}${route}`, datePublished: `${value.date}T09:00:00-05:00`, author: { name: 'Master Commercial Clean' } };
  const manifest = { schemaVersion: 1, commit: 'a'.repeat(40), guides: [{ slug: value.slug, requestId: value.requestId, contentHash: hashGuidePayload(value) }] };
  const pages = new Map([
    ['/guide-publication-manifest.json', JSON.stringify(manifest)],
    [route, `<link rel="canonical" href="${origin}${route}"><meta name="robots" content="index, follow"><h1>${value.title}</h1><article class="article-body">${md.render(value.markdown)}</article><script type="application/ld+json">${JSON.stringify(schema)}</script>`],
    ['/guides', `<meta name="robots" content="index, follow"><script>{"@type":"CollectionPage"}</script><div class="resource-grid"><a href="${route}">Guide</a></div>`],
    ['/sitemap.xml', `<urlset><url><loc>${origin}${route}</loc></url></urlset>`],
    ['/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`],
    ['/contact', '<form class="mcc-quote-form"><input name="full_name"><input name="phone"></form>'],
  ]);
  const fetchImpl = async (url) => new Response(pages.get(new URL(url).pathname) || 'missing', { status: pages.has(new URL(url).pathname) ? 200 : 404 });
  return { pages, fetchImpl, manifest };
}

test('live verification proves exact commit and request tuple, article body, SEO and discovery links', async () => {
  const value = payload();
  const { fetchImpl, manifest } = publicFixture(value);
  await verifyLaunchReadiness(manifest.commit, { fetchImpl });
  const receipt = await waitForPublication(value, manifest.commit, { fetchImpl, attempts: 1 });
  assert.equal(receipt.liveUrl, `${PUBLISH_TARGET.origin}/guides/${value.slug}`);
  assert.equal(receipt.commit, manifest.commit);
  assert.equal(receipt.checks.length, 8);
  assert.ok(receipt.verifiedAt);
});

test('a 200 homepage fallback, wrong article content, missing sitemap or hidden guide cannot verify', async () => {
  for (const [route, replacement] of [
    ['/guides/fixture-office-guide', '<html><h1>Homepage</h1></html>'],
    ['/sitemap.xml', '<urlset></urlset>'],
    ['/robots.txt', `Disallow: /guides/\nSitemap: ${PUBLISH_TARGET.origin}/sitemap.xml\n`],
    ['/contact', '<html>Missing contact form</html>'],
  ]) {
    const fixture = publicFixture(); fixture.pages.set(route, replacement);
    await assert.rejects(verifyPublicGuide(payload(), fixture));
  }
  const fixture = publicFixture();
  fixture.pages.set('/guide-publication-manifest.json', '<html>Homepage fallback</html>');
  await assert.rejects(readPublicationManifest(fixture), /not JSON/);
});

test('production commit and payload mismatches stay unverified and polling is bounded', async () => {
  const fixture = publicFixture();
  let sleeps = 0;
  await assert.rejects(waitForPublication(payload(), 'b'.repeat(40), { ...fixture, attempts: 2, sleep: async () => { sleeps += 1; } }), /expected Git commit/);
  assert.equal(sleeps, 1);
  fixture.manifest.guides[0].contentHash = 'c'.repeat(64);
  fixture.pages.set('/guide-publication-manifest.json', JSON.stringify(fixture.manifest));
  await assert.rejects(waitForPublication(payload(), fixture.manifest.commit, { ...fixture, attempts: 1 }), /exact guide content/);
  await assert.rejects(verifyLaunchReadiness('b'.repeat(40), fixture), /fresh production branch/);
});

test('workflow is dispatch only, pinned to official actions, serialized and never interpolates inputs into commands', async () => {
  const source = await fs.readFile(new URL('../.github/workflows/mcc-guide-publish.yml', import.meta.url), 'utf8');
  const workflow = parseYaml(source);
  assert.deepEqual(Object.keys(workflow.on), ['workflow_dispatch']);
  assert.equal(workflow.concurrency['cancel-in-progress'], false);
  assert.equal(workflow.permissions.contents, 'write');
  const steps = workflow.jobs.publish.steps;
  assert.equal(steps[0].with.repository, 'JxWayne890/MasterCleanHQ');
  assert.equal(steps[0].with.ref, 'main');
  for (const step of steps) {
    if (step.uses) assert.match(step.uses, /^actions\/(?:checkout|setup-node|upload-artifact)@[a-f0-9]{40}$/);
    if (step.run) assert.ok(!step.run.includes('${{'));
  }
  assert.ok(!source.includes('--force') && !source.includes('--prod'));
});
