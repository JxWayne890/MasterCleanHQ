# Website motion update

October 21, 2026. The original three bar hamburger opener is restored. The full screen navy dialog remains, with smoother opening, closing and link sequences. This update also gives the active React page families, static guides and Texas partner pages a shared motion system.

| Interaction | Timing and behavior |
| --- | --- |
| Intro text | CSS entrance over 760 milliseconds, with short staggered delays. The homepage contact actions enter over 620 milliseconds. |
| Section headings and cards | Native Intersection Observer triggers a 760 millisecond reveal once. Group delays stop at 210 milliseconds. Small step targets use 380 milliseconds. |
| Buttons, links and cards | Shared easing, generally 280 to 320 milliseconds, with restrained movement. |
| FAQ and other accordions | Native details semantics with a 440 millisecond height animation. |
| Full screen menu | 640 milliseconds to open and 420 milliseconds to close. |

The shared easing is `cubic-bezier(0.22, 1, 0.36, 1)`. Long article paragraphs and form controls are not hidden for reveals. Targets already visible when the initial server rendered content is scanned are skipped, avoiding a second hide after first paint. Intro animation starts in CSS rather than waiting for React hydration.

The implementation uses browser animation and observer APIs. It adds no dependencies, server functions or polling. Static resource pages load the small shared motion module rather than a React application bundle. Native details content remains usable if animation support is unavailable. Reduced motion preferences suppress movement and settle active animations; this behavior is covered by implementation checks, without a browser preference emulation claim. The relevant platform references are [Element.animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate), [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and [prefers reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

Keyboard focus remains inside the open modal. Escape closes it and returns focus to the opener. Focused reveal targets become immediately readable. Completed animations release their effects; removed elements, route changes and component cleanup dispose observers and event bindings. Accordion completion restores its original overflow style. The menu releases its scroll lock on close.

Val Head's motion system and reduced motion principles informed consistent easing, limited stagger and accessible fallbacks. The previously consulted Charli Marie guidance informed restrained presentation and clear hierarchy. Local references are [Val Head principles](</Users/john/Documents/Codex Expert Library/val-head/wiki/principles.md>) and [Charli Marie principles](</Users/john/Documents/Codex Expert Library/charli-marie/wiki/principles.md>).

Build, lint and all 41 automated tests passed. The check record is [4eb1b2fd verification](</Users/john/Documents/Codex Expert Library/_verification/4eb1b2fd-59e1-43fd-b9cf-7b2d39c17fea.json>).

Chrome checks at desktop 1365 by 900 and mobile 390 by 844 covered the hamburger opener, full screen menu, Escape and focus return, FAQ expansion and closing with overflow cleanup, and Services navigation returning to scroll position zero. Additional checks covered static guide and city pages, blog and FAQ routes, and local empty field validation on application forms. No live form was submitted. These checks do not measure frame rate on a physical iPhone, and they do not resolve the separate lead email sender connection.

Screenshots: [Mobile homepage](motion-home-mobile.jpg) and [Mobile menu](motion-menu-mobile.jpg).

Preview: [Review the motion update](https://master-clean-6fowh9vb7-jxwayne890s-projects.vercel.app). Deployment `dpl_7ZHwN6dGJ17AbS2TZ45Y41feWVY5` is READY in `jxwayne890s-projects/master-clean-hq`, from implementation commit `99d5abe`. Vercel's local build completed for the preview environment. Production remains pending John's approval.

Authenticated deployment checks returned HTTP 200 for the homepage, Services, guides index, cost guide, Greater Houston page and both motion assets. Those five HTML responses match the prebuilt artifacts after removing Vercel's preview feedback script. Both motion assets match byte for byte.
