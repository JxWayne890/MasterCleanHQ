import assert from 'node:assert/strict';
import test from 'node:test';
import { createGuidePublicationManifest, resolveBuildCommit } from '../scripts/guide-publication-manifest.mjs';

const requestId = 'b49d49de-a213-42ef-9f66-949ac22bbb30';
const contentHash = 'a'.repeat(64);
const commit = 'b'.repeat(40);
const guide = { slug: 'office-walkthrough', publicationRequestId: requestId, publicationContentHash: contentHash };

test('the public receipt contains only the build commit and publication identity', () => {
  assert.deepEqual(createGuidePublicationManifest([{ ...guide, title: 'Public title', privateNote: 'not for the manifest' }], { commit }), {
    schemaVersion: 1,
    commit,
    guides: [{ slug: guide.slug, requestId, contentHash }],
  });
});

test('existing manually authored guides need no synthetic publication identity', () => {
  assert.deepEqual(createGuidePublicationManifest([{ slug: 'existing-guide' }], { commit }).guides, []);
});

test('missing source provenance stays explicitly unverified', () => {
  assert.equal(createGuidePublicationManifest([guide]).commit, null);
});

test('invalid metadata cannot manufacture a publication receipt', () => {
  for (const invalid of [
    { ...guide, publicationContentHash: 'wrong' },
    { ...guide, publicationRequestId: 'wrong' },
    { ...guide, publicationContentHash: undefined },
    { ...guide, slug: '../wrong' },
  ]) assert.throws(() => createGuidePublicationManifest([invalid], { commit }), /invalid publication metadata/);
  assert.throws(() => createGuidePublicationManifest([guide], { commit: 'wrong' }), /commit is invalid/);
});

test('one request cannot be reused for different guides', () => {
  assert.throws(() => createGuidePublicationManifest([guide, { ...guide, slug: 'other-guide' }], { commit }), /multiple guides/);
});

test('build provenance uses the validated Vercel Git commit when supplied', () => {
  assert.equal(resolveBuildCommit({ env: { VERCEL_GIT_COMMIT_SHA: commit.toUpperCase() } }), commit);
  assert.throws(() => resolveBuildCommit({ env: { VERCEL_GIT_COMMIT_SHA: 'not-a-commit' } }), /configured build commit is invalid/);
});
