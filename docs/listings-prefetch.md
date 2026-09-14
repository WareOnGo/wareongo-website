**Next-page preloading for `/listings`**

The main warehouse grid currently starts each new page's API request after a click. The measured warm API path takes roughly 0.3–0.9 seconds; returning to cached pages takes 70–140 ms. This change should make a prepared next page behave like a cached visit. A fast click before preparation completes must retain the existing loading, error and retry behavior.

Implementation plan:

1. Share one React Query options factory between the visible page and its preload. Preserve the exact existing cache identity: filters, page number and page size. Keep the current 60-second freshness window, response transformation, cancellation signal and bounded read retries.
2. After successful current-page results, schedule one next-page request after a short delay and browser idle time. Do not recursively fetch beyond that next page. Do not start on errors, empty results, the last page, route navigation, hidden tabs, offline connections, Data Saver or 2G connections. Keep speculative errors out of the visible page's state.
3. Reuse React Query's in-flight request when the user clicks Next. Cleanup must distinguish a request promoted to the visible page from a discarded filter/page-size/route request. Cancel only inactive discarded requests, and ignore their late completions in the preload hook.
4. Observe the existing pager wrapper with an 800-pixel approach margin. No layout or pager behavior changes are needed. Use a scroll/resize fallback when IntersectionObserver is unavailable; keyboard and touch users receive the same approach behavior.
5. Once the next page's data is ready and the pager is near, preload only the first photo of the first grid row: one on mobile, two on tablet, three on desktop. Use the exact already-transformed image URLs selected by visible cards, deduplicate repeated URLs, and never speculatively fetch carousel images or original fallbacks.
6. Schedule image work at idle and assign low fetch priority and asynchronous decoding. Wait for visible current-page photos to finish first. Keep completed attempts bounded to the next row; cancel discarded unfinished image work where the browser permits it. Photo failures must never modify the visible gallery's fallback state. Browser caching remains responsible for reusing bytes.
7. Keep all speculative work in browser effects. Static generation and its explicit cache-bypass requests must remain unchanged. No new package, backend change, cron change, image conversion or deployment is required.

Verification plan:

| Behavior | Evidence required |
| --- | --- |
| One page ahead | Page 2 requested before clicking; page 3 absent until page 2 becomes current; no duplicate request on clicking a prepared page. |
| In-flight promotion | A held preload is consumed by Next without cancellation or a second request; existing skeletons remain until it resolves. |
| Correct cache identity | Applied filters, page sizes and history select matching data; abandoned responses never replace the current results. |
| Failure isolation | Failed preloads leave the current page usable; normal navigation and retries still work. |
| Resource restraint | No speculative work on the last page, errors, hidden/offline/Data Saver/2G states; relevant changes resume work. |
| Image approach | No future-page images at the top; pager approach starts only the next row, at the appropriate viewport count and low priority. |
| Image races | Pending visible photos take priority; repeated observations deduplicate; filter/route changes discard old work; failed preloads do not poison normal image loading. |
| Existing behavior | Desktop/mobile pagination, scrolling, short last pages, filter cancellation, loading skeletons and image-gallery recovery pass their regression checks. |
| Static generation | An isolated fixture-backed production build still generates page-1 cards without browser preloads or production requests. |
| Performance | A controlled API-delay comparison records click-to-card latency with and without completed preloading. Browser HTTP-cache reuse is checked separately from request-interception tests. |

Implemented on 2026-09-14. The visible query and the preload now use `src/lib/listingsQuery.ts`. Browser scheduling, connection policy, request cancellation, pager observation and photo warming live in `src/hooks/useListingsPrefetch.ts`. `src/pages/Listings.tsx` supplies the current filters, page size, result state and existing DOM references. The change adds no dependencies.

The query key remains `['warehouses', filters, page, pageSize]`. Its 60-second freshness window applies equally to visible and speculative requests. Data preparation begins after a 200 ms delay followed by `requestIdleCallback`, with a 1,000 ms idle timeout and a timer fallback. No component is rendered for a prefetched page, so it cannot report that page as viewed. A successfully cached page becomes visible through the same `useQuery` subscription already used by pagination.

Cleanup compares the discarded target with the newly visible query key. If they match, Next has adopted that request and cleanup leaves it running. Otherwise it cancels only an inactive matching query. This also prevents a late response for an abandoned filter or page size from being used to preload photos for the current selection. React Query retains its normal cached-data lifecycle; the hook stores only one completed target and a small set of photo URLs.

The photo limit follows the existing CSS breakpoints: one image below 768 px, two from 768 px, and three from 1,024 px. Widening the grid adds only missing first-row URLs. Work starts within 800 px of the pager, after currently visible images finish. Each speculative `Image` uses the card's exact primary URL, `fetchPriority='low'` and `decoding='async'`. Failed attempts do not trigger original-image downloads or alter gallery state. Removing unused image sources is best-effort browser cancellation; fetch priority is a browser hint.

Measured results from the controlled browser benchmark:

| Viewport | Cards without preload | Cards after preload | First-row photos without preload | First-row photos after preload |
| --- | ---: | ---: | ---: | ---: |
| Desktop, 1,440 px | 932 ms | 71 ms | 1,277 ms | 228 ms |
| Mobile, 390 px | 888 ms | 50 ms | 1,235 ms | 163 ms |

These are local Chromium samples with an imposed 800 ms API delay and 300 ms image delay, one fresh browser context for each mode and viewport. They demonstrate removal of a completed request from the click path; they are not live-production latency guarantees. Card time is measured from the actual click to matching cards entering the DOM. Photo time includes the wait until the first row has successfully loaded and cleared its loading state.

The benchmark uses a real local HTTP server without Playwright request interception, which would disable the browser's normal HTTP cache. Page 2 reached that server exactly once in both modes. Each first-row photo also reached it exactly once across preloading and navigation, confirming reuse of warmed bytes. Images had explicit long-lived cache headers. Raw measurements are preserved in [listings-prefetch-benchmark.json](./listings-prefetch-benchmark.json).

Final validation results:

- Development browser checks: 24 prefetch scenarios and the controlled performance/cache benchmark passed. The 14 existing desktop/mobile pagination and loading checks passed separately.
- Frontend TypeScript, targeted ESLint, harness TypeScript and whitespace checks passed.
- Four existing Node regression files passed: read retries, build cache policy, analytics, and warehouse-card links.
- The isolated production build passed its fresh-inventory checks: eight build-time inventory reads, 65 valid warehouse routes, the deliberately hidden warehouse excluded, 104 static loader entries and 99 sitemap URLs. All three changed application source files matched the built snapshot. The build used local fixtures and omitted the IndexNow publishing step.
- Production browser checks: 37 passed in 39.1 seconds, with the two development-only checks intentionally skipped. All new functional checks fail on unexpected browser JavaScript errors.
- Existing desktop/mobile image and gallery regressions: all 30 passed in 30.6 seconds. These cover loaded/failed images before hydration, WebP/original fallback, exhausted-image placeholders, timeout recovery, lazy loading, carousel preparation, keyboard/dot/touch controls, photo refreshes and stable layout. The fixtures now select warehouses with multiple photos where recovery requires a second photo.

The browser scenarios cover one-page lookahead, in-flight adoption, deduplication, filter changes and history, page-size changes, failed requests and later retries, Data Saver, 2G/slow-2G, hidden/offline tabs and resumption, cancellation, empty/single/final pages, responsive photo counts, viewport resizing, visible-image priority, failed WebP recovery, route changes, analytics isolation, and the pager's compatibility fallback. Mobile and tablet coverage uses Chromium viewports; this is not a Safari or Firefox certification.

A separate existing issue was found during the original prefetch work: direct filtered URLs produced React hydration errors 418/423 because static HTML contained the unfiltered grid while the first client render used URL filters. It was also reproduced with the original `Listings.tsx` from commit `1ea0412`, with preloading absent. The subsequent [listing URL-state change](./listing-url-state.md) fixes that mismatch by activating URL state after the matching initial hydration render. Empty and single-page prefetch checks now exercise direct filtered URLs and still fail on unexpected browser JavaScript errors.

To reproduce from the sibling `wareongo-evals` directory:

```sh
npm run test:prefetch
node tests/support/check-build-cache.mjs
```

The second command prints an isolated `WEBSITE_DIR`. Substitute that path below:

```sh
PREFETCH_BUILT=true WEBSITE_DIR=/tmp/wareongo-build-cache-XXXXXX/site npm run test:prefetch
WEBSITE_DIR=/tmp/wareongo-build-cache-XXXXXX/site ./node_modules/.bin/playwright test --config=playwright.images.config.ts
```

The production-browser configuration intentionally skips two development-only checks: analytics test mode is disabled on localhost production builds, and the real-HTTP benchmark needs the dedicated development API origin. Both passed in the development configuration. HTML reports are written to `wareongo-evals/output/prefetch-report`, `wareongo-evals/output/prefetch-built-report` and `wareongo-evals/output/image-report`. The validated build is `/tmp/wareongo-build-cache-Z79DM9/site`; the original-code comparison build is `/tmp/wareongo-build-cache-GeRS5x/site`. Both are temporary local artifacts.

Preloading does not guarantee an instant click when the user navigates immediately, jumps over the next page, the backend is waking up, or the connection restricts speculative loading. It can add one unused page request when someone stops browsing; photo traffic is limited to the next row near the pager. The normal loading/error UI and bounded API retries remain available. No backend, hosting, enrichment cron or deployment changes are included.
