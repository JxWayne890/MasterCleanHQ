import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { prerenderRoutes } from '../src/config/routes.js';
import { SITE_URL } from '../src/config/site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const serverEntryFile = path.join(distDir, 'server', 'entry-server.js');

const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
const { render } = await import(pathToFileURL(serverEntryFile).href);

function injectMarkup(html, { appHtml, head }) {
    return html
        .replace('<!--app-head-->', head)
        .replace('<!--app-html-->', appHtml);
}

function getOutputFile(routePath) {
    if (routePath === '/') {
        return path.join(distDir, 'index.html');
    }

    return path.join(distDir, routePath.slice(1), 'index.html');
}

const lastmod = new Date().toISOString().split('T')[0];

for (const route of prerenderRoutes) {
    const rendered = render(route.path);
    const outputFile = getOutputFile(route.path);
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, injectMarkup(template, rendered), 'utf8');
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${prerenderRoutes.map((route) => `  <url>
    <loc>${new URL(route.path, SITE_URL).toString()}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
await fs.writeFile(
    path.join(distDir, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
    'utf8'
);

await fs.rm(path.join(distDir, 'server'), { recursive: true, force: true });
