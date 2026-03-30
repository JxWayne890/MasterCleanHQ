import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactSection from '../components/ContactSection';
import { servicePages } from '../data/servicePages';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const ServicesIndex = () => {
    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Commercial Cleaning Services | Master Commercial Clean"
                description="Professional commercial cleaning, post-construction cleanup, and specialized janitorial services for West Texas businesses. Call (325) 249-5191."
                path="/services"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/services', title: 'Our Cleaning Services', description: 'Commercial cleaning services for West Texas businesses.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <motion.p initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>What We Offer</motion.p>
                    <motion.h1 initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05, marginBottom: '1.5rem' }}>
                        Our <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Services</span>
                    </motion.h1>
                    <motion.p initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} transition={ENABLE_MOTION ? { delay: 0.1 } : undefined} style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', maxWidth: '760px' }}>
                        Master Commercial Clean delivers professional janitorial services tailored to West Texas businesses. From routine cleaning to post-construction detail work, we build cleaning plans around your facility&apos;s actual needs.
                    </motion.p>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]} />

                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {servicePages.map((service, i) => (
                            <Link
                                key={service.slug}
                                to={`/${service.slug}`}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'auto 1fr',
                                    gap: '2rem',
                                    padding: '3rem',
                                    backgroundColor: 'var(--white)',
                                    textDecoration: 'none',
                                    borderLeft: '4px solid var(--orange)',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    alignItems: 'start',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(2,24,43,0.08)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--orange)', lineHeight: 1 }}>0{i + 1}</span>
                                <div>
                                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>{service.title}</h2>
                                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem', fontSize: '1.05rem' }}>{service.summary}</p>
                                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--orange)' }}>Learn More &rarr;</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection />
        </div>
    );
};

export default ServicesIndex;
