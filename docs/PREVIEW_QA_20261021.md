# MCC preview verification

Checked October 21, 2026. Production release is not approved. Both guide publishing launch gates remain false.

Current preview: [notification and publisher candidate](https://master-clean-2lynrks8h-jxwayne890s-projects.vercel.app), deployment `dpl_6NVaeBLDrGnATGp9A1ey5rnjofJz`, source commit `63369316f5227a03801a1ef3fd2753ee7ac41842`.

## Current verified checks

1. Build, ESLint and all 86 tests passed for source `63369316f5227a03801a1ef3fd2753ee7ac41842`.
2. All five `NETWORK_*` server settings are configured for Preview and Production. No production release has occurred.
3. The correct `mastercleanhq` Resend account has verified `invoices.mastercleanhq.com`. The dedicated sending only key `MCC Website Notifications` is stored in JJ Vault as `MCC Website Resend`. The configured sender is `Master Commercial Clean <website@invoices.mastercleanhq.com>`.
4. Resend confirmed the direct setup email and the actual preview quote, referral and partner application emails Delivered to `john@mastercleanhq.com`. All three application requests returned HTTP 200. The three relevant runtime log rows contained no notification or storage warnings.
5. All three exact private quote, referral and partner object existence checks passed through bucket metadata. A read only CRM query confirmed the exact synthetic lead, one quote with status `Not Started` and no amount, and one expected intake activity. The browser blocked the private JSON file URLs. Current raw record bodies and stored notification status fields were not inspected.
6. Read only dependency checks found zero associated calls, photos, upload links, invoices, customer accounts, duplicate leads or operations activity for the exact synthetic lead. Cleanup remains pending explicit confirmation.
7. The correct Vercel dashboard confirmed the earlier exhausted meters were Fluid Provisioned Memory and Fluid Active CPU, attributable almost entirely to deleted Agent Mission Control. No current allowance is full. Deployment Storage is closest, at 84.26 percent, dominated by `jedisgames`. Modern origin transfer, image and compute readings plus aligned retained deployment counts are recorded in `VERCEL_USAGE_REPORT.md`.

## Earlier verified checks

1. The checkout started at `532ffd481dbffb4ef741894522eed4a54a912e22`, the exact live production commit from Vercel project `master-clean-hq` in MCC's `jxwayne890s-projects` team.
2. The existing build prerenders 302 routes with zero failures. The new builder generates 11 static resource pages, including the confirmation page, with 310 unique public sitemap URLs in total.
3. The initial 24 focused tests covered guide HTML, metadata, contents anchors, referral schema, sitemap coverage, input validation, shared rate reservations, save before email, native and JSON responses, and preserved CRM and Form Guard behavior. The current suite above supersedes that earlier test count.
4. Chrome inspection at desktop width and 390 pixel mobile width confirmed legible guide and form layouts. The inspected article and city page had no horizontal overflow. Later previews added the shared motion layer; the guides remain generated static HTML.
5. Protected Vercel preview `master-clean-jhzookj2p-jxwayne890s-projects.vercel.app` returned HTTP 200 for `/guides`, the office checklist, the Dallas Fort Worth city page, `/sitemap.xml` and `/robots.txt`. Guide HTML includes Article schema and the table of contents. The new hub contains all five guides. Sitemap includes each new public URL once and excludes the confirmation page.
6. A labeled referral submission through the deployed JSON endpoint returned HTTP 200 with a real identifier after a durable save. Its actual city was Katy, and the record retained the Greater Houston region separately.
7. A labeled native partner application with multiline services returned HTTP 303 to the confirmation page after a durable save.
8. Export and private JSON inspection confirmed both deployed records, normalized types, qualification and consent, source and environment metadata. Anonymous download attempts were denied. Both deployed test records and their exact test rate reservations were removed. The final preview export contained zero records.
9. The existing Codex weekly heartbeat remains assigned to Wednesday at 9 AM America/Chicago. Scheduling has not transferred to Groku. Future guide publishing has standing permission after the initial approved launch, subject to the publishing workflow and checks.

## Still required

1. Review the completed Vercel usage report. Any proposed removal of retained game deployments or changes to billing require separate approval; no such action was taken.
2. Current private JSON bodies were blocked and remain uninspected; do not claim that stored notification fields were read. Runtime foreign keys and all related record counts were verified separately through read only CRM queries.
3. Cleanup of the current synthetic bucket objects and CRM test lead remains pending explicit confirmation. Remove only exact verified paths and the exact lead ID with its matching synthetic company marker. The earlier test cleanup does not establish cleanup of this new run.
4. Obtain approval for the initial website release and verify it live, then connect Groku to the hosted MCP after its required access confirmation. Verify one actual guide publication through GitHub Actions and Vercel. Prove an unattended Groku cloud run before transferring the weekly schedule and retiring the existing Codex job. Groku saved and confirmed this sequence after receiving the completed notification setup status. No transfer or unattended publication is verified yet.
5. Test the staged production build and obtain John's approval before the initial production release. Server variables are configured, but both publication gates remain false until the approved initial release and activation steps are completed.

No DNS, billing, project deletion or production release was changed. Production server configuration is now present. The current connected checks created clearly marked synthetic records; their exact verification and cleanup remain pending as described above. Existing CRM schema and access policies were not changed.
