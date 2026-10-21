import { md } from './content.mjs';
import { hashGuidePayload } from '../lib/guide-publishing/contract.mjs';

export const PUBLISH_TARGET = Object.freeze({
  repository: 'JxWayne890/MasterCleanHQ',
  branch: 'main',
  projectId: 'prj_NArudA2LATO6B5HXZYhjA90nVigC',
  projectName: 'master-clean-hq',
  teamId: 'team_ijL6I1f7BoKqxGHB4grAxAI0',
  origin: 'https://www.mastercleanhq.com',
});

const sha = /^[a-f0-9]{40}$/;
const text = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code))).replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }[entity])).replace(/\s+/g, ' ').trim();
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

async function publicPage(path, { fetchImpl = fetch } = {}) {
  const url = new URL(path, PUBLISH_TARGET.origin);
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(20_000), headers: { 'cache-control': 'no-cache' } });
  requireValue(response.status === 200, `Live ${path} returned HTTP ${response.status}.`);
  requireValue(new URL(response.url || url).origin === PUBLISH_TARGET.origin, `Live ${path} redirected away from the MCC canonical origin.`);
  const body = await response.text();
  requireValue(body.length < 3_000_000, `Live ${path} exceeded the expected page size.`);
  return body;
}

export async function readPublicationManifest(options = {}) {
  const source = await publicPage('/guide-publication-manifest.json', options);
  let manifest;
  try { manifest = JSON.parse(source); } catch { throw new Error('The live publication manifest is not JSON.'); }
  requireValue(manifest.schemaVersion === 1 && sha.test(manifest.commit || '') && Array.isArray(manifest.guides), 'The live publication manifest has an unsupported schema or no exact build commit.');
  return manifest;
}

export async function verifyLaunchReadiness(expectedCommit, options = {}) {
  const [page, manifest] = await Promise.all([publicPage('/guides', options), readPublicationManifest(options)]);
  requireValue(sha.test(expectedCommit || '') && manifest.commit === expectedCommit, 'The live production build does not match the fresh production branch. Wait for its verified deployment before publishing another guide.');
  requireValue(/<meta\b[^>]*name="robots"[^>]*content="index,/.test(page) && page.includes('"@type":"CollectionPage"') && page.includes('class="resource-grid"'), 'The initial static guides section is not live. Initial launch approval and release are required.');
}

export async function verifyPublicGuide(payload, options = {}) {
  const route = `/guides/${payload.slug}`;
  const liveUrl = `${PUBLISH_TARGET.origin}${route}`;
  const [article, index, sitemap, robots, contact] = await Promise.all([
    publicPage(route, options), publicPage('/guides', options), publicPage('/sitemap.xml', options), publicPage('/robots.txt', options), publicPage('/contact', options),
  ]);
  const body = article.match(/<article\b[^>]*class="[^"]*\barticle-body\b[^"]*"[^>]*>([\s\S]*?)<\/article>/)?.[1];
  requireValue(body && text(body) === text(md.render(payload.markdown.replace(/<!--[\s\S]*?-->/g, ''))), 'The live article body does not match the submitted guide.');
  requireValue(new RegExp(`<h1\\b[^>]*>\\s*${escape(payload.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'))}\\s*</h1>`).test(article), 'The live article title differs from the submitted guide.');
  requireValue(article.includes(`<link rel="canonical" href="${liveUrl}">`), 'The live article canonical URL differs from its permanent guide URL.');
  requireValue(article.includes('<meta name="robots" content="index,'), 'The guide is not indexable.');
  const schemas = [...article.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  const schema = schemas.find((entry) => entry['@type'] === 'Article');
  requireValue(schema?.headline === payload.title && schema.description === payload.description && schema.mainEntityOfPage === liveUrl && schema.datePublished?.startsWith(`${payload.date}T`) && schema.author?.name === 'Master Commercial Clean', 'The live Article schema differs from the submitted guide.');
  requireValue(/href="\/contact">Get a free quote from Master Commercial Clean<\/a>[^<]*<\/p>\s*$/.test(body), 'The live article is missing its final quote link.');
  requireValue(index.includes(`href="${route}"`) && sitemap.includes(`<loc>${liveUrl}</loc>`), 'The guide index or sitemap is missing the new article.');
  requireValue(new RegExp(`^Sitemap:\\s*${escape(PUBLISH_TARGET.origin)}/sitemap\\.xml\\s*$`, 'mi').test(robots) && !/^Disallow:\s*\/(?:guides(?:\/|\s*$)|\s*$)/mi.test(robots), 'Robots does not allow guide crawling or reference the correct sitemap.');
  requireValue(/<form\b[^>]*class="[^"]*mcc-quote-form/.test(contact) && contact.includes('name="full_name"') && contact.includes('name="phone"'), 'The existing contact destination does not contain the quote form.');
  return { liveUrl, checks: ['article content', 'canonical URL', 'Article schema', 'quote link', 'guide index', 'sitemap', 'robots', 'contact form'] };
}

export async function waitForPublication(payload, expectedCommit, { fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), attempts = 48 } = {}) {
  requireValue(sha.test(expectedCommit || ''), 'A complete expected Git commit is required.');
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const before = await readPublicationManifest({ fetchImpl });
      requireValue(before.commit === expectedCommit, 'Vercel has not promoted the expected Git commit to production.');
      requireValue(before.guides.some((guide) => guide.slug === payload.slug && guide.requestId === payload.requestId && guide.contentHash === hashGuidePayload(payload)), 'The live build manifest does not contain this publication request and exact guide content.');
      const result = await verifyPublicGuide(payload, { fetchImpl });
      const after = await readPublicationManifest({ fetchImpl });
      requireValue(after.commit === expectedCommit && JSON.stringify(before) === JSON.stringify(after), 'Production changed during guide verification.');
      return { commit: after.commit, ...result, verifiedAt: new Date().toISOString() };
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await sleep(15_000);
    }
  }
  throw new Error(`Publication is unverified: ${lastError?.message || 'deployment did not become ready'}`);
}
