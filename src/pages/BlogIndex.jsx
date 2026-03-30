import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactSection from '../components/ContactSection';
import { blogPosts } from '../data/blogPosts';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const categories = [
    { key: 'all', label: 'All Articles' },
    { key: 'guides', label: 'Guides' },
    { key: 'comparisons', label: 'Comparisons' },
    { key: 'seasonal', label: 'Seasonal' },
    { key: 'tips', label: 'Tips' },
    { key: 'local', label: 'Local' },
    { key: 'industry', label: 'Industry' },
    { key: 'data', label: 'Data & Research' },
];

const BlogIndex = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const sorted = [...blogPosts].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    const filtered = activeCategory === 'all' ? sorted : sorted.filter((p) => p.category === activeCategory);

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Commercial Cleaning Blog | Expert Tips & Guides | Master Commercial Clean"
                description="Expert articles on commercial cleaning, janitorial best practices, and facility maintenance for West Texas businesses."
                path="/blog"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({
                        path: '/blog',
                        title: 'Commercial Cleaning Blog | Master Commercial Clean',
                        description: 'Expert articles on commercial cleaning and facility maintenance for West Texas businesses.',
                    }),
                    buildBreadcrumbSchema([
                        { name: 'Home', path: '/' },
                        { name: 'Blog', path: '/blog' },
                    ]),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--orange)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        Expert Insights
                    </motion.p>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontSize: 'clamp(3rem, 6vw, 5.25rem)', lineHeight: 1.05, marginBottom: '1.5rem' }}
                    >
                        The MCC <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Blog</span>
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', maxWidth: '760px' }}
                    >
                        Practical guides, industry insights, and expert tips on commercial cleaning from the Master Commercial Clean team.
                    </motion.p>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[
                        { name: 'Home', path: '/' },
                        { name: 'Blog', path: '/blog' },
                    ]} />

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '3rem' }}>
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    border: 'none',
                                    backgroundColor: activeCategory === cat.key ? 'var(--navy)' : 'var(--white)',
                                    color: activeCategory === cat.key ? 'var(--white)' : 'var(--navy)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {filtered.map((post) => (
                            <Link
                                key={post.slug}
                                to={`/blog/${post.slug}`}
                                style={{
                                    display: 'block',
                                    backgroundColor: 'var(--white)',
                                    textDecoration: 'none',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(2,24,43,0.08)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{
                                            fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--orange)',
                                        }}>
                                            {post.category}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {post.readTime}
                                        </span>
                                    </div>
                                    <h2 style={{
                                        fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--navy)', lineHeight: 1.3, marginBottom: '0.75rem',
                                    }}>
                                        {post.title}
                                    </h2>
                                    <p style={{
                                        fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem',
                                    }}>
                                        {post.excerpt}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>
                                            Read More &rarr;
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection />
        </div>
    );
};

export default BlogIndex;
