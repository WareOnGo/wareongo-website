# Listing filters review — updated 21 September 2026

Latest validation: [production smoke checks and live-backend build](listing-production-smoke-2026-09-21.md).

The subsequent [adversarial audit](listing-filters-adversarial-audit.md) records
six corrected failure cases and the final 207-check browser run. An older bundle
reading a new 21-item loader payload can require a refresh; recovery is tested
and accepted without an additional compatibility layer.

Filters opens a centered modal on desktop and mobile, using the website's
ivory background, navy controls, Montserrat typography and rounded borders.
Desktop controls have generous spacing. On mobile, the location fields sit side
by side for state/city, with micromarket on the following row. Type and area
presets each use one row. All controls and actions fit
without scrolling at 320 × 568. The body can still scroll on shorter viewports,
with the heading and Reset/Apply actions kept visible.

Warehouse types are Any, PEB, RCC, BTS and Shed. Area presets are Any area,
Up to 10,000, 10,000–25,000, 25,000–50,000 and 50,000+ sq ft. Mobile labels use
compact k notation. Selecting a preset updates both slider handles; adjusting
the slider to another range clears the preset highlight. The 50,000+ preset has
no upper limit, including warehouses over 100,000 sq ft.

Edits and Reset affect the draft only. Apply updates the URL/results and closes
the modal. Closing with the X, Escape or backdrop leaves the applied search intact;
reopening starts from those applied values. Clear all on the page still clears
the applied search immediately. Focus stays inside the modal and returns to the
Filters button when it closes. Opening focuses the title instead of opening the mobile
keyboard. Location suggestions can expand beyond the compact fields while staying
within the modal body; Escape closes suggestions before closing the modal.

State, city and micromarket choices come from the build catalogue, ranked by
warehouse count. Micromarkets are disabled until a city is selected. A state
change clears city and micromarket; a city change clears state and micromarket,
so a previous state cannot silently constrain a different city. Smaller markets
without standalone pages remain selectable. Saved locality slugs that disappear
from the options still produce an empty search instead of a whole-city fallback.
The slider's upper endpoint means **No maximum**.

## Shared location listings — 20 September 2026

`/listings`, city, state, micromarket and city/state PEB/RCC listing routes use
the same `ListingsView`, filter modal, URL state, results and pagination. Each
location route supplies its path's preset plus its own existing heading, SEO
metadata and breadcrumbs. The main and location grid loaders bake page 1 with
21 results from the same API query used by later browser requests. Location
loader payloads contain only those results, pagination, preset and small SEO
summary fields. All warehouse detail routes still build and remain in the sitemap.

Refinements retain the location path: for example,
`/listings/city/bengaluru?type=PEB&minSqft=50000`. Changing or clearing a filter
defined by the path opens `/listings` with the complete remaining filters in
the query. This prevents a Bengaluru heading from describing Delhi results.
Unrelated query parameters and fragments survive Apply, clear and pagination.

Browser requests now use native `state`, canonical `city`, `micromarket` and
`locationMatch=exact` filters. The full-inventory workaround has been removed;
each query requests one bounded page. The backend matches aliases and locality
tags, applies both area bounds to the same unit, counts and orders before paging.
The existing React Query page cache and next-page prefetch remain. An old build's
seed paints immediately and refreshes before more pages are prefetched.
If that refresh fails, the same search's existing results remain visible with
a retry notice. A failed new search never borrows the previous search's cards.

Overview routes retain their existing loaders, complete inventory, editorial
content, statistics and local responsive pagination. They do not use the new
21-item location seed or filter modal. The build's existing complete-inventory
read remains available for route generation, overview data and SEO summaries.

## Adversarial findings addressed

- **Incorrect area totals and missing pages:** the live Bengaluru API returned
  only 12 results for 50,000+ sqft despite 132 matching entries in its 576-entry
  inventory. Area and micromarket searches now filter the complete matching scope
  before pagination. A live check of the new query traversed all 132 results across
  seven pages without duplicates.
- **Partial micromarket results and city leakage:** the backend checks membership
  and exact city before counting and paging. Multi-unit warehouses match when
  any available unit satisfies both area bounds.
- **Abandoned requests:** transport receives React Query's abort signal. Changing
  filters cannot restore a slow, abandoned response. Failed filtered reads show
  a retry state without unrelated seed cards or an unfiltered fallback.
- **Keyboard and viewport issues:** comboboxes accept exact aliases with Enter,
  keep keyboard scrolling inside the options and place options above the field
  when needed. Mobile inputs use 16px text. Filters close with Escape or the X and
  return focus to their trigger. Slider handles have names and readable area values.
- **Small-screen overflow:** pagination wraps at narrow widths and the compact
  modal fits small portrait phones. Interactive filter targets retain at least
  44px hit areas.

## Release order and limits

Deploy the companion backend patch before building/deploying this website.
This client depends on native micromarket filtering and correct area pagination.
Fresh builds now require the backend's `X-Wareongo-Listing-Filters: 1` header,
and route loader errors stop prerendering rather than publish an error page.
The API change is backward compatible with the earlier website and requires no
database migration. If reverting the backend, revert the website first.

Static data and live data can differ when inventory changes between requests;
the baked timestamp allows stale page-one data to refresh. Offset pagination
does not provide a snapshot across an entire browsing session.

Local validation uses real PostgreSQL, Redis and the actual backend with seeded
fixtures. It does not certify production deployment, production inventory or a
physical iPhone. The earlier blank-load report was one local emulated WebKit
timeout followed by two passing reruns, not an established physical-iPhone bug.
The subsequent production smoke investigation is linked above.

## Validation — 18 September 2026

The Node URL/inventory suite covers aliases, all four building types, scoped
micromarkets, open-ended ranges, pagination beyond 500 source rows, shared caching,
cancellation and read failures. Navigation tests cover build-time ranking and
generation. Browser checks use a deterministic 96-entry inventory with positive,
negative and unknown Fire NOC statuses, four building types and areas over 100,000.

The browser harness is in `/tmp/wareongo-filter-qa` in this workspace and uses the
existing `wareongo-evals` Playwright installation. It checks widths from 320 to
1920px, keyboard and touch interaction, slider dragging, draft/apply/reset, query
parameters, history, refresh, analytics and viewport overflow. Mobile coverage is
browser emulation, not a physical-device test.

Results: 33 desktop/Android interaction and layout checks passed (one touch-only
case intentionally skipped on desktop). After widening the slider, another 14
desktop/Android breakpoint and drag checks passed, including 1920px. The final
iPhone-profile WebKit run passed 18 of 19 cases; its 320px case timed out during a
blank initial load, before the filter UI mounted. Both isolated reruns of that
case passed. This unconfirmed test failure is recorded; no physical iPhone was
involved. No filter
interaction errors were observed in the completed iPhone cases.

The 25 URL/inventory checks and 15 navigation/build-generation checks passed.
TypeScript, changed-file ESLint and the SPA production bundle also passed. A full
SSG deployment and physical-device testing are outside this validation.

## Modal validation — 20 September 2026

All 16 Chromium desktop/Android browser checks passed with no retries or browser
JavaScript errors. Coverage includes preset selection by click and touch, custom
slider values, unbounded 50,000+ results, draft/apply/reset, history and attribution,
city aliases, dependent micromarkets, focus trapping/restoration, nested Escape,
backdrop dismissal and scroll locking. Layout checks cover 320, 412, 640, 768,
844, 1024, 1440 and 1920px widths, including 320 × 568 portrait and 844 × 390
landscape. The smallest portrait viewport is explicitly checked for zero body
scroll, as well as visible actions and dropdown bounds.

The 25 URL/inventory checks, TypeScript and final SPA production build passed.
Changed-file ESLint passed with explicit default options for
`@typescript-eslint/no-unused-expressions`: the installed ESLint 9.39.5/plugin
combination crashes when those options are omitted. A separate lockfile update
appeared during this work; the filter changes do not modify dependencies.

The WebKit/iPhone run could not start because its local runtime is missing
`libjpeg.so.8`. This limits that run and does not establish an iPhone defect. Full SSG
deployment and physical-device testing remain unverified.

The browser harness and screenshots are preserved in
`../wareongo-evals/output/filter-modal-2026-09-20/`. From `../wareongo-evals`, run:

```sh
npm run test:navigation -- \
  --config=output/filter-modal-2026-09-20/playwright.config.ts \
  --project=desktop --project=android
```

## Integrated location listing validation — 20 September 2026

The final local run passed **189 browser checks**, with no retries, skips or
remaining failures: 63 each on desktop Chromium, 360 × 640 mobile Chromium and
WebKit with the iPhone 13 profile. This includes the complete existing overview
suite and explicit 320 × 568 modal checks with visible actions, no body scroll
and 44px control heights. The current desktop and small-phone screenshots were
also inspected. No hydration or browser errors occurred in the listing tests.

The harness used Podman PostgreSQL 17, Redis 7 and the actual Express/Prisma
backend. It seeded 73 visible and one hidden warehouse, canonical/legacy city
spellings, multiple micromarkets, a locality without a page, large units and
published overview content. The full `npm run build` SSG pipeline passed in an
isolated website copy, including content generation, stable loader manifests,
warehouse routes and a 112-URL sitemap. IndexNow submission was disabled.

Coverage includes identical server-rendered and API listing IDs/order for all
location scopes, bounded 21-item seeds, complete pagination without duplicates,
state/city/micromarket switching, Fire NOC plus type and unbounded area, draft
cancellation, history, attribution/fragments, empty and failed results, retry,
abandoned requests, stale build refresh, nested Escape, focus restoration and
the sticky Filters button. Overview payloads still contain all 65 city/state
and 24 micromarket fixture listings, with the same statistics and navigation.
Inventory-dependent listing lead placeholders can differ by one text line;
overview loading geometry retains its existing exact checks.

The backend's 11 real-database filter tests and the website's 25 URL, local
overview pagination and API transport tests passed. Website and harness
TypeScript checks passed. Changed-file ESLint passed without warnings using the
explicit default rule options documented above; dependencies were not changed.

The initial passes caught and corrected location placeholder alignment and a
modal entrance animation that temporarily displaced the dialog. Harness-only
issues were also resolved: asynchronous font loading, selecting a hidden desktop
navbar on mobile, WebKit's screenshot size limit, and temporary traces filling
the workspace filesystem. Traces now go to `/tmp`. WebKit ran using a temporary
wrapper with the missing `libjpeg.so.8` runtime extracted under `/tmp`; the host
system and browser installation were not modified.

Reproduction is documented in
[`../wareongo-evals/README.md`](../../wareongo-evals/README.md).
From the eval directory, `npm run test:listing:integration` creates fresh local
services and runs the complete build and browser suite. On this Fedora host,
the tested WebKit wrapper is selected with
`WOG_WEBKIT_EXECUTABLE=/tmp/wog-webkit-browser`. The final browser rerun reused
the completed, unchanged application build after moving trace output off the
full workspace disk.

- Build and build log: `/tmp/wog-listing-integration-wk4MBB/`.
- Final backend/API logs, screenshots and traces: `/tmp/wog-listing-integration-aY7MBU/`.
- [Browser report](../../wareongo-evals/output/listing-integration-report/index.html).
- [Machine-readable results](../../wareongo-evals/output/listing-integration-results.json).
- [Latest run paths](../../wareongo-evals/output/listing-integration-run.json).

The temporary API and both containers stopped successfully. Nothing was pushed
or deployed during this implementation. Physical-device and deployed-environment
checks remained outside that run. The earlier emulated startup timeout was not
a confirmed physical-device defect.
