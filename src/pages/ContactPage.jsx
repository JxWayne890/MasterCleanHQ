import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import Contact from '../components/Contact';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const ContactPage = () => {
    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Contact Master Commercial Clean | Free Estimate | (325) 249-5191"
                description="Request a free commercial cleaning estimate for your West Texas business. Call (325) 249-5191 or fill out our contact form."
                path="/contact"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/contact', title: 'Contact Us', description: 'Request a free commercial cleaning estimate.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]),
                ]}
            />

            <section style={{ padding: '10rem 0 2rem', backgroundColor: 'var(--navy)', color: 'var(--white)', textAlign: 'center' }}>
                <div className="container">
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05, marginBottom: '1rem' }}
                    >
                        Contact <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Us</span>
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto' }}
                    >
                        Get a free estimate for commercial cleaning services anywhere in West Texas.
                    </motion.p>
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
