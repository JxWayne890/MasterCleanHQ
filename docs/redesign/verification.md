# MCC redesign verification

Reviewed October 21, 2026. This release is for preview review. Production remains at the existing deployment until John approves promotion.

The homepage now leads with commercial cleaning in San Angelo and West Texas, a prominent call action, a free quote alternative, and the four client logos John identified. Shared navigation, contact presentation, and footer have been redesigned. The quote receiving contract, CRM persistence, static guides, and referral network remain in place.

## Automated checks

The production build, full ESLint check, and all 30 content, intake, quote API, and homepage regression tests passed after the final code edits. All 302 React pages prerendered successfully. The static resource builder added 11 pages. The resulting sitemap contains 310 public URLs.

The expert verification receipt is `/Users/john/Documents/Codex Expert Library/_verification/e8959426-d03c-4d3a-b47b-1e60db41c2e4.json`. Its scoped checks passed at 15:58:55 UTC. The copy review used the previously read Joanna Wiebe source library, and the visual direction used the previously read Charli Marie library. These checks verify the implementation, not a measured conversion increase.

## Browser observations

Chrome desktop: inspected the hero, primary call action, quote alternative, illustration disclosure, and all four logos. Clicked Services and confirmed its rendered page after the new lazy route transition. No browser errors or warnings appeared in the observed session.

Chrome at 390 by 844: inspected the hero and persistent contact bar. The mobile menu opened, Escape closed it, and the quote link navigated to the existing contact anchor. Empty form submission focused the name field and identified all six required controls as invalid without sending a lead. Once scrolling completed, the focused field was visible. The document client width and scroll width were both 380 pixels in the browser viewport observation. No completed image requests failed.

Chrome at 320 by 740: the heading and actions wrapped within the narrow layout. Document client width and scroll width were both 310 pixels. The call action remained available in the persistent bottom bar.

A synthetic submission against the local static preview, which has no live API proxy, exercised the form failure state. It displayed an explicit unconfirmed save message, retained the entered name, and reenabled submission. No CRM record or email was created by this local check.

Screenshots: [Desktop homepage](homepage-desktop.jpg), [Mobile homepage](homepage-mobile.jpg). Deployed preview smoke results are recorded when complete.

## Transfer and hosting

The initial JavaScript entry fell from approximately 1,052 KB to 242 KB, or 77 percent smaller. Its gzip size is approximately 77 KB. Secondary page content and Framer Motion are separate chunks. The existing synchronous static rendering still produces canonical page content.

The conceptual hero has three static WebP sizes, approximately 70, 131, and 190 KiB. The four official client logo files total approximately 61 KiB. The social image is separate from the hero request. There is no new image optimization endpoint, polling, cron job, or server function for the redesign.

Deployment target verified through Vercel CLI: `jxwayne890s-projects/master-clean-hq`, project `prj_NArudA2LATO6B5HXZYhjA90nVigC`, team `team_ijL6I1f7BoKqxGHB4grAxAI0`.

## Remaining dependencies

The referral and internal quote notification setup still lacks `NETWORK_RESEND_API_KEY` and `NETWORK_FROM_EMAIL`. Durable referral saving was verified in the earlier preview; email delivery to John is not verified. The redesigned quote form retains the existing CRM API and does not claim a successful save without a submission identifier.

This is not a full assistive technology audit, field Core Web Vitals study, analytics receipt, or an external social crawler test. Production promotion and a complete notification delivery test remain pending.
