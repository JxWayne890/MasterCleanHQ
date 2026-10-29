// Network intake and quote requests share this existing MCC CRM project.
export const NETWORK_CRM_URL = 'https://siipmaubrftdkbttsnbu.supabase.co';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function networkLeadUrl(leadId) {
  if (!uuid.test(leadId || '')) throw new Error('Invalid CRM lead identifier');
  return `https://crm.mastercleanhq.com/leads/${leadId}`;
}

export async function saveNetworkLead(record, config, fetcher = fetch, { backfill = false } = {}) {
  if (config.supabaseUrl !== NETWORK_CRM_URL || !config.serviceKey) throw new Error('Missing MCC CRM configuration');
  const response = await fetcher(`${NETWORK_CRM_URL}/rest/v1/rpc/submit_network_lead`, {
    method: 'POST',
    headers: { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_record: record, p_backfill: backfill }),
    // Rate reservations, storage, CRM, email and final status fit the form deadline.
    signal: AbortSignal.timeout(4500),
  });
  if (!response.ok) throw new Error(`CRM request failed with status ${response.status}`);
  const result = await response.json();
  const row = Array.isArray(result) && result.length === 1 ? result[0] : null;
  if (!row || !uuid.test(row.lead_id || '') || typeof row.is_duplicate !== 'boolean') throw new Error('CRM save confirmation missing');
  return { leadId: row.lead_id, duplicate: row.is_duplicate, url: networkLeadUrl(row.lead_id) };
}
