# Listing URLs

Applied filters and pagination are stored in the URL. The existing filter panel
still waits for **Apply filters**; changing a draft does not navigate or request
results. Apply, Clear, page selection, and page-size selection add browser history
entries. Invalid/default parameter cleanup replaces the current entry.

## Main listings

Example: `/listings?city=Bangalore&type=PEB&page=3&pageSize=10`.

| Parameter | Meaning |
| --- | --- |
| `city` | City name; build-time choices are ranked by warehouse count. Known aliases normalize to canonical labels. |
| `micromarket` | Locality slug belonging to the selected city. Changing the city clears this selection. Legacy `state` parameters are removed. |
| `type` | `PEB`, `RCC`, `BTS`, or `Shed`. |
| `fire` | `yes` requires Fire NOC. Off includes every status; old `no` parameters are removed. |
| `minSqft`, `maxSqft` | Slider range, 0–100,000 in steps of 1,000. The upper endpoint means **No max**, so it also includes larger warehouses. Reversed bounds are ordered. |
| `page` | Positive integer, default 1. Invalid or unsafe offsets fall back to 1. |
| `pageSize` | 10, 21, 30, or 50; default 21. |

Default values are omitted. Applying/clearing filters or selecting a page size
resets the page to 1; clearing filters retains the selected page size. Unrelated
query parameters (including repeated campaign parameters) and fragments survive
navigation. An out-of-range page is corrected only after the matching API response
supplies its totals, never using placeholder totals from a previous query.

## Location and overview grids

Example: `/listings/city/bengaluru?page=2&pageSize=18`.

These pages still slice their already-loaded inventory. Their six-row grids show
6, 12, or 18 cards depending on viewport width. The URL records the originating
page size so another device can open the page **containing the originally shared
first warehouse**, while retaining its normal responsive card count. A desktop
page 2 at size 18 therefore becomes mobile page 4 at size 6. On a larger receiving
viewport, that warehouse may appear within the page rather than first.

Viewport translation and out-of-range correction replace the current URL. A
page-only link is interpreted using the receiving viewport. Page 1 omits both
pagination parameters. Existing city/state/type/locality path structure remains
unchanged.

## Data loading and hydration

- React Query owns main-listing requests, cache identity, freshness, and
  cancellation. Visible results and prefetches share query options; image warming
  policy is unchanged. Ordinary filters use server pagination. Micromarket or
  area searches read the full matching city/type/NOC scope, cache it for 60 seconds,
  then filter before slicing into pages. Micromarket membership uses backend IDs,
  with an exact city check to exclude similarly named cities. Abandoning the last
  consumer aborts the shared read; one consumer cannot cancel another's request.
- Listing route loaders do not revalidate for changes to their owned search
  parameters. Path changes, unrelated search changes, actions/submissions, and
  explicit same-URL revalidation retain the router's normal behavior.
- User-initiated URL updates commit synchronously to retain the previous local
  state update priority. Automatic normalization uses ordinary replacement
  navigation. Missing location data retains its existing redirect without a
  competing pagination cleanup.
- The first hydration render matches the prebuilt default page. URL state then
  activates without seeding a filtered/later-page cache with default-page data or
  starting a default-page preload. Ordinary client navigation reads URL state
  immediately. Fresh main-listing deep links still need their own API request.
- Pagination destinations are native links; ordinary clicks retain existing
  analytics and scroll handlers, while modified clicks can open another tab.
  Unavailable controls remain disabled buttons with the existing styling.

## Validation commands

From the website directory:

```sh
npm run test:listing-url
npx tsc --noEmit -p tsconfig.app.json
```

From `../wareongo-evals`:

```sh
npx playwright test --config=playwright.url-state.config.ts
npm run test:prefetch
```

The URL suite checks direct links, refresh, history, draft filters, invalid
parameters, native new tabs, responsive position translation, and hydration
errors. The visual suite compares 21 full-page screenshots against the unchanged
application across desktop, tablet, and mobile. The existing prefetch suite covers
cache reuse, adoption of in-flight requests, cancellation, image warming policy,
loading placeholders, scrolling, and a controlled HTTP latency benchmark.

For a fixture-backed production build, set `WEBSITE_DIR` to its isolated directory
and `URL_STATE_BUILT=true` for the URL suite or `PREFETCH_BUILT=true` for the
prefetch suite. Fixture builds must use the existing local fixture API and omit
the IndexNow notification step; do not replace the working tree's generated data.

## Validation results — 14 September 2026

Final browser runs passed with zero retries:

| Suite | Passed | Expected skips |
| --- | ---: | ---: |
| Dev URL, pagination, analytics and visuals | 57 | 0 |
| Dev prefetch and loading | 39 | 0 |
| Production URL and hydration | 25 | 1 |
| Production prefetch and loading | 37 | 2 |

All 21 screenshot comparisons matched the original application exactly. Native
modifier-click navigation passed in dev and production, and the production URL
suite reported no hydration errors. Location/overview pagination added no API or
loader-data reads. The skipped production cases are the dev-only unknown-route
redirect, controlled HTTP benchmark and analytics instrumentation case.

The 13 URL/responsive Node checks, six existing analytics checks, four existing
card-link checks, TypeScript, changed-file ESLint and fixture production build
also passed.

The controlled benchmark used three repetitions per version, fresh browser
contexts, one worker, an 800 ms local API delay and a 300 ms image delay. Other
browser/build work was paused. Medians against a refreshed frozen-original
baseline were:

| Viewport | Original preloaded cards | Final preloaded cards | Original photos | Final photos |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 53 ms | 57 ms | 187 ms | 188 ms |
| Mobile | 51 ms | 49 ms | 158 ms | 154 ms |

Every sample made exactly one page-two API request and one HTTP request per warmed
next-row image. The intermediate asynchronous URL-navigation implementation added
roughly 50 ms; synchronous user navigation removed that scheduling delay. These
small samples describe local timing and do not establish exact latency equality.

Reports, screenshots, original/intermediate/final benchmark samples and source
fingerprints are preserved in the combined workspace's
`url-state-validation-2026-09-14` directory.

To select the applicable URL cases on the isolated production fixture build:

```sh
URL_STATE_BUILT=true WEBSITE_DIR=/path/to/fixture-build \
  npx playwright test --config=playwright.url-state.config.ts \
  listings-url-state listings-url-native
```
