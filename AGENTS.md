# Master Commercial Clean website

This repository is the Master Commercial Clean public website. Preserve its Vite platform and static guide generator.

## Writing and business facts

Do not use dash punctuation in user facing prose. Preserve punctuation required by code, URLs, file paths and identifiers. Use only confirmed business facts. Master Commercial Clean is the trade name of Master Clean HQ LLC, serving San Angelo and surrounding West Texas directly. Do not invent prices, statistics, reviews, certifications, clients or referral partners.

## Guide publishing permission

On October 21, 2026, John explicitly selected automatic publication of future guides after checks pass, once the initial guides section is approved and live. Codex and Grokbot may use this standing permission for new guide content. It does not release the pending redesign or authorize other code, design, city network, billing or DNS changes.

Read `docs/GUIDE_PUBLISHING.md` before writing or publishing a guide. John requested that Groku own a cloud schedule using the hosted MCP publisher. Recurring publication must not depend on the Mac, Codex or JJ Vault. The Codex heartbeat remains the temporary weekly owner until the replacement passes actual publication and unattended execution checks. Transfer ownership once, then retire that schedule. Never run two weekly writers.

John approved the initial production release on October 21, 2026. Commit `4e1aa7563904c963cc62fd556f6a95fc525b0625` went live on both MCC domains, and public verification passed for all five guides, catalog, metadata, sitemap, robots, quote destination and partner pages. The standing future guide permission is active. Enable the server gate in the next verified production build, then enable the GitHub launch gate only after that build is verified. Remote Groku publication and unattended execution must still pass before schedule transfer.

The hosted publisher accepts only one new guide and writes only its Markdown file through the trusted GitHub workflow. Manual fallback publication may also update its `GUIDES_BACKLOG.md` entry, but must start from verified production in a separate checkout and pass all checks and the content release guard. Never deploy this entire checkout as a weekly content update.

Verify the live article, `/guides` and sitemap before calling a guide published. A local file, successful commit or preview URL is not proof of live publication. If a check or deployment fails, keep the draft and report the failure without claiming success.

Keep credentials in JJ Vault and designated private server or connector settings, never source, chat, artifacts or the browser bundle. Groku receives only the dedicated MCP credential. The GitHub credential stays on the server, restricted to this repository, Actions write and Contents read. Do not reuse account passwords or extract an interactive CLI OAuth credential for application use.

## Hosting and accounts

Use the existing GitHub account routing. Do not switch authentication accounts. The repository is `JxWayne890/MasterCleanHQ`; Vercel project `master-clean-hq` belongs to scope `jxwayne890s-projects`. Production uses `mastercleanhq.com` and `www.mastercleanhq.com`, with Git production branch `main`. Verify these targets before any release. Do not substitute another host or change billing, DNS or project membership.
