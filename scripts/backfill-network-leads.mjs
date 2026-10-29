import { networkConfig } from '../server/lib/network-intake.js';
import { backfillNetworkLeads } from '../server/lib/network-backfill.js';

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--apply')) throw new Error('Usage: node scripts/backfill-network-leads.mjs [--apply]');
const config = networkConfig({ ...process.env, VERCEL_ENV: 'production' });
const result = await backfillNetworkLeads({ config, apply: args.includes('--apply') });
console.log(JSON.stringify(result, null, 2));
if (result.failed || result.statusUpdatesFailed) process.exitCode = 1;
