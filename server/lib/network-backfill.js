import { NETWORK_BUCKET } from './network-intake.js';
import { NETWORK_CRM_URL, saveNetworkLead } from './network-crm.js';

export function createNetworkArchive(config, fetcher = fetch) {
  if (config.supabaseUrl !== NETWORK_CRM_URL || !config.serviceKey) throw new Error('The authenticated MCC storage configuration is required.');
  async function call(path, options = {}) {
    const response = await fetcher(`${config.supabaseUrl}/storage/v1/${path}`, {
      ...options,
      headers: { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, 'Content-Type': 'application/json', ...options.headers },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Archive request failed with status ${response.status}`);
    return response.json();
  }
  return {
    async list(prefix = 'production/submissions') {
      const paths = [];
      for (let offset = 0; ; offset += 100) {
        const rows = await call(`object/list/${NETWORK_BUCKET}`, { method: 'POST', body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }) });
        if (!Array.isArray(rows)) throw new Error('Invalid archive listing');
        for (const row of rows) {
          if (!row.name || row.name === '.emptyFolderPlaceholder') continue;
          if (!/^[a-zA-Z0-9._-]+$/.test(row.name) || row.name === '..') throw new Error('Invalid archive object name');
          const path = `${prefix}/${row.name}`;
          if (row.id) { if (path.endsWith('.json')) paths.push(path); }
          else paths.push(...await this.list(path));
        }
        if (rows.length < 100) return paths;
      }
    },
    read(path) { return call(`object/${NETWORK_BUCKET}/${path}`); },
    mark(path, record) { return call(`object/${NETWORK_BUCKET}/${path}`, { method: 'POST', headers: { 'x-upsert': 'true' }, body: JSON.stringify(record) }); },
  };
}

export async function backfillNetworkLeads({ config, archive = createNetworkArchive(config), writeCrm = saveNetworkLead, apply = false, logger = console } = {}) {
  const result = { scanned: 0, eligible: 0, imported: 0, duplicates: 0, quoteLogs: 0, failed: 0, statusUpdatesFailed: 0, dryRun: !apply };
  for (const path of await archive.list()) {
    result.scanned++;
    try {
      const record = await archive.read(path);
      if (record.environment !== 'production') throw new Error('Archive environment mismatch');
      // Quote logs are created only after /api/quote confirms the canonical CRM save.
      if (record.formType === 'quote') { result.quoteLogs++; continue; }
      if (!['referral', 'partner'].includes(record.formType) || !record.id || !record.fields?.email || !record.fields?.companyName || !Number.isFinite(Date.parse(record.receivedAt))) throw new Error('Invalid network archive record');
      result.eligible++;
      if (!apply) continue;
      const saved = await writeCrm(record, config, undefined, { backfill: true });
      if (saved.duplicate) result.duplicates++; else result.imported++;
      record.crm = { status: 'saved', leadId: saved.leadId, url: saved.url, duplicate: saved.duplicate, backfilledAt: new Date().toISOString() };
      try { await archive.mark(path, record); }
      catch { result.statusUpdatesFailed++; logger.warn('Network backfill archive status update failed', record.id); }
    } catch {
      result.failed++;
      logger.warn('Network backfill failed for archive object', path);
    }
  }
  return result;
}
