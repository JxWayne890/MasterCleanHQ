# Master Commercial Clean website

This repository is the Master Commercial Clean public website. Preserve its Vite platform and static guide generator.

## Writing and business facts

Do not use dash punctuation in user facing prose. Preserve punctuation required by code, URLs, file paths and identifiers. Use only confirmed business facts. Master Commercial Clean is the trade name of Master Clean HQ LLC, serving San Angelo and surrounding West Texas directly. Do not invent prices, statistics, reviews, certifications, clients or referral partners.

## Guide publishing permission

On October 21, 2026, John explicitly selected automatic publication of future guides after checks pass, once the initial guides section is approved and live. Codex and Grokbot may use this standing permission for new guide content. It does not release the pending redesign or authorize other code, design, city network, billing or DNS changes.

Read `docs/GUIDE_PUBLISHING.md` before writing or publishing a guide. Both assistants use the same Markdown files and workflow. The existing weekly writer is the Codex thread heartbeat, Wednesday at 9 AM in America/Chicago. Do not add a second weekly writer in Grokbot without coordinating ownership of that schedule.

Before the initial release, keep guides on the feature branch and report the launch dependency. After the initial release, start from the current verified production branch in a separate checkout. Run `npm run guides:check`, the build, lint and tests, then `npm run guides:release-check -- --base origin/main` from the clean committed checkout. Publication permission covers only added files in `content/guides/` and the associated `GUIDES_BACKLOG.md` update. Never deploy this entire preview checkout as a weekly content update.

Verify the live article, `/guides` and sitemap before calling a guide published. A local file, successful commit or preview URL is not proof of live publication. If a check or deployment fails, keep the draft and report the failure without claiming success.

## Hosting and accounts

Use the existing GitHub account routing. Do not switch authentication accounts. The repository is `JxWayne890/MasterCleanHQ`; Vercel project `master-clean-hq` belongs to scope `jxwayne890s-projects`. Production uses `mastercleanhq.com` and `www.mastercleanhq.com`, with Git production branch `main`. Verify these targets before any release. Do not substitute another host or change billing, DNS or project membership.
