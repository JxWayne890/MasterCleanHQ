import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { validateGuidePayload, serializeGuide, hashGuidePayload, REPOSITORY, PRODUCTION_BRANCH, PUBLISH_WORKFLOW } from '../lib/guide-publishing/contract.mjs';
import { inspectGuideRelease } from './check-guide-release.mjs';
import { verifyLaunchReadiness, waitForPublication } from './verify-guide-publication.mjs';
import { submitGuideIndexNow } from '../lib/guide-publishing/indexnow.mjs';

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function git(cwd, args, options = {}) {
  return execFileSync('git', ['--no-optional-locks', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024, ...options }).trim();
}

export function validateRunnerEnvironment(env) {
  requireValue(env.GITHUB_ACTIONS === 'true' && env.GITHUB_REPOSITORY === REPOSITORY && env.GITHUB_REF === `refs/heads/${PRODUCTION_BRANCH}` && env.GITHUB_WORKFLOW_REF === `${REPOSITORY}/.github/workflows/${PUBLISH_WORKFLOW}@refs/heads/${PRODUCTION_BRANCH}`, 'Publication must run from the trusted MCC workflow on main.');
  requireValue(env.MCC_GUIDES_LAUNCH_APPROVED === 'true', 'Initial guides launch is not approved. Set MCC_GUIDES_LAUNCH_APPROVED only after John approves and the initial website release is live.');
  for (const name of ['MCC_GUIDE_COMMIT_NAME', 'MCC_GUIDE_COMMIT_EMAIL']) {
    requireValue(typeof env[name] === 'string' && env[name].trim() === env[name] && env[name].length > 2 && env[name].length < 256 && !/[\r\n\0]/.test(env[name]), `${name} must be configured with the verified Vercel project owner commit identity.`);
  }
  requireValue(/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(env.MCC_GUIDE_COMMIT_EMAIL), 'The owner associated commit email is invalid.');
}

export function validateDispatchInput(payload, env) {
  requireValue(env.MCC_GUIDE_REQUEST_ID === payload.requestId && env.MCC_GUIDE_CONTENT_HASH === hashGuidePayload(payload) && env.MCC_GUIDE_SLUG === payload.slug, 'Workflow identity inputs do not match the normalized guide payload.');
}

export function inspectTrustedCheckout(cwd) {
  requireValue(realpathSync(git(cwd, ['rev-parse', '--show-toplevel'])) === realpathSync(cwd), 'Publish from the repository root only.');
  requireValue(new Set([`https://github.com/${REPOSITORY}`, `https://github.com/${REPOSITORY}.git`]).has(git(cwd, ['remote', 'get-url', 'origin'])), 'The Git origin differs from the fixed MCC repository.');
  requireValue(!git(cwd, ['status', '--porcelain=v1', '--untracked-files=all', '--ignore-submodules=none']), 'The publication checkout must be clean.');
  const head = git(cwd, ['rev-parse', 'HEAD']);
  requireValue(head === git(cwd, ['rev-parse', `refs/remotes/origin/${PRODUCTION_BRANCH}`]), 'The trusted checkout must start at the freshly fetched origin/main commit.');
  return head;
}

// Paths are computed from the strict slug schema. Input cannot supply paths,
// repository names, executable commands, workflow references or Git branches.
export async function inspectPublicationRequest({ cwd, payload }) {
  const directory = path.join(cwd, 'content/guides');
  requireValue((await fs.lstat(directory)).isDirectory(), 'The launched guide source directory is unavailable.');
  const expected = serializeGuide(payload);
  const priorRecords = git(cwd, ['log', '--format=%H%x00%B%x00', '--extended-regexp', `--grep=^MCC-Guide-Request: ${payload.requestId}$`, 'HEAD']).split('\0');
  let previousRequest = false;
  for (let index = 0; index + 1 < priorRecords.length; index += 2) {
    const commit = priorRecords[index].trim();
    if (!commit) continue;
    const message = priorRecords[index + 1];
    requireValue(message.split('\n').includes(`MCC-Guide-Payload-SHA256: ${hashGuidePayload(payload)}`), 'This request ID was previously committed with different content.');
    let original;
    try { original = git(cwd, ['show', `${commit}:content/guides/${payload.slug}.md`]); } catch { throw new Error('This request ID previously published a different guide slug.'); }
    requireValue(original === expected.trim(), 'This request ID was previously committed with different guide source.');
    previousRequest = true;
  }
  const normalizedTitle = (title) => String(title).normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
  let reused = false;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (!entry.name.endsWith('.md')) continue;
    requireValue(entry.isFile() && !entry.isSymbolicLink(), 'Guide source entries must be ordinary files.');
    const source = await fs.readFile(path.join(directory, entry.name), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    requireValue(frontmatter, 'An existing guide has invalid metadata.');
    const metadata = parseYaml(frontmatter[1], { maxAliasCount: 0, uniqueKeys: true });
    const sameSlug = entry.name === `${payload.slug}.md`;
    const sameRequest = metadata.publicationRequestId === payload.requestId;
    if (sameRequest) requireValue(sameSlug && source === expected, 'This request ID already belongs to different guide content. Reuse the original payload.');
    if (sameSlug) {
      requireValue(sameRequest && source === expected, 'The requested slug already exists. Existing guides cannot be overwritten by the publisher.');
      reused = true;
    } else {
      requireValue(normalizedTitle(metadata.title) !== normalizedTitle(payload.title), 'Another guide already uses this title. Choose a distinct topic and search intent.');
    }
  }
  requireValue(!previousRequest || reused, 'This request previously published a guide that is no longer in production source. Do not recreate a removed page automatically.');
  return { reused, source: expected, relativePath: `content/guides/${payload.slug}.md` };
}

export function checkPreparedRelease(cwd, base, relativePath) {
  const release = inspectGuideRelease({ cwd, base });
  requireValue(release.errors.length === 0, `Content release guard refused publication: ${release.errors.join(' ')}`);
  requireValue(release.changes.length === 1 && release.changes[0].path === relativePath && release.changes[0].status === 'A' && release.changes[0].mode === '100644', 'A cloud publication may add only its single ordinary Markdown guide.');
  requireValue(git(cwd, ['rev-list', '--count', `${base}..HEAD`]) === '1', 'A cloud publication must contain exactly one new content commit.');
  return release;
}

async function runChecks(cwd) {
  const checks = [];
  for (const script of ['guides:check', 'build', 'lint']) {
    execFileSync('npm', ['run', script], { cwd, stdio: 'inherit', env: process.env });
    checks.push(`npm run ${script}`);
  }
  const tests = (await fs.readdir(path.join(cwd, 'test'))).filter((name) => /^[a-zA-Z0-9_.-]+\.test\.(?:mjs|cjs|js)$/.test(name)).sort().map((name) => `test/${name}`);
  requireValue(tests.length > 0, 'The trusted production checkout contains no tests.');
  execFileSync(process.execPath, ['--test', ...tests], { cwd, stdio: 'inherit', env: process.env });
  checks.push('node --test test/*.test.*');
  return checks;
}

export async function publishGuide({ cwd = process.cwd(), env = process.env, fetchImpl = fetch, runValidation = runChecks } = {}) {
  const payload = validateGuidePayload(JSON.parse(env.MCC_GUIDE_PAYLOAD || 'null'));
  validateDispatchInput(payload, env);
  const receipt = { schemaVersion: 1, requestId: payload.requestId, contentHash: hashGuidePayload(payload), slug: payload.slug, topic: payload.title, repository: REPOSITORY, branch: PRODUCTION_BRANCH, status: 'checking', checks: [] };
  const outputDirectory = path.join(env.RUNNER_TEMP || path.dirname(cwd), 'mcc-guide-publication');
  await fs.mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  const writeReceipt = () => fs.writeFile(path.join(outputDirectory, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
  await fs.writeFile(path.join(outputDirectory, `${payload.slug}.md`), serializeGuide(payload), { mode: 0o600 });
  await writeReceipt();
  try {
    validateRunnerEnvironment(env);
    git(cwd, ['fetch', '--no-tags', 'origin', `${PRODUCTION_BRANCH}:refs/remotes/origin/${PRODUCTION_BRANCH}`]);
    const base = inspectTrustedCheckout(cwd);
    receipt.baseCommit = base;
    await verifyLaunchReadiness(base, { fetchImpl });
    const request = await inspectPublicationRequest({ cwd, payload });
    receipt.reused = request.reused;
    let commit = base;
    if (request.reused) {
      commit = git(cwd, ['log', '-1', '--format=%H', '--diff-filter=A', '--', request.relativePath]);
      requireValue(/^[a-f0-9]{40}$/.test(commit), 'The existing guide has no original content commit.');
      git(cwd, ['merge-base', '--is-ancestor', commit, base]);
      receipt.checks.push('existing request and exact source match', 'original content commit is an ancestor of current production');
    } else {
      await fs.writeFile(path.join(cwd, request.relativePath), request.source, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
      receipt.checks.push(...await runValidation(cwd));
      git(cwd, ['add', '--', request.relativePath]);
      const identity = { ...process.env, GIT_AUTHOR_NAME: env.MCC_GUIDE_COMMIT_NAME, GIT_AUTHOR_EMAIL: env.MCC_GUIDE_COMMIT_EMAIL, GIT_COMMITTER_NAME: env.MCC_GUIDE_COMMIT_NAME, GIT_COMMITTER_EMAIL: env.MCC_GUIDE_COMMIT_EMAIL };
      git(cwd, ['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', `Publish guide: ${payload.slug}`, '-m', `MCC-Guide-Request: ${payload.requestId}\nMCC-Guide-Payload-SHA256: ${hashGuidePayload(payload)}`], { env: identity });
      checkPreparedRelease(cwd, base, request.relativePath);
      receipt.checks.push('clean committed content scope');
      commit = git(cwd, ['rev-parse', 'HEAD']);
      receipt.articleCommit = commit;
      receipt.status = 'checked';
      await writeReceipt();
      git(cwd, ['fetch', '--no-tags', 'origin', `${PRODUCTION_BRANCH}:refs/remotes/origin/${PRODUCTION_BRANCH}`]);
      requireValue(git(cwd, ['rev-parse', `refs/remotes/origin/${PRODUCTION_BRANCH}`]) === base, 'Production main moved during validation. Nothing was pushed. Retry the same request against the new production base.');
      await verifyLaunchReadiness(base, { fetchImpl });
      git(cwd, ['push', 'origin', `HEAD:refs/heads/${PRODUCTION_BRANCH}`]);
      receipt.status = 'awaiting_deployment';
      await writeReceipt();
    }
    receipt.articleCommit = commit;
    const verified = await waitForPublication(payload, request.reused ? base : commit, { fetchImpl });
    Object.assign(receipt, { ...verified, checks: [...receipt.checks, ...verified.checks, 'exact production build commit and publication tuple'], status: 'published' });
    receipt.indexNow = await submitGuideIndexNow(receipt.liveUrl, { fetchImpl });
    await writeReceipt();
    return receipt;
  } catch (error) {
    receipt.status = receipt.status === 'awaiting_deployment' ? 'deployment_unverified' : 'failed';
    receipt.error = error.message;
    await writeReceipt();
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const receipt = await publishGuide();
    console.log(`Guide publication verified: ${receipt.liveUrl} (${receipt.commit}).`);
  } catch (error) {
    console.error(`Guide publication stopped: ${error.message}`);
    process.exitCode = 1;
  }
}
