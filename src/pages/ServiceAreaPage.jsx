import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import FAQAccordion from '../components/FAQAccordion';
import ContactSection from '../components/ContactSection';
import { getLocationBySlug, locations } from '../data/locations';
import { servicePages } from '../data/servicePages';
import {
    buildBaseSchemas,
    buildBreadcrumbSchema,
    buildFaqSchema,
    buildWebPageSchema,
} from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const ServiceAreaPage = ({ slug }) => {
    const location = getLocationBySlug(slug);
    if (!location) return <Navigate to="/service-areas" replace />;

    const path = `/service-areas/${location.slug}`;
    const nearbyLocations = (location.nearbyAreas || [])
        .map((s) => locations.find((l) => l.slug === s))
        .filter(Boolean)
        .slice(0, 8);

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title={location.metaTitle}
                description={location.metaDescription}
                path={path}
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path, title: location.metaTitle, description: location.metaDescription }),
                    buildBreadcrumbSchema([
                        { name: 'Home', path: '/' },
                        { name: 'Service Areas', path: '/service-areas' },
                        { name: `${location.name}, TX`, path },
                    ]),
                    buildFaqSchema(location.faqs, path),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        {location.regionName} &middot; {location.county}
                    </motion.p>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.05, marginBottom: '1.5rem' }}
                    >
                        Commercial Cleaning in <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>{location.name}, TX</span>
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', maxWidth: '760px' }}
                    >
                        {location.intro[0]}
                    </motion.p>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[
                        { name: 'Home', path: '/' },
                        { name: 'Service Areas', path: '/service-areas' },
                        { name: `${location.name}, TX`, path },
                    ]} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
                        <div>
                            {location.intro.slice(1).map((para, i) => (
                                <p key={i} style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                                    {para}
                                </p>
                            ))}

                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginTop: '2rem', marginBottom: '1rem' }}>
                                Local Insights for {location.name}
                            </h2>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                {location.localInsights.map((insight, i) => (
                                    <li key={i} style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--orange)', flexShrink: 0 }}>&#9656;</span>
                                        <span>{insight}</span>
                                    </li>
                                ))}
                            </ul>

                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                                Common Projects in {location.name}
                            </h2>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                {location.commonProjects.map((project, i) => (
                                    <li key={i} style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--orange)' }}>&#8226;</span>
                                        <span>{project}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--orange)', marginBottom: '2rem' }}>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1.5rem' }}>
                                    Services in {location.name}
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {servicePages.map((service) => (
                                        <Link
                                            key={service.slug}
                                            to={`/service-areas/${location.slug}/${service.slug}`}
                                            style={{
                                                display: 'block',
                                                padding: '1.25rem',
                                                backgroundColor: 'var(--off-white)',
                                                textDecoration: 'none',
                                                borderLeft: '3px solid var(--navy)',
                                                transition: 'transform 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                        >
                                            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                {service.navLabel} <span style={{ color: 'var(--orange)' }}>&rarr;</span>
                                            </h3>
                                            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                                                {service.navLabel} in {location.name}, TX
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {nearbyLocations.length > 0 && (
                                <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--navy)' }}>
                                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                                        Nearby Service Areas
                                    </h2>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {nearbyLocations.map((loc) => (
                                            <Link
                                                key={loc.slug}
                                                to={`/service-areas/${loc.slug}`}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: 'var(--off-white)',
                                                    textDecoration: 'none',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.9rem',
                                                    color: 'var(--navy)',
                                                    fontWeight: 500,
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--orange)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--off-white)'}
                                            >
                                                {loc.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--white)', borderTop: '3px solid var(--navy)' }}>
                                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                                    Quick Facts
                                </h3>
                                <ul style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <li>County: {location.county}</li>
                                    <li>Population: {location.population}</li>
                                    <li>Region: {location.regionName}</li>
                                    <li>Distance: {location.distanceFromHQ}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <FAQAccordion
                        faqs={location.faqs}
                        title={`Commercial Cleaning FAQ for ${location.name}, TX`}
                    />
                </div>
            </section>

            <ContactSection
                heading={`Get a Free Cleaning Estimate in ${location.name}`}
                subheading={`Master Commercial Clean serves businesses throughout ${location.name} and ${location.county}. Call for a free on-site walk-through and quote.`}
            />
        </div>
    );
};

export default ServiceAreaPage;
