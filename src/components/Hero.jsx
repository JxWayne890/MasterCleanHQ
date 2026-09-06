import { ArrowRight, Phone, ShieldCheck, Clock3, CheckCircle2 } from 'lucide-react';
import { PHONE_DISPLAY, PHONE_E164 } from '../config/site';

const Hero = () => (
    <>
        <section id="home" className="home-hero" aria-labelledby="home-title">
            <div className="home-hero-image">
                <img src="/images/commercial-office-team.webp" alt="Illustrative scene of a cleaning team caring for a bright professional office" width="1536" height="1024" fetchpriority="high" />
            </div>
            <div className="container home-hero-inner">
                <div className="home-hero-copy">
                    <p className="home-eyebrow"><span /> Commercial cleaning. West Texas.</p>
                    <h1 id="home-title">A cleaner space.<br />A better <em>workday.</em></h1>
                    <p className="home-hero-description">A workplace ready for whatever the day brings. Dependable commercial cleaning, built around your facility and your schedule.</p>
                    <div className="home-actions">
                        <a className="home-button" href="#contact">Get a free estimate <ArrowRight size={18} aria-hidden="true" /></a>
                        <a className="home-phone" href={`tel:${PHONE_E164}`}><Phone size={17} aria-hidden="true" />{PHONE_DISPLAY.replace('-', ' ')}</a>
                    </div>
                    <p className="home-hero-note">Free walkthrough. Clear scope. A plan that fits.</p>
                </div>
            </div>
            <span className="home-image-label">Illustrative imagery</span>
        </section>
        <div className="home-trust" aria-label="Our service commitments">
            <div className="container">
                <span><ShieldCheck aria-hidden="true" /> Licensed &amp; insured</span>
                <span><Clock3 aria-hidden="true" /> Day, night &amp; weekend scheduling</span>
                <span><CheckCircle2 aria-hidden="true" /> 100% satisfaction guarantee</span>
            </div>
        </div>
    </>
);

export default Hero;
