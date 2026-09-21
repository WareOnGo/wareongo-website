Mobile navigation and deployment retry review — 2026-09-21

The shared mobile navbar now uses a 56 px bar with an 8 px top inset, increased
when the device's safe area requires it. Its normal total height is 64 px, down
from 92 px. Logo and menu controls retain at least 44 px touch targets. The shared
mobile navigation breakpoint remains 1280 px, including tablet layouts.

Every mobile page hides the header after 24 px of downward travel and reveals it after
10 px upward. At the top, with keyboard focus in navigation, or during navigation
or filter dialogs, it stays visible. The Filters button moves between 72 px and
8 px from the top, with safe-area protection and no full-width background. Header
visibility does not change document height or the positions of listing cards.
Mobile listing top padding decreases from 64 px to 24 px; both loading placeholders
use the same geometry. Desktop navigation stays visible. Overview content and
listing behavior are unchanged; its shared mobile navbar follows the same scroll
behavior as other pages.

The navbar and burger menu now use the desktop brand styling: the existing
`logo_transparent.webp` mark at 26 px high, with an 18 px semibold Montserrat
wordmark, no added letter spacing and a 12 px gap. Conflicting mobile/menu brand
overrides were removed. The same styling fits a 320 px viewport without reducing
the 44 px link target or overlapping the menu controls.

Only the Filters button is sticky. Clear all sits beside the active-filter chips,
scrolls normally with them, and retains the existing reset behavior. The pending
location-page placeholder uses the same chip and Clear all layout.

The scroll listener is passive, coalesces work into animation frames, and updates
React state when visibility changes. It clamps overscroll, ignores height-only
viewport resizing, resets on route/breakpoint changes, and cleans up listeners.
Keyboard focus reveals the header; pointer focus left on a closed menu does not
pin it. Reduced-motion mode disables the header/filter movement transitions.
This follows the considerations in [NN/g's sticky-header guidance](https://www.nngroup.com/articles/sticky-headers/).

The reported Vercel build failed when GET `/warehouses/2661` returned HTTP 520.
The endpoint subsequently returned 200 with warehouse 2661 in Ranchi. The existing
read-retry helper handled 429/500/502/503/504 but omitted 520, so it failed on the
first response. The fix adds 520 to that helper's existing policy: three total
attempts, backoff and jitter, failed-body cleanup, Retry-After handling, and abort
support. Persistent errors still fail the build; mutation requests are not retried.
[Cloudflare documents 520 as an unexpected origin response](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-520/).
The precise origin failure is not established by the supplied build log.

Validation:

- The targeted navigation run passed 29 of 30 scenarios across mobile Chromium,
  iPhone WebKit emulation and desktop Chromium. Checks cover global scroll
  behavior, location listing pages, shared brand appearance at 320–1279 px,
  non-sticky Clear all, touch and keyboard focus, filter dialogs, viewport
  resizing, and reduced motion. One WebKit test stalled on a blank initial
  development-server load, before its interaction assertions. The trace shows
  no JavaScript error or failed HTTP request. The same test subsequently passed
  three consecutive runs without application or assertion changes. This is
  recorded as an intermittent startup failure, not a clean first-pass suite.
- 67 existing navigation, loading-layout and enquiry browser checks passed on
  the final source, including the 320–1920 px responsive matrix. The mobile
  bar-height expectation changed from 74 px to 56 px, and the scroll-lock test
  now waits for the lazy About Us page before scrolling it.
- All 12 read-retry tests passed, including temporary and persistent 520 responses.
- Website and harness TypeScript, changed application TypeScript ESLint, and diff
  whitespace checks passed.
- The final source passed the complete production build pipeline against a
  local GET-only fixture API, then production HTML hydration and desktop/mobile
  navigation checks. Navigation made no browser inventory requests. IndexNow
  notification was excluded from this isolated build.
- All 14 checks against that final built output passed: listings, overview and
  warehouse details in Chromium desktop/mobile and WebKit, plus five additional
  fresh WebKit listing loads (six in total). Each check used a fresh browser
  context. No blank screen, uncaught JavaScript error or hydration error occurred.
  This does not establish the cause of the development-server failure or rule
  out a physical-device issue.
- A full production SSG build against the deployed backend passed before the
  final global-scroll, logo and Clear all refinements: 2,528 HTML
  routes, 2,428 sitemap URLs and 2,104 warehouse destinations. The previously
  failing Ranchi page rendered successfully.
- Nine checks against that live-API build passed: listings, the published
  Kompally overview, and warehouse 2661 in Chromium desktop/mobile and WebKit.
  Header size, scrolling, filter positioning, 21 initial listings, and hydration
  were checked. No uncaught application or hydration errors were observed.

The broader navigation command also runs analytics tests. Three failures were
reproduced unchanged against main commit `b0e4e75`: a direct-link event is tagged
`history`, one test still looks for `Show filters`, and one expects the old
`city=Bangalore` URL after canonicalization to `city=Bengaluru`. These remain
separate follow-ups; the complete analytics suite is not claimed to pass.

Local evidence is retained at:

- `/tmp/wog-mobile-navigation/`
- `/tmp/wog-webkit-focus-rerun/`
- `/tmp/wog-final-navigation-regression/`
- `/tmp/wog-built-final-navigation/`
- `/tmp/wog-mobile-navigation-regression/`, including the baseline analytics run
- `/tmp/wareongo-navigation-ssg-AlxMxn/`, the final fixture build
- `/tmp/wog-live-backend-build-9aMqmo/`, including the full build log and output
- `/tmp/wog-built-mobile-navigation/`, including results and screenshots

Reproduce from `wareongo-evals`:

```sh
WOG_WEBKIT_EXECUTABLE=/tmp/wog-webkit-browser npm run test:mobile-navigation
npm run test:navigation -- tests/specs/navigation.spec.ts tests/specs/skeleton-layout.spec.ts tests/specs/warehouse-card-enquiry.spec.ts
node tests/support/check-navigation-build.mjs
npm run test:build:live-api
```

This validation used emulated mobile browsers; no physical iPhone or production
deployment was performed for these changes.
