import { Outlet, useMatch } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SiteMotion from '../components/SiteMotion';

const MainLayout = () => {
    const hideContactDetails = Boolean(useMatch('/walkthroughs'));
    return (
        <div className="app-container">
            <SiteMotion />
            <Navbar hideContactDetails={hideContactDetails} />
            <main id="main-content" tabIndex="-1" style={{ minHeight: '100vh' }}>
                <Outlet />
            </main>
            <Footer hideContactDetails={hideContactDetails} />
        </div>
    );
};

export default MainLayout;
