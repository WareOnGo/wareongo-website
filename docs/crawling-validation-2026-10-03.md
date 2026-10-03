# Catalogue crawling validation — 3 October 2026

Implemented locally and tested. No commit, push, deployment, CMS write, production
database write or IndexNow submission was performed. The backend working tree
is unchanged. Existing UI/copy changes in the website working tree were preserved.

## Demonstrated problems and changes

| Finding | Implemented behavior |
| --- | --- |
| Direct `?page=2` requests returned page one's HTML and canonical. | Every normal grid/overview page has its own build-time HTML, visible cards, pagination anchors and self canonical. |
| Five footer shortcuts used JavaScript buttons; closed desktop location links were absent from the DOM. | Footer shortcuts are real links. The location menu's links remain in the HTML while the panel is hidden. Keyboard, focus, analytics and native new-tab behavior were tested. |
| Filter permutations relied on canonical consolidation. | Known filter parameters and nonstandard page sizes additionally receive HTTP `X-Robots-Tag: noindex, follow`; hydrated metadata agrees. This is preventive hardening, not evidence of measured crawl-budget loss. |
| Initial hydration could reset scrolling while a reader clicked a prerendered pagination link. | Initial document position is preserved. Later route and homepage-fragment navigation retain their intended scroll behavior. |

Page-one listing HTML already existed. This change extends prerendering to
pagination; it does not replace the application or its matching pipeline.
Existing curated city, state, type and micromarket routes remain available,
including RCC. Interactive combinations do not create additional static routes.

## Build and routing contract

- The normal SSG build renders page one. The catalogue hook renders additional
  pages with the same React components, route IDs and backend matching endpoint.
  Grid responses must agree on totals and page size and contain no duplicate
  IDs across pages. Missing/inconsistent results fail the build.
- Public URLs remain `/listings/...?...` and `/overview/...?...`. Physical HTML
  lives under `/__catalogue/<public-path>/<page>/index.html`. Page one is moved
  there **after** sitemap validation, because a public filesystem match would
  otherwise take precedence over Vercel's query rewrites.
- Static rules select normal pagination (21 grid cards or 6 overview cards).
  Filtered, legacy-size, malformed or nonexistent page requests fall back to the
  category seed and retain the existing browser filtering/clamping behavior.
  Canonicals consolidate invalid permutations. Internal backing URLs are noindex.
- One content-hashed JSON file per overview retains the complete loader shape,
  inventory, statistics and image maps. Each HTML page includes its visible
  cards and a small reference. The existing loader manifest points to this same
  JSON, preserving old-bundle navigation.
- Overview hydration waits for that file. Failed/invalid downloads preserve
  readable HTML and native links, with a Retry control. Requests time out after
  15 seconds; missing files use the existing bounded old-deployment reload guard.
- Grid cache keys, backend predicates, ordering, filter controls and prefetch
  logic are retained. Explicit page seeds refresh on entry, including immediately
  after a build. Structured data follows the currently visible results.
- No listing Vercel Function or new request-time renderer was added. The existing
  warehouse redirect middleware is unchanged. Static traffic and builds still
  consume the hosting plan's normal resources; this is not an unmetered service.
- The sitemap contains the existing curated categories and warehouse URLs.
  Neither pagination queries nor private backing paths are added.

For local routing checks, use `wareongo-evals/tests/support/serve-built-site.mjs`
with `WEBSITE_DIR` pointing to an isolated build. It compiles the actual
`vercel.json` rules and serves built files without an SPA fallback. Plain
`vite preview` does not emulate these CDN rules and is not a routing validator.

## TDD and regression evidence

Regression tests reproduced the old page-two cards/canonical, missing footer and
closed-menu anchors, missing filter noindex, and malformed static-routing
behavior before the corresponding fixes. The navigation baseline used isolated
HEAD components so existing working-tree edits were not reverted.

Full builds exposed two additional issues which were reproduced and corrected:
SSG's nested Helmet instance must own the renderer's provider, and the SSG root
listing hook receives a relative path. A fresh-seed test also forced a future
timestamp to prove that page-two hydration still refreshes matching API data.

The controlled scroll regression held the application bundle while scrolling
the existing HTML. It reproduced a **9,567 px** jump before the fix and passed on
all three browser projects afterward. Additional tests follow pagination links
with JavaScript disabled, and exercise failed shared-data downloads and retry.

| Validation | Result |
| --- | --- |
| Real PostgreSQL + Redis + backend + production SSG + browser harness | **249 passed**, 3 skipped, 0 failed, 0 flaky; desktop Chromium, mobile Chromium and iPhone-profile WebKit |
| Backend filter integration | **14 passed**, including actual SQL matching, public fields, pagination, cache isolation and unchanged overview data |
| Navigation, focus, native links and analytics suite | **74 passed** |
| Listing loading, prefetch and image-cache suite | **40 passed** |
| URL state, history, native links, pagination and analytics suite | **48 passed** |
| Catalogue rendering/build/hydration/routing unit checks | **13 passed** |
| Existing listing URL/seed/pagination checks | **33 passed** |
| Navigation unit checks; website/harness TypeScript; changed TypeScript lint; whitespace checks | Passed |
| Micromarket rebuild lifecycle | Missing geography and loader failures rejected; publish, delist and republish passed |
| State/city rebuild lifecycle | Content/geography/loader failures rejected; publish, delist and republish passed |
| Vercel configuration | 39 compiled rules; installed CLI 62.1.0 and routing-utils produce identical validated output |

The three skips require a different fixture with four published service templates;
they are unrelated to catalogue crawling. WebKit ran in the official Playwright
1.62.1 container because the host lacks its required libjpeg runtime. This is
browser-engine coverage, not testing on a physical iPhone.

Harness maintenance restored the ad-page fixture endpoint and the fixture-only
image membership SQL function, updated assertions for the existing six-card
overview and input/border styles, and checked the new physical build paths.
Small-screen checks retain touch-target, overflow, modal-boundary and reachable
action assertions. Animation and Helmet assertions wait for their observable
final state. Supplementary Vite suites were rerun sequentially after concurrent
development servers produced startup failures; all passed without app changes.

## Full-inventory size and artifact audit

The read-only live API build completed with 2,231 warehouse routes and 411
catalogue categories. Measured output:

| Measurement | Result |
| --- | --- |
| Complete output | 643,908,537 bytes, approximately **614 MiB**; 7,748 files |
| Additional pagination pages | **683**: 441 grid and 242 overview pages |
| Additional pagination HTML | 118,886,538 bytes, approximately **113 MiB** |
| Shared overview inventory | 6 files, 2,325,995 bytes total |
| Largest HTML file anywhere in the build | 282,844 bytes |
| Sitemap | 2,570 public URLs; no query permutations or backing paths |
| Latest local build duration | **12 minutes 10 seconds**, with image caches already populated |

The initial implementation took 33 minutes locally. Reusing a DOM per category
and omitting serialization of the full overview inventory on each additional
page removed avoidable build work. The later timing also benefits from warm
caches; it is not a controlled claim that this refactor alone explains the full
timing difference, nor a prediction of Vercel's build duration.

An independent HTML/artifact audit checked **all 1,094 catalogue pages**:
exact seed/card agreement, complete inventory coverage without duplicates,
canonicals, 987 CollectionPage schemas, 5,842 pagination links, reachability from
page one, warehouse destinations, content hashes, fetch preloads, and all 2,668
loader-manifest entries. No public page-one file can shadow the query rewrites.

Vercel documents a 45-minute build limit, 2,048 routing rules, and no fixed upper
limit on generated output-file count. Its Hobby 100 MB CLI limit applies to
uploaded source files, not the generated HTML measured above.
[Vercel limits](https://vercel.com/docs/limits).

The full-inventory measurement includes the final generator/deduplication code.
The subsequent initial-scroll guard was verified in a fresh production fixture
build and the complete browser harness; it does not change page enumeration.

## Reproduction and artifacts

From the website: `npm run test:crawling`, `npm run test:listing-url`,
`npm run test:navigation`, and `npx tsc --noEmit -p tsconfig.app.json`.

From the eval harness: `npm run test:listing:integration` (set
`LISTING_LEGACY_REF=HEAD` to include the previous bundle), `npm run test:navigation`,
`npm run test:prefetch`, the URL-state specs listed in the evidence file,
`npm run test:overview:rebuild`, `npm run test:overview:locations:rebuild`, and
`npm run test:build:live-api`. Use a free local PostgreSQL port through
`LISTING_POSTGRES_PORT`; this run used 55449. WebKit optionally connects through
`WOG_WEBKIT_WS_ENDPOINT` when a supported browser container is needed.

- [Machine-readable evidence](crawling-validation-2026-10-03.evidence.json)
- [Final integration report](../../wareongo-evals/output/listing-integration-report/index.html)
- [Final integration results](../../wareongo-evals/output/listing-integration-results.json)
- Final application build: `/tmp/wog-listing-integration-jMMS8J/site`.
- Final browser/database run: `/tmp/wog-listing-integration-nZa4GI`.
- Full-inventory size build: `/tmp/wog-live-backend-build-lbsd19`.
- Micromarket lifecycle: `/tmp/wareongo-overview-rebuild-vgy2eO`.
- State/city lifecycle: `/tmp/wareongo-location-rebuild-efWa5J`.

No production CDN request was tested against these pending changes. A preview
deployment must still establish actual Vercel build-resource usage and response
behavior before release. No Search Console, crawl-log, traffic or enquiry uplift
is claimed by this implementation audit.
