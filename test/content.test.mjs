import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadGuides, loadCities, md } from '../scripts/content.mjs';
import { locations } from '../src/data/locations.js';
import { costGuides } from '../src/data/costGuides.js';

const dist = path.join(ROOT, 'dist');
const read = (route) => fs.readFile(path.join(dist, route.slice(1), 'index.html'), 'utf8');
const schemas = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((match) => JSON.parse(match[1]));

test('guide artifacts contain full articles, metadata, working TOC and quote action without application JavaScript', async () => {
  const guides = await loadGuides();
  assert.ok(guides.length >= 5);
  for (const guide of guides) {
    assert.ok(guide.wordCount >= 900 && guide.wordCount <= 1500, `${guide.slug}: ${guide.wordCount} words`);
    const html = await read(`/guides/${guide.slug}`);
    assert.ok(html.includes(`href="https://www.mastercleanhq.com/guides/${guide.slug}"`));
    assert.match(html, /property="og:type" content="article"/);
    const article = schemas(html).find((schema) => schema['@type'] === 'Article');
    assert.equal(article.headline, guide.title);
    assert.ok(article.datePublished.startsWith(guide.date));
    assert.equal(article.publisher.legalName, 'Master Clean HQ LLC');
    assert.match(guide.html, /href="\/contact">Get a free quote from Master Commercial Clean<\/a>[^<]*<\/p>\s*$/);
    for (const heading of guide.toc) {
      assert.ok(html.includes(`href="#${heading.id}"`));
      assert.ok(html.includes(`id="${heading.id}"`));
    }
    assert.match(html, /<script type="module" src="\/site-motion\.js"><\/script>/);
    const withoutMotion = html.replace('<script type="module" src="/site-motion.js"></script>', '');
    assert.doesNotMatch(withoutMotion, /<script[^>]+src=|type="module"|TODO|react-dom|__NEXT_DATA__/);
  }
});

test('city pages show referral scope, qualification, disclosure and no local address claim', async () => {
  const cities = await loadCities();
  assert.ok(cities.length >= 2);
  for (const city of cities) {
    const html = await read(`/partner-network/${city.slug}`);
    assert.match(html, /Master Commercial Clean may receive a referral fee from partner companies\./);
    assert.match(html, /at least \$1 million in annual revenue/);
    assert.match(html, /name="companyWebsite" tabindex="-1"/);
    assert.match(html, /name="revenueQualified"[^>]+required/);
    assert.match(html, /name="permissionToShare"[^>]+required/);
    const service = schemas(html).find((schema) => schema['@type'] === 'Service');
    assert.equal(service.serviceType, 'Commercial cleaning partner matching and referral');
    assert.equal(service.provider.address, undefined);
    assert.equal(service.address, undefined);
    assert.equal(service.provider.legalName, 'Master Clean HQ LLC');
    assert.match(html, /Partner availability is being confirmed/);
    for (const suburb of city.suburbs) assert.ok(html.includes(suburb));
    assert.match(html, /<script type="module" src="\/site-motion\.js"><\/script>/);
    assert.doesNotMatch(html.replace('<script type="module" src="/site-motion.js"></script>', ''), /type="module"|react-dom|__NEXT_DATA__/);
    for (const field of ['companyName', 'contactName', 'title', 'email', 'phone', 'city', 'buildingType', 'squareFootage', 'locations', 'frequency', 'startDate', 'currentProvider']) assert.ok(html.includes(`name="${field}"`));
  }
});

test('sitemap includes every guide, city and service page once and excludes form confirmation', async () => {
  const sitemap = await fs.readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  const guides = await loadGuides();
  const cities = await loadCities();
  const expectedRoutes = [
    '/guides', '/partner-network', '/partner-network/become-a-partner',
    ...guides.map((guide) => `/guides/${guide.slug}`),
    ...cities.map((city) => `/partner-network/${city.slug}`),
    ...locations.flatMap((location) => [
      `/service-areas/${location.slug}`,
      ...['commercial-cleaning', 'post-construction-cleaning', 'specialized-cleaning'].map((service) => `/service-areas/${location.slug}/${service}`),
    ]),
    ...costGuides.flatMap((guide) => [
      `/guides/${guide.slug}`,
      ...locations.filter((location) => location.isHub).map((location) => `/guides/${guide.slug}/${location.slug}`),
    ]),
  ];
  for (const route of expectedRoutes) assert.ok(urls.includes(`https://www.mastercleanhq.com${route}`), route);
  assert.ok(!urls.some((url) => url.includes('thank-you')));
  assert.match(await read('/partner-network/thank-you'), /content="noindex, follow"/);
  assert.match(await fs.readFile(path.join(dist, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/www\.mastercleanhq\.com\/sitemap\.xml/);
});

test('Markdown escapes executable HTML and rejects unsafe URLs', () => {
  const result = md.render('<script>alert(1)</script>\n\n[link](javascript:alert(1))');
  assert.doesNotMatch(result, /<script>|href="javascript:/);
});
