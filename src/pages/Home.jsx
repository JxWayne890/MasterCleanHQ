import { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import ServicesAccordion from '../components/Services';
import ServiceAreas from '../components/ServiceAreas';
import Reviews from '../components/Reviews';
import KeyTakeaways from '../components/KeyTakeaways';
import Contact from '../components/Contact';
import SEO from '../components/SEO';
import { buildBaseSchemas, buildBreadcrumbSchema, buildServiceSchema, buildWebPageSchema } from '../seo/schemas';
import { servicePages } from '../data/servicePages';

const Home = () => {
    useEffect(() => {
        // Scroll to top when mounting the home page
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    return (
        <>
            <SEO
                title="Commercial Cleaning Services in West Texas | Master Commercial Clean"
                description="Commercial cleaning, post-construction cleanup, and specialized janitorial services across San Angelo, Abilene, Lubbock, Midland, Odessa, and West Texas."
                path="/"
                schemas={[
                    ...buildBaseSchemas(),
                    buildWebPageSchema({
                        path: '/',
                        title: 'Commercial Cleaning Services in West Texas | Master Commercial Clean',
                        description: 'Commercial cleaning, post-construction cleanup, and specialized janitorial services across West Texas.',
                    }),
                    buildBreadcrumbSchema([{ name: 'Home', path: '/' }]),
                    ...servicePages.map((service) => buildServiceSchema(service)),
                ]}
            />
            <Hero />
            <About />
            <ServicesAccordion />
            <ServiceAreas />
            <Reviews />
            <KeyTakeaways />
            <Contact />
        </>
    );
};

export default Home;
