import QuoteForm from '../components/QuoteForm';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Check, HardHat, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import Hero from '../components/Hero';
import SEO from '../components/SEO';
import { buildBaseSchemas, buildBreadcrumbSchema, buildServiceSchema, buildWebPageSchema } from '../seo/schemas';
import { servicePages } from '../data/servicePages';
import { PHONE_DISPLAY, PHONE_E164, PRIMARY_SERVICE_CITIES } from '../config/site';
import './Home.css';

const pathways = [
    { title: 'Commercial cleaning', label: 'For your everyday operations', icon: Building2, description: 'Keep offices, retail spaces and shared facilities clean, welcoming and ready for business.', details: ['Recurring janitorial service', 'Restrooms, floors & common areas'], slug: 'commercial-cleaning' },
    { title: 'Construction cleanup', label: 'For your next handover', icon: HardHat, description: 'Turn a finished project into a space that is ready for its next chapter, down to the final detail.', details: ['Fine dust & residue removal', 'Fixtures, glass & final detailing'], slug: 'post-construction-cleaning' },
    { title: 'Specialized cleaning', label: 'For the jobs that need more', icon: Sparkles, description: 'A focused cleaning plan for deeper sanitation, facility resets and spaces with specific needs.', details: ['Deep cleaning & targeted disinfection', 'Custom scopes for your facility'], slug: 'specialized-cleaning' },
];

const Home = () => (
    <div className="home-page">
        <SEO
            title="Commercial Cleaning Services in West Texas | Master Commercial Clean"
            description="Dependable commercial cleaning, construction cleanup and specialized cleaning across West Texas. Call Master Commercial Clean for a free walkthrough estimate."
            path="/"
            schemas={[
                ...buildBaseSchemas(),
                buildWebPageSchema({ path: '/', title: 'Commercial Cleaning Services in West Texas | Master Commercial Clean', description: 'Commercial cleaning, construction cleanup and specialized janitorial services across West Texas.' }),
                buildBreadcrumbSchema([{ name: 'Home', path: '/' }]),
                ...servicePages.map((service) => buildServiceSchema(service)),
            ]}
        />
        <Hero />
        <section className="home-services home-section" aria-labelledby="home-services-title">
            <div className="container">
                <div className="home-section-heading">
                    <div><p className="home-eyebrow">The right clean for your space</p><h2 id="home-services-title">Your business has standards.<br />So do we.</h2></div>
                    <p>From your daily routine to your next big opening, find the cleaning support your facility needs.</p>
                </div>
                <div className="home-service-grid">
                    {pathways.map(({ title, label, icon: Icon, description, details, slug }, index) => (
                        <Link to={`/${slug}`} className="home-service-card" key={slug}>
                            <div className="home-service-top"><Icon size={30} strokeWidth={1.4} aria-hidden="true" /><span>0{index + 1}</span></div>
                            <p className="home-service-label">{label}</p>
                            <h3>{title}</h3><p className="home-service-description">{description}</p>
                            <ul>{details.map((detail) => <li key={detail}><Check size={15} aria-hidden="true" />{detail}</li>)}</ul>
                            <span className="home-service-link">Explore service <ArrowRight size={18} aria-hidden="true" /></span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
        <section className="home-standards home-section" aria-labelledby="home-standards-title">
            <div className="container home-standards-grid">
                <div className="home-promise">
                    <ShieldCheck size={42} strokeWidth={1.2} aria-hidden="true" />
                    <span className="home-eyebrow">Our commitment to your business</span>
                    <strong>100<span>%</span></strong><h3>Satisfaction guarantee.</h3>
                    <p>A clean workplace should be one less thing on your mind. We stand behind the work we do.</p>
                    <Link to="/about/why-choose-us">Meet your cleaning partner <ArrowRight size={18} aria-hidden="true" /></Link>
                </div>
                <div className="home-standards-copy">
                    <p className="home-eyebrow">Confidence in the details</p>
                    <h2 id="home-standards-title">Built around the way<br />you do business.</h2>
                    <p>Your facility has its own traffic, hours and priorities. Your cleaning plan should reflect them.</p>
                    <div className="home-standard"><span>01</span><div><h3>A clear scope from the start</h3><p>A free walkthrough helps define your spaces, priorities and cleaning frequency before service begins.</p></div></div>
                    <div className="home-standard"><span>02</span><div><h3>A schedule that works for you</h3><p>Day, night and weekend options keep cleaning aligned with your operating hours.</p></div></div>
                    <div className="home-standard"><span>03</span><div><h3>Attention beyond the surface</h3><p>Documented routines and quality checks help keep the details of your cleaning plan on track.</p></div></div>
                </div>
            </div>
        </section>
        <section className="home-area" aria-labelledby="home-area-title">
            <div className="container home-area-inner">
                <div><p className="home-eyebrow"><MapPin size={16} aria-hidden="true" /> West Texas, covered</p><h2 id="home-area-title">Local roots. Regional reach.</h2><p>{PRIMARY_SERVICE_CITIES.join(' · ')}<br />And surrounding West Texas communities.</p></div>
                <Link className="home-text-link" to="/service-areas">Explore our service areas <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
        </section>
        <section id="contact" className="home-quote home-section" aria-labelledby="home-quote-title" tabIndex="-1">
            <div className="container home-quote-grid">
                <div><p className="home-eyebrow">Let’s talk about your space</p><h2 id="home-quote-title">Your next clean<br />starts <em>here.</em></h2><p>Request a free walkthrough estimate using the form, or give us a call. We’ll talk through your facility, define the scope and find a schedule that fits.</p><a className="home-button" href={`tel:${PHONE_E164}`}><Phone size={18} aria-hidden="true" />Call {PHONE_DISPLAY.replace('-', ' ')}<ArrowRight size={18} aria-hidden="true" /></a><p className="home-quote-hours">Monday to Friday, 7am to 6pm<br />Saturday &amp; Sunday, 8am to 2pm</p></div>
                <QuoteForm />
            </div>
        </section>
        <section className="home-faq home-section" aria-labelledby="home-faq-title">
            <div className="container home-faq-grid">
                <div><p className="home-eyebrow">A few helpful answers</p><h2 id="home-faq-title">Before we get started.</h2><Link className="home-text-link" to="/faq">View all FAQs <ArrowRight size={18} aria-hidden="true" /></Link></div>
                <div>
                    <details><summary>How much does commercial cleaning cost?</summary><p>Pricing depends on your facility’s size, traffic, cleaning frequency and scope. A free walkthrough gives us the details needed for a quote tailored to your space.</p></details>
                    <details><summary>Can you clean outside business hours?</summary><p>Yes. Day, night and weekend scheduling is available so your cleaning plan can fit around your business.</p></details>
                    <details><summary>Do you serve businesses outside the main cities?</summary><p>We serve communities throughout West Texas. Call with your facility’s location to confirm coverage and discuss scheduling.</p></details>
                </div>
            </div>
        </section>
    </div>
);

export default Home;
