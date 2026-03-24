import { motion } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';

const KeyTakeaways = () => {
    return (
        <section style={{ backgroundColor: 'var(--navy)', padding: '6rem 0' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: 'clamp(2rem, 4vw, 4rem)',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 92, 0, 0.15)',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                            color: 'var(--white)',
                            margin: 0
                        }}>
                            Key Takeaways
                        </h2>
                    </div>

                    {/* AEO: Self-contained summary paragraph — 40-60 words, extractable as a standalone answer */}
                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.15rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: 1.8,
                        marginBottom: '2rem'
                    }}>
                        Master Commercial Clean is a fully licensed and insured West Texas commercial cleaning company headquartered in San Angelo. We serve 15+ cities — including Abilene, Lubbock, Midland, and Odessa — with routine office cleaning, post-construction cleanup, and specialized sanitation. Flexible day, night, and weekend scheduling is available with a 100% satisfaction guarantee on every job.
                    </p>

                    <ul style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2.5rem'
                    }}>
                        {[
                            '15+ West Texas Cities Served',
                            'Licensed & Insured Statewide',
                            'Service Starts Within 48 Hours',
                            'Free Walk-Through Estimates',
                            '100% Satisfaction Guarantee',
                            'Day, Night & Weekend Scheduling'
                        ].map((item, i) => (
                            <li key={i} style={{
                                fontFamily: 'var(--font-sans)',
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ color: 'var(--orange)', fontSize: '0.8rem' }}>✦</span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <HashLink
                            smooth
                            to="/#contact"
                            style={{
                                backgroundColor: 'var(--orange)',
                                color: 'var(--white)',
                                padding: '1rem 2.5rem',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                textDecoration: 'none',
                                display: 'inline-block',
                                transition: 'background-color 0.3s, transform 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#cc4900';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--orange)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Get a Free Estimate
                        </HashLink>
                        <a
                            href="tel:+13252495191"
                            style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'color 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--white)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        >
                            Or call (325) 249-5191 <span>→</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default KeyTakeaways;
