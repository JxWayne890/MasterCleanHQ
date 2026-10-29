import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNetworkEmail, createNetworkStore, normalizeNetworkSubmission, submitNetworkIntake } from '../server/lib/network-intake.js';
import handler from '../api/network-intake.js';

const raw = { formType: 'referral', companyName: 'MCC SYNTHETIC NETWORK TEST', contactName: 'Test Contact', title: 'Facilities Manager', email: 'QA@example.com', phone: '(325) 555 0100', city: 'Greater Houston', buildingType: 'Corporate office', squareFootage: '12000', locations: '2', frequency: 'Three visits a week', startDate: '2026-11-15', currentProvider: '', revenueQualified: 'true', permissionToShare: 'true', sourcePage: '/partner-network/greater-houston' };
const partner = { formType: 'partner', companyName: 'MCC SYNTHETIC PARTNER TEST', contactName: 'Test Partner', email: 'qa@example.com', phone: '13255550100', city: 'Austin', services: ['Janitorial', 'Floor care'], yearsInBusiness: '8', insured: 'Yes', permissionToShare: true, sourcePage: '/partner-network/become-a-partner' };
const now = new Date('2026-10-21T12:00:00Z');
const config = { environment: 'preview', supabaseUrl: 'https://siipmaubrftdkbttsnbu.supabase.co', serviceKey: 'server-secret', rateSalt: 'a'.repeat(32) };
const logger = { warn() {} };
const fakeStore = (calls) => ({ async reserve() { calls.push('rate'); return true; }, async save(record) { calls.push(['save', structuredClone(record)]); return 'record.json'; }, async mark(path, record) { calls.push(['mark', structuredClone(record)]); } });

test('referral validation preserves clean structured fields and checks the city data file', () => {
  const { submission } = normalizeNetworkSubmission(raw, now);
  assert.equal(submission.fields.email, 'qa@example.com');
  assert.equal(submission.fields.phone, '+13255550100');
  assert.equal(submission.fields.squareFootage, 12000);
  assert.equal(submission.fields.revenueQualified, true);
  const suburb = normalizeNetworkSubmission({ ...raw, city: 'Katy' }, now).submission;
  assert.equal(suburb.fields.city, 'Katy');
  assert.equal(suburb.region, 'Greater Houston');
  assert.equal(suburb.regionSlug, 'greater-houston');
  assert.equal(normalizeNetworkSubmission({ ...raw, sourcePage: '/partner-network/../../secret' }, now).status, 422);
});
test('partner validation accepts case insensitive insurance and normalizes service array', () => {
  const { submission } = normalizeNetworkSubmission(partner, now);
  assert.deepEqual(submission.fields.services, ['Janitorial', 'Floor care']);
  assert.equal(submission.fields.insured, true);
  assert.equal(submission.fields.yearsInBusiness, 8);
  assert.deepEqual(normalizeNetworkSubmission({ ...partner, services: 'Janitorial\nFloor care, Day porter' }, now).submission.fields.services, ['Janitorial', 'Floor care', 'Day porter']);
});
test('required qualification, consent, supported building types and numeric fields cannot be bypassed', () => {
  for (const change of [{ revenueQualified: false }, { permissionToShare: false }, { buildingType: 'School district' }, { buildingType: 'Government building' }, { squareFootage: '-1' }, { locations: '1.5' }, { startDate: '2026-02-31' }, { title: 'A'.repeat(151) }, { companyName: 'Injected\r\nBcc: victim@example.com' }, { email: 'bad address' }, { phone: '123' }]) assert.equal(normalizeNetworkSubmission({ ...raw, ...change }, now).status, 422, JSON.stringify(change));
  assert.equal(normalizeNetworkSubmission({ ...partner, insured: 'maybe' }, now).status, 422);
});
test('honeypot has no storage or notification side effects', async () => {
  const store = { reserve() { throw new Error('must not run'); } };
  assert.equal((await submitNetworkIntake({ ...raw, companyWebsite: 'bot.example' }, { config, store })).status, 200);
});
test('durable save always precedes an internal notification with exact subject and recipient metadata', async () => {
  const calls = [];
  const result = await submitNetworkIntake(raw, { config, now, logger, store: fakeStore(calls), notify: async (record) => { calls.push(['notify', buildNetworkEmail(record)]); return 'email-id'; } });
  assert.equal(result.status, 200);
  assert.deepEqual(calls.map((call) => Array.isArray(call) ? call[0] : call), ['rate', 'save', 'notify', 'mark']);
  assert.equal(calls[1][1].notification.status, 'pending');
  assert.equal(calls[2][1].subject, 'Referral Lead: Greater Houston MCC SYNTHETIC NETWORK TEST');
  assert.equal(calls[3][1].notification.recipient, 'john@mastercleanhq.com');
  assert.equal(calls[3][1].environment, 'preview');
});
test('notification failure preserves a confirmed lead and marks it for operator retry', async () => {
  const calls = [];
  const result = await submitNetworkIntake(partner, { config, now, logger, store: fakeStore(calls), notify: async () => { throw new Error('email unavailable'); } });
  assert.equal(result.status, 200);
  assert.equal(result.body.notificationStatus, 'retry_required');
  assert.equal(calls.at(-1)[1].notification.status, 'retry_required');
  assert.equal(buildNetworkEmail(calls.at(-1)[1]).subject, 'Partner Application: Austin MCC SYNTHETIC PARTNER TEST');
});
test('rate or storage failures never show a false success or send an email', async () => {
  let notifications = 0;
  const notify = async () => { notifications++; };
  const blocked = await submitNetworkIntake(raw, { config, now, logger, notify, store: { reserve: async () => false } });
  assert.equal(blocked.status, 429);
  const failed = await submitNetworkIntake(raw, { config, now, logger, notify, store: { reserve: async () => true, save: async () => { throw new Error('save unavailable'); } } });
  assert.equal(failed.status, 503);
  assert.equal(notifications, 0);
});
test('atomic rate reservations coordinate separate server instances and fail closed on storage errors', async () => {
  const objects = new Set();
  const fetcher = async (url, options) => {
    const path = new URL(url).pathname;
    assert.equal(options.headers['x-upsert'], 'false');
    if (objects.has(path)) return new Response(JSON.stringify({ error: 'Duplicate', statusCode: '409' }), { status: 400 });
    objects.add(path); return new Response('{}', { status: 200 });
  };
  const stores = [createNetworkStore(config, fetcher), createNetworkStore(config, fetcher)];
  const allowed = await Promise.all(Array.from({ length: 9 }, (_, index) => stores[index % 2].reserve('198.51.100.5', now)));
  assert.equal(allowed.filter(Boolean).length, 3);
  assert.equal(objects.size, 3);
  assert.ok([...objects].every((path) => !path.includes('198.51.100.5')));
  await assert.rejects(createNetworkStore(config, async () => new Response('{}', { status: 503 })).reserve('198.51.100.5', now));
});
function response() { return { headers: {}, setHeader(name, value) { this.headers[name] = value; }, status(value) { this.statusCode = value; return this; }, json(body) { this.body = body; return this; }, send(body) { this.body = body; return this; }, redirect(status, path) { this.statusCode = status; this.redirectPath = path; return this; } }; }
test('HTTP endpoint rejects cross origin requests, oversized payloads and wrong content types', async () => {
  const base = { method: 'POST', headers: { origin: 'https://www.mastercleanhq.com', 'content-type': 'application/json', accept: 'application/json' }, body: raw };
  for (const [change, status] of [[{ headers: { ...base.headers, origin: 'https://evil.example' } }, 403], [{ headers: { ...base.headers, 'content-length': '18000' } }, 413], [{ headers: { ...base.headers, 'content-type': 'text/plain' } }, 415], [{ method: 'GET' }, 405]]) {
    const res = response(); await handler({ ...base, ...change }, res); assert.equal(res.statusCode, status);
  }
});
test('native forms and JSON clients work from MCC and MasterClean Connect origins', async () => {
  const body = { ...raw, companyWebsite: 'bot' };
  for (const origin of ['https://www.mastercleanhq.com', 'https://mastercleanhq.com', 'https://mastercleanconnect.com']) {
    const native = response();
    await handler({ method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body).toString() }, native);
    assert.equal(native.statusCode, 303);
    assert.equal(native.redirectPath, '/partner-network/thank-you');
    assert.equal(native.headers['Access-Control-Allow-Origin'], origin);
    const json = response();
    await handler({ method: 'POST', headers: { origin, 'content-type': 'application/json', accept: 'application/json' }, body }, json);
    assert.equal(json.statusCode, 200);
    assert.equal(json.body.submissionId, 'received');
    assert.equal(json.headers['Access-Control-Allow-Origin'], origin);
    assert.equal(json.headers.Vary, 'Origin');
  }
});

test('Connect JSON preflight succeeds without processing a submission', async () => {
  const res = response();
  await handler({ method: 'OPTIONS', headers: { origin: 'https://mastercleanconnect.com', 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } }, res);
  assert.equal(res.statusCode, 204);
  assert.equal(res.body, '');
  assert.equal(res.headers['Access-Control-Allow-Origin'], 'https://mastercleanconnect.com');
  assert.equal(res.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS');
  assert.equal(res.headers['Access-Control-Allow-Headers'], 'Content-Type, Accept');
  assert.equal(res.headers.Vary, 'Origin');
});

test('untrusted origins receive no CORS permission for preflight or form posts', async () => {
  for (const origin of ['https://evil.example', 'https://mastercleanconnect.com.evil.example', 'http://mastercleanconnect.com', undefined]) {
    for (const method of ['OPTIONS', 'POST']) {
      const res = response();
      await handler({ method, headers: { origin, accept: 'application/json', 'content-type': 'application/json' }, body: { ...raw, companyWebsite: 'bot' } }, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.headers['Access-Control-Allow-Origin'], undefined);
      assert.equal(res.headers['Access-Control-Allow-Methods'], undefined);
    }
  }
});

test('Connect clients can read validation errors through CORS', async () => {
  const res = response();
  await handler({ method: 'POST', headers: { origin: 'https://mastercleanconnect.com', accept: 'application/json', 'content-type': 'text/plain' }, body: raw }, res);
  assert.equal(res.statusCode, 415);
  assert.equal(res.headers['Access-Control-Allow-Origin'], 'https://mastercleanconnect.com');
  assert.equal(res.body.error, 'Send a valid form request.');
});

test('quote notifications use a durable independent log and leave a recoverable record when email is unavailable', async () => {
  const { notifySavedQuote } = await import('../server/lib/network-intake.js');
  const calls = [];
  const quote = { full_name: 'MCC synthetic quote', business_name: 'MCC TEST', city: 'San Angelo', phone: '3255550100', email: '', message: 'Internal notification verification', source_page: '/contact' };
  const status = await notifySavedQuote(quote, '00000000-0000-4000-8000-000000000123', { config, logger, now, store: fakeStore(calls), notify: async (record) => { calls.push(['notify', buildNetworkEmail(record)]); throw new Error('Email outage'); } });
  assert.equal(status, 'retry_required');
  assert.deepEqual(calls.map((call) => call[0]), ['save', 'notify', 'mark']);
  assert.equal(calls[0][1].formType, 'quote');
  assert.equal(calls[1][1].subject, 'Quote Request: San Angelo MCC TEST');
  assert.equal(calls[2][1].notification.status, 'retry_required');
});

test('notification API only addresses John and omits reply to when the quote has no email', async () => {
  const { sendNetworkNotification } = await import('../server/lib/network-intake.js');
  let sent;
  await sendNetworkNotification({ id: '00000000-0000-4000-8000-000000000123', formType: 'quote', environment: 'preview', fields: { city: 'San Angelo', companyName: 'MCC TEST', email: '' }, receivedAt: now.toISOString(), sourcePage: '/contact' }, { resendKey: 'server-only', fromEmail: 'MCC <notifications@example.com>' }, async (url, options) => {
    sent = JSON.parse(options.body);
    assert.equal(options.headers['Idempotency-Key'], 'mcc-network-00000000-0000-4000-8000-000000000123');
    return new Response('{"id":"accepted-email"}', { status: 200 });
  });
  assert.deepEqual(sent.to, ['john@mastercleanhq.com']);
  assert.equal(Object.hasOwn(sent, 'reply_to'), false);
});
