import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGuides } from './content.mjs';
import { costGuides } from '../src/data/costGuides.js';

export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

// Accept the parsed guide records from loadGuides so validation uses the same
// Markdown renderer and word count as the generated pages.
export function validateGuides(guides, { reservedSlugs = costGuides.map((guide) => guide.slug) } = {}) {
  if (!Array.isArray(guides) || guides.length === 0) return ['No Markdown guides found.'];
  const errors = [];
  const slugs = new Set(guides.map((guide) => guide.slug));
  const reserved = new Set(reservedSlugs);
  const seenSlugs = new Set();
  const titles = new Map();
  const closingQuote = /href="\/contact">Get a free quote from Master Commercial Clean<\/a>[^<]*<\/p>\s*$/;

  for (const guide of guides) {
    const label = guide.slug || '(guide without a slug)';
    if (typeof guide.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug)) errors.push(`${label}: invalid slug.`);
    if (seenSlugs.has(guide.slug)) errors.push(`${label}: duplicate slug.`);
    seenSlugs.add(guide.slug);
    if (reserved.has(guide.slug)) errors.push(`${label}: slug collides with an existing service cost guide.`);

    for (const key of ['title', 'description', 'date', 'category']) {
      if (typeof guide[key] !== 'string' || !guide[key].trim()) errors.push(`${label}: missing ${key}.`);
    }
    if (typeof guide.title === 'string' && guide.title.trim()) {
      const title = guide.title.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
      if (titles.has(title)) errors.push(`${label}: duplicate title also used by ${titles.get(title)}.`);
      else titles.set(title, label);
    }
    if (!isCalendarDate(guide.date)) errors.push(`${label}: date must be a real calendar date in YYYY-MM-DD format.`);
    if (guide.updated !== undefined) {
      if (!isCalendarDate(guide.updated)) errors.push(`${label}: updated must be a real calendar date in YYYY-MM-DD format.`);
      else if (isCalendarDate(guide.date) && guide.updated < guide.date) errors.push(`${label}: updated cannot be earlier than date.`);
    }
    if (!Number.isInteger(guide.wordCount) || guide.wordCount < 900 || guide.wordCount > 1500) {
      errors.push(`${label}: expected 900 to 1500 words, found ${guide.wordCount ?? 'no word count'}.`);
    }
    if (typeof guide.html !== 'string' || !closingQuote.test(guide.html)) {
      errors.push(`${label}: end the article with [Get a free quote from Master Commercial Clean](/contact).`);
    }
    if (!Array.isArray(guide.related) || guide.related.length === 0) {
      errors.push(`${label}: related must list at least one other Markdown guide slug.`);
    } else {
      if (new Set(guide.related).size !== guide.related.length) errors.push(`${label}: duplicate related guide reference.`);
      for (const slug of guide.related) {
        if (slug === guide.slug || !slugs.has(slug)) errors.push(`${label}: invalid related guide reference ${String(slug)}.`);
      }
    }
  }
  return errors;
}

async function main() {
  try {
    const guides = await loadGuides();
    const errors = validateGuides(guides);
    if (errors.length) {
      console.error(`Guide validation failed:\n${errors.join('\n')}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Guide validation passed for ${guides.length} Markdown guides.`);
  } catch (error) {
    console.error(`Guide validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
