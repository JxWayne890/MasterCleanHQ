import { motion } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: 'var(--navy)', color: 'var(--white)', overflow: 'hidden' }}>
            <div className="container" style={{ paddingTop: '6rem', paddingBottom: '2rem' }}>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '4rem',
                    marginBottom: '6rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '4rem'
                }}>
                    <div>
                        <h4 style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            color: 'var(--orange)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>Company</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.7)' }}>
                            <li><HashLink smooth to="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Home</HashLink></li>
                            <li><HashLink smooth to="/#expertise" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>About Us</HashLink></li>
                            <li><HashLink smooth to="/#services" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Services</HashLink></li>
                            <li><HashLink smooth to="/#testimonials" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Reviews</HashLink></li>
                            <li><HashLink smooth to="/faq" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>FAQ</HashLink></li>
                        </ul>
                    </div>

                    {/* SEO: Service Areas in Footer for Internal Linking */}
                    <div>
                        <h4 style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            color: 'var(--orange)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>Service Areas</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                            <li>San Angelo, TX</li>
                            <li>Abilene, TX</li>
                            <li>Lubbock, TX</li>
                            <li>Midland, TX</li>
                            <li>Odessa, TX</li>
                            <li><HashLink smooth to="/#service-areas" style={{ color: 'var(--orange)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'var(--orange)'}>View All Cities →</HashLink></li>
                        </ul>
                    </div>

                    {/* SEO: Consistent NAP in Footer */}
                    <div>
                        <h4 style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            color: 'var(--orange)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>Contact</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-sans)', color: 'rgba(255,255,255,0.7)' }}>
                            <li><a href="tel:+13252495191" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>(325) 249-5191</a></li>
                            <li><HashLink smooth to="/#contact" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = 'var(--white)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>Request Quote</HashLink></li>
                            <li>San Angelo, TX 76901</li>
                            <li style={{ fontSize: '0.9rem' }}>Mon–Fri: 7am–6pm</li>
                            <li style={{ fontSize: '0.9rem' }}>Sat–Sun: 8am–2pm</li>
                        </ul>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                        <img src="/img/logo.png" alt="Master Commercial Clean Logo" style={{ height: '60px', filter: 'invert(1)' }} />
                    </div>
                </div>

                {/* Massive Typography Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}
                >
                    <span style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(5rem, 15vw, 18rem)',
                        color: 'var(--white)',
                        lineHeight: 0.8,
                        letterSpacing: '-2px'
                    }}>
                        MASTER.
                    </span>
                </motion.div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', flexWrap: 'wrap', gap: '1rem' }}>
                    <span>&copy; {new Date().getFullYear()} Master Commercial Clean. All Rights Reserved.</span>
                    <span>Commercial Cleaning Services — West Texas</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
