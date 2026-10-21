# Vercel usage investigation

Checked October 21, 2026. The main findings now use the authenticated MCC Vercel dashboard. Earlier CLI counters remain in the appendix as diagnostics, with different windows and definitions.

## Main finding

The previous comparison period reached 100 percent on **both Fluid Provisioned Memory and Fluid Active CPU**. Memory was 533.8 GB hours against 360 included, about 148.3 percent. CPU was 7 hours 46 minutes against four included, about 194.2 percent. Dashboard progress indicators stop at 100 percent even when actual usage exceeds the allowance.

The deleted Agent Mission Control project used 533.6 GB hours, shown as 100.0 percent of previous Fluid memory after rounding, and 7 hours 45 minutes, or 99.8 percent of previous Fluid CPU. Its retained dashboard label is `agent-mission-control-1790886504892-Vp6M`. The historical ID is `prj_y5tafXrevR1hqCWnyBvnm2b61hhE`, mapped by `/Users/john/Documents/Agent Mission Control/.vercel/project.json`. Vercel activity confirms deletion on October 1, 2026 at 20:28 UTC. No further deletion is needed.

**No current allowance is full.** Current Fluid memory is 42.25 percent and CPU is 39.24 percent. The closest current capacity limit is **Deployment Storage, 8.43 GB of 10 GB, or 84.26 percent**. `jedisgames` accounts for 7.25 GB, about 86 percent of that storage. Review its retained previews, large game assets and retention before considering an upgrade for capacity. No project, deployment or billing setting was changed during this investigation.

These findings supersede the earlier provisional inference based on a legacy 100 GB hour function allowance. The dashboard's non Fluid Function Duration meter is zero in both periods. Legacy execution totals are not the account's applicable Fluid meters.

## Account and comparison windows

The CLI is authenticated as `jxwayne890@gmail.com`, with OWNER access to `jxwayne890s-projects`, team `team_ijL6I1f7BoKqxGHB4grAxAI0`. The team is on Hobby and reports `billing.period: null`. The website is `master-clean-hq`, project `prj_NArudA2LATO6B5HXZYhjA90nVigC`, serving `mastercleanhq.com` and `www.mastercleanhq.com`.

The inventory contains 53 existing projects: 32 Vite, three Next.js, one Node and 17 with no framework preset. Hobby has no billing cycles. The dashboard's rolling and custom comparison windows are recorded instead. [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)

| Window | Dashboard dates, America/Los_Angeles | UTC boundaries | URL timestamps |
| --- | --- | --- | --- |
| Current, Last 30 Days | September 21 at 2 PM through October 21 at 2 PM | Verified start `2026-09-21T21:00:00Z`, displayed end approximately `2026-10-21T21:00:00Z` | Verified `from=1790024400000`, `range=last-30-days`; dynamic end inferred from UI |
| Previous, custom selection | August 22 at 2 PM through September 21 at 2 PM | `2026-08-22T21:00:00Z` through `2026-09-21T21:00:00Z` | Verified `from=1787432400000`, `to=1790024400000` |

The date picker uses America/Los_Angeles. The previous URL establishes its exact UTC boundaries. The current URL establishes its start, while its rolling end is inferred from the displayed local hour. These windows begin 21 hours later than the earlier CLI windows below. Do not reconcile their totals as though the cutoffs were identical.

## Modern dashboard usage

| Metric | Current window | Previous window | Interpretation |
| --- | ---: | ---: | --- |
| Fast Data Transfer | 14.75 GB | 8.6 GB | Current detail: 395.27 MB incoming and 14.35 GB outgoing. Both below 100 GB. |
| Fast Origin Transfer | 228.9 MB | 506.31 MB | Both below 10 GB. |
| CDN Requests, formerly Edge Requests | 318,961 | 651K displayed | Previous display is rounded. Both below one million. |
| Function Invocations | 179,192 | 564,166 | Modern dashboard meter, below one million in both windows. |
| Function Duration, non Fluid | 0 GB hours | 0 GB hours | This was not the exhausted meter. |
| Fluid Provisioned Memory | 152.1 GB hours of 360, 42.25 percent | 533.8 GB hours of 360, about 148.3 percent | Previous progress indicator shows 100 percent. |
| Fluid Active CPU | 1 hour 34 minutes displayed, 39.24 percent of four hours | 7 hours 46 minutes of four hours, about 194.2 percent | Previous progress indicator shows 100 percent. Displayed durations are rounded. |
| Billable Build Minutes | 0 seconds of 0 seconds | 0 seconds | Separate from Build Time and Build CPU; zero is not a failed reading. |
| Build Time | 3 hours displayed; 197.39 minutes derived from 3.289878 percent of 100 hours | 57.62 minutes derived from 0.9602614 percent of 100 hours | Dashboard definition includes time queued or building. |
| Build CPU | 11 hours 52 minutes | 2 hours displayed | Diagnostic CPU total, distinct from elapsed Build Time. |
| Image Optimization source images | 0 of 1,000 | 0 | Dashboard labels this Source Images (Legacy). |
| Image Optimization transformations | 0 of 5,000 | 0 | Not the limit driver. |
| Image Optimization cache reads | 0 | 0 | No usage displayed. |
| Image Optimization cache writes | 0 | 0 | No usage displayed. |
| Deployment Storage | 8.43 GB of 10 GB, 84.26 percent | 3.31 GB of 10 GB, 33.12 percent | Closest current capacity limit. |
| Functions Storage | 41.43 MB of 10 GB, about 0.4143 percent | 1.84 GB of 10 GB, 18.41 percent | Separate dashboard storage meter. |
| Deployments | 68 retained records, 42 production and 26 preview | 37 retained records, 32 production and five preview | Authenticated, paginated API count aligned to the explicit 21:00 UTC comparison boundaries. Includes blocked records and omits deleted history. |

The dashboard supplies these readings. Public documentation confirms the principal transfer, request and Fluid allowances. [Vercel Hobby plan](https://vercel.com/docs/plans/hobby), [fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)

## Which projects contribute most

### Current Fluid Compute

| Project | Provisioned Memory | Active CPU |
| --- | ---: | ---: |
| Deleted `agent-mission-control-1790886504892-Vp6M` | 150.1 GB hours, 98.7 percent | 1 hour 26 minutes, 91.7 percent |
| `agrail` | 1.9 GB hours, 1.2 percent | 7 minutes 7 seconds, 7.6 percent |
| `provider-preferences` | 0.07 GB hours | 19 seconds, 0.3 percent |
| `master-clean-app` | 0.01 GB hours | 12 seconds, 0.2 percent |
| `wehrmeyer` | 0.01 GB hours | 8 seconds, 0.1 percent |
| `master-clean-hq` | 0.01 GB hours | 4 seconds, 0.1 percent |

The deleted project remains visible because this rolling window includes its usage before October 1. A historical row does not mean the project is still deployed. MCC itself is a very small compute contributor.

### Previous Fluid Compute

| Project | Provisioned Memory | Active CPU |
| --- | ---: | ---: |
| Deleted `agent-mission-control-1790886504892-Vp6M` | 533.6 GB hours, 100.0 percent displayed after rounding | 7 hours 45 minutes, 99.8 percent |
| `master-clean-app` | 0.05 GB hours | 40 seconds |
| `agrail` | 0.04 GB hours | 9 seconds |
| `the-provider-system-website` | Not captured | 1 second |

The deleted project's 100.0 percent share is a rounded share, not a claim that other projects used exactly zero. Modern dashboard attribution independently confirms the earlier CLI residual diagnosis.

### Current Fast Data Transfer

The full project view confirms these largest contributors. This is the modern Fast Data Transfer meter, separate from the legacy outgoing bandwidth table below.

| Project | Fast Data Transfer | Share |
| --- | ---: | ---: |
| `jedisgames` | 9.44 GB | 64.0 percent |
| `permian-sand-movers` | 2 GB | 13.6 percent |
| `agrail` | 1.35 GB | 9.1 percent |
| `master-clean-hq` | 1.01 GB | 6.9 percent |
| `the-provider-system-website` | 280.86 MB | 1.9 percent |
| Deleted Agent Mission Control | 211.61 MB | 1.4 percent |

Smaller confirmed entries include `health-tracker` at 1.64 MB, `master-clean-app` at 1.26 MB and `melinvoice` at 656.82 kB. No cleanup of these low usage projects is justified by the measured transfer totals.

### Current Deployment Storage examples

| Project | Storage |
| --- | ---: |
| `jedisgames` | 7.25 GB, about 86 percent of the 8.43 GB total |
| `master-clean-hq` | 235.86 MB |
| `adrians-custom-services` | 178.4 MB |
| `permian-sand-movers` | 113.4 MB |
| `agrail` | 86.29 MB |
| `e3c-grid-hub-main` | 45.41 MB |

Team Deployment Storage rose from 3.31 GB in the prior view to 8.43 GB currently. The graph peaked near 9.3 GB around October 14 before settling near 8.4 GB. The overview legend shows selected project examples rather than a fully sorted global list. `jedisgames` is the clear dominant contributor; the other rows above are confirmed examples, not a claimed complete ranking. Review retention and large output before identifying specific previews that are safe to remove.

The aligned current deployment count includes 19 retained records for `jedisgames`, 12 for `master-clean-hq`, six for `agrail`, and four each for `provider-preferences` and `nagle-crm`. The current window contains 64 ready and four blocked records. The previous window contains 24 ready, 12 blocked and one failed record. These counts describe retained deployment records, not build minutes or current storage bytes.

## Causes and fixes

1. **Agent Mission Control exhausted the previous Fluid allowances.** Its source contains a worker loop with a default 10 second polling interval, health checks, heartbeats and channel reads. Its frontend has 15 second status refreshes and five second dashboard refreshes. Vercel routed its API paths to one Python function with a 300 second maximum duration. These mechanisms explain persistent function work; dashboard totals establish the dominant project. Individual route and caller attribution remains unavailable. The Vercel project was already deleted on October 1. Keep the replacement runtime intact. Before any future Vercel redeployment, remove idle polling, add pause and backoff behavior, combine status reads and avoid repeatedly invoking serverless endpoints to support a persistent worker.

2. **Large retained deployments are the current capacity concern.** `jedisgames` dominates Deployment Storage. Review its retained game previews, large assets and retention, then present specific obsolete deployments for John's approval. Do not delete projects or deployments during the audit. Weekly guide text is small and pages render statically, but each guide release still consumes a build and can add retained deployment output. Do not promise that automated publishing adds no Vercel usage.

3. **Smaller runtime failures merit targeted repairs.** The earlier diagnostic window found errors and timeouts in `agrail`, plus a failing daily cron in `concierge-nurse-society`. Their counters are preserved below. Check failing routes, bound upstream timeouts and stop repeated retries after persistent failure. Review the cron's business need before proposing any change. Neither project was changed.

4. **Static asset delivery can be reduced.** The earlier bandwidth ranking was led by `jedisgames`, although modern team Fast Data Transfer remains far below its allowance. Review large asset paths, compression, browser caching and unnecessary downloads. MCC also retains `public/img/blog.images/blog1.jpg`, a 7,536,640 byte source JPEG. If used for delivery, create a compressed variant while retaining the original. Its size alone does not prove transfer volume.

5. **Image optimization and bots are not the proven cause.** The dashboard shows zero image source, transformation, cache read and cache write usage in both periods. MCC is Vite and contains no `next/image` usage or cron definition. Source supports automated internal polling. No retained user agent, IP or route breakdown conclusively identifies crawlers as the cause. Do not block Google indexing merely because traffic is automated.

## Whether Pro is needed

The previously exhausted compute meters are now below half of their allowances after Agent Mission Control was removed. The measured MCC marketing website load does not justify Pro solely for compute capacity. Deployment Storage still needs a targeted retention review before it becomes the next cap.

There is a separate commercial use requirement. Vercel restricts Hobby to personal, noncommercial use and requires Pro or Enterprise for commercial usage. MCC advertises paid services and captures business leads, so it belongs on Pro under those terms even if usage stays low. This policy was checked again on October 21, 2026. [Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)

The current public Pro starting price is $20 per month with $20 in included usage credit, checked again on October 21, 2026. That does not guarantee the whole 53 project account will always total exactly $20. Review applicable pricing and spend controls before upgrading. No billing action was taken. [Vercel pricing](https://vercel.com/pricing)

## Evidence limits

The two exhausted meters, direct current and previous compute attribution, largest confirmed transfer contributors, image usage, origin transfer and Fluid billing model are verified. A separate authenticated count fetched two pages and 105 unique retained deployment records across the exact previous and current 21:00 UTC windows. The latest retained record was October 21 at 19:57 UTC. Deleted deployment history is unavailable. No additional account login is needed to establish these findings.

The earlier authenticated CLI `vercel usage` request returned `Costs not found (404)`. A temporary CLI version 65 invocation required Observability Plus for modern queries. The correct dashboard now supplies modern values without purchasing that add on. No add on or installed CLI upgrade was performed for the audit.

## Appendix: earlier CLI diagnostic audit

The original windows were September 21 at midnight UTC through October 21 at midnight UTC, and August 22 at midnight UTC through September 21 at midnight UTC. The partial current UTC day was excluded. Vercel refreshed these counters at about 14:22 UTC on October 21. Their cutoffs differ by about 21 hours from the displayed dashboard windows, and their counter definitions differ. These are diagnostic counters, not billed modern meters.

| Legacy diagnostic | Recent CLI window | Previous CLI window |
| --- | ---: | ---: |
| Outgoing bandwidth | 14.337 GB | 8.307 GB |
| Cached plus uncached requests | 337,159 | 655,833 |
| Invocation outcome events | 322,279 | 586,820 |
| Successful, error and timeout execution | 165.294 GB hours | 538.758 GB hours |
| Build execution time, excluding queues | 163.94 minutes | 20.23 minutes |
| Build units | 235 | 52 |
| Retained deployment records | 61, including 42 production and 19 preview | 37, including 32 production and five preview |

Retained counts include blocked creation attempts and may omit deleted project history. The legacy API did not provide modern origin transfer, image optimization or Fluid CPU and memory meters. Its execution totals originally suggested a 100 GB hour overage. That provisional interpretation is superseded by the verified Fluid dashboard findings above.

### Legacy function attribution and errors

Before October 2, the team recorded about 15 GB hours of legacy execution and 29,000 invocation outcome events per day. From October 2 through October 20, daily execution was below 0.11 GB hours.

Subtracting all 53 retained projects from the recent team total left 163.381 GB hours, about 98.84 percent of diagnostic execution, and 318,104 outcome events associated with the unavailable historical project. This was a reconciled residual, not a direct deleted project query. The previous residual was approximately 538.64 GB hours; five small project queries were unavailable in that window. Direct modern dashboard attribution now confirms the deleted project's dominance.

The retained projects totaled 1.913 GB hours recently. `agrail` contributed 1.813 GB hours and 3,149 outcome events, including 614 errors and two timeouts. `provider-preferences` contributed 0.0674 GB hours and 767 events. `master-clean-app` contributed 0.0115 GB hours and 59 events. `master-clean-hq` contributed 0.00977 GB hours and 25 successful events.

`concierge-nurse-society` was the only retained project with a nonempty cron definition: `/api/process-sequences` at `0 8 * * *`. Its recent diagnostic window had 30 uncached requests, 60 error invocation events and 0.00496 GB hours. It was not the dominant contributor. No cron was changed.

### Legacy outgoing bandwidth ranking

| Project | Recent CLI window | Share of recent CLI team total | Previous CLI window |
| --- | ---: | ---: | ---: |
| `jedisgames` | 9.375 GB | 65.4 percent | No rows returned |
| `permian-sand-movers` | 1.969 GB | 13.7 percent | 1.180 GB |
| `agrail` | 1.312 GB | 9.2 percent | 0.006 GB |
| `master-clean-hq` | 0.967 GB | 6.7 percent | 0.813 GB |
| `the-provider-system-website` | 0.267 GB | 1.9 percent | 0.245 GB |
| `adrians-custom-services` | No rows returned | Not calculated | 5.112 GB |

`melinvoice` used about 0.590 MB recently and `health-tracker` about 1.386 MB. No recent request rows were returned for `nagle-crm` or `upcrm`. Low traffic does not establish that a project is safe to delete. Removing these projects would not fix the previous Fluid cap.

The recent retained deployment history had 19 records for `jedisgames`, six for `agrail`, five for `master-clean-hq` and four each for `provider-preferences` and `nagle-crm`. This did not show a deployment explosion explaining historical compute. Retained deployment storage remains a separate modern capacity concern.

### Evidence and reproducibility

1. Authenticated dashboard Last 30 Days and custom views establish the modern totals and allowance indicators. The previous custom URL establishes exact UTC boundaries. Detailed memory and CPU lists, the full transfer project view and confirmed storage examples establish modern attribution. Local raw accessibility evidence is saved at `/tmp/mcc-vercel-current-usage-20261021.txt`, `/tmp/mcc-vercel-previous-usage-20261021.txt` and `/tmp/mcc-vercel-current-compute-20261021.txt`; these temporary files are not durable repository attachments.
2. `vercel whoami --format json` and `vercel teams ls --format json` establish owner and scope. `vercel project inspect master-clean-hq --scope jxwayne890s-projects --non-interactive` establishes the website target.
3. `GET /v2/teams/team_ijL6I1f7BoKqxGHB4grAxAI0` establishes Hobby, owner membership and the null billing period. `GET /v10/projects?teamId=team_ijL6I1f7BoKqxGHB4grAxAI0&limit=100` supplies inventory, framework presets and cron definitions.
4. `GET /v2/usage`, with `type=requests` or `type=builds`, ISO `from` and `to`, the team ID and optional `projectId`, supplied the legacy counters. These have not been relabeled as Fluid usage.
5. `GET /v6/deployments`, with explicit team ID, timestamp bounds and pagination, supplies retained deployment counts. Both the earlier midnight UTC counts and the later aligned 21:00 UTC counts are labeled above. `GET /v3/events`, filtered to `types=project-delete`, confirms October 1 deletion.
6. Read only GitHub source inspection of `JxWayne890/agent-mission-control` confirms polling defaults, frontend timers and Python API configuration. Source supports the mechanism; dashboard usage establishes measured attribution.

Companion data: `vercel-usage-projects-20261021.csv`. It contains legacy numeric counters and project identifiers only, with no secrets or lead information. A row marked `unavailable` means missing data, not measured zero. An empty successful result means no rows were returned for that project and CLI window.
