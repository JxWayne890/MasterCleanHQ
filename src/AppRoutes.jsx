import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import FaqHubPage from './pages/FaqHubPage';
import ServicePage from './pages/ServicePage';
import ServicesIndex from './pages/ServicesIndex';
import ServiceAreasIndex from './pages/ServiceAreasIndex';
import ServiceAreaPage from './pages/ServiceAreaPage';
import ComboPage from './pages/ComboPage';
import BlogIndex from './pages/BlogIndex';
import BlogPostPage from './pages/BlogPostPage';
import GuidesIndex from './pages/GuidesIndex';
import CostGuidePage from './pages/CostGuidePage';
import AboutPage from './pages/AboutPage';
import AboutProcessPage from './pages/AboutProcessPage';
import WhyChooseUsPage from './pages/WhyChooseUsPage';
import ReviewsPage from './pages/ReviewsPage';
import ContactPage from './pages/ContactPage';
import { servicePages } from './data/servicePages';
import { locations } from './data/locations';
import { blogPosts } from './data/blogPosts';
import { costGuides } from './data/costGuides';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Home */}
                <Route path="/" element={<Home />} />

                {/* Services */}
                <Route path="/services" element={<ServicesIndex />} />
                {servicePages.map((service) => (
                    <Route
                        key={service.slug}
                        path={`/${service.slug}`}
                        element={<ServicePage service={service} />}
                    />
                ))}

                {/* Service Areas */}
                <Route path="/service-areas" element={<ServiceAreasIndex />} />
                {locations.map((location) => (
                    <Route
                        key={location.slug}
                        path={`/service-areas/${location.slug}`}
                        element={<ServiceAreaPage slug={location.slug} />}
                    />
                ))}

                {/* Service + City Combo Pages */}
                {locations.map((location) =>
                    servicePages.map((service) => (
                        <Route
                            key={`${location.slug}-${service.slug}`}
                            path={`/service-areas/${location.slug}/${service.slug}`}
                            element={<ComboPage citySlug={location.slug} serviceSlug={service.slug} />}
                        />
                    ))
                )}

                {/* Blog */}
                <Route path="/blog" element={<BlogIndex />} />
                {blogPosts.map((post) => (
                    <Route
                        key={post.slug}
                        path={`/blog/${post.slug}`}
                        element={<BlogPostPage slug={post.slug} />}
                    />
                ))}

                {/* Cost Guides */}
                <Route path="/guides" element={<GuidesIndex />} />
                {costGuides.map((guide) => (
                    <Route
                        key={guide.slug}
                        path={`/guides/${guide.slug}`}
                        element={<CostGuidePage guideSlug={guide.slug} />}
                    />
                ))}
                {/* City-specific cost guides for hub cities */}
                {costGuides.map((guide) =>
                    locations.filter((l) => l.isHub).map((location) => (
                        <Route
                            key={`${guide.slug}-${location.slug}`}
                            path={`/guides/${guide.slug}/${location.slug}`}
                            element={<CostGuidePage guideSlug={guide.slug} citySlug={location.slug} location={location} />}
                        />
                    ))
                )}

                {/* About */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/about/process" element={<AboutProcessPage />} />
                <Route path="/about/why-choose-us" element={<WhyChooseUsPage />} />

                {/* Reviews */}
                <Route path="/reviews" element={<ReviewsPage />} />

                {/* FAQ */}
                <Route path="/faq" element={<FaqHubPage />} />

                {/* Contact */}
                <Route path="/contact" element={<ContactPage />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
