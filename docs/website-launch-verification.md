# Website launch verification

Prepared September 6, 2026. Production deployment is pending account access and target verification.

## Changes

The homepage redesign from `/Users/john/.codex/worktrees/76e4/MasterCleanHQ-main` is incorporated, including its generated hero image, responsive navigation and service sections. Homepage and contact page now share the quote form. Application code is identical to `origin/main` at `df188ed1d6ece67b639574bdc63c43b32cdbe4fe`, including the Spanish option.

The quote form uses the existing public endpoint `https://siipmaubrftdkbttsnbu.supabase.co/functions/v1/website-lead-intake`. No secrets are bundled, and no database migrations, permissions or Edge Functions were changed. The public endpoint is explicit in `src/lib/quoteIntake.js`, so quote submission does not depend on a new deployment environment variable.

## Direct verification

1. Downloaded and inspected the deployed intake function (version 10) and queried the live `public.submit_website_lead` definition. It atomically creates a lead, quote and activity, applies duplicate protection and rate limiting. Anonymous and authenticated roles cannot execute this RPC. The service role can.
2. Submitted the homepage form through Chromium at `http://127.0.0.1:5173`. It returned HTTP 200 and created lead `4dbc8fdb-3b29-4576-8f71-e5e34bd62c33`, email `codex+quote-cac6-20260906@example.com`, with one quote and one activity. Verified name, business, phone, email, city, facility, service, message, source and source page directly in the database.
3. Submitted the same contact details through `/contact`. The endpoint returned the same record ID with `duplicate: true`. There remained exactly one quote and one activity.
4. Deleted only the exact test lead using its UUID, email and full name. Database cascade removed its quote and activity. Verified all three counts were zero.
5. Browser checks passed for empty required fields, invalid phone, rejecting a simulated HTTP 200 response without a durable UUID, and preserving entered values on error. Unit tests additionally cover server errors, rate limits, invalid JSON, network failure, timeout and duplicate responses.
6. Desktop and mobile visual checks passed, including the estimate anchor, mobile navigation focus, Escape dismissal and body scroll restoration. Production output hydrated without console errors. Screenshots are in local `output/playwright/`.
7. Application checks covered the Spanish toggle, starting the form, required validation, draft restoration and switching language without losing values. Language returns to English on reload, which is existing application behavior. The test browser draft was cleared. No employment application record was created. A request without required fields to the live employment endpoint returned HTTP 422.
8. `npm test` passed all 5 tests. `npm run build` prerendered 302 pages with zero failures. `git diff --check` passed. The changed JavaScript files passed ESLint checks for undefined variables, unused variables and React hook rules with an explicit temporary command configuration.

## Deployment gate

The currently authenticated Vercel user is `noahescalante`, with access only to `noahescalantes-projects`. This is not the MCC production owner. The existing website project link identifies `prj_NArudA2LATO6B5HXZYhjA90nVigC`, organization `team_ijL6I1f7BoKqxGHB4grAxAI0`, project `master-clean-hq`.

The standalone repository here is `JxWayne890/MasterCleanHQ`. Local platform documentation instead identifies `MasterCleanHQ/master-clean-hq-platform`, root `apps/website`, as canonical for the same production project. The actual Vercel project repository, root directory, build settings, production domain and environment must be read from the authenticated owner account before publishing. Do not assume either source is the current deployment source.

The live public website currently includes both `VITE_APPLICATION_INTAKE_URL` and `VITE_APPLICATION_PORTAL_URL` pointing to project `siipmaubrftdkbttsnbu`. Their production values must be preserved and verified through Vercel before deploying. Local verification used these public endpoint values only.

After access is restored, confirm the correct source, apply this change without overwriting unrelated platform changes if necessary, build with the verified production environment, deploy the existing website project, verify live homepage and application behavior, and repeat the marked quote submission and exact record cleanup from the production domain.

## Existing limitations

`npm run lint` cannot run as configured because the repository has no ESLint configuration. Explicit checks on changed files passed. The existing dependency lockfile reports 11 audit findings (1 low, 1 moderate, 9 high), and the build warns about its large JavaScript bundle. Dependencies were not changed by this update. The platform checkout has newer build dependencies, another reason to verify the deployment source before publishing.

The existing intake deduplicates matching contact details within the same UTC date. A later request with those details does not update the original message; the UI explains this and offers the current office number. Existing server error messages contain an older phone number, so the frontend presents its own safe error text and the current office number. No new email notification behavior was added.
