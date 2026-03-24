import { Helmet } from 'react-helmet-async';
import {
    DEFAULT_OG_IMAGE,
    SITE_NAME,
    SITE_TAGLINE,
    buildAbsoluteUrl,
} from '../config/site';

const SEO = ({
    title,
    description,
    path = '/',
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    schemas = [],
}) => {
    const canonicalUrl = buildAbsoluteUrl(path);
    const normalizedSchemas = Array.isArray(schemas) ? schemas : [schemas];

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description || SITE_TAGLINE} />
            <meta name="twitter:image" content={image} />

            {normalizedSchemas.filter(Boolean).map((schema, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;
