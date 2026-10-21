import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const guidePath = /^content\/guides\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const regularFileModes = new Set(['100644', '100755']);

export function validateGuideChanges(changes) {
  const errors = [];
  let newGuides = 0;
  for (const change of changes) {
    const addedGuide = change.status === 'A' && guidePath.test(change.path);
    const modifiedBacklog = change.status === 'M' && change.path === 'GUIDES_BACKLOG.md';
    if (!addedGuide && !modifiedBacklog) {
      errors.push(`Change outside a new guide release: ${change.status} ${change.path}.`);
      continue;
    }
    if (!regularFileModes.has(change.mode)) errors.push(`Release files must be regular files: ${change.path}.`);
    if (addedGuide) newGuides += 1;
  }
  if (newGuides === 0) errors.push('A guide release must add at least one new Markdown guide.');
  return errors;
}

function git(cwd, args) {
  return execFileSync('git', ['--no-optional-locks', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });
}

function treeEntries(cwd, commit, paths) {
  return new Map(git(cwd, ['ls-tree', '-z', commit, '--', ...paths]).split('\0').filter(Boolean).map((entry) => {
    const separator = entry.indexOf('\t');
    const [mode, type] = entry.slice(0, separator).split(' ');
    return [entry.slice(separator + 1), { mode, type }];
  }));
}

// Local, read only guard. The caller separately checks the current remote and
// production commits, holds the publishing lock, and runs guides:check and build.
export function inspectGuideRelease({ cwd = process.cwd(), base = 'origin/main' } = {}) {
  const errors = [];
  const result = { errors, baseCommit: null, headCommit: null, changes: [] };
  try {
    cwd = git(cwd, ['rev-parse', '--show-toplevel']).trim();
  } catch {
    errors.push('Guide release check must run inside a Git working tree.');
    return result;
  }
  if (git(cwd, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignore-submodules=none'])) {
    errors.push('The working tree must be clean, including tracked changes and untracked files. Commit the intended release first.');
  }
  try {
    result.baseCommit = git(cwd, ['rev-parse', '--verify', '--end-of-options', `${base}^{commit}`]).trim();
  } catch {
    errors.push(`Invalid base commit: ${base}. Fetch and verify the intended production branch separately.`);
    return result;
  }
  try {
    result.headCommit = git(cwd, ['rev-parse', '--verify', 'HEAD^{commit}']).trim();
    git(cwd, ['merge-base', '--is-ancestor', result.baseCommit, result.headCommit]);
  } catch {
    errors.push('The base must be an ancestor of HEAD. A divergent branch cannot publish a guide release.');
    return result;
  }
  const baseline = treeEntries(cwd, result.baseCommit, ['content/guides', 'docs/GUIDE_PUBLISHING.md']);
  if (baseline.get('content/guides')?.type !== 'tree' || !regularFileModes.has(baseline.get('docs/GUIDE_PUBLISHING.md')?.mode)) {
    errors.push('The base does not contain the launched guides system and publishing instructions. Complete the initial approved website launch before automatic guide releases.');
  }

  const fields = git(cwd, ['diff', '--name-status', '--no-renames', '--ignore-submodules=none', '-z', result.baseCommit, result.headCommit]).split('\0');
  if (fields.at(-1) === '') fields.pop();
  for (let index = 0; index < fields.length; index += 2) {
    result.changes.push({ status: fields[index], path: fields[index + 1] });
  }
  const paths = result.changes.map((change) => change.path);
  const headFiles = paths.length ? treeEntries(cwd, result.headCommit, paths) : new Map();
  result.changes = result.changes.map((change) => ({ ...change, mode: headFiles.get(change.path)?.mode }));
  errors.push(...validateGuideChanges(result.changes));
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--base' || !args[1])) {
    console.error('Usage: npm run guides:release-check -- --base origin/main');
    process.exitCode = 1;
    return;
  }
  try {
    const release = inspectGuideRelease({ base: args[1] || 'origin/main' });
    if (release.errors.length) {
      console.error(`Guide release check failed:\n${release.errors.join('\n')}`);
      process.exitCode = 1;
      return;
    }
    const added = release.changes.filter((change) => change.status === 'A').length;
    console.log(`Local guide release check passed for ${added} new guide${added === 1 ? '' : 's'}.`);
    console.log(`Base: ${release.baseCommit}\nRelease: ${release.headCommit}`);
    console.log('Separately verify the current remote and production commits, hold the publishing lock, and run guides:check and build before publishing.');
  } catch (error) {
    console.error(`Guide release check failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
