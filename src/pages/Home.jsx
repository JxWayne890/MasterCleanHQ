import { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import ServicesAccordion from '../components/Services';
import ServiceAreas from '../components/ServiceAreas';
import Reviews from '../components/Reviews';
import Contact from '../components/Contact';

const Home = () => {
    useEffect(() => {
        // Scroll to top when mounting the home page
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Hero />
            <About />
            <ServicesAccordion />
            <ServiceAreas />
            <Reviews />
            <Contact />
        </>
    );
};

export default Home;
