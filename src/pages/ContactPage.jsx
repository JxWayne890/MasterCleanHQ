import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import Contact from '../components/Contact';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';

const ContactPage = () => {
    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Contact Master Commercial Clean | Free Estimate | (325) 273-2203"
                description="Request a free commercial cleaning estimate for your West Texas business. Call (325) 273-2203 or fill out our contact form."
                path="/contact"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/contact', title: 'Contact Us', description: 'Request a free commercial cleaning estimate.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]),
                ]}
            />

            <section style={{ padding: '10rem 0 2rem', backgroundColor: 'var(--navy)', color: 'var(--white)', textAlign: 'center' }}>
                <div className="container" data-motion-group data-motion-intro>
                    <h1 data-motion="rise"
                        style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05, marginBottom: '1rem' }}
                    >
                        Contact <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Us</span>
                    </h1>
                    <p data-motion="rise"
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto' }}
                    >
                        Get a free estimate for commercial cleaning services anywhere in West Texas.
                    </p>
                    <Link to="/apply" style={{ display: 'inline-flex', marginTop: '1.5rem', color: 'var(--white)', borderBottom: '1px solid var(--orange)', paddingBottom: '0.35rem', fontFamily: 'var(--font-sans)', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                        Interested in joining our cleaning team? Apply here →
                    </Link>
                </div>
            </section>

            <div style={{ marginTop: '-2rem' }}>
                <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
                <Contact />
            </div>
        </div>
    );
};

export default ContactPage;
