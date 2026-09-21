# Production smoke checks and live-backend build — 21 September 2026

The user deployed the backend during this check. Its new capability header and
native micromarket behavior now pass. The website still serves the earlier build
(`app-DpBOugzU.js`, loader hash `qtsqet6jkm`). The pending website was built and
tested separately without publishing it.

## Earlier iPhone report

There is no confirmed physical-iPhone defect. The original evidence was one
timeout before the filter UI mounted in local emulated WebKit at 320 × 568.
Both isolated reruns passed. No physical iPhone was involved or is available now.
The original temporary trace directory no longer exists, so that failure's cause
cannot be established retrospectively.

All 17 live small-screen WebKit cases passed without retries: 15 fresh contexts
across listings, city, state, micromarket and the published Kompally overview;
three reloads plus back/forward in one case; and delayed real scripts in another.
No API/font/image fixtures or automatic reload recovery conceal startup failures.
No blank screen, crash or hydration error occurred in these cases. The old
timeout remains unconfirmed test evidence, not an established iPhone blocker.

## Separate hydration issue fixed

The deployed website produced React error 421 when desktop/mobile Chromium
clicked Next while its lazy notification script was still hydrating. Listing
content and pagination recovered. This was not a blank initial load. React
identifies this error as an update reaching a Suspense boundary before hydration
finishes ([official error reference](https://react.dev/errors/421)).

A local regression reproduced the same error by holding the toast chunk and
clicking Next. `RootLayout.tsx` now mounts the notification boundary after the
initial hydration effect. Notifications have no initial server content; lazy
loading and navigation behavior remain intact. No new dependency, retry loop or
forced reload was added. The regression passes on all three browser projects
and verifies that notifications mount after the script is released.

The refreshed fixture run passed **210/210 browser checks** and **11/11 PostgreSQL
integration tests**, including the full overview regression suite.

## Live deployment results

Final disposition: **59 passing checks and three outstanding checks**. One is
the expected failure for the undeployed bounded location payloads. Two are the
Chromium hydration reproductions fixed locally above. The current deployment
does not receive an all-green certification.

Passing coverage includes static HTML, hydration, metadata, applicable structured
data, sitemap, loader manifests, redirects, real 404s, API CORS/public fields,
filters, pagination, history/reload and the published Kompally overview.

Initial harness assumptions about published Karnataka overviews and JSON-LD on
the general search page were corrected against the actual site. The final
disposition combines the complete run with the corrected HTTP-only pass; those
earlier harness failures are not counted as product defects. Application errors
were not suppressed.

## Build against the deployed backend

The complete production build passed in an isolated copy of the pending website
against `https://wareongo-website-backend.onrender.com`:

- **2,510 rendered routes** and **2,411 sitemap URLs**.
- Fresh native-filter capability and cache-bypass checks passed.
- Content generation, SSG, stable manifests, redirect map and sitemap completed.
- IndexNow was skipped; no publishing or content writes occurred.
- All 20 changed application files matched the working tree in both the fresh
  fixture build and the live-backend build. Generated data differs by design.

Build: `/tmp/wog-live-backend-build-KxPVRR/site`.
Log: `/tmp/wog-live-backend-build-KxPVRR/build.log`.

The exact completed build was then served locally with the real deployed API.
**75/77 checks passed initially**, including every city/state/micromarket/type
seed-to-API comparison, page-two ID comparison, location switching, area/type
combination, overview check and all 15 cold WebKit starts. The previously
reproduced notification hydration error did not occur.

Two WebKit cases failed intermittently: a Next click left the URL unchanged,
and an immediate reload reported `Frame load interrupted`. Neither produced a
blank-screen reproduction or application exception. Navigation/interaction
logging was added; each case then passed three isolated repetitions (**6/6**)
without changing application code, assertions or wait conditions. Their precise
cause is not established. Keep these traces as test-stability evidence rather
than claiming a failure-free first pass or a confirmed iPhone defect.

## Evidence

- [Retained results and build log](../../wareongo-evals/output/production-smoke-2026-09-21/).
- [Live-site disposition](/tmp/wog-production-smoke-2026-09-21/production-summary.json).
- [Live browser report](/tmp/wog-production-smoke-2026-09-21/confirmed-browser/report/index.html).
- [Corrected HTTP report](/tmp/wog-production-smoke-2026-09-21/http-final/report/index.html).
- [Fixture browser report](/tmp/wog-listing-integration-0Qluvk/browser/listing-integration-report/index.html).
- [Live-backend build browser report](/tmp/wog-production-smoke-2026-09-21/built-browser/report/index.html).
- [WebKit investigation report](/tmp/wog-production-smoke-2026-09-21/webkit-investigation/report/index.html).
- Before-fix toast reproduction: `/tmp/wog-listing-integration-2dhozo/`.
- [Reproduction instructions](../../wareongo-evals/README.md).

Website/harness TypeScript checks, changed-component lint and `git diff --check`
passed. Unrelated lockfile changes were preserved. The user deployed the backend;
this run did not commit, push or deploy the website.
The temporary preview server and local integration services were stopped.
