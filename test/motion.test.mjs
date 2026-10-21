import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { installSiteMotion } from '../src/lib/siteMotion.js';

class Events {
  listeners = new Map();

  addEventListener(name, handler) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(handler);
  }

  removeEventListener(name, handler) {
    this.listeners.get(name)?.delete(handler);
  }

  dispatch(name, event = {}) {
    for (const handler of this.listeners.get(name) || []) handler(event);
  }

  listenerCount() {
    return [...this.listeners.values()].reduce((count, handlers) => count + handlers.size, 0);
  }
}

class Element extends Events {
  constructor(tag = 'div', attributes = {}) {
    super();
    this.tag = tag;
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.parentElement = null;
    this.style = { overflow: '' };
    this.animations = [];
    this.open = false;
  }

  append(child) {
    child.parentElement = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
    return child;
  }

  remove() {
    this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
    this.parentElement = null;
  }

  get isConnected() {
    return this === this.ownerDocument?.body || Boolean(this.parentElement?.isConnected);
  }

  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }

  matches(selector) {
    return selector.split(',').some((part) => {
      const value = part.trim();
      if (value.startsWith('[')) return this.attributes.has(value.slice(1, -1));
      if (value.startsWith('.')) return (this.getAttribute('class') || '').split(' ').includes(value.slice(1));
      return this.tag === value;
    });
  }

  closest(selector) {
    if (this.matches(selector)) return this;
    return this.parentElement?.closest(selector) ?? null;
  }

  contains(target) {
    return target === this || this.children.some((child) => child.contains(target));
  }

  querySelectorAll(selector) {
    const found = [];
    for (const child of this.children) {
      if (child.matches(selector)) found.push(child);
      found.push(...child.querySelectorAll(selector));
    }
    return found;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }

  getBoundingClientRect() {
    const height = this.visualHeight ?? (this.tag === 'details' ? (this.open ? 180 : 50) : 48);
    const top = this.top ?? 1000;
    return { top, bottom: this.bottom ?? top + height, height };
  }

  animate(frames, options) {
    const owner = this;
    const animation = {
      frames, options, cancelled: false,
      cancel() { this.cancelled = true; delete owner.visualHeight; },
      finish() { if (!this.cancelled) this.onfinish?.(); },
    };
    this.animations.push(animation);
    return animation;
  }
}

function browser({ reducedMotion = false, intersectionObserver = true } = {}) {
  const doc = new Events();
  const view = new Events();
  const preference = new Events();
  preference.matches = reducedMotion;
  preference.set = (value) => { preference.matches = value; preference.dispatch('change'); };
  view.matchMedia = () => preference;
  view.innerHeight = 800;
  view.getComputedStyle = () => ({ borderTopWidth: '1px', borderBottomWidth: '1px' });
  const frames = new Map();
  let frameId = 0;
  view.requestAnimationFrame = (callback) => { frames.set(++frameId, callback); return frameId; };
  view.cancelAnimationFrame = (id) => frames.delete(id);
  const observers = [];
  if (intersectionObserver) {
    view.IntersectionObserver = class {
      constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
      observe(element) { this.targets.add(element); }
      unobserve(element) { this.targets.delete(element); }
      disconnect() { this.targets.clear(); this.disconnected = true; }
      enter(...elements) { this.callback(elements.map((target) => ({ target, isIntersecting: true }))); }
    };
  }
  const mutations = [];
  view.MutationObserver = class {
    constructor(callback) { this.callback = callback; mutations.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  };
  doc.defaultView = view;
  doc.body = new Element('body');
  doc.body.ownerDocument = doc;
  doc.querySelectorAll = (selector) => doc.body.querySelectorAll(selector);
  return {
    doc, view, preference, frames, observers, mutations,
    add: (attributes = {}, parent = doc.body, tag = 'div') => parent.append(new Element(tag, attributes)),
    mutate() { for (const observer of mutations) observer.callback([]); },
    flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback()); },
    click(summary, target = summary) {
      const event = { target, prevented: false, preventDefault() { this.prevented = true; } };
      summary.dispatch('click', event);
      return event;
    },
  };
}

test('motion safely leaves content alone when no DOM is available', () => {
  for (const root of [undefined, null, {}, { querySelectorAll() { throw new Error('No view'); } }]) {
    const dispose = installSiteMotion(root);
    assert.equal(typeof dispose, 'function');
    assert.doesNotThrow(dispose);
  }
});

test('reduced motion and browsers without observers keep content readable', () => {
  for (const options of [{ reducedMotion: true }, { intersectionObserver: false }]) {
    const page = browser(options);
    const heading = page.add({ 'data-motion': 'rise' }, page.doc.body, 'h2');
    const dispose = installSiteMotion(page.doc);
    assert.equal(heading.animations.length, 0);
    assert.equal(heading.style.opacity, undefined);
    assert.equal(heading.style.visibility, undefined);
    assert.equal(heading.getAttribute('hidden'), null);
    assert.equal(page.observers[0]?.targets.size ?? 0, 0);
    dispose();
  }
});

test('content reveals once, while intro content keeps its first paint animation', () => {
  const page = browser();
  const card = page.add({ 'data-motion': 'rise' });
  const intro = page.add({ 'data-motion-intro': '', 'data-motion-group': '' });
  const heading = page.add({ 'data-motion': 'rise' }, intro, 'h1');
  const passed = page.add({ 'data-motion': 'rise' });
  passed.bottom = -10;
  const dispose = installSiteMotion(page.doc);
  const observer = page.observers[0];
  assert.ok(observer.targets.has(card));
  assert.ok(!observer.targets.has(heading), 'Do not hide or replay a hero after hydration');
  observer.enter(card, passed);
  assert.equal(card.animations.length, 1);
  assert.equal(passed.animations.length, 0, 'Do not replay content already scrolled past');
  assert.ok(!observer.targets.has(card));
  card.animations[0].finish();
  observer.enter(card);
  assert.equal(card.animations.length, 1, 'Scrolling back must leave revealed content steady');
  assert.equal(card.style.opacity, undefined, 'Native effects must not rewrite rendered inline attributes');
  assert.ok(card.animations[0].cancelled, 'Release finished animation effects');
  dispose();
});

test('initially visible server content is never hidden again during hydration', () => {
  const page = browser();
  const heading = page.add({ 'data-motion': 'rise' }, page.doc.body, 'h2');
  heading.top = 150;
  const dispose = installSiteMotion(page.doc);
  assert.ok(!page.observers[0].targets.has(heading));
  page.observers[0].enter(heading);
  page.mutate();
  page.flush();
  assert.equal(heading.animations.length, 0, 'Already visible content must not flash out after the page paints');
  assert.equal(heading.style.opacity, undefined);
  dispose();
});

test('long card grids have a short capped stagger', () => {
  const page = browser();
  const group = page.add({ 'data-motion-group': '' });
  const cards = Array.from({ length: 9 }, () => page.add({ 'data-motion': 'rise' }, group));
  const dispose = installSiteMotion(page.doc);
  page.observers[0].enter(...cards);
  const delays = cards.map((card) => card.animations[0].options.delay);
  assert.equal(delays[0], 0);
  assert.ok(delays[1] > delays[0]);
  assert.ok(Math.max(...delays) <= 210, 'A large list should not delay its final cards for seconds');
  assert.equal(delays.at(-1), delays.at(-2));
  dispose();
});

test('dynamic cards are discovered and removed content releases effects and observers', () => {
  const page = browser();
  const first = page.add({ 'data-motion': 'rise' });
  const dispose = installSiteMotion(page.doc);
  const next = page.add({ 'data-motion': 'rise' });
  page.mutate();
  page.mutate();
  assert.equal(page.frames.size, 1, 'Batch a filter update into a single scan');
  page.flush();
  const observer = page.observers[0];
  assert.ok(observer.targets.has(next), 'Filtered or newly inserted cards need entrances too');
  observer.enter(first);
  first.remove();
  next.remove();
  page.mutate();
  page.flush();
  assert.ok(first.animations[0].cancelled);
  assert.equal(observer.targets.size, 0);
  page.mutate();
  dispose();
  assert.equal(page.frames.size, 0);
  assert.ok(observer.disconnected && page.mutations[0].disconnected);
  assert.equal(page.doc.listenerCount() + page.view.listenerCount() + page.preference.listenerCount(), 0);
});

test('an observer delivery already queued before cleanup cannot restart motion', () => {
  const page = browser();
  const card = page.add({ 'data-motion': 'rise' });
  const dispose = installSiteMotion(page.doc);
  const observer = page.observers[0];
  assert.ok(observer.targets.has(card));
  dispose();
  // Disconnecting an observer does not retract an entry already queued by the browser.
  observer.enter(card);
  assert.equal(card.animations.length, 0, 'Disposed pages must not start new effects');
  assert.equal(page.frames.size, 0);
});

test('keyboard focus and a reduced motion change finish effects without hiding content', () => {
  const page = browser();
  const card = page.add({ 'data-motion': 'rise' });
  const link = page.add({}, card, 'a');
  const second = page.add({ 'data-motion': 'rise' });
  const dispose = installSiteMotion(page.doc);
  page.doc.dispatch('focusin', { target: link });
  page.observers[0].enter(card, second);
  assert.equal(card.animations.length, 0, 'Focused content must remain stable and readable');
  assert.equal(second.animations.length, 1);
  page.preference.set(true);
  assert.ok(second.animations[0].cancelled);
  assert.equal(page.observers[0].targets.size, 0);
  assert.equal(second.style.opacity, undefined);
  dispose();
});

test('accordion rapid reversal ends in the last requested state and restores natural sizing', () => {
  const page = browser();
  const details = page.add({ class: 'mcc-faq-item' }, page.doc.body, 'details');
  details.style.overflow = 'clip';
  const summary = page.add({}, details, 'summary');
  const dispose = installSiteMotion(page.doc);
  assert.ok(page.click(summary).prevented);
  const opening = details.animations.at(-1);
  details.visualHeight = 112;
  page.click(summary);
  const closing = details.animations.at(-1);
  assert.ok(opening.cancelled);
  assert.equal(closing.frames[0].height, '112px', 'Reverse from the current rendered size');
  closing.finish();
  delete details.visualHeight;
  assert.equal(details.open, false);
  assert.equal(details.style.overflow, 'clip');
  assert.equal(details.getAttribute('data-closing'), null);
  page.click(summary);
  page.click(summary);
  page.click(summary);
  details.animations.at(-1).finish();
  assert.equal(details.open, true);
  assert.equal(details.style.overflow, 'clip');
  page.click(summary);
  dispose();
  assert.equal(details.open, false, 'Cleanup must settle an in flight close');
  assert.equal(details.style.overflow, 'clip');
  assert.equal(summary.listenerCount(), 0);
  assert.ok(details.animations.every((animation) => animation.cancelled));
});

test('accordion respects reduced motion and preserves nested controls', () => {
  const page = browser();
  const details = page.add({ class: 'mcc-accordion-item' }, page.doc.body, 'details');
  const summary = page.add({}, details, 'summary');
  const button = page.add({}, summary, 'button');
  const dispose = installSiteMotion(page.doc);
  assert.ok(!page.click(summary, button).prevented);
  assert.equal(details.animations.length, 0);
  page.click(summary);
  page.preference.set(true);
  assert.equal(details.open, true);
  assert.equal(details.style.overflow, '');
  assert.ok(details.animations[0].cancelled);
  assert.ok(!page.click(summary).prevented, 'Let the native details behavior handle reduced motion');
  dispose();
});

test('built pages keep hero content readable and static resource motion lightweight', async () => {
  for (const route of ['about', 'services', 'commercial-cleaning', 'service-areas', 'service-areas/san-angelo', 'contact', 'blog']) {
    const html = await fs.readFile(new URL(`../dist/${route}/index.html`, import.meta.url), 'utf8');
    const hero = html.match(/<section\b[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(hero?.includes('data-motion-intro'), `${route} needs an initial entrance without a hydration hide`);
    assert.match(hero, /<h1\b[^>]*data-motion="rise"/);
    for (const element of hero.matchAll(/<[^>]*data-motion="rise"[^>]*>/g)) {
      assert.doesNotMatch(element[0], /style="[^"]*(?:opacity:\s*0(?:;|\b)|visibility:\s*hidden)/, `${route} must not ship hidden text`);
    }
  }
  for (const route of ['guides', 'partner-network', 'partner-network/greater-houston']) {
    const html = await fs.readFile(new URL(`../dist/${route}/index.html`, import.meta.url), 'utf8');
    const external = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((match) => match[1]);
    assert.ok(external.includes('/site-motion.js'), `${route} should share the small native motion module`);
    assert.ok(external.every((src) => ['/site-motion.js', '/network-form.js'].includes(src)), `${route} must not acquire a React or animation framework bundle`);
    assert.match(html, /href="\/motion\.css"/);
  }
  const engine = await fs.stat(new URL('../dist/site-motion.js', import.meta.url));
  assert.ok(engine.size < 12 * 1024, 'Static pages need only a small shared animation enhancement');
});
