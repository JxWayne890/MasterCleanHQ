const CRM_ENDPOINT = 'https://siipmaubrftdkbttsnbu.supabase.co/functions/v1/website-lead-intake';
const WEBSITE_ORIGIN = 'https://www.mastercleanhq.com';
export const FORM_GUARD_CONNECTOR_VERSION = 'master-clean-hq/1.1.1';
const fields = {full_name:150,business_name:200,phone:40,email:254,city:100,preferred_contact_method:20,facility_type:100,service_type:100,message:2500,source_page:500,referrer:1000,company_website:200};
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0,max) : '';

/** Save the CRM lead before optional observation. Form Guard never gates this pilot's CRM delivery. */
export async function submitQuote(raw, {fetcher = fetch, guardKey, guardUrl, address = '', userAgent = ''} = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {status:400,body:{error:'Send a valid quote request.'}};
  const payload = Object.fromEntries(Object.entries(fields).map(([name,max])=>[name,clean(raw[name],max)]));
  if (payload.company_website) return {status:200,body:{submissionId:'received',duplicate:false},observation:'honeypot'};
  if (!payload.full_name || !payload.business_name || payload.phone.replace(/\D/g,'').length !== 10 || !payload.city || !payload.facility_type || !payload.service_type) return {status:422,body:{error:'Please complete every required field.'}};
  if(payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return {status:422,body:{error:'Enter a valid email address.'}};
  let response, result;
  try {
    response = await fetcher(CRM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Origin:WEBSITE_ORIGIN,'x-forwarded-for':address,'user-agent':userAgent},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});
    result = await response.json();
  } catch {return {status:503,body:{error:'We could not confirm your request was saved. Please retry or call (325) 273-2203.'}};}
  if(!response.ok) return {status:response.status===429?429:response.status===422?422:503,body:{error:response.status===429?'Please wait before sending another request, or call (325) 273-2203.':'Your request could not be saved. Check the fields and retry, or call (325) 273-2203.'}};
  if(!/^[a-f0-9-]{36}$/i.test(result.submissionId || '')) return {status:503,body:{error:'We could not confirm your request was saved. Please call (325) 273-2203.'}};
  const success={status:200,body:{submissionId:result.submissionId,duplicate:Boolean(result.duplicate)}};
  if (!guardKey || !guardUrl) return {...success,observation:'not_configured'};
  try {
    const url = new URL(guardUrl);
    if(url.protocol!=='https:' || url.username || url.password || url.search || url.hash || !/^fg_[a-f0-9]{64}$/.test(guardKey)) throw new Error('Invalid observation configuration');
    const observed=await fetcher(new URL('/api/forms/submit',url),{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${guardKey}`,'X-Form-Guard-Connector-Version':FORM_GUARD_CONNECTOR_VERSION},body:JSON.stringify({idempotencyKey:`mchq-quote-${result.submissionId}`,name:payload.full_name,email:payload.email,message:[`Business: ${payload.business_name}`,`City: ${payload.city}`,`Facility: ${payload.facility_type}`,`Service: ${payload.service_type}`,payload.message || 'Please contact me about a cleaning quote.'].join('\n'),isTest:/^\s*\[FORM GUARD TEST\]/i.test(payload.message)}),signal:AbortSignal.timeout(15000)});
    return {...success,observation:observed.ok?'recorded':'retry_required'};
  } catch { return {...success,observation:'retry_required'}; }
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') {res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed.'});}
  const origin = req.headers.origin;
  const allowed = new Set([WEBSITE_ORIGIN,'https://mastercleanhq.com']);
  if(process.env.VERCEL_ENV==='preview' && process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if(!origin || !allowed.has(origin)) return res.status(403).json({error:'Origin is not allowed.'});
  if(!String(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).json({error:'Send JSON.'});
  let payload;
  try {payload=typeof req.body==='string'?JSON.parse(req.body):req.body;if(Buffer.byteLength(JSON.stringify(payload),'utf8')>12000) return res.status(413).json({error:'Request is too large.'});}
  catch {return res.status(400).json({error:'Send valid JSON.'});}
  const result=await submitQuote(payload,{guardKey:process.env.FORM_GUARD_SOURCE_KEY,guardUrl:process.env.FORM_GUARD_API_URL,address:clean(req.headers['x-forwarded-for'],100),userAgent:clean(req.headers['user-agent'],500)});
  if(result.observation==='retry_required' || result.observation==='not_configured') console.warn('Form Guard observation',result.observation,'CRM lead',result.body.submissionId);
  return res.status(result.status).json(result.body);
}
