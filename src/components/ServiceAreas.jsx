import { motion } from 'framer-motion';

const serviceAreas = [
    {
        region: 'Concho Valley',
        cities: ['San Angelo', 'Ballinger', 'Brady', 'Coleman', 'Eldorado', 'Sonora', 'Junction', 'Mason']
    },
    {
        region: 'Permian Basin',
        cities: ['Midland', 'Odessa', 'Andrews', 'Pecos', 'Monahans', 'Crane', 'Fort Stockton', 'Kermit']
    },
    {
        region: 'South Plains',
        cities: ['Lubbock', 'Lamesa', 'Levelland', 'Plainview', 'Brownfield', 'Snyder', 'Post', 'Slaton']
    },
    {
        region: 'Big Country',
        cities: ['Abilene', 'Sweetwater', 'Brownwood', 'Cisco', 'Eastland', 'Haskell', 'Merkel', 'Clyde']
    },
    {
        region: 'Additional Areas',
        cities: ['Big Spring', 'Colorado City', 'Sterling City', 'Robert Lee', 'Winters', 'Santa Anna', 'Ozona', 'McCamey']
    }
];

const ServiceAreas = () => {
    return (
        <section id="service-areas" className="section" style={{ backgroundColor: 'var(--off-white)' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ marginBottom: '4rem' }}
                >
                    {/* AEO: Question-based H2 */}
                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        color: 'var(--navy)',
                        lineHeight: 1.1,
                        marginBottom: '2rem'
                    }}>
                        What cities does Master Commercial Clean serve in West Texas?
                    </h2>
                    <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--orange)', marginBottom: '2rem' }} />

                    {/* AEO: 40-60 word answer nugget */}
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '800px',
                        lineHeight: 1.7
                    }}>
                        Master Commercial Clean provides commercial cleaning and janitorial services across all of West Texas. We serve businesses in San Angelo, Abilene, Lubbock, Midland, Odessa, and over 30 surrounding cities spanning the Concho Valley, Permian Basin, South Plains, and Big Country regions. No job is too far.
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {serviceAreas.map((area, idx) => (
                        <motion.div
                            key={area.region}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            style={{
                                backgroundColor: 'var(--white)',
                                padding: '2.5rem 2rem',
                                borderTop: '3px solid var(--orange)',
                                position: 'relative'
                            }}
                        >
                            <h3 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.5rem',
                                color: 'var(--navy)',
                                marginBottom: '1.5rem'
                            }}>
                                {area.region}
                            </h3>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {area.cities.map((city) => (
                                    <li key={city} style={{
                                        fontFamily: 'var(--font-sans)',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '1rem'
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        {city}, TX
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        marginTop: '4rem',
                        padding: '3rem',
                        backgroundColor: 'var(--navy)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '2rem'
                    }}
                >
                    <div>
                        <h3 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            Don't see your city listed?
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-sans)', fontSize: '1.1rem' }}>
                            We regularly service communities throughout West Texas. Contact us to confirm coverage in your area.
                        </p>
                    </div>
                    <a
                        href="tel:+13252495191"
                        style={{
                            backgroundColor: 'var(--orange)',
                            color: 'var(--white)',
                            padding: '1rem 2.5rem',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            display: 'inline-block',
                            transition: 'background-color 0.3s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Call (325) 249-5191
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default ServiceAreas;
