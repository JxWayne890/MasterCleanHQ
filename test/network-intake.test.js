import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNetworkEmail, createNetworkStore, normalizeNetworkSubmission, submitNetworkIntake } from '../server/lib/network-intake.js';
import handler from '../api/network-intake.js';
import { networkLeadUrl, saveNetworkLead } from '../server/lib/network-crm.js';

const raw = { formType: 'referral', companyName: 'MCC SYNTHETIC NETWORK TEST', contactName: 'Test Contact', title: 'Facilities Manager', email: 'QA@example.com', phone: '(325) 555 0100', city: 'Greater Houston', buildingType: 'Corporate office', squareFootage: '12000', locations: '2', frequency: 'Three visits a week', startDate: '2026-11-15', currentProvider: '', revenueQualified: 'true', permissionToShare: 'true', sourcePage: '/partner-network/greater-houston' };
const partner = { formType: 'partner', companyName: 'MCC SYNTHETIC PARTNER TEST', contactName: 'Test Partner', email: 'qa@example.com', phone: '13255550100', city: 'Austin', services: ['Janitorial', 'Floor care'], yearsInBusiness: '8', insured: 'Yes', permissionToShare: true, sourcePage: '/partner-network/become-a-partner' };
const now = new Date('2026-10-21T12:00:00Z');
const config = { environment: 'preview', supabaseUrl: 'https://siipmaubrftdkbttsnbu.supabase.co', serviceKey: 'server-secret', rateSalt: 'a'.repeat(32) };
const logger = { warn() {} };
const leadId = '00000000-0000-4000-8000-000000000123';
const writeCrm = async () => ({ leadId, duplicate: false, url: networkLeadUrl(leadId) });
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
  const result = await submitNetworkIntake(raw, { config, now, logger, writeCrm, store: fakeStore(calls), notify: async (record) => { calls.push(['notify', buildNetworkEmail(record)]); return 'email-id'; } });
  assert.equal(result.status, 200);
  assert.deepEqual(calls.map((call) => Array.isArray(call) ? call[0] : call), ['rate', 'save', 'notify', 'mark']);
  assert.equal(calls[1][1].notification.status, 'pending');
  assert.equal(calls[2][1].subject, 'Referral Lead: Greater Houston MCC SYNTHETIC NETWORK TEST');
  assert.equal(calls[3][1].notification.recipient, 'john@mastercleanhq.com');
  assert.equal(calls[3][1].environment, 'preview');
});
test('notification failure preserves a confirmed lead and marks it for operator retry', async () => {
  const calls = [];
  const result = await submitNetworkIntake(partner, { config, now, logger, writeCrm, store: fakeStore(calls), notify: async () => { throw new Error('email unavailable'); } });
  assert.equal(result.status, 200);
  assert.equal(result.body.notificationStatus, 'retry_required');
  assert.equal(calls.at(-1)[1].notification.status, 'retry_required');
  assert.equal(buildNetworkEmail(calls.at(-1)[1]).subject, 'Partner Application: Austin MCC SYNTHETIC PARTNER TEST');
});
test('rate or storage failures never show a false success or send an email', async () => {
  let notifications = 0;
  const notify = async () => { notifications++; };
  const blocked = await submitNetworkIntake(raw, { config, now, logger, writeCrm, notify, store: { reserve: async () => false } });
  assert.equal(blocked.status, 429);
  const failed = await submitNetworkIntake(raw, { config, now, logger, writeCrm, notify, store: { reserve: async () => true, save: async () => { throw new Error('save unavailable'); } } });
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
  for (const origin of ['https://www.mastercleanhq.com', 'https://mastercleanhq.com', 'https://mastercleanconnect.com', 'https://www.mastercleanconnect.com']) {
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

test('Connect tagging is explicit and cannot be forged through source or an unknown channel', () => {
  const connected = normalizeNetworkSubmission({ ...raw, channel: 'mastercleanconnect' }, now).submission;
  assert.equal(connected.source, 'mastercleanconnect');
  assert.equal(connected.channel, 'mastercleanconnect');
  for (const change of [{}, { source: 'mastercleanconnect' }, { channel: 'MasterCleanConnect' }, { channel: 'unknown' }]) {
    const submission = normalizeNetworkSubmission({ ...raw, ...change }, now).submission;
    assert.equal(submission.source, 'mcc_partner_network');
    assert.equal(submission.channel, 'mcc_partner_network');
  }
});

test('statewide Texas and additional regional paths preserve building city and canonical routing region', () => {
  for (const [sourcePage, city, expected] of [
    ['/partner-network/texas', 'Austin', 'Other Texas'],
    ['/partner-network/san-antonio', 'San Antonio', 'Other Texas'],
    ['/partner-network/texas', 'Katy', 'Greater Houston'],
    ['/partner-network/dallas-fort-worth', 'Plano', 'Dallas Fort Worth'],
    ['/partner-network/texas', 'Fort Worth', 'Dallas Fort Worth'],
  ]) {
    const { submission } = normalizeNetworkSubmission({ ...raw, sourcePage, city }, now);
    assert.equal(submission.region, expected);
    assert.equal(submission.fields.city, city);
    assert.equal(submission.sourcePage, sourcePage);
  }
  for (const sourcePage of ['/partner-network/../../secret', '/partner-network/texas?x=y', '/partner-network/texas/other', '/partner-network/thank-you', '/partner-network/become-a-partner']) {
    assert.equal(normalizeNetworkSubmission({ ...raw, sourcePage }, now).status, 422);
  }
  assert.equal(normalizeNetworkSubmission({ ...partner, city: 'Houston' }, now).submission.region, 'Greater Houston');
  assert.equal(normalizeNetworkSubmission(partner, now).submission.region, 'Other Texas');
});

test('CRM persists all normalized fields before notification and the email links to the saved lead', async () => {
  const calls = [];
  const result = await submitNetworkIntake({ ...raw, channel: 'mastercleanconnect', currentProvider: 'Current cleaner', referrer: 'https://example.com/facilities' }, {
    config, now, logger, store: fakeStore(calls),
    writeCrm: async (record) => {
      calls.push(['crm', structuredClone(record)]);
      assert.equal(record.source, 'mastercleanconnect');
      assert.equal(record.channel, 'mastercleanconnect');
      assert.equal(record.region, 'Greater Houston');
      assert.equal(record.receivedAt, now.toISOString());
      assert.equal(record.referrer, 'https://example.com/facilities');
      assert.deepEqual(record.fields, { ...normalizeNetworkSubmission(raw, now).submission.fields, currentProvider: 'Current cleaner' });
      return writeCrm();
    },
    notify: async (record) => { calls.push(['notify', buildNetworkEmail(record)]); return 'email-id'; },
  });
  assert.deepEqual(calls.map((call) => Array.isArray(call) ? call[0] : call), ['rate', 'save', 'crm', 'notify', 'mark']);
  assert.equal(result.body.crmStatus, 'saved');
  assert.equal(result.body.leadId, leadId);
  assert.equal(calls[3][1].subject, 'Connect Referral Lead: Greater Houston MCC SYNTHETIC NETWORK TEST');
  assert.ok(calls[3][1].text.includes('Source page: /partner-network/greater-houston\nSource: mastercleanconnect\n'));
  assert.ok(calls[3][1].text.includes(`CRM: https://crm.mastercleanhq.com/leads/${leadId}`));
  assert.equal(calls.at(-1)[1].crm.status, 'saved');
  assert.equal(calls.at(-1)[1].crm.leadId, leadId);
});

test('CRM outage still saves the private file, sends the email and records a retry with an operator warning', async () => {
  const calls = [], warnings = [];
  const result = await submitNetworkIntake(partner, {
    config, now, logger: { warn: (...args) => warnings.push(args) }, store: fakeStore(calls),
    writeCrm: async () => { calls.push('crm'); throw new Error('CRM request failed with status 503'); },
    notify: async (record) => { calls.push(['notify', buildNetworkEmail(record)]); return 'email-id'; },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.crmStatus, 'retry_required');
  assert.equal(result.body.notificationStatus, 'sent');
  assert.deepEqual(calls.map((call) => Array.isArray(call) ? call[0] : call), ['rate', 'save', 'crm', 'notify', 'mark']);
  assert.equal(calls.at(-1)[1].crm.status, 'retry_required');
  assert.match(calls[3][1].text, /CRM save needs retry/);
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0][0], 'Network intake CRM write failed');
});

test('CRM writer sends the complete record to the same MCC database with server credentials and a bounded timeout', async () => {
  const record = { ...normalizeNetworkSubmission(raw, now).submission, id: leadId, receivedAt: now.toISOString(), environment: 'production' };
  const result = await saveNetworkLead(record, config, async (url, options) => {
    assert.equal(url, 'https://siipmaubrftdkbttsnbu.supabase.co/rest/v1/rpc/submit_network_lead');
    assert.equal(options.headers.Authorization, 'Bearer server-secret');
    assert.deepEqual(JSON.parse(options.body), { p_record: record, p_backfill: false });
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(JSON.stringify([{ lead_id: leadId, is_duplicate: false }]));
  });
  assert.deepEqual(result, { leadId, duplicate: false, url: networkLeadUrl(leadId) });
});

test('CRM writer supports idempotent backfill and rejects failures, wrong projects and missing save confirmations', async () => {
  const record = { id: leadId };
  const result = await saveNetworkLead(record, config, async (_, options) => {
    assert.equal(JSON.parse(options.body).p_backfill, true);
    return new Response(JSON.stringify([{ lead_id: leadId, is_duplicate: true }]));
  }, { backfill: true });
  assert.equal(result.duplicate, true);
  for (const body of [[], {}, [{ lead_id: 'missing', is_duplicate: false }], [{ lead_id: leadId }]]) {
    await assert.rejects(saveNetworkLead(record, config, async () => new Response(JSON.stringify(body))), /confirmation missing/);
  }
  await assert.rejects(saveNetworkLead(record, config, async () => new Response('{}', { status: 500 })), /status 500/);
  await assert.rejects(saveNetworkLead(record, { ...config, supabaseUrl: 'https://other.supabase.co' }, () => { throw new Error('must not fetch'); }), /configuration/);
  assert.throws(() => networkLeadUrl('https://evil.example'), /identifier/);
});

test('www Connect preflight and validation responses grant only the exact trusted origin', async () => {
  const origin = 'https://www.mastercleanconnect.com';
  const res = response();
  await handler({ method: 'OPTIONS', headers: { origin } }, res);
  assert.equal(res.statusCode, 204);
  assert.equal(res.headers['Access-Control-Allow-Origin'], origin);
  const invalid = response();
  await handler({ method: 'POST', headers: { origin, accept: 'application/json', 'content-type': 'application/json' }, body: {} }, invalid);
  assert.equal(invalid.statusCode, 422);
  assert.equal(invalid.headers['Access-Control-Allow-Origin'], origin);
  const untrusted = response();
  await handler({ method: 'OPTIONS', headers: { origin: `${origin}.evil.example`, accept: 'application/json' } }, untrusted);
  assert.equal(untrusted.statusCode, 403);
  assert.equal(untrusted.headers['Access-Control-Allow-Origin'], undefined);
});

test('the live Connect form without a channel is attributed from exact browser origin and explicit channels retain normalization rules', async () => {
  const previousFetch = globalThis.fetch;
  const environment = {
    NETWORK_SUPABASE_URL: config.supabaseUrl,
    NETWORK_SUPABASE_SERVICE_ROLE_KEY: config.serviceKey,
    NETWORK_RATE_LIMIT_SALT: config.rateSalt,
    NETWORK_RESEND_API_KEY: 'server-email-key',
    NETWORK_FROM_EMAIL: 'MCC <notifications@example.com>',
    VERCEL_ENV: 'production',
  };
  const previousEnvironment = Object.fromEntries(Object.keys(environment).map((name) => [name, process.env[name]]));
  Object.assign(process.env, environment);
  try {
    for (const [origin, change, expected] of [
      ['https://mastercleanconnect.com', {}, 'mastercleanconnect'],
      ['https://www.mastercleanconnect.com', {}, 'mastercleanconnect'],
      ['https://www.mastercleanhq.com', {}, 'mcc_partner_network'],
      ['https://mastercleanconnect.com', { channel: 'unknown' }, 'mcc_partner_network'],
      ['https://mastercleanconnect.com', { channel: 'mastercleanconnect' }, 'mastercleanconnect'],
    ]) {
      let saved, notification;
      globalThis.fetch = async (url, options) => {
        const address = String(url);
        if (address.endsWith('/rest/v1/rpc/submit_network_lead')) {
          saved = JSON.parse(options.body).p_record;
          return new Response(JSON.stringify([{ lead_id: leadId, is_duplicate: false }]));
        }
        if (address === 'https://api.resend.com/emails') {
          notification = JSON.parse(options.body);
          return new Response('{"id":"email-id"}');
        }
        assert.ok(address.includes('/storage/v1/'));
        return new Response('{}');
      };
      // The published Connect form serializes FormData with these field names.
      const body = { ...raw, ...change, startDate: '2026-11-15', referrer: 'https://mastercleanconnect.com/' };
      const res = response();
      await handler({ method: 'POST', headers: { origin, accept: 'application/json', 'content-type': 'application/json' }, body }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.crmStatus, 'saved');
      assert.equal(saved.source, expected);
      assert.equal(saved.channel, expected);
      assert.equal(notification.subject.startsWith('Connect '), expected === 'mastercleanconnect');
    }
    for (const body of [null, [], 'text']) {
      const res = response();
      await handler({ method: 'POST', headers: { origin: 'https://mastercleanconnect.com', accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify(body) }, res);
      assert.equal(res.statusCode, 400);
    }
  } finally {
    globalThis.fetch = previousFetch;
    for (const [name, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
