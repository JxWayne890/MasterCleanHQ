# Shared guide publishing workflow

This is the common workflow for Codex, Grokbot and an assistant acting on a direct request from John. Adding one Markdown file creates a permanent article URL. The existing generator also adds the article to the guide index and sitemap, and supplies metadata, Article schema, contents links and the quote destination.

## Permission and initial launch

John authorized future guides to publish automatically after checks pass on October 21, 2026. That permission starts after the initial guides section has been approved and released. The website redesign and guides feature are currently on a preview branch. Do not treat permission for future articles as approval to deploy that branch.

The initial release must put this workflow, its validation commands and the guide generator on the production branch. Before automatic publication, confirm all of the following:

1. The initial release was explicitly approved and completed.
2. The current `origin/main` contains this document, `content/guides` and both guide check commands.
3. The live `/guides` page is the new section, not a missing page, an old route or a generic homepage fallback.
4. The Vercel project still links `JxWayne890/MasterCleanHQ`, production branch `main`, to the MCC domains. Its current production commit agrees with the base used for this update. If a newer deployment or branch change appears, refresh the base and recheck before publishing.

The local release guard checks repository readiness and the content scope. It cannot establish John's launch approval or the live deployment state. Those remain required operator checks.

## One writer and one source

The existing Codex heartbeat runs Wednesday at 9 AM in America/Chicago. It owns the weekly article. This is a local scheduled job, so the machine, application, repository and authenticated accounts must be available. Grokbot can use this same workflow for a requested guide, or take over the weekly job after schedule ownership is explicitly moved. No separate Grokbot schedule has been configured by this change. Do not create two weekly publishers.

Serialize writers using an atomic directory lock at `mcc-guide-publishing.lock` inside the repository's Git common directory. Determine that directory with `git rev-parse --path-format=absolute --git-common-dir`, then use `mkdir` to acquire the lock before choosing a topic. Record the owner and time inside it. If it already exists, report that another run owns publication. Do not remove an unexplained existing lock. Release your own lock in cleanup after completion or failure. This coordinates local checkouts only; a remote branch moving still requires a fresh check.

Fetch the production branch and work in a fresh isolated checkout based on its current commit. Preserve unrelated work in the redesign checkout. Use the existing repository account routing and commit identity. Never reset or force push the production branch.

Check both the production source and the live guide index for the same slug, topic and search intent. Scheduled retries must reuse or verify an existing article instead of producing another version. Check whether the weekly job has already completed its article for the current local calendar week. A direct request may add another distinct guide in the same week.

## Write the guide

Start from `docs/templates/guide.md`, placed at `content/guides/your-specific-slug.md`. The filename supplies the URL `/guides/your-specific-slug`. Replace every template value. Do not publish the template itself.

Choose the highest hiring intent unfinished topic in `GUIDES_BACKLOG.md`, or the topic John requested. Write 900 to 1500 useful words with a real date, specific description, category, practical `##` sections and at least one relevant existing guide in `related`. Related links are explicit, so an older article does not automatically gain a return link to the new one. Keep future dated and unfinished drafts outside `content/guides`, since every file there is public at the next build.

Use confirmed MCC facts and helpful San Angelo or West Texas context. Research current primary sources for specialized safety, medical, legal or regulatory statements. Avoid unsupported prices or numerical claims, invented reviews, certifications, clients, partner names and promises of search ranking. Use honest scope factors instead of fabricated price ranges. Keep editorial notes in HTML comments and remove incomplete public placeholders before publication. Follow John's writing preference without dash punctuation in prose.

End with the existing quote link:

```markdown
[Get a free quote from Master Commercial Clean](/contact).
```

The existing quote form remains responsible for lead delivery. Writing a guide does not change its destination or establish email delivery.

## Validate and commit

Run these commands in the isolated checkout after writing the article:

```bash
npm run guides:check
npm run build
npm run lint
node --test test/*.test.*
```

The guide check rejects invalid metadata, impossible calendar dates, duplicate titles, broken or duplicate related references, out of range article length, a missing closing quote link and collisions with retained cost guide URLs. The content tests inspect the rendered article, schema, contents links and sitemap. Read the finished article for factual quality and duplicate intent as well; automated checks cannot establish either.

Mark the corresponding backlog item complete with its slug. Commit only the new guide file and the backlog update. Then run:

```bash
npm run guides:release-check -- --base origin/main
```

The release check requires a clean checkout, an ancestor base that already contains the guide publishing setup, and a diff consisting only of added guide Markdown files and an optional modified backlog. It does not publish anything. Do not include application code, styles, templates, images, deleted files, renamed pages, city data or other pending changes under this permission. Those need their normal review and release process.

## Publish and verify

Refresh the remote branch immediately before publishing. If the base changed, replay the article on the new base, rerun the checks and inspect the scope again. A normal push must fail rather than overwrite concurrent changes.

After the initial release and all checks, a normal fast forward push of the checked content commit to the verified production branch is authorized by John's standing guide permission. The existing Vercel Git integration deploys that branch. Do not also run a duplicate CLI deployment. Wait for that commit's deployment to reach READY and confirm that it owns the MCC production domains before declaring success. Do not change project settings or DNS to make a failed deployment appear successful.

Verify these public results after deployment:

1. The new canonical article returns HTTP 200 with its expected title, article text, canonical URL, Article schema and final quote link. Reject a homepage fallback or Vercel error response.
2. `/guides` links to the new article.
3. `/sitemap.xml` contains the new canonical URL, and `/robots.txt` still points to the sitemap.
4. The existing `/contact` destination still resolves to the quote form.

Report the topic, live URL, commit, checks and deployment result to John. Keep the receipt at `guide-publication-receipts/SLUG.json` inside the Git common directory, outside the source tree. Include `slug`, `topic`, `weeklySlot` (the Monday date for a scheduled run, or null for a direct request), `commit`, `liveUrl`, `deploymentId`, `checks` and `verifiedAt`. Write a successful receipt only after all live checks pass. On retry, verify the matching receipt against the actual live page. If deployment or verification fails, keep the committed draft, report the actual status and resume the same article on retry. Do not change the backlog to a false claim of successful publication. Sitemap inclusion helps discovery but does not guarantee Google indexing.

This workflow adds no website cron, per visitor AI call, database request or new hosting service. It uses one ordinary site build for a successful guide update. Static pages still use bandwidth when people visit them.

## Platform reference and configuration evidence

The Vercel project was inspected on October 21, 2026: `master-clean-hq`, ID `prj_NArudA2LATO6B5HXZYhjA90nVigC`, scope `jxwayne890s-projects`, Git repository `JxWayne890/MasterCleanHQ`, production branch `main`, domain auto assignment enabled and Git deployment creation enabled. Current production was still deployment `dpl_6MxTPMvzZX3T5Yo85ALehWVe2J91`, commit `532ffd481dbffb4ef741894522eed4a54a912e22`. These are observations, not permanent configuration guarantees.

Vercel documents branch based automatic production deployment in [Deploying Git Repositories with Vercel](https://vercel.com/docs/git). Recheck actual account and project configuration at release time. The first automatic publication cannot be tested live before the initial feature release is approved.

Setup verification on October 21, 2026: all five current guides passed `guides:check`, the static build completed with 302 existing pages and 11 resource pages, lint passed and all 57 automated tests passed. Release tests include isolated Git repositories for accepted content changes and rejected unrelated changes. The actual preview branch was correctly refused by the release guard. The existing weekly automation was updated in place and confirmed ACTIVE with the initial launch gate and future automatic publication instructions. No production push or deployment occurred during this setup.
