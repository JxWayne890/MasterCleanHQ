import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
    return (
        <div className="app-container">
            <Navbar />
            <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
