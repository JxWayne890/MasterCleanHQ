import { motion } from 'framer-motion';

const Hero = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.4
            }
        }
    };

    const item = {
        hidden: { y: 150, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }
    };

    return (
        <section
            id="home"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                backgroundColor: 'var(--navy)',
                color: 'var(--white)',
                overflow: 'hidden',
                paddingTop: '80px'
            }}
        >
            {/* Background Graphic Element */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50vw',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
                zIndex: 0
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    style={{ maxWidth: '1000px' }}
                >
                    <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
                        <motion.p
                            variants={item}
                            style={{
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                color: 'var(--orange)',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                fontSize: '0.9rem',
                                display: 'inline-block',
                                borderBottom: '1px solid var(--orange)',
                                paddingBottom: '4px'
                            }}
                        >
                            Serving San Angelo, Abilene, Lubbock, Midland, Odessa & All of West Texas
                        </motion.p>
                    </div>

                    <div style={{ overflow: 'hidden' }}>
                        <motion.h1
                            variants={item}
                            style={{
                                fontSize: 'clamp(3rem, 7vw, 6.5rem)',
                                lineHeight: 1.05,
                                color: 'var(--white)'
                            }}
                        >
                            West Texas Commercial <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Cleaning</span> Experts.
                        </motion.h1>
                    </div>

                    {/* AEO Answer Nugget — 40-60 word direct answer block */}
                    <div style={{ overflow: 'hidden', marginTop: '2.5rem' }}>
                        <motion.p
                            variants={item}
                            style={{
                                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                                color: 'rgba(255, 255, 255, 0.85)',
                                maxWidth: '650px',
                                lineHeight: 1.6,
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 400
                            }}
                        >
                            Master Commercial Clean provides reliable, industrial-grade commercial cleaning and janitorial services for businesses across West Texas — including San Angelo, Abilene, Lubbock, Midland, and Odessa. We specialize in office cleaning, post-construction cleanup, and specialized sanitation with a 100% satisfaction guarantee.
                        </motion.p>
                    </div>

                    <div style={{ overflow: 'hidden', marginTop: '4rem' }}>
                        <motion.div variants={item} style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <a
                                href="#contact"
                                style={{
                                    backgroundColor: 'var(--orange)',
                                    color: 'var(--white)',
                                    padding: '1.25rem 3rem',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    display: 'inline-block',
                                    transition: 'background-color 0.3s, transform 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#cc4900';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--orange)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Get a Free Estimate
                            </a>

                            <a
                                href="tel:+13252495191"
                                style={{
                                    color: 'var(--white)',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                                    paddingBottom: '4px',
                                    transition: 'border-color 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--orange)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)'}
                            >
                                Call (325) 249-5191 <span>&rarr;</span>
                            </a>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
