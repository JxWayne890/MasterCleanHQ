export const SITE_URL = 'https://www.mastercleanhq.com';
export const SITE_NAME = 'Master Commercial Clean';
export const SITE_TAGLINE = 'Commercial Cleaning Services Across West Texas';
export const PHONE_DISPLAY = '(325) 249-5191';
export const PHONE_E164 = '+13252495191';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/img/logo.png`;

export const PRIMARY_SERVICE_CITIES = [
    'San Angelo',
    'Abilene',
    'Lubbock',
    'Midland',
    'Odessa',
];

export const FULL_SERVICE_AREA_COPY = 'San Angelo, Abilene, Lubbock, Midland, Odessa, and surrounding West Texas communities';

export function buildAbsoluteUrl(path = '/') {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return new URL(normalizedPath, SITE_URL).toString();
}
