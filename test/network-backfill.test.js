import test from 'node:test';
import assert from 'node:assert/strict';
import { backfillNetworkLeads, createNetworkArchive } from '../server/lib/network-backfill.js';

const record = { id: '00000000-0000-4000-8000-000000000123', environment: 'production', formType: 'referral', receivedAt: '2026-10-21T12:00:00Z', fields: { companyName: 'Example Company', email: 'lead@example.com' }, notification: { status: 'sent' } };
const saved = { leadId: record.id, duplicate: false, url: `https://crm.mastercleanhq.com/leads/${record.id}` };
const config = { supabaseUrl: 'https://siipmaubrftdkbttsnbu.supabase.co', serviceKey: 'test-secret' };
const logger = { warn() {} };
function archive(records, marks = []) { return { async list() { return records.map((_, index) => `production/submissions/${index}.json`); }, async read(path) { return structuredClone(records[Number(path.split('/').at(-1).split('.')[0])]); }, async mark(path, value) { marks.push({ path, value }); } }; }

test('backfill defaults to a dry run and excludes quote notification logs', async () => {
  const result = await backfillNetworkLeads({ config, archive: archive([record, { ...record, formType: 'quote' }]), writeCrm() { throw new Error('Must not write'); }, logger });
  assert.equal(result.dryRun, true);
  assert.equal(result.eligible, 1);
  assert.equal(result.quoteLogs, 1);
  assert.equal(result.imported, 0);
  assert.equal(result.failed, 0);
});

test('backfill uses atomic email plus company deduplication and preserves notification history', async () => {
  const marks = [], calls = [];
  const result = await backfillNetworkLeads({ config, apply: true, archive: archive([record, record], marks), logger, async writeCrm(...args) { calls.push(args); return { ...saved, duplicate: calls.length === 2 }; } });
  assert.equal(result.imported, 1);
  assert.equal(result.duplicates, 1);
  assert.deepEqual(calls[0][3], { backfill: true });
  assert.equal(marks[0].value.notification.status, 'sent');
  assert.equal(marks[0].value.crm.leadId, saved.leadId);
});

test('historical Connect and partner attribution, region and original fields survive import unchanged', async () => {
  const records = [
    { ...record, source: 'mastercleanconnect', channel: 'mastercleanconnect', region: 'Dallas Fort Worth', regionSlug: 'dallas-fort-worth', sourcePage: '/partner-network/dallas-fort-worth', referrer: 'https://mastercleanconnect.com/', notification: { status: 'sent', providerId: 'historical-email', sentAt: '2026-10-21T12:00:01Z' } },
    { ...record, id: '00000000-0000-4000-8000-000000000124', source: 'mcc_partner_network', region: 'Greater Houston', regionSlug: 'greater-houston', sourcePage: '/partner-network/greater-houston', referrer: 'https://www.mastercleanhq.com/partner-network' },
  ];
  const marks = [], submitted = [];
  const result = await backfillNetworkLeads({ config, apply: true, archive: archive(records, marks), logger, async writeCrm(value) { submitted.push(structuredClone(value)); return saved; } });
  assert.equal(result.imported, 2);
  assert.deepEqual(submitted, records);
  for (const [index, mark] of marks.entries()) {
    const { crm, ...original } = mark.value;
    assert.equal(crm.status, 'saved');
    assert.deepEqual(original, records[index]);
  }
});

test('invalid archive data and individual write failures do not stop later imports', async () => {
  let calls = 0;
  const result = await backfillNetworkLeads({ config, apply: true, archive: archive([{ ...record, environment: 'preview' }, record, record]), logger, async writeCrm() { if (++calls === 1) throw new Error('CRM unavailable'); return saved; } });
  assert.equal(result.failed, 2);
  assert.equal(result.imported, 1);
});

test('archive mark failure does not hide a successful import', async () => {
  const store = archive([record]);
  store.mark = async () => { throw new Error('Storage outage'); };
  const result = await backfillNetworkLeads({ config, apply: true, archive: store, logger, writeCrm: async () => saved });
  assert.equal(result.imported, 1);
  assert.equal(result.failed, 0);
  assert.equal(result.statusUpdatesFailed, 1);
});

test('archive listing recurses through folders and paginates beyond 100 records', async () => {
  const offsets = [];
  const store = createNetworkArchive(config, async (_, options) => {
    const { prefix, offset } = JSON.parse(options.body);
    offsets.push([prefix, offset]);
    const rows = prefix === 'production/submissions' ? [{ name: '2026-10-21', id: null }] : offset === 0 ? Array.from({ length: 100 }, (_, index) => ({ name: `${index}.json`, id: String(index) })) : [{ name: 'last.json', id: 'last' }];
    return new Response(JSON.stringify(rows), { status: 200 });
  });
  assert.equal((await store.list()).length, 101);
  assert.deepEqual(offsets.at(-1), ['production/submissions/2026-10-21', 100]);
});
