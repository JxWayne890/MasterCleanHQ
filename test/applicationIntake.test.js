import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApplicationPayload, canonicalState, intakeFailureMessage, isUsPhone, isZipCode, validateApplicationStep } from '../src/lib/applicationIntake.js';

const employer = (overrides = {}) => ({ company: 'Acme Cleaning', role_title: 'Cleaner', supervisor_name: 'Sam Supervisor', supervisor_phone: '(325) 555-0101', start_date: '2022-01-01', end_date: '2023-06-01', duties: 'Swept and sanitized floors.', reason_for_leaving: 'Schedule change', permission_to_contact: 'yes', ...overrides });
const reference = (overrides = {}) => ({ full_name: 'Riley Reference', relationship: 'Supervisor', phone: '(325) 555-0102', email: 'riley.reference@example.com', years_known: '2', permission_to_contact: 'yes', ...overrides });

function completedForm(overrides = {}) {
    return {
        legal_first_name: 'Taylor', legal_last_name: 'Applicant', preferred_name: '', email: 'taylor.applicant@example.com', phone: '(325) 555-0199',
        address_line1: '12 E Twohig Ave', city: 'San Angelo', state: 'TX', postal_code: '76903', preferred_contact_method: 'phone',
        earliest_start_date: '2026-12-01', employment_preference: 'either', days_available: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availability_details: 'Weekdays after 5 PM', evening_availability: 'yes', weekend_availability: 'no', desired_weekly_hours: '25',
        reliable_transportation: 'yes', travel_service_area: 'yes', is_at_least_18: 'yes', employment_authorization_acknowledged: true,
        commercial_cleaning_experience: 'no', years_experience: '3', prior_work_settings: 'Offices and schools', duties_performed: 'Restrooms and floors',
        floor_equipment_experience: 'Vacuums and buffers', certifications: '',
        previous_employers: [employer(), employer({ company: 'Second Co', supervisor_phone: '(325) 555-0198', start_date: '2020-02-01', end_date: '2021-12-01', permission_to_contact: 'no' })],
        professional_references: [reference(), reference({ full_name: 'Casey Contact', email: 'casey.contact@example.com', phone: '(325) 555-0103', years_known: '1.5' })],
        additional_comments: '', accuracy_acknowledged: true, reference_verification_authorized: true, typed_signature: 'Taylor Applicant', consent_acknowledged: true,
        company_website: '',
        ...overrides,
    };
}

test('a completed application payload matches the intake field types', () => {
    const payload = buildApplicationPayload(completedForm({ state: 'Texas', postal_code: '76903-1234' }), '2026-11-20');
    assert.equal(payload.state, 'TX');
    assert.equal(payload.postal_code, '76903-1234');
    assert.equal(payload.evening_availability, true);
    assert.equal(payload.weekend_availability, false);
    assert.equal(payload.commercial_cleaning_experience, false);
    assert.equal(payload.is_at_least_18, true);
    assert.equal(payload.desired_weekly_hours, 25);
    assert.equal(payload.years_experience, 3);
    assert.equal(payload.previous_employers.length, 2);
    assert.equal(payload.previous_employers[0].permission_to_contact, true);
    assert.equal(payload.previous_employers[1].permission_to_contact, false);
    assert.equal(payload.previous_employers[0].supervisor_phone, '(325) 555-0101');
    assert.equal(payload.professional_references[1].years_known, 1.5);
    assert.equal(payload.professional_references[1].permission_to_contact, true);
    assert.equal(payload.typed_signature, 'Taylor Applicant');
    assert.equal(payload.company_website, '');
    assert.equal(payload.submission_date, '2026-11-20');
    assert.equal(validateApplicationStep(completedForm({ state: 'Texas', postal_code: '76903-1234' }), 'personal'), '');
    for (const step of ['personal', 'availability', 'experience', 'employment', 'references', 'review']) {
        assert.equal(validateApplicationStep(completedForm(), step), '', step);
    }
});

test('honeypot values stay in the payload and are not treated as optional contact data', () => {
    const payload = buildApplicationPayload(completedForm({ company_website: 'https://spam.example' }), '2026-11-20');
    assert.equal(payload.company_website, 'https://spam.example');
});

test('client validation catches the intake rules that reject a filled form', () => {
    assert.equal(isUsPhone('(325) 000-0000'), false);
    assert.equal(isUsPhone('(325) 155-0199'), false);
    assert.equal(isUsPhone('(325) 555-0100'), true);
    assert.equal(isZipCode('7690'), false);
    assert.equal(isZipCode('76903 1234'), false);
    assert.equal(isZipCode('76903-1234'), true);
    assert.equal(canonicalState('TE'), '');
    assert.equal(canonicalState('Texas'), 'TX');
    assert.equal(validateApplicationStep(completedForm({ phone: '(325) 000-0000' }), 'personal'), 'Enter a valid United States phone number.');
    assert.equal(validateApplicationStep(completedForm({ state: 'TE' }), 'personal'), 'Select a valid state.');
    assert.equal(validateApplicationStep(completedForm({ postal_code: '7690' }), 'personal'), 'Enter a valid ZIP code.');
    assert.equal(validateApplicationStep(completedForm({ is_at_least_18: 'no' }), 'availability'), 'You must be at least 18 years old to apply.');
    assert.equal(validateApplicationStep(completedForm({ previous_employers: [employer({ supervisor_phone: '(325) 155-0100' }), employer()] }), 'employment'), 'Complete both employer entries, including a valid supervisor phone number, work dates, and contact permission.');
    assert.equal(validateApplicationStep(completedForm({ previous_employers: [employer({ end_date: '2021-01-01' }), employer()] }), 'employment'), 'Complete both employer entries, including a valid supervisor phone number, work dates, and contact permission.');
    assert.equal(validateApplicationStep(completedForm({ professional_references: [reference({ email: 'not-an-email' }), reference()] }), 'references'), 'Complete both reference entries with a valid phone number, email address, and contact permission.');
    assert.equal(validateApplicationStep(completedForm({ typed_signature: '  ' }), 'review'), 'Please complete your typed signature and required acknowledgements.');
});

test('intake failures surface every server error instead of a blank message', () => {
    assert.equal(intakeFailureMessage({ error: 'Enter a valid email address.', errors: ['Enter a valid email address.', 'Enter a valid ZIP code.'] }), 'Enter a valid email address. Enter a valid ZIP code.');
    assert.equal(intakeFailureMessage({ error: 'Please review the application and try again.' }), 'Please review the application and try again.');
    assert.equal(intakeFailureMessage({}), 'We could not submit your application. Please review the form and try again.');
    assert.equal(intakeFailureMessage({ error: { field: 'phone' }, message: 'Enter a valid United States phone number.' }), 'Enter a valid United States phone number.');
});
