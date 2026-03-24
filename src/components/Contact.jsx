import { motion } from 'framer-motion';

const Contact = () => {
    return (
        <section id="contact" style={{ backgroundColor: 'var(--off-white)', padding: '8rem 0' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '6rem'
                }}>

                    {/* Info Side */}
                    <div>
                        {/* AEO: Question-based heading */}
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{
                                fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                                color: 'var(--navy)',
                                lineHeight: 1.1,
                                marginBottom: '2rem'
                            }}
                        >
                            How do I get a cleaning quote in <span style={{ fontStyle: 'italic', color: 'var(--orange)' }}>West Texas?</span>
                        </motion.h2>

                        {/* AEO: 40-60 word answer nugget */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            style={{
                                fontSize: '1.2rem',
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-sans)',
                                marginBottom: '4rem',
                                maxWidth: '450px',
                                lineHeight: 1.7
                            }}
                        >
                            To request a free commercial cleaning estimate from Master Commercial Clean, call (325) 249-5191 or fill out the form below. We serve businesses across San Angelo, Abilene, Lubbock, Midland, Odessa, and all surrounding West Texas cities. Most quotes are provided within 24 hours.
                        </motion.p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {/* NAP: Consistent Name, Address, Phone */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                style={{ borderLeft: '2px solid var(--orange)', paddingLeft: '1.5rem' }}
                            >
                                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Direct Line
                                </p>
                                <a href="tel:+13252495191" onClick={() => { if (typeof gtag === 'function') { gtag('event', 'click_to_call', { event_category: 'contact', event_label: 'phone_hero' }); } }} style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '2.5rem',
                                    color: 'var(--navy)',
                                    textDecoration: 'none'
                                }}>
                                    (325) 249-5191
                                </a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                style={{ borderLeft: '2px solid var(--navy)', paddingLeft: '1.5rem' }}
                            >
                                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Headquarters
                                </p>
                                <p style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1.1rem',
                                    color: 'var(--navy)',
                                    fontWeight: 500
                                }}>
                                    San Angelo, Texas<br />
                                    Serving All of West Texas
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                style={{ borderLeft: '2px solid var(--navy)', paddingLeft: '1.5rem' }}
                            >
                                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Hours
                                </p>
                                <p style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1.1rem',
                                    color: 'var(--navy)',
                                    fontWeight: 500
                                }}>
                                    Mon–Fri: 7:00am – 6:00pm<br />
                                    Sat–Sun: 8:00am – 2:00pm<br />
                                    <span style={{ color: 'var(--orange)', fontSize: '0.9rem' }}>After-hours available by appointment</span>
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Form Side - Enhanced Editorial Corporate Design */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{ position: 'relative' }}
                    >
                        <div style={{
                            width: '100%',
                            backgroundColor: 'var(--white)',
                            padding: '4rem 3rem',
                            position: 'relative',
                            zIndex: 2,
                            boxShadow: '0 20px 40px rgba(2, 24, 43, 0.05)'
                        }}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // GA4: Track form submission
                                    if (typeof gtag === 'function') {
                                        gtag('event', 'generate_lead', {
                                            event_category: 'contact',
                                            event_label: 'quote_form_submit'
                                        });
                                    }
                                    alert('Thank you for your message. We will get back to you shortly!');
                                }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
                            >
                                {/* Form Group: Full Name */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                                    <label htmlFor="name" style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        color: 'var(--navy)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        opacity: 0.7
                                    }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        placeholder="Enter your name"
                                        style={{
                                            padding: '0.5rem 0',
                                            border: 'none',
                                            borderBottom: '1px solid rgba(2, 24, 43, 0.1)',
                                            backgroundColor: 'transparent',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '1.2rem',
                                            color: 'var(--navy)',
                                            outline: 'none',
                                            transition: 'border-color 0.4s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderBottomColor = 'var(--orange)'}
                                        onBlur={(e) => e.target.style.borderBottomColor = 'rgba(2, 24, 43, 0.1)'}
                                    />
                                </div>

                                {/* Form Group: Email & Phone */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                                        <label htmlFor="email" style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            color: 'var(--navy)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '2px',
                                            opacity: 0.7
                                        }}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            placeholder="email@example.com"
                                            style={{
                                                padding: '0.5rem 0',
                                                border: 'none',
                                                borderBottom: '1px solid rgba(2, 24, 43, 0.1)',
                                                backgroundColor: 'transparent',
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '1.2rem',
                                                color: 'var(--navy)',
                                                outline: 'none',
                                                transition: 'border-color 0.4s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderBottomColor = 'var(--orange)'}
                                            onBlur={(e) => e.target.style.borderBottomColor = 'rgba(2, 24, 43, 0.1)'}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                                        <label htmlFor="phone" style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            color: 'var(--navy)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '2px',
                                            opacity: 0.7
                                        }}>
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            placeholder="(325) 000-0000"
                                            style={{
                                                padding: '0.5rem 0',
                                                border: 'none',
                                                borderBottom: '1px solid rgba(2, 24, 43, 0.1)',
                                                backgroundColor: 'transparent',
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '1.2rem',
                                                color: 'var(--navy)',
                                                outline: 'none',
                                                transition: 'border-color 0.4s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderBottomColor = 'var(--orange)'}
                                            onBlur={(e) => e.target.style.borderBottomColor = 'rgba(2, 24, 43, 0.1)'}
                                        />
                                    </div>
                                </div>

                                {/* Form Group: Service Type Dropdown */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                                    <label htmlFor="service" style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        color: 'var(--navy)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        opacity: 0.7
                                    }}>
                                        Service Type
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            id="service"
                                            required
                                            defaultValue=""
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem 0',
                                                border: 'none',
                                                borderBottom: '1px solid rgba(2, 24, 43, 0.1)',
                                                backgroundColor: 'transparent',
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '1.2rem',
                                                color: 'var(--navy)',
                                                outline: 'none',
                                                appearance: 'none',
                                                cursor: 'pointer',
                                                transition: 'border-color 0.4s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderBottomColor = 'var(--orange)'}
                                            onBlur={(e) => e.target.style.borderBottomColor = 'rgba(2, 24, 43, 0.1)'}
                                        >
                                            <option value="" disabled style={{ color: 'rgba(2, 24, 43, 0.5)' }}>Select a service</option>
                                            <option value="commercial">Commercial Routine</option>
                                            <option value="construction">Post-Construction</option>
                                            <option value="specialized">Specialized Extraction</option>
                                            <option value="other">Other / Custom</option>
                                        </select>
                                        {/* Custom SVG Chevron */}
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                position: 'absolute',
                                                right: '0',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                pointerEvents: 'none',
                                                color: 'var(--navy)',
                                                opacity: 0.5
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>

                                {/* Form Group: Message */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                                    <label htmlFor="message" style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        color: 'var(--navy)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        opacity: 0.7
                                    }}>
                                        Message Details
                                    </label>
                                    <textarea
                                        id="message"
                                        rows="3"
                                        placeholder="Tell us about your facility and cleaning needs..."
                                        style={{
                                            padding: '0.5rem 0',
                                            border: 'none',
                                            borderBottom: '1px solid rgba(2, 24, 43, 0.1)',
                                            backgroundColor: 'transparent',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '1.2rem',
                                            color: 'var(--navy)',
                                            outline: 'none',
                                            resize: 'none',
                                            transition: 'border-color 0.4s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderBottomColor = 'var(--orange)'}
                                        onBlur={(e) => e.target.style.borderBottomColor = 'rgba(2, 24, 43, 0.1)'}
                                    />
                                </div>

                                {/* Elevated Submit Button */}
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: 'var(--navy)',
                                        color: 'var(--white)',
                                        padding: '1.25rem 2.5rem',
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '3px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        marginTop: '2rem',
                                        alignSelf: 'flex-start',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--orange)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(255, 92, 0, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--navy)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Send Request
                                    <span style={{ fontSize: '1.2rem', transition: 'transform 0.4s ease' }}>&rarr;</span>
                                </button>
                            </form>
                        </div>

                        {/* Minimalist Decorative Outline */}
                        <div style={{
                            position: 'absolute',
                            top: '15px',
                            right: '-15px',
                            width: '100%',
                            height: '100%',
                            border: '1px solid var(--orange)',
                            zIndex: 1,
                            opacity: 0.3
                        }} />
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Contact;
