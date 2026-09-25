# Approved Ivory listing card evaluation

The shared production card now uses the approved Ivory design across listings,
location collections, editorial inventories and related properties. It has a
navy stroke and small hard shadow, Montserrat with natural tracking, a fixed
16:9 cover image, carpet area on the left and monthly rent per sqft on the right.
The card sinks 2px on hover, its shadow tightens, and its ivory background changes
from `#FBFAF5` to `#F6F4EE`. Reduced-motion preferences remove movement.

The only CTA is **Raise enquiry**, outlined at rest and filled on hover. It opens
the existing form with warehouse attribution, validation, retry and success
handling, and restores keyboard focus on close. Native property links, modifier
and middle clicks, arrow controls, touch swiping and image fallback remain intact.
Image counts are announced to screen readers without a visible count badge.

The compact outlined chips are 22px high with 12px text. Clear Height and Docks
retain their capitalization. Fire NOC appears only for a recorded Yes. Unknown
facts are omitted; zero docks means "Grade level only". BTS displays as
"Build to Suit". Decimal clear heights are parsed without joining digits across
units or ranges.

Location prefers the mapped micromarket with the most listings in the same city,
using the existing generated city-scoped inventory counts. Ties are alphabetical.
Without a mapped micromarket, addresses use at most 28 characters including the
ellipsis, with further CSS truncation on narrow cards. Locality and city stay on
one row; the full address remains in the title and accessible link name.

## Verification scope

Final runs passed with zero unexpected failures and zero automatic retries.
Coverage overlaps between the focused and general suites; the counts below
should not be added as unique test coverage.

| Check | Final result |
| --- | --- |
| Website Node suite | 20 test files passed |
| Card rendering/data regressions | 20 cases passed |
| General browser behaviour | 264 passed, no skips |
| Focused Chromium/WebKit card suite | 76 passed, no skips |
| Production database/backend/SSG/browser integration | 222 passed, 6 conditional skips |
| Backend SQL integration | 14 passed |
| URL/filter/history checks | 48 passed |
| Loading/prefetch checks and benchmark | 40 passed |
| Production Google tag transport | 2 passed |
| Visual comparisons | 9 cases, 21 pixel baselines passed |
| Screenshot capture | 15 pages and 36 crops |
| Approved standalone preview | 57 checks passed |
| Native tabs, repeated in full Chromium | 12 passed |
| Website/harness TypeScript and changed application ESLint | Passed |

The [machine-readable evidence](listing-card-redesign-evidence-2026-09-25.json)
records source hashes, build counts and final Playwright result summaries.

Checks cover widths from 320px to 1440px, actual photo proportions, all three
Fire NOC states, missing images/facts, zero and singular docks, decimal values,
long locations, Build to Suit, visit-time dates, dark/light text contrast,
hover/reduced motion, keyboard controls, forms, swipes and native links. Loading
placeholders match the new card. The detail placeholder also reserves the
two-line mobile breadcrumb height.

The production build used a disposable local PostgreSQL database, Redis and the
actual backend. Its eight changed application source files match the working
tree byte-for-byte. The build emitted 117 routes, 112 sitemap URLs and 73 property
destinations. Enquiry submissions and analytics collection were intercepted;
build notifications were disabled.

The six conditional integration skips are the previous-deployment scenario
(no older bundle supplied) and published service templates (not part of this
fixture), once for each browser project. WebKit checks use iPhone emulation.

## Eval maintenance

The browser harness now matches the existing multi-select filter dialog and
URL-controlled page sizes. Pagination checks identify properties by ID because
micromarket labels repeat. Mock API responses honor filters and provide the
backend capability header. Native-tab tests use full Chromium and context-wide
fixtures so new tabs receive their own API data. The real Google tag transport,
prefetch benchmark and pixel baselines each use their dedicated server/config.

Copy checks distinguish standalone missing-value table markers from prose.
Detail-loading geometry accounts for the measured visit-time timestamp block.
WebKit full-page evidence uses CSS pixels to stay within its bitmap limit.
The toast-loading check triggers a real intercepted enquiry before delaying the
on-demand toast chunk. Visual baselines were refreshed for the approved design
and verified again without updating them.

## Reproduction and artifacts

From the website repository:

```sh
node --test tests/*.test.mjs
npm run test:card-links
npx tsc --noEmit -p tsconfig.app.json
```

The browser harness is in the sibling `wareongo-evals` directory, which is not a
Git repository in this workspace. Its updated specs and reports remain there;
this website commit records the application changes, Node regressions and eval
evidence. From that directory:

```sh
npm run typecheck
npm run test:cards
npm run test:url-state
npm run test:prefetch
npm run shots
LISTING_POSTGRES_PORT=55440 npm run test:listing:integration
EVAL_BUILD_DIR=/path/to/fresh/site/dist npm run behaviour -- --workers=2
WEBSITE_DIR=/path/to/fresh/site npm run test:analytics:transport
```

Use `WOG_WEBKIT_EXECUTABLE` only for a host requiring a custom WebKit wrapper.
The verified fixture build is `/tmp/wog-listing-integration-awtdjD/site`.
The final integration run is `/tmp/wog-listing-integration-hMFM37`.

- [Standalone cards and full pages](../../wareongo-evals/output/screenshots/index.html)
- [Card browser report](../../wareongo-evals/output/card-report/index.html)
- [Integration browser report](../../wareongo-evals/output/listing-integration-report/index.html)
- [URL-state visual report](../../wareongo-evals/output/url-state-report/index.html)
- [Approved HTML preview](../../listing-card-designs/ivory.html)
- [Preview validation](../../listing-card-designs/validation.json)
