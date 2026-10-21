import { useEffect } from 'react';
import { installSiteMotion } from '../lib/siteMotion';

export default function SiteMotion() {
    useEffect(() => installSiteMotion(document), []);
    return null;
}
