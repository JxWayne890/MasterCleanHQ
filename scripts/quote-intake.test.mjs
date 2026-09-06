import assert from 'node:assert/strict';
import test from 'node:test';
import { submitQuote, validateQuote, QUOTE_INTAKE_URL } from '../src/lib/quoteIntake.js';

const payload = { full_name: 'Test Contact', business_name: 'Test Business', phone: '(325) 555 0199', email: '', city: 'San Angelo', facility_type: 'Office', service_type: 'Commercial Routine', preferred_contact_method: 'Phone' };
const submissionId = 'b89cc23c-020e-4b58-a9df-c774ce9d017a';
const response = (body, status = 200) => async () => new Response(JSON.stringify(body), { status });

test('phone only leads are valid, malformed contact details are rejected', () => {
    assert.equal(validateQuote(payload), '');
    for (const phone of ['123', '1234567890123', '555 123']) assert.ok(validateQuote({ ...payload, phone }));
    assert.equal(validateQuote({ ...payload, phone: '+1 (325) 555 0199' }), '');
    assert.ok(validateQuote({ ...payload, business_name: '  ' }));
    assert.ok(validateQuote({ ...payload, email: 'bad@email' }));
    assert.ok(validateQuote({ ...payload, preferred_contact_method: 'Email' }));
});

test('posts the contact payload to the dedicated public endpoint', async () => {
    const result = await submitQuote(payload, { fetchImpl: async (url, options) => {
        assert.equal(url, QUOTE_INTAKE_URL);
        assert.equal(options.method, 'POST');
        assert.equal(options.headers['Content-Type'], 'application/json');
        assert.deepEqual(JSON.parse(options.body), payload);
        return new Response(JSON.stringify({ submissionId, duplicate: false }));
    } });
    assert.deepEqual(result, { submissionId, duplicate: false });
});

test('only durable record acknowledgements can produce success', async () => {
    for (const body of [{}, { submissionId: 'received' }, { submissionId: null }, { submissionId: 'invalid' }]) {
        await assert.rejects(submitQuote(payload, { fetchImpl: response(body) }), /could not confirm/);
    }
    await assert.rejects(submitQuote(payload, { fetchImpl: async () => new Response('<html>error</html>') }), /could not confirm/);
    for (const status of [400, 403, 422, 500, 503]) {
        await assert.rejects(submitQuote(payload, { fetchImpl: response({ submissionId }, status) }), /could not confirm/);
    }
    await assert.rejects(submitQuote(payload, { fetchImpl: response({}, 429) }), /Please wait/);
});

test('duplicate acknowledgement remains distinct from a new lead', async () => {
    assert.deepEqual(await submitQuote(payload, { fetchImpl: response({ submissionId, duplicate: true }) }), { submissionId, duplicate: true });
});

test('network failures and timeouts cannot display success', async () => {
    await assert.rejects(submitQuote(payload, { fetchImpl: async () => { throw new TypeError('Failed to fetch'); } }), /could not confirm delivery/);
    await assert.rejects(submitQuote(payload, { timeoutMs: 5, fetchImpl: async (_, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }) }), /could not confirm delivery/);
});
