import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import FaqPage from './pages/FaqPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/faq" element={<FaqPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
