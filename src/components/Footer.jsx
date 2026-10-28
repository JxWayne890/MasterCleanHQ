import { Link } from 'react-router-dom';
import { ArrowUpRight, Phone } from 'lucide-react';
import { MAILING_ADDRESS, PHONE_DISPLAY, PHONE_E164 } from '../config/site';
import './contact-navigation.css';

const Footer = () => (
    <footer className="mcc-footer">
        <div className="container">
            <div className="mcc-footer-intro">
                <div>
                    <span className="mcc-footer-eyebrow">Your building. Our next conversation.</span>
                    <h2 data-motion="rise">Let’s talk clean.</h2>
                </div>
                <a className="mcc-footer-call" href={`tel:${PHONE_E164}`}><Phone size={23} aria-hidden="true" />{PHONE_DISPLAY.replace(/-/g, ' ')}<ArrowUpRight size={22} aria-hidden="true" /></a>
            </div>
            <div className="mcc-footer-grid">
                <div className="mcc-footer-brand">
                    <Link to="/" aria-label="Master Commercial Clean home"><img src="/img/logo2.png" width="882" height="553" alt="Master Commercial Clean" loading="lazy" /></Link>
                    <p>Commercial cleaning for San Angelo and the surrounding West Texas communities.</p>
                    <a href="mailto:john@mastercleanhq.com">john@mastercleanhq.com</a>
                </div>
                <div>
                    <h3>Cleaning services</h3>
                    <ul>
                        <li><Link to="/commercial-cleaning">Commercial cleaning</Link></li>
                        <li><Link to="/post-construction-cleaning">Post construction cleanup</Link></li>
                        <li><Link to="/specialized-cleaning">Specialized cleaning</Link></li>
                        <li><a href="/#contact">Request a free quote</a></li>
                    </ul>
                </div>
                <div>
                    <h3>Explore MCC</h3>
                    <ul>
                        <li><Link to="/about">About us</Link></li>
                        <li><Link to="/service-areas">West Texas service areas</Link></li>
                        <li><a href="/guides">Cleaning guides</a></li>
                        <li><Link to="/faq">Common questions</Link></li>
                        <li><Link to="/apply">Join our team</Link></li>
                    </ul>
                </div>
                <div className="mcc-footer-address">
                    <h3>Mailing address only</h3>
                    <address>{MAILING_ADDRESS.recipient}<br />{MAILING_ADDRESS.street}<br />{MAILING_ADDRESS.cityStateZip}</address>
                    <div className="mcc-footer-partner">
                        <h3>Outside West Texas?</h3>
                        <p>Explore our commercial cleaning referral network.</p>
                        <a href="/partner-network">Texas partner network <ArrowUpRight size={15} aria-hidden="true" /></a>
                        <a href="/texas">Request a Texas quote <ArrowUpRight size={15} aria-hidden="true" /></a>
                        <a href="https://partners.mastercleanhq.com">Become a partner <ArrowUpRight size={15} aria-hidden="true" /></a>
                    </div>
                </div>
            </div>
            <div className="mcc-footer-bottom">
                <p>© {new Date().getFullYear()} Master Clean HQ LLC, doing business as Master Commercial Clean.</p>
                <p>San Angelo, Texas</p>
            </div>
        </div>
    </footer>
);

export default Footer;
