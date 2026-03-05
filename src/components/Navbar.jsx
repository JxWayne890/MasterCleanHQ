import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        const handleResize = () => {
            setWidth(window.innerWidth);
            if (window.innerWidth > 992) setIsOpen(false);
        };
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const menuVariants = {
        closed: {
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
        },
        open: {
            y: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
        }
    };

    const linkVariants = {
        closed: { y: 100, opacity: 0 },
        open: (i) => ({
            y: 0,
            opacity: 1,
            transition: { delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.76, 0, 0.24, 1] }
        })
    };

    return (
        <>
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 50,
                    padding: scrolled ? '1rem 0' : '2rem 0',
                    transition: 'padding 0.4s ease',
                    backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(10px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}
            >
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                        <a href="/" style={{ minWidth: 'fit-content' }}>
                            <img src="/logo.png" alt="Master Commercial Clean" style={{ height: '40px', filter: scrolled ? 'none' : 'invert(1)', transition: 'filter 0.4s' }} />
                        </a>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    {width > 992 && (
                        <nav style={{
                            display: 'flex',
                            gap: '2.5rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 2
                        }}>
                            {[
                                { name: 'Home', href: '/' },
                                { name: 'Expertise', href: '/#expertise' },
                                { name: 'FAQ', href: '/faq' },
                                { name: 'Testimonials', href: '/#testimonials' },
                                { name: 'Connect', href: '/#contact' }
                            ].map((link) => (
                                <HashLink
                                    key={link.name}
                                    smooth
                                    to={link.href}
                                    style={{
                                        textDecoration: 'none',
                                        color: scrolled ? 'var(--navy)' : 'var(--white)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        transition: 'color 0.3s',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'var(--orange)'}
                                    onMouseLeave={(e) => e.target.style.color = scrolled ? 'var(--navy)' : 'var(--white)'}
                                >
                                    {link.name}
                                </HashLink>
                            ))}
                        </nav>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2rem', flex: 1 }}>
                        <a href="tel:+13252495191" style={{
                            fontWeight: 600,
                            color: isOpen ? 'var(--white)' : 'var(--navy)',
                            display: width > 1200 ? 'block' : 'none',
                            transition: 'color 0.4s',
                            textDecoration: 'none',
                            fontSize: '0.9rem'
                        }}>
                            (325) 249-5191
                        </a>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: width > 992 ? 'none' : 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: isOpen ? 'var(--white)' : 'var(--navy)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.9rem',
                                transition: 'color 0.4s'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '24px' }}>
                                <span style={{
                                    display: 'block', width: '100%', height: '2px', backgroundColor: 'currentColor',
                                    transform: isOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none', transition: 'transform 0.3s'
                                }}></span>
                                <span style={{
                                    display: 'block', width: isOpen ? '100%' : '70%', height: '2px', backgroundColor: 'currentColor', marginLeft: 'auto',
                                    transform: isOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none', transition: 'all 0.3s'
                                }}></span>
                            </div>
                            <span style={{ marginLeft: '10px' }}>{isOpen ? 'Close' : 'Menu'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100vh',
                            backgroundColor: 'var(--navy)',
                            zIndex: 40,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '0 5%'
                        }}
                    >
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
                            {[
                                { name: 'Home', href: '/', number: '01' },
                                { name: 'Expertise', href: '/#expertise', number: '02' },
                                { name: 'FAQ', href: '/faq', number: '03' },
                                { name: 'Testimonials', href: '/#testimonials', number: '04' },
                                { name: 'Connect', href: '/#contact', number: '05' }
                            ].map((link, i) => (
                                <div key={link.name} style={{ overflow: 'hidden' }}>
                                    {link.href.startsWith('/#') ? (
                                        <motion.a
                                            custom={i}
                                            variants={linkVariants}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                gap: '2rem',
                                                color: 'var(--white)',
                                                fontFamily: 'var(--font-serif)',
                                                fontSize: 'clamp(3rem, 8vw, 6rem)',
                                                lineHeight: 1,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <span style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                                                color: 'var(--orange)',
                                                fontWeight: 500,
                                                transform: 'translateY(-2vh)'
                                            }}>
                                                {link.number}
                                            </span>
                                            <span style={{
                                                transition: 'color 0.3s, margin-left 0.3s',
                                                cursor: 'pointer'
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = 'var(--orange)';
                                                    e.currentTarget.style.marginLeft = '20px';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = 'var(--white)';
                                                    e.currentTarget.style.marginLeft = '0px';
                                                }}
                                            >
                                                {link.name}
                                            </span>
                                        </motion.a>
                                    ) : (
                                        <motion.div
                                            custom={i}
                                            variants={linkVariants}
                                            style={{ display: 'flex' }}
                                        >
                                            <HashLink smooth
                                                to={link.href}
                                                onClick={() => setIsOpen(false)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'baseline',
                                                    gap: '2rem',
                                                    color: 'var(--white)',
                                                    fontFamily: 'var(--font-serif)',
                                                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                                                    lineHeight: 1,
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <span style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                                                    color: 'var(--orange)',
                                                    fontWeight: 500,
                                                    transform: 'translateY(-2vh)'
                                                }}>
                                                    {link.number}
                                                </span>
                                                <span style={{
                                                    transition: 'color 0.3s, margin-left 0.3s',
                                                    cursor: 'pointer'
                                                }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = 'var(--orange)';
                                                        e.currentTarget.style.marginLeft = '20px';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = 'var(--white)';
                                                        e.currentTarget.style.marginLeft = '0px';
                                                    }}
                                                >
                                                    {link.name}
                                                </span>
                                            </HashLink>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        <motion.div
                            custom={6}
                            variants={linkVariants}
                            style={{
                                position: 'absolute',
                                bottom: '10%',
                                left: '5%',
                                display: 'flex',
                                gap: '4rem',
                                color: 'var(--off-white)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.9rem',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}
                        >
                            <div>
                                <p style={{ color: 'var(--orange)', marginBottom: '0.5rem' }}>Location</p>
                                <p>San Angelo, Texas<br />Serving the Concho Valley</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--orange)', marginBottom: '0.5rem' }}>Direct Line</p>
                                <p><a href="tel:+13252495191" style={{ color: 'inherit' }}>(325) 249-5191</a></p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};

export default Navbar;
