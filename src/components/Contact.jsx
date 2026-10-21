import { useState } from 'react';
import { ArrowUpRight, Check, Mail, Phone } from 'lucide-react';
import { PHONE_DISPLAY, PHONE_E164 } from '../config/site';
import './contact-navigation.css';

function formatPhoneNumber(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

const Contact = () => {
    const [submission, setSubmission] = useState({ state: 'idle', message: '' });
    const phone = PHONE_DISPLAY.replace(/-/g, ' ');

    async function submitQuoteRequest(event) {
        event.preventDefault();
        if (submission.state === 'submitting') return;
        setSubmission({ state: 'submitting', message: '' });
        const form = event.currentTarget;
        const values = Object.fromEntries(new FormData(form).entries());
        try {
            const response = await fetch('/api/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    source_page: `${window.location.pathname}${window.location.search}`,
                    referrer: document.referrer || '',
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.submissionId) throw new Error(result.error || 'We could not confirm your request was saved. Please try again or call us.');
            form.reset();
            setSubmission({ state: 'success', message: 'Thank you. Your quote request has been saved. We will contact you to discuss your building.' });
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', { event_category: 'contact', event_label: 'quote_form_submit' });
            }
        } catch (error) {
            setSubmission({ state: 'error', message: error instanceof Error ? error.message : `We could not confirm your request was saved. Please call ${phone}.` });
        }
    }

    return (
        <section id="contact" className="mcc-contact" aria-labelledby="mcc-contact-title">
            <div className="container mcc-contact-layout">
                <div className="mcc-contact-info">
                    <span className="mcc-contact-eyebrow">Get a free cleaning quote</span>
                    <h2 id="mcc-contact-title" data-motion="rise">Your next clean starts with a conversation.</h2>
                    <p>Tell us about your building, what needs attention, and the schedule that works for you. We’ll help you work out the next step.</p>
                    <a className="mcc-contact-call" href={`tel:${PHONE_E164}`}><Phone size={23} aria-hidden="true" /><span><small>Prefer to talk? Give us a call.</small>{phone}</span><ArrowUpRight size={22} aria-hidden="true" /></a>
                    <ul className="mcc-contact-reassurance">
                        <li><Check size={17} aria-hidden="true" />A quote built around your building</li>
                        <li><Check size={17} aria-hidden="true" />Routine service or a specific project</li>
                        <li><Check size={17} aria-hidden="true" />San Angelo and surrounding West Texas</li>
                    </ul>
                    <a className="mcc-contact-email" href="mailto:john@mastercleanhq.com"><Mail size={17} aria-hidden="true" />john@mastercleanhq.com</a>
                    <p className="mcc-contact-other-area">Looking for service in another Texas city? <a href="/partner-network">Explore our partner network <ArrowUpRight size={14} aria-hidden="true" /></a></p>
                </div>
                <div className="mcc-quote-panel">
                    <div className="mcc-quote-heading">
                        <h3>Tell us what you need.</h3>
                        <p id="mcc-quote-instructions">Fields marked with * are required. Email and project details are optional.</p>
                    </div>
                    <form className="mcc-quote-form" onSubmit={submitQuoteRequest} aria-describedby="mcc-quote-instructions" aria-busy={submission.state === 'submitting'}>
                        <div className="mcc-form-trap" aria-hidden="true"><label htmlFor="company_website">Company website</label><input id="company_website" name="company_website" tabIndex="-1" autoComplete="off" /></div>
                        <div className="mcc-form-grid">
                            <div className="mcc-form-field"><label htmlFor="name">Your name <span>*</span></label><input id="name" name="full_name" autoComplete="name" maxLength="150" required placeholder="Full name" /></div>
                            <div className="mcc-form-field"><label htmlFor="business_name">Business or organization <span>*</span></label><input id="business_name" name="business_name" autoComplete="organization" maxLength="200" required placeholder="Company or facility name" /></div>
                            <div className="mcc-form-field"><label htmlFor="phone">Phone number <span>*</span></label><input type="tel" id="phone" name="phone" autoComplete="tel-national" inputMode="tel" required placeholder="(325) 000 0000" minLength="14" maxLength="14" onChange={(event) => { event.currentTarget.value = formatPhoneNumber(event.currentTarget.value); }} /></div>
                            <div className="mcc-form-field"><label htmlFor="email">Email <span className="mcc-field-optional">(optional)</span></label><input type="email" id="email" name="email" autoComplete="email" maxLength="254" placeholder="you@company.com" /></div>
                            <div className="mcc-form-field"><label htmlFor="city">Building city <span>*</span></label><input id="city" name="city" autoComplete="address-level2" maxLength="100" required placeholder="San Angelo" /></div>
                            <div className="mcc-form-field"><label htmlFor="facility_type">Building type <span>*</span></label><select id="facility_type" name="facility_type" required defaultValue=""><option value="" disabled>Select building type</option><option>Office</option><option>School</option><option>Medical</option><option>Retail</option><option>Industrial</option><option>Church</option><option>Other Commercial</option></select></div>
                            <div className="mcc-form-field mcc-form-wide"><label htmlFor="service">Cleaning service <span>*</span></label><select id="service" name="service_type" required defaultValue=""><option value="" disabled>Select a service</option><option value="commercial">Routine commercial cleaning</option><option value="construction">Post construction cleanup</option><option value="specialized">Specialized cleaning</option><option value="other">Other or help choosing</option></select></div>
                            <div className="mcc-form-field mcc-form-wide"><label htmlFor="message">Anything we should know? <span className="mcc-field-optional">(optional)</span></label><textarea id="message" name="message" rows="3" maxLength="2500" placeholder="Approximate size, cleaning schedule, or what needs attention." /></div>
                        </div>
                        <p className="mcc-form-privacy">Your request is saved in our CRM. We use Agency Guardrail to review messages for unwanted traffic. <a href="https://agencyguardrail.com/data-handling" target="_blank" rel="noreferrer">Learn how messages are processed</a>.</p>
                        <button className="mcc-quote-submit" type="submit" disabled={submission.state === 'submitting'}>{submission.state === 'submitting' ? 'Sending your request…' : 'Request my free quote'}<ArrowUpRight size={19} aria-hidden="true" /></button>
                        {submission.message ? <p className={`mcc-form-message mcc-form-message-${submission.state}`} role={submission.state === 'error' ? 'alert' : 'status'}>{submission.message}</p> : null}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
