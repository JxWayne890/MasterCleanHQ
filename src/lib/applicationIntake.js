export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const STATE_ENTRIES = [
    ['AL', 'ALABAMA'], ['AK', 'ALASKA'], ['AZ', 'ARIZONA'], ['AR', 'ARKANSAS'], ['CA', 'CALIFORNIA'],
    ['CO', 'COLORADO'], ['CT', 'CONNECTICUT'], ['DE', 'DELAWARE'], ['DC', 'DISTRICT OF COLUMBIA'], ['FL', 'FLORIDA'],
    ['GA', 'GEORGIA'], ['HI', 'HAWAII'], ['ID', 'IDAHO'], ['IL', 'ILLINOIS'], ['IN', 'INDIANA'],
    ['IA', 'IOWA'], ['KS', 'KANSAS'], ['KY', 'KENTUCKY'], ['LA', 'LOUISIANA'], ['ME', 'MAINE'],
    ['MD', 'MARYLAND'], ['MA', 'MASSACHUSETTS'], ['MI', 'MICHIGAN'], ['MN', 'MINNESOTA'], ['MS', 'MISSISSIPPI'],
    ['MO', 'MISSOURI'], ['MT', 'MONTANA'], ['NE', 'NEBRASKA'], ['NV', 'NEVADA'], ['NH', 'NEW HAMPSHIRE'],
    ['NJ', 'NEW JERSEY'], ['NM', 'NEW MEXICO'], ['NY', 'NEW YORK'], ['NC', 'NORTH CAROLINA'], ['ND', 'NORTH DAKOTA'],
    ['OH', 'OHIO'], ['OK', 'OKLAHOMA'], ['OR', 'OREGON'], ['PA', 'PENNSYLVANIA'], ['RI', 'RHODE ISLAND'],
    ['SC', 'SOUTH CAROLINA'], ['SD', 'SOUTH DAKOTA'], ['TN', 'TENNESSEE'], ['TX', 'TEXAS'], ['UT', 'UTAH'],
    ['VT', 'VERMONT'], ['VA', 'VIRGINIA'], ['WA', 'WASHINGTON'], ['WV', 'WEST VIRGINIA'], ['WI', 'WISCONSIN'],
    ['WY', 'WYOMING'],
];
const US_STATE_CODES = new Set(STATE_ENTRIES.map(([code]) => code));
const STATE_BY_NAME = Object.fromEntries(STATE_ENTRIES.map(([code, name]) => [name, code]));
const EMPLOYMENT_PREFERENCES = new Set(['full_time', 'part_time', 'either']);
const CONTACT_METHODS = new Set(['phone', 'email', 'either']);

export function formatPhoneNumber(value) {
    const rawDigits = String(value || '').replace(/\D/g, '');
    const digits = rawDigits.length === 11 && rawDigits.startsWith('1') ? rawDigits.slice(1) : rawDigits.slice(0, 10);
    if (!digits) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function phoneDigits(value) {
    const rawDigits = String(value || '').replace(/\D/g, '');
    return rawDigits.length === 11 && rawDigits.startsWith('1') ? rawDigits.slice(1) : rawDigits;
}

export function isEmail(value) {
    const email = String(value || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isUsPhone(value) {
    const digits = phoneDigits(value);
    return digits.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);
}

export function isZipCode(value) {
    return /^\d{5}(?:-\d{4})?$/.test(String(value || '').trim());
}

export function canonicalState(value) {
    const cleaned = String(value || '').trim().toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ');
    if (US_STATE_CODES.has(cleaned)) return cleaned;
    return STATE_BY_NAME[cleaned] || '';
}

export function isIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
    const [year, month, day] = String(value).split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function trimmed(value) {
    return String(value || '').trim();
}

function hasText(value) {
    return Boolean(trimmed(value));
}

export function buildApplicationPayload(form, submissionDate) {
    return {
        legal_first_name: trimmed(form.legal_first_name),
        legal_last_name: trimmed(form.legal_last_name),
        preferred_name: trimmed(form.preferred_name),
        email: trimmed(form.email),
        phone: formatPhoneNumber(form.phone),
        address_line1: trimmed(form.address_line1),
        city: trimmed(form.city),
        state: canonicalState(form.state),
        postal_code: trimmed(form.postal_code),
        preferred_contact_method: form.preferred_contact_method,
        earliest_start_date: form.earliest_start_date,
        employment_preference: form.employment_preference,
        days_available: Array.isArray(form.days_available) ? [...form.days_available] : [],
        availability_details: trimmed(form.availability_details),
        evening_availability: form.evening_availability === 'yes',
        weekend_availability: form.weekend_availability === 'yes',
        desired_weekly_hours: Number(form.desired_weekly_hours),
        reliable_transportation: form.reliable_transportation === 'yes',
        travel_service_area: form.travel_service_area === 'yes',
        is_at_least_18: form.is_at_least_18 === 'yes',
        employment_authorization_acknowledged: form.employment_authorization_acknowledged === true,
        commercial_cleaning_experience: form.commercial_cleaning_experience === 'yes',
        years_experience: Number(form.years_experience),
        prior_work_settings: trimmed(form.prior_work_settings),
        duties_performed: trimmed(form.duties_performed),
        floor_equipment_experience: trimmed(form.floor_equipment_experience),
        certifications: trimmed(form.certifications),
        previous_employers: (form.previous_employers || []).map((item) => ({
            company: trimmed(item.company),
            role_title: trimmed(item.role_title),
            supervisor_name: trimmed(item.supervisor_name),
            supervisor_phone: formatPhoneNumber(item.supervisor_phone),
            start_date: item.start_date,
            end_date: item.end_date,
            duties: trimmed(item.duties),
            reason_for_leaving: trimmed(item.reason_for_leaving),
            permission_to_contact: item.permission_to_contact === 'yes',
        })),
        professional_references: (form.professional_references || []).map((item) => ({
            full_name: trimmed(item.full_name),
            relationship: trimmed(item.relationship),
            phone: formatPhoneNumber(item.phone),
            email: trimmed(item.email),
            years_known: Number(item.years_known),
            permission_to_contact: item.permission_to_contact === 'yes',
        })),
        additional_comments: trimmed(form.additional_comments),
        accuracy_acknowledged: form.accuracy_acknowledged === true,
        reference_verification_authorized: form.reference_verification_authorized === true,
        typed_signature: trimmed(form.typed_signature),
        consent_acknowledged: form.consent_acknowledged === true,
        company_website: typeof form.company_website === 'string' ? form.company_website : '',
        submission_date: submissionDate,
    };
}

export function intakeFailureMessage(data) {
    const errors = data && Array.isArray(data.errors) ? data.errors.filter((item) => typeof item === 'string' && item.trim()) : [];
    if (errors.length) return errors.join(' ');
    if (data && typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    if (data && typeof data.message === 'string' && data.message.trim()) return data.message.trim();
    return 'We could not submit your application. Please review the form and try again.';
}

export function validateApplicationStep(form, stepId, resume) {
    if (stepId === 'personal') {
        if (!hasText(form.legal_first_name) || !hasText(form.legal_last_name) || !hasText(form.address_line1) || !hasText(form.city)) return 'Please complete your legal name, phone number, email, and address.';
        if (!isEmail(form.email)) return 'Enter a valid email address.';
        if (!isUsPhone(form.phone)) return 'Enter a valid United States phone number.';
        if (!CONTACT_METHODS.has(form.preferred_contact_method)) return 'Choose a preferred contact method.';
        if (!canonicalState(form.state)) return 'Select a valid state.';
        if (!isZipCode(form.postal_code)) return 'Enter a valid ZIP code.';
        return '';
    }
    if (stepId === 'availability') {
        if (form.is_at_least_18 === 'no') return 'You must be at least 18 years old to apply.';
        if (!isIsoDate(form.earliest_start_date)) return 'Enter a valid earliest start date.';
        if (!EMPLOYMENT_PREFERENCES.has(form.employment_preference)) return 'Choose an employment preference.';
        const hours = Number(form.desired_weekly_hours);
        if (!Number.isFinite(hours) || hours < 1 || hours > 80) return 'Desired weekly hours must be between 1 and 80.';
        if (!Array.isArray(form.days_available) || form.days_available.length === 0) return 'Select at least one available day.';
        if (new Set(form.days_available).size !== form.days_available.length || form.days_available.some((day) => !DAYS.includes(day))) return 'Select valid available days without duplicates.';
        if (!hasText(form.availability_details)) return 'Please complete your work availability and required acknowledgements.';
        if (!['yes', 'no'].includes(form.evening_availability) || !['yes', 'no'].includes(form.weekend_availability) || !['yes', 'no'].includes(form.reliable_transportation) || !['yes', 'no'].includes(form.travel_service_area) || form.is_at_least_18 !== 'yes') return 'Please complete your work availability and required acknowledgements.';
        if (!form.employment_authorization_acknowledged) return 'Please confirm that employment authorization will be verified after a conditional offer.';
        return '';
    }
    if (stepId === 'experience') {
        const years = Number(form.years_experience);
        if (!['yes', 'no'].includes(form.commercial_cleaning_experience) || !hasText(form.years_experience) || !hasText(form.prior_work_settings) || !hasText(form.duties_performed) || !hasText(form.floor_equipment_experience) || !Number.isFinite(years) || years < 0) return 'Please complete your cleaning experience and equipment background.';
        return '';
    }
    if (stepId === 'employment') {
        const employers = Array.isArray(form.previous_employers) ? form.previous_employers : [];
        if (employers.length !== 2) return 'Complete both employer entries, including a valid supervisor phone number, work dates, and contact permission.';
        const invalid = employers.some((employer) => !hasText(employer.company) || !hasText(employer.role_title) || !hasText(employer.supervisor_name) || !isUsPhone(employer.supervisor_phone) || !isIsoDate(employer.start_date) || !isIsoDate(employer.end_date) || employer.end_date < employer.start_date || !hasText(employer.duties) || !hasText(employer.reason_for_leaving) || !['yes', 'no'].includes(employer.permission_to_contact));
        return invalid ? 'Complete both employer entries, including a valid supervisor phone number, work dates, and contact permission.' : '';
    }
    if (stepId === 'references') {
        const references = Array.isArray(form.professional_references) ? form.professional_references : [];
        if (references.length !== 2) return 'Complete both reference entries with a valid phone number, email address, and contact permission.';
        const invalid = references.some((reference) => {
            const years = Number(reference.years_known);
            return !hasText(reference.full_name) || !hasText(reference.relationship) || !isUsPhone(reference.phone) || !isEmail(reference.email) || !hasText(reference.years_known) || !Number.isFinite(years) || years < 0 || !['yes', 'no'].includes(reference.permission_to_contact);
        });
        return invalid ? 'Complete both reference entries with a valid phone number, email address, and contact permission.' : '';
    }
    if (stepId === 'review') {
        if (resume && (!RESUME_TYPES.includes(resume.type) || resume.size > MAX_RESUME_BYTES)) return 'Use a PDF, DOC, or DOCX résumé no larger than 5 MB, or remove the file.';
        if (!hasText(form.typed_signature) || !form.accuracy_acknowledged || !form.reference_verification_authorized || !form.consent_acknowledged) return 'Please complete your typed signature and required acknowledgements.';
        return '';
    }
    return '';
}
