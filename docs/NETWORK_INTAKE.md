# MCC network intake operations

The server endpoint `/api/network-intake` accepts referral requests and partner applications. It supports JSON and native HTML form posts. JSON clients send `Accept: application/json`. Native forms redirect to `/partner-network/thank-you` after a confirmed save. Invalid requests keep the visitor on a clear error page with instructions to return to their entries.

The records use schema version 1 and contain an identifier, form type, received date, source page, environment, normalized fields and notification delivery status. Referral requests must confirm at least $1 million in annual company revenue and permission to share the request with a potential service partner. Partner applications require contact permission. The server rejects school, district, government, municipal and residential building types on the commercial referral flow.

## Storage and account boundary

Records live in the private Supabase Storage bucket `mcc-network-intake` in the existing MCC project `siipmaubrftdkbttsnbu`. The bucket accepts JSON only, with a 64 KB object limit. No public bucket or public storage policy is created. No existing CRM tables, functions or access policies are changed. The website server uses its authenticated MCC credential. Credentials never enter the browser bundle.

Submission paths are:

```text
preview/submissions/YYYY-MM-DD/referral/UUID.json
preview/submissions/YYYY-MM-DD/partner/UUID.json
preview/submissions/YYYY-MM-DD/quote/CRM-UUID.json
production/submissions/YYYY-MM-DD/referral/UUID.json
```

Preview records remain separate from production records. Each internal preview alert starts with a visible preview notice. The exact requested email subjects remain unchanged, with a clearly labeled synthetic company name during testing.

The existing quote form still saves to the existing CRM endpoint first. After a confirmed, new CRM save, the website stores a separate quote notification record and attempts the internal email. Duplicate CRM submissions do not send another quote alert. Internal email and optional Form Guard observation run concurrently after the CRM save, so their timeouts do not add together. Form Guard observation stays in its existing observation mode. CRM failure never returns a success response. Failure of the optional internal email cannot undo a saved CRM lead.

## Server configuration

Configure these names in the Vercel server environment of `master-clean-hq`. Do not use public `VITE_` variables for these values.

```text
NETWORK_SUPABASE_URL
NETWORK_SUPABASE_SERVICE_ROLE_KEY
NETWORK_RATE_LIMIT_SALT
NETWORK_RESEND_API_KEY
NETWORK_FROM_EMAIL
```

The rate salt must contain at least 32 random characters. Use the MCC Supabase project URL and server credential. The Resend key must be allowed to send from the existing verified MCC sender. All alerts go exclusively to `john@mastercleanhq.com`; the submitted contact is used as Reply To when available. No automatic message goes to the prospect.

All five variables are now configured for both Preview and Production. The correct `mastercleanhq` Resend account has the verified sending domain `invoices.mastercleanhq.com`. The sender is `Master Commercial Clean <website@invoices.mastercleanhq.com>`. The dedicated sending only key, named `MCC Website Notifications`, is stored in JJ Vault as `MCC Website Resend` and configured as `NETWORK_RESEND_API_KEY`. No credential value belongs in this document or the browser bundle. Sensitive values are omitted by `vercel env pull`; do not weaken their type to export them.

The connected preview checks below confirm delivery to John. John approved the initial production release on October 21, 2026. The verified source is now live with Production configuration. The recorded email delivery tests below used the Preview environment; do not relabel them as Production submissions.

A newly added city file under `content/cities` is automatically accepted by the intake when its source path matches that file. The record stores the canonical region name and slug separately from the visitor’s actual building city or suburb. Vercel must include `content/cities/**` in the `api/network-intake.js` function files.

## Spam controls and cost

The server validates required fields, contact syntax, number bounds, dates, source paths and qualification consent. It caps each body at 16 KB, accepts only JSON or URL encoded form content, and requires an allowed website origin. The honeypot returns a quiet success without storing or emailing anything.

An atomic Storage insert reserves one of three slots per network address in each 15 minute window. The `x-upsert: false` constraint coordinates separate server instances. Raw network addresses are never stored. Reservation paths contain a keyed hash and an expiry window. Each website storage request has a two second deadline. The slowest accepted referral path remains below the form's 25 second client deadline, including all three possible rate reservation attempts. Storage errors fail closed, so an unavailable rate store cannot permit unlimited notifications. Each visitor can submit at most three accepted requests per window from one address; offices sharing an address share that allowance. A visitor who is blocked can call MCC.

The static guide and city pages make no background API requests. Each actual accepted form submission invokes one website function, creates a few small JSON objects and attempts one internal email. There is no polling, scheduled function or automatic email retry. This adds small usage when visitors submit forms. It does not add an image optimization service or a recurring function workload.

Expired rate reservations can be removed manually. The command below removes only expired rate objects and preserves all submissions. Run it occasionally during normal administration; no cron is required.

## Export and recovery

Use a private server environment file outside the repository, with the five configuration names above. Keep it readable only by its owner. The following examples use a private file path placeholder.

```bash
node --env-file=/private/path/mcc-network.env scripts/network-admin.mjs create-bucket
node --env-file=/private/path/mcc-network.env scripts/network-admin.mjs export --environment preview --output /private/path/network-preview.json
node --env-file=/private/path/mcc-network.env scripts/network-admin.mjs export --environment production --format csv --output /private/path/network-leads.csv
node --env-file=/private/path/mcc-network.env scripts/network-admin.mjs prune-rate --environment preview
```

The export preserves the normalized fields and exact storage path. CSV cells receive spreadsheet formula protection. Exports contain contact information, so keep them private and out of source control. Do not use a public file link for lead exports.

A record is saved with `notification.status` set to `pending` before any email attempt. Successful delivery acceptance sets it to `sent`, including the Resend identifier. An email failure sets `retry_required`. A status update failure leaves the original pending record available. Server warnings contain the submission identifier and operational status, without contact details or credentials.

Review pending and retry records during normal lead review. After the sender is configured, retry a specific record with its path from the export:

```bash
node --env-file=/private/path/mcc-network.env scripts/network-admin.mjs retry --environment preview --path preview/submissions/2026-10-21/referral/00000000-0000-4000-8000-000000000123.json
```

The command refuses records already marked sent. Resend receives a stable idempotency key based on the submission identifier. Its idempotency retention is finite, so check provider logs before retrying an old pending record after an uncertain send. No prospective customer receives a retry email.

If quote notification logging itself fails, the canonical CRM quote remains saved. The server records the CRM identifier with `Saved CRM quote needs notification recovery`. Review that CRM record and recover the internal alert separately. This exception does not affect the visitor's confirmed CRM save.

## Verification

Focused Node tests cover concurrent rate reservations across server instances, validation and city matching, honeypot isolation, save before send, notification outage recovery, exact subjects, recipient restrictions, JSON confirmation, native form redirects and quote notification recovery. Run:

```bash
node --test test/network-intake.test.js test/quote.test.js
```

Connected deployment checks must confirm both form types create private objects, that the objects cannot be downloaded anonymously, that the intended internal alerts are accepted, and that the visible form reports success only after persistence. Use a company name beginning with `MCC SYNTHETIC NETWORK TEST`. Remove only clearly identified test objects after verification. Never remove a real inquiry while cleaning up test data.

## Initial storage evidence, October 21, 2026

The correct MCC service credential successfully created the isolated private bucket. One clearly labeled referral test used Katy as its building city and Greater Houston as its routing region. One clearly labeled partner test used multiple service lines. Both requests created normalized private JSON records with pending email recovery status. Authenticated reads matched the submitted test fields. Anonymous public download attempts failed with HTTP 400. The export command produced both records successfully.

Only those two synthetic records and their two rate reservations were removed. A second export contained zero preview records. No customer record, existing CRM table, function, project, billing setting or production deployment changed during those initial checks. This earlier evidence proves persistence, privacy, export and recovery status. It predates the connected sender checks below.

## Connected notification evidence, October 21, 2026

Preview: [current notification candidate](https://master-clean-2lynrks8h-jxwayne890s-projects.vercel.app), deployment `dpl_6NVaeBLDrGnATGp9A1ey5rnjofJz`, source commit `63369316f5227a03801a1ef3fd2753ee7ac41842`. Build, lint and all 86 tests passed for this source.

The direct sender setup email and the actual preview quote, referral and partner application emails were confirmed Delivered in Resend to `john@mastercleanhq.com`. All three application requests returned HTTP 200. The three relevant runtime log rows contained no notification or storage warnings.

All three exact private quote, referral and partner objects were confirmed through bucket metadata. A read only CRM query confirmed the exact synthetic lead `7958f29d-07b9-4a13-97f1-27999b3193de`, one quote `0301337e-01de-432e-adc4-726fafcb70fb` with status `Not Started` and no amount, and one intake activity `d7971a15-350e-4ea8-b55e-cc34015eda04`. The browser blocked the private JSON file URLs, so the current raw record bodies and their stored notification fields were not inspected. Delivered email evidence must not be described as a verified read of those fields.

Read only checks found zero associated calls, photos, upload links, invoices, customer accounts, duplicate leads or operations activity. Runtime foreign keys and the exact quote and activity identifiers were inspected. Cleanup of the current synthetic records remains pending explicit confirmation. Remove only the exact verified test object paths and the identified synthetic CRM lead, with its exact company marker and unchanged initial state. Do not delete storage metadata through SQL or remove unrelated records or rate reservations. The initial production release was separately approved and verified after these notification checks. Guide publishing activation and Groku verification remain in progress. No DNS or billing changed.
