# MCC preview verification

Checked October 21, 2026. John approved the initial production release. The initial commit `4e1aa7563904c963cc62fd556f6a95fc525b0625` went live at `https://www.mastercleanhq.com`, through deployment `dpl_3b3iyaowgfNSmdZRB18otHXmGR7g`. Both guide publishing gates were disabled for this verified initial release. Both publishing gates were then enabled after verification. Groku subsequently published two additional guides, including an unattended cloud run, and took over the weekly schedule.

Current preview: [notification and publisher candidate](https://master-clean-2lynrks8h-jxwayne890s-projects.vercel.app), deployment `dpl_6NVaeBLDrGnATGp9A1ey5rnjofJz`, source commit `63369316f5227a03801a1ef3fd2753ee7ac41842`.

## Production publisher completion

1. Source `597659b674f0a713a8209c09290eda30d7ba3a5a` passed production checks before the GitHub launch gate was enabled. Remote authenticated MCP initialization and the exact three tool catalog passed. Unauthorized requests returned 401.
2. Groku published the provider transition guide through workflow `39672649500`, content commit `397eaab69205c07c9b2e1bc131776098259c0183`. Independent exact source, article, metadata, schema, related links, index, sitemap, robots and contact checks passed.
3. A one time Groku cloud routine published the quote preparation guide through workflow `39674091224`, content commit `0de9533f906ab354bf3a0fd1c1b2a690cea6cab9`. Independent verification passed at 20:54:57 UTC. The routine started at 3:51 PM Central and required no approval or Mac, Vault or Codex operation. Seven guides are now live. The completed one time routine was retired.
4. The former Codex weekly heartbeat is paused. The Groku app confirms one active `weekly-mcc-guide-publisher` routine, Wednesday around 9 AM America/Chicago, starting October 28. The scheduler allows a 15 minute timing window.
5. The IndexNow worker addition passed guide validation, build, ESLint and all 94 tests. A test run started before its build artifacts existed failed two generated content checks; the complete suite passed after the build in the required order. The focused worker outage fixture proves a failed search notification preserves a verified published guide and unchanged commit. Independent review found no material issues.
6. The helper verified the public proof file and IndexNow returned HTTP 200 for both newly published guides at 20:58 UTC. This proves notification acceptance, not indexing. The hook adds no visitor code or Vercel cron and runs only after live publication verification.
7. Production form validation returned 422 for missing fields, 200 for a filled honeypot and 403 for an untrusted origin on both endpoints. These checks created no production submissions or emails. Actual email delivery evidence below remains from Preview.

## Initial launch verified checks

1. Build, ESLint and all 86 tests passed for source `63369316f5227a03801a1ef3fd2753ee7ac41842`.
2. All five `NETWORK_*` server settings are configured for Preview and Production and were included in the approved production release.
3. The correct `mastercleanhq` Resend account has verified `invoices.mastercleanhq.com`. The dedicated sending only key `MCC Website Notifications` is stored in JJ Vault as `MCC Website Resend`. The configured sender is `Master Commercial Clean <website@invoices.mastercleanhq.com>`.
4. Resend confirmed the direct setup email and the actual preview quote, referral and partner application emails Delivered to `john@mastercleanhq.com`. All three application requests returned HTTP 200. The three relevant runtime log rows contained no notification or storage warnings.
5. All three exact private quote, referral and partner object existence checks passed through bucket metadata. A read only CRM query confirmed the exact synthetic lead, one quote with status `Not Started` and no amount, and one expected intake activity. The browser blocked the private JSON file URLs. Current raw record bodies and stored notification status fields were not inspected.
6. Read only dependency checks found zero associated calls, photos, upload links, invoices, customer accounts, duplicate leads or operations activity for the exact synthetic lead. Cleanup remains pending explicit confirmation.
7. The correct Vercel dashboard confirmed the earlier exhausted meters were Fluid Provisioned Memory and Fluid Active CPU, attributable almost entirely to deleted Agent Mission Control. No current allowance is full. Deployment Storage is closest, at 84.26 percent, dominated by `jedisgames`. Modern origin transfer, image and compute readings plus aligned retained deployment counts are recorded in `VERCEL_USAGE_REPORT.md`.
8. Initial production verification passed at 20:38 UTC. The exact manifest commit matched before and after all checks. All five article bodies, metadata, Article schema, contents anchors, related links, guide index entries, sitemap and robots passed. The catalog lists each starter guide once. Houston, Dallas Fort Worth and partner application pages passed unique copy, disclosure, qualification, required field and honeypot checks. No Production form submission was created during these public checks.

## Earlier verified checks

1. The checkout started at `532ffd481dbffb4ef741894522eed4a54a912e22`, the exact live production commit from Vercel project `master-clean-hq` in MCC's `jxwayne890s-projects` team.
2. The existing build prerenders 302 routes with zero failures. The new builder generates 11 static resource pages, including the confirmation page, with 310 unique public sitemap URLs in total.
3. The initial 24 focused tests covered guide HTML, metadata, contents anchors, referral schema, sitemap coverage, input validation, shared rate reservations, save before email, native and JSON responses, and preserved CRM and Form Guard behavior. The current suite above supersedes that earlier test count.
4. Chrome inspection at desktop width and 390 pixel mobile width confirmed legible guide and form layouts. The inspected article and city page had no horizontal overflow. Later previews added the shared motion layer; the guides remain generated static HTML.
5. Protected Vercel preview `master-clean-jhzookj2p-jxwayne890s-projects.vercel.app` returned HTTP 200 for `/guides`, the office checklist, the Dallas Fort Worth city page, `/sitemap.xml` and `/robots.txt`. Guide HTML includes Article schema and the table of contents. The new hub contains all five guides. Sitemap includes each new public URL once and excludes the confirmation page.
6. A labeled referral submission through the deployed JSON endpoint returned HTTP 200 with a real identifier after a durable save. Its actual city was Katy, and the record retained the Greater Houston region separately.
7. A labeled native partner application with multiline services returned HTTP 303 to the confirmation page after a durable save.
8. Export and private JSON inspection confirmed both deployed records, normalized types, qualification and consent, source and environment metadata. Anonymous download attempts were denied. Both deployed test records and their exact test rate reservations were removed. The final preview export contained zero records.
9. The Codex heartbeat originally held the Wednesday slot. The production publisher completion section supersedes this historical schedule state.

## Still required

1. Review the completed Vercel usage report. Any proposed removal of retained game deployments or changes to billing require separate approval; no such action was taken.
2. Current private JSON bodies were blocked and remain uninspected; do not claim that stored notification fields were read. Runtime foreign keys and all related record counts were verified separately through read only CRM queries.
3. Cleanup of the current synthetic bucket objects and CRM test lead remains pending explicit confirmation. Remove only exact verified paths and the exact lead ID with its matching synthetic company marker. The earlier test cleanup does not establish cleanup of this new run.
4. Google Search Console and Bing Webmaster sitemap registrations remain unverified. The business Google session was expired and Bing was signed out. Automatic public sitemap generation and IndexNow acceptance do not prove account registration or indexing.

The approved initial website release is now live. No DNS, billing or project deletion changed. The connected Preview notification checks created clearly marked synthetic records; their exact cleanup remains pending as described above. Existing CRM schema and access policies were not changed.
