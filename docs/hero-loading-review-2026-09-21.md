Homepage loading review — 2026-09-21

The hero now shows a whole-frame preview while its photo loads. AVIF reduces
photo transfers by 40–48%, with progressive JPEG for browsers without AVIF.
Montserrat is served locally with a matching preload, critical page styles
are embedded during prerendering, and blog/case-study collections no longer
ship in every page's initial JavaScript. The homepage has one main landmark.

The original photo, responsive dimensions, crop, copy, links and analytics
handlers remain the same. Rendering the hero does not require hydration,
an image load-state handler, an opacity animation or JavaScript.

Delivery changes:

- The 1,912-byte WebP preview is embedded in CSS and uses the final photo's
  crop. It also remains visible if the full photo fails. The ordinary eager,
  high-priority picture element selects one supported responsive photo.
- The old font preload fetched an unused file while the Google stylesheet
  requested a different Montserrat file. Local WOFF2 faces preserve weights
  300–800 and all five Unicode subsets, with `font-display: swap`. Only the
  Latin variable font is preloaded; other subsets load when needed. Vite
  fingerprints the CSS and HTML references to the same file. The license
  ships under `public/licenses/`.
- The existing static generator's Beasties integration embeds the styles used
  by each prerendered document. Its compatible dependency is pinned. The full
  shared stylesheet is preserved and loaded with the media strategy, including
  a noscript fallback. Automatic font preloading is disabled to avoid fetching
  unused subsets. Keyboard-focus motion overrides are explicitly retained.
- Blog and case-study content imports are asynchronous inside `getStaticPaths`.
  The static build still generates every detail page; browser navigation loads
  each collection with its page. Initial JavaScript falls from about 191 KB to
  155 KB compressed. Route positions and loader IDs are unchanged.

Photo sizes in bytes:

| Candidate | Previous WebP | AVIF | Reduction |
| --- | ---: | ---: | ---: |
| Mobile, 960 px | 161,196 | 84,373 | 47.7% |
| Desktop, 1536 px | 294,612 | 177,600 | 39.7% |
| Desktop, 2560 px | 667,034 | 385,660 | 42.2% |
| Desktop, 3840 px | 1,186,304 | 646,857 | 45.5% |

Desktop progressive JPEG fallbacks are larger than the previous WebPs. The
tradeoff is whole-frame progressive rendering on browsers without AVIF. Tested
Chromium and WebKit select AVIF without also downloading the JPEG. Critical
CSS adds roughly 9 KB compressed to homepage HTML while removing the shared
stylesheet from the initial render's blocking requests; it adds no browser JS.

Lighthouse 13.4.1, Chromium 151.0.7922.34, compressed local production output,
production charset/cache headers, standard simulated mobile and desktop
profiles, and cold browser contexts produced these final results:

| Audit | Mobile (median of 3) | Desktop (1 run) |
| --- | ---: | ---: |
| Performance | 94 (runs: 95, 94, 94) | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 1.66 s | 0.387 s |
| LCP | 2.93 s | 0.650 s |
| Total blocking time | 0 ms | 0 ms |
| CLS | 0 | 0 |

The image-only change retained a median mobile score of 92 in the earlier
paired audit. The font, CSS and JavaScript changes raised that to 94. In the
final targeted before/after pairs, mobile performance ranged from 90–92 before
and was 94 in all three candidate runs; median FCP fell from 2.05 to 1.66 seconds,
LCP from 3.33 to 2.93 seconds, and CLS from 0.0048 to zero. Initial styled text
and LCP still limit the score; unused JavaScript and logo-image savings remain.
These are local lab results, not a prediction of an identical production
PageSpeed score or field Core Web Vitals. The supplied PSI report had no field data.

Validation:

- The complete production build against the deployed public read API passed in
  an isolated staged-source copy: 2,527 prerendered routes, 2,528 HTML files
  including the 404 alias, and 2,428 sitemap URLs. IndexNow was disabled.
- Compared with the earlier complete build, all 2,528 HTML destinations retain
  the same titles, H1 text, canonical URLs and links. Blog/case-study detail
  pages remain prerendered and discoverable after splitting their imports.
- Twelve production browser cases passed in Chromium and twelve in WebKit:
  responsive sources at 320/390/768/1440/1920 CSS pixels and multiple densities,
  reduced motion, hydration, request CTA navigation, contact dialogs, one photo
  request, one local font payload, canonical/main/H1 semantics, no horizontal
  overflow, half-streamed images without JS, JPEG fallback and failed images.
  Delaying the shared CSS preserved the initial and final header/hero geometry.
- The navigation/layout/enquiry suite passed 66 of 67 cases initially. The
  remaining scroll case also failed intermittently on the earlier build: the
  test clicked while the sticky header was still animating, allowing Playwright
  to scroll it into view. Waiting for the reveal transition fixed the harness
  race; five consecutive focused runs passed without an application change.
- Header scrolling passed across the homepage and six other page types in
  mobile Chromium, desktop Chromium and WebKit. Four targeted Node test files
  passed (navigation, popularity, analytics, card links). TypeScript and diff
  checks passed. Changed TSX/config files passed ESLint with explicit default
  options for the installed plugin's `no-unused-expressions` option bug.
- A concurrent listing typography/font-cleanup commit (`ecab28e`) reached main
  during evaluation. It is preserved separately. The integrated SSG build and
  eight listing-layout/enquiry browser checks passed; critical CSS for the
  homepage, About and warehouse-request pages matches the complete build.

Local evidence:

- `/tmp/wareongo-hero-loading/final-source/`: isolated production source/output.
- `/tmp/wareongo-hero-loading/final-production-build.log` and
  `static-page-comparison.json`: build and all-page semantic comparison.
- `/tmp/wareongo-hero-loading/lighthouse-final-production/`: final complete-build
  Lighthouse HTML/JSON reports and summary; `lighthouse-final/` contains the
  paired targeted comparisons.
- `/tmp/wareongo-hero-loading/audit/` and `final-webkit/`: browser results/screenshots.
- `/tmp/wareongo-hero-loading/final-navigation*/` and `final-header-scroll/`:
  browser regression artifacts, including the diagnosed harness race.

Reproduce with the adjacent `wareongo-evals` harness:

```sh
npm run test:build:live-api
node tests/support/check-hero-loading.mjs /path/to/ssg-build
HERO_BROWSER=webkit WOG_WEBKIT_EXECUTABLE=/tmp/wog-webkit-browser \
  node tests/support/check-hero-loading.mjs /path/to/ssg-build
npm run test:navigation -- tests/specs/navigation.spec.ts \
  tests/specs/skeleton-layout.spec.ts tests/specs/warehouse-card-enquiry.spec.ts
WOG_WEBKIT_EXECUTABLE=/tmp/wog-webkit-browser \
  npm run test:mobile-navigation -- --grep 'compact mobile header'
```

See [hero-image.md](hero-image.md) for asset regeneration and
[the font sources](../src/assets/fonts/README.md) for provenance.
