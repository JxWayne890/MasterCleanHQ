import { Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import { getPage } from './routing/pageRegistry';

const FaqHubPage = getPage('FaqHubPage');
const ServicePage = getPage('ServicePage');
const ServicesIndex = getPage('ServicesIndex');
const ServiceAreasIndex = getPage('ServiceAreasIndex');
const ServiceAreaPage = getPage('ServiceAreaPage');
const ComboPage = getPage('ComboPage');
const BlogIndex = getPage('BlogIndex');
const BlogPostPage = getPage('BlogPostPage');
const GuidesIndex = getPage('GuidesIndex');
const CostGuidePage = getPage('CostGuidePage');
const AboutPage = getPage('AboutPage');
const AboutProcessPage = getPage('AboutProcessPage');
const WhyChooseUsPage = getPage('WhyChooseUsPage');
const ReviewsPage = getPage('ReviewsPage');
const ContactPage = getPage('ContactPage');
const ApplyPage = getPage('ApplyPage');

function ParamPage({ component: Component }) {
    return <Component {...useParams()} />;
}

function PageBoundary({ children }) {
    return (
        <Suspense fallback={<div className="container" role="status" aria-live="polite" style={{ padding: '10rem 0 6rem' }}>Loading page…</div>}>
            {children}
            <ScrollToTop />
        </Suspense>
    );
}

const AppRoutes = () => (
    <Routes>
        <Route element={<MainLayout />}>
            <Route path="/" element={<PageBoundary><Home /></PageBoundary>} />
            <Route path="/services" element={<PageBoundary><ServicesIndex /></PageBoundary>} />
            <Route path="/commercial-cleaning" element={<PageBoundary><ServicePage serviceSlug="commercial-cleaning" /></PageBoundary>} />
            <Route path="/post-construction-cleaning" element={<PageBoundary><ServicePage serviceSlug="post-construction-cleaning" /></PageBoundary>} />
            <Route path="/specialized-cleaning" element={<PageBoundary><ServicePage serviceSlug="specialized-cleaning" /></PageBoundary>} />
            <Route path="/service-areas" element={<PageBoundary><ServiceAreasIndex /></PageBoundary>} />
            <Route path="/service-areas/:slug" element={<PageBoundary><ParamPage component={ServiceAreaPage} /></PageBoundary>} />
            <Route path="/service-areas/:citySlug/:serviceSlug" element={<PageBoundary><ParamPage component={ComboPage} /></PageBoundary>} />
            <Route path="/blog" element={<PageBoundary><BlogIndex /></PageBoundary>} />
            <Route path="/blog/:slug" element={<PageBoundary><ParamPage component={BlogPostPage} /></PageBoundary>} />
            <Route path="/guides" element={<PageBoundary><GuidesIndex /></PageBoundary>} />
            <Route path="/guides/:guideSlug" element={<PageBoundary><ParamPage component={CostGuidePage} /></PageBoundary>} />
            <Route path="/guides/:guideSlug/:citySlug" element={<PageBoundary><ParamPage component={CostGuidePage} /></PageBoundary>} />
            <Route path="/about" element={<PageBoundary><AboutPage /></PageBoundary>} />
            <Route path="/about/process" element={<PageBoundary><AboutProcessPage /></PageBoundary>} />
            <Route path="/about/why-choose-us" element={<PageBoundary><WhyChooseUsPage /></PageBoundary>} />
            <Route path="/reviews" element={<PageBoundary><ReviewsPage /></PageBoundary>} />
            <Route path="/faq" element={<PageBoundary><FaqHubPage /></PageBoundary>} />
            <Route path="/contact" element={<PageBoundary><ContactPage /></PageBoundary>} />
            <Route path="/apply" element={<PageBoundary><ApplyPage /></PageBoundary>} />
            <Route path="/apply/start" element={<PageBoundary><ApplyPage /></PageBoundary>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
    </Routes>
);

export default AppRoutes;
