import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import FAQAccordion from '../components/FAQAccordion';
import ContactSection from '../components/ContactSection';
import { getCostGuideBySlug } from '../data/costGuides';
import { servicePages } from '../data/servicePages';
import { buildBaseSchemas, buildBreadcrumbSchema, buildFaqSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const CostGuidePage = ({ guideSlug, citySlug, location }) => {
    const guide = getCostGuideBySlug(guideSlug);
    if (!guide) return <Navigate to="/guides" replace />;

    const path = citySlug ? `/guides/${guide.slug}/${citySlug}` : `/guides/${guide.slug}`;
    const cityName = location ? `${location.name}, TX` : 'West Texas';
    const title = citySlug
        ? `${guide.title} for ${cityName} | Master Commercial Clean`
        : guide.metaTitle;
    const description = citySlug
        ? `Understand ${guide.title.toLowerCase()} factors for businesses in ${cityName}. Free estimates available. Call (325) 249-5191.`
        : guide.metaDescription;

    const cityIntro = citySlug && guide.cityIntros ? guide.cityIntros[citySlug] : null;

    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/guides' },
        { name: guide.title, path: `/guides/${guide.slug}` },
    ];
    if (citySlug && location) {
        breadcrumbs.push({ name: cityName, path });
    }

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title={title}
                description={description}
                path={path}
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path, title, description }),
                    buildBreadcrumbSchema(breadcrumbs),
                    buildFaqSchema(guide.faqs, path),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        Cost Guide {citySlug ? `\u00b7 ${cityName}` : ''}
                    </motion.p>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}
                    >
                        {guide.title} {citySlug ? <><br /><span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>in {cityName}</span></> : ''}
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', maxWidth: '760px' }}
                    >
                        {guide.intro}
                    </motion.p>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <Breadcrumbs items={breadcrumbs} />

                    {cityIntro && (
                        <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderLeft: '3px solid var(--orange)', marginBottom: '2.5rem' }}>
                            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                                {cityIntro}
                            </p>
                        </div>
                    )}

                    {guide.sections.map((section, i) => (
                        <div key={i} style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                                {section.heading}
                            </h2>
                            {section.paragraphs.map((para, j) => (
                                <p key={j} style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '1.05rem' }}>
                                    {para}
                                </p>
                            ))}
                        </div>
                    ))}

                    <FAQAccordion faqs={guide.faqs} title="Cost Guide FAQ" />

                    {/* Link to city-specific guides */}
                    {!citySlug && (
                        <div style={{ marginTop: '3rem', backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--navy)' }}>
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
                                City-Specific Cost Guides
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {['san-angelo', 'abilene', 'lubbock', 'midland', 'odessa'].map((city) => (
                                    <Link key={city} to={`/guides/${guide.slug}/${city}`} style={{
                                        padding: '0.5rem 1rem', backgroundColor: 'var(--off-white)', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 500, transition: 'background-color 0.2s',
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--orange)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--off-white)'}
                                    >
                                        {city.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}, TX
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related services */}
                    <div style={{ marginTop: '2rem', backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--orange)' }}>
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
                            Related Services & Guides
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {guide.relatedServices.map((slug) => {
                                const svc = servicePages.find((s) => s.slug === slug);
                                return svc ? (
                                    <Link key={slug} to={`/${slug}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--navy)', textDecoration: 'none' }}>
                                        {svc.navLabel} Overview &rarr;
                                    </Link>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <ContactSection
                heading="Ready for a Free Estimate?"
                subheading={`Get a detailed, no-obligation quote for ${guide.title.toLowerCase().replace(' cost guide', '')} in ${cityName}. Call or request a quote online.`}
            />
        </div>
    );
};

export default CostGuidePage;
