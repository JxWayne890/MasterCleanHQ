# Master Clean HQ observation pilot

Status: deployed and verified in production in observation copy mode. Live protection is not enabled.

Connector version: `master-clean-hq/1.1.1`

Verified preview: https://master-clean-ki6ajuhpe-jxwayne890s-projects.vercel.app

Production: https://www.mastercleanhq.com

The previous public quote form showed a success alert without reliably saving or sending the request. The repaired production form collects the fields required by the existing CRM intake, including business, city and facility type, and posts to the website’s server endpoint.

The endpoint first saves the request through the existing `website-lead-intake` function in project `siipmaubrftdkbttsnbu`. Only an explicit successful response containing a lead identifier allows the website to show success. CRM errors preserve the form so the visitor can retry or call the published phone number.

After CRM persistence, the endpoint sends an observation to Agency Guardrail. A model outage or Form Guard configuration failure cannot remove, withhold or duplicate the saved CRM lead. This first pilot never gates CRM delivery. Source mode must remain observe. Unwanted traffic still appears in CRM while the founder collects labels.

## Configuration before release

1. Verified Vercel project `master-clean-hq`, `prj_NArudA2LATO6B5HXZYhjA90nVigC`, belongs to the same JxWayne890 team and has verified `mastercleanhq.com` and `www.mastercleanhq.com` domains. Its Git integration built this branch successfully. This branch does not update the platform monorepo or any hiring flow.
2. Create a source in the founder’s Agency Guardrail workspace for `mastercleanhq.com`, with commercial cleaning business context and observation mode.
3. Store its secret only as `FORM_GUARD_SOURCE_KEY` in the website’s server environment. Set `FORM_GUARD_API_URL` to the approved deployed Agency Guardrail origin. Never use a VITE variable for the key.
4. Run a clearly labeled synthetic request through the deployed candidate and verify the exact CRM lead and Form Guard observation. The current checks mock those upstream responses and do not prove production delivery.
5. Verify the original client address survives the proxy when testing rate limits. Vercel documents its trusted overwrite of the incoming forwarding header at https://vercel.com/docs/headers/request-headers. The existing Supabase function owns rate limits and deduplication; confirm its gateway handling during the connected check.
6. Approve the production change. Then compare Form Guard decisions against founder labels before enabling filtering in any later phase.

## Connected preview evidence

1. Three synthetic CRM records were created with visible `FORM GUARD TEST` labels and deletion instructions. No real inquiry or customer recipient was used.
2. Exact website replays returned the same CRM identifiers with `duplicate: true`. Form Guard retained one record for each stable CRM identifier.
3. The legitimate label originally received an uncertain decision with 0.56 confidence in 3,377 milliseconds. It was corrected to legitimate and recorded as one false negative.
4. The unwanted solicitation received a spam decision with 0.93 confidence in 691 milliseconds. The expected label matched.
5. The ambiguous inquiry received an uncertain decision with 0.91 confidence in 474 milliseconds. The expected label matched.
6. All three Form Guard records were labeled as tests, remained observed, and created zero delivery jobs. The existing CRM path remained authoritative.
7. Three initial observation attempts reported retry required while the branch environment was being verified. Every attempt happened after a confirmed CRM save, and all three were replayed from their saved CRM identifiers and recovered.
8. False positive feedback is zero. False negative feedback is one. No decision provider outage occurred during the connected run.
9. The source remains in observation copy mode. Protection is not enabled or eligible for this pilot.
10. Pull request 4 merged as `831b71a34a3943fd99800eb7050dd1e8555b7921`. The public production form has no console errors or page overflow at desktop and 390 pixel mobile widths.
11. A production replay returned the existing CRM identifier with `duplicate: true` in 1.283 seconds. Form Guard stayed at three test records and zero delivery jobs, and production emitted no connector warning.

## Connector compatibility and operations

1. The connector runs only in the Vercel server function at `api/quote.js`. It is compatible with this repository's Vite client and Vercel Node server function deployment. No source credential is included in browser JavaScript.
2. Rotate the Form Guard source key in Agency Guardrail, replace only the server environment value `FORM_GUARD_SOURCE_KEY`, redeploy, and run a labeled connection test. The previous key stops working after rotation.
3. To disconnect Form Guard without interrupting quote delivery, remove `FORM_GUARD_SOURCE_KEY` and `FORM_GUARD_API_URL`, then redeploy. The CRM save remains active and the server records that observation is not configured.
4. To remove the connector completely, remove the optional observation block after the confirmed CRM save. Do not remove the CRM request, validation, or success confirmation path.
5. A labeled diagnostic begins its message with `[FORM GUARD TEST]`. Connector version 1.1.1 forwards that label as a test record so it stays out of production reports.
6. Every retry for the same CRM lead uses `mchq-quote-<lead id>` as its Form Guard idempotency key. Replays can update connection evidence without creating a second Form Guard submission.

## Recovery and data handling

The CRM retains phone and contact information. Form Guard receives name, email and a message containing business, city, facility, service and inquiry text. Phone and network address are not included in that observation. Personal data a visitor writes into the message can still reach the model.

Observation uses the CRM lead identifier for idempotency. A failed observer call logs only its status and CRM lead identifier, without contact details or credentials. An operator must review those failures and replay from the saved CRM record if needed. Durable automatic observer retries are not implemented in this pilot. The connected run proved that manual replay recovers the observation without creating a second CRM or Form Guard record.

The three CRM test records remain clearly labeled because this repository and its available service account do not have an authorized CRM deletion interface. The matching Form Guard records and all temporary Agency Guardrail preview records were removed after final production evidence was recorded.

Six focused automated tests cover save order, sensitive field minimization, labeled test isolation, CRM failure, invalid input, honeypot handling, and model outage recovery. The production site build prerenders 302 pages with zero failures.

No customer emails were sent. No real quote, applicant, employee, or billing record was modified by this branch. The only new CRM records are the three visibly labeled synthetic quote tests described above.
