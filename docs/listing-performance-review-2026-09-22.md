Listing performance review — 2026-09-22

All listing grids share the loading changes: the main `/listings` page, city,
state, locality, PEB and RCC routes, and pagination/filter results. Build-time
photo optimization applies to the first card of each prerendered listing route.
Other photos and fresh results keep their existing remote WebP/original path.
Warehouse detail pages do not receive these card covers.

The supplied Lucknow mobile report scored 62, with an 8.4-second LCP and
96 accessibility. It describes an older deployment. The baseline for this
change is commit `d684807`, which already includes the homepage/font/CSS work.

Changes:

- Generate a 768-pixel WebP cover at quality 68 for each distinct first-card
  photo during static generation. A local, hashed asset avoids the extra R2
  connection for that initial photo. Lucknow's first photo falls from about
  109 KiB to 40 KiB. Its aspect ratio and the card's existing crop are preserved.
- Preload the exact first-card source in prerendered HTML and preconnect to
  the API and remote photo origin. Only the first card is eager/high priority;
  other cards use native lazy loading, including visible desktop cards.
- Wait for visible current-page photos before starting speculative next-page
  data requests. Pagination retains its existing cache and in-flight reuse.
- Enlarge gallery dot controls to 32-by-32 pixels, with keyboard focus styling
  and horizontal scrolling when a gallery has many photos.

The first photo remains ordinary prerendered HTML and works without JavaScript.
If its local cover is unavailable, recovery tries the existing remote WebP and
then the original. Gallery navigation remembers a successfully recovered source.
If refreshed inventory changes a photo URL, its old cover is no longer used.
Existing image timeouts, next-photo recovery and terminal placeholders remain.

`sharp` is a pinned build-only dependency and is absent from browser bundles.
Conversion allows only public R2 image URLs, disables redirects, limits download
size and decoded pixels, sets download/processing timeouts, and caps concurrent
work at two. Related pages share each download/conversion; warm builds reuse
the cache under `node_modules/.cache/wareongo-listing-covers-v1`. The versioned
filename includes the source URL and conversion settings, assuming photo URLs
identify immutable files. Change that version if conversion settings change.

An unavailable, unsupported or already smaller source retains the ordinary
remote photo. Publishing copies only covers referenced by the current loader
payloads and fails if a promised asset is missing. No paid request-time image
optimizer or backend/R2 mutation is involved. The existing static WebP cache
headers also apply to the hashed covers.

Measured on the full production build with Lighthouse 13.4.1 / Chromium 151:

| Mobile audit | Baseline, median of 3 | Updated, median of 3 |
| --- | ---: | ---: |
| Performance | 87 (87, 74, 87) | 95 (95, 94, 96) |
| Accessibility | 96 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 1.84 s | 1.69 s |
| LCP | 3.68 s | 2.30 s |
| Total blocking time | 149 ms | 168 ms |
| CLS | 0 | 0 |

The desktop check scored 100 in all four categories, with 0.534-second LCP,
16 ms total blocking time and zero layout shift.

Both versions used compressed HTTPS/HTTP2 local production assets and standard
simulated mobile throttling, with fresh browser contexts. Only the audit
browser mapped `wareongo.com` to the local server; public API, R2 and Google
analytics requests remained real and enabled. This preserves production origin
and CORS behavior. Remote-photo latency varied: baseline LCP ranged from
3.65–6.61 seconds; the updated runs ranged from 2.29–2.31 seconds. Earlier
single-run samples are not substituted for these repeated measurements.
These are lab comparisons, not live PageSpeed results or field Core Web Vitals.
The supplied report had no field data. Main-thread work and other remote photos
still leave room for further improvement.

Validation:

- Full production build passed against the public read API: 2,527 prerendered
  routes, 2,104 warehouse destinations and 2,428 sitemap URLs. IndexNow was
  disabled during evaluation.
- All 399 generated listing routes were checked. 397 reference optimized covers;
  the two Satna routes retain the normal photo path. Every promised cover exists,
  matches its first card's source, and has a matching image preload. The build
  published 215 distinct covers, totaling 7,153,428 bytes.
- All 399 listing pages retain the baseline title, H1, canonical URL and link
  destinations in their generated HTML.
- All 40 pagination, loading and prefetch browser scenarios passed, including
  waiting for a slow visible image, Next adopting an in-flight request, filter
  cancellation, failed/empty results, history, Data Saver, 2G, hidden/offline
  tabs, responsive photo warming and the no-IntersectionObserver fallback.
- All 16 final-build cases passed across Chromium and WebKit: 320/390/1440-pixel
  layouts, no horizontal overflow, one cover request, no duplicate original
  request, usable enquiry dialog/keyboard dismissal, JavaScript-disabled HTML,
  missing-cover/WebP/original recovery, stable exhausted-image placeholders,
  gallery return after recovery and replacement of changed photo URLs.
- The 32 listing URL/seed/prerender Node cases, four card-link cases and three
  new image conversion/cache/publishing cases passed. TypeScript, targeted
  ESLint and whitespace checks passed.
- The controlled prefetch benchmark still made exactly one next-page request.
  Desktop cold/warm card times were 926/100 ms and photo times 1,371/288 ms;
  mobile card times were 916/88 ms and photo times 1,281/287 ms. These local
  fixture timings establish cache reuse, not production latency guarantees.

To reproduce the unit checks and build in this repository:

```sh
npm run test:listing-covers
npm run test:listing-url
npm run test:card-links
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

The adjacent `wareongo-evals` workspace contains the browser harness:

```sh
WEBSITE_DIR=/path/to/website npm run test:prefetch
node tests/support/check-listing-performance.mjs /path/to/website/dist /tmp/listing-check
```

Local evaluation artifacts are in `/tmp/wog-listing-audit/`: `full-source/dist`,
`full-build.log`, `route-coverage.json`, `browser-confirmed/`, `prefetch-final/`,
`baseline-repeat/`, `final-mobile/` and `final-desktop/`. The Lighthouse folders
include full JSON and HTML reports. The temporary audit runner is
`lighthouse.mjs`; it supports mobile/desktop and alternate listing paths.
