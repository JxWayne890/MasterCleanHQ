import { ArrowDown, ArrowUpRight, Building2, Check, ClipboardCheck, FileCheck2, Handshake, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import TexasQuoteForm from '../components/TexasQuoteForm';
import './texas.css';

const steps = [
    { number: '01', title: 'Tell us what you need.', copy: 'Share your city, facility size, cleaning schedule, and any special requirements.' },
    { number: '02', title: 'MCC reviews the fit.', copy: 'We review your request and look for a vetted partner whose coverage and capabilities match your facility.' },
    { number: '03', title: 'Meet one local partner.', copy: 'We introduce you to one company. They discuss the scope with you and prepare a quote.' },
    { number: '04', title: 'Choose with confidence.', copy: 'Review the proposal and decide whether to move forward. Your service agreement is with the cleaning partner.' },
];

const services = [
    { icon: Building2, name: 'Recurring commercial cleaning', copy: 'Offices, retail spaces, professional buildings, and shared spaces with a regular cleaning schedule.' },
    { icon: Sparkles, name: 'Deep cleaning and floor care', copy: 'A focused scope for detailed cleaning, floor maintenance, and facility resets.' },
    { icon: ClipboardCheck, name: 'Construction cleanup', copy: 'Cleaning for commercial renovations, tenant improvements, and building turnover.' },
];

const TexasPage = () => (
    <div className="texas-page">
        <SEO
            title="Texas Commercial Cleaning Referrals | Master Commercial Clean"
            description="Request a commercial cleaning quote through MCC, based in San Angelo. Partner referrals for Greater Houston and Dallas Fort Worth, with one local company per request."
            path="/texas"
            schemas={[{
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Texas Commercial Cleaning Referrals',
                description: 'MCC connects businesses outside its West Texas crew coverage with a vetted local cleaning partner, starting with Greater Houston and Dallas Fort Worth.',
                url: 'https://www.mastercleanhq.com/texas',
            }]}
        />
        <section className="texas-hero" aria-labelledby="texas-title">
            <div className="container texas-hero-grid">
                <div className="texas-hero-copy">
                    <p className="texas-eyebrow">The MCC Texas referral network</p>
                    <h1 id="texas-title">A cleaner workplace.<br />A <em>local connection.</em></h1>
                    <p className="texas-hero-intro">Your business needs a cleaning company that understands your facility. We help you find the right local partner.</p>
                    <p className="texas-hero-detail">Master Commercial Clean is based in San Angelo. Our crews serve San Angelo and West Texas. For businesses outside our crew coverage, we make partner referrals, starting with Greater Houston and Dallas Fort Worth.</p>
                    <a className="texas-button" href="#texas-quote">Request a cleaning quote <ArrowUpRight size={21} aria-hidden="true" /></a>
                    <a className="texas-hero-secondary" href="#texas-how">See how it works <ArrowDown size={16} aria-hidden="true" /></a>
                </div>
                <aside className="texas-network" aria-label="How our Texas coverage works">
                    <div className="texas-network-top"><span>Texas, connected.</span><MapPin size={23} strokeWidth={1.4} aria-hidden="true" /></div>
                    <div className="texas-network-origin">
                        <span className="texas-location-marker" aria-hidden="true" />
                        <div><span className="texas-network-label">MCC is based in</span><h2>San Angelo</h2></div>
                    </div>
                    <div className="texas-network-coverage"><span>MCC crews</span><p>San Angelo &amp; West Texas</p></div>
                    <div className="texas-network-divider"><span>Outside our crew coverage</span></div>
                    <div className="texas-network-city"><div><span className="texas-network-label">Partner referrals</span><h3>Greater Houston</h3></div><ArrowUpRight size={26} strokeWidth={1.25} aria-hidden="true" /></div>
                    <div className="texas-network-city"><div><span className="texas-network-label">Partner referrals</span><h3>Dallas Fort Worth</h3></div><ArrowUpRight size={26} strokeWidth={1.25} aria-hidden="true" /></div>
                    <p className="texas-network-footnote">One request. One selected partner.<br />Availability is confirmed after review.</p>
                </aside>
            </div>
        </section>

        <div className="texas-principles"><div className="container"><span><Handshake size={19} aria-hidden="true" /> One partner per referral</span><span><ShieldCheck size={19} aria-hidden="true" /> Insurance reviewed before access</span><span><FileCheck2 size={19} aria-hidden="true" /> A quote for your specific facility</span></div></div>

        <section className="texas-section" id="texas-how" aria-labelledby="texas-how-title">
            <div className="container">
                <div className="texas-section-heading"><p className="texas-eyebrow">How it works</p><h2 id="texas-how-title">From your request<br />to the right conversation.</h2><p>A straightforward introduction, with room to ask the questions that matter to your business.</p></div>
                <ol className="texas-steps">{steps.map(step => <li key={step.number}><span className="texas-step-number">{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></li>)}</ol>
            </div>
        </section>

        <section className="texas-vetting" aria-labelledby="texas-vetting-title">
            <div className="container texas-vetting-grid">
                <div><p className="texas-eyebrow">What comes before an introduction</p><h2 id="texas-vetting-title">Local service.<br /><em>A considered standard.</em></h2><p>Partners apply to the MCC network. We review their business, references, service coverage, and insurance before approving access to customer requests.</p><p>Approval is a starting point. Your scope, pricing, and service agreement are discussed directly with the partner.</p></div>
                <ul className="texas-vetting-list">
                    <li><Check size={20} aria-hidden="true" /><div><h3>Relevant capabilities</h3><p>Service areas, facility types, services offered, and whether work uses in house crews or subcontractors.</p></div></li>
                    <li><Check size={20} aria-hidden="true" /><div><h3>Business references</h3><p>Three references submitted for MCC to review as part of the application.</p></div></li>
                    <li><Check size={20} aria-hidden="true" /><div><h3>Insurance documentation</h3><p>General liability, workers compensation or an alternative, auto coverage, and a janitorial bond, reviewed for requirements and expiration dates.</p></div></li>
                    <li><Check size={20} aria-hidden="true" /><div><h3>A signed partner agreement</h3><p>Partners must sign the MCC agreement and keep current insurance on file before they can view lead details.</p></div></li>
                </ul>
            </div>
        </section>

        <section className="texas-section texas-services" aria-labelledby="texas-services-title">
            <div className="container">
                <div className="texas-section-heading"><p className="texas-eyebrow">Built around your building</p><h2 id="texas-services-title">The cleaning your<br />business actually needs.</h2><p>Tell us what your facility needs. Services depend on the selected partner’s capabilities and the agreed scope.</p></div>
                <div className="texas-services-grid">{services.map(({ icon: Icon, name, copy }) => <article key={name}><Icon size={31} strokeWidth={1.4} aria-hidden="true" /><h3>{name}</h3><p>{copy}</p></article>)}</div>
            </div>
        </section>

        <section className="texas-quote-section" id="texas-quote" aria-labelledby="texas-quote-title">
            <div className="container texas-quote-layout">
                <div className="texas-quote-aside"><p className="texas-eyebrow">Start with your space</p><h2 id="texas-quote-title">A local quote.<br /><em>A clear next step.</em></h2><p>Managing an office, commercial property, or larger facility? Send us the details and we will review your request.</p><div className="texas-quote-market"><MapPin size={18} aria-hidden="true" /><p>Initial referral markets:<br /><strong>Greater Houston<br />Dallas Fort Worth</strong></p></div><p className="texas-fee-disclosure">MCC may receive a referral fee from the partner; it never changes your price.</p></div>
                <TexasQuoteForm />
            </div>
        </section>
    </div>
);

export default TexasPage;
