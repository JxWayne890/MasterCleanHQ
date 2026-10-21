import { ArrowDown, ArrowUpRight, Check, Phone } from 'lucide-react';
import { PHONE_E164 } from '../config/site';
import './home/home.css';

const clients = [
    { name: 'Housley FLP', note: 'Housley Group', image: '/img/clients/housley-group.svg', width: 288, height: 90, className: 'mcc-client-housley' },
    { name: 'Rowland McCrory Construction', image: '/img/clients/rowland-mccrory.png', width: 320, height: 119, className: 'mcc-client-rowland' },
    { name: 'Veribest ISD', image: '/img/clients/veribest-isd.png', width: 136, height: 136, className: 'mcc-client-veribest' },
    { name: 'Miles ISD', image: '/img/clients/miles-isd.png', width: 288, height: 190, className: 'mcc-client-miles' },
];

export function ClientTrustBar() {
    return (
        <section className="mcc-client-proof" aria-labelledby="mcc-client-title">
            <div className="mcc-client-proof-inner">
                <div className="mcc-client-proof-title"><span className="mcc-proof-line" aria-hidden="true" /><h2 id="mcc-client-title">Organizations<br />we’ve worked with.</h2></div>
                <ul className="mcc-client-list">
                    {clients.map((client) => (
                        <li key={client.name} className={client.className}>
                            <img src={client.image} width={client.width} height={client.height} alt={client.note ? client.note + ' logo, representing Housley FLP' : client.name + ' logo'} decoding="async" />
                            <span>{client.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default function Hero() {
    const trackCall = () => {
        if (typeof gtag === 'function') gtag('event', 'click_to_call', { event_category: 'contact', event_label: 'homepage_hero' });
    };
    return (
        <section className="mcc-home-hero" aria-labelledby="mcc-hero-title">
            <div className="mcc-hero-layout">
                <div className="mcc-hero-copy">
                    <p className="mcc-hero-location"><span aria-hidden="true" />San Angelo &amp; West Texas</p>
                    <p className="mcc-hero-service">Commercial cleaning, with a local point of contact.</p>
                    <h1 id="mcc-hero-title">A cleaner building.<br /><em>Less on your plate.</em></h1>
                    <p className="mcc-hero-description">Cleaning for offices, schools, churches, and commercial properties. Tell us about your space. We’ll work through the scope with you.</p>
                    <div className="mcc-hero-actions">
                        <a className="mcc-hero-call" href={'tel:' + PHONE_E164} onClick={trackCall}><Phone size={19} strokeWidth={1.7} aria-hidden="true" /><span>Call (325) 273 2203</span><ArrowUpRight size={20} aria-hidden="true" /></a>
                        <a className="mcc-hero-quote" href="#contact">Get a free quote<ArrowUpRight size={19} aria-hidden="true" /></a>
                    </div>
                    <p className="mcc-hero-reassurance">A few building details. A useful conversation. A clear next step.</p>
                    <ul className="mcc-hero-service-list" aria-label="Cleaning services">
                        <li><Check size={15} aria-hidden="true" />Recurring cleaning</li>
                        <li><Check size={15} aria-hidden="true" />Project cleanup</li>
                        <li><Check size={15} aria-hidden="true" />Floor care</li>
                    </ul>
                </div>
                <figure className="mcc-hero-visual">
                    <img src="/img/mcc-commercial-lobby-1280.webp" srcSet="/img/mcc-commercial-lobby-640.webp 640w, /img/mcc-commercial-lobby-960.webp 960w, /img/mcc-commercial-lobby-1280.webp 1280w" sizes="(max-width: 760px) 100vw, (max-width: 1080px) 45vw, 47vw" width="1280" height="1600" alt="Illustrated commercial lobby with limestone walls, a clean floor, and a neatly organized cleaning cart." fetchpriority="high" decoding="async" />
                    <div className="mcc-hero-image-note"><span aria-hidden="true" className="mcc-hero-note-mark">M.</span><p>Spaces people use.<br /><strong>Care people notice.</strong></p></div>
                    <figcaption>Commercial space illustration</figcaption>
                </figure>
            </div>
            <a className="mcc-hero-explore" href="#services"><span>Find the right service for your building</span><ArrowDown size={17} aria-hidden="true" /></a>
        </section>
    );
}
