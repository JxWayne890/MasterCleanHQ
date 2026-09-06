import { useState, useEffect, useRef } from 'react';
import { HashLink } from 'react-router-hash-link';
import { Link, useLocation } from 'react-router-dom';
import { servicePages } from '../data/servicePages';
import './Navbar.css';

const desktopLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Areas', href: '/service-areas' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Apply', href: '/apply' },
    { name: 'Connect', href: '/#contact' },
];

const mobileLinks = [
    { name: 'Home', href: '/', number: '01' },
    { name: 'Services', href: '/services', number: '02' },
    { name: 'Service Areas', href: '/service-areas', number: '03' },
    { name: 'About', href: '/about', number: '04' },
    { name: 'Blog', href: '/blog', number: '05' },
    { name: 'Reviews', href: '/reviews', number: '06' },
    { name: 'FAQ', href: '/faq', number: '07' },
    { name: 'Apply', href: '/apply', number: '08' },
    { name: 'Connect', href: '/#contact', number: '09' },
];

const homeLinks = [
    { name: 'Services', href: '/services' },
    { name: 'Service Areas', href: '/service-areas' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Free Estimate', href: '/#contact' },
];

const Navbar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [width, setWidth] = useState(1280);
    const menuRef = useRef(null);
    const applicationRoute = location.pathname.startsWith('/apply');
    const homeRoute = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        const handleResize = () => {
            setWidth(window.innerWidth);
            if (window.innerWidth > 992) setIsOpen(false);
        };
        handleScroll();
        handleResize();
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const menu = menuRef.current;
        if (!isOpen) {
            menu.close();
            return;
        }
        const previousOverflow = document.body.style.overflow;
        menu.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            menu.close();
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    return (
        <>
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 50,
                    padding: scrolled || applicationRoute || homeRoute ? '0.7rem 0' : '2rem 0',
                    transition: 'padding 0.4s ease',
                    backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : applicationRoute ? 'rgba(20, 22, 24, 0.98)' : homeRoute ? 'var(--navy)' : 'transparent',
                    backdropFilter: scrolled || applicationRoute ? 'blur(10px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : applicationRoute ? '1px solid rgba(255,255,255,0.12)' : 'none'
                }}
            >
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                        <Link to="/" style={{ minWidth: 'fit-content' }}>
                            <img
                                src={scrolled ? "/img/logo.png" : "/img/logo2.png"}
                                alt="Master Commercial Clean Logo"
                                style={{ height: '60px', transition: 'all 0.4s' }}
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    {width > 992 && (
                        <nav style={{
                            display: 'flex',
                            gap: 'clamp(1rem, 2vw, 2.5rem)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 2
                        }}>
                            {(homeRoute ? homeLinks : desktopLinks).map((link) => (
                                link.href.startsWith('/#') ? (
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
                                ) : (
                                    <Link
                                        key={link.name}
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
                                    </Link>
                                )
                            ))}
                        </nav>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2rem', flex: 1 }}>
                        <a href="tel:+13252732203" style={{
                            fontWeight: 600,
                            color: isOpen ? 'var(--white)' : scrolled ? 'var(--navy)' : 'var(--white)',
                            display: width > 1200 ? 'block' : 'none',
                            transition: 'color 0.4s',
                            textDecoration: 'none',
                            fontSize: '0.9rem'
                        }}>
                            (325) 273-2203
                        </a>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                            aria-controls="mobile-navigation"
                            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: width > 992 ? 'none' : 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: isOpen ? 'var(--white)' : scrolled ? 'var(--navy)' : 'var(--white)',
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

            <dialog
                ref={menuRef}
                id="mobile-navigation"
                className="mobile-navigation"
                aria-label="Navigation menu"
                onCancel={() => setIsOpen(false)}
                onKeyDown={(event) => {
                    if (event.key !== 'Tab') return;
                    const controls = Array.from(event.currentTarget.querySelectorAll('button, a[href]'));
                    const first = controls[0];
                    const last = controls[controls.length - 1];
                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                }}
            >
                <div className="mobile-navigation-top">
                    <span>Master Commercial Clean</span>
                    <button type="button" onClick={() => setIsOpen(false)} aria-label="Close navigation menu">Close ×</button>
                </div>
                <nav aria-label="Main navigation">
                    {(homeRoute ? [{ name: 'Home', href: '/' }, ...homeLinks] : mobileLinks).map((link, index) => (
                        <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)}>
                            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                            {link.name}
                        </Link>
                    ))}
                </nav>
                <div className="mobile-navigation-details">
                    <div><p>Core Services</p><span>{servicePages.map((service) => service.navLabel).join(', ')}</span></div>
                    <div><p>Location</p><span>San Angelo, Texas<br />Serving West Texas</span></div>
                    <div><p>Direct Line</p><a href="tel:+13252732203">(325) 273-2203</a></div>
                </div>
            </dialog>
        </>
    );
};

export default Navbar;
