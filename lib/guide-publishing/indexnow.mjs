import { CANONICAL_ORIGIN, slugSchema } from './contract.mjs';

export const INDEXNOW = Object.freeze({
  host: 'www.mastercleanhq.com',
  key: 'e2f27869c02b4cb4bd99fb31c921709f',
  keyLocation: `${CANONICAL_ORIGIN}/e2f27869c02b4cb4bd99fb31c921709f.txt`,
  endpoint: 'https://api.indexnow.org/indexnow',
});

const requestTimeoutMs = 2_000;
const maxAttempts = 2;
const retryDelayMs = 250;
const transientStatus = (status) => status === 408 || status === 429 || (status >= 500 && status <= 599);

export function changedGuideUrls(liveUrl) {
  const url = new URL(liveUrl);
  const slug = url.pathname.slice('/guides/'.length);
  if (typeof liveUrl !== 'string' || liveUrl !== `${CANONICAL_ORIGIN}/guides/${slug}` || url.origin !== CANONICAL_ORIGIN || url.username || url.password || url.search || url.hash || !url.pathname.startsWith('/guides/') || !slugSchema.safeParse(slug).success) {
    throw new Error('IndexNow requires an exact canonical MCC guide URL.');
  }
  return [liveUrl, `${CANONICAL_ORIGIN}/guides`];
}

// Four requests at most, each with a two second deadline, plus two short waits.
// A search notification is separate from publication and never rejects it.
export async function submitGuideIndexNow(liveUrl, { fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  const result = { status: 'retry_required', keyVerified: false, keyCheckAttempts: 0, submissionAttempts: 0 };
  try {
    try { result.urls = changedGuideUrls(liveUrl); } catch { return { ...result, reason: 'invalid_guide_url' }; }
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      result.keyCheckAttempts = attempt;
      let retry = false;
      try {
        const response = await fetchImpl(INDEXNOW.keyLocation, { redirect: 'error', signal: AbortSignal.timeout(requestTimeoutMs), headers: { accept: 'text/plain', 'cache-control': 'no-cache' } });
        result.httpStatus = response.status;
        if (response.status === 200) {
          const body = await response.text();
          if (body.length > 256 || body.trim() !== INDEXNOW.key) return { ...result, reason: 'ownership_key_mismatch' };
          result.keyVerified = true;
          break;
        }
        await response.body?.cancel();
        result.reason = 'ownership_http_error';
        retry = transientStatus(response.status);
      } catch {
        delete result.httpStatus;
        result.reason = 'ownership_unavailable';
        retry = true;
      }
      if (!retry || attempt === maxAttempts) return result;
      await sleep(retryDelayMs);
    }
    delete result.reason;
    delete result.httpStatus;
    const body = JSON.stringify({ host: INDEXNOW.host, key: INDEXNOW.key, keyLocation: INDEXNOW.keyLocation, urlList: result.urls });
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      result.submissionAttempts = attempt;
      let retry = false;
      try {
        const response = await fetchImpl(INDEXNOW.endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(requestTimeoutMs), headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
        result.httpStatus = response.status;
        await response.body?.cancel();
        if (response.status === 200 || response.status === 202) {
          delete result.reason;
          return { ...result, status: response.status === 200 ? 'accepted' : 'validation_pending', submittedAt: new Date().toISOString() };
        }
        result.reason = 'submission_http_error';
        retry = transientStatus(response.status);
      } catch {
        delete result.httpStatus;
        result.reason = 'submission_unavailable';
        retry = true;
      }
      if (!retry || attempt === maxAttempts) return result;
      await sleep(retryDelayMs);
    }
  } catch {
    return { ...result, status: 'retry_required', reason: 'notification_unavailable' };
  }
  return result;
}
