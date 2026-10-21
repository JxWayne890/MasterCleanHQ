import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ContactSection from '../components/ContactSection';
import { locations, getLocationsByRegion } from '../data/locations';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';

const regions = [
    { key: 'concho-valley', name: 'Concho Valley', hub: 'San Angelo' },
    { key: 'big-country', name: 'Big Country', hub: 'Abilene' },
    { key: 'permian-basin', name: 'Permian Basin', hub: 'Midland / Odessa' },
    { key: 'south-plains', name: 'South Plains', hub: 'Lubbock' },
];

const ServiceAreasIndex = () => {
    return (
        <div style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh' }}>
            <SEO
                title="Service Areas | Commercial Cleaning Across West Texas | Master Commercial Clean"
                description="Master Commercial Clean serves 50+ cities across West Texas including San Angelo, Abilene, Lubbock, Midland, and Odessa. Find your city."
                path="/service-areas"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({
                        path: '/service-areas',
                        title: 'Service Areas | Commercial Cleaning Across West Texas',
                        description: 'Commercial cleaning services across 50+ West Texas cities.',
                    }),
                    buildBreadcrumbSchema([
                        { name: 'Home', path: '/' },
                        { name: 'Service Areas', path: '/service-areas' },
                    ]),
                ]}
            />

            <section style={{
                padding: '10rem 0 4rem',
                backgroundColor: 'var(--navy)',
                color: 'var(--white)',
            }}>
                <div className="container" data-motion-group data-motion-intro style={{ maxWidth: '1100px' }}>
                    <p data-motion="rise"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            color: 'var(--orange)',
                            marginBottom: '1rem',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                        }}
                    >
                        West Texas Coverage
                    </p>
                    <h1 data-motion="rise"
                        style={{
                            fontSize: 'clamp(3rem, 6vw, 5.25rem)',
                            lineHeight: 1.05,
                            marginBottom: '1.5rem',
                        }}
                    >
                        Our Service <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>Areas</span>
                    </h1>
                    <p data-motion="rise"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1.2rem',
                            lineHeight: 1.7,
                            color: 'rgba(255,255,255,0.82)',
                            maxWidth: '760px',
                        }}
                    >
                        Master Commercial Clean provides commercial cleaning, post-construction cleanup, and specialized janitorial services across {locations.length}+ cities in West Texas. Based in San Angelo, we serve the Concho Valley, Big Country, Permian Basin, and South Plains regions.
                    </p>
                </div>
            </section>

            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <Breadcrumbs items={[
                        { name: 'Home', path: '/' },
                        { name: 'Service Areas', path: '/service-areas' },
                    ]} />

                    <aside style={{ background: "var(--white)", borderLeft: "3px solid var(--orange)", padding: "2rem", marginBottom: "3rem" }}>
                        <h2 data-motion="rise" style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Need a commercial cleaning partner elsewhere in Texas?</h2>
                        <p style={{ marginBottom: "1rem", lineHeight: 1.7 }}>For Greater Houston and Dallas Fort Worth, our referral network reviews requests from established commercial businesses and seeks a suitable local cleaning partner. Partner availability is confirmed separately from our direct West Texas service.</p>
                        <a href="/partner-network" style={{ color: "var(--navy)", textDecoration: "underline", fontWeight: 700 }}>Explore the Texas partner network →</a>
                    </aside>

                    {regions.map((region) => {
                        const regionLocations = getLocationsByRegion(region.key);
                        if (regionLocations.length === 0) return null;
                        return (
                            <div key={region.key} style={{ marginBottom: '4rem' }}>
                                <h2 data-motion="rise" style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '2rem',
                                    color: 'var(--navy)',
                                    marginBottom: '0.5rem',
                                }}>
                                    {region.name}
                                </h2>
                                <p style={{
                                    fontFamily: 'var(--font-sans)',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '1.5rem',
                                    fontSize: '1rem',
                                }}>
                                    Hub: {region.hub}
                                </p>
                                <div data-motion-group style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: '1rem',
                                }}>
                                    {regionLocations.map((loc) => (
                                        <Link data-motion="rise"
                                            key={loc.slug}
                                            to={`/service-areas/${loc.slug}`}
                                            style={{
                                                display: 'block',
                                                padding: '1.25rem',
                                                backgroundColor: 'var(--white)',
                                                textDecoration: 'none',
                                                borderLeft: loc.isHub ? '3px solid var(--orange)' : '3px solid var(--navy)',
                                                transition: 'transform 300ms cubic-bezier(.22,.61,.36,1), box-shadow 300ms ease',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(2,24,43,0.08)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <h3 style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontWeight: 700,
                                                color: 'var(--navy)',
                                                fontSize: '1rem',
                                                marginBottom: '0.25rem',
                                            }}>
                                                {loc.name}, TX {loc.isHub && <span style={{ color: 'var(--orange)', fontSize: '0.75rem' }}>HUB</span>}
                                            </h3>
                                            <p style={{
                                                fontFamily: 'var(--font-sans)',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.85rem',
                                                margin: 0,
                                            }}>
                                                {loc.county} &middot; {loc.population}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <ContactSection heading="Need Commercial Cleaning in West Texas?" subheading="We serve businesses in every city listed above. Call for a free estimate or request a quote online." />
        </div>
    );
};

export default ServiceAreasIndex;
