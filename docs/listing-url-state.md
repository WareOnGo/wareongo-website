# Listing URLs

Applied filters and pagination are stored in the URL. The filter modal waits for
**Apply filters**; editing controls, selecting quick presets and Reset only change
the draft. Apply commits the search and closes the modal. Dismissing without Apply
keeps the current results; reopening restores the applied filters. Clear all on
the page clears the applied search immediately. Apply, Clear all, page selection,
and page-size selection add browser history entries. Invalid/default parameter
cleanup replaces the current entry. Scrolling between loaded listing batches
also replaces the current entry, so Back does not step through every scroll.

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

### Continuous listing results

Main, city, state, locality and construction-type listing routes append the next
batch as the reader approaches the end. Existing cards remain visible during
loading and errors. The shared card skeletons, a live loading status, an explicit
retry and an end-of-results message cover each state. Offline requests show a
waiting-for-connection message and resume automatically. Counts and available
page links use the latest batch's totals when inventory changes. A native **Load more** link
supports keyboard users and browsers without IntersectionObserver. **Browse by
page** retains the numbered links and page-size control as secondary navigation.

One next batch is prefetched after visible photos finish; only its first row of
photos is warmed near the boundary. Save Data, slow connections, offline/hidden
tabs and outgoing route navigation retain the existing prefetch restrictions.
Automatic loading adopts the same request/cache entry without fetching twice.

The URL follows the visible batch. Browser state records the feed's starting
page; React Query keeps the appended pages for up to 30 minutes after departure,
and a bounded in-memory position map restores a return from a detail page.
Refresh and shared URLs start at their own batch when no cached feed exists.
Scroll callbacks use committed renders and check the browser's history entry,
so an outgoing grid cannot overwrite Back/Forward navigation during a transition.

Location loaders include only the FAQs from the corresponding published overview
(including its geographic FAQs on PEB/RCC routes). They appear after the grid,
using the existing accordion; all answers are in prerendered HTML even while
collapsed. Locations without overview FAQs omit the section. Overview pages
retain their existing six-item pagination.

Validate the scrolling behavior from `../wareongo-evals` with
`npx playwright test --config=playwright.infinite-scroll.config.ts`.

## Overview grids

Example: `/overview/karnataka/bengaluru?page=2&pageSize=6`.

State, city and micromarket overview pages slice their already-loaded inventory
into six listings per page at every viewport width, including prerendered HTML
and loading placeholders. Older links with a page size of 12 or 18 still open
the page containing the originally shared first warehouse. An old page 2 at size
18 therefore becomes page 4 at size 6.

Legacy page-size translation and out-of-range correction replace the current
URL. A page-only link uses six listings per page. Page 1 omits both pagination
parameters.

## Data loading and hydration

- React Query owns main-listing requests, cache identity, freshness, and
  cancellation. Visible results and prefetches share query options; image warming
  policy is unchanged. Filtered requests use bounded server pagination, including
  micromarket and area searches. The backend owns matching, membership and totals.
  Abandoning a feed cancels its otherwise unobserved page request.
- Listing route loaders do not revalidate for changes to their owned search
  parameters. Path changes, unrelated search changes, actions/submissions, and
  explicit same-URL revalidation retain the router's normal behavior.
- User-initiated URL updates commit synchronously to retain the previous local
  state update priority. Automatic normalization uses ordinary replacement
  navigation. Missing location data retains its existing redirect without a
  competing pagination cleanup.
- The first hydration render matches the page baked into the current document. URL state then
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
npx playwright test --config=playwright.infinite-scroll.config.ts --workers=1
node tests/support/check-infinite-scroll-build.mjs
```

The continuous-listing suite checks appending, error recovery, preloading,
keyboard fallback, offline recovery, inventory changes, filter cancellation,
page size, history, refresh, route coverage and matching overview FAQs on desktop
and mobile. The production helper creates an isolated copy in `/tmp`, generates
eight listing categories and their additional static pages against a GET-only
fixture API, then verifies initial HTML, hydration, appending and refresh. It does
not run asset publication, IndexNow or deployment hooks.

Older pagination, URL-visual and prefetch browser suites still describe the
previous exposed numbered controls and page-replacement behavior. The historical
results below do not establish those suites' compatibility with continuous
listing results; use the commands above for this implementation.

## Adversarial review — 22 October 2026

The review reproduced and fixed four problems:

- Back immediately after changing page size could let an outgoing scroll callback
  overwrite the destination URL and load the wrong feed. Callback updates now
  follow committed renders, automatic navigation checks the current browser URL,
  and every history entry receives a saved position even without another click.
- An append paused offline gave no explanation. It now announces the pause and
  resumes after reconnection without replacing already loaded cards.
- An older visible batch could restore obsolete totals and page links after a
  newer response reported less inventory. Totals now come from the latest batch.
- The manual fallback still crashed through lazy photos when IntersectionObserver
  was unavailable. Photo visibility and the detail gallery now degrade safely.

All 46 desktop/mobile scenarios passed, including Pune, city/state PEB and RCC
variants, and micromarket FAQs. One screenshot write failed because the host disk
filled; its focused rerun passed with artifacts in `/tmp`. The isolated production
build generated 8 categories and 14 additional pages; all 22 production browser
checks passed. Listing URL and crawling tests, application TypeScript and
changed-file ESLint also passed. Validation used local fixtures, not live inventory.

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
