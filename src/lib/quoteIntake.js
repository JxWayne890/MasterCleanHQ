export const QUOTE_INTAKE_URL = 'https://siipmaubrftdkbttsnbu.supabase.co/functions/v1/website-lead-intake';

export function validateQuote(payload) {
    for (const key of ['full_name', 'business_name', 'phone', 'city', 'facility_type', 'service_type']) {
        if (!payload[key]?.trim()) return 'Please complete every required field.';
    }
    const digits = payload.phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(digits) && !/^1\d{10}$/.test(digits)) return 'Enter a valid 10 digit phone number.';
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'Enter a valid email address.';
    if (payload.preferred_contact_method === 'Email' && !payload.email) return 'Enter your email address or choose phone contact.';
    return '';
}

// Only the existing public intake URL is shipped to the browser. The CRM owns
// validation, rate limiting, deduplication, and the atomic lead/quote insert.
export async function submitQuote(payload, { fetchImpl = fetch, timeoutMs = 20000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl(QUOTE_INTAKE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (response.status === 429) throw new Error('Please wait before sending another request, or call our office.');
        if (!response.ok || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.submissionId || '')) {
            throw new Error('We could not confirm your request was saved. Your details are still here. Please try again or call our office.');
        }
        return { submissionId: data.submissionId, duplicate: data.duplicate === true };
    } catch (error) {
        if (error.name === 'AbortError' || error instanceof TypeError) {
            throw new Error('We could not confirm delivery. Your details are still here. Please try again or call our office.');
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}
