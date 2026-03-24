import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';

const faqData = [
    {
        category: 'Service Coverage',
        questions: [
            {
                q: 'What cities does Master Commercial Clean serve in West Texas?',
                a: 'Master Commercial Clean serves all major West Texas cities including San Angelo, Abilene, Lubbock, Midland, Odessa, Big Spring, Sweetwater, Snyder, Andrews, Pecos, Brady, Brownwood, Coleman, Ballinger, Lamesa, and all surrounding communities across the Concho Valley, Permian Basin, South Plains, and Big Country regions.',
                link: { to: '/#service-areas', text: 'View all service areas' }
            },
            {
                q: 'Does Master Commercial Clean travel to remote West Texas locations?',
                a: 'Yes. We regularly serve businesses in smaller communities and remote West Texas locations between our major service hubs. If your facility is within the region, contact us at (325) 249-5191 to confirm service availability and scheduling for your area.',
                link: { to: '/#contact', text: 'Contact us to confirm your area' }
            }
        ]
    },
    {
        category: 'Pricing & Scheduling',
        questions: [
            {
                q: 'How much does commercial cleaning cost in West Texas?',
                a: 'Commercial cleaning costs in West Texas vary based on facility size, cleaning frequency, and service type. Master Commercial Clean provides free, no-obligation walk-through estimates for every business. Most offices between 1,000–5,000 sq ft can expect competitive monthly rates. Contact us at (325) 249-5191 for a custom quote.',
                link: { to: '/#contact', text: 'Request a free quote' }
            },
            {
                q: 'Does Master Commercial Clean offer after-hours or weekend cleaning?',
                a: 'Yes. Master Commercial Clean offers flexible scheduling including evenings, nights, weekends, and holidays to minimize disruption to your business operations. We work around your schedule across all our West Texas service areas, from San Angelo to Lubbock to Odessa.'
            },
            {
                q: 'How quickly can Master Commercial Clean start service?',
                a: 'In most West Texas cities, Master Commercial Clean can begin service within 48 hours of your initial consultation. Emergency and same-day cleaning is available for urgent situations such as post-event cleanup or unexpected inspections. Call (325) 249-5191 to discuss your timeline.'
            }
        ]
    },
    {
        category: 'Services & Quality',
        questions: [
            {
                q: 'What types of commercial cleaning services does MCC offer?',
                a: 'Master Commercial Clean offers three core services: routine commercial cleaning for offices, retail stores, and corporate environments; post-construction cleanup including debris removal and fine dust detailing; and specialized cleaning for medical facilities, high-traffic zones, and move-in/move-out situations across all of West Texas.',
                link: { to: '/#services', text: 'See our full service details' }
            },
            {
                q: 'Is Master Commercial Clean licensed and insured?',
                a: 'Yes. Master Commercial Clean is fully licensed and insured to operate across all West Texas cities. Our staff are trained professionals who follow strict safety and sanitation protocols for every job, from small offices in San Angelo to large commercial facilities in Midland-Odessa.'
            },
            {
                q: 'What cleaning products and equipment does MCC use?',
                a: 'Master Commercial Clean uses industrial-grade, EPA-registered cleaning products and professional equipment including HEPA-filtered vacuums, commercial floor scrubbers, and hospital-grade disinfectants. We select products based on facility type, surface materials, and any client sensitivities or green cleaning preferences.'
            }
        ]
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (key) => {
        setOpenIndex(openIndex === key ? null : key);
    };

    return (
        <section id="faq" className="section" style={{ backgroundColor: 'var(--white)' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ marginBottom: '5rem', maxWidth: '700px' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        color: 'var(--navy)',
                        lineHeight: 1.1,
                        marginBottom: '2rem'
                    }}>
                        Frequently Asked <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Questions</span>
                    </h2>
                    <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--orange)', marginBottom: '2rem' }} />
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.15rem',
                        lineHeight: 1.7
                    }}>
                        Common questions about Master Commercial Clean's janitorial and commercial cleaning services across West Texas — from pricing and scheduling to service coverage and quality assurance.
                    </p>
                </motion.div>

                {faqData.map((category, catIdx) => (
                    <div key={catIdx} style={{ marginBottom: '3rem' }}>
                        <motion.h3
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 700,
                                color: 'var(--orange)',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontSize: '0.9rem',
                                marginBottom: '1.5rem',
                                borderBottom: '1px solid var(--off-white)',
                                paddingBottom: '1rem'
                            }}
                        >
                            {category.category}
                        </motion.h3>

                        {category.questions.map((item, qIdx) => {
                            const key = `${catIdx}-${qIdx}`;
                            const isOpen = openIndex === key;

                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: qIdx * 0.05 }}
                                    style={{
                                        borderBottom: '1px solid var(--off-white)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggle(key)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.5rem 0',
                                        gap: '2rem'
                                    }}>
                                        {/* AEO: Question as H4 heading */}
                                        <h4 style={{
                                            fontFamily: 'var(--font-serif)',
                                            fontSize: '1.25rem',
                                            color: isOpen ? 'var(--navy)' : 'var(--text-primary)',
                                            transition: 'color 0.3s',
                                            margin: 0,
                                            lineHeight: 1.3
                                        }}>
                                            {item.q}
                                        </h4>
                                        <motion.span
                                            animate={{ rotate: isOpen ? 45 : 0 }}
                                            style={{
                                                fontSize: '1.5rem',
                                                color: isOpen ? 'var(--orange)' : 'var(--text-secondary)',
                                                flexShrink: 0,
                                                fontWeight: 300
                                            }}
                                        >
                                            +
                                        </motion.span>
                                    </div>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                {/* AEO: 40-60 word answer nugget */}
                                                <p style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '1.1rem',
                                                    lineHeight: 1.7,
                                                    paddingBottom: '1.5rem',
                                                    maxWidth: '800px'
                                                }}>
                                                    {item.a}
                                                </p>
                                                {item.link && (
                                                    <HashLink
                                                        smooth
                                                        to={item.link.to}
                                                        style={{
                                                            fontFamily: 'var(--font-sans)',
                                                            fontSize: '0.9rem',
                                                            color: 'var(--orange)',
                                                            textDecoration: 'none',
                                                            fontWeight: 600,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            paddingBottom: '1.5rem'
                                                        }}
                                                    >
                                                        {item.link.text} →
                                                    </HashLink>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FAQ;
