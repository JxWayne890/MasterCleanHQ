// Note: prerenderRoutes is now defined directly in postbuild.mjs
// This file is kept for backwards compatibility but the postbuild script
// reads route data directly from the data files.

export const prerenderRoutes = [
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
];
