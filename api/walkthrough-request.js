import { networkConfig, NETWORK_RECIPIENT } from '../server/lib/network-intake.js';

const origins = ['https://www.mastercleanhq.com', 'https://mastercleanhq.com'];
const choices = new Set(['Systems', 'Cold email', 'Automation', 'All three']);
const windowMs = 5 * 60 * 1000;
const attempts = new Map();

function reserve(address, now) {
    for (const [key, entry] of attempts) {
        if (entry.expires > now) break;
        attempts.delete(key);
    }
    const entry = attempts.get(address) ?? { expires: now + windowMs, count: 0 };
    if (entry.count >= 5) return Math.ceil((entry.expires - now) / 1000);
    entry.count++;
    attempts.set(address, entry);
    return 0;
}

function field(value, max) {
    if (typeof value !== 'string' || value.length > max || /[\p{Cc}\p{Zl}\p{Zp}]/u.test(value)) return '';
    return value.trim();
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const env = process.env;
    const allowed = new Set(origins);
    if (env.VERCEL_ENV === 'preview') {
        for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) {
            if (host) allowed.add(`https://${host}`);
        }
    }
    if (!allowed.has(req.headers.origin)) return res.status(403).json({ error: 'Origin is not allowed.' });
    if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        return res.status(415).json({ error: 'Send JSON.' });
    }

    let raw;
    try {
        const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        if (Number(req.headers['content-length']) > 12000 || (body && Buffer.byteLength(body) > 12000)) {
            return res.status(413).json({ error: 'Request is too large.' });
        }
        raw = JSON.parse(body);
    } catch {
        return res.status(400).json({ error: 'Send valid JSON.' });
    }

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return res.status(400).json({ error: 'Send a valid request.' });
    }
    if (typeof raw.company_website === 'string' && raw.company_website.trim()) {
        return res.status(200).json({ ok: true });
    }

    const name = field(raw.name, 120);
    const email = field(raw.email, 254);
    const businessType = field(raw.businessType, 200);
    const walkthrough = field(raw.walkthrough, 20);
    const submissionId = field(raw.submissionId, 36).toLowerCase();
    const referrer = field(raw.referrer, 2000);
    if (!name || !businessType || !/^[^\s@,<>]+@[^\s@,<>]+\.[^\s@,<>]+$/.test(email) ||
        !choices.has(walkthrough) || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/.test(submissionId)) {
        return res.status(422).json({ error: 'Check the required fields and try again.' });
    }

    const now = new Date();
    const address = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
    const retryAfter = reserve(address, now.getTime());
    if (retryAfter) {
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({ error: 'Too many requests were received. Please wait a few minutes and try again.' });
    }

    const config = networkConfig(env);
    const unavailable = () => res.status(503).json({ error: 'The form could not send right now. Please try again.' });
    if (!config.resendKey || !config.fromEmail) {
        console.warn('Walkthrough request email configuration is missing');
        return unavailable();
    }

    const prefix = env.VERCEL_ENV === 'production' ? '' : 'PREVIEW TEST: ';
    const text = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Business type: ${businessType}`,
        `Walkthrough: ${walkthrough}`,
        'Source page: /walkthroughs',
        `Referrer: ${referrer || 'None'}`,
        `Submission ID: ${submissionId}`,
        `Received time: ${now.toISOString()}`,
        `Environment: ${env.VERCEL_ENV || config.environment}`,
    ].join('\n');

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.resendKey}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': `mcc-walkthrough-${submissionId}`,
            },
            body: JSON.stringify({
                from: config.fromEmail,
                to: [NETWORK_RECIPIENT],
                reply_to: email,
                subject: `${prefix}Walkthrough Request: ${walkthrough}, ${businessType}`,
                text,
            }),
            signal: AbortSignal.timeout(10000),
        });
        if (response.ok) return res.status(200).json({ ok: true });
        console.warn('Walkthrough request email rejected', response.status);
    } catch {
        console.warn('Walkthrough request email delivery failed');
    }
    return unavailable();
}
