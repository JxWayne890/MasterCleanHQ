import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:net';

const postgresBin = [process.env.PG_BIN, '/opt/homebrew/opt/postgresql@17/bin', '/usr/lib/postgresql/17/bin', '/usr/lib/postgresql/16/bin']
  .find((path) => path && existsSync(join(path, 'initdb')));
const migration = readFileSync(new URL('../supabase/migrations/20261029183000_network_crm_intake.sql', import.meta.url), 'utf8');
const literal = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;

test('network intake migration saves complete leads atomically and restricts privileged access', { skip: !postgresBin && 'Local PostgreSQL binaries are required for migration integration tests.' }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'mcc-network-db-'));
  const server = createServer();
  const port = await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const value = server.address().port;
      server.close(() => resolve(value));
    });
  });
  const run = (binary, args) => {
    const result = spawnSync(join(postgresBin, binary), args, { encoding: 'utf8', timeout: 20000 });
    assert.equal(result.status, 0, `${binary}: ${result.stderr || result.stdout}`);
    return result.stdout.trim();
  };
  let started = false;
  try {
    run('initdb', ['-D', join(directory, 'data'), '-A', 'trust', '-U', 'postgres', '--no-locale']);
    run('pg_ctl', ['-D', join(directory, 'data'), '-l', join(directory, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${directory}`, '-w', 'start']);
    started = true;
    const sql = (query) => run('psql', ['-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', '-d', 'postgres', '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c', query]);
    sql(`
      create role anon; create role authenticated; create role service_role;
      create table public.leads (
        id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
        full_name text not null, business_name text not null, phone text not null, email text, city text not null,
        preferred_contact_method text, facility_type text not null, square_footage integer, service_type text not null,
        frequency text, desired_start_date date, urgency_level text not null default 'Standard', commercial_or_residential text not null default 'Commercial',
        special_concerns text, source text not null check (source in ('Website Form', 'Phone Call', 'Other')),
        status text not null default 'New Lead', photo_status text not null default 'Not Requested', quote_status text not null default 'Not Started',
        invoice_status text not null default 'Not Created', payment_status text not null default 'Not Started', internal_notes text
      );
      alter table public.leads enable row level security;
      create table public.quotes (id uuid primary key default gen_random_uuid(), lead_id uuid not null unique references leads(id), quote_status text, quote_notes text);
      create table public.activity_events (id uuid primary key default gen_random_uuid(), lead_id uuid not null references leads(id), event_type text, event_title text, event_description text, metadata jsonb, created_at timestamptz default now());
    `);
    sql(migration);
    // Replaying the additive migration is safe and preserves preexisting source rules.
    sql(migration);
    assert.equal(sql("select has_function_privilege('anon', 'public.submit_network_lead(jsonb,boolean)', 'execute');"), 'f');
    assert.equal(sql("select has_function_privilege('authenticated', 'public.submit_network_lead(jsonb,boolean)', 'execute');"), 'f');
    assert.equal(sql("select has_function_privilege('service_role', 'public.submit_network_lead(jsonb,boolean)', 'execute');"), 't');
    assert.equal(sql("select relrowsecurity from pg_class where oid='public.leads'::regclass;"), 't');
    const record = {
      id: '00000000-0000-4000-8000-000000000123', formType: 'referral', source: 'mastercleanconnect', channel: 'mastercleanconnect',
      region: 'Greater Houston', regionSlug: 'greater-houston', receivedAt: '2026-10-29T12:00:00.000Z', sourcePage: '/partner-network/greater-houston',
      referrer: 'https://mastercleanconnect.com/', userAgent: 'MCC integration test', environment: 'production',
      fields: { companyName: 'MCC Integration Fixture', contactName: 'Fixture Contact', title: 'Facilities Director', email: 'fixture@example.com',
        phone: '+13255550100', city: 'Katy', buildingType: 'Office', squareFootage: 30000, locations: 3, frequency: 'Weekly',
        startDate: '2026-11-15', currentProvider: 'Existing company', permissionToShare: true, revenueQualified: true },
    };
    const submit = (value, backfill = false) => JSON.parse(sql(`select row_to_json(r) from public.submit_network_lead(${literal(value)}, ${backfill}) r;`));
    const created = submit(record);
    assert.equal(created.is_duplicate, false);
    const lead = JSON.parse(sql(`select row_to_json(l) from public.leads l where id='${created.lead_id}';`));
    assert.equal(lead.source, 'MasterClean Connect');
    assert.equal(lead.channel, 'mastercleanconnect');
    assert.equal(lead.region, 'Greater Houston');
    assert.equal(lead.contact_title, record.fields.title);
    assert.equal(lead.current_provider, record.fields.currentProvider);
    assert.equal(lead.locations, 3);
    assert.equal(lead.square_footage, 30000);
    assert.equal(lead.permission_to_share, true);
    assert.equal(lead.revenue_qualified, true);
    assert.equal(lead.desired_start_date, '2026-11-15');
    assert.equal(new Date(lead.received_at).toISOString(), record.receivedAt);
    assert.equal(lead.referrer, record.referrer);
    assert.equal(lead.source_page, record.sourcePage);
    assert.deepEqual(lead.network_submission, record);
    assert.equal(lead.status, 'New Lead');
    assert.equal(lead.referral_fee_status, 'Not Started');
    assert.deepEqual(submit(record), { lead_id: created.lead_id, is_duplicate: true });
    const backfillDuplicate = { ...record, id: 'different-historical-record', fields: { ...record.fields, email: 'FIXTURE@example.com', companyName: '  MCC   Integration Fixture  ' } };
    assert.deepEqual(submit(backfillDuplicate, true), { lead_id: created.lead_id, is_duplicate: true });
    assert.equal(sql('select count(*) from public.quotes;'), '1');
    assert.equal(sql('select count(*) from public.activity_events;'), '1');
    const partner = { ...record, id: 'partner-fixture', formType: 'partner', source: 'mcc_partner_network', channel: 'mcc_partner_network', region: 'Austin', regionSlug: 'texas',
      fields: { companyName: 'MCC Partner Fixture', contactName: 'Partner Contact', email: 'partner@example.com', phone: '+13255550101', city: 'Austin',
        services: ['Janitorial', 'Floor care'], yearsInBusiness: 5, insured: true, permissionToShare: true } };
    const partnerResult = submit(partner, true);
    const partnerLead = JSON.parse(sql(`select row_to_json(l) from public.leads l where id='${partnerResult.lead_id}';`));
    assert.equal(partnerLead.source, 'MCC Partner Network');
    assert.equal(partnerLead.region, 'Other Texas');
    assert.equal(partnerLead.network_form_type, 'partner');
    assert.equal(partnerLead.revenue_qualified, null);
    assert.deepEqual(partnerLead.network_submission, partner);
    assert.match(partnerLead.special_concerns, /Janitorial, Floor care/);
    // Staff edits use the regular leads row and do not collide with retry handling.
    sql(`update public.leads set status='Needs Review', internal_notes='Staff note', partner_company_assigned='Partner Fixture', referral_fee_status='Pending', follow_up_date='2026-11-01' where id='${created.lead_id}';`);
    assert.deepEqual(submit(record), { lead_id: created.lead_id, is_duplicate: true });
    assert.equal(sql(`select internal_notes || '|' || partner_company_assigned || '|' || referral_fee_status || '|' || follow_up_date from public.leads where id='${created.lead_id}';`), 'Staff note|Partner Fixture|Pending|2026-11-01');
    assert.equal(sql('select count(*) from public.leads;'), '2');
    sql(`insert into public.leads (full_name,business_name,phone,email,city,facility_type,service_type,source)
      values ('Prior quote','Earlier Quote Company','3255550199','prior@example.com','Dallas','Office','Commercial','Website Form');`);
    const earlierQuote = { ...record, id: 'historical-quote-duplicate', fields: { ...record.fields, companyName: 'Earlier Quote Company', email: 'PRIOR@example.com' } };
    assert.equal(submit(earlierQuote, true).is_duplicate, true);
    assert.equal(sql('select count(*) from public.leads;'), '3');
    const concurrent = [0, 1].map((index) => ({ ...record, id: `concurrent-import-${index}`, fields: { ...record.fields, companyName: 'Concurrent Import Fixture', email: 'concurrent@example.com' } }));
    const race = await Promise.all(concurrent.map(async (value) => {
      const { stdout } = await promisify(execFile)(join(postgresBin, 'psql'), ['-h', '127.0.0.1', '-p', String(port), '-U', 'postgres', '-d', 'postgres', '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c',
        `begin; select row_to_json(r) from public.submit_network_lead(${literal(value)}, true) r; select pg_sleep(0.1); commit;`]);
      return JSON.parse(stdout.trim());
    }));
    assert.equal(race.filter((result) => result.is_duplicate).length, 1);
    assert.equal(race[0].lead_id, race[1].lead_id);
    assert.equal(sql('select count(*) from public.leads;'), '4');
    assert.equal(sql('select count(*) from public.quotes;'), '3');
    assert.equal(sql('select count(*) from public.activity_events;'), '3');
  } finally {
    if (started) run('pg_ctl', ['-D', join(directory, 'data'), '-m', 'immediate', '-w', 'stop']);
    rmSync(directory, { recursive: true, force: true });
  }
});
