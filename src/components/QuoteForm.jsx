import { useId, useRef, useState } from 'react';
import { PHONE_DISPLAY, PHONE_E164 } from '../config/site';
import { submitQuote, validateQuote } from '../lib/quoteIntake';
import './QuoteForm.css';

const QuoteForm = () => {
    const id = useId();
    const busy = useRef(false);
    const [state, setState] = useState({ kind: 'idle', text: '' });

    async function submit(event) {
        event.preventDefault();
        if (busy.current) return;
        const form = event.currentTarget;
        const payload = Object.fromEntries(Array.from(new FormData(form), ([key, value]) => [key, value.trim()]));
        const error = validateQuote(payload);
        if (error) { setState({ kind: 'error', text: error }); return; }
        busy.current = true;
        setState({ kind: 'loading', text: 'Sending your request…' });
        try {
            const result = await submitQuote({
                ...payload,
                source_page: `${window.location.pathname}${window.location.search}`.slice(0, 500),
                referrer: document.referrer.slice(0, 1000),
            });
            setState({ kind: 'success', text: result.duplicate
                ? 'We already received a request with these contact details today. Please call if you need to add or change anything.'
                : 'Thank you. Your quote request has been received. Our team will contact you to discuss your facility.' });
            // Analytics must never change the outcome of a saved submission.
            if (!result.duplicate) {
                try { window.gtag?.('event', 'generate_lead', { event_category: 'contact', event_label: 'quote_form_saved' }); } catch { /* optional analytics */ }
            }
        } catch (error) {
            setState({ kind: 'error', text: error.message });
        } finally {
            busy.current = false;
        }
    }

    return <div className="quote-card">
        <h3>Request your free estimate.</h3>
        <p className="quote-intro">Tell us a little about your space. Fields marked * are required.</p>
        {state.kind === 'success' ? <div className="quote-success" role="status"><p>{state.text}</p><a href={`tel:${PHONE_E164}`}>Call {PHONE_DISPLAY.replace('-', ' ')}</a></div> :
            <form onSubmit={submit} aria-label="Free cleaning estimate" aria-busy={state.kind === 'loading'}>
                <fieldset disabled={state.kind === 'loading'}>
                    <div className="quote-fields">
                        <label htmlFor={`${id}-name`}>Full name *<input id={`${id}-name`} name="full_name" autoComplete="name" required maxLength={150} /></label>
                        <label htmlFor={`${id}-business`}>Business name *<input id={`${id}-business`} name="business_name" autoComplete="organization" required maxLength={200} /></label>
                        <label htmlFor={`${id}-phone`}>Phone number *<input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" required maxLength={40} /></label>
                        <label htmlFor={`${id}-email`}>Email address (optional)<input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={254} /></label>
                        <label htmlFor={`${id}-city`}>Facility city *<input id={`${id}-city`} name="city" autoComplete="address-level2" required maxLength={100} /></label>
                        <label htmlFor={`${id}-contact`}>Preferred contact<select id={`${id}-contact`} name="preferred_contact_method" defaultValue="Phone"><option>Phone</option><option>Email</option></select></label>
                        <label htmlFor={`${id}-facility`}>Facility type *<select id={`${id}-facility`} name="facility_type" required defaultValue=""><option value="" disabled>Select facility</option>{['Office', 'Medical / Dental', 'Retail', 'Industrial / Warehouse', 'School / Church', 'Other Commercial'].map(value => <option key={value}>{value}</option>)}</select></label>
                        <label htmlFor={`${id}-service`}>Service needed *<select id={`${id}-service`} name="service_type" required defaultValue=""><option value="" disabled>Select service</option>{['Commercial Routine', 'Post Construction', 'Specialized Cleaning', 'Other / Custom'].map(value => <option key={value}>{value}</option>)}</select></label>
                        <label className="quote-wide" htmlFor={`${id}-message`}>Cleaning needs (optional)<textarea id={`${id}-message`} name="message" rows={3} maxLength={2500} placeholder="Approximate size, schedule and anything else we should know." /></label>
                    </div>
                    <div className="quote-trap" aria-hidden="true"><label htmlFor={`${id}-website`}>Company website<input id={`${id}-website`} name="company_website" tabIndex={-1} autoComplete="off" /></label></div>
                    {state.text && <p className={`quote-message quote-${state.kind}`} role={state.kind === 'error' ? 'alert' : 'status'}>{state.text}</p>}
                    <button className="quote-submit" type="submit">{state.kind === 'loading' ? 'Sending…' : 'Send quote request'}</button>
                </fieldset>
                <p className="quote-help">Prefer to talk? <a href={`tel:${PHONE_E164}`}>Call {PHONE_DISPLAY.replace('-', ' ')}</a></p>
            </form>}
    </div>;
};

export default QuoteForm;
