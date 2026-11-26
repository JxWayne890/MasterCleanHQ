import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/walkthrough-request.js';

const valid = {
    name: 'Jamie Example',
    email: 'jamie@example.com',
    businessType: 'Electrical',
    walkthrough: 'Systems',
    sourcePage: '/walkthroughs',
    submissionId: '4701d811-dbc4-4ac5-8490-69ec5a79578c',
};

async function request(body, origin = 'https://www.mastercleanhq.com') {
    const response = {
        headers: {},
        setHeader(key, value) { this.headers[key] = value; },
        status(code) { this.code = code; return this; },
        json(payload) { this.body = payload; return this; },
    };
    return handler({ method: 'POST', headers: { origin, 'content-type': 'application/json' }, body }, response);
}

test('walkthrough requests validate and only confirm after email acceptance', async (t) => {
    const config = {
        VERCEL_ENV: 'preview',
        VERCEL_URL: 'deployment.vercel.app',
        VERCEL_BRANCH_URL: 'branch.vercel.app',
        NETWORK_RESEND_API_KEY: 'mock-key',
        NETWORK_FROM_EMAIL: 'forms@example.com',
    };
    for (const [key, value] of Object.entries(config)) {
        const previous = process.env[key];
        process.env[key] = value;
        t.after(() => {
            if (previous === undefined) delete process.env[key];
            else process.env[key] = previous;
        });
    }
    let status = 200;
    const send = t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status }));
    assert.equal((await request({ ...valid, walkthrough: 'Other' })).code, 422);
    assert.equal((await request({ ...valid, businessType: 'Electrical\r\nextra' })).code, 422);
    assert.equal((await request({ ...valid, email: 'bad email' })).code, 422);
    assert.equal((await request(valid, 'https://example.com')).code, 403);
    assert.deepEqual((await request({ company_website: 'bot' })).body, { ok: true });
    assert.equal(send.mock.callCount(), 0);

    assert.deepEqual((await request(valid, 'https://branch.vercel.app')).body, { ok: true });
    const [url, options] = send.mock.calls[0].arguments;
    const email = JSON.parse(options.body);
    assert.equal(url, 'https://api.resend.com/emails');
    assert.deepEqual(email.to, ['john@mastercleanhq.com']);
    assert.equal(email.reply_to, valid.email);
    assert.equal(email.subject, 'PREVIEW TEST: Walkthrough Request: Systems, Electrical');
    assert.equal(options.headers['Idempotency-Key'], `mcc-walkthrough-${valid.submissionId}`);

    status = 500;
    assert.equal((await request(valid, 'https://deployment.vercel.app')).code, 503);
});
