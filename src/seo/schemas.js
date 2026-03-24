import {
    PHONE_E164,
    SITE_NAME,
    SITE_URL,
    buildAbsoluteUrl,
} from '../config/site';

const organizationId = `${SITE_URL}/#organization`;
const businessId = `${SITE_URL}/#business`;
const websiteId = `${SITE_URL}/#website`;

export function buildBaseSchemas() {
    return [
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': organizationId,
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/img/logo.png`,
            telephone: PHONE_E164,
        },
        {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': businessId,
            parentOrganization: { '@id': organizationId },
            name: SITE_NAME,
            url: SITE_URL,
            image: `${SITE_URL}/img/logo.png`,
            telephone: PHONE_E164,
            priceRange: '$$',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'San Angelo',
                addressRegion: 'TX',
                postalCode: '76901',
                addressCountry: 'US',
            },
            areaServed: [
                'San Angelo',
                'Abilene',
                'Lubbock',
                'Midland',
                'Odessa',
            ],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': websiteId,
            url: SITE_URL,
            name: SITE_NAME,
            publisher: { '@id': organizationId },
        },
    ];
}

export function buildBreadcrumbSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: buildAbsoluteUrl(item.path),
        })),
    };
}

export function buildWebPageSchema({ path, title, description }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${buildAbsoluteUrl(path)}#webpage`,
        url: buildAbsoluteUrl(path),
        name: title,
        description,
        isPartOf: { '@id': websiteId },
        about: { '@id': businessId },
    };
}

export function buildServiceSchema(service) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${buildAbsoluteUrl(`/${service.slug}`)}#service`,
        serviceType: service.title,
        name: service.title,
        provider: { '@id': businessId },
        areaServed: [
            { '@type': 'City', name: 'San Angelo' },
            { '@type': 'City', name: 'Abilene' },
            { '@type': 'City', name: 'Lubbock' },
            { '@type': 'City', name: 'Midland' },
            { '@type': 'City', name: 'Odessa' },
        ],
        description: service.description,
    };
}

export function buildFaqSchema(faqs, path) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${buildAbsoluteUrl(path)}#faq`,
        url: buildAbsoluteUrl(path),
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}
