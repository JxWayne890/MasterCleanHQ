import { NETWORK_BODY_LIMIT, submitNetworkIntake } from '../server/lib/network-intake.js';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function answer(req, res, status, body) {
  if (String(req.headers.accept || '').includes('application/json')) return res.status(status).json(body);
  if (status === 200) return res.redirect(303, '/partner-network/thank-you');
  const page = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Request needs attention | Master Commercial Clean</title><body style="font-family:system-ui;max-width:42rem;margin:4rem auto;padding:1rem;line-height:1.6"><h1>Your request needs attention</h1><p>' + escapeHtml(body.error || 'Please retry your request.') + '</p><p>Use your browser Back button to keep your entries and try again, or call <a href="tel:3252732203">(325) 273 2203</a>.</p><p><a href="/partner-network">Return to the partner network</a></p></body></html>';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(status).send(page);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Vary', 'Origin');
  if (!['POST', 'OPTIONS'].includes(req.method)) { res.setHeader('Allow', 'POST, OPTIONS'); return answer(req, res, 405, { error: 'Method not allowed.' }); }
  const origins = new Set(['https://www.mastercleanhq.com', 'https://mastercleanhq.com', 'https://mastercleanconnect.com', 'https://www.mastercleanconnect.com']);
  if (process.env.VERCEL_ENV === 'preview') {
    for (const hostname of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) if (hostname && /^[a-z0-9.-]+\.vercel\.app$/.test(hostname)) origins.add(`https://${hostname}`);
  }
  if (!origins.has(req.headers.origin)) return answer(req, res, 403, { error: 'Please open this form on the Master Commercial Clean website.' });
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    return res.status(204).send('');
  }
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim();
  if (!['application/json', 'application/x-www-form-urlencoded'].includes(contentType)) return answer(req, res, 415, { error: 'Send a valid form request.' });
  let raw;
  try {
    if (Number(req.headers['content-length'] || 0) > NETWORK_BODY_LIMIT) return answer(req, res, 413, { error: 'Request is too large.' });
    const serialized = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(serialized || '', 'utf8') > NETWORK_BODY_LIMIT) return answer(req, res, 413, { error: 'Request is too large.' });
    if (typeof req.body === 'string' && contentType === 'application/x-www-form-urlencoded') {
      const data = new URLSearchParams(req.body);
      raw = Object.fromEntries(data);
      if (data.getAll('services').length > 1) raw.services = data.getAll('services');
    } else raw = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch { return answer(req, res, 400, { error: 'Send a valid form request.' }); }
  // The existing Connect form predates its hidden channel field. Attribute its
  // submissions using the exact allowed browser origin until that field exists.
  if (['https://mastercleanconnect.com', 'https://www.mastercleanconnect.com'].includes(req.headers.origin)
      && raw && typeof raw === 'object' && !Array.isArray(raw) && !Object.hasOwn(raw, 'channel')) {
    raw = { ...raw, channel: 'mastercleanconnect' };
  }
  const result = await submitNetworkIntake(raw, {
    address: String(req.headers['x-forwarded-for'] || '').split(',')[0].trim().slice(0, 100),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 500),
  });
  if (result.status === 429) res.setHeader('Retry-After', '900');
  return answer(req, res, result.status, result.body);
}
