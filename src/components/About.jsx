import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <section id="expertise" className="section" style={{ backgroundColor: 'var(--off-white)', position: 'relative' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '6rem',
                    alignItems: 'center'
                }}>
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* AEO: Question-based heading */}
                        <h2 style={{
                            fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                            color: 'var(--navy)',
                            lineHeight: 1.1,
                            marginBottom: '2rem'
                        }}>
                            Why do West Texas businesses choose Master Commercial Clean?
                        </h2>

                        <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--orange)', marginBottom: '2.5rem' }} />

                        {/* AEO Answer Nugget — 40-60 word direct answer */}
                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1.5rem',
                            lineHeight: 1.8
                        }}>
                            Master Commercial Clean, a West Texas commercial cleaning company headquartered in San Angelo, provides detailed janitorial and sanitation services for offices, retail spaces, and post-construction sites across Abilene, Lubbock, Midland, Odessa, and all surrounding cities. We combine industrial-grade protocols with meticulous attention to detail.
                        </p>

                        <p style={{
                            fontSize: '1.1rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.8,
                            marginBottom: '1.5rem'
                        }}>
                            Locally owned and operated, our team understands the unique demands of West Texas facilities — from oil field offices in the Permian Basin to corporate environments in the Concho Valley. We guarantee that your workspace is not just superficially clean, but thoroughly sanitized, inviting, and professional.
                        </p>

                        {/* AEO: Contextual internal links for topical clustering */}
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                            <Link to="/commercial-cleaning" style={{ color: 'var(--orange)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                View commercial cleaning →
                            </Link>
                            <Link to="/faq" style={{ color: 'var(--navy)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7 }}>
                                Questions? Visit our FAQ →
                            </Link>
                        </div>

                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                "Fully Licensed & Insured Across West Texas",
                                "Flexible Scheduling: Days, Nights, Weekends",
                                "100% Satisfaction Guarantee on Every Job",
                                "Serving 15+ Cities Across the Region"
                            ].map((text, idx) => (
                                <li key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 600,
                                    color: 'var(--navy)'
                                }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(255, 92, 0, 0.1)', display: 'grid', placeItems: 'center', color: 'var(--orange)', flexShrink: 0 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Visual Content */}
                    <div style={{ position: 'relative', minHeight: '600px', display: 'flex', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{
                                width: '100%',
                                height: '500px',
                                backgroundColor: 'var(--navy)',
                                position: 'relative',
                                zIndex: 2,
                                display: 'grid',
                                placeItems: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, width: '100%', height: '100%',
                                background: 'linear-gradient(45deg, var(--navy), #0A2F4C)',
                                opacity: 0.8
                            }} />
                            <span style={{
                                position: 'relative',
                                zIndex: 3,
                                color: 'rgba(255,255,255,0.1)',
                                fontFamily: 'var(--font-serif)',
                                fontSize: '8rem',
                                lineHeight: 0.8,
                                textAlign: 'center'
                            }}>
                                M.
                            </span>
                        </motion.div>

                        {/* Overlapping Stats Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '-10%',
                                backgroundColor: 'var(--orange)',
                                color: 'var(--white)',
                                padding: '3rem',
                                zIndex: 3,
                                maxWidth: '300px'
                            }}
                        >
                            <h3 style={{ fontSize: '4rem', marginBottom: '0.5rem', lineHeight: 1 }}>15+</h3>
                            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>West Texas Cities Served</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
