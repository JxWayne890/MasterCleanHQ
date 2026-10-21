# Vercel usage investigation

Checked October 21, 2026. This report uses authenticated MCC account records and distinguishes measured usage from information that still requires the correct dashboard session.

## Main finding

The overwhelming source of historical function work was `agent-mission-control`, project `prj_y5tafXrevR1hqCWnyBvnm2b61hhE`. Vercel now labels its historical usage as “Unknown Project”. The local file `/Users/john/Documents/Agent Mission Control/.vercel/project.json` maps that exact ID to `agent-mission-control`.

Vercel activity records that this project was deleted on October 1, 2026 at 20:28 UTC. Its daily function work disappeared at that time. No project was deleted, paused, or otherwise changed during this investigation.

Before October 2, the team regularly recorded about 15 GB hours of function execution and about 29,000 invocation events per day. From October 2 through October 20, total team function execution was below 0.11 GB hours per day. The MCC website is a very small contributor to function usage.

The historical execution meter is above the legacy Hobby allowance of 100 GB hours, making function execution the clear overage candidate. The exact metric named in John's 100 percent notification is not yet verified. Fluid Compute uses Active CPU and Provisioned Memory meters instead of the legacy duration allowance. The available historical endpoint does not distinguish the billing model for the deleted project. Do not present a calculated legacy percentage as a verified dashboard badge.

## Account and time windows

The CLI is authenticated as `jxwayne890@gmail.com`, with OWNER access to `jxwayne890s-projects`, team `team_ijL6I1f7BoKqxGHB4grAxAI0`. The team is active on Hobby and reports `billing.period: null`. The inspected website is `master-clean-hq`, project `prj_NArudA2LATO6B5HXZYhjA90nVigC`, serving `mastercleanhq.com` and `www.mastercleanhq.com`.

There are 53 existing projects, comprising 32 Vite projects, three Next.js projects, one Node project, and 17 with no framework preset. Vercel documents that Hobby has no billing cycles. This report therefore compares two explicit windows of 30 complete UTC days, rather than inventing billing boundaries. [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)

1. Recent window: September 21 at 00:00 UTC through October 21 at 00:00 UTC, including September 21 through October 20.
2. Previous window: August 22 at 00:00 UTC through September 21 at 00:00 UTC, including August 22 through September 20.

The current partial day is excluded to make the comparison reproducible. Usage data was refreshed by Vercel at about 14:22 UTC on October 21.

## Usage readout

| Requested metric | Recent window | Previous window | Evidence and limitation |
| --- | ---: | ---: | --- |
| Fast Data Transfer | Legacy outgoing bandwidth: 14.337 GB | Legacy outgoing bandwidth: 8.307 GB | Authenticated historical usage data. The current Fast Data Transfer dashboard meter still needs confirmation. These values are far below the published 100 GB Hobby allowance. |
| Fast Origin Transfer | Not available | Not available | The old incoming bandwidth field is not a substitute for origin transfer. Modern metric queries require Observability Plus. |
| Edge Requests, now CDN Requests in current docs | Legacy cached plus uncached requests: 337,159 | Legacy cached plus uncached requests: 655,833 | Both are below the current published one million CDN request allowance. Exact modern meter is not verified. |
| Function Invocations | 322,279 invocation events | 586,820 invocation events | Sum of successful, error, timeout, and throttled counters in the legacy usage API. Billing treatment and the account's active limit need dashboard confirmation. |
| Function Duration | 165.294 GB hours | 538.758 GB hours | Legacy execution meter, including successful, error, and timeout execution. Equals 165.3 percent and 538.8 percent of the legacy 100 GB hour allowance, but does not establish a Fluid Compute overage by itself. |
| Active CPU and Provisioned Memory | Not available | Not available | Needed to finish the diagnosis if the deleted project used Fluid Compute. |
| Build Minutes | 163.94 minutes | 20.23 minutes | Sum of build execution seconds, excluding queue time. The API reported 235 build units recently and 52 previously. Build units are not the same as deployment records. |
| Image Optimization source images | Not available | Not available | No count was returned by the accessible legacy usage API. The team has the newer image pricing flag enabled. Do not infer zero. |
| Image Optimization transformations | Not available | Not available | Modern image transformation queries require Observability Plus. Use the Hobby usage dashboard for the allowance readout without purchasing an add on. |
| Deployments | 61 retained records, 42 production and 19 preview | 37 retained records, 32 production and five preview | Deployment API count. Includes blocked creation attempts. Deleted project history may not be retained. |

Decimal GB is used above. Published allowances and current plan terms are from [Vercel's Hobby documentation](https://vercel.com/docs/plans/hobby), [legacy function pricing](https://vercel.com/docs/functions/usage-and-pricing/legacy-pricing), and [platform limits](https://vercel.com/docs/limits).

## Which projects contribute most

The project CSV beside this report contains every existing project's returned counters for both windows. A row marked `unavailable` is missing data, not measured zero. Empty successful query results mean no rows were returned for that project and window.

### Function work

`agent-mission-control` dominates the historical daily breakdown. Subtracting all 53 current projects from the recent team total leaves 163.381 GB hours, about 98.84 percent of total execution, and 318,104 invocation events attributable to the unavailable historical project. This is a reconciled residual, not a successful direct project query, because Vercel rejects querying the deleted project by ID.

The 53 retained projects together recorded just 1.913 GB hours recently. The largest retained contributor was `agrail`, at 1.813 GB hours including two timeout events and 3,149 total invocation events. `provider-preferences` followed at 0.0674 GB hours and 767 invocation events. `master-clean-app` recorded 0.0115 GB hours and 59 invocations. The MCC website recorded 0.00977 GB hours and 25 invocations, all successful.

In the previous window the unavailable project also dominated the daily breakdown, at approximately 538.64 GB hours after reconciliation. Five small project queries in that older window could not be completed, so treat that residual as approximate.

### Data transfer

| Project | Recent outgoing bandwidth | Share of recent team total | Previous outgoing bandwidth |
| --- | ---: | ---: | ---: |
| `jedisgames` | 9.375 GB | 65.4 percent | No rows returned |
| `permian-sand-movers` | 1.969 GB | 13.7 percent | 1.180 GB |
| `agrail` | 1.312 GB | 9.2 percent | 0.006 GB |
| `master-clean-hq` | 0.967 GB | 6.7 percent | 0.813 GB |
| `the-provider-system-website` | 0.267 GB | 1.9 percent | 0.245 GB |
| `adrians-custom-services` | No rows returned | Not calculated | 5.112 GB |

`melinvoice` used about 0.590 MB recently and `health-tracker` about 1.386 MB. No recent request rows were returned for `nagle-crm` or `upcrm`. Removing those projects would not address the measured function problem. Their low traffic is not evidence that they are safe to remove.

### Builds and previews

`jedisgames` has 19 retained deployment records in the recent window, followed by six for `agrail`, five for `master-clean-hq`, and four each for `provider-preferences` and `nagle-crm`. The retained history does not show a monthly deployment explosion that explains the execution usage. Git deployment creation remains enabled on connected projects, so unneeded pushes and previews can still be reduced after checking each project's workflow.

## Causes and fixes

1. **Continuous Agent Mission Control API work was the dominant issue.** Repository code contains a worker loop with a default 10 second polling interval, regular health checks, heartbeats, and channel reads. Its frontend also contains 15 second status refreshes and five second dashboard refreshes. The Vercel configuration routed all API paths to one Python function with a 300 second maximum duration. These are concrete mechanisms for persistent function traffic. The historical metrics prove the project attribution and timing; the available evidence does not prove which individual route or caller produced each invocation. The project was already deleted on October 1, and subsequent team execution is much lower. Keep its existing replacement runtime intact. Before any future Vercel redeployment, remove unnecessary idle polling, add pause and backoff behavior, combine status reads, and avoid running a persistent worker through frequently invoked serverless endpoints.

2. **A scheduled job in another project is failing.** `concierge-nurse-society` has the only nonempty cron definition in the 53 current project configurations: `/api/process-sequences` at `0 8 * * *`. The recent window contains 30 uncached requests and 60 error invocation events for that project, totaling only 0.00496 GB hours. This is not the usage cap driver. Review its runtime error and fix the job if it is still needed. If it is obsolete, get John's approval before disabling it. No cron was changed.

3. **`agrail` has a smaller function issue worth reviewing.** It recorded 614 error events and two timeout events recently, with 1.813 GB hours total execution. Check the failing route and its upstream calls, add bounded timeouts and caching where appropriate, and stop repeated retries after a persistent failure. This project was not changed.

4. **Large static payloads are a secondary optimization opportunity.** `jedisgames` is the leading bandwidth project, although the whole team remains well below 100 GB in the measured outgoing bandwidth. Review its largest asset paths, compression, browser caching, and unnecessary downloads before making changes. The MCC repository also contains `public/img/blog.images/blog1.jpg`, a 7,536,640 byte JPEG. Compress or replace its delivery variant if referenced, while retaining the original asset. That file alone does not establish how much traffic it received.

5. **MCC is not using Next.js image optimization.** The production project is Vite, and the inspected MCC source contains no `next/image` usage, recurring client polling, or cron definition. The team's Next.js presets are `agrail`, `master-clean-app`, and `v0-home-stage-room-staging`. If the dashboard identifies image transformations as another full allowance, examine those projects first, restrict image sizes and remote sources, cache immutable assets, and precompress fixed marketing images during the build. Their presets alone do not prove excessive transformations.

6. **Bots are not proven as the main cause.** The daily traffic pattern and known polling code support automated internal traffic as the principal function explanation. No retained route, user agent, or IP breakdown was available to distinguish crawlers conclusively. Use dashboard request paths and firewall events before adding a rule. Do not block legitimate Google indexing merely because traffic is automated.

## Whether Pro is needed

The measured function problem has already fallen sharply after the Agent Mission Control project disappeared. There is no evidence here that the MCC marketing website needs an upgrade for compute capacity. Static guides and city pages should add no image transformation work and require no function execution merely to render.

There is a separate plan requirement: Vercel's published terms reserve Hobby for personal, noncommercial use and require Pro or Enterprise for commercial use. MCC advertises paid business services and captures commercial leads, so it belongs on Pro under those terms even if usage stays small. [Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)

The current public Pro price starts at $20 per month and includes $20 of usage credit. This is not a guarantee that 53 projects will always total exactly $20. Check the applicable account pricing and spend controls before upgrading. No billing action was taken. [Vercel pricing](https://vercel.com/pricing)

## What still needs the correct dashboard session

The connected Vercel plugin returned no teams. The normal authenticated CLI can inspect the correct MCC team, but `vercel usage` returns `Costs not found (404)` for its billing charges. The legacy usage API supplies the counters above. A temporary invocation of CLI version 65 confirmed that modern transfer, Active CPU, and image metric queries are blocked by an Observability Plus requirement. No add on was purchased and the installed CLI was not upgraded.

The available Chrome dashboard was signed in as `management@nagleparking.com`, rather than the MCC owner. Account access was stopped under the repository account policy. Once John signs into the MCC owner account in the dashboard, read its usage cards for the rolling 30 day view and previous custom window, including exact Fast Origin Transfer, image source counts, transformations, Active CPU, Provisioned Memory, and any full allowance badge. The dashboard can supply this without purchasing Observability Plus solely for the audit.

## Evidence and reproducibility

1. `vercel whoami --format json` and `vercel teams ls --format json` establish the authenticated owner and scope.
2. `vercel project inspect master-clean-hq --scope jxwayne890s-projects --non-interactive` establishes the exact website target.
3. `GET /v2/teams/team_ijL6I1f7BoKqxGHB4grAxAI0` establishes Hobby, owner membership, and the null billing period.
4. `GET /v10/projects?teamId=team_ijL6I1f7BoKqxGHB4grAxAI0&limit=100` supplies the 53 project inventory, framework presets, and cron definitions.
5. `GET /v2/usage` with `type=requests` or `type=builds`, ISO `from` and `to` parameters, the explicit team ID, and optional `projectId` supplies the historical counters. Sum successful, error, and timeout GB hour fields for duration. Sum all invocation outcome fields for invocation events. Sum hit and miss counters for legacy request counts.
6. `GET /v6/deployments` with the same team, timestamp bounds, and pagination supplies retained deployment counts.
7. `GET /v3/events` filtered to `types=project-delete` confirms the October 1 Agent Mission Control deletion. The local Vercel project link resolves its historical project ID.
8. Read only GitHub source inspection of `JxWayne890/agent-mission-control` confirms the worker polling defaults, frontend refresh timers, and Python API configuration. Source code is supporting evidence for the mechanism, not a substitute for route level runtime logs.

Companion data: `vercel-usage-projects-20261021.csv`. It contains numeric usage and project identifiers only, with no secrets or lead information.
