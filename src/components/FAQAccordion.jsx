import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQAccordion = ({ faqs, title = 'Frequently Asked Questions' }) => {
    const [openIndex, setOpenIndex] = useState(null);

    if (!faqs || faqs.length === 0) return null;

    return (
        <div style={{ marginTop: '3rem' }}>
            {title && (
                <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                    color: 'var(--navy)',
                    marginBottom: '2rem',
                }}>
                    {title}
                </h2>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    const q = faq.question || faq.q;
                    const a = faq.answer || faq.a;
                    return (
                        <div key={index} style={{
                            borderBottom: '1px solid rgba(2, 24, 43, 0.1)',
                        }}>
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                aria-expanded={isOpen}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.5rem 0',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    gap: '1rem',
                                }}
                            >
                                <span style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1.05rem',
                                    fontWeight: 600,
                                    color: 'var(--navy)',
                                    lineHeight: 1.4,
                                }}>
                                    {q}
                                </span>
                                <span style={{
                                    fontSize: '1.5rem',
                                    color: 'var(--orange)',
                                    transition: 'transform 0.3s ease',
                                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                                    flexShrink: 0,
                                    lineHeight: 1,
                                }}>
                                    +
                                </span>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <p style={{
                                            fontFamily: 'var(--font-sans)',
                                            color: 'var(--text-secondary)',
                                            lineHeight: 1.7,
                                            paddingBottom: '1.5rem',
                                            fontSize: '1rem',
                                            margin: 0,
                                        }}>
                                            {a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FAQAccordion;
