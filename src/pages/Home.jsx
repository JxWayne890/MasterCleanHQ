import Hero, { ClientTrustBar } from '../components/Hero';
import HomeSections, { homeFaqs } from '../components/home/HomeSections';
import Contact from '../components/Contact';
import SEO from '../components/SEO';
import { SITE_URL } from '../config/site';
import { buildBaseSchemas, buildFaqSchema, buildWebPageSchema } from '../seo/schemas';

export default function Home() {
    const title = 'Commercial Cleaning in San Angelo & West Texas | Master Commercial Clean';
    const description = 'Commercial cleaning for offices, schools, churches and commercial properties in San Angelo and West Texas. Call (325) 273 2203 to discuss your building and get a free quote.';
    return (
        <div className="mcc-home-page">
            <SEO title={title} description={description} path="/" image={SITE_URL + '/img/mcc-home-social.png'} schemas={[
                ...buildBaseSchemas(),
                buildWebPageSchema({ path: '/', title, description }),
                buildFaqSchema(homeFaqs, '/'),
            ]} />
            <Hero />
            <ClientTrustBar />
            <HomeSections />
            <Contact />
        </div>
    );
}
