import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import FAQ from '../components/FAQ';
import SEO from '../components/SEO';
import { buildBaseSchemas, buildBreadcrumbSchema, buildFaqSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

// Build the FAQPage JSON-LD dynamically so it only renders on the /faq route
const faqEntries = [
    {
        question: 'What cities does Master Commercial Clean serve in West Texas?',
        answer: 'Master Commercial Clean serves major West Texas cities including San Angelo, Abilene, Lubbock, Midland, Odessa, Big Spring, Sweetwater, Snyder, Andrews, Pecos, Brady, Brownwood, Coleman, Ballinger, Lamesa, and surrounding communities.',
    },
    {
        question: 'Does Master Commercial Clean travel to remote West Texas locations?',
        answer: 'Yes. We regularly serve smaller communities and remote locations between our major service hubs. Contact us to confirm coverage and scheduling for your specific facility.',
    },
    {
        question: 'How much does commercial cleaning cost in West Texas?',
        answer: 'Pricing depends on facility size, service frequency, and scope. We provide free walk-through estimates so the quote matches the building and the cleaning plan you actually need.',
    },
    {
        question: 'Does Master Commercial Clean offer after-hours or weekend cleaning?',
        answer: 'Yes. We offer flexible scheduling including evenings, nights, weekends, and holiday windows to minimize disruption to business operations.',
    },
    {
        question: 'How quickly can Master Commercial Clean start service?',
        answer: 'In many cases we can begin service within 48 hours after the initial consultation, depending on the location, scope, and schedule required.',
    },
    {
        question: 'What types of commercial cleaning services does MCC offer?',
        answer: 'We offer recurring commercial cleaning, post-construction cleanup, and specialized cleaning for high-traffic, high-detail, or higher-sensitivity environments.',
    },
    {
        question: 'Is Master Commercial Clean licensed and insured?',
        answer: 'Yes. Our team follows professional safety and sanitation procedures and supports businesses across West Texas with insured, reliable service.',
    },
    {
        question: 'What cleaning products and equipment does MCC use?',
        answer: 'We use professional-grade cleaning products and equipment selected for the facility type, surface materials, traffic level, and sanitation needs of the space.',
    },
];

const FaqPage = () => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh', paddingBottom: '4rem' }}>
            <SEO
                title="FAQ | Commercial Cleaning Questions & Answers | Master Commercial Clean"
                description="Answers about pricing, scheduling, service areas, and cleaning quality for West Texas commercial cleaning services."
                path="/faq"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({
                        path: '/faq',
                        title: 'FAQ | Commercial Cleaning Questions & Answers | Master Commercial Clean',
                        description: 'Answers about pricing, scheduling, service areas, and cleaning quality for West Texas commercial cleaning services.',
                    }),
                    buildBreadcrumbSchema([
                        { name: 'Home', path: '/' },
                        { name: 'FAQ', path: '/faq' },
                    ]),
                    buildFaqSchema(faqEntries, '/faq'),
                ]}
            />

            {/* Minimalist Hero Section for FAQ Page */}
            <section style={{
                padding: '10rem 0 4rem',
                backgroundColor: 'var(--navy)',
                color: 'var(--white)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            lineHeight: 1.1,
                            marginBottom: '1.5rem'
                        }}
                    >
                        Frequently Asked <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Questions</span>
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1.25rem',
                            color: 'rgba(255, 255, 255, 0.8)',
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}
                    >
                        Everything you need to know about our commercial cleaning services across West Texas.
                    </motion.p>
                </div>

                {/* Decorative Background Element */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '100%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,92,0,0.05) 0%, rgba(2,24,43,0) 70%)',
                    zIndex: 1
                }} />
            </section>

            {/* Existing FAQ Component */}
            <div style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
                <FAQ />
            </div>

            {/* Related Resources — Internal Linking Block */}
            <section style={{ padding: '4rem 0 2rem' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            backgroundColor: 'var(--white)',
                            padding: '3rem',
                            borderTop: '3px solid var(--orange)'
                        }}
                    >
                        <h2 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.75rem',
                            color: 'var(--navy)',
                            marginBottom: '1.5rem'
                        }}>
                            Related Resources
                        </h2>
                        <p style={{
                            fontFamily: 'var(--font-sans)',
                            color: 'var(--text-secondary)',
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            marginBottom: '2rem'
                        }}>
                            Explore more about Master Commercial Clean's services, coverage, and how to get started.
                        </p>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {[
                                { label: 'Commercial Cleaning', to: '/commercial-cleaning', desc: 'Recurring janitorial support for offices and business facilities', kind: 'page' },
                                { label: 'Post-Construction Cleanup', to: '/post-construction-cleaning', desc: 'Detailed cleanup for remodels, build-outs, and turnovers', kind: 'page' },
                                { label: 'Specialized Cleaning', to: '/specialized-cleaning', desc: 'Custom scopes for higher-detail and higher-sensitivity environments', kind: 'page' },
                                { label: 'Get a Free Estimate', to: '/#contact', desc: 'Call or fill out our contact form', kind: 'hash' }
                            ].map((link, i) => {
                                const sharedProps = {
                                    style: {
                                        display: 'block',
                                        padding: '1.5rem',
                                        backgroundColor: 'var(--off-white)',
                                        textDecoration: 'none',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        borderLeft: '3px solid var(--navy)'
                                    },
                                    onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(2,24,43,0.08)';
                                    },
                                    onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                };

                                const content = (
                                    <>
                                        <h3 style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            color: 'var(--navy)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {link.label} <span style={{ color: 'var(--orange)' }}>→</span>
                                        </h3>
                                        <p style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-secondary)',
                                            margin: 0,
                                            lineHeight: 1.5
                                        }}>
                                            {link.desc}
                                        </p>
                                    </>
                                );

                                return link.kind === 'hash' ? (
                                    <HashLink key={i} {...sharedProps} smooth to={link.to}>
                                        {content}
                                    </HashLink>
                                ) : (
                                    <Link key={i} {...sharedProps} to={link.to}>
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default FaqPage;
