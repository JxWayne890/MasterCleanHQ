export const MOTION_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Enhancement only. The HTML stays readable before this runs or without JS.
// Native animation effects do not rewrite React's server rendered attributes.
export function installSiteMotion(root = typeof document === 'undefined' ? null : document) {
    const doc = root?.ownerDocument || root;
    const view = doc?.defaultView;
    if (!root?.querySelectorAll || !view) return () => {};

    const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet();
    const observed = new Set();
    const running = new Map();
    const accordions = new Map();
    let frame = null;
    let disposed = false;
    let firstScan = true;

    function cancelReveal(element) {
        running.get(element)?.cancel();
        running.delete(element);
    }

    function reveal(element) {
        if (disposed) return;
        if (seen.has(element)) return;
        seen.add(element);
        observed.delete(element);
        observer?.unobserve(element);
        if (reduced.matches || !element.isConnected || typeof element.animate !== 'function') return;
        // Scrolling back up should not replay content that was already passed.
        if (element.getBoundingClientRect().bottom <= 0) return;
        const group = element.parentElement?.closest('[data-motion-group]');
        const siblings = group ? [...group.querySelectorAll('[data-motion]')].filter((item) => item.parentElement?.closest('[data-motion-group]') === group) : [];
        const delay = Math.min(Math.max(siblings.indexOf(element), 0), 3) * 70;
        const kind = element.getAttribute('data-motion');
        const distance = kind === 'fade' ? 0 : kind === 'step' ? 8 : 18;
        const duration = kind === 'step' ? 380 : 760;
        const animation = element.animate([
            { opacity: 0, translate: `0 ${distance}px` },
            { opacity: 1, translate: '0 0' },
        ], { duration, delay, easing: MOTION_EASE, fill: 'both' });
        animation.id = 'mcc-section-reveal';
        running.set(element, animation);
        animation.onfinish = () => {
            if (running.get(element) === animation) cancelReveal(element);
        };
    }

    const observer = typeof view.IntersectionObserver === 'function' ? new view.IntersectionObserver((entries) => {
        for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
    }, { rootMargin: '0px 0px 80px 0px', threshold: 0.04 }) : null;

    function enhanceAccordion(details) {
        if (accordions.has(details)) return;
        const summary = details.querySelector('summary');
        if (!summary) return;
        const originalOverflow = details.style.overflow;
        let animation = null;
        let targetOpen = details.open;

        function finish() {
            details.open = targetOpen;
            animation?.cancel();
            animation = null;
            details.style.overflow = originalOverflow;
            details.removeAttribute('data-closing');
        }

        function onClick(event) {
            if (reduced.matches || typeof details.animate !== 'function') return;
            if (event.target.closest('a, button, input, select, textarea')) return;
            event.preventDefault();
            const startHeight = details.getBoundingClientRect().height;
            targetOpen = animation ? !targetOpen : !details.open;
            animation?.cancel();
            details.open = true;
            details.removeAttribute('data-closing');
            const expandedHeight = details.getBoundingClientRect().height;
            const style = view.getComputedStyle(details);
            const borders = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
            const closedHeight = summary.getBoundingClientRect().height + borders;
            if (!targetOpen) details.setAttribute('data-closing', '');
            details.style.overflow = 'hidden';
            animation = details.animate([
                { height: `${startHeight}px` },
                { height: `${targetOpen ? expandedHeight : closedHeight}px` },
            ], { duration: 440, easing: MOTION_EASE, fill: 'both' });
            animation.id = 'mcc-accordion';
            animation.onfinish = finish;
        }

        summary.addEventListener('click', onClick);
        accordions.set(details, {
            finish: () => { if (animation) finish(); },
            dispose: () => {
                summary.removeEventListener('click', onClick);
                if (animation) finish();
            },
        });
    }

    function scan() {
        frame = null;
        if (disposed) return;
        for (const element of observed) {
            if (!element.isConnected) { observer?.unobserve(element); observed.delete(element); }
        }
        for (const element of running.keys()) if (!element.isConnected) cancelReveal(element);
        for (const [details, binding] of accordions) {
            if (!details.isConnected) { binding.dispose(); accordions.delete(details); }
        }
        if (observer && !reduced.matches) {
            for (const element of root.querySelectorAll('[data-motion]')) {
                if (seen.has(element) || observed.has(element) || element.closest('[data-motion-intro]')) continue;
                const rect = element.getBoundingClientRect();
                if (firstScan && rect.top < view.innerHeight && rect.bottom > 0) {
                    // Never hide content that the server already painted.
                    seen.add(element);
                    continue;
                }
                observed.add(element);
                observer.observe(element);
            }
        }
        for (const details of root.querySelectorAll('.mcc-faq-item, .mcc-accordion-item')) enhanceAccordion(details);
        firstScan = false;
    }

    function scheduleScan() {
        if (frame === null && !disposed) frame = view.requestAnimationFrame(scan);
    }

    function onFocus(event) {
        for (const element of observed) {
            if (element.contains(event.target)) {
                seen.add(element);
                observer?.unobserve(element);
                observed.delete(element);
            }
        }
        for (const element of running.keys()) if (element.contains(event.target)) cancelReveal(element);
    }

    function onPreferenceChange() {
        if (reduced.matches) {
            observer?.disconnect();
            observed.clear();
            for (const element of running.keys()) cancelReveal(element);
            for (const binding of accordions.values()) binding.finish();
        } else scheduleScan();
    }

    function onRouteReady(event) {
        scan();
        if (event.detail?.initial || !event.detail?.pathChanged || reduced.matches) return;
        // Reused parameterized pages keep their DOM. Restart only finished
        // intro animations, leaving newly mounted pages' first entrance alone.
        for (const element of root.querySelectorAll('[data-motion-intro] > [data-motion]')) {
            for (const animation of element.getAnimations?.() || []) {
                if (animation.animationName === 'mcc-intro-enter' && animation.playState === 'finished') {
                    animation.currentTime = 0;
                    animation.play();
                }
            }
        }
    }

    const mutations = typeof view.MutationObserver === 'function' ? new view.MutationObserver(scheduleScan) : null;
    mutations?.observe(root === doc ? doc.body : root, { childList: true, subtree: true });
    doc.addEventListener('focusin', onFocus);
    view.addEventListener('mcc:route-ready', onRouteReady);
    reduced.addEventListener('change', onPreferenceChange);
    scan();

    return () => {
        disposed = true;
        if (frame !== null) view.cancelAnimationFrame(frame);
        observer?.disconnect();
        mutations?.disconnect();
        doc.removeEventListener('focusin', onFocus);
        view.removeEventListener('mcc:route-ready', onRouteReady);
        reduced.removeEventListener('change', onPreferenceChange);
        for (const element of running.keys()) cancelReveal(element);
        for (const binding of accordions.values()) binding.dispose();
        observed.clear();
        accordions.clear();
    };
}
