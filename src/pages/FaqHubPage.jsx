import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import FAQAccordion from '../components/FAQAccordion';
import ContactSection from '../components/ContactSection';
import { servicePages } from '../data/servicePages';
import { buildBaseSchemas, buildBreadcrumbSchema, buildFaqSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const generalFaqs = [
    { question: 'What cities does Master Commercial Clean serve in West Texas?', answer: 'Master Commercial Clean serves 50+ cities across West Texas including San Angelo, Abilene, Lubbock, Midland, Odessa, Big Spring, Sweetwater, Snyder, Andrews, Pecos, Brady, Brownwood, Coleman, Ballinger, Lamesa, and many surrounding communities. We cover the Concho Valley, Big Country, Permian Basin, and South Plains regions.' },
    { question: 'How much does commercial cleaning cost in West Texas?', answer: 'Commercial cleaning costs depend on facility size, cleaning frequency, scope of work, and facility type. We provide free on-site walk-throughs so the quote matches your actual space. Call (325) 249-5191 to schedule an estimate.' },
    { question: 'Does Master Commercial Clean offer after-hours cleaning?', answer: 'Yes. We offer flexible scheduling including evenings, nights, weekends, and holiday windows to minimize disruption to your business operations.' },
    { question: 'How quickly can Master Commercial Clean start service?', answer: 'In most cases we can begin service within 48 hours of the initial consultation. We schedule a walk-through, provide a detailed quote, and start service once the scope is confirmed.' },
    { question: 'Is Master Commercial Clean licensed and insured?', answer: 'Yes. We carry full commercial liability insurance and follow professional safety and sanitation procedures. We can provide proof of insurance upon request.' },
    { question: 'What cleaning products does Master Commercial Clean use?', answer: 'We use professional-grade commercial cleaning products and equipment selected for each facility type, surface material, and sanitation requirement. We do not use consumer-grade substitutes.' },
    { question: 'Can I customize my cleaning plan?', answer: 'Absolutely. Every cleaning plan is built from a facility walk-through. We tailor the task list, frequency, schedule, and quality-control checkpoints to your specific building and needs.' },
    { question: 'What types of businesses do you serve?', answer: 'We serve offices, retail stores, banks, medical-adjacent spaces, warehouses, churches, event facilities, property management common areas, restaurants, and professional service firms across West Texas.' },
];

const allServiceFaqs = servicePages.flatMap((service) =>
    service.faqs.map((faq) => ({ ...faq, serviceLabel: service.navLabel }))
);

const FaqHubPage = () => {
    const allFaqs = [...generalFaqs, ...servicePages.flatMap((s) => s.faqs)];

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="FAQ | Commercial Cleaning Questions & Answers | Master Commercial Clean"
                description="Answers about pricing, scheduling, service areas, and cleaning quality for West Texas commercial cleaning services."
                path="/faq"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/faq', title: 'FAQ | Commercial Cleaning Questions & Answers', description: 'Answers about commercial cleaning in West Texas.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]),
                    buildFaqSchema(allFaqs, '/faq'),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.h1 initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        Frequently Asked <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Questions</span>
                    </motion.h1>
                    <motion.p initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} transition={ENABLE_MOTION ? { delay: 0.1 } : undefined} style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: '700px', margin: '0 auto' }}>
                        Everything you need to know about our commercial cleaning services across West Texas.
                    </motion.p>
                </div>
                <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(255,92,0,0.05) 0%, rgba(2,24,43,0) 70%)', zIndex: 1 }} />
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]} />

                    <FAQAccordion faqs={generalFaqs} title="General Questions" />

                    {servicePages.map((service) => (
                        <div key={service.slug} style={{ marginTop: '3rem' }}>
                            <FAQAccordion faqs={service.faqs} title={`${service.navLabel} Questions`} />
                            <Link to={`/${service.slug}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--orange)', textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
                                Learn more about {service.navLabel} &rarr;
                            </Link>
                        </div>
                    ))}

                    <div style={{ marginTop: '4rem', backgroundColor: 'var(--white)', padding: '3rem', borderTop: '3px solid var(--orange)' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '1.5rem' }}>Related Resources</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {[
                                { label: 'Commercial Cleaning', to: '/commercial-cleaning', desc: 'Recurring janitorial support' },
                                { label: 'Post-Construction Cleanup', to: '/post-construction-cleaning', desc: 'Detailed cleanup for builds' },
                                { label: 'Specialized Cleaning', to: '/specialized-cleaning', desc: 'Custom high-detail scopes' },
                                { label: 'Service Areas', to: '/service-areas', desc: '50+ cities in West Texas' },
                                { label: 'Cost Guides', to: '/guides', desc: 'Budgeting resources' },
                                { label: 'Blog', to: '/blog', desc: 'Expert cleaning articles' },
                            ].map((link) => (
                                <Link key={link.to} to={link.to} style={{ display: 'block', padding: '1.25rem', backgroundColor: 'var(--off-white)', textDecoration: 'none', borderLeft: '3px solid var(--navy)', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem' }}>{link.label} &rarr;</h3>
                                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{link.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <ContactSection />
        </div>
    );
};

export default FaqHubPage;
