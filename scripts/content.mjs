import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import MarkdownIt from 'markdown-it';

export const ROOT = path.resolve(import.meta.dirname, '..');
export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const md = new MarkdownIt({ html: false, linkify: false, typographer: false });

export async function loadGuides() {
  const dir = path.join(ROOT, 'content/guides');
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.md')).sort();
  const guides = await Promise.all(files.map(async (file) => {
    const source = await fs.readFile(path.join(dir, file), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!frontmatter) throw new Error(`${file}: missing YAML frontmatter`);
    const data = parseYaml(frontmatter[1], { maxAliasCount: 0, uniqueKeys: true });
    const rawContent = source.slice(frontmatter[0].length);
    const content = rawContent.replace(/<!--[\s\S]*?-->/g, '');
    const slug = file.slice(0, -3);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid guide slug: ${file}`);
    for (const key of ['title', 'description', 'date', 'category']) {
      if (typeof data[key] !== 'string' || !data[key].trim()) throw new Error(`${file}: missing ${key}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(Date.parse(data.date))) throw new Error(`${file}: invalid date`);
    const toc = [];
    const ids = new Set();
    const tokens = md.parse(content, {});
    tokens.forEach((token, index) => {
      if (token.type !== 'heading_open') return;
      const text = tokens[index + 1].content;
      const base = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      let id = base;
      for (let suffix = 2; ids.has(id); suffix++) id = `${base}-${suffix}`;
      ids.add(id);
      token.attrSet('id', id);
      if (token.tag === 'h2') toc.push({ id, text });
    });
    const wordCount = content.replace(/\[[^\]]*\]\([^)]*\)/g, (s) => s.slice(1, s.indexOf(']'))).split(/\s+/).filter(Boolean).length;
    return { ...data, slug, content, html: md.renderer.render(tokens, md.options, {}), toc, wordCount };
  }));
  const slugs = new Set(guides.map((guide) => guide.slug));
  for (const guide of guides) {
    if (!Array.isArray(guide.related) || guide.related.some((slug) => !slugs.has(slug) || slug === guide.slug)) throw new Error(`${guide.slug}: invalid related guides`);
  }
  return guides.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export async function loadCities() {
  const dir = path.join(ROOT, 'content/cities');
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.json')).sort();
  return Promise.all(files.map(async (file) => {
    const city = JSON.parse(await fs.readFile(path.join(dir, file), 'utf8'));
    const slug = file.slice(0, -5);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid city slug: ${file}`);
    for (const key of ['name', 'description', 'intro', 'partnerStatus']) {
      if (typeof city[key] !== 'string' || !city[key]) throw new Error(`${file}: missing ${key}`);
    }
    for (const key of ['suburbs', 'buildingTypes', 'sections']) {
      if (!Array.isArray(city[key]) || !city[key].length) throw new Error(`${file}: missing ${key}`);
    }
    return { ...city, slug };
  }));
}
