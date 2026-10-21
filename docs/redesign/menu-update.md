# Full screen navigation update

October 21, 2026. John requested a full screen dropdown with a real animation after reviewing the first mobile navigation preview.

The Menu button now opens a navy panel covering the complete viewport. The white brand header and close control remain at the top. Large numbered navigation links enter in sequence, followed by the phone and quote actions. The panel reveals from the top over 560 milliseconds and retracts over 380 milliseconds. No animation library or new dependency was added.

The panel uses a native modal dialog so the surrounding page becomes inert, following the [MDN dialog guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). Explicit keyboard boundary handling cycles focus within the menu, Escape initiates closing, and closing restores focus to the Menu button, consistent with the [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

Page scrolling is locked while open. Any active smooth scroll is stopped before the lock. The saved position is restored before a selected link is followed. An opening URL snapshot prevents a delayed hash event from closing a newly reopened panel. The menu closes when resizing to the desktop navigation breakpoint. Short viewports scroll inside the panel, while the close control remains available. Reduced motion CSS removes the reveal delay and movement duration. OS reduced motion emulation was not part of the browser check.

## Checks

The build, full lint check, and all 30 homepage, content, intake, and quote regression tests passed after the final edits. All 302 React routes prerendered, and 11 static resource pages were generated. The source verification receipt is `/Users/john/Documents/Codex Expert Library/_verification/35e064af-23b7-45b3-9994-f011ec1ca582.json`, completed at 16:44:20 UTC.

Chrome observations:

* At 390 by 844, the open panel measured exactly 390 by 844 with its top at zero. It was a modal dialog, the body was locked, and all links reached full opacity after their individual delays of 100 to 300 milliseconds.
* Shift Tab from the first link wrapped to the quote action. Tab from the quote action wrapped to the first link. Escape closed the panel and returned focus to Menu.
* Closing restored the exact position captured by the scroll lock. Reopening during a quote anchor scroll kept the menu open. Quote navigation ended with the contact section approximately 100 pixels below the viewport top.
* At 320 by 568, the panel covered the viewport and its inner content scrolled. The quote action remained reachable by keyboard within the viewport, with its bottom approximately 510 pixels from the top.
* Resizing an open menu to 1280 pixels closed the modal, released the scroll lock, and showed desktop navigation.
* Following Services through the menu loaded the correct destination. The local Vite preview falls back to homepage HTML for `/services` without a trailing slash, which produces a local hydration mismatch. `/services/` serves the proper static HTML. A fresh check on that correct static route produced no new browser errors or warnings. The deployed Vercel route is checked separately.

Screenshot: [Full screen mobile menu](menu-fullscreen-mobile.jpg).

This update remains on preview for John's review. Production has not been promoted.

## Preview delivery

Preview: https://master-clean-di9rqavqf-jxwayne890s-projects.vercel.app

Ready deployment: `dpl_LxtSk89MRsqyfpsKGVSzzXC9mMJt`. Implementation commit: `b3c2405`. Account and project were verified as `jxwayne890s-projects/master-clean-hq` before deployment. The build was created locally and uploaded as a preview.

Authenticated Vercel CLI requests returned HTTP 200 for `/`, `/services`, and `/assets/index-DexAzHJ3.css`. Both HTML responses match the prebuilt artifacts after excluding Vercel's preview feedback script. The CSS matches its built asset exactly and contains the opening animation, closing animation, and reduced motion rules. Deployment protection was preserved.
