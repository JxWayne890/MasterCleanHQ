import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// These checks run against the static output produced by npm run build.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const kib = 1024;

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];
}

function text(markup) {
  return markup
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sectionByLabel(label) {
  const found = html.match(new RegExp(`<section\\b[^>]*aria-labelledby="${label}"[^>]*>([\\s\\S]*?)<\\/section>`));
  assert.ok(found, `Missing visible section labelled by ${label}`);
  return found[1];
}

function links(markup) {
  return [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((match) => ({
    href: attribute(match[1], 'href'),
    label: text(match[2]),
  }));
}

const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap((match) => {
    const parsed = JSON.parse(match[1]);
    return parsed['@graph'] || (Array.isArray(parsed) ? parsed : [parsed]);
  });

test('the rendered hero makes calling MCC the first action', () => {
  const hero = sectionByLabel('mcc-hero-title');
  const actions = links(hero);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, 'The homepage needs one clear main heading');
  assert.match(hero, /<h1\b[^>]*id="mcc-hero-title"/);
  assert.match(text(hero), /San Angelo/);
  assert.match(text(hero), /commercial cleaning/i);
  assert.equal(actions[0].href, 'tel:+13252732203');
  assert.match(actions[0].label, /Call.*325.*273.*2203/);
});

test('the hero quote action reaches the visible quote form and direct contact details', () => {
  const quote = links(sectionByLabel('mcc-hero-title')).find((link) => /free quote/i.test(link.label));
  assert.ok(quote, 'Visitors need a quote alternative to calling');
  assert.match(quote.href, /^#[\w-]+$/);
  const destinationId = quote.href.slice(1);
  const destination = html.match(new RegExp(`<section\\b[^>]*id="${destinationId}"[^>]*>([\\s\\S]*?)<\\/section>`));
  assert.ok(destination, `The ${quote.href} action must have a visible destination`);
  const form = destination[1].match(/<form\b[^>]*>([\s\S]*?)<\/form>/);
  assert.ok(form, 'The quote action must reach a real form');
  for (const field of ['full_name', 'business_name', 'phone', 'city', 'facility_type', 'service_type']) {
    assert.match(form[1], new RegExp(`<(?:input|select)\\b[^>]*name="${field}"[^>]*required`), `${field} must remain usable and required`);
  }
  assert.match(form[1], /<button\b[^>]*type="submit"/);
  assert.ok(links(destination[1]).some((link) => link.href === 'tel:+13252732203'));
  assert.ok(links(destination[1]).some((link) => link.href === 'mailto:john@mastercleanhq.com'));
});

test('the trust bar contains only the four approved organizations and attributes Housley correctly', async () => {
  const proof = sectionByLabel('mcc-client-title');
  const organizations = [...proof.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((match) => match[1]);
  const approved = [
    ['Housley FLP', '/img/clients/housley-group.svg'],
    ['Rowland McCrory Construction', '/img/clients/rowland-mccrory.png'],
    ['Veribest ISD', '/img/clients/veribest-isd.png'],
    ['Miles ISD', '/img/clients/miles-isd.png'],
  ];
  assert.equal(organizations.length, approved.length);
  for (const [name, logoPath] of approved) {
    const organization = organizations.find((markup) => text(markup) === name);
    assert.ok(organization, `Missing approved client ${name}`);
    const image = organization.match(/<img\b[^>]*>/)?.[0];
    assert.ok(image, `${name} must have its logo`);
    assert.equal(attribute(image, 'src'), logoPath);
    assert.ok(attribute(image, 'alt'), `${name} needs meaningful alternative text`);
    assert.ok((await fs.stat(path.join(dist, logoPath))).isFile(), `${name} logo must ship in the build`);
  }
  assert.match(proof, /alt="Housley Group logo, representing Housley FLP"/);
});

test('visible FAQ answers agree with the homepage structured data and legal business identity', () => {
  const faqMarkup = sectionByLabel('home-faq-title');
  const visibleFaqs = [...faqMarkup.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)].map((match) => {
    const question = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/)?.[1];
    const answer = match[1].match(/<\/summary>\s*<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1];
    assert.ok(question && answer, 'Each FAQ must expose both a question and an answer in the static HTML');
    return { question: text(question), answer: text(answer) };
  });
  assert.ok(visibleFaqs.length >= 4);
  const faqSchemas = schemas.filter((schema) => schema['@type'] === 'FAQPage');
  assert.equal(faqSchemas.length, 1, 'Avoid duplicate or conflicting FAQ schema');
  const schemaFaqs = faqSchemas[0].mainEntity.map((question) => ({ question: question.name, answer: question.acceptedAnswer.text }));
  assert.deepEqual(schemaFaqs, visibleFaqs);
  const organization = schemas.find((schema) => schema['@type'] === 'Organization');
  const business = schemas.find((schema) => schema['@type'] === 'LocalBusiness');
  assert.equal(organization.legalName, 'Master Clean HQ LLC');
  assert.equal(organization.name, 'Master Commercial Clean');
  assert.equal(organization.telephone, '+13252732203');
  assert.equal(business.telephone, organization.telephone);
  assert.equal(business.address.addressLocality, 'San Angelo');
});

test('the new homepage does not publish unverified testimonials, ratings, or response guarantees', () => {
  const visible = text(html);
  assert.doesNotMatch(html, /<blockquote\b/i, 'Publish customer quotations only after their wording and attribution are approved');
  for (const schema of schemas) {
    assert.notEqual(schema['@type'], 'Review');
    assert.equal(schema.aggregateRating, undefined);
    assert.equal(schema.review, undefined);
  }
  assert.doesNotMatch(visible, /\b(?:five[ -]star|5[ -]star|satisfaction guarantee|guaranteed response|24\/7)\b/i);
  assert.doesNotMatch(visible, /\b(?:respond|reply|response|contact you|call you back)\b.{0,45}\b(?:within|under|in)\s+(?:\d+|one|two|a)\s+(?:business\s+)?(?:hour|minute|day)s?\b/i);
  assert.doesNotMatch(visible, /\b(?:same[ -]day|next[ -]day)\s+(?:response|reply|callback|service)\b/i);
});

test('hero and client assets ship as static files within practical transfer budgets', async () => {
  const hero = sectionByLabel('mcc-hero-title');
  const heroImage = hero.match(/<img\b[^>]*>/)?.[0];
  assert.ok(heroImage);
  assert.match(attribute(heroImage, 'alt'), /illustrat/i, 'The illustration must not be presented as a client project photograph');
  assert.equal(attribute(heroImage, 'fetchPriority')?.toLowerCase(), 'high');
  assert.notEqual(attribute(heroImage, 'loading'), 'lazy');
  assert.ok(Number(attribute(heroImage, 'width')) > 0 && Number(attribute(heroImage, 'height')) > 0, 'Reserve image space to avoid layout shifts');
  const heroPaths = [640, 960, 1280].map((width) => `/img/mcc-commercial-lobby-${width}.webp`);
  const srcset = attribute(heroImage, 'srcSet');
  const heroWeights = [];
  for (const [index, imagePath] of heroPaths.entries()) {
    assert.ok(srcset.includes(`${imagePath} ${[640, 960, 1280][index]}w`));
    const image = await fs.readFile(path.join(dist, imagePath));
    assert.equal(image.toString('ascii', 0, 4), 'RIFF');
    assert.equal(image.toString('ascii', 8, 12), 'WEBP');
    assert.ok(image.length < 300 * kib, `${imagePath} should stay below 300 KiB`);
    heroWeights.push(image.length);
  }
  assert.ok(heroWeights.reduce((sum, bytes) => sum + bytes, 0) < 750 * kib, 'Responsive hero variants should not become oversized static assets');
  let logoBytes = 0;
  const logoPaths = new Set([...html.matchAll(/<img\b[^>]*>/g)].map((match) => attribute(match[0], 'src')).filter((src) => !heroPaths.includes(src)));
  for (const imagePath of logoPaths) {
    assert.match(imagePath, /^\/img\//, 'Homepage images must use local static assets');
    const asset = await fs.stat(path.join(dist, imagePath));
    assert.ok(asset.isFile());
    logoBytes += asset.size;
  }
  assert.ok(logoBytes < 250 * kib, `Homepage brand and client logos total ${Math.round(logoBytes / kib)} KiB`);
  assert.ok(Math.max(...heroWeights) + logoBytes < 500 * kib, 'One hero image and the logos should total less than 500 KiB');
  const social = await fs.readFile(path.join(dist, 'img/mcc-home-social.png'));
  assert.deepEqual([...social.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(social.length < 2 * 1024 * kib, 'The share image should stay below 2 MiB');
  assert.match(html, /property="og:image" content="https:\/\/www\.mastercleanhq\.com\/img\/mcc-home-social\.png"/);
});
