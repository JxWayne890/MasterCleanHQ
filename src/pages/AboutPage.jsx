import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactSection from '../components/ContactSection';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const AboutPage = () => {
    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="About Master Commercial Clean | West Texas Commercial Cleaning"
                description="Founded in October 2024, Master Commercial Clean provides professional janitorial services across West Texas from our San Angelo headquarters."
                path="/about"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/about', title: 'About Master Commercial Clean', description: 'Professional commercial cleaning services across West Texas since October 2024.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        Our Story
                    </motion.p>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05, marginBottom: '1.5rem' }}
                    >
                        About <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Master Commercial Clean</span>
                    </motion.h1>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />

                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                        Founded on Reliability
                    </h2>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                        Master Commercial Clean was founded in October 2024 in San Angelo, Texas, with a straightforward mission: deliver reliable, professional commercial cleaning services that West Texas businesses can depend on. From day one, we built our operation around clear communication, documented scopes of work, and consistent follow-through.
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                        West Texas is a unique operating environment. The climate is harsh — extreme summer heat, persistent wind-driven dust, low humidity, and occasional severe weather all create challenges that generic cleaning companies from outside the region do not fully understand. We built our processes and equipment choices around these realities because we live and work here every day.
                    </p>

                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--navy)', marginTop: '3rem', marginBottom: '1rem' }}>
                        What We Do
                    </h2>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                        We provide three core service lines — commercial cleaning for recurring janitorial needs, post-construction cleanup for contractors and property owners, and specialized cleaning for facilities that require tighter sanitation standards or custom scopes. Each service is built around a documented cleaning plan with defined expectations, not vague promises.
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                        We serve businesses across San Angelo, Abilene, Lubbock, Midland, Odessa, and more than 50 surrounding West Texas communities. Our coverage area spans the Concho Valley, Big Country, Permian Basin, and South Plains regions — a geographic footprint that allows us to support multi-location businesses and contractors working across the region.
                    </p>

                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--navy)', marginTop: '3rem', marginBottom: '1rem' }}>
                        Our Approach
                    </h2>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                        Every client engagement starts with a walk-through. We assess the facility, discuss your priorities, and build a scope of work that matches the actual needs of the building — not a one-size-fits-all template. This means the quote you receive is specific to your space, your schedule, and your standards.
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                        We believe that a cleaning company should be invisible — your facility should look consistently professional without you having to manage the details. That is what we deliver: dependable service, documented quality, and responsive communication when you need it.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
                        <Link to="/about/process" style={{ display: 'block', padding: '2rem', backgroundColor: 'var(--white)', textDecoration: 'none', borderTop: '3px solid var(--orange)', transition: 'transform 0.3s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>Our Process &rarr;</h3>
                            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>How we work from walkthrough to ongoing service</p>
                        </Link>
                        <Link to="/about/why-choose-us" style={{ display: 'block', padding: '2rem', backgroundColor: 'var(--white)', textDecoration: 'none', borderTop: '3px solid var(--navy)', transition: 'transform 0.3s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>Why Choose Us &rarr;</h3>
                            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>What sets Master Commercial Clean apart</p>
                        </Link>
                    </div>
                </div>
            </section>

            <ContactSection />
        </div>
    );
};

export default AboutPage;
