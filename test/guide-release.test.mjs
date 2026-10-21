import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { inspectGuideRelease, validateGuideChanges } from '../scripts/check-guide-release.mjs';

const added = (overrides = {}) => ({ status: 'A', path: 'content/guides/new-cleaning-guide.md', mode: '100644', ...overrides });
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = async (cwd, name, content = 'Fixture content.\n') => {
  const file = path.join(cwd, name);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
};
const commit = (cwd, message) => {
  git(cwd, 'add', '--all');
  git(cwd, 'commit', '--quiet', '-m', message);
  return git(cwd, 'rev-parse', 'HEAD');
};
async function repository(t, { launched = true } = {}) {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'mcc-guide-release-'));
  t.after(() => fs.rm(cwd, { recursive: true, force: true }));
  git(cwd, 'init', '--quiet', '--initial-branch=main');
  git(cwd, 'config', 'user.name', 'Guide release fixture');
  git(cwd, 'config', 'user.email', 'guide-fixture@example.test');
  git(cwd, 'config', 'commit.gpgsign', 'false');
  git(cwd, 'config', 'core.hooksPath', path.join(cwd, 'disabled-hooks'));
  await write(cwd, 'README.md');
  await write(cwd, '.gitignore', 'ignored-preview.txt\n');
  if (launched) {
    await write(cwd, 'content/guides/existing-guide.md');
    await write(cwd, 'docs/GUIDE_PUBLISHING.md');
    await write(cwd, 'GUIDES_BACKLOG.md');
  }
  const base = commit(cwd, 'Initial baseline');
  return { cwd, base };
}

test('release scope accepts only new guide files and an optional modified backlog', () => {
  assert.deepEqual(validateGuideChanges([added(), added({ path: 'content/guides/second-guide.md' }), { status: 'M', path: 'GUIDES_BACKLOG.md', mode: '100644' }]), []);
});

test('release scope rejects changes to existing guides, code, deletions, renames, or invalid slugs', () => {
  for (const change of [
    added({ status: 'M' }), added({ status: 'D' }), added({ status: 'R100' }), added({ status: 'T' }),
    added({ path: 'src/AppRoutes.jsx' }), added({ path: 'content/guides/Bad_Slug.md' }),
    added({ path: 'content/guides/nested/guide.md' }), added({ path: 'content/guides/../guide.md' }),
    added({ path: 'GUIDES_BACKLOG.md' }),
  ]) assert.ok(validateGuideChanges([change]).some((error) => error.includes('outside a new guide release')), JSON.stringify(change));
});

test('an empty diff, a backlog alone, and symlink entries cannot pass', () => {
  assert.ok(validateGuideChanges([]).some((error) => error.includes('at least one new')));
  assert.ok(validateGuideChanges([{ status: 'M', path: 'GUIDES_BACKLOG.md', mode: '100644' }]).some((error) => error.includes('at least one new')));
  for (const mode of ['120000', '160000', undefined]) assert.ok(validateGuideChanges([added({ mode })]).some((error) => error.includes('regular files')));
});

test('a clean committed content release passes against an explicit ancestor commit', async (t) => {
  const { cwd, base } = await repository(t);
  await write(cwd, 'content/guides/new-cleaning-guide.md');
  await write(cwd, 'GUIDES_BACKLOG.md', 'Completed one topic.\n');
  const head = commit(cwd, 'Add the next guide');
  await write(cwd, 'ignored-preview.txt', 'An ignored local preview.\n');
  const result = inspectGuideRelease({ cwd, base });
  assert.deepEqual(result.errors, []);
  assert.equal(result.baseCommit, base);
  assert.equal(result.headCommit, head);
  assert.equal(result.changes.length, 2);
});

test('working tree checks catch untracked and tracked files while honoring gitignore', async (t) => {
  const { cwd, base } = await repository(t);
  await write(cwd, 'content/guides/new-cleaning-guide.md');
  commit(cwd, 'Add a guide');
  await write(cwd, 'untracked.txt');
  assert.ok(inspectGuideRelease({ cwd, base }).errors.some((error) => error.includes('working tree must be clean')));
  await fs.rm(path.join(cwd, 'untracked.txt'));
  await write(cwd, 'README.md', 'Uncommitted tracked change.\n');
  assert.ok(inspectGuideRelease({ cwd, base }).errors.some((error) => error.includes('working tree must be clean')));
});

test('automatic publishing stays blocked until the initial guides launch exists in the base', async (t) => {
  const { cwd, base } = await repository(t, { launched: false });
  await write(cwd, 'content/guides/new-cleaning-guide.md');
  await write(cwd, 'docs/GUIDE_PUBLISHING.md');
  commit(cwd, 'Unreleased guides system');
  assert.ok(inspectGuideRelease({ cwd, base }).errors.some((error) => error.includes('initial approved website launch')));
});

test('invalid and divergent bases fail without changing the checkout', async (t) => {
  const { cwd } = await repository(t);
  git(cwd, 'checkout', '--quiet', '-b', 'other-work');
  await write(cwd, 'other-work.txt');
  const other = commit(cwd, 'Unrelated branch change');
  git(cwd, 'checkout', '--quiet', 'main');
  await write(cwd, 'content/guides/new-cleaning-guide.md');
  const head = commit(cwd, 'Add a guide on main');
  assert.ok(inspectGuideRelease({ cwd, base: 'missing-reference' }).errors.some((error) => error.includes('Invalid base commit')));
  assert.ok(inspectGuideRelease({ cwd, base: other }).errors.some((error) => error.includes('base must be an ancestor')));
  assert.equal(git(cwd, 'rev-parse', 'HEAD'), head);
  assert.equal(git(cwd, 'status', '--porcelain'), '');
});

test('committed code and symlink additions are rejected by the real Git inspection', async (t) => {
  const { cwd, base } = await repository(t);
  await fs.symlink('existing-guide.md', path.join(cwd, 'content/guides/new-cleaning-guide.md'));
  await write(cwd, 'src/unrelated.js', 'export default true;\n');
  commit(cwd, 'Changes that are not a safe guide release');
  const result = inspectGuideRelease({ cwd, base });
  assert.ok(result.errors.some((error) => error.includes('regular files')));
  assert.ok(result.errors.some((error) => error.includes('src/unrelated.js')));
});
