import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import FaqPage from './pages/FaqPage';
import ServicePage from './pages/ServicePage';
import { servicePages } from './data/servicePages';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/faq" element={<FaqPage />} />
                {servicePages.map((service) => (
                    <Route
                        key={service.slug}
                        path={`/${service.slug}`}
                        element={<ServicePage service={service} />}
                    />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
