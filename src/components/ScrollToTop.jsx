import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const target = hash && document.getElementById(hash.slice(1));
            if (target) {
                target.scrollIntoView();
                target.focus({ preventScroll: true });
                return;
            }
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
