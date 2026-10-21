# MCC guide publishing

John requested a Groku owned cloud routine that writes guides and publishes through a hosted MCP while the Mac is off. Markdown remains the source of truth. The website remains static.

## Permission and launch status

On October 21, 2026, John authorized automatic future guide publication after checks pass, once the initial guides section is explicitly approved and live. This does not approve the pending redesign, city network or publisher release. Those changes are currently on a preview branch. Remote Groku publication and unattended execution have not yet been verified.

Leave both gates disabled until the approved initial release is live:

* Vercel server variable `MCC_GUIDES_PUBLISHING_ENABLED` must equal `true` to accept publication.
* GitHub repository variable `MCC_GUIDES_LAUNCH_APPROVED` must equal `true` before the worker commits.

The publisher also verifies trusted production source and the live guides section. The live publication manifest commit must match production `main` before a new guide starts. A feature release that is missing or still deploying cannot be bypassed by enabling the flags.

## Cloud flow

1. Groku checks `list_guides` and chooses a distinct unfinished topic from `GUIDES_BACKLOG.md`, or John's requested topic.
2. Groku saves its complete draft and one UUID, then calls `publish_guide` at `https://www.mastercleanhq.com/api/mcp` with its dedicated bearer credential.
3. The server validates the payload and dispatches only `.github/workflows/mcc-guide-publish.yml` on `main` in `JxWayne890/MasterCleanHQ`.
4. The trusted worker preserves the draft, checks current production, runs the guide checks, build, lint and tests, then commits only one new `content/guides/SLUG.md` file. A changed base or unrelated diff fails safely.
5. The existing Vercel Git integration builds that commit. The static generator creates the article, index entry, metadata, Article schema, contents links, sitemap and publication manifest together. Do not create another CLI deployment.
6. Groku polls `get_publication_status`. Only `published` means the workflow succeeded, committed source matches, and the live article, index, manifest, schema, sitemap, robots and quote destination passed verification. Then report the live URL.

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

Before enabling the schedule, prove remote MCP initialization and all tools, one actual guide publication through GitHub and Vercel, and a cloud routine run independent of the Mac. If write tools require approval each run, report that observed limitation instead of promising unattended publication.

## One weekly owner

The existing Codex heartbeat temporarily owns Wednesday at 9 AM in `America/Chicago`. The intended replacement is one Groku cloud routine at that time. Prepare and test it, transfer ownership once, then retire the Codex job. Never leave two weekly writers active.

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

Google sitemap discovery happens automatically with each static build. Crawling, indexing and ranking are not guaranteed. Search Console sitemap submission is a separate one time check, not confirmed by this implementation.

At release verify `JxWayne890/MasterCleanHQ`, `main`, Vercel `master-clean-hq`, scope `jxwayne890s-projects`, and MCC domains. Test that an owner authored worker commit actually triggers the Vercel Git integration. Do not substitute hosting or change DNS, billing or membership.

References: [MCP remote servers](https://modelcontextprotocol.io/docs/develop/connect-remote-servers), [GitHub dispatch](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event), [Vercel Git deployments](https://vercel.com/docs/git), [Google sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
