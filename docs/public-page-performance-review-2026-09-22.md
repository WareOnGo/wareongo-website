Public-page performance review — 2026-09-22

This change reduces initial downloads and fixes accessibility and image layout
issues across the public page templates. Individual warehouse-detail pages were
excluded from optimization and Lighthouse measurement, as requested. Existing
warehouse-detail checks still ran where they belong to shared regression suites.

The baseline is `75c5e67e34089c02b020fac4f4a6268edabaf04d`, which already contains
the earlier homepage and listing-grid performance improvements. The user's
original 92/62 PageSpeed reports therefore are not the baseline for this change.

Changes and behavior preserved:

- Reserve the existing blog image dimensions before loading, including the
  natural-size and portrait-height caps. The measured image-article CLS fell
  from 0.0462 to zero. Loaded image geometry remains unchanged.
- Generate responsive editorial images and listing covers at build time for
  state, city and locality overviews. Keep original CMS URLs, gallery photos,
  crops, pagination and enquiry behavior. Missing generated images retry their
  original source, including failures before hydration attaches event handlers.
- Preload the overview hero on desktop, where it appears beside the text. Keep
  eager discovery with ordinary priority on phones, where it follows the text.
  Responsive preload and image selection share one download at all tested sizes.
- Split homepage JavaScript from other routes while keeping its CSS available
  to static generation and critical-CSS extraction. Keep route IDs unchanged.
- Load the toast UI on the first message. Messages queue while the chunk loads;
  the mounted host persists across navigation. Form payloads, validation,
  attribution, dismissal and analytics behavior are retained.
- Use generated blog summaries on index/related-link pages instead of bundling
  full articles. Generate smaller logo sources with the original retained for
  high-density screens. A 1,188-byte rupee font subset avoids downloading the
  68-KB Latin-ext face for prices; all other glyph coverage remains available.
- Correct main landmarks, heading order, definition-list structure and link
  identification. Preserve visible text, layout and navigation destinations.

No API, authentication, search, sorting, pricing, lead-submission or analytics
business rules were changed. Image generation uses the existing build-only
`sharp` dependency; no paid image service or backend/R2 writes are introduced.
Downloads/conversions are bounded, restricted to public R2 image URLs, cached
and deduplicated. Failed optimization retains the original URL. Publishing
fails if the build references a generated asset that is missing. Cache keys
assume CMS upload URLs identify immutable files, as the existing cover pipeline
does. New uploads with new URLs get new variants.

Lighthouse results:

The table shows standard simulated mobile/desktop audits using Lighthouse
13.4.1 and Chromium 151. Compressed HTTPS/HTTP2 production assets were served
locally under the production hostname; public API, R2 and analytics requests
remained enabled. Audits ran sequentially with fresh browsers. These are lab
comparisons, not live PageSpeed scores or field Core Web Vitals.

| Template | Baseline mobile | Updated mobile | Updated desktop |
| --- | ---: | ---: | ---: |
| Home | 95 | 96 | 100 |
| Lucknow listing grid | — | 95 | 100 |
| About | 98 | 97 | 100 |
| Warehouse request | 95 | 95 | 100 |
| Blog index | 94 | 95 | 100 |
| Comparison article | — | 97 | 99 |
| Image article | 95 | 97 | 98 |
| Case-study index | 94 | 96 | 100 |
| Case-study article | — | 94 | 100 |
| Kompally overview | 95 | 94 | 100 |
| Privacy | — | 96 | 100 |
| Terms | — | 97 | 100 |
| Public login | — | 97 | 100 |

All 13 updated samples scored 100 for accessibility. Public content pages
scored 100 for Best Practices and SEO. Login remains deliberately `noindex`
(SEO 66) and its Google sign-in console diagnostic leaves Best Practices at 96.
No login was performed. Four service templates were checked with published
fixture content; their fixture results are not presented as live Lighthouse
measurements.

The scores do not improve uniformly. About repeated at 97 with LCP around
2.25 seconds versus the baseline's 2.03 seconds, although its initial transfer
fell from 565 KB to 525 KB and blocking time decreased. The overview initially
regressed to 91 in two simulated runs when its new local hero had high priority
on mobile. Matching priority to the layout brought LCP from 3.23–3.30 seconds
to 2.58–2.59 seconds. The isolated final run scored 94, versus baseline 95 and
2.40-second LCP. A preceding run scored 93 while a brief TypeScript check was
also running; it was repeated without concurrent work.

An additional paired run with actual DevTools network/CPU throttling produced
essentially identical overview FCP/LCP: 966.55 ms before and 965.99 ms after.
Its performance score was 88 in both, with TBT 476/483 ms. These actual-throttle
results are diagnostic and are not mixed into the simulated-score table.
They do not establish that every real visitor will load faster.

Concrete download reductions in the paired mobile samples:

| Resource/page | Before | After |
| --- | ---: | ---: |
| Shared app JavaScript, gzip | 154,638 bytes | 143,908 bytes |
| Blog index, total transfer | 518,625 bytes | 419,221 bytes |
| Image article, total transfer | 611,762 bytes | 531,159 bytes |
| Kompally overview, total transfer | 1,700,452 bytes | 860,788 bytes |
| Overview hero, original / mobile-selected variant | 375,644 bytes | 80,280 bytes |

Validation was performed after each stage:

| Stage | Checks and result |
| --- | --- |
| Blog geometry | 8 Chromium cases passed: mobile/desktop, portrait/landscape/small images, delayed image loading and unchanged loaded dimensions. |
| Accessibility | 11 page-type flows and targeted axe checks passed, including landmarks, headings, links and overview definition lists. |
| Overview images | 8 final cases passed: mobile 1×/2×/3×, tablet, desktop 1×/2×, no JavaScript, missing variants; one hero download, original fallback, gallery, pagination and history. |
| JavaScript splitting | Repeated 11 page flows; 3 queued-toast cases passed for success across navigation, server failure and client validation. POSTs were mocked and analytics collection blocked in form tests. |
| Homepage CSS | 12 cases passed, including mobile/desktop without JavaScript, JPEG fallback, failed images and delayed full CSS. A missing critical-CSS issue found during the split was fixed before proceeding. |
| Font and logos | 4 cases passed across mobile/desktop densities; rupee outline/advance and text widths preserved, extended character coverage retained. |
| Shared listing behavior | 40/40 prefetch/loading scenarios and 8/8 final-build Chromium listing/photo/fallback/enquiry scenarios passed. |
| Service templates | 2/2 browser scenarios, each covering all four services at mobile/desktop, passed: metadata, schema, FAQ, request CTA, history and overflow. |
| Unit/static checks | 144/144 Node tests passed. TypeScript and whitespace checks passed. Changed-file lint has the pre-existing RequestWarehouse `err: any` finding; the repository is not claimed lint-clean. |
| Production generation | Final complete public-API build passed: 2,529 loader routes, 2,106 warehouse destinations, 2,430 sitemap URLs, and 56 published overview assets. IndexNow notification was skipped during evaluation. |
| Static output and integration | All 410 checked public/listing routes preserve their baseline title, H1, canonical and robots metadata and have one main landmark. All promised overview images exist. The combined working tree passes TypeScript and all 20 unit-test files, including the user's separate image-pipeline tests. |

The broad harness is not entirely green. Navigation/analytics/enquiry checks
passed 71/74 and built overview checks passed 87/90. All six failing checks
were rerun on the unchanged baseline and reproduced:

- Analytics deep-link trigger expects `deeplink`, receives `history` during
  canonical alias handling.
- Filter test expects “Show filters” / “Hide filters”; current controls say
  “Filters” / “Close filters”.
- History test expects Bangalore instead of the existing canonical Bengaluru.
- Mobile warehouse-detail skeleton gallery differs by 8 pixels.
- Mobile state and city listing skeleton grids differ by 63 pixels from their
  destinations (two checks).

These assertions were not weakened and the unrelated behavior was not changed.
No new behavioral regression was detected by the executed checks. WebKit could
launch but its installed automation session stalled on navigation, so this pass
does not claim Safari/WebKit validation. Authenticated roles were checked using
fixtures; production authentication and real lead delivery were not exercised.

Reproduction:

```sh
node --test tests/*.test.mjs
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

The adjacent `wareongo-evals` workspace contains the browser runners:

```sh
WEBSITE_DIR=/path/to/website npm run test:navigation
WEBSITE_DIR=/path/to/website npm run test:prefetch
WEBSITE_DIR=/path/to/built/website npm run test:overview
node tests/support/audit-page-types.mjs /path/to/dist /tmp/public-lighthouse mobile,desktop all
node tests/support/check-overview-images.mjs /path/to/dist /tmp/overview-images
node tests/support/check-deferred-ui.mjs /path/to/dist /tmp/toast-check
CHECK_A11Y=1 node tests/support/check-page-types-audit.mjs /tmp/page-check /path/to/dist
```

Compact measurements are in `public-page-performance-evidence-2026-09-22.json`.
Full local artifacts are under `/tmp/wog-public-page-stages/`: stage builds and
browser summaries, Lighthouse JSON/HTML/screenshots, full public-API and fixture
builds, and the matching baseline failure logs. Unrelated working-tree changes
were isolated from this implementation and its commit.
