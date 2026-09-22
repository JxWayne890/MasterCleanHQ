# Master Clean HQ observation pilot

Status: implementation prepared, not deployed to production.

The public quote form currently shows a success alert without saving or sending the request. The repaired form collects the fields required by the existing CRM intake, including business, city and facility type, and posts to the website’s server endpoint.

The endpoint first saves the request through the existing `website-lead-intake` function in project `siipmaubrftdkbttsnbu`. Only an explicit successful response containing a lead identifier allows the website to show success. CRM errors preserve the form so the visitor can retry or call the published phone number.

After CRM persistence, the endpoint sends an observation to Agency Guardrail. A model outage or Form Guard configuration failure cannot remove, withhold or duplicate the saved CRM lead. This first pilot never gates CRM delivery. Source mode must remain observe. Unwanted traffic still appears in CRM while the founder collects labels.

## Configuration before release

1. Confirm that the registered Vercel website project serves `www.mastercleanhq.com` from `JxWayne890/MasterCleanHQ`. This branch does not update the platform monorepo or any hiring flow.
2. Create a source in the founder’s Agency Guardrail workspace for `mastercleanhq.com`, with commercial cleaning business context and observation mode.
3. Store its secret only as `FORM_GUARD_SOURCE_KEY` in the website’s server environment. Set `FORM_GUARD_API_URL` to the approved deployed Agency Guardrail origin. Never use a VITE variable for the key.
4. Run a clearly labeled synthetic request through the deployed candidate and verify the exact CRM lead and Form Guard observation. The current checks mock those upstream responses and do not prove production delivery.
5. Verify the original client address survives the proxy when testing rate limits. Vercel documents its trusted overwrite of the incoming forwarding header at https://vercel.com/docs/headers/request-headers. The existing Supabase function owns rate limits and deduplication; confirm its gateway handling during the connected check.
6. Approve the production change. Then compare Form Guard decisions against founder labels before enabling filtering in any later phase.

## Recovery and data handling

The CRM retains phone and contact information. Form Guard receives name, email and a message containing business, city, facility, service and inquiry text. Phone and network address are not included in that observation. Personal data a visitor writes into the message can still reach the model.

Observation uses the CRM lead identifier for idempotency. A failed observer call logs only its status and CRM lead identifier, without contact details or credentials. An operator must review those failures and replay from the saved CRM record if needed. Durable automatic observer retries are not implemented in this pilot.

Five focused automated tests cover save order, sensitive field minimization, CRM failure, invalid input, honeypot handling and model outage recovery. The production site build prerenders 302 pages with zero failures.

No customer emails were sent. No production quote, applicant, employee or billing records were modified by this branch.
