import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactSection from '../components/ContactSection';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const steps = [
    { number: '01', title: 'Walk-Through & Assessment', desc: 'We visit your facility to assess square footage, layout, traffic patterns, surface types, and any specialty requirements. This in-person evaluation ensures the quote reflects your actual space — not a generic estimate.' },
    { number: '02', title: 'Custom Scope & Quote', desc: 'Based on the walk-through, we build a detailed scope of work that specifies every task, frequency, and standard. You receive a clear, itemized quote within 24 hours. No hidden fees, no vague terms.' },
    { number: '03', title: 'Schedule & Onboarding', desc: 'Once the scope is approved, we set the cleaning schedule around your operating hours. Our crews are briefed on your facility specifics, access procedures, and any security requirements before the first visit.' },
    { number: '04', title: 'Consistent Service Delivery', desc: 'Each visit follows the documented scope of work. Our crews use professional-grade equipment and products matched to your facility type and surface materials. The same tasks happen the same way, every time.' },
    { number: '05', title: 'Quality Control & Communication', desc: 'We maintain open communication and periodic quality reviews. If anything needs adjustment — scope changes, schedule shifts, or feedback — we address it promptly and update the plan accordingly.' },
];

const AboutProcessPage = () => {
    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Our Cleaning Process | How Master Commercial Clean Works"
                description="Learn how Master Commercial Clean delivers consistent commercial cleaning — from initial walkthrough to ongoing quality control."
                path="/about/process"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/about/process', title: 'Our Cleaning Process', description: 'How Master Commercial Clean delivers consistent commercial cleaning services.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }, { name: 'Our Process', path: '/about/process' }]),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <motion.p initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>How We Work</motion.p>
                    <motion.h1 initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05 }}>
                        Our <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Process</span>
                    </motion.h1>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }, { name: 'Our Process', path: '/about/process' }]} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                                whileInView={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                                viewport={{ once: true }}
                                transition={ENABLE_MOTION ? { delay: i * 0.1 } : undefined}
                                style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'start', padding: '2rem', backgroundColor: 'var(--white)', borderLeft: '3px solid var(--orange)' }}
                            >
                                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--orange)', lineHeight: 1 }}>{step.number}</span>
                                <div>
                                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>{step.title}</h2>
                                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '1.05rem' }}>{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection heading="Ready to Get Started?" subheading="The first step is a free walk-through. Call us or fill out the form to schedule yours." />
        </div>
    );
};

export default AboutProcessPage;
