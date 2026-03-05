import { useEffect } from 'react';
import { motion } from 'framer-motion';
import FAQ from '../components/FAQ';

const FaqPage = () => {
    useEffect(() => {
        // Scroll to top when mounting the FAQ page
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Minimalist Hero Section for FAQ Page */}
            <section style={{
                padding: '10rem 0 4rem',
                backgroundColor: 'var(--navy)',
                color: 'var(--white)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            lineHeight: 1.1,
                            marginBottom: '1.5rem'
                        }}
                    >
                        Frequently Asked <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Questions</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1.25rem',
                            color: 'rgba(255, 255, 255, 0.8)',
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}
                    >
                        Everything you need to know about our commercial cleaning services across West Texas.
                    </motion.p>
                </div>

                {/* Decorative Background Element */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '100%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,92,0,0.05) 0%, rgba(2,24,43,0) 70%)',
                    zIndex: 1
                }} />
            </section>

            {/* Existing FAQ Component */}
            <div style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
                <FAQ />
            </div>
        </div>
    );
};

export default FaqPage;
