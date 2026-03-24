import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { PHONE_DISPLAY, PHONE_E164 } from '../config/site';
import { servicePages } from '../data/servicePages';
import {
    buildBaseSchemas,
    buildBreadcrumbSchema,
    buildFaqSchema,
    buildServiceSchema,
    buildWebPageSchema,
} from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const ServicePage = ({ service }) => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const relatedServices = servicePages.filter((item) => item.slug !== service.slug);
    const path = `/${service.slug}`;

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh', paddingBottom: '5rem' }}>
            <SEO
                title={service.seoTitle}
                description={service.description}
                path={path}
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({
                        path,
                        title: service.seoTitle,
                        description: service.description,
                    }),
                    buildBreadcrumbSchema([
                        { name: 'Home', path: '/' },
                        { name: service.navLabel, path },
                    ]),
                    buildServiceSchema(service),
                    buildFaqSchema(service.faqs, path),
                ]}
            />

            <section style={{
                padding: '10rem 0 4rem',
                backgroundColor: 'var(--navy)',
                color: 'var(--white)',
            }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{
                            fontFamily: 'var(--font-sans)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            color: 'var(--orange)',
                            marginBottom: '1rem',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                        }}
                    >
                        {service.eyebrow}
                    </motion.p>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{
                            fontSize: 'clamp(3rem, 6vw, 5.25rem)',
                            lineHeight: 1.05,
                            marginBottom: '1.5rem',
                        }}
                    >
                        {service.title}
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1.2rem',
                            lineHeight: 1.7,
                            color: 'rgba(255,255,255,0.82)',
                            maxWidth: '760px',
                            marginBottom: '2.5rem',
                        }}
                    >
                        {service.intro}
                    </motion.p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <HashLink
                            smooth
                            to="/#contact"
                            style={{
                                backgroundColor: 'var(--orange)',
                                color: 'var(--white)',
                                padding: '1rem 2rem',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.9rem',
                            }}
                        >
                            Request a Quote
                        </HashLink>
                        <a
                            href={`tel:${PHONE_E164}`}
                            style={{
                                color: 'var(--white)',
                                textDecoration: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.35)',
                                paddingBottom: '4px',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.9rem',
                            }}
                        >
                            Call {PHONE_DISPLAY}
                        </a>
                    </div>
                </div>
            </section>

            <section style={{ padding: '4rem 0 2rem' }}>
                <div className="container" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    alignItems: 'start',
                }}>
                    <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--orange)' }}>
                        <h2 style={{ fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                            Why businesses choose this service
                        </h2>
                        <p style={{
                            fontFamily: 'var(--font-sans)',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            marginBottom: '1.5rem',
                        }}
                        >
                            {service.summary}
                        </p>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {service.outcomes.map((item) => (
                                <li
                                    key={item}
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: 'var(--navy)',
                                        lineHeight: 1.6,
                                        display: 'flex',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <span style={{ color: 'var(--orange)' }}>•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--navy)' }}>
                        <h2 style={{ fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                            Typical scope
                        </h2>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {service.bullets.map((item) => (
                                <li
                                    key={item}
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6,
                                        display: 'flex',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <span style={{ color: 'var(--orange)' }}>•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--navy)' }}>
                        <h2 style={{ fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                            Industries supported
                        </h2>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {service.industries.map((item) => (
                                <li
                                    key={item}
                                    style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6,
                                        display: 'flex',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <span style={{ color: 'var(--orange)' }}>•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section style={{ padding: '2rem 0' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <div style={{ backgroundColor: 'var(--white)', padding: '3rem', borderTop: '3px solid var(--orange)' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                            Common questions
                        </h2>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {service.faqs.map((faq) => (
                                <div key={faq.question}>
                                    <h3 style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: 700,
                                        color: 'var(--navy)',
                                        marginBottom: '0.5rem',
                                        fontSize: '1.1rem',
                                    }}
                                    >
                                        {faq.question}
                                    </h3>
                                    <p style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.7,
                                        margin: 0,
                                    }}
                                    >
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ padding: '2rem 0 5rem' }}>
                <div className="container" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    alignItems: 'start',
                }}>
                    <div style={{ backgroundColor: 'var(--navy)', color: 'var(--white)', padding: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                            Need help choosing the right cleaning plan?
                        </h2>
                        <p style={{
                            fontFamily: 'var(--font-sans)',
                            lineHeight: 1.7,
                            color: 'rgba(255,255,255,0.82)',
                            marginBottom: '1.5rem',
                        }}
                        >
                            Tell us about your facility, timeline, and service frequency. We will recommend the right scope and schedule for your West Texas location.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <HashLink
                                smooth
                                to="/#contact"
                                style={{
                                    backgroundColor: 'var(--orange)',
                                    color: 'var(--white)',
                                    textDecoration: 'none',
                                    padding: '1rem 2rem',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 600,
                                }}
                            >
                                Start Your Quote
                            </HashLink>
                            <Link
                                to="/faq"
                                style={{
                                    color: 'var(--white)',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 600,
                                    borderBottom: '1px solid rgba(255,255,255,0.35)',
                                    paddingBottom: '4px',
                                }}
                            >
                                Read More FAQs
                            </Link>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderTop: '3px solid var(--navy)' }}>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                            Related services
                        </h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {relatedServices.map((item) => (
                                <Link
                                    key={item.slug}
                                    to={`/${item.slug}`}
                                    style={{
                                        textDecoration: 'none',
                                        paddingBottom: '1rem',
                                        borderBottom: '1px solid rgba(2,24,43,0.08)',
                                    }}
                                >
                                    <h3 style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: 700,
                                        color: 'var(--navy)',
                                        marginBottom: '0.35rem',
                                        fontSize: '1rem',
                                    }}
                                    >
                                        {item.navLabel}
                                    </h3>
                                    <p style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6,
                                        margin: 0,
                                        fontSize: '0.95rem',
                                    }}
                                    >
                                        {item.summary}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ServicePage;
