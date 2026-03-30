import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactSection from '../components/ContactSection';
import { costGuides } from '../data/costGuides';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const GuidesIndex = () => {
    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Commercial Cleaning Cost Guides | Master Commercial Clean"
                description="Understand what affects commercial cleaning costs in West Texas. Free budgeting guides for all services."
                path="/guides"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/guides', title: 'Commercial Cleaning Cost Guides', description: 'Budgeting guides for commercial cleaning services in West Texas.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }]),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        Budgeting Resources
                    </motion.p>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05, marginBottom: '1.5rem' }}
                    >
                        Cost <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Guides</span>
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', maxWidth: '760px' }}
                    >
                        Understand what goes into commercial cleaning pricing. These guides cover factors that affect cost, what to expect in a quote, and how to budget for professional janitorial services.
                    </motion.p>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }]} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {costGuides.map((guide) => (
                            <Link
                                key={guide.slug}
                                to={`/guides/${guide.slug}`}
                                style={{
                                    display: 'block',
                                    backgroundColor: 'var(--white)',
                                    padding: '2.5rem',
                                    textDecoration: 'none',
                                    borderTop: '3px solid var(--navy)',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(2,24,43,0.08)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                                    {guide.title}
                                </h2>
                                <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                    {guide.intro}
                                </p>
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--orange)' }}>
                                    Read Guide &rarr;
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection heading="Need a Custom Quote?" subheading="Every facility is different. Call for a free walk-through and personalized estimate for your West Texas business." />
        </div>
    );
};

export default GuidesIndex;
