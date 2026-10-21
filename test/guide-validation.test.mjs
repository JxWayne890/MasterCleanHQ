import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGuides, md } from '../scripts/content.mjs';
import { isCalendarDate, validateGuides } from '../scripts/check-guides.mjs';

const quote = '[Get a free quote from Master Commercial Clean](/contact)';
const fixture = (overrides = {}) => ({
  slug: 'first-guide',
  title: 'Plan a cleaning scope',
  description: 'How to prepare a useful cleaning scope for your building.',
  date: '2026-10-21',
  category: 'Planning',
  wordCount: 1000,
  html: md.render(`Useful article content.\n\n${quote}`),
  related: ['second-guide'],
  ...overrides,
});
const other = () => fixture({ slug: 'second-guide', title: 'Compare a cleaning scope', related: ['first-guide'] });
const errorsFor = (overrides) => validateGuides([fixture(overrides), other()]);

test('current Markdown guides pass the publishing prerequisite', async () => {
  assert.deepEqual(validateGuides(await loadGuides()), []);
});

test('dates must be real calendar dates, including century leap year rules', () => {
  for (const date of ['2026-02-30', '2025-02-29', '1900-02-29', '2026-04-31', '2026-00-01', '2026-13-01', '2026-01-00', '0000-01-01', '2026-1-01', '2026-10-21T00:00:00Z', null]) {
    assert.equal(isCalendarDate(date), false, String(date));
  }
  for (const date of ['2024-02-29', '2000-02-29', '2026-04-30', '2026-12-31']) assert.equal(isCalendarDate(date), true, date);
  assert.ok(errorsFor({ date: '2026-02-30' }).some((error) => error.includes('date must be a real calendar date')));
});

test('optional updated dates are validated and cannot precede publication', () => {
  assert.deepEqual(errorsFor({ updated: '2026-10-22' }), []);
  assert.ok(errorsFor({ updated: '2026-11-31' }).some((error) => error.includes('updated must be a real calendar date')));
  assert.ok(errorsFor({ updated: '2026-10-20' }).some((error) => error.includes('updated cannot be earlier')));
});

test('new guide routes cannot overwrite legacy cost guides or duplicate another route', () => {
  const legacy = fixture({ slug: 'commercial-cleaning-cost', related: ['second-guide'] });
  const errors = validateGuides([legacy, other()]);
  assert.ok(errors.some((error) => error.includes('slug collides with an existing service cost guide')));
  assert.ok(validateGuides([fixture(), fixture(), other()]).some((error) => error.includes('duplicate slug')));
});

test('titles and related references must be unique and related routes must exist', () => {
  const duplicate = other();
  duplicate.title = '  PLAN  A CLEANING SCOPE ';
  assert.ok(validateGuides([fixture(), duplicate]).some((error) => error.includes('duplicate title')));
  assert.ok(errorsFor({ related: ['second-guide', 'second-guide'] }).some((error) => error.includes('duplicate related')));
  assert.ok(errorsFor({ related: ['missing-guide'] }).some((error) => error.includes('invalid related guide reference')));
  assert.ok(errorsFor({ related: ['first-guide'] }).some((error) => error.includes('invalid related guide reference')));
  assert.ok(errorsFor({ related: [] }).some((error) => error.includes('at least one other')));
});

test('length uses the published word count and accepts both requested boundaries', () => {
  for (const wordCount of [900, 1500]) assert.deepEqual(errorsFor({ wordCount }), []);
  for (const wordCount of [899, 1501, undefined]) {
    assert.ok(errorsFor({ wordCount }).some((error) => error.includes('expected 900 to 1500 words')));
  }
});

test('article must finish with the existing quote link, not a missing or wrong destination', () => {
  for (const content of ['Useful article without a quote link.', `${quote}\n\nAnother section after the action.`, '[Get a free quote from Master Commercial Clean](https://example.com/contact)']) {
    assert.ok(errorsFor({ html: md.render(content) }).some((error) => error.includes('end the article with')));
  }
  assert.deepEqual(errorsFor({ html: md.render(`Useful final paragraph. ${quote}.`) }), []);
});

test('missing metadata and an empty collection fail clearly', () => {
  assert.ok(errorsFor({ category: '' }).some((error) => error.includes('missing category')));
  assert.ok(errorsFor({ description: undefined }).some((error) => error.includes('missing description')));
  assert.deepEqual(validateGuides([]), ['No Markdown guides found.']);
});
