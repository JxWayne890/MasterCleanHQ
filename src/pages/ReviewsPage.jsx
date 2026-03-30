import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactSection from '../components/ContactSection';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';
import { SITE_URL } from '../config/site';

const reviews = [
    { name: 'Property Manager', location: 'San Angelo, TX', text: 'Master Commercial Clean has been handling our office building for several months now. Consistent quality, no missed visits, and they communicate well when anything changes. Exactly what we needed.', rating: 5 },
    { name: 'General Contractor', location: 'Midland, TX', text: 'Used MCC for post-construction cleanup on a tenant improvement project. They were thorough with the fine dust and had the space inspection-ready on schedule. Will use again.', rating: 5 },
    { name: 'Retail Store Owner', location: 'Abilene, TX', text: 'Our store looks great every morning when we open. The cleaning crew is reliable and professional. They handle everything from floors to restrooms without us having to manage any of it.', rating: 5 },
    { name: 'Office Manager', location: 'Lubbock, TX', text: 'Switched to Master Commercial Clean after our previous janitorial company kept missing tasks. The documented scope of work made a huge difference — we know exactly what is being done and when.', rating: 5 },
    { name: 'Medical Office Administrator', location: 'Odessa, TX', text: 'We needed a cleaning service that understood sanitation standards for a medical-adjacent space. MCC built a custom plan that covers everything from waiting room to exam rooms. Very satisfied.', rating: 5 },
    { name: 'Church Administrator', location: 'San Angelo, TX', text: 'Master Commercial Clean handles our fellowship hall and sanctuary cleaning. They work around our event schedule and always leave the building ready for Sunday. Highly recommend.', rating: 5 },
];

const ReviewsPage = () => {
    const reviewSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Master Commercial Clean',
        url: SITE_URL,
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5.0',
            reviewCount: String(reviews.length),
            bestRating: '5',
            worstRating: '1',
        },
        review: reviews.map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.name },
            reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5' },
            reviewBody: r.text,
        })),
    };

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Reviews | What Clients Say About Master Commercial Clean"
                description="Read reviews from West Texas businesses about Master Commercial Clean's janitorial services. 5-star rated commercial cleaning."
                path="/reviews"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path: '/reviews', title: 'Client Reviews', description: 'Reviews from West Texas businesses.' }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Reviews', path: '/reviews' }]),
                    reviewSchema,
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <motion.p initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>Client Feedback</motion.p>
                    <motion.h1 initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false} animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined} style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1.05 }}>
                        What Clients <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Say</span>
                    </motion.h1>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Reviews', path: '/reviews' }]} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                        {reviews.map((review, i) => (
                            <motion.div
                                key={i}
                                initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                                whileInView={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                                viewport={{ once: true }}
                                transition={ENABLE_MOTION ? { delay: i * 0.1 } : undefined}
                                style={{ backgroundColor: 'var(--white)', padding: '2.5rem', borderTop: '3px solid var(--orange)' }}
                            >
                                <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                                    {[...Array(review.rating)].map((_, j) => (
                                        <span key={j} style={{ color: 'var(--orange)', fontSize: '1.2rem' }}>&#9733;</span>
                                    ))}
                                </div>
                                <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1rem', fontStyle: 'italic' }}>
                                    &ldquo;{review.text}&rdquo;
                                </p>
                                <div>
                                    <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{review.name}</p>
                                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>{review.location}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection heading="Join Our Satisfied Clients" subheading="See why businesses across West Texas trust Master Commercial Clean. Request your free estimate today." />
        </div>
    );
};

export default ReviewsPage;
