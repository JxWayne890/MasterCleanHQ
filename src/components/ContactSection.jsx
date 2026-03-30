import { motion } from 'framer-motion';
import { PHONE_DISPLAY, PHONE_E164 } from '../config/site';

const ContactSection = ({ heading, subheading }) => {
    return (
        <section style={{ backgroundColor: 'var(--off-white)', padding: '5rem 0' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        backgroundColor: 'var(--navy)',
                        color: 'var(--white)',
                        padding: 'clamp(2rem, 5vw, 4rem)',
                        textAlign: 'center',
                    }}
                >
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                        lineHeight: 1.15,
                        marginBottom: '1rem',
                    }}>
                        {heading || 'Ready for a Cleaner Facility?'}
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.1rem',
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.7,
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem',
                    }}>
                        {subheading || 'Get a free estimate from Master Commercial Clean. We serve businesses across West Texas with reliable, professional janitorial services.'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a
                            href={`tel:${PHONE_E164}`}
                            onClick={() => { if (typeof gtag === 'function') { gtag('event', 'click_to_call', { event_category: 'contact', event_label: 'contact_section' }); } }}
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
                                transition: 'transform 0.3s, box-shadow 0.3s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,92,0,0.3)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            Call {PHONE_DISPLAY}
                        </a>
                        <a
                            href="/#contact"
                            style={{
                                color: 'var(--white)',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.9rem',
                                borderBottom: '2px solid rgba(255,255,255,0.4)',
                                paddingBottom: '4px',
                                transition: 'border-color 0.3s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--orange)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
                        >
                            Request a Quote Online
                        </a>
                    </div>
                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '1.5rem',
                    }}>
                        San Angelo, TX &middot; Mon&ndash;Fri 7am&ndash;6pm &middot; Sat&ndash;Sun 8am&ndash;2pm
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactSection;
