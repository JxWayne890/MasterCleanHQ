import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { buildBaseSchemas, buildBreadcrumbSchema, buildWebPageSchema } from '../seo/schemas';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DRAFT_KEY = 'mchq-application-draft-v2';
const PORTAL_KEY = 'mchq-application-portal-v1';
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const initialEmployer = () => ({ company: '', role_title: '', supervisor_name: '', supervisor_phone: '', start_date: '', end_date: '', duties: '', reason_for_leaving: '', permission_to_contact: '' });
const initialReference = () => ({ full_name: '', relationship: '', phone: '', email: '', years_known: '', permission_to_contact: '' });
const initialForm = () => ({
    legal_first_name: '', legal_last_name: '', preferred_name: '', email: '', phone: '', address_line1: '', city: '', state: '', postal_code: '', preferred_contact_method: 'phone',
    earliest_start_date: '', employment_preference: 'either', days_available: [], availability_details: '', evening_availability: '', weekend_availability: '', desired_weekly_hours: '', reliable_transportation: '', travel_service_area: '',
    is_at_least_18: '', employment_authorization_acknowledged: false, commercial_cleaning_experience: '', years_experience: '', prior_work_settings: '', duties_performed: '', floor_equipment_experience: '', certifications: '',
    previous_employers: [initialEmployer(), initialEmployer()], professional_references: [initialReference(), initialReference()], additional_comments: '', accuracy_acknowledged: false, reference_verification_authorized: false, typed_signature: '', consent_acknowledged: false, company_website: '',
});

const STEP_META = [
    { id: 'personal', label: 'Personal info', kicker: 'Step 1 of 6', title: 'Tell us how to reach you.', copy: 'Use the legal name and contact information you want our hiring team to use.' },
    { id: 'availability', label: 'Availability & eligibility', kicker: 'Step 2 of 6', title: 'Share your work availability.', copy: 'This helps us match you with cleaning schedules across our service area.' },
    { id: 'experience', label: 'Cleaning experience', kicker: 'Step 3 of 6', title: 'Show us your experience.', copy: 'Tell us about the work settings, duties, and equipment you know.' },
    { id: 'employment', label: 'Work history', kicker: 'Step 4 of 6', title: 'Add your previous employers.', copy: 'Please provide exactly two previous-employer entries.' },
    { id: 'references', label: 'References', kicker: 'Step 5 of 6', title: 'Add professional references.', copy: 'Please provide exactly two people who can speak to your work.' },
    { id: 'review', label: 'Review & submit', kicker: 'Step 6 of 6', title: 'Review and send your application.', copy: 'Your application is sent securely to the Master Commercial Clean hiring team.' },
];

function Field({ label, children, hint, wide = false }) {
    return <label className={`apply-field${wide ? ' apply-field-wide' : ''}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function YesNo({ label, value, onChange, hint, name }) {
    return <fieldset className="apply-choice-field"><legend>{label}</legend>{hint && <small>{hint}</small>}<div className="apply-choice-row">
        <label><input name={name} type="radio" checked={value === 'yes'} onChange={() => onChange('yes')} /> Yes</label>
        <label><input name={name} type="radio" checked={value === 'no'} onChange={() => onChange('no')} /> No</label>
    </div></fieldset>;
}

function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatPhoneNumber(value) {
    const rawDigits = String(value || '').replace(/\D/g, '');
    const digits = rawDigits.length === 11 && rawDigits.startsWith('1') ? rawDigits.slice(1) : rawDigits.slice(0, 10);
    if (!digits) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isPhoneNumber(value) {
    return /^\(\d{3}\) \d{3}-\d{4}$/.test(value);
}

function hasValue(value) {
    return typeof value === 'string' ? Boolean(value.trim()) : Boolean(value);
}

function restoreDraft(value) {
    if (!value || typeof value !== 'object' || !value.form || typeof value.form !== 'object') return null;
    const fallback = initialForm();
    return {
        ...fallback,
        ...value.form,
        phone: formatPhoneNumber(value.form.phone),
        days_available: Array.isArray(value.form.days_available) ? value.form.days_available.filter((day) => DAYS.includes(day)) : [],
        previous_employers: Array.isArray(value.form.previous_employers) && value.form.previous_employers.length === 2 ? value.form.previous_employers.map((entry) => ({ ...initialEmployer(), ...entry, supervisor_phone: formatPhoneNumber(entry.supervisor_phone) })) : fallback.previous_employers,
        professional_references: Array.isArray(value.form.professional_references) && value.form.professional_references.length === 2 ? value.form.professional_references.map((entry) => ({ ...initialReference(), ...entry, phone: formatPhoneNumber(entry.phone) })) : fallback.professional_references,
    };
}

const ApplyPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const startPath = location.pathname === '/apply/start';
    const [form, setForm] = useState(initialForm);
    const [resume, setResume] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [started, setStarted] = useState(startPath);
    const [hydrated, setHydrated] = useState(false);
    const [restoreNotice, setRestoreNotice] = useState(false);
    const [resumeNotice, setResumeNotice] = useState(false);
    const [message, setMessage] = useState({ kind: 'idle', text: '' });
    const [portal, setPortal] = useState(null);
    const [portalStatus, setPortalStatus] = useState({ kind: 'idle', data: null, error: '' });
    const submittedDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const refreshPortal = useCallback(async (portalToken) => {
        const endpoint = import.meta.env.VITE_APPLICATION_PORTAL_URL?.trim();
        if (!portalToken || !endpoint) return;
        setPortalStatus({ kind: 'loading', data: null, error: '' });
        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: portalToken }) });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'We could not retrieve your application status.');
            setPortalStatus({ kind: 'ready', data, error: '' });
        } catch (error) {
            setPortalStatus({ kind: 'error', data: null, error: error instanceof Error ? error.message : 'We could not retrieve your application status.' });
        }
    }, []);

    useEffect(() => {
        try {
            const savedDraft = restoreDraft(JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'));
            if (savedDraft) {
                setForm(savedDraft);
                setActiveStep(Math.min(Math.max(Number(JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}').activeStep) || 0, 0), STEP_META.length - 1));
                setStarted(true);
                setRestoreNotice(true);
            }
            const savedPortal = JSON.parse(localStorage.getItem(PORTAL_KEY) || 'null');
            if (savedPortal?.token && typeof savedPortal.token === 'string') {
                setPortal(savedPortal);
                setStarted(true);
                void refreshPortal(savedPortal.token);
            }
        } catch {
            localStorage.removeItem(DRAFT_KEY);
        } finally {
            setHydrated(true);
        }
    }, [refreshPortal]);

    useEffect(() => {
        if (!hydrated || !started || portal) return;
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, activeStep, savedAt: new Date().toISOString() }));
    }, [activeStep, form, hydrated, portal, started]);

    const update = (key, value) => {
        setMessage({ kind: 'idle', text: '' });
        setForm((current) => ({ ...current, [key]: value }));
    };
    const updateEntry = (collection, index, key, value) => {
        setMessage({ kind: 'idle', text: '' });
        setForm((current) => ({ ...current, [collection]: current[collection].map((entry, entryIndex) => entryIndex === index ? { ...entry, [key]: value } : entry) }));
    };
    const toggleDay = (day) => setForm((current) => ({ ...current, days_available: current.days_available.includes(day) ? current.days_available.filter((item) => item !== day) : [...current.days_available, day] }));

    const complete = useMemo(() => ({
        personal: ['legal_first_name', 'legal_last_name', 'email', 'phone', 'address_line1', 'city', 'state', 'postal_code'].every((key) => hasValue(form[key])) && isEmail(form.email) && isPhoneNumber(form.phone) && /^[A-Za-z]{2}$/.test(form.state),
        availability: ['earliest_start_date', 'employment_preference', 'availability_details', 'evening_availability', 'weekend_availability', 'desired_weekly_hours', 'reliable_transportation', 'travel_service_area', 'is_at_least_18'].every((key) => hasValue(form[key])) && Number(form.desired_weekly_hours) >= 1 && form.days_available.length > 0 && form.employment_authorization_acknowledged,
        experience: ['commercial_cleaning_experience', 'years_experience', 'prior_work_settings', 'duties_performed', 'floor_equipment_experience'].every((key) => hasValue(form[key])) && Number(form.years_experience) >= 0,
        employment: form.previous_employers.every((employer) => Object.entries(employer).every(([, value]) => hasValue(value)) && isPhoneNumber(employer.supervisor_phone) && employer.end_date >= employer.start_date),
        references: form.professional_references.every((reference) => Object.entries(reference).every(([key, value]) => key === 'email' ? isEmail(value) : hasValue(value)) && isPhoneNumber(reference.phone)),
        review: hasValue(form.typed_signature) && form.accuracy_acknowledged && form.reference_verification_authorized && form.consent_acknowledged && (!resume || (RESUME_TYPES.includes(resume.type) && resume.size <= MAX_RESUME_BYTES)),
    }), [form, resume]);

    const completeCount = STEP_META.filter((step) => complete[step.id]).length;

    function validateStep(index) {
        const step = STEP_META[index];
        if (complete[step.id]) return '';
        const errors = {
            personal: 'Please complete your legal name, a 10-digit phone number, contact information, and two-letter state.',
            availability: 'Please complete your work availability and all required acknowledgements.',
            experience: 'Please complete your cleaning experience and equipment background.',
            employment: 'Complete both employer entries, including a 10-digit supervisor phone number, valid work dates, and contact permission.',
            references: 'Complete both reference entries with valid 10-digit phone numbers, email addresses, and contact permission.',
            review: resume ? 'Use a PDF, DOC, or DOCX résumé no larger than 5 MB, or remove the file.' : 'Please complete your typed signature and required acknowledgements.',
        };
        return errors[step.id];
    }

    function goNext() {
        const error = validateStep(activeStep);
        if (error) { setMessage({ kind: 'error', text: error }); return; }
        setMessage({ kind: 'idle', text: '' });
        setActiveStep((current) => Math.min(current + 1, STEP_META.length - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep(index) {
        setMessage({ kind: 'idle', text: '' });
        setActiveStep(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function startApplication() {
        setStarted(true);
        navigate('/apply/start', { replace: true });
    }

    function startOver() {
        localStorage.removeItem(DRAFT_KEY);
        setForm(initialForm());
        setResume(null);
        setActiveStep(0);
        setRestoreNotice(false);
        setResumeNotice(false);
        setMessage({ kind: 'idle', text: '' });
        navigate('/apply/start', { replace: true });
    }

    async function submit(event) {
        event.preventDefault();
        for (let index = 0; index < STEP_META.length; index += 1) {
            const error = validateStep(index);
            if (error) { setActiveStep(index); setMessage({ kind: 'error', text: error }); return; }
        }
        const endpoint = import.meta.env.VITE_APPLICATION_INTAKE_URL?.trim();
        if (!endpoint) { setMessage({ kind: 'error', text: 'Online applications are not available right now. Please call our office for help applying.' }); return; }
        const duplicateKey = `mchq-job-application:${form.email.trim().toLowerCase()}`;
        if (localStorage.getItem(duplicateKey)) { setMessage({ kind: 'error', text: 'This browser already shows an application for that email. Return to the application status panel to check your next steps.' }); return; }
        setMessage({ kind: 'loading', text: 'Submitting your application securely…' });
        const payload = {
            ...form,
            submission_date: submittedDate,
            evening_availability: form.evening_availability === 'yes', weekend_availability: form.weekend_availability === 'yes', reliable_transportation: form.reliable_transportation === 'yes', travel_service_area: form.travel_service_area === 'yes', is_at_least_18: form.is_at_least_18 === 'yes', commercial_cleaning_experience: form.commercial_cleaning_experience === 'yes', desired_weekly_hours: Number(form.desired_weekly_hours), years_experience: Number(form.years_experience),
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
            localStorage.removeItem(DRAFT_KEY);
            if (data.portalToken) {
                const nextPortal = { token: data.portalToken, submissionId: data.submissionId || '', createdAt: new Date().toISOString() };
                localStorage.setItem(PORTAL_KEY, JSON.stringify(nextPortal));
                setPortal(nextPortal);
                await refreshPortal(nextPortal.token);
            } else {
                setMessage({ kind: 'success', text: 'Thank you — your application has been received.' });
            }
        } catch (error) {
            setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'We could not submit your application. Please try again.' });
        }
    }

    function renderStep() {
        if (activeStep === 0) return <div className="apply-grid">
            <Field label="Legal first name *"><input value={form.legal_first_name} onChange={(event) => update('legal_first_name', event.target.value)} autoComplete="given-name" /></Field>
            <Field label="Legal last name *"><input value={form.legal_last_name} onChange={(event) => update('legal_last_name', event.target.value)} autoComplete="family-name" /></Field>
            <Field label="Preferred name"><input value={form.preferred_name} onChange={(event) => update('preferred_name', event.target.value)} /></Field>
            <Field label="Email address *"><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" /></Field>
            <Field label="Phone number *"><input type="tel" inputMode="tel" value={form.phone} onChange={(event) => update('phone', formatPhoneNumber(event.target.value))} placeholder="(325) 000-0000" maxLength="14" autoComplete="tel" /></Field>
            <Field label="Preferred contact method *"><select value={form.preferred_contact_method} onChange={(event) => update('preferred_contact_method', event.target.value)}><option value="phone">Phone</option><option value="email">Email</option><option value="either">Either</option></select></Field>
            <Field label="Street address *" wide><input value={form.address_line1} onChange={(event) => update('address_line1', event.target.value)} autoComplete="street-address" /></Field>
            <Field label="City *"><input value={form.city} onChange={(event) => update('city', event.target.value)} autoComplete="address-level2" /></Field>
            <Field label="State *"><input value={form.state} onChange={(event) => update('state', event.target.value.toUpperCase().slice(0, 2))} pattern="[A-Za-z]{2}" placeholder="TX" autoComplete="address-level1" /></Field>
            <Field label="ZIP code *"><input value={form.postal_code} onChange={(event) => update('postal_code', event.target.value)} autoComplete="postal-code" /></Field>
        </div>;
        if (activeStep === 1) return <div className="apply-grid">
            <Field label="Earliest start date *"><input type="date" value={form.earliest_start_date} onChange={(event) => update('earliest_start_date', event.target.value)} /></Field>
            <Field label="Employment preference *"><select value={form.employment_preference} onChange={(event) => update('employment_preference', event.target.value)}><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="either">Either</option></select></Field>
            <Field label="Desired weekly hours *"><input type="number" min="1" max="80" step="0.5" value={form.desired_weekly_hours} onChange={(event) => update('desired_weekly_hours', event.target.value)} /></Field>
            <div className="apply-field apply-field-wide"><span>Days available *</span><div className="apply-day-grid">{DAYS.map((day) => <label key={day}><input type="checkbox" checked={form.days_available.includes(day)} onChange={() => toggleDay(day)} />{day.slice(0, 3)}</label>)}</div></div>
            <Field label="Available times *" wide><textarea rows="3" value={form.availability_details} onChange={(event) => update('availability_details', event.target.value)} placeholder="Example: Mon–Fri after 5 PM; Saturday mornings" /></Field>
            <YesNo label="Available for evenings? *" name="evenings" value={form.evening_availability} onChange={(value) => update('evening_availability', value)} />
            <YesNo label="Available for weekends? *" name="weekends" value={form.weekend_availability} onChange={(value) => update('weekend_availability', value)} />
            <YesNo label="Do you have reliable transportation? *" name="transport" value={form.reliable_transportation} onChange={(value) => update('reliable_transportation', value)} />
            <YesNo label="Can you travel throughout our service area? *" name="travel" value={form.travel_service_area} onChange={(value) => update('travel_service_area', value)} />
            <YesNo label="Are you at least 18 years old? *" name="age" value={form.is_at_least_18} onChange={(value) => update('is_at_least_18', value)} />
            <label className="apply-check apply-field-wide"><input type="checkbox" checked={form.employment_authorization_acknowledged} onChange={(event) => update('employment_authorization_acknowledged', event.target.checked)} />I understand that employment authorization will be verified after a conditional offer of employment. *</label>
        </div>;
        if (activeStep === 2) return <div className="apply-grid">
            <YesNo label="Janitorial or commercial cleaning experience? *" name="cleaning" value={form.commercial_cleaning_experience} onChange={(value) => update('commercial_cleaning_experience', value)} />
            <Field label="Years of experience *"><input type="number" min="0" max="70" step="0.5" value={form.years_experience} onChange={(event) => update('years_experience', event.target.value)} /></Field>
            <Field label="Prior work settings *" wide><textarea rows="3" value={form.prior_work_settings} onChange={(event) => update('prior_work_settings', event.target.value)} placeholder="Example: offices, schools, medical facilities, retail, warehouses" /></Field>
            <Field label="Duties performed *" wide><textarea rows="3" value={form.duties_performed} onChange={(event) => update('duties_performed', event.target.value)} placeholder="Example: restroom sanitation, trash, dusting, detailed cleaning" /></Field>
            <Field label="Floor and equipment experience *" wide><textarea rows="3" value={form.floor_equipment_experience} onChange={(event) => update('floor_equipment_experience', event.target.value)} placeholder="Example: floor buffers, extractors, vacuums, autoscrubbers" /></Field>
            <Field label="Relevant certifications"><input value={form.certifications} onChange={(event) => update('certifications', event.target.value)} placeholder="Optional" /></Field>
            <Field label="Optional résumé" hint="PDF, DOC, or DOCX · 5 MB maximum"><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => { setResume(event.target.files?.[0] || null); setResumeNotice(false); }} />{resume && <small className="apply-file-name">Selected: {resume.name}</small>}{resumeNotice && <small className="apply-file-name">Choose your résumé again before submitting; browsers do not store file contents in a saved application.</small>}</Field>
        </div>;
        if (activeStep === 3) return <div className="apply-repeated-list">{form.previous_employers.map((employer, index) => <section className="apply-repeat" key={`employer-${index}`}><header><span>Employer {index + 1}</span><strong>{index === 0 ? 'Most recent role' : 'Previous role'}</strong></header><div className="apply-grid">
            <Field label="Company *"><input value={employer.company} onChange={(event) => updateEntry('previous_employers', index, 'company', event.target.value)} /></Field><Field label="Role *"><input value={employer.role_title} onChange={(event) => updateEntry('previous_employers', index, 'role_title', event.target.value)} /></Field><Field label="Supervisor *"><input value={employer.supervisor_name} onChange={(event) => updateEntry('previous_employers', index, 'supervisor_name', event.target.value)} /></Field><Field label="Supervisor phone *"><input type="tel" inputMode="tel" value={employer.supervisor_phone} onChange={(event) => updateEntry('previous_employers', index, 'supervisor_phone', formatPhoneNumber(event.target.value))} placeholder="(325) 000-0000" maxLength="14" autoComplete="tel" /></Field><Field label="Start date *"><input type="date" value={employer.start_date} onChange={(event) => updateEntry('previous_employers', index, 'start_date', event.target.value)} /></Field><Field label="End date *"><input type="date" value={employer.end_date} onChange={(event) => updateEntry('previous_employers', index, 'end_date', event.target.value)} /></Field><Field label="Duties *" wide><textarea rows="2" value={employer.duties} onChange={(event) => updateEntry('previous_employers', index, 'duties', event.target.value)} /></Field><Field label="Reason for leaving *" wide><textarea rows="2" value={employer.reason_for_leaving} onChange={(event) => updateEntry('previous_employers', index, 'reason_for_leaving', event.target.value)} /></Field><Field label="May we contact this employer? *"><select value={employer.permission_to_contact} onChange={(event) => updateEntry('previous_employers', index, 'permission_to_contact', event.target.value)}><option value="" disabled>Select one</option><option value="yes">Yes</option><option value="no">No</option></select></Field>
        </div></section>)}</div>;
        if (activeStep === 4) return <div className="apply-repeated-list">{form.professional_references.map((reference, index) => <section className="apply-repeat" key={`reference-${index}`}><header><span>Reference {index + 1}</span><strong>Professional reference</strong></header><div className="apply-grid"><Field label="Full name *"><input value={reference.full_name} onChange={(event) => updateEntry('professional_references', index, 'full_name', event.target.value)} /></Field><Field label="Relationship *"><input value={reference.relationship} onChange={(event) => updateEntry('professional_references', index, 'relationship', event.target.value)} /></Field><Field label="Phone *"><input type="tel" inputMode="tel" value={reference.phone} onChange={(event) => updateEntry('professional_references', index, 'phone', formatPhoneNumber(event.target.value))} placeholder="(325) 000-0000" maxLength="14" autoComplete="tel" /></Field><Field label="Email *"><input type="email" value={reference.email} onChange={(event) => updateEntry('professional_references', index, 'email', event.target.value)} /></Field><Field label="Years known *"><input type="number" min="0" max="70" step="0.5" value={reference.years_known} onChange={(event) => updateEntry('professional_references', index, 'years_known', event.target.value)} /></Field><Field label="May we contact this reference? *"><select value={reference.permission_to_contact} onChange={(event) => updateEntry('professional_references', index, 'permission_to_contact', event.target.value)}><option value="" disabled>Select one</option><option value="yes">Yes</option><option value="no">No</option></select></Field></div></section>)}</div>;
        return <div className="apply-grid">
            <div className="apply-review-summary apply-field-wide"><span>Application readiness</span><strong>{completeCount} of {STEP_META.length} sections complete</strong><p>Review each section in the left menu. A check mark means that section is ready to submit.</p></div>
            <Field label="Additional comments" wide><textarea rows="3" value={form.additional_comments} onChange={(event) => update('additional_comments', event.target.value)} /></Field>
            <Field label="Submission date"><input readOnly value={submittedDate} /></Field>
            <Field label="Type your full legal name as your signature *"><input value={form.typed_signature} onChange={(event) => update('typed_signature', event.target.value)} /></Field>
            <div className="apply-check-stack apply-field-wide"><label className="apply-check"><input type="checkbox" checked={form.accuracy_acknowledged} onChange={(event) => update('accuracy_acknowledged', event.target.checked)} />I certify that the information in this application is accurate and complete. *</label><label className="apply-check"><input type="checkbox" checked={form.reference_verification_authorized} onChange={(event) => update('reference_verification_authorized', event.target.checked)} />I authorize Master Commercial Clean to verify my employment history and professional references. *</label><label className="apply-check"><input type="checkbox" checked={form.consent_acknowledged} onChange={(event) => update('consent_acknowledged', event.target.checked)} />I consent to the collection and use of this information for employment consideration. *</label></div>
            <p className="apply-compliance-note apply-field-wide">I-9 and W-4 next steps remain locked until the hiring team approves your application. We never ask for SSNs, tax values, or identity-document details in this application.</p>
        </div>;
    }

    const seo = <SEO title="Apply to Work With Master Commercial Clean | West Texas" description="Start, save, and submit a secure employment application for commercial cleaning work with Master Commercial Clean." path="/apply" noIndex={startPath} schemas={[...buildBaseSchemas(), buildWebPageSchema({ path: '/apply', title: 'Apply to Work With Master Commercial Clean', description: 'Start and save a secure employment application for commercial cleaning work.' }), buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Apply', path: '/apply' }])]} />;

    if (portal) {
        const approved = portalStatus.data?.applicationStatus === 'approved';
        const tasks = portalStatus.data?.onboardingTasks || [];
        return <div className="apply-page apply-process-page">{seo}<Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Apply', path: '/apply' }]} /><main className="container apply-process-shell"><header className="apply-process-title"><span>Master Commercial Clean</span><h1>Application &amp; onboarding</h1><p>Your saved browser session keeps this progress panel available when you return.</p></header><div className="apply-process-grid"><aside className="apply-progress-nav"><div className="apply-progress-group"><header><span>Application</span><strong>1/1</strong></header><div className="apply-progress-item complete"><i>✓</i><span>Application submitted</span></div></div><div className="apply-progress-group"><header><span>Next steps</span><strong>{approved ? `${tasks.filter((task) => task.status === 'complete').length}/${tasks.length || 2}` : 'Locked'}</strong></header><div className={`apply-progress-item ${approved ? '' : 'locked'}`}><i>{approved ? '1' : '•'}</i><span>Official Form I-9</span></div><div className={`apply-progress-item ${approved ? '' : 'locked'}`}><i>{approved ? '2' : '•'}</i><span>Official Form W-4</span></div></div></aside><section className="apply-wizard-card apply-status-card"><div className="apply-step-heading"><span>{portalStatus.kind === 'loading' ? 'Checking status' : approved ? 'Application approved' : 'Application received'}</span><h2>{approved ? 'Your onboarding next steps are ready.' : 'Your application is with our hiring team.'}</h2><p>{approved ? 'Use the current official forms below and follow the instructions from your hiring contact. Do not send identity documents, SSNs, or tax values through this website.' : 'We will unlock the official I-9 and W-4 next steps here after your application is approved.'}</p></div>{portalStatus.kind === 'error' && <p className="apply-message apply-message-error">{portalStatus.error}</p>}{portalStatus.kind === 'loading' && <p className="apply-message">Refreshing your application status…</p>}{approved && <div className="apply-onboarding-cards"><article><span>Step 1</span><h3>Official Form I-9</h3><p>{tasks.find((task) => task.task_type === 'i9_official_form')?.instructions || 'Complete the current official USCIS Form I-9 with your hiring contact.'}</p><a className="apply-button" href="https://www.uscis.gov/i-9" target="_blank" rel="noreferrer">Open official I-9 <span>↗</span></a></article><article><span>Step 2</span><h3>Official Form W-4</h3><p>{tasks.find((task) => task.task_type === 'w4_official_form')?.instructions || 'Complete the current official IRS Form W-4 through the approved payroll process.'}</p><a className="apply-button" href="https://www.irs.gov/forms-pubs/about-form-w-4" target="_blank" rel="noreferrer">Open official W-4 <span>↗</span></a></article></div>}<div className="apply-wizard-actions"><Link className="apply-secondary-button" to="/">Return home</Link><button className="apply-button" type="button" onClick={() => void refreshPortal(portal.token)}>Check status <span>↻</span></button></div></section></div></main></div>;
    }

    if (!started) return <div className="apply-page apply-entry-page">{seo}<section className="apply-entry-hero"><div className="container"><div><span>Careers at Master Commercial Clean</span><h1>Work with a team that takes <em>pride</em> in every detail.</h1><p>Start a secure application, save your progress in this browser, and return whenever you are ready.</p><button className="apply-button" type="button" onClick={startApplication}>Start application process <span>→</span></button></div><aside><strong>What to expect</strong><ul><li>Six clear application sections</li><li>Your in-progress work is saved in this browser</li><li>I-9 and W-4 unlock only after approval</li></ul></aside></div></section><Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Apply', path: '/apply' }]} /></div>;

    const step = STEP_META[activeStep];
    return <div className="apply-page apply-process-page">{seo}<Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Apply', path: '/apply' }]} /><main className="container apply-process-shell"><header className="apply-process-title"><span>Employment / job application</span><h1>Master Commercial Clean</h1><p>Save your place automatically in this browser. You can return to <strong>mastercleanhq.com/apply</strong> and continue.</p></header>{restoreNotice && <div className="apply-restore-notice" role="status"><span>✓</span><p>Your progress has been restored. Your résumé file is not saved by your browser for privacy, so select it again before submitting if needed.</p><button type="button" onClick={() => setRestoreNotice(false)}>Dismiss</button><button type="button" onClick={startOver}>Start over</button></div>}<div className="apply-process-grid"><aside className="apply-progress-nav"><div className="apply-progress-group"><header><span>Application</span><strong>{completeCount}/{STEP_META.length}</strong></header>{STEP_META.map((item, index) => <button key={item.id} className={`apply-progress-item ${index === activeStep ? 'active' : ''} ${complete[item.id] ? 'complete' : ''}`} type="button" onClick={() => goToStep(index)}><i>{complete[item.id] ? '✓' : index + 1}</i><span>{item.label}</span></button>)}</div><div className="apply-progress-group"><header><span>Next steps</span><strong>Locked</strong></header><div className="apply-progress-item locked"><i>⌕</i><span>Official Form I-9</span></div><div className="apply-progress-item locked"><i>⌕</i><span>Official Form W-4</span></div><p className="apply-nav-note">Unlocked only after the hiring team approves your application.</p></div></aside><form className="apply-wizard-card" onSubmit={submit} noValidate><div className="apply-step-heading"><span>{step.kicker}</span><h2>{step.title}</h2><p>{step.copy}</p></div>{renderStep()}<div className="apply-honeypot" aria-hidden="true"><label>Company website<input tabIndex="-1" autoComplete="off" value={form.company_website} onChange={(event) => update('company_website', event.target.value)} /></label></div>{message.text && <p aria-live="polite" className={message.kind === 'error' ? 'apply-message apply-message-error' : 'apply-message'}>{message.text}</p>}<div className="apply-wizard-actions"><button className="apply-secondary-button" type="button" disabled={activeStep === 0 || message.kind === 'loading'} onClick={() => goToStep(Math.max(activeStep - 1, 0))}>← Previous</button>{activeStep < STEP_META.length - 1 ? <button className="apply-button" type="button" onClick={goNext}>Next <span>→</span></button> : <button className="apply-button" disabled={message.kind === 'loading'} type="submit">{message.kind === 'loading' ? 'Submitting…' : 'Submit application'} <span>→</span></button>}</div></form></div></main></div>;
};

export default ApplyPage;
