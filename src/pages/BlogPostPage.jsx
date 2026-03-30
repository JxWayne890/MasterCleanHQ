import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import FAQAccordion from '../components/FAQAccordion';
import ContactSection from '../components/ContactSection';
import { blogPosts, getBlogPostBySlug } from '../data/blogPosts';
import { servicePages } from '../data/servicePages';
import {
    buildBaseSchemas,
    buildArticleSchema,
    buildBreadcrumbSchema,
    buildFaqSchema,
    buildWebPageSchema,
} from '../seo/schemas';
import { ENABLE_MOTION } from '../lib/motion';

const BlogPostPage = ({ slug }) => {
    const post = getBlogPostBySlug(slug);
    if (!post) return <Navigate to="/blog" replace />;

    const path = `/blog/${post.slug}`;
    const relatedServices = (post.relatedServices || [])
        .map((s) => servicePages.find((sp) => sp.slug === s))
        .filter(Boolean);
    const relatedPosts = blogPosts
        .filter((p) => p.slug !== post.slug && p.category === post.category)
        .slice(0, 3);

    const renderContent = () => {
        const elements = [];
        let tableIndex = 0;

        post.content.forEach((para, i) => {
            const heading = post.headings.find((h) => h.paragraphIndex === i);
            if (heading) {
                elements.push(
                    <h2 key={`h-${i}`} style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        color: 'var(--navy)',
                        marginTop: '2.5rem',
                        marginBottom: '1rem',
                        lineHeight: 1.2,
                    }}>
                        {heading.text}
                    </h2>
                );
            }

            elements.push(
                <p key={`p-${i}`} style={{
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                    marginBottom: '1.5rem',
                    fontSize: '1.05rem',
                }}>
                    {para}
                </p>
            );

            // Insert tables and stats at logical positions
            if (post.tables && post.tables[tableIndex] && i === Math.floor(post.content.length * (tableIndex + 1) / (post.tables.length + 1))) {
                const table = post.tables[tableIndex];
                elements.push(
                    <div key={`table-${tableIndex}`} style={{ margin: '2rem 0', overflowX: 'auto' }}>
                        {table.caption && (
                            <p style={{
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                color: 'var(--navy)',
                                fontSize: '0.95rem',
                                marginBottom: '0.75rem',
                            }}>
                                {table.caption}
                            </p>
                        )}
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.9rem',
                        }}>
                            <thead>
                                <tr>
                                    {table.headers.map((header, hi) => (
                                        <th key={hi} style={{
                                            backgroundColor: 'var(--navy)',
                                            color: 'var(--white)',
                                            padding: '0.75rem 1rem',
                                            textAlign: 'left',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {table.rows.map((row, ri) => (
                                    <tr key={ri} style={{
                                        backgroundColor: ri % 2 === 0 ? 'var(--white)' : 'var(--off-white)',
                                    }}>
                                        {row.map((cell, ci) => (
                                            <td key={ci} style={{
                                                padding: '0.75rem 1rem',
                                                borderBottom: '1px solid rgba(2,24,43,0.08)',
                                                color: 'var(--text-secondary)',
                                            }}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                tableIndex++;
            }
        });

        return elements;
    };

    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title={post.metaTitle}
                description={post.metaDescription}
                path={path}
                type="article"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({ path, title: post.metaTitle, description: post.metaDescription }),
                    buildBreadcrumbSchema([
                        { name: 'Home', path: '/' },
                        { name: 'Blog', path: '/blog' },
                        { name: post.title, path },
                    ]),
                    buildArticleSchema({ title: post.title, description: post.metaDescription, path, publishDate: post.publishDate }),
                    post.faqs.length > 0 && buildFaqSchema(post.faqs, path),
                ]}
            />

            <section style={{ padding: '10rem 0 4rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <motion.div
                        initial={ENABLE_MOTION ? { opacity: 0, y: 20 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}
                    >
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--orange)' }}>
                            {post.category}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>&middot;</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                            {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>&middot;</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                            {post.readTime}
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}
                    >
                        {post.title}
                    </motion.h1>
                    <motion.p
                        initial={ENABLE_MOTION ? { opacity: 0, y: 30 } : false}
                        animate={ENABLE_MOTION ? { opacity: 1, y: 0 } : undefined}
                        transition={ENABLE_MOTION ? { delay: 0.1 } : undefined}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}
                    >
                        {post.excerpt}
                    </motion.p>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[
                        { name: 'Home', path: '/' },
                        { name: 'Blog', path: '/blog' },
                        { name: post.title, path },
                    ]} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr min(280px, 30%)', gap: '3rem', alignItems: 'start' }}>
                        <article style={{ maxWidth: '100%' }}>
                            {renderContent()}

                            {/* Stats block */}
                            {post.stats && post.stats.length > 0 && (
                                <div style={{ margin: '2.5rem 0', padding: '2rem', backgroundColor: 'var(--navy)', color: 'var(--white)' }}>
                                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--orange)', marginBottom: '1.5rem' }}>
                                        Key Statistics
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                                        {post.stats.map((stat, i) => (
                                            <div key={i}>
                                                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--orange)', marginBottom: '0.25rem' }}>
                                                    {stat.value}
                                                </p>
                                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.25rem' }}>
                                                    {stat.label}
                                                </p>
                                                {stat.source && (
                                                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                                                        Source: {stat.source}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FAQ section */}
                            {post.faqs && post.faqs.length > 0 && (
                                <FAQAccordion faqs={post.faqs} title="Frequently Asked Questions" />
                            )}

                            {/* Citations */}
                            {post.citations && post.citations.length > 0 && (
                                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(2,24,43,0.1)' }}>
                                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                                        Sources
                                    </h3>
                                    <ol style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {post.citations.map((cite, i) => (
                                            <li key={i}>{cite}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </article>

                        {/* Sidebar */}
                        <aside style={{ position: 'sticky', top: '100px' }}>
                            {relatedServices.length > 0 && (
                                <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderTop: '3px solid var(--orange)', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', fontSize: '1rem', marginBottom: '1rem' }}>
                                        Related Services
                                    </h3>
                                    {relatedServices.map((s) => (
                                        <Link key={s.slug} to={`/${s.slug}`} style={{
                                            display: 'block', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: 'var(--off-white)', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 500, transition: 'transform 0.2s',
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                        >
                                            {s.navLabel} &rarr;
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {relatedPosts.length > 0 && (
                                <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderTop: '3px solid var(--navy)' }}>
                                    <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--navy)', fontSize: '1rem', marginBottom: '1rem' }}>
                                        More Articles
                                    </h3>
                                    {relatedPosts.map((p) => (
                                        <Link key={p.slug} to={`/blog/${p.slug}`} style={{
                                            display: 'block', padding: '0.75rem 0', borderBottom: '1px solid rgba(2,24,43,0.06)', textDecoration: 'none',
                                        }}>
                                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 500, lineHeight: 1.4 }}>
                                                {p.title}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </section>

            <ContactSection />
        </div>
    );
};

export default BlogPostPage;
