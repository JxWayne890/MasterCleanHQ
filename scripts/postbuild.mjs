import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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

// Core pages to prerender
const prerenderRoutes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/services', priority: '0.9', changefreq: 'monthly' },
    { path: '/service-areas', priority: '0.9', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    { path: '/guides', priority: '0.8', changefreq: 'monthly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/about/process', priority: '0.6', changefreq: 'monthly' },
    { path: '/about/why-choose-us', priority: '0.6', changefreq: 'monthly' },
    { path: '/reviews', priority: '0.7', changefreq: 'monthly' },
    { path: '/faq', priority: '0.8', changefreq: 'monthly' },
    { path: '/commercial-cleaning', priority: '0.9', changefreq: 'monthly' },
    { path: '/post-construction-cleaning', priority: '0.9', changefreq: 'monthly' },
    { path: '/specialized-cleaning', priority: '0.9', changefreq: 'monthly' },
    { path: '/contact', priority: '0.8', changefreq: 'monthly' },
];

// Prerender core pages
for (const route of prerenderRoutes) {
    try {
        const rendered = render(route.path);
        const outputFile = getOutputFile(route.path);
        await fs.mkdir(path.dirname(outputFile), { recursive: true });
        await fs.writeFile(outputFile, injectMarkup(template, rendered), 'utf8');
    } catch (e) {
        console.warn(`Warning: Failed to prerender ${route.path}:`, e.message);
    }
}

// Build all sitemap routes using the SSR-bundled modules
// Import from the server bundle instead of raw source (avoids Node ESM resolution issues)
const serverModule = await import(pathToFileURL(serverEntryFile).href);

// We need to read the data from the bundled server entry.
// Since we can't easily import specific exports, let's build the sitemap from the data files directly.
// Read the compiled JS to extract route data.

// Service slugs
const serviceSlugs = ['commercial-cleaning', 'post-construction-cleaning', 'specialized-cleaning'];

// Read locations from source (it's a pure data file with no problematic imports)
const locationsContent = await fs.readFile(path.join(projectRoot, 'src/data/locations.js'), 'utf8');
const locationSlugsMatch = locationsContent.matchAll(/slug:\s*'([^']+)'/g);
const locationSlugs = [...locationSlugsMatch].map(m => m[1]);
const hubSlugsMatch = locationsContent.matchAll(/slug:\s*'([^']+)'[\s\S]*?isHub:\s*true/g);
const hubSlugs = [...hubSlugsMatch].map(m => m[1]);

// Read blog posts slugs
const blogContent = await fs.readFile(path.join(projectRoot, 'src/data/blogPosts.js'), 'utf8');
const blogSlugsMatch = blogContent.matchAll(/slug:\s*'([^']+)'/g);
const blogSlugs = [...blogSlugsMatch].map(m => m[1]);

// Read cost guide slugs
const costContent = await fs.readFile(path.join(projectRoot, 'src/data/costGuides.js'), 'utf8');
const costSlugsMatch = costContent.matchAll(/slug:\s*'([^']+)'/g);
const costGuideSlugs = [...costSlugsMatch].map(m => m[1]);

// Build all sitemap routes
const allRoutes = [...prerenderRoutes];

// Service area pages
locationSlugs.forEach(slug => {
    allRoutes.push({
        path: `/service-areas/${slug}`,
        priority: hubSlugs.includes(slug) ? '0.8' : '0.6',
        changefreq: 'monthly',
    });
});

// Combo pages (service + city)
locationSlugs.forEach(citySlug => {
    serviceSlugs.forEach(serviceSlug => {
        allRoutes.push({
            path: `/service-areas/${citySlug}/${serviceSlug}`,
            priority: hubSlugs.includes(citySlug) ? '0.7' : '0.5',
            changefreq: 'monthly',
        });
    });
});

// Blog posts
blogSlugs.forEach(slug => {
    allRoutes.push({
        path: `/blog/${slug}`,
        priority: '0.6',
        changefreq: 'monthly',
    });
});

// Cost guides
costGuideSlugs.forEach(slug => {
    allRoutes.push({
        path: `/guides/${slug}`,
        priority: '0.7',
        changefreq: 'monthly',
    });
    // City-specific for hubs
    hubSlugs.forEach(citySlug => {
        allRoutes.push({
            path: `/guides/${slug}/${citySlug}`,
            priority: '0.5',
            changefreq: 'monthly',
        });
    });
});

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((route) => `  <url>
    <loc>${new URL(route.path, SITE_URL).toString()}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
console.log(`Sitemap generated with ${allRoutes.length} URLs`);

// Generate enhanced robots.txt
await fs.writeFile(
    path.join(distDir, 'robots.txt'),
    `User-agent: *
Allow: /

# AI Crawlers Welcome
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
    'utf8'
);

// Copy llms.txt to dist if it exists
try {
    const llmsSrc = path.join(projectRoot, 'public', 'llms.txt');
    await fs.access(llmsSrc);
    await fs.copyFile(llmsSrc, path.join(distDir, 'llms.txt'));
    console.log('llms.txt copied to dist');
} catch {
    // llms.txt doesn't exist in public, that's fine
}

await fs.rm(path.join(distDir, 'server'), { recursive: true, force: true });
console.log('Postbuild complete');
