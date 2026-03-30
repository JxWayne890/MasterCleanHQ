import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import FAQAccordion from '../components/FAQAccordion';
import ContactSection from '../components/ContactSection';
import { getLocationBySlug, locations } from '../data/locations';
import { servicePages, getServicePageBySlug } from '../data/servicePages';
import {
    buildBaseSchemas,
    buildBreadcrumbSchema,
    buildFaqSchema,
    buildLocalServiceSchema,
    buildWebPageSchema,
} from '../seo/schemas';
import { PHONE_DISPLAY, PHONE_E164 } from '../config/site';
import { ENABLE_MOTION } from '../lib/motion';

const ComboPage = ({ citySlug, serviceSlug }) => {
    const location = getLocationBySlug(citySlug);
    const service = getServicePageBySlug(serviceSlug);
    if (!location || !service) return <Navigate to="/service-areas" replace />;

    const path = `/service-areas/${location.slug}/${service.slug}`;
    const title = `${service.navLabel} in ${location.name}, TX`;
    const metaTitle = `${service.navLabel} in ${location.name}, TX | Master Commercial Clean`;
    const metaDescription = `Professional ${service.navLabel.toLowerCase()} services in ${location.name}, ${location.county}. Serving businesses across the ${location.regionName}. Call (325) 249-5191.`;

    const otherServicesInCity = servicePages.filter((s) => s.slug !== service.slug);
    const otherCitiesForService = locations
        .filter((l) => l.slug !== location.slug && l.isHub)
        .slice(0, 5);
    const nearbyForService = (location.nearbyAreas || [])
        .map((s) => locations.find((l) => l.slug === s))
        .filter(Boolean)
        .slice(0, 6);

    const comboFaqs = [
        {
            question: `How much does ${service.navLabel.toLowerCase()} cost in ${location.name}?`,
            answer: `${service.navLabel} costs in ${location.name} depend on facility size, scope of work, and cleaning frequency. Master Commercial Clean provides free on-site estimates for ${location.name} businesses. Call ${PHONE_DISPLAY} to schedule a walk-through.`,
        },
        {
            question: `Does Master Commercial Clean offer ${service.navLabel.toLowerCase()} in ${location.name}, TX?`,
            answer: `Yes. Master Commercial Clean provides full ${service.navLabel.toLowerCase()} services throughout ${location.name} and surrounding ${location.county} communities. We serve businesses of all sizes with customized cleaning plans.`,
        },
        {
            question: `How quickly can you start ${service.navLabel.toLowerCase()} in ${location.name}?`,
            answer: `In most cases, we can begin service within 48 hours of the initial consultation. For ${location.name} businesses, we schedule a walk-through, provide a detailed quote, and start service as soon as the scope is confirmed.`,
        },
    ];

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title={metaTitle}
                description={metaDescription}
                path={path}
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path, title: metaTitle, description: metaDescription }),
                    buildBreadcrumbSchema([
                        { name: 'Home', path: '/' },
                        { name: 'Service Areas', path: '/service-areas' },
                        { name: `${location.name}, TX`, path: `/service-areas/${location.slug}` },
                        { name: service.navLabel, path },
                    ]),
                    buildLocalServiceSchema({
                        serviceName: service.navLabel,
                        serviceSlug: service.slug,
                        cityName: location.name,
                        citySlug: location.slug,
                        description: metaDescription,
                    }),
                    buildFaqSchema(comboFaqs, path),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        {service.eyebrow} &middot; {location.name}, TX
                    </motion.p>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.05, marginBottom: '1.5rem' }}
                    >
                        {service.navLabel} in <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>{location.name}</span>
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', maxWidth: '760px' }}
                    >
                        Master Commercial Clean provides professional {service.navLabel.toLowerCase()} for businesses in {location.name}, {location.county}. {service.answer}
                    </motion.p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                        <a href={`tel:${PHONE_E164}`} style={{ backgroundColor: 'var(--orange)', color: 'var(--white)', padding: '1rem 2rem', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                            Call {PHONE_DISPLAY}
                        </a>
                        <a href="/#contact" style={{ color: 'var(--white)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.35)', paddingBottom: '4px', fontFamily: 'var(--font-sans)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                            Request a Quote
                        </a>
                    </div>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[
                        { name: 'Home', path: '/' },
                        { name: 'Service Areas', path: '/service-areas' },
                        { name: `${location.name}, TX`, path: `/service-areas/${location.slug}` },
                        { name: service.navLabel, path },
                    ]} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                                {service.navLabel} Services for {location.name} Businesses
                            </h2>
                            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                {service.intro}
                            </p>
                            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                {location.intro[1] || location.intro[0]}
                            </p>

                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginTop: '2rem', marginBottom: '1rem' }}>
                                What&apos;s Included
                            </h2>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                {service.bullets.map((item, i) => (
                                    <li key={i} style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--orange)' }}>&#8226;</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                                Industries Served in {location.name}
                            </h2>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                {service.industries.map((item, i) => (
                                    <li key={i} style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--orange)' }}>&#8226;</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            {location.localInsights.length > 0 && (
                                <>
                                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                                        Local Considerations in {location.name}
                                    </h2>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {location.localInsights.slice(0, 3).map((insight, i) => (
                                            <li key={i} style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: '0.75rem' }}>
                                                <span style={{ color: 'var(--orange)' }}>&#9656;</span>
                                                <span>{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        <div>
                            <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--orange)', marginBottom: '2rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                    Other Services in {location.name}
                                </h3>
                                {otherServicesInCity.map((s) => (
                                    <Link key={s.slug} to={`/service-areas/${location.slug}/${s.slug}`} style={{ display: 'block', padding: '1rem', marginBottom: '0.5rem', backgroundColor: 'var(--off-white)', textDecoration: 'none', borderLeft: '3px solid var(--navy)', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                    >
                                        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--navy)', fontSize: '0.95rem' }}>
                                            {s.navLabel} in {location.name} <span style={{ color: 'var(--orange)' }}>&rarr;</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--navy)', marginBottom: '2rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                    {service.navLabel} in Other Cities
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {[...otherCitiesForService, ...nearbyForService].slice(0, 8).map((loc) => (
                                        <Link key={loc.slug} to={`/service-areas/${loc.slug}/${service.slug}`} style={{
                                            fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--navy)', textDecoration: 'none', padding: '0.5rem 0', borderBottom: '1px solid rgba(2,24,43,0.06)', transition: 'color 0.2s',
                                        }}
                                            onMouseEnter={(e) => e.target.style.color = 'var(--orange)'}
                                            onMouseLeave={(e) => e.target.style.color = 'var(--navy)'}
                                        >
                                            {service.navLabel} in {loc.name}, TX &rarr;
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--navy)' }}>
                                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                                    Related Pages
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <Link to={`/${service.slug}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--navy)', textDecoration: 'none' }}>
                                        {service.navLabel} Overview &rarr;
                                    </Link>
                                    <Link to={`/service-areas/${location.slug}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--navy)', textDecoration: 'none' }}>
                                        All Services in {location.name} &rarr;
                                    </Link>
                                    <Link to={`/guides/${service.slug}-cost`} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--navy)', textDecoration: 'none' }}>
                                        {service.navLabel} Cost Guide &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <FAQAccordion faqs={comboFaqs} title={`${service.navLabel} FAQ for ${location.name}, TX`} />
                </div>
            </section>

            <ContactSection
                heading={`Get ${service.navLabel} in ${location.name}`}
                subheading={`Request a free estimate for ${service.navLabel.toLowerCase()} services in ${location.name}, TX. Call or fill out our contact form.`}
            />
        </div>
    );
};

export default ComboPage;
