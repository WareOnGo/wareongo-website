# Listing filters review — 18 September 2026

The desktop panel has two rows: City, Micromarket and Warehouse type above;
Area (in sqft), Fire NOC, Reset and Apply below. The area slider uses the remaining
row width. On mobile, City and Micromarket stay visible and a Filters disclosure
contains type, area and Fire NOC. Reset and Apply remain in the second row.

City and micromarket choices come from the build catalogue, ranked by warehouse
count. Micromarkets are disabled until a city is selected and reset on city change.
Choices use backend membership IDs, including smaller markets without standalone
listing pages. Search aliases, explicit Apply, removable selections and URL/history
behavior are preserved. The slider's upper endpoint means **No max**.

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
  when needed. Mobile inputs use 16px text. Filters close with Escape or Done and
  return focus to their trigger. Slider handles have names and readable area values.
- **Small-screen overflow:** pagination wraps at narrow widths, the filter panel
  stays in two rows and the mobile Filters count fits with all three requirements
  selected. Interactive filter targets retain at least 44px hit areas.

## Remaining tradeoff

The backend has no micromarket filter and applies area filters after an incomplete
pagination window. Accurate frontend results therefore require a full read of the
matching city/type/NOC scope, cached for 60 seconds. The Bengaluru sample transferred
about 1.25 MB of JSON; a country-wide area search can read more. A backend endpoint
that applies membership and area constraints before counting and paging is the
long-term performance fix. This review does not change the backend.

## Validation

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
