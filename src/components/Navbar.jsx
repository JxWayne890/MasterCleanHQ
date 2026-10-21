import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, Phone, X } from 'lucide-react';
import { PHONE_DISPLAY, PHONE_E164 } from '../config/site';
import './contact-navigation.css';

const navigation = [
    { label: 'Services', href: '/services' },
    { label: 'Service areas', href: '/service-areas' },
    { label: 'About us', href: '/about' },
    { label: 'Guides', href: '/guides', document: true },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const menuButton = useRef(null);
    const phone = PHONE_DISPLAY.replace(/-/g, ' ');

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname, location.hash]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                menuButton.current?.focus();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return (
        <>
            <a className="mcc-skip-link" href="#main-content">Skip to content</a>
            <header className="mcc-header">
                <div className="container mcc-header-inner">
                    <Link className="mcc-brand" to="/" aria-label="Master Commercial Clean home" onClick={() => setIsOpen(false)}>
                        <img src="/img/logo.png" alt="Master Commercial Clean" width="882" height="498" />
                    </Link>
                    <nav className="mcc-desktop-nav" aria-label="Main navigation">
                        {navigation.map((item) => (
                            <Link key={item.href} to={item.href} reloadDocument={item.document} aria-current={location.pathname.startsWith(item.href) ? 'page' : undefined}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="mcc-header-actions">
                        <a className="mcc-header-phone" href={`tel:${PHONE_E164}`}><Phone size={17} aria-hidden="true" />{phone}</a>
                        <a className="mcc-nav-quote" href="/#contact">Get a free quote <ArrowUpRight size={17} aria-hidden="true" /></a>
                        <button ref={menuButton} className="mcc-menu-toggle" type="button" aria-expanded={isOpen} aria-controls="mcc-mobile-menu" onClick={() => setIsOpen((open) => !open)}>
                            {isOpen ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
                            <span>{isOpen ? 'Close' : 'Menu'}</span>
                        </button>
                    </div>
                </div>
                <nav id="mcc-mobile-menu" className="mcc-mobile-menu" aria-label="Mobile navigation" hidden={!isOpen}>
                    <div className="container">
                        {navigation.map((item) => (
                            <Link key={item.href} to={item.href} reloadDocument={item.document} onClick={() => setIsOpen(false)}>
                                {item.label}<ArrowUpRight size={18} aria-hidden="true" />
                            </Link>
                        ))}
                        <a href="/partner-network" onClick={() => setIsOpen(false)}>Texas partner network <ArrowUpRight size={18} aria-hidden="true" /></a>
                        <a className="mcc-mobile-menu-phone" href={`tel:${PHONE_E164}`}><Phone size={18} aria-hidden="true" />Call {phone}</a>
                        <a className="mcc-nav-quote" href="/#contact" onClick={() => setIsOpen(false)}>Get a free quote <ArrowUpRight size={18} aria-hidden="true" /></a>
                    </div>
                </nav>
            </header>
            <nav className="mcc-mobile-actions" aria-label="Quick contact">
                <a href={`tel:${PHONE_E164}`}><Phone size={18} aria-hidden="true" />Call MCC</a>
                <a href="/#contact">Request a quote<ArrowUpRight size={18} aria-hidden="true" /></a>
            </nav>
        </>
    );
};

export default Navbar;
