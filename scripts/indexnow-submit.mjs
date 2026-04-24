#!/usr/bin/env node
// Bulk-submit every URL from the live sitemap to IndexNow.
// Run: node scripts/indexnow-submit.mjs

const HOST = 'www.mastercleanhq.com';
const KEY = 'e2f27869c02b4cb4bd99fb31c921709f';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const sitemapRes = await fetch(SITEMAP_URL);
if (!sitemapRes.ok) {
  console.error(`Failed to fetch sitemap: ${sitemapRes.status}`);
  process.exit(1);
}
const sitemapXml = await sitemapRes.text();
const urlList = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

console.log(`Found ${urlList.length} URLs in sitemap.`);

const keyCheck = await fetch(KEY_LOCATION);
if (!keyCheck.ok) {
  console.error(`Key file not reachable at ${KEY_LOCATION} (status ${keyCheck.status}). Deploy first.`);
  process.exit(1);
}
console.log(`Key file verified at ${KEY_LOCATION}`);

const payload = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });

// IndexNow rejects with 403 "SiteVerificationNotCompleted" until its crawler
// fetches the key file — can take a few minutes after first hosting. Retry.
const maxAttempts = 20;
const retryDelayMs = 30_000;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: payload,
  });
  const body = await res.text();
  console.log(`[attempt ${attempt}] IndexNow: ${res.status} ${res.statusText} ${body}`);

  if (res.status === 200 || res.status === 202) {
    console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
    process.exit(0);
  }
  if (res.status !== 403) {
    console.error('Non-retryable error from IndexNow.');
    process.exit(1);
  }
  if (attempt < maxAttempts) {
    await new Promise(r => setTimeout(r, retryDelayMs));
  }
}
console.error('Exhausted retries waiting for IndexNow site verification.');
process.exit(1);
