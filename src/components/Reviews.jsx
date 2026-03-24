import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const reviewsData = [
    {
        text: "Master Commercial Clean transformed our office! The attention to detail is unmatched, and our staff loves coming into a fresh-smelling workspace. Highly recommend!",
        author: "Alex J.",
        rating: 5
    },
    {
        text: "Exceptional service. Highly professional. They arrive exactly on time, execute flawlessly, and always secure the building when they leave.",
        author: "Sebastian L.",
        rating: 5
    },
    {
        text: "MCC provided great ongoing construction cleanup. They handled the deep cleaning without ever disrupting my crew's workflow. Lifesavers.",
        author: "Ray C.",
        rating: 5
    }
];

const StarRating = ({ rating }) => (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }} aria-label={`${rating} out of 5 stars`}>
        {Array(rating).fill(null).map((_, i) => (
            <span key={i} style={{ color: 'var(--orange)', fontSize: '1.1rem' }}>★</span>
        ))}
    </div>
);

const Reviews = () => {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
    const x2 = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);

    return (
        <section
            id="testimonials"
            ref={containerRef}
            style={{
                padding: '10rem 0',
                backgroundColor: 'var(--white)',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <div className="container" style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Client Operations
                </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {/* Marquee Row 1 */}
                <motion.div style={{ x: x1, display: 'flex', whiteSpace: 'nowrap', gap: '4rem' }}>
                    {Array(4).fill(null).map((_, i) => (
                        <div key={`m1-${i}`} style={{ display: 'flex', gap: '4rem' }}>
                            <span style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(3rem, 6vw, 5rem)',
                                color: 'var(--navy)',
                                lineHeight: 1
                            }}>
                                "The attention to detail is unmatched."
                            </span>
                            <span style={{ color: 'var(--orange)', fontSize: '4rem' }}>*</span>
                        </div>
                    ))}
                </motion.div>

                {/* Marquee Row 2 (Reverse) */}
                <motion.div style={{ x: x2, display: 'flex', whiteSpace: 'nowrap', gap: '4rem', marginLeft: '-20vw' }}>
                    {Array(4).fill(null).map((_, i) => (
                        <div key={`m2-${i}`} style={{ display: 'flex', gap: '4rem' }}>
                            <span style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 'clamp(3rem, 6vw, 5rem)',
                                color: 'rgba(2, 24, 43, 0.4)',
                                lineHeight: 1
                            }}>
                                "Execute flawlessly."
                            </span>
                            <span style={{ color: 'var(--orange)', fontSize: '4rem' }}>*</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Actual Review Cards in Grid — Semantic <blockquote> + <cite> */}
            <div className="container" style={{ marginTop: '8rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '4rem'
                }}>
                    {reviewsData.map((review, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            style={{
                                borderTop: '1px solid var(--navy)',
                                paddingTop: '2rem'
                            }}
                        >
                            <StarRating rating={review.rating} />
                            <blockquote style={{ margin: 0 }}>
                                <p style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1.25rem',
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.6,
                                    fontWeight: 500,
                                    marginBottom: '1rem'
                                }}>
                                    "{review.text}"
                                </p>
                                <cite style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    fontStyle: 'normal',
                                    fontWeight: 600,
                                    letterSpacing: '0.5px'
                                }}>
                                    — {review.author}
                                </cite>
                            </blockquote>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Reviews;
