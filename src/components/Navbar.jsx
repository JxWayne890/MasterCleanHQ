import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Phone } from 'lucide-react';
import { PHONE_DISPLAY, PHONE_E164 } from '../config/site';
import './contact-navigation.css';
import './menu.css';

const navigation = [
    { label: 'Services', href: '/services' },
    { label: 'Service areas', href: '/service-areas' },
    { label: 'About us', href: '/about' },
    { label: 'Guides', href: '/guides', document: true },
];

const mobileNavigation = [...navigation, { label: 'Partner network', href: '/partner-network' }];

function lockPageScroll() {
    const root = document.documentElement;
    const body = document.body;
    const position = { x: window.scrollX, y: window.scrollY };
    const properties = ['position', 'top', 'left', 'right', 'width', 'overflow'];
    const previous = Object.fromEntries(properties.map((key) => [key, body.style[key]]));
    const rootOverflow = root.style.overflow;
    const rootBehavior = root.style.scrollBehavior;
    const bodyBehavior = body.style.scrollBehavior;
    let restored = false;

    // Stop any in progress anchor scroll before fixing the page in place.
    root.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';
    window.scrollTo(position.x, position.y);
    root.style.overflow = 'hidden';
    Object.assign(body.style, { position: 'fixed', top: `-${position.y}px`, left: '0', right: '0', width: '100%', overflow: 'hidden' });

    return (restorePosition = true) => {
        if (restored) return;
        restored = true;
        Object.assign(body.style, previous);
        root.style.overflow = rootOverflow;
        if (restorePosition) window.scrollTo(position.x, position.y);
        root.style.scrollBehavior = rootBehavior;
        body.style.scrollBehavior = bodyBehavior;
    };
}

const Navbar = () => {
    const [phase, setPhase] = useState('closed');
    const isOpen = phase !== 'closed';
    const location = useLocation();
    const menuButton = useRef(null);
    const closeButton = useRef(null);
    const dialog = useRef(null);
    const restorePage = useRef(null);
    const pendingDestination = useRef(null);
    const openingUrl = useRef(null);
    const phone = PHONE_DISPLAY.replace(/-/g, ' ');

    const finishClose = useCallback(({ restorePosition = true } = {}) => {
        if (!dialog.current?.open && !restorePage.current) return;
        dialog.current?.close();
        restorePage.current?.(restorePosition);
        restorePage.current = null;
        setPhase('closed');
        menuButton.current?.focus({ preventScroll: true });
        const destination = pendingDestination.current;
        pendingDestination.current = null;
        openingUrl.current = null;
        // Restore the page before navigation, including native quote anchors.
        // Document navigation also preserves the generated guide/network pages.
        if (destination) window.location.assign(destination);
    }, []);

    function requestClose(destination = null) {
        if (phase !== 'open') return;
        pendingDestination.current = destination;
        setPhase('closing');
    }

    function followMenuLink(event, destination) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        requestClose(destination);
    }

    function keepMenuFocus(event) {
        if (event.key !== 'Tab') return;
        const controls = event.currentTarget.querySelectorAll('a[href], button:not([disabled])');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    }

    useEffect(() => {
        const modal = dialog.current;
        if (!isOpen || !modal) return undefined;
        const restore = lockPageScroll();
        restorePage.current = restore;
        if (!modal.open) modal.showModal();
        closeButton.current?.focus({ preventScroll: true });
        return () => {
            modal.close();
            restore();
            restorePage.current = null;
        };
    }, [isOpen]);

    useEffect(() => {
        if (phase !== 'closing') return undefined;
        // Animation end normally closes the modal. The timer covers interruption.
        const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 440;
        const timer = window.setTimeout(finishClose, duration);
        return () => window.clearTimeout(timer);
    }, [phase, finishClose]);

    useEffect(() => {
        const onHistoryNavigation = () => {
            if (openingUrl.current === window.location.href) return;
            pendingDestination.current = null;
            finishClose({ restorePosition: false });
        };
        window.addEventListener('popstate', onHistoryNavigation);
        window.addEventListener('hashchange', onHistoryNavigation);
        return () => {
            window.removeEventListener('popstate', onHistoryNavigation);
            window.removeEventListener('hashchange', onHistoryNavigation);
        };
    }, [finishClose]);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 1081px)');
        const onResize = () => { if (desktop.matches) finishClose(); };
        desktop.addEventListener('change', onResize);
        return () => desktop.removeEventListener('change', onResize);
    }, [finishClose]);

    return (
        <>
            <a className="mcc-skip-link" href="#main-content">Skip to content</a>
            <header className="mcc-header">
                <div className="container mcc-header-inner">
                    <Link className="mcc-brand" to="/" aria-label="Master Commercial Clean home">
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
                        <button ref={menuButton} className="mcc-menu-toggle" type="button" aria-haspopup="dialog" aria-expanded={isOpen} aria-controls="mcc-mobile-menu" onClick={() => { openingUrl.current = window.location.href; setPhase('open'); }}>
                            <span>Menu</span><span className="mcc-menu-symbol" aria-hidden="true"><span /><span /></span>
                        </button>
                    </div>
                </div>
            </header>
            <dialog ref={dialog} id="mcc-mobile-menu" className="mcc-menu-dialog" data-state={phase} aria-label="Site navigation" onKeyDown={keepMenuFocus} onCancel={(event) => { event.preventDefault(); requestClose(); }} onAnimationEnd={(event) => {
                if (event.target === event.currentTarget && event.animationName === 'mcc-menu-close') finishClose();
            }}>
                <div className="mcc-menu-top">
                    <div className="container mcc-menu-top-inner">
                        <a className="mcc-brand" href="/" aria-label="Master Commercial Clean home" onClick={(event) => followMenuLink(event, '/')}><img src="/img/logo.png" alt="Master Commercial Clean" width="882" height="498" /></a>
                        <button ref={closeButton} className="mcc-menu-close" type="button" onClick={() => requestClose()}><span>Close</span><span className="mcc-menu-symbol mcc-menu-symbol-close" aria-hidden="true"><span /><span /></span></button>
                    </div>
                </div>
                <div className="mcc-menu-content">
                    <div className="mcc-menu-layout">
                        <nav aria-label="Mobile navigation">
                            <p className="mcc-menu-eyebrow">Explore MCC</p>
                            <ol className="mcc-menu-links">
                                {mobileNavigation.map((item, index) => (
                                    <li key={item.href} style={{ '--menu-order': index }}><a href={item.href} aria-current={location.pathname.startsWith(item.href) ? 'page' : undefined} onClick={(event) => followMenuLink(event, item.href)}><span className="mcc-menu-number" aria-hidden="true">0{index + 1}</span><span>{item.label}</span><ArrowUpRight size={23} strokeWidth={1.3} aria-hidden="true" /></a></li>
                                ))}
                            </ol>
                        </nav>
                        <div className="mcc-menu-contact">
                            <p>Let’s talk about<br />your building.</p>
                            <a className="mcc-menu-phone" href={`tel:${PHONE_E164}`} onClick={() => requestClose()}><Phone size={20} aria-hidden="true" />{phone}<ArrowUpRight size={19} aria-hidden="true" /></a>
                            <a className="mcc-menu-quote" href="/#contact" onClick={(event) => followMenuLink(event, '/#contact')}>Get a free quote<ArrowUpRight size={20} aria-hidden="true" /></a>
                            <span className="mcc-menu-area">San Angelo &amp; West Texas</span>
                        </div>
                    </div>
                </div>
            </dialog>
            <nav className="mcc-mobile-actions" aria-label="Quick contact">
                <a href={`tel:${PHONE_E164}`}><Phone size={18} aria-hidden="true" />Call MCC</a>
                <a href="/#contact">Request a quote<ArrowUpRight size={18} aria-hidden="true" /></a>
            </nav>
        </>
    );
};

export default Navbar;
