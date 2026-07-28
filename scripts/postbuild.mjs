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
    { path: '/apply', priority: '0.5', changefreq: 'monthly' },
    // This saved-progress route must resolve on a direct visit, but it is not
    // public search content. Its canonical is /apply and it is noindexed.
    { path: '/apply/start', canonicalPath: '/apply', sitemap: false, noindex: true },
];

// Core pages are prerendered first; dynamic routes are prerendered below
// after allRoutes is fully assembled.

// These are data-only modules. Importing them directly is more reliable than
// parsing source text with a regex, which can pair one city's slug with a later
// city's `isHub` flag and produce non-routes in the sitemap.
const [{ locations }, { blogPosts }, { costGuides }] = await Promise.all([
    import(pathToFileURL(path.join(projectRoot, 'src/data/locations.js')).href),
    import(pathToFileURL(path.join(projectRoot, 'src/data/blogPosts.js')).href),
    import(pathToFileURL(path.join(projectRoot, 'src/data/costGuides.js')).href),
]);

// Service slugs
const serviceSlugs = ['commercial-cleaning', 'post-construction-cleaning', 'specialized-cleaning'];

const locationSlugs = locations.map(({ slug }) => slug);
const hubSlugs = locations.filter(({ isHub }) => isHub).map(({ slug }) => slug);
const blogSlugs = blogPosts.map(({ slug }) => slug);
const costGuideSlugs = costGuides.map(({ slug }) => slug);

// Build all sitemap routes
const allRoutes = prerenderRoutes.filter((route) => route.sitemap !== false);
const nonSitemapRoutes = prerenderRoutes.filter((route) => route.sitemap === false);

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

const uniqueRoutes = [...new Map(allRoutes.map((route) => [route.path, route])).values()];
if (uniqueRoutes.length !== allRoutes.length) {
    throw new Error('Duplicate sitemap routes detected. Every sitemap URL must be unique.');
}

// Prerender sitemap routes to static HTML. A route is accepted only when its
// own SSR output carries the matching canonical URL, preventing client-side
// redirect shells or invalid routes from being advertised as indexable pages.
let prerenderSuccess = 0;
let prerenderFail = 0;
const successfulRoutes = [];
for (const route of [...uniqueRoutes, ...nonSitemapRoutes]) {
    try {
        const rendered = render(route.path);
        const canonicalUrl = new URL(route.canonicalPath || route.path, SITE_URL).toString();
        const canonicalTag = rendered.head.match(/<link\b[^>]*\brel="canonical"[^>]*>/)?.[0];
        if (!canonicalTag || !canonicalTag.includes(`href="${canonicalUrl}"`)) {
            throw new Error(`missing matching canonical tag for ${route.path}`);
        }
        if (route.noindex && !rendered.head.includes('noindex')) {
            throw new Error(`missing noindex directive for ${route.path}`);
        }
        const outputFile = getOutputFile(route.path);
        await fs.mkdir(path.dirname(outputFile), { recursive: true });
        await fs.writeFile(outputFile, injectMarkup(template, rendered), 'utf8');
        prerenderSuccess++;
        if (route.sitemap !== false) successfulRoutes.push(route);
    } catch (e) {
        prerenderFail++;
        console.warn(`Warning: Failed to prerender ${route.path}:`, e.message);
    }
}
console.log(`Prerendered ${prerenderSuccess} pages (${prerenderFail} failed)`);

if (prerenderFail > 0) {
    throw new Error('Refusing to generate a sitemap because one or more routes are not canonical, indexable pages.');
}

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${successfulRoutes.map((route) => `  <url>
    <loc>${new URL(route.path, SITE_URL).toString()}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
console.log(`Sitemap generated with ${successfulRoutes.length} URLs`);

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
