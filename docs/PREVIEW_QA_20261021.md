# MCC preview verification

Checked October 21, 2026. Production release is not approved.

## Verified

1. The checkout started at `532ffd481dbffb4ef741894522eed4a54a912e22`, the exact live production commit from Vercel project `master-clean-hq` in MCC's `jxwayne890s-projects` team.
2. The existing build prerenders 302 routes with zero failures. The new builder generates 11 static resource pages, including the confirmation page, with 310 unique public sitemap URLs in total.
3. Build, ESLint and 24 focused tests pass. The tests cover final guide HTML, metadata, contents anchors, referral schema, sitemap coverage, input validation, shared rate reservations, save before email, native and JSON responses, and preserved CRM and Form Guard behavior.
4. Chrome inspection at desktop width and 390 pixel mobile width confirmed legible guide and form layouts. The inspected article and city page had no horizontal overflow. The article loads no client script. The city page loads only the small form enhancement.
5. Protected Vercel preview `master-clean-jhzookj2p-jxwayne890s-projects.vercel.app` returned HTTP 200 for `/guides`, the office checklist, the Dallas Fort Worth city page, `/sitemap.xml` and `/robots.txt`. Guide HTML includes Article schema and the table of contents. The new hub contains all five guides. Sitemap includes each new public URL once and excludes the confirmation page.
6. A labeled referral submission through the deployed JSON endpoint returned HTTP 200 with a real identifier after a durable save. Its actual city was Katy, and the record retained the Greater Houston region separately.
7. A labeled native partner application with multiline services returned HTTP 303 to the confirmation page after a durable save.
8. Export and private JSON inspection confirmed both deployed records, normalized types, qualification and consent, source and environment metadata. Anonymous download attempts were denied. Both deployed test records and their exact test rate reservations were removed. The final preview export contained zero records.
9. The weekly thread heartbeat is saved and active for Wednesday at 9 AM in the local America/Chicago timezone. It drafts one guide and prepares a preview; production still requires John's approval.

## Still required

1. Sign into the correct MCC Vercel dashboard to confirm the exact allowance shown at 100 percent, Fast Origin Transfer, image source and transformation counts, and Fluid Compute metrics. The authenticated CLI audit identified the dominant historical project, but its legacy duration counters are not a substitute for the current dashboard meters.
2. Sign into MCC Resend or securely configure a valid MCC sending credential and verified sender. The existing application's sensitive key cannot be exported through Vercel. No sending credential was invented or copied from another client. No email was sent. Both connected test records correctly held `retry_required` before cleanup.
3. After sender setup, verify accepted internal emails to John for both new form types and a quote notification without duplicating a real CRM lead. Remove the clearly labeled synthetic records afterward.
4. Before an approved production release, configure the five new server variables in the production environment, test the staged production build, and obtain John's approval for publication. Only the three storage variables are currently set for Preview.

No production deployment, production environment variable, DNS, billing, existing CRM table or project deletion was changed. The additive private storage bucket supports the preview without changing existing CRM records or access policies.
