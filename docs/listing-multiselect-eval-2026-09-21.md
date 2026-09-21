# Multi-select evaluation — 2026-09-21

The fresh full browser run passed **224 of 225 checks**, with **one failure and
zero skips**. The failure was the desktop previous-deployment test's exact URL
assertion before refresh. Its corrected recovery check subsequently passed
**nine of nine runs**, three each on desktop Chromium, mobile Chromium and
emulated iPhone WebKit, with retries disabled.

## Failure and resolution

An open tab running the preceding single-select bundle navigated to a new
state-listing payload and appended an empty `?type=` parameter. Listings remained
visible. The test expected `/listings/state/karnataka` exactly and timed out before
it reached the refresh step.

The accepted behavior is recovery on refresh. The test now checks the destination
pathname before refresh, records that URL, then requires the exact clean URL after
refresh. It still requires 21 cards, the correct total, and 42 unique listings
across the first two pages. All nine repeated recovery runs passed. The old tab's
temporary empty query parameter is not claimed to be fixed before refresh.

This evaluation changed test coverage and that test assertion; it required no
further application changes. No failure was found in the new filter interactions,
results, counts, paging, or overview behavior.

## Coverage and results

| Check | Result |
| --- | --- |
| Fresh production SSG build against local PostgreSQL/Redis/backend | Passed: 117 routes, 112 sitemap URLs |
| Complete listing and overview browser suite | 224 passed, 1 assertion failed, 0 skipped, 0 automatic retries |
| Corrected deployment-refresh check, same build | 9 passed, 0 failed, 0 skipped |
| Database integration | 14 passed, including 512 type/area/Fire NOC combinations |
| Listing/URL unit checks | 32 passed |
| Build-cache checks | 7 passed |
| Navigation checks | 15 passed |
| Backend cache checks | 6 passed |
| Website and harness TypeScript; changed application files ESLint | Passed |

The database matrix covers all 16 type selections × 16 area selections, both with
and without a Fire NOC requirement, against an independent fixture oracle. Cases
include the 10,000/25,000/50,000 boundaries, gaps, 120,000 sq ft stock, overlapping
bands, hybrid types, multiple units, missing sizes, hidden listings and mismatched
state/micromarket rows. Totals and every three-item page must match the oracle.

Additional browser checks verify a failed multi-select request preserves its
selections, hides stale cards and retries the same query. Resetting an empty search
must clear all groups while preserving page size, attribution and browser history.
The multi-select tests now explicitly fail on render or hydration errors.
The previous checks for mobile fit, keyboard controls, individual chip removal,
SSG data, navigation and all overview levels also ran.

## Evidence

Both the initial failed report and the recovery report are retained:

- [Initial browser report](../../wareongo-evals/output/multiselect-eval-2026-09-21/initial-report/index.html)
- [Recovery browser report](../../wareongo-evals/output/multiselect-eval-2026-09-21/refresh-report/index.html)
- [Machine-readable summary](../../wareongo-evals/output/multiselect-eval-2026-09-21/summary.json)

Logs and both raw Playwright result files are in that same output directory.
Initial run workspace: `/tmp/wog-listing-integration-0q6hlt`.
Recovery workspace: `/tmp/wog-listing-integration-46l4wA`.
All eight modified application source files were verified byte-for-byte against
the tested build. The preceding build's filter module matches the current Git
HEAD's pre-change module.

Reproduce from `wareongo-evals`:

```sh
LISTING_POSTGRES_PORT=55449 \
LISTING_LEGACY_SITE=/tmp/wog-listing-integration-0Qluvk/site \
WOG_WEBKIT_EXECUTABLE=/tmp/wog-webkit-browser \
npm run test:listing:integration

LISTING_POSTGRES_PORT=55449 \
LISTING_REUSE_BUILD=/tmp/wog-listing-integration-0q6hlt/site \
LISTING_LEGACY_SITE=/tmp/wog-listing-integration-0Qluvk/site \
WOG_WEBKIT_EXECUTABLE=/tmp/wog-webkit-browser \
npm run test:listing:integration -- tests/integration/deployment-transition.spec.ts --repeat-each=3
```

This is a local evaluation with disposable fixtures. No production deployment or
physical iPhone check was performed. The backend multi-select update must be
deployed before rebuilding the website against the production API.
