# MCC guide publishing

John requested a Groku owned cloud routine that writes guides and publishes through a hosted MCP while the Mac is off. Markdown remains the source of truth. The website remains static.

## Permission and launch status

On October 21, 2026, John authorized automatic future guide publication after checks pass, once the initial guides section is explicitly approved and live. He then explicitly approved the initial production release. Commit `4e1aa7563904c963cc62fd556f6a95fc525b0625` went live through the existing Vercel Git integration, and public verification confirmed all five guides, catalog, metadata, sitemap, robots, quote destination and partner pages. The future guide permission is active. Both gates are now enabled. The hosted connector, an actual Groku publication and an unattended cloud publication passed. Seven guides are live.

The initial release was verified with both gates disabled. Activation was then completed in this order:

* The Production server variable `MCC_GUIDES_PUBLISHING_ENABLED` was set to `true`, then source `597659b674f0a713a8209c09290eda30d7ba3a5a` was deployed and verified before the GitHub gate changed. Existing deployments do not receive environment edits.
* GitHub repository variable `MCC_GUIDES_LAUNCH_APPROVED` was set to `true` after that production build passed public checks. The worker cannot commit while this final gate is disabled.

The publisher also verifies trusted production source and the live guides section. The live publication manifest commit must match production `main` before a new guide starts. A feature release that is missing or still deploying cannot be bypassed by enabling the flags.

## Cloud flow

1. Groku checks `list_guides` and chooses a distinct unfinished topic from `GUIDES_BACKLOG.md`, or John's requested topic.
2. Groku saves its complete draft and one UUID, then calls `publish_guide` at `https://www.mastercleanhq.com/api/mcp` with its dedicated bearer credential.
3. The server validates the payload and dispatches only `.github/workflows/mcc-guide-publish.yml` on `main` in `JxWayne890/MasterCleanHQ`.
4. The trusted worker preserves the draft, checks current production, runs the guide checks, build, lint and tests, then commits only one new `content/guides/SLUG.md` file. A changed base or unrelated diff fails safely.
5. The existing Vercel Git integration builds that commit. The static generator creates the article, index entry, metadata, Article schema, contents links, sitemap and publication manifest together. Do not create another CLI deployment.
6. After public verification, the worker sends a bounded IndexNow notification for the new article, updated `/guides` index and `/sitemap.xml`, then saves the outcome separately in its receipt. Search notification failure does not reverse a verified publication.
7. Groku polls `get_publication_status`. Only `published` means the workflow succeeded, committed source matches, and the live article, index, manifest, schema, sitemap, robots and quote destination passed verification. Then report the live URL.

The only tools are `publish_guide`, `get_publication_status` and `list_guides`. Inputs cannot select another repository, branch, path or command. Existing guide slugs cannot be replaced. The route uses function invocations when called. Successful publication uses a site build and a GitHub Actions run. No cron or AI calls are added for website visitors. Monitor free plan allowances, and remember static visits still consume bandwidth.

## Article requirements

Write 900 to 1500 helpful words, with a real current or past date, a specific description, category, at least two `##` headings and one to six existing related guide slugs. Compare existing topics and search intent first. Follow John's preference without dash punctuation in prose.

Use confirmed facts. Master Commercial Clean is the trade name of Master Clean HQ LLC, serving San Angelo and surrounding West Texas directly, including schools, offices and commercial buildings. Do not invent prices, statistics, reviews, certifications, clients, partners or search ranking promises. Research current primary sources for specialized safety, medical, legal or regulatory statements. Explain scope and cost factors when reliable prices are unavailable.

Send plain Markdown without frontmatter, HTML, images, internal notes or unfinished placeholders. The server supplies canonical frontmatter and publication metadata. End with:

```markdown
[Get a free quote from Master Commercial Clean](/contact).
```

The existing form controls lead delivery. Publishing does not prove email configuration or delivery. Verify notifications separately before declaring the complete website launch ready.

`publish_guide` takes:

| Field | Requirement |
| --- | --- |
| `requestId` | One UUID saved with the article draft and reused for retries |
| `slug` | Unique lowercase URL slug, letters, digits and hyphens |
| `title` | One trimmed line, 10 to 160 characters |
| `description` | One trimmed line, 40 to 320 characters |
| `date` | Real `YYYY-MM-DD` date, never in the future |
| `category` | One trimmed line, 2 to 80 characters |
| `related` | One to six distinct existing guide slugs, excluding this guide |
| `markdown` | Complete body and closing quote link |

Never generate a new UUID after an uncertain response. Reuse the same request and unchanged content. Changed content under an existing UUID is refused. A completed request verifies its existing article instead of duplicating it.

`get_publication_status` takes `{ "requestId": "original-UUID" }`. Poll with a reasonable delay while queued, running or `verification_pending`. A failed request must retain its draft and report the actual failure. After addressing a transient cause, retry the same payload deliberately. The publisher can rerun only the original trusted job, after checking its identity and state, with at most three total attempts. Active and successful jobs are never rerun. Do not loop indefinitely, change slugs to evade a conflict or call an accepted request published. GitHub artifacts preserve the submitted Markdown and receipt for 90 days. Groku must retain the draft and UUID too.

The cloud worker changes only the new guide file. Reconcile completed backlog entries separately using verified live slugs. Do not broaden the publication commit to change code or other content.

## Credentials and setup

Use authorized GitHub and Vercel sessions for setup. JJ Vault stores credentials for setup and recovery. Weekly cloud execution uses its saved private connector settings, not a helper on the Mac. Never use account passwords or an extracted interactive CLI OAuth token as an application credential.

| Setting | Location and purpose |
| --- | --- |
| `MCC_GUIDE_PUBLISHER_TOKEN` | Vercel server secret, dedicated bearer of at least 32 characters. Same value only in Groku's private Authorization header. |
| `MCC_PUBLISHER_GITHUB_TOKEN` | Vercel server secret only. Fine grained credential for `JxWayne890/MasterCleanHQ`, Actions write and Contents read. No Vercel token needed. |
| `MCC_GUIDES_PUBLISHING_ENABLED` | Vercel gate, disabled until approved launch. |
| `MCC_GUIDE_PUBLISHER_ALLOWED_ORIGINS` | Optional exact comma separated browser origins, only if the observed client sends Origin. No wildcard. Cloud requests without Origin work. |
| `MCC_GUIDES_LAUNCH_APPROVED` | GitHub repository gate, disabled until approved launch. |
| `MCC_GUIDE_COMMIT_NAME` | GitHub repository variable with the existing verified owner commit name. |
| `MCC_GUIDE_COMMIT_EMAIL` | GitHub repository variable with the existing verified owner email. Vercel Hobby must recognize the author as authorized. |

The dedicated MCP key is stored in JJ Vault, Personal, as `MCC Guide Publisher (Groku)`. Groku uses its own `grok` connection for authorized setup retrieval. Store the repository token separately as `MCC Guide Publisher GitHub`. Never put values in chat, source, tool output, artifacts, screenshots or browser variables. Use private stdin, or a mode `0600` temporary file inside a mode `0700` directory and delete it afterward. Preview and production require different keys. Record credential expiry and replace it privately before expiration.

Connect Groku to the canonical HTTPS endpoint with the private header `Authorization: Bearer <dedicated credential>`. Complete required app access confirmation. Do not disable Vercel deployment protection for previews. Use supported Vercel authenticated tooling to test them.

These prerequisites passed on October 21, 2026: remote MCP initialization and all three tools, one actual Groku publication, and one unattended cloud routine publication independent of the Mac. Neither run required an approval or had a safety block. Preserve the same checks for future connector or worker changes.

| Proof | Request and production commit | Live article |
| --- | --- | --- |
| Direct Groku publication, workflow `39672649500` | `762513b0-4215-41bb-af78-7ba78fcfafab`, commit `397eaab69205c07c9b2e1bc131776098259c0183` | [Changing janitorial companies](https://www.mastercleanhq.com/guides/replace-janitorial-company-without-service-gap) |
| Unattended cloud run, workflow `39674091224` | `95f6a089-01ec-45f4-9d15-96b11e2df364`, commit `0de9533f906ab354bf3a0fd1c1b2a690cea6cab9` | [Requesting a commercial cleaning quote](https://www.mastercleanhq.com/guides/request-commercial-cleaning-quote-san-angelo) |

The one time test was scheduled for 3:49 PM Central, started at 3:51 PM and published around 3:53 PM. Independent exact source and public verification passed at 20:54:57 UTC. Groku reported only its cloud connector and read only sources were used, without the Mac, JJ Vault or Codex. The one time routine was retired after completion.

## One weekly owner

Groku owns the active cloud routine `weekly-mcc-guide-publisher`, every Wednesday around 9 AM in `America/Chicago`. Its first recurring run is October 28, 2026. The scheduler allows a 15 minute timing window, and reported the first slot as 8:50 AM Central. The app routine list confirms it is on. The former Codex heartbeat `weekly-mcc-cleaning-guide` was paused and its configuration read back before the Groku routine was created. Never leave two weekly writers active.

Retries reuse the saved UUID and draft. Check whether a guide already completed for the current local calendar week. A direct request may add another distinct guide that week. GitHub concurrency serializes worker runs, but a canceled queued attempt still needs status review and a deliberate retry.

Routine instruction:

> Every Wednesday at 9 AM America/Chicago, choose the next distinct high hiring intent MCC topic from the repository backlog after checking live guides. Follow docs/GUIDE_PUBLISHING.md. Write 900 to 1500 helpful words using confirmed facts and current primary sources where needed. Save the draft and one request UUID. Publish through the MCC Guide Publisher MCP only. Poll the same request until verified published or failed. Report the live URL only after published, otherwise preserve the draft and report the failure. Do not modify website code, design, city pages, billing or DNS. Do not create duplicate guides or another weekly schedule.

## Manual fallback

After approved launch, fetch verified production into a fresh isolated checkout. Coordinate with the cloud owner first. Acquire an atomic `mcc-guide-publishing.lock` directory inside the Git common directory, record ownership and time, and remove only your own lock in cleanup. Never remove an unexplained lock. This lock cannot coordinate a remote worker by itself.

Use `docs/templates/guide.md`, adding one `content/guides/SLUG.md` file. This manual path may also update its `GUIDES_BACKLOG.md` entry. Keep drafts outside `content/guides`, since every file there is public after a build.

```bash
npm run guides:check
npm run build
npm run lint
node --test test/*.test.*
```

Read the finished article for factual quality and duplicate intent. Commit only the guide and optional backlog entry, then run `npm run guides:release-check -- --base origin/main` from the clean checkout. Refresh the remote base before a normal fast forward push. If it moved, replay and rerun checks. Never force push or deploy this entire preview checkout as a content update.

Verify the exact commit serves the production domains and inspect article text, title, canonical URL, schema, quote link, index, sitemap, robots and contact form. Keep a receipt outside source with slug, weekly slot or request, commit, URL, checks and verification time.

## Search engine discovery

Every static build updates the same public sitemap at `https://www.mastercleanhq.com/sitemap.xml`, and robots links to it. Google and Bing can discover new guides there without a separate sitemap per article. Crawling, indexing and ranking are not guaranteed.

The trusted worker calls `lib/guide-publishing/indexnow.mjs` only after the new article passes live verification. It verifies the existing public ownership proof file, then submits the new article, `/guides` and `/sitemap.xml` to the official IndexNow endpoint. Each network call has a two second deadline and each phase has at most two attempts. The key is a public ownership proof, not a private account credential. No new Vercel function, cron or visitor script is needed.

The receipt records `accepted` for HTTP 200, `validation_pending` for HTTP 202, or `retry_required` with a safe reason. Neither acceptance nor pending validation proves indexing. Failure preserves the published guide. The worker saves detailed outcome, HTTP status, attempts and a safe reason in its existing receipt. It also emits a fixed enum as workflow step metadata. After its existing source and public checks, `get_publication_status` reads that exact successful run attempt and returns `indexNow.status`. It never sends a notification during polling. Older runs without the metadata return `not_recorded`; unreadable or invalid metadata returns `unavailable`. Neither state changes a verified `published` result. No extra GitHub permissions, archive downloads or credentials are required.

Follow up on the notification separately, without republishing the guide or changing its request ID. The older manual bulk script remains separate and is not called by weekly publication. A direct live check using the new helper verified the public proof file and received HTTP 200 from IndexNow for both new Groku articles on October 21 at 20:58 UTC. This checks provider acceptance for the two URL hook that was live at that time. The three URL update and MCP status exposure are a preview candidate pending John's production approval. Their worker integration tests cover notification and metadata output failure isolation.

Google Search Console and Bing Webmaster sitemap registrations are separate account checks and are not confirmed. The MCC Google session was expired, the available JxWayne Google account had no properties, and Bing was signed out. Do not create properties, change DNS, or claim registration until the correct business accounts are available.

### Live sitemap audit

The October 21 live audit found 312 unique canonical URLs. It checked all 25 guide routes (seven Markdown articles plus existing cost guide routes), all 230 city routes (two partner cities, 57 direct location pages and 171 city service pages), and the three resource hubs. No expected URL was missing or duplicated. The public content catalog matches all seven Markdown guides and both partner city files. Robots references the canonical sitemap. The existing static builders already update these automatically, so no sitemap or robots generation change was needed.

IndexNow reaches Bing and other participating engines. Google is not listed in the official participating engine registry checked October 21. Google's discovery path remains the crawlable index, internal links and sitemap. Neither route guarantees a crawl time or indexing. Do not add Google's restricted Indexing API for ordinary cleaning articles.

### One time account submission steps

Submission status is unknown, not confirmed absent. The latest browser check found no MCC property in the current personal Google account, an expired `john@mastercleanhq.com` Google session, and a signed out Bing session. No accounts or properties were created, no access was expanded, and no DNS was changed.

For Google:

1. Open [Google Search Console](https://search.google.com/search-console) and sign into the account that owns MCC's verified property.
2. Select the existing `mastercleanhq.com` domain property or `https://www.mastercleanhq.com/` URL prefix property. If it is missing, stop and confirm the owner account before adding a property or changing verification.
3. Open **Indexing**, then **Sitemaps**.
4. In **Add a new sitemap**, enter `https://www.mastercleanhq.com/sitemap.xml`. If the URL prefix is already shown before the input, enter only `sitemap.xml`.
5. Click **Submit**. Confirm the sitemap row says **Success** and review its last read time. A fetch error needs investigation before claiming submission succeeded.

For Bing:

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters/) and sign into the account that owns MCC's existing verified site.
2. Select the MCC site. If it is absent, stop and confirm ownership before creating an account, importing a property or changing DNS.
3. Open **Sitemaps**, then **Submit sitemap**.
4. Enter `https://www.mastercleanhq.com/sitemap.xml` and submit it. Review its processing result and last crawl time, resolving any reported fetch or parse error.

Submit the production sitemap, never a protected preview URL. Both accounts keep using the same sitemap as new guides are added. A new sitemap submission is not required for every article. Google recrawls submitted sitemaps independently of individual page crawling. [Google Sitemaps report](https://support.google.com/webmasters/answer/7451001), [Bing sitemaps](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed), [IndexNow participating engines](https://www.indexnow.org/searchengines.json).

At release verify `JxWayne890/MasterCleanHQ`, `main`, Vercel `master-clean-hq`, scope `jxwayne890s-projects`, and MCC domains. Test that an owner authored worker commit actually triggers the Vercel Git integration. Do not substitute hosting or change DNS, billing or membership.

References: [MCP remote servers](https://modelcontextprotocol.io/docs/develop/connect-remote-servers), [GitHub dispatch](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event), [Vercel Git deployments](https://vercel.com/docs/git), [Google sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [IndexNow protocol](https://www.indexnow.org/documentation).
