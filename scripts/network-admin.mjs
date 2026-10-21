import { writeFile } from 'node:fs/promises';
import { NETWORK_BUCKET, NETWORK_RECIPIENT, buildNetworkEmail, networkConfig, sendNetworkNotification } from '../server/lib/network-intake.js';

const [command, ...args] = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); return index < 0 ? fallback : args[index + 1]; };
const environment = option('environment', 'preview');
const config = networkConfig({ ...process.env, VERCEL_ENV: environment });
if (!['preview', 'production'].includes(environment)) throw new Error('Choose preview or production.');
if (config.supabaseUrl !== 'https://siipmaubrftdkbttsnbu.supabase.co' || !config.serviceKey) throw new Error('The authenticated MCC storage configuration is required.');
const headers = { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, 'Content-Type': 'application/json' };
async function call(path, options = {}) {
  const response = await fetch(`${config.supabaseUrl}/storage/v1/${path}`, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Storage request failed with status ${response.status}.`);
  return response.status === 204 ? null : response.json();
}
async function list(prefix) {
  const all = [];
  for (let offset = 0; ; offset += 100) {
    const rows = await call(`object/list/${NETWORK_BUCKET}`, { method: 'POST', body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }) });
    for (const row of rows) {
      const path = `${prefix}/${row.name}`;
      if (row.id) all.push(path); else all.push(...await list(path));
    }
    if (rows.length < 100) return all;
  }
}
const csvCell = (value) => {
  let text = Array.isArray(value) ? value.join(', ') : String(value ?? '');
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
if (command === 'create-bucket') {
  const response = await fetch(`${config.supabaseUrl}/storage/v1/bucket/${NETWORK_BUCKET}`, { headers, signal: AbortSignal.timeout(15000) });
  if (response.ok) {
    const bucket = await response.json();
    if (bucket.public) throw new Error('Refusing to use a public lead bucket.');
    console.log('The private MCC network bucket already exists.');
  } else if (response.status === 400 || response.status === 404) {
    await call('bucket', { method: 'POST', body: JSON.stringify({ id: NETWORK_BUCKET, name: NETWORK_BUCKET, public: false, file_size_limit: 64000, allowed_mime_types: ['application/json'] }) });
    console.log('Created the private MCC network bucket. No existing tables or policies changed.');
  } else throw new Error(`Bucket verification failed with status ${response.status}.`);
} else if (command === 'export') {
  const output = option('output');
  if (!output || !output.startsWith('/')) throw new Error('Provide an absolute private output path with --output.');
  const paths = await list(`${environment}/submissions`);
  const records = [];
  for (const path of paths) records.push({ storagePath: path, ...await call(`object/${NETWORK_BUCKET}/${path}`) });
  if (option('format', 'json') === 'csv') {
    const rows = records.map((record) => ({ id: record.id, formType: record.formType, receivedAt: record.receivedAt, region: record.region || '', regionSlug: record.regionSlug || '', sourcePage: record.sourcePage, environment: record.environment, ...record.fields, notificationStatus: record.notification.status, storagePath: record.storagePath }));
    const columns = [...new Set(rows.flatMap(Object.keys))];
    await writeFile(output, [columns.map(csvCell).join(','), ...rows.map((row) => columns.map((name) => csvCell(row[name])).join(','))].join('\r\n'), { mode: 0o600 });
  } else await writeFile(output, JSON.stringify(records, null, 2), { mode: 0o600 });
  console.log(`Exported ${records.length} ${environment} records to the private output file.`);
} else if (command === 'retry') {
  const path = option('path', '');
  if (!new RegExp(`^${environment}/submissions/\\d{4}-\\d{2}-\\d{2}/(referral|partner|quote)/[a-f0-9-]{36}\\.json$`).test(path)) throw new Error('Provide the exact submission storage path.');
  const record = await call(`object/${NETWORK_BUCKET}/${path}`);
  if (record.notification.status === 'sent') { console.log('Notification is already marked sent.'); process.exit(0); }
  if (record.environment !== environment || record.notification.recipient !== NETWORK_RECIPIENT) throw new Error('Record configuration mismatch.');
  const email = buildNetworkEmail(record);
  if (!email.subject || !config.resendKey || !config.fromEmail) throw new Error('Configure the MCC notification sender before retrying.');
  const providerId = await sendNetworkNotification(record, config);
  record.notification = { ...record.notification, status: 'sent', sentAt: new Date().toISOString(), providerId };
  await call(`object/${NETWORK_BUCKET}/${path}`, { method: 'POST', headers: { 'x-upsert': 'true' }, body: JSON.stringify(record) });
  console.log('Internal notification sent and saved.');
} else if (command === 'prune-rate') {
  const paths = await list(`${environment}/rate`);
  const window = Math.floor(Date.now() / 900000);
  const expired = paths.filter((path) => Number(path.split('/')[2]) < window);
  for (let offset = 0; offset < expired.length; offset += 100) await call(`object/${NETWORK_BUCKET}`, { method: 'DELETE', body: JSON.stringify({ prefixes: expired.slice(offset, offset + 100) }) });
  console.log(`Removed ${expired.length} expired rate reservations. Submission records were preserved.`);
} else throw new Error('Commands: create-bucket, export, retry, prune-rate. See docs/NETWORK_INTAKE.md.');
