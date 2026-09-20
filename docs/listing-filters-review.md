# Listing filters review — updated 20 September 2026

Filters opens a centered modal on desktop and mobile, using the website's
ivory background, navy controls, Montserrat typography and rounded borders.
Desktop controls have generous spacing. On mobile, the location fields sit side
by side and type and area presets each use one row. All controls and actions fit
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

City and micromarket choices come from the build catalogue, ranked by warehouse
count. Micromarkets are disabled until a city is selected and reset on city change.
Choices use backend membership IDs, including smaller markets without standalone
listing pages. Search aliases, explicit Apply, removable selections and URL/history
behavior are preserved. The slider's upper endpoint means **No maximum**.

## Adversarial findings addressed

- **Incorrect area totals and missing pages:** the live Bengaluru API returned
  only 12 results for 50,000+ sqft despite 132 matching entries in its 576-entry
  inventory. Area and micromarket searches now filter the complete matching scope
  before pagination. A live check of the new query traversed all 132 results across
  seven pages without duplicates.
- **Partial micromarket results and city leakage:** membership is checked against
  all source pages and the exact city, rather than filtering one result page or
  relying on the API's partial city matching. Multi-unit warehouses match when
  any available unit satisfies the area range.
- **Abandoned downloads and shared-request cancellation:** temporary observers
  share cached inventory. One cancelled search cannot interrupt another consumer;
  the last consumer leaving aborts the source. Failed membership reads cannot
  silently turn into an unfiltered city result.
- **Keyboard and viewport issues:** comboboxes accept exact aliases with Enter,
  keep keyboard scrolling inside the options and place options above the field
  when needed. Mobile inputs use 16px text. Filters close with Escape or the X and
  return focus to their trigger. Slider handles have names and readable area values.
- **Small-screen overflow:** pagination wraps at narrow widths and the compact
  modal fits small portrait phones. Interactive filter targets retain at least
  44px hit areas.

## Remaining tradeoff

The backend has no micromarket filter and applies area filters after an incomplete
pagination window. Accurate frontend results therefore require a full read of the
matching city/type/NOC scope, cached for 60 seconds. The Bengaluru sample transferred
about 1.25 MB of JSON; a country-wide area search can read more. A backend endpoint
that applies membership and area constraints before counting and paging is the
long-term performance fix. This review does not change the backend.

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
iPhone run passed 18 of 19 cases; its 320px case timed out during an intermittent
blank initial load, before the filter UI mounted. Both isolated reruns of that
case passed. This startup flake is recorded, not claimed resolved. No filter
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
`libjpeg.so.8`. This does not resolve the earlier iPhone startup flake. Full SSG
deployment and physical-device testing remain unverified.

The browser harness and screenshots are preserved in
`../wareongo-evals/output/filter-modal-2026-09-20/`. From `../wareongo-evals`, run:

```sh
npm run test:navigation -- \
  --config=output/filter-modal-2026-09-20/playwright.config.ts \
  --project=desktop --project=android
```
