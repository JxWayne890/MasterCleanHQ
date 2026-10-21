import { createHmac, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const NETWORK_BUCKET = 'mcc-network-intake';
export const NETWORK_RECIPIENT = 'john@mastercleanhq.com';
export const NETWORK_BODY_LIMIT = 16000;
// Reject HTTP and email control characters before constructing subjects or metadata.
const hasControlCharacters = (value) => [...value].some((char) => char.codePointAt(0) < 32 || char.codePointAt(0) === 127);
const contactFields = { companyName: 200, contactName: 150, email: 254, phone: 40, city: 100 };
const optionalFields = { referrer: 1000 };
const fail = (error, field) => ({ status: 422, body: { error, ...(field ? { field } : {}) } });
const yes = (value) => value === true || value === 'true' || value === 'on';
const safeText = (value, max) => typeof value === 'string' && value.trim().length <= max && !hasControlCharacters(value) ? value.trim() : '';
const hash = (secret, text) => createHmac('sha256', secret).update(text).digest('hex');

export function normalizeNetworkSubmission(raw, now = new Date()) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { status: 400, body: { error: 'Send a valid request.' } };
  if (raw.companyWebsite || raw.company_website) return { honeypot: true };
  if (!['referral', 'partner'].includes(raw.formType)) return fail('Select a valid request type.', 'formType');
  const fields = {};
  let region = null;
  let regionSlug = null;
  for (const [name, max] of Object.entries(contactFields)) {
    fields[name] = safeText(raw[name], max);
    if (!fields[name]) return fail('Please complete every required field.', name);
  }
  fields.email = fields.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return fail('Enter a valid email address.', 'email');
  const digits = fields.phone.replace(/\D/g, '');
  if (!/^(1)?\d{10}$/.test(digits)) return fail('Enter a valid United States phone number.', 'phone');
  fields.phone = `+1${digits.slice(-10)}`;
  if (!yes(raw.permissionToShare)) return fail('Please confirm that we may use your details to respond to this request.', 'permissionToShare');
  fields.permissionToShare = true;
  if (raw.formType === 'referral') {
    for (const [name, max] of Object.entries({ title: 150, buildingType: 100, frequency: 100 })) {
      fields[name] = safeText(raw[name], max);
      if (!fields[name]) return fail('Please complete every required field.', name);
    }
    if (/school|district|government|municipal|residential/i.test(fields.buildingType)) return fail('This network serves commercial buildings. Please contact us about other facilities.', 'buildingType');
    if (!yes(raw.revenueQualified)) return fail('This referral service is for companies with at least $1 million in annual revenue.', 'revenueQualified');
    fields.revenueQualified = true;
    for (const [name, max] of Object.entries({ squareFootage: 100000000, locations: 100000 })) {
      const value = String(raw[name] ?? '').trim();
      if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max) return fail('Enter an approximate positive whole number.', name);
      fields[name] = Number(value);
    }
    fields.startDate = safeText(raw.startDate, 10);
    const date = new Date(`${fields.startDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.startDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== fields.startDate) return fail('Choose a valid desired start date.', 'startDate');
    if (date.getUTCFullYear() < now.getUTCFullYear() - 1 || date.getUTCFullYear() > now.getUTCFullYear() + 5) return fail('Choose a current or upcoming desired start date.', 'startDate');
    fields.currentProvider = safeText(raw.currentProvider ?? '', 200);
    if (raw.currentProvider && !fields.currentProvider) return fail('Enter a current provider of 200 characters or fewer.', 'currentProvider');
  } else {
    if (Array.isArray(raw.services) && raw.services.some((value) => typeof value !== 'string')) return fail('Tell us which commercial cleaning services you provide.', 'services');
    const servicesText = Array.isArray(raw.services) ? raw.services.join(',') : typeof raw.services === 'string' ? raw.services : '';
    const services = servicesText.split(/[\r\n,]+/).map((value) => value.trim()).filter(Boolean);
    fields.services = [...new Set(services.map((value) => safeText(value, 250)).filter(Boolean))];
    if (!fields.services.length || fields.services.length > 20 || servicesText.length > 1500 || services.some((value) => !safeText(value, 250))) return fail('Tell us which commercial cleaning services you provide, using 1500 characters or fewer.', 'services');
    const years = String(raw.yearsInBusiness ?? '').trim();
    if (!/^\d{1,3}$/.test(years) || Number(years) > 150) return fail('Enter your years in business as a whole number.', 'yearsInBusiness');
    fields.yearsInBusiness = Number(years);
    if (!['yes', 'no'].includes(String(raw.insured).toLowerCase())) return fail('Select whether your business is insured.', 'insured');
    fields.insured = String(raw.insured).toLowerCase() === 'yes';
  }
  const sourcePage = safeText(raw.sourcePage, 250);
  if (!/^\/partner-network(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?\/?$/.test(sourcePage) || /thank-you/.test(sourcePage)) return fail('Open the form from a partner network page and retry.', 'sourcePage');
  if (raw.formType === 'partner' && !/^\/partner-network\/become-a-partner\/?$/.test(sourcePage)) return fail('Open the partner application page and retry.', 'sourcePage');
  if (raw.formType === 'referral') {
    const slug = sourcePage.split('/')[2];
    if (!slug || slug === 'become-a-partner') return fail('Open the city request page and retry.', 'sourcePage');
    try {
      const city = JSON.parse(readFileSync(join(process.cwd(), 'content', 'cities', `${slug}.json`), 'utf8'));
      if (typeof city.name !== 'string' || !city.name.trim()) throw new Error('City name is missing');
      region = city.name;
      regionSlug = slug;
    } catch { return fail('Open a supported city page and retry.', 'sourcePage'); }
  }
  const context = {};
  for (const [name, max] of Object.entries(optionalFields)) context[name] = safeText(raw[name] ?? '', max);
  return { submission: { schemaVersion: 1, formType: raw.formType, source: 'mcc_partner_network', sourcePage, ...(region ? { region, regionSlug } : {}), ...context, fields } };
}

export function networkConfig(env = process.env) {
  return {
    supabaseUrl: env.NETWORK_SUPABASE_URL,
    serviceKey: env.NETWORK_SUPABASE_SERVICE_ROLE_KEY,
    rateSalt: env.NETWORK_RATE_LIMIT_SALT,
    resendKey: env.NETWORK_RESEND_API_KEY,
    fromEmail: env.NETWORK_FROM_EMAIL,
    environment: env.VERCEL_ENV === 'production' ? 'production' : 'preview',
  };
}

export function createNetworkStore(config, fetcher = fetch) {
  const url = new URL(config.supabaseUrl);
  if (url.protocol !== 'https:' || !/^[a-z0-9]+\.supabase\.co$/.test(url.hostname) || url.pathname !== '/') throw new Error('Invalid storage configuration');
  if (!config.serviceKey || !config.rateSalt || config.rateSalt.length < 32) throw new Error('Missing storage configuration');
  const call = async (path, options = {}) => fetcher(new URL(`/storage/v1/${path}`, url), {
    ...options,
    headers: { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, ...options.headers },
    signal: AbortSignal.timeout(2000),
  });
  const object = (path, data, overwrite = false) => call(`object/${NETWORK_BUCKET}/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-upsert': String(overwrite) }, body: JSON.stringify(data),
  });
  return {
    async reserve(address, now) {
      const window = Math.floor(now.getTime() / (15 * 60 * 1000));
      const requester = hash(config.rateSalt, address || 'unknown');
      for (let slot = 0; slot < 3; slot++) {
        const response = await object(`${config.environment}/rate/${window}/${requester}/${slot}.json`, { expiresAt: new Date((window + 1) * 900000).toISOString() });
        if (response.ok) return true;
        let body = {};
        try { body = await response.json(); } catch { /* fail closed below */ }
        if (response.status !== 409 && !(response.status === 400 && (body.statusCode === '409' || body.error === 'Duplicate'))) throw new Error('Rate limit storage failed');
      }
      return false;
    },
    async save(record) {
      const path = `${config.environment}/submissions/${record.receivedAt.slice(0, 10)}/${record.formType}/${record.id}.json`;
      const response = await object(path, record);
      if (!response.ok) throw new Error('Lead storage failed');
      return path;
    },
    async mark(path, record) {
      const response = await object(path, record, true);
      if (!response.ok) throw new Error('Notification status storage failed');
    },
  };
}

export function buildNetworkEmail(record) {
  const { fields } = record;
  const subject = `${record.formType === 'referral' ? 'Referral Lead' : record.formType === 'quote' ? 'Quote Request' : 'Partner Application'}: ${fields.city} ${fields.companyName}`;
  const labels = { companyName: 'Company', contactName: 'Contact', title: 'Title', email: 'Email', phone: 'Phone', city: 'City', buildingType: 'Building type', squareFootage: 'Approximate square footage', locations: 'Number of locations', frequency: 'Cleaning frequency', startDate: 'Desired start date', currentProvider: 'Current provider', revenueQualified: 'At least $1 million annual revenue confirmed', permissionToShare: 'Permission confirmed', services: 'Services', serviceType: 'Requested service', message: 'Inquiry', preferredContactMethod: 'Preferred contact method', yearsInBusiness: 'Years in business', insured: 'Insured' };
  const lines = Object.entries(fields).map(([name, value]) => `${labels[name] || name}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'boolean' ? value ? 'Yes' : 'No' : value || 'Not provided'}`);
  return {
    subject,
    text: [`${record.environment === 'preview' ? 'PREVIEW TEST OR PREVIEW INQUIRY. Verify before follow up.\n\n' : ''}${record.formType === 'referral' ? 'New commercial cleaning referral request.' : record.formType === 'quote' ? 'New Master Commercial Clean quote request.' : 'New commercial cleaning partner application.'}`, '', ...lines, '', `Submission: ${record.id}`, `Received: ${record.receivedAt}`, `Source page: ${record.sourcePage}`, `Environment: ${record.environment}`, '', 'Saved in the private MCC network intake log.'].join('\n'),
  };
}

export async function sendNetworkNotification(record, config, fetcher = fetch) {
  if (!config.resendKey || !config.fromEmail) throw new Error('Email configuration is missing');
  const email = buildNetworkEmail(record);
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${config.resendKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `mcc-network-${record.id}` },
    body: JSON.stringify({ from: config.fromEmail, to: [NETWORK_RECIPIENT], ...(record.fields.email ? { reply_to: record.fields.email } : {}), ...email }), signal: AbortSignal.timeout(6500),
  });
  if (!response.ok) throw new Error('Internal notification failed');
  const body = await response.json();
  if (typeof body.id !== 'string' || !body.id) throw new Error('Notification confirmation missing');
  return body.id;
}

export async function submitNetworkIntake(raw, { config = networkConfig(), fetcher = fetch, store, now = new Date(), address = '', userAgent = '', id = randomUUID(), notify = sendNetworkNotification, logger = console } = {}) {
  const result = normalizeNetworkSubmission(raw, now);
  if (result.honeypot) return { status: 200, body: { submissionId: 'received' } };
  if (!result.submission) return result;
  let storage;
  try {
    storage = store || createNetworkStore(config, fetcher);
    if (!await storage.reserve(address, now)) return { status: 429, body: { error: 'Please wait 15 minutes before sending another request. You can also call (325) 273 2203.' } };
  } catch {
    logger.warn('Network intake storage unavailable');
    return { status: 503, body: { error: 'We could not confirm your request was saved. Please retry or call (325) 273 2203.' } };
  }
  const record = { ...result.submission, id, receivedAt: now.toISOString(), environment: config.environment || 'preview', userAgent: safeText(userAgent, 500), notification: { status: 'pending', recipient: NETWORK_RECIPIENT } };
  let path;
  try { path = await storage.save(record); }
  catch {
    logger.warn('Network intake save failed');
    return { status: 503, body: { error: 'We could not confirm your request was saved. Please retry or call (325) 273 2203.' } };
  }
  try {
    record.notification = { ...record.notification, status: 'sent', sentAt: new Date().toISOString(), providerId: await notify(record, config, fetcher) };
  } catch {
    record.notification.status = 'retry_required';
    logger.warn('Network intake notification retry required', id);
  }
  try { await storage.mark(path, record); } catch { logger.warn('Network intake notification status update failed', id); }
  return { status: 200, body: { submissionId: id, notificationStatus: record.notification.status } };
}

/** Quote data is already durable in CRM. This separate log tracks its internal email. */
export async function notifySavedQuote(raw, submissionId, { config = networkConfig(), fetcher = fetch, store, notify = sendNetworkNotification, now = new Date(), logger = console } = {}) {
  const names = { full_name: 'contactName', business_name: 'companyName', email: 'email', phone: 'phone', city: 'city', facility_type: 'buildingType', service_type: 'serviceType', message: 'message', preferred_contact_method: 'preferredContactMethod' };
  const fields = Object.fromEntries(Object.entries(names).map(([source, target]) => [target, typeof raw[source] === 'string' ? raw[source].trim().slice(0, source === 'message' ? 2500 : 254) : '']));
  // Body text may contain line breaks. Header fields must never contain controls.
  for (const name of ['companyName', 'city', 'email']) if (hasControlCharacters(fields[name])) fields[name] = fields[name].replace(/\s+/g, ' ');
  const record = { id: submissionId, schemaVersion: 1, formType: 'quote', source: 'mcc_website_quote', sourcePage: typeof raw.source_page === 'string' ? raw.source_page.slice(0, 500) : '/contact', receivedAt: now.toISOString(), environment: config.environment || 'preview', fields, notification: { status: 'pending', recipient: NETWORK_RECIPIENT } };
  let storage, path;
  try { storage = store || createNetworkStore(config, fetcher); path = await storage.save(record); }
  catch { logger.warn('Saved CRM quote needs notification recovery', submissionId); return 'retry_required'; }
  try { record.notification = { ...record.notification, status: 'sent', sentAt: new Date().toISOString(), providerId: await notify(record, config, fetcher) }; }
  catch { record.notification.status = 'retry_required'; logger.warn('Saved CRM quote notification retry required', submissionId); }
  try { await storage.mark(path, record); } catch { logger.warn('Saved CRM quote notification status update failed', submissionId); }
  return record.notification.status;
}
