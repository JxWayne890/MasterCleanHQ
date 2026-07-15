import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const initialEmployer = () => ({ company: '', role_title: '', supervisor_name: '', supervisor_phone: '', start_date: '', end_date: '', duties: '', reason_for_leaving: '', permission_to_contact: '' });
const initialReference = () => ({ full_name: '', relationship: '', phone: '', email: '', years_known: '', permission_to_contact: '' });

const initialForm = () => ({
    legal_first_name: '', legal_last_name: '', preferred_name: '', email: '', phone: '', address_line1: '', city: '', state: '', postal_code: '', preferred_contact_method: 'phone',
    earliest_start_date: '', employment_preference: 'either', days_available: [], availability_details: '', evening_availability: '', weekend_availability: '', desired_weekly_hours: '', reliable_transportation: '', travel_service_area: '',
    is_at_least_18: '', employment_authorization_acknowledged: false, commercial_cleaning_experience: '', years_experience: '', prior_work_settings: '', duties_performed: '', floor_equipment_experience: '', certifications: '',
    previous_employers: [initialEmployer(), initialEmployer()], professional_references: [initialReference(), initialReference()], additional_comments: '', accuracy_acknowledged: false, reference_verification_authorized: false, typed_signature: '', consent_acknowledged: false, company_website: '',
});

function Field({ label, children, hint, wide = false }) {
    return <label className={`apply-field${wide ? ' apply-field-wide' : ''}`}>
        <span>{label}</span>{children}{hint && <small>{hint}</small>}
    </label>;
}

function YesNo({ label, value, onChange, hint }) {
    return <fieldset className="apply-choice-field"><legend>{label}</legend>{hint && <small>{hint}</small>}<div className="apply-choice-row">
        <label><input type="radio" required checked={value === 'yes'} onChange={() => onChange('yes')} /> Yes</label>
        <label><input type="radio" required checked={value === 'no'} onChange={() => onChange('no')} /> No</label>
    </div></fieldset>;
}

const ApplyPage = () => {
    const [form, setForm] = useState(initialForm);
    const [resume, setResume] = useState(null);
    const [state, setState] = useState({ kind: 'idle', message: '', submissionId: '' });
    const formRef = useRef(null);
    const submittedDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const updateEntry = (collection, index, key, value) => setForm((current) => ({
        ...current,
        [collection]: current[collection].map((entry, entryIndex) => entryIndex === index ? { ...entry, [key]: value } : entry),
    }));
    const toggleDay = (day) => setForm((current) => ({
        ...current,
        days_available: current.days_available.includes(day) ? current.days_available.filter((item) => item !== day) : [...current.days_available, day],
    }));

    function validateExtraFields() {
        if (!form.days_available.length) return 'Select at least one day you are available.';
        if (resume && (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(resume.type) || resume.size > 5 * 1024 * 1024)) {
            return 'Resume must be a PDF, DOC, or DOCX file no larger than 5 MB.';
        }
        if (form.previous_employers.some((item) => item.end_date < item.start_date)) return 'Each previous-employer end date must be on or after the start date.';
        return '';
    }

    async function submit(event) {
        event.preventDefault();
        setState({ kind: 'idle', message: '', submissionId: '' });
        if (!formRef.current?.reportValidity()) return;
        const extraError = validateExtraFields();
        if (extraError) { setState({ kind: 'error', message: extraError, submissionId: '' }); return; }
        const duplicateKey = `mchq-job-application:${form.email.trim().toLowerCase()}`;
        if (localStorage.getItem(duplicateKey)) {
            setState({ kind: 'error', message: 'We already received an application with this email. Please contact us if you need to update it.', submissionId: '' });
            return;
        }
        const endpoint = import.meta.env.VITE_APPLICATION_INTAKE_URL?.trim();
        if (!endpoint) {
            setState({ kind: 'error', message: 'Online applications are not available right now. Please call our office for help applying.', submissionId: '' });
            return;
        }
        setState({ kind: 'loading', message: 'Submitting your application securely…', submissionId: '' });
        const payload = {
            ...form,
            submission_date: submittedDate,
            evening_availability: form.evening_availability === 'yes',
            weekend_availability: form.weekend_availability === 'yes',
            reliable_transportation: form.reliable_transportation === 'yes',
            travel_service_area: form.travel_service_area === 'yes',
            is_at_least_18: form.is_at_least_18 === 'yes',
            commercial_cleaning_experience: form.commercial_cleaning_experience === 'yes',
            desired_weekly_hours: Number(form.desired_weekly_hours),
            years_experience: Number(form.years_experience),
            previous_employers: form.previous_employers.map((item) => ({ ...item, permission_to_contact: item.permission_to_contact === 'yes' })),
            professional_references: form.professional_references.map((item) => ({ ...item, years_known: Number(item.years_known), permission_to_contact: item.permission_to_contact === 'yes' })),
        };
        try {
            const request = new FormData();
            request.append('payload', JSON.stringify(payload));
            if (resume) request.append('resume', resume);
            const response = await fetch(endpoint, { method: 'POST', body: request });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'We could not submit your application. Please try again.');
            localStorage.setItem(duplicateKey, data.submissionId || 'received');
            setState({ kind: 'success', message: data.duplicate ? 'We already have this application on file.' : 'Thank you — your application has been received.', submissionId: data.submissionId || '' });
        } catch (error) {
            setState({ kind: 'error', message: error instanceof Error ? error.message : 'We could not submit your application. Please try again.', submissionId: '' });
        }
    }

    if (state.kind === 'success') return <div className="apply-page"><SEO title="Application Received | Master Commercial Clean" description="Your employment application has been received." path="/apply" /><section className="apply-success"><div><span>Application received</span><h1>Thank you for applying.</h1><p>{state.message} Our hiring team will review your information and contact you using your preferred method.</p>{state.submissionId && <p className="apply-submission-id">Submission ID: {state.submissionId}</p>}<Link to="/" className="apply-button">Return home</Link></div></section></div>;

    return <div className="apply-page">
        <SEO title="Apply to Work With Master Commercial Clean | West Texas" description="Apply for commercial cleaning work with Master Commercial Clean. Complete a secure employment application for West Texas opportunities." path="/apply" schemas={[...buildBaseSchemas(), buildWebPageSchema({ path: '/apply', title: 'Apply to Work With Master Commercial Clean', description: 'Submit a secure employment application for commercial cleaning work.' }), buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Apply', path: '/apply' }])]} />
        <section className="apply-hero"><div className="container"><p>Careers at Master Commercial Clean</p><h1>Build a career with a team that <em>takes pride</em> in the details.</h1><span>We welcome reliable, service-minded people interested in commercial cleaning work across West Texas.</span></div></section>
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Apply', path: '/apply' }]} />
        <main className="container apply-layout"><aside className="apply-aside"><span>Before you begin</span><h2>Set aside a few minutes for your full work history.</h2><p>We will ask for exactly two previous employers and two professional references. An optional résumé can be attached securely.</p><ul><li>No SSN, tax details, or I-9 documents are requested here.</li><li>Employment authorization is verified only after an offer.</li><li>Your information is used for hiring and onboarding only.</li></ul></aside>
            <form className="apply-form" ref={formRef} onSubmit={submit} noValidate>
                <div className="apply-form-heading"><span>Employment application</span><h2>Tell us about yourself and your availability.</h2><p>Fields marked with * are required.</p></div>
                <fieldset><legend>Contact information</legend><div className="apply-grid">
                    <Field label="Legal first name *"><input required value={form.legal_first_name} onChange={(event) => update('legal_first_name', event.target.value)} autoComplete="given-name" /></Field>
                    <Field label="Legal last name *"><input required value={form.legal_last_name} onChange={(event) => update('legal_last_name', event.target.value)} autoComplete="family-name" /></Field>
                    <Field label="Preferred name"><input value={form.preferred_name} onChange={(event) => update('preferred_name', event.target.value)} /></Field>
                    <Field label="Email address *"><input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" /></Field>
                    <Field label="Phone number *"><input required type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" /></Field>
                    <Field label="Preferred contact method *"><select required value={form.preferred_contact_method} onChange={(event) => update('preferred_contact_method', event.target.value)}><option value="phone">Phone</option><option value="email">Email</option><option value="either">Either</option></select></Field>
                    <Field label="Street address *" wide><input required value={form.address_line1} onChange={(event) => update('address_line1', event.target.value)} autoComplete="street-address" /></Field>
                    <Field label="City *"><input required value={form.city} onChange={(event) => update('city', event.target.value)} autoComplete="address-level2" /></Field>
                    <Field label="State *"><input required value={form.state} onChange={(event) => update('state', event.target.value.toUpperCase().slice(0, 2))} pattern="[A-Za-z]{2}" placeholder="TX" autoComplete="address-level1" /></Field>
                    <Field label="ZIP code *"><input required value={form.postal_code} onChange={(event) => update('postal_code', event.target.value)} autoComplete="postal-code" /></Field>
                </div></fieldset>
                <fieldset><legend>Availability and eligibility</legend><div className="apply-grid">
                    <Field label="Earliest start date *"><input required type="date" value={form.earliest_start_date} onChange={(event) => update('earliest_start_date', event.target.value)} /></Field>
                    <Field label="Employment preference *"><select required value={form.employment_preference} onChange={(event) => update('employment_preference', event.target.value)}><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="either">Either</option></select></Field>
                    <Field label="Desired weekly hours *"><input required type="number" min="1" max="80" step="0.5" value={form.desired_weekly_hours} onChange={(event) => update('desired_weekly_hours', event.target.value)} /></Field>
                    <div className="apply-field apply-field-wide"><span>Days available *</span><div className="apply-day-grid">{DAYS.map((day) => <label key={day}><input type="checkbox" checked={form.days_available.includes(day)} onChange={() => toggleDay(day)} />{day.slice(0, 3)}</label>)}</div></div>
                    <Field label="Available times *" wide><textarea required rows="3" value={form.availability_details} onChange={(event) => update('availability_details', event.target.value)} placeholder="Example: Mon–Fri after 5 PM; Saturday mornings" /></Field>
                    <YesNo label="Available for evenings? *" value={form.evening_availability} onChange={(value) => update('evening_availability', value)} />
                    <YesNo label="Available for weekends? *" value={form.weekend_availability} onChange={(value) => update('weekend_availability', value)} />
                    <YesNo label="Do you have reliable transportation? *" value={form.reliable_transportation} onChange={(value) => update('reliable_transportation', value)} />
                    <YesNo label="Can you travel throughout our service area? *" value={form.travel_service_area} onChange={(value) => update('travel_service_area', value)} />
                    <YesNo label="Are you at least 18 years old? *" value={form.is_at_least_18} onChange={(value) => update('is_at_least_18', value)} />
                    <label className="apply-check apply-field-wide"><input type="checkbox" required checked={form.employment_authorization_acknowledged} onChange={(event) => update('employment_authorization_acknowledged', event.target.checked)} />I understand that employment authorization will be verified after a conditional offer of employment. *</label>
                </div></fieldset>
                <fieldset><legend>Cleaning experience</legend><div className="apply-grid">
                    <YesNo label="Janitorial or commercial cleaning experience? *" value={form.commercial_cleaning_experience} onChange={(value) => update('commercial_cleaning_experience', value)} />
                    <Field label="Years of experience *"><input required type="number" min="0" max="70" step="0.5" value={form.years_experience} onChange={(event) => update('years_experience', event.target.value)} /></Field>
                    <Field label="Prior work settings *" wide><textarea required rows="3" value={form.prior_work_settings} onChange={(event) => update('prior_work_settings', event.target.value)} placeholder="Example: offices, schools, medical facilities, retail, warehouses" /></Field>
                    <Field label="Duties performed *" wide><textarea required rows="3" value={form.duties_performed} onChange={(event) => update('duties_performed', event.target.value)} placeholder="Example: restroom sanitation, trash, dusting, detailed cleaning" /></Field>
                    <Field label="Floor and equipment experience *" wide><textarea required rows="3" value={form.floor_equipment_experience} onChange={(event) => update('floor_equipment_experience', event.target.value)} placeholder="Example: floor buffers, extractors, vacuums, autoscrubbers" /></Field>
                    <Field label="Relevant certifications"><input value={form.certifications} onChange={(event) => update('certifications', event.target.value)} placeholder="Optional" /></Field>
                    <Field label="Optional résumé" hint="PDF, DOC, or DOCX · 5 MB maximum"><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setResume(event.target.files?.[0] || null)} /></Field>
                </div></fieldset>
                <fieldset><legend>Previous employers <small>Provide exactly two entries.</small></legend>{form.previous_employers.map((employer, index) => <div className="apply-repeat" key={`employer-${index}`}><h3>Employer {index + 1}</h3><div className="apply-grid">
                    <Field label="Company *"><input required value={employer.company} onChange={(event) => updateEntry('previous_employers', index, 'company', event.target.value)} /></Field><Field label="Role *"><input required value={employer.role_title} onChange={(event) => updateEntry('previous_employers', index, 'role_title', event.target.value)} /></Field><Field label="Supervisor *"><input required value={employer.supervisor_name} onChange={(event) => updateEntry('previous_employers', index, 'supervisor_name', event.target.value)} /></Field><Field label="Supervisor phone *"><input required type="tel" value={employer.supervisor_phone} onChange={(event) => updateEntry('previous_employers', index, 'supervisor_phone', event.target.value)} /></Field><Field label="Start date *"><input required type="date" value={employer.start_date} onChange={(event) => updateEntry('previous_employers', index, 'start_date', event.target.value)} /></Field><Field label="End date *"><input required type="date" value={employer.end_date} onChange={(event) => updateEntry('previous_employers', index, 'end_date', event.target.value)} /></Field><Field label="Duties *" wide><textarea required rows="2" value={employer.duties} onChange={(event) => updateEntry('previous_employers', index, 'duties', event.target.value)} /></Field><Field label="Reason for leaving *" wide><textarea required rows="2" value={employer.reason_for_leaving} onChange={(event) => updateEntry('previous_employers', index, 'reason_for_leaving', event.target.value)} /></Field><Field label="May we contact this employer? *"><select required value={employer.permission_to_contact} onChange={(event) => updateEntry('previous_employers', index, 'permission_to_contact', event.target.value)}><option value="" disabled>Select one</option><option value="yes">Yes</option><option value="no">No</option></select></Field>
                </div></div>)}</fieldset>
                <fieldset><legend>Professional references <small>Provide exactly two entries.</small></legend>{form.professional_references.map((reference, index) => <div className="apply-repeat" key={`reference-${index}`}><h3>Reference {index + 1}</h3><div className="apply-grid"><Field label="Full name *"><input required value={reference.full_name} onChange={(event) => updateEntry('professional_references', index, 'full_name', event.target.value)} /></Field><Field label="Relationship *"><input required value={reference.relationship} onChange={(event) => updateEntry('professional_references', index, 'relationship', event.target.value)} /></Field><Field label="Phone *"><input required type="tel" value={reference.phone} onChange={(event) => updateEntry('professional_references', index, 'phone', event.target.value)} /></Field><Field label="Email *"><input required type="email" value={reference.email} onChange={(event) => updateEntry('professional_references', index, 'email', event.target.value)} /></Field><Field label="Years known *"><input required type="number" min="0" max="70" step="0.5" value={reference.years_known} onChange={(event) => updateEntry('professional_references', index, 'years_known', event.target.value)} /></Field><Field label="May we contact this reference? *"><select required value={reference.permission_to_contact} onChange={(event) => updateEntry('professional_references', index, 'permission_to_contact', event.target.value)}><option value="" disabled>Select one</option><option value="yes">Yes</option><option value="no">No</option></select></Field></div></div>)}</fieldset>
                <fieldset><legend>Confirmation and signature</legend><div className="apply-grid"><Field label="Additional comments" wide><textarea rows="3" value={form.additional_comments} onChange={(event) => update('additional_comments', event.target.value)} /></Field><Field label="Submission date"><input readOnly value={submittedDate} /></Field><Field label="Type your full legal name as your signature *"><input required value={form.typed_signature} onChange={(event) => update('typed_signature', event.target.value)} /></Field><div className="apply-check-stack apply-field-wide"><label className="apply-check"><input type="checkbox" required checked={form.accuracy_acknowledged} onChange={(event) => update('accuracy_acknowledged', event.target.checked)} />I certify that the information in this application is accurate and complete. *</label><label className="apply-check"><input type="checkbox" required checked={form.reference_verification_authorized} onChange={(event) => update('reference_verification_authorized', event.target.checked)} />I authorize Master Commercial Clean to verify my employment history and professional references. *</label><label className="apply-check"><input type="checkbox" required checked={form.consent_acknowledged} onChange={(event) => update('consent_acknowledged', event.target.checked)} />I consent to the collection and use of this information for employment consideration. *</label></div></div></fieldset>
                <div className="apply-honeypot" aria-hidden="true"><label>Company website<input tabIndex="-1" autoComplete="off" value={form.company_website} onChange={(event) => update('company_website', event.target.value)} /></label></div>
                <div className="apply-submit-row"><p aria-live="polite" className={state.kind === 'error' ? 'apply-message apply-message-error' : 'apply-message'}>{state.message}</p><button className="apply-button" disabled={state.kind === 'loading'} type="submit">{state.kind === 'loading' ? 'Submitting…' : 'Submit application'} <span>→</span></button></div>
            </form>
        </main>
    </div>;
};

export default ApplyPage;
