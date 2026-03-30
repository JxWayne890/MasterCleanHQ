import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactSection from '../components/ContactSection';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const differentiators = [
    { title: 'Documented Scopes of Work', desc: 'Every engagement is built on a written scope that specifies tasks, frequencies, and quality standards. No ambiguity, no missed expectations.', icon: '📋' },
    { title: 'West Texas Expertise', desc: 'We understand the unique challenges of commercial cleaning in this region — from Permian Basin dust to summer heat to hard water mineral buildup. Our processes account for local conditions.', icon: '🌵' },
    { title: 'Flexible Scheduling', desc: 'Nightly, weekly, and custom schedules built around your operating hours. We clean when it is least disruptive to your business.', icon: '🕐' },
    { title: 'Regional Coverage', desc: 'From San Angelo to Lubbock, Abilene to Midland-Odessa, we serve 50+ cities across West Texas. Multi-location businesses get consistent service across all sites.', icon: '📍' },
    { title: '100% Satisfaction Guarantee', desc: 'If a visit does not meet our standards or yours, we will return and make it right at no additional cost. Our reputation depends on consistent quality.', icon: '✓' },
    { title: 'Professional Equipment', desc: 'We invest in commercial-grade equipment and professional cleaning products — not consumer-grade substitutes. The right tools deliver better results and protect your surfaces.', icon: '🔧' },
];

const WhyChooseUsPage = () => {
    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Why Choose Master Commercial Clean | West Texas Janitorial"
                description="Documented scopes, West Texas expertise, flexible scheduling, and 100% satisfaction guarantee. See what sets Master Commercial Clean apart."
                path="/about/why-choose-us"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/about/why-choose-us', title: 'Why Choose Master Commercial Clean', description: 'What sets Master Commercial Clean apart from other janitorial companies in West Texas.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }, { name: 'Why Choose Us', path: '/about/why-choose-us' }]),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <motion.p initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Our Differentiators</motion.p>
                    <motion.h1 initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05 }}>
                        Why Choose <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Us</span>
                    </motion.h1>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }, { name: 'Why Choose Us', path: '/about/why-choose-us' }]} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {differentiators.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                                whileInView={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                                viewport={{ once: true }}
                                transition={ENABLE_MOTION ? { delay: i * 0.1 } : undefined}
                                style={{ backgroundColor: 'var(--white)', padding: '2.5rem', borderTop: '3px solid var(--navy)' }}
                            >
                                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>{item.icon}</span>
                                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>{item.title}</h2>
                                <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '1rem' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection />
        </div>
    );
};

export default WhyChooseUsPage;
