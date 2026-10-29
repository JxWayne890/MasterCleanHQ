-- Network referrals use the same leads, quotes and activity tables as website quotes.
-- The website server is the only caller of this privileged intake function.
begin;

alter table public.leads
  add column if not exists contact_title text,
  add column if not exists region text,
  add column if not exists region_slug text,
  add column if not exists locations integer,
  add column if not exists current_provider text,
  add column if not exists permission_to_share boolean,
  add column if not exists revenue_qualified boolean,
  add column if not exists channel text,
  add column if not exists source_page text,
  add column if not exists referrer text,
  add column if not exists user_agent text,
  add column if not exists received_at timestamptz,
  add column if not exists network_form_type text,
  add column if not exists network_submission_id text,
  add column if not exists network_submission jsonb,
  add column if not exists partner_company_assigned text,
  add column if not exists referral_fee_status text default 'Not Started',
  add column if not exists follow_up_date date;

-- Preserve the currently installed source rule and all existing allowed sources.
do $$
declare
  v_expression text;
begin
  select pg_get_expr(conbin, conrelid) into v_expression
  from pg_constraint
  where conrelid = 'public.leads'::regclass and conname = 'leads_source_check';
  if v_expression is not null then
    alter table public.leads drop constraint leads_source_check;
    execute format(
      'alter table public.leads add constraint leads_source_check check ((%s) or source in (%L, %L))',
      v_expression, 'MasterClean Connect', 'MCC Partner Network'
    );
  end if;
end;
$$;

create unique index if not exists leads_network_submission_id_idx
  on public.leads (network_submission_id) where network_submission_id is not null;
create index if not exists leads_source_region_idx on public.leads (source, region);
create index if not exists leads_network_contact_idx
  on public.leads (lower(btrim(email)), lower(regexp_replace(btrim(business_name), '\s+', ' ', 'g')));

create or replace function public.submit_network_lead(
  p_record jsonb,
  p_backfill boolean default false
)
returns table(lead_id uuid, is_duplicate boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fields jsonb := p_record->'fields';
  v_id text := nullif(btrim(p_record->>'id'), '');
  v_email text := lower(btrim(v_fields->>'email'));
  v_company text := btrim(v_fields->>'companyName');
  v_company_key text := lower(regexp_replace(v_company, '\s+', ' ', 'g'));
  v_source text;
  v_channel text;
  v_region text;
  v_received timestamptz;
  v_lead_id uuid;
  v_summary text;
begin
  if jsonb_typeof(p_record) is distinct from 'object'
     or jsonb_typeof(v_fields) is distinct from 'object'
     or v_id is null or length(v_id) > 120
     or p_record->>'formType' is null
     or p_record->>'formType' not in ('referral', 'partner')
     or coalesce(v_email, '') = '' or coalesce(v_company, '') = ''
     or coalesce(btrim(v_fields->>'contactName'), '') = ''
     or coalesce(btrim(v_fields->>'phone'), '') = ''
     or coalesce(btrim(v_fields->>'city'), '') = '' then
    raise exception 'Invalid network intake record.' using errcode = '22023';
  end if;

  v_channel := case when p_record->>'source' = 'mastercleanconnect'
    then 'mastercleanconnect' else 'mcc_partner_network' end;
  v_source := case when v_channel = 'mastercleanconnect'
    then 'MasterClean Connect' else 'MCC Partner Network' end;
  v_region := case when p_record->>'region' in ('Greater Houston', 'Dallas Fort Worth')
    then p_record->>'region' else 'Other Texas' end;
  v_received := coalesce(nullif(p_record->>'receivedAt', '')::timestamptz, now());

  -- Shared contact lock makes concurrent imports and retries deterministic.
  perform pg_advisory_xact_lock(hashtextextended(v_email || chr(31) || v_company_key, 0));
  select l.id into v_lead_id from public.leads l where l.network_submission_id = v_id;
  if v_lead_id is not null then
    return query select v_lead_id, true;
    return;
  end if;

  if p_backfill then
    select l.id into v_lead_id from public.leads l
    where lower(btrim(l.email)) = v_email
      and lower(regexp_replace(btrim(l.business_name), '\s+', ' ', 'g')) = v_company_key
    order by l.created_at, l.id limit 1;
    if v_lead_id is not null then
      return query select v_lead_id, true;
      return;
    end if;
  end if;

  v_summary := concat_ws(E'\n',
    'Source: ' || v_source,
    'Region: ' || v_region,
    'Request type: ' || (p_record->>'formType'),
    case when nullif(v_fields->>'title', '') is not null then 'Contact title: ' || (v_fields->>'title') end,
    case when nullif(v_fields->>'locations', '') is not null then 'Locations: ' || (v_fields->>'locations') end,
    case when nullif(v_fields->>'currentProvider', '') is not null then 'Current provider: ' || (v_fields->>'currentProvider') end,
    case when v_fields ? 'services' then 'Services: ' || (select string_agg(value, ', ') from jsonb_array_elements_text(v_fields->'services')) end,
    case when v_fields ? 'yearsInBusiness' then 'Years in business: ' || (v_fields->>'yearsInBusiness') end,
    case when v_fields ? 'insured' then 'Insured: ' || (v_fields->>'insured') end,
    'Permission to share: ' || coalesce(v_fields->>'permissionToShare', 'Not provided'),
    case when v_fields ? 'revenueQualified' then 'Revenue qualification: ' || (v_fields->>'revenueQualified') end
  );

  insert into public.leads (
    full_name, business_name, contact_title, phone, email, city,
    preferred_contact_method, facility_type, square_footage, service_type,
    frequency, desired_start_date, locations, current_provider,
    permission_to_share, revenue_qualified, source, channel, region, region_slug,
    source_page, referrer, user_agent, received_at, created_at,
    network_form_type, network_submission_id, network_submission,
    urgency_level, commercial_or_residential, special_concerns,
    status, photo_status, quote_status, invoice_status, payment_status
  ) values (
    btrim(v_fields->>'contactName'), v_company, nullif(v_fields->>'title', ''),
    v_fields->>'phone', v_email, v_fields->>'city', 'Any',
    coalesce(nullif(v_fields->>'buildingType', ''), 'Cleaning company'),
    nullif(v_fields->>'squareFootage', '')::integer,
    case when p_record->>'formType' = 'partner' then 'Partner application' else 'Commercial cleaning referral' end,
    nullif(v_fields->>'frequency', ''), nullif(v_fields->>'startDate', '')::date,
    nullif(v_fields->>'locations', '')::integer, nullif(v_fields->>'currentProvider', ''),
    nullif(v_fields->>'permissionToShare', '')::boolean,
    nullif(v_fields->>'revenueQualified', '')::boolean,
    v_source, v_channel, v_region, nullif(p_record->>'regionSlug', ''),
    nullif(p_record->>'sourcePage', ''), nullif(p_record->>'referrer', ''),
    nullif(p_record->>'userAgent', ''), v_received, v_received,
    p_record->>'formType', v_id, p_record,
    'Standard', 'Commercial', v_summary,
    'New Lead', 'Not Requested', 'Not Started', 'Not Created', 'Not Started'
  ) returning id into v_lead_id;

  insert into public.quotes (lead_id, quote_status, quote_notes)
  values (v_lead_id, 'Not Started', v_summary);

  insert into public.activity_events (
    lead_id, event_type, event_title, event_description, metadata, created_at
  ) values (
    v_lead_id, 'Lead Created', v_source || ' intake received',
    v_summary, jsonb_build_object(
      'source', v_source, 'channel', v_channel, 'region', v_region,
      'source_page', p_record->>'sourcePage', 'network_submission_id', v_id,
      'backfilled', p_backfill
    ), v_received
  );

  return query select v_lead_id, false;
end;
$$;

revoke all on function public.submit_network_lead(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.submit_network_lead(jsonb, boolean) to service_role;

commit;
