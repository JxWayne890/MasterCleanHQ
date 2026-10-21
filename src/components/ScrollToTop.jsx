import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();
    const previousPath = useRef(null);

    useBrowserLayoutEffect(() => {
        const initial = previousPath.current === null;
        const pathChanged = previousPath.current !== pathname;
        previousPath.current = pathname;
        if (pathChanged) {
            // Reset after the new route is ready, before paint. A page change
            // must not inherit the smooth behavior intended for anchor links.
            let anchor = hash.slice(1);
            try { anchor = decodeURIComponent(anchor); } catch { /* Keep a malformed fragment literal. */ }
            const target = hash ? document.getElementById(anchor) : null;
            const root = document.documentElement;
            const behavior = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
            else if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            root.style.scrollBehavior = behavior;
        }
        window.dispatchEvent(new CustomEvent('mcc:route-ready', { detail: { initial, pathChanged } }));
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
