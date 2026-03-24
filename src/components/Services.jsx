import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { servicePages } from '../data/servicePages';

const servicesData = servicePages.map((service, index) => ({
    id: String(index + 1).padStart(2, '0'),
    slug: service.slug,
    title: service.navLabel,
    question: service.question,
    answer: service.answer,
    bullets: service.bullets,
}));

const ServicesAccordion = () => {
    const [activeId, setActiveId] = useState(servicesData[0].id);

    return (
        <section id="services" className="section" style={{ backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
            <div className="container">

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6rem', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        {/* AEO: Question-based H2 */}
                        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1 }}>
                            What cleaning services does Master Commercial Clean offer?
                        </h2>
                        <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--orange)', marginTop: '2rem' }} />
                    </div>
                    <p style={{ maxWidth: '400px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-sans)', textAlign: 'right' }}>
                        We engineer bespoke cleaning operations for businesses across San Angelo, Abilene, Lubbock, Midland, Odessa, and all of West Texas.
                    </p>
                </div>

                <div>
                    {servicesData.map((service, idx) => {
                        const isActive = activeId === service.id;
                        return (
                            <div
                                key={service.id}
                                onClick={() => setActiveId(service.id)}
                                style={{
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    borderBottom: idx === servicesData.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                {/* Accordion Header */}
                                <div style={{
                                    padding: '3rem 0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'padding 0.4s ease'
                                }}>
                                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'baseline' }}>
                                        <span style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '1rem',
                                            color: isActive ? 'var(--orange)' : 'rgba(255,255,255,0.3)',
                                            fontWeight: 600,
                                            transition: 'color 0.4s'
                                        }}>
                                            {service.id}
                                        </span>
                                        <h3 style={{
                                            fontSize: 'clamp(1.5rem, 3vw, 3rem)',
                                            margin: 0,
                                            color: isActive ? 'var(--white)' : 'rgba(255,255,255,0.5)',
                                            transition: 'color 0.4s, transform 0.4s'
                                        }}>
                                            {service.title}
                                        </h3>
                                    </div>

                                    <motion.div
                                        animate={{ rotate: isActive ? 45 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            width: '40px', height: '40px',
                                            borderRadius: '50%',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            display: 'grid', placeItems: 'center',
                                            color: isActive ? 'var(--orange)' : 'var(--white)',
                                            flexShrink: 0
                                        }}
                                    >
                                        +
                                    </motion.div>
                                </div>

                                {/* Accordion Body */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{
                                                paddingBottom: '3rem',
                                                paddingLeft: 'clamp(3rem, 5vw, 5rem)',
                                                maxWidth: '900px'
                                            }}>
                                                {/* AEO: Question sub-heading */}
                                                <h4 style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    color: 'var(--orange)',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    marginBottom: '1rem'
                                                }}>
                                                    {service.question}
                                                </h4>
                                                {/* AEO: 40-60 word answer nugget */}
                                                <p style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    color: 'rgba(255,255,255,0.7)',
                                                    fontSize: '1.15rem',
                                                    lineHeight: 1.6,
                                                    marginBottom: '1.5rem'
                                                }}>
                                                    {service.answer}
                                                </p>

                                                <ul style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                    gap: '0.75rem',
                                                    marginBottom: '1.5rem'
                                                }}>
                                                    {service.bullets.map((b, i) => (
                                                        <li key={i} style={{
                                                            fontFamily: 'var(--font-sans)',
                                                            color: 'rgba(255,255,255,0.8)',
                                                            fontSize: '0.95rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <span style={{ color: 'var(--orange)', fontSize: '1.2rem' }}>•</span>
                                                            {b}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <a href="#contact" style={{
                                                    color: 'var(--orange)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    Get a Free Quote <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
                                                </a>

                                                {/* AEO: Contextual internal link to FAQ */}
                                                <Link to="/faq" style={{
                                                    color: 'rgba(255,255,255,0.5)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.85rem',
                                                    textDecoration: 'none',
                                                    display: 'block',
                                                    marginTop: '1rem',
                                                    transition: 'color 0.3s'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--orange)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                                >
                                                    Learn more about our pricing and scheduling in our FAQ →
                                                </Link>

                                                <Link to={`/${service.slug}`} style={{
                                                    color: 'var(--white)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.9rem',
                                                    textDecoration: 'none',
                                                    display: 'inline-block',
                                                    marginTop: '0.75rem',
                                                    fontWeight: 600,
                                                }}>
                                                    View the full {service.title} page →
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
};

export default ServicesAccordion;
