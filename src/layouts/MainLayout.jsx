import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

const MainLayout = () => {
    return (
        <div className="app-container">
            <ScrollToTop />
            <Navbar />
            <main id="main-content" tabIndex="-1" style={{ minHeight: '100vh' }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
