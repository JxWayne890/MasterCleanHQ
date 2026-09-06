import { motion } from 'framer-motion';
import QuoteForm from './QuoteForm';

const Contact = () => {
    return (
        <section id="contact" style={{ backgroundColor: 'var(--off-white)', padding: '8rem 0' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
                    gap: 'clamp(2rem, 5vw, 6rem)'
                }}>

                    {/* Info Side */}
                    <div>
                        {/* AEO: Question-based heading */}
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{
                                fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                                color: 'var(--navy)',
                                lineHeight: 1.1,
                                marginBottom: '2rem'
                            }}
                        >
                            How do I get a cleaning quote in <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>West Texas?</span>
                        </motion.h2>

                        {/* AEO: 40-60 word answer nugget */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            style={{
                                fontSize: '1.2rem',
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-sans)',
                                marginBottom: '4rem',
                                maxWidth: '450px',
                                lineHeight: 1.7
                            }}
                        >
                            To request a free commercial cleaning estimate from Master Commercial Clean, call (325) 273-2203 or fill out the form below. We serve businesses across San Angelo, Abilene, Lubbock, Midland, Odessa, and all surrounding West Texas cities. Most quotes are provided within 24 hours.
                        </motion.p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {/* NAP: Consistent Name, Address, Phone */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                style={{ borderLeft: '2px solid var(--orange)', paddingLeft: '1.5rem' }}
                            >
                                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Direct Line
                                </p>
                                <a href="tel:+13252732203" onClick={() => { if (typeof gtag === 'function') { gtag('event', 'click_to_call', { event_category: 'contact', event_label: 'phone_hero' }); } }} style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '2.5rem',
                                    color: 'var(--navy)',
                                    textDecoration: 'none'
                                }}>
                                    (325) 273-2203
                                </a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                style={{ borderLeft: '2px solid var(--navy)', paddingLeft: '1.5rem' }}
                            >
                                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Headquarters
                                </p>
                                <p style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1.1rem',
                                    color: 'var(--navy)',
                                    fontWeight: 500
                                }}>
                                    San Angelo, Texas<br />
                                    Serving All of West Texas
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                style={{ borderLeft: '2px solid var(--navy)', paddingLeft: '1.5rem' }}
                            >
                                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Hours
                                </p>
                                <p style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1.1rem',
                                    color: 'var(--navy)',
                                    fontWeight: 500
                                }}>
                                    Mon–Fri: 7:00am – 6:00pm<br />
                                    Sat–Sun: 8:00am – 2:00pm<br />
                                    <span style={{ color: 'var(--orange)', fontSize: '0.9rem' }}>After-hours available by appointment</span>
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Form Side - Enhanced Editorial Corporate Design */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{ position: 'relative' }}
                    >
                        <div style={{
                            width: '100%',
                            backgroundColor: 'var(--white)',
                            padding: '0',
                            position: 'relative',
                            zIndex: 2,
                            boxShadow: '0 20px 40px rgba(2, 24, 43, 0.05)'
                        }}>
                            <QuoteForm />
                        </div>

                        {/* Minimalist Decorative Outline */}
                        <div style={{
                            position: 'absolute',
                            top: '15px',
                            right: '-15px',
                            width: '100%',
                            height: '100%',
                            border: '1px solid var(--orange)',
                            zIndex: 1,
                            opacity: 0.3
                        }} />
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Contact;
