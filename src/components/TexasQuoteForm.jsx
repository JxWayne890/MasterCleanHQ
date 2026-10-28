import { useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle } from 'lucide-react';

const configuredPortalUrl = import.meta.env.VITE_PARTNER_PORTAL_URL?.trim();
const portalUrl = (configuredPortalUrl || 'https://partners.mastercleanhq.com').replace(/\/$/, '');
const previewMode = import.meta.env.VITE_PREVIEW_MODE === 'true';

const TexasQuoteForm = () => {
    const idempotencyKey = useRef(null);
    const [state, setState] = useState('idle');
    const [message, setMessage] = useState('');

    async function submitQuote(event) {
        event.preventDefault();
        if (state === 'submitting') return;
        if (previewMode && !configuredPortalUrl) {
            setState('error');
            setMessage('The preview quote connection has not been configured yet. Please try again after the preview is updated.');
            return;
        }
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const fields = Object.fromEntries(new FormData(form).entries());
        const phoneDigits = fields.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
            setMessage('Enter a phone number with 10 to 15 digits, including the area code.');
            setState('error');
            form.elements.phone.focus();
            return;
        }
        if (!idempotencyKey.current) {
            idempotencyKey.current = globalThis.crypto?.randomUUID?.() || `quote-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
        setState('submitting');
        setMessage('');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        try {
            const payload = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.trim()]));
            payload.squareFootage = Number(payload.squareFootage);
            payload.idempotencyKey = idempotencyKey.current;
            payload.source = 'texas';
            const response = await fetch(`${portalUrl}/api/quotes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey.current },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                const error = typeof result.error === 'string' ? result.error : 'We could not save your request. Please try again later.';
                throw new Error(error);
            }
            setState('success');
        } catch (error) {
            setState('error');
            setMessage(error.name === 'AbortError'
                ? 'The request took longer than expected. Please try again. Your request will not be duplicated.'
                : error instanceof TypeError
                    ? 'We could not connect. Please check your connection and try again.'
                    : error.message);
        } finally {
            clearTimeout(timeout);
        }
    }

    if (state === 'success') {
        return (
            <div className="texas-form-success" role="status" aria-live="polite">
                <CheckCircle2 size={44} strokeWidth={1.5} aria-hidden="true" />
                <h3>Your request is with MCC.</h3>
                <p>We will review your facility and city before making an introduction. If there is a suitable partner, we will connect you with one company to discuss your scope and quote.</p>
                <button type="button" className="texas-text-button" onClick={() => {
                    idempotencyKey.current = null;
                    setState('idle');
                }}>Submit a request for another facility <ArrowUpRight size={17} aria-hidden="true" /></button>
            </div>
        );
    }

    return (
        <form className="texas-quote-form" onSubmit={submitQuote} aria-label="Texas commercial cleaning quote request">
            <div className="texas-form-heading">
                <span className="texas-eyebrow">Tell us about your facility</span>
                <h3>Let’s find the right fit.</h3>
                <p>All fields are required except notes. A request does not commit you to a contract.</p>
            </div>
            <div className="texas-form-grid">
                <div className="texas-field">
                    <label htmlFor="texas-company">Company name</label>
                    <input id="texas-company" name="company" autoComplete="organization" maxLength={200} required />
                </div>
                <div className="texas-field">
                    <label htmlFor="texas-contact">Contact name</label>
                    <input id="texas-contact" name="contactName" autoComplete="name" maxLength={120} required />
                </div>
                <div className="texas-field">
                    <label htmlFor="texas-email">Work email</label>
                    <input id="texas-email" name="email" type="email" autoComplete="email" maxLength={254} required />
                </div>
                <div className="texas-field">
                    <label htmlFor="texas-phone">Phone number</label>
                    <input id="texas-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} required />
                </div>
                <div className="texas-field">
                    <label htmlFor="texas-city">Facility city</label>
                    <input id="texas-city" name="city" autoComplete="address-level2" placeholder="e.g. Houston or Fort Worth" maxLength={120} required />
                </div>
                <div className="texas-field">
                    <label htmlFor="texas-building">Building type</label>
                    <select id="texas-building" name="buildingType" defaultValue="" required>
                        <option value="" disabled>Select a facility type</option>
                        <option>Office</option>
                        <option>Retail</option>
                        <option>Medical or clinic</option>
                        <option>Industrial or warehouse</option>
                        <option>Multifamily common areas</option>
                        <option>School or education</option>
                        <option>Other commercial facility</option>
                    </select>
                </div>
                <div className="texas-field">
                    <label htmlFor="texas-size">Approximate square footage</label>
                    <input id="texas-size" name="squareFootage" type="number" inputMode="numeric" min="1" max="100000000" step="1" placeholder="e.g. 25000" required />
                </div>
                <div className="texas-field">
                    <label htmlFor="texas-frequency">Service frequency</label>
                    <select id="texas-frequency" name="serviceFrequency" defaultValue="" required>
                        <option value="" disabled>Select a schedule</option>
                        <option>Daily</option>
                        <option>Several times a week</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>One time</option>
                        <option>Not sure yet</option>
                    </select>
                </div>
                <div className="texas-field texas-field-full">
                    <label htmlFor="texas-notes">Notes <span>(optional)</span></label>
                    <textarea id="texas-notes" name="notes" rows={4} maxLength={5000} placeholder="Services needed, preferred schedule, access requirements, or timing." />
                </div>
            </div>
            <div className="texas-honeypot" aria-hidden="true">
                <label htmlFor="texas-website">Leave this field empty</label>
                <input id="texas-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <p className="texas-form-consent">By submitting, you ask MCC to contact you about this request and share these details with one selected cleaning partner for your quote.</p>
            {state === 'error' && <p className="texas-form-error" role="alert">{message}</p>}
            <button className="texas-button texas-button-submit" type="submit" disabled={state === 'submitting'}>
                {state === 'submitting' ? <><LoaderCircle className="texas-spinner" size={19} aria-hidden="true" /> Sending your request</> : <>Request a cleaning quote <ArrowUpRight size={20} aria-hidden="true" /></>}
            </button>
            <p className="texas-form-note">MCC may receive a referral fee from the partner; it never changes your price.</p>
        </form>
    );
};

export default TexasQuoteForm;
