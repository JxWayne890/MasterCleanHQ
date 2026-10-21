import { execFileSync } from 'node:child_process';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const contentHash = /^[0-9a-f]{64}$/;
const commitHash = /^[0-9a-f]{40}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function resolveBuildCommit({ env = process.env, cwd = process.cwd() } = {}) {
  const configured = env.VERCEL_GIT_COMMIT_SHA;
  if (configured) {
    if (!commitHash.test(configured)) throw new Error('The configured build commit is invalid.');
    return configured.toLowerCase();
  }
  try {
    const commit = execFileSync('git', ['rev-parse', '--verify', 'HEAD^{commit}'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return commitHash.test(commit) ? commit.toLowerCase() : null;
  } catch {
    // A source export can still build the site, but it cannot prove a release.
    return null;
  }
}

export function createGuidePublicationManifest(guides, { commit = null } = {}) {
  if (commit !== null && !commitHash.test(commit)) throw new Error('The publication manifest commit is invalid.');
  const requests = new Set();
  const publications = [];
  for (const guide of guides) {
    const requestId = guide.publicationRequestId;
    const hash = guide.publicationContentHash;
    if (requestId === undefined && hash === undefined) continue;
    if (!slugPattern.test(guide.slug) || typeof requestId !== 'string' || !uuid.test(requestId) || typeof hash !== 'string' || !contentHash.test(hash)) {
      throw new Error('A guide has invalid publication metadata.');
    }
    if (requests.has(requestId.toLowerCase())) throw new Error('A publication request cannot belong to multiple guides.');
    requests.add(requestId.toLowerCase());
    publications.push({ slug: guide.slug, requestId: requestId.toLowerCase(), contentHash: hash });
  }
  return {
    schemaVersion: 1,
    commit: commit?.toLowerCase() || null,
    guides: publications.sort((a, b) => a.slug.localeCompare(b.slug)),
  };
}
