import { createElement, lazy } from 'react';
import { Navigate } from 'react-router-dom';

// The static renderer needs synchronous components. The browser fetches
// secondary pages only when their route is visited.
const serverPages = import.meta.env.SSR
    ? import.meta.glob('../pages/*.jsx', { eager: true })
    : {};
const serverData = import.meta.env.SSR
    ? import.meta.glob('../data/*.js', { eager: true })
    : {};
const pageLoaders = import.meta.glob('../pages/*.jsx');
const dataLoaders = import.meta.glob('../data/*.js');

function adaptPage(Page, name, data) {
    if (name === 'ServicePage') {
        return function ServiceRoute({ serviceSlug }) {
            const service = data.servicePages.find((item) => item.slug === serviceSlug);
            return service
                ? createElement(Page, { service })
                : createElement(Navigate, { to: '/', replace: true });
        };
    }
    if (name === 'CostGuidePage') {
        return function CostGuideRoute(props) {
            const location = props.citySlug
                ? data.locations.find((item) => item.slug === props.citySlug && item.isHub)
                : undefined;
            if (props.citySlug && !location) return createElement(Navigate, { to: '/', replace: true });
            return createElement(Page, { ...props, location });
        };
    }
    return Page;
}

export function getPage(name) {
    const pagePath = `../pages/${name}.jsx`;
    const dataPath = name === 'ServicePage'
        ? '../data/servicePages.js'
        : name === 'CostGuidePage' ? '../data/locations.js' : null;

    if (import.meta.env.SSR) {
        return adaptPage(serverPages[pagePath].default, name, dataPath ? serverData[dataPath] : null);
    }

    return lazy(async () => {
        const [page, data] = await Promise.all([
            pageLoaders[pagePath](),
            dataPath ? dataLoaders[dataPath]() : null,
        ]);
        return { default: adaptPage(page.default, name, data) };
    });
}
