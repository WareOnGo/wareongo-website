# Listing filters adversarial audit — 21 September 2026

The later [production smoke check](listing-production-smoke-2026-09-21.md)
validated the deployed backend, built all production routes, and fixed a separate
notification hydration race. It also corrects the earlier iPhone issue wording.

The shared listing view and native backend filtering remain the right shape.
The first audit found and fixed six concrete problems. The second pass found no
additional application fixes. Refreshing is the accepted recovery for an old
JavaScript bundle receiving the new, shorter loader payload.
This is local validation, not certification of a production deployment.

## Findings and corrections

| Priority | Failure case | Correction and evidence |
| --- | --- | --- |
| P1 | A stale baked page refreshes while the API fails. `isError` hid valid cards and pagination even though React Query retained data for that exact search. | Distinguish initial-load failure from refresh failure. Keep same-search results, show a retry notice, and continue to hide previous-search cards when a new filter fails. Reproduced before the fix; all three browser projects now pass both failure cases. |
| P2 | A micromarket tag spans cities. The API grid intersected membership with the parent city, but heading type counts still included other cities. | Compute grid counts and size summaries from the same city scope. A six-record regression asserts five grid records with three PEB/two RCC while the overview retains all six records and its original four PEB/two RCC counts. |
| P2 | The API's single-type contains match includes `PEB + RCC`, while link counts and route/sitemap enumeration required an exact type. Repeated location whitespace could also omit type routes. | Share geography normalization and type matching across listing summaries and route generation. Hybrid stock appears under both applicable types; overview classification is unchanged. Three metadata/route regressions failed before correction and pass now. |
| P2 | A new bundle receives a cached loader payload without `filters`, `pagination` or `summary`. Reading those fields caused a render failure and forced a reload. | Adapt the legacy complete inventory into a scoped, descending, 21-item seed and mark it stale for an API refresh. The browser regression supplies all 65 old-format records and checks that navigation performs no document reload. |
| P1 | Building against an older backend could silently ignore micromarket/exact-location filters while returning HTTP 200. | Successful listing responses now declare `X-Wareongo-Listing-Filters: 1`. Fresh build reads require it alongside the existing cache-bypass acknowledgement. Both a direct transport test and the actual location-generator test reject an older response. No browser capability request or additional cache was added. |
| P1 | React Router catches a loader exception, so SSG could successfully render the error boundary into an HTML page. The additional filtered build reads exposed this existing weakness. | The route boundary rethrows during prerendering; browser recovery remains unchanged. The real router/SSR regression failed with “Missing expected rejection” before the fix and passes now. The overview rebuild harness also verifies a deliberate loader failure exits unsuccessfully. |

The grid seed helpers do not fetch or filter complete inventory in a visitor's
browser. Normal responses already contain the bounded seed. The legacy adapter
only reads the payload supplied by an older build; it does not download a second
catalogue. Overview loaders still return their complete inventory.

## Accepted old-tab behavior and rollout checks

**P2 — an old bundle receiving new loader data is not fully compatible.**
The reverse of the legacy-payload adapter's compatibility case remains: the previous
`LocationListings` uses `warehouses.length` and local array pagination. If that
bundle receives the new 21-item payload through the stable manifest, it treats
21 as the entire inventory. Keeping route IDs stable does not fix that schema
change, so the existing harness test was renamed to describe only ID stability.

The second audit reproduced this locally using an actual build of the previous
website revision, `3ee5594`: an already-open city page navigated with its old
JavaScript to a new state payload and displayed a total of 21 instead of 65.
A normal refresh restored the current filters, the correct total of 65 and API
pagination. The recovery test then visited page two and checked 42 distinct IDs
across the first two pages on desktop Chromium, mobile Chromium and WebKit.

The user accepted refresh as sufficient for this deployment transition. This
does not require a further compatibility layer or block release. No duplicate
full-inventory payloads, second manifest system or automatic reload loop were
added. This is a local reproduction, not an observed production incident or a
claim of seamless compatibility for every already-open tab.

Deploy the backend before building the website; the new build check enforces
that prerequisite. If reverting, revert the website first. Offset pagination
still allows gaps/duplicates if inventory changes between separate requests,
and Redis responses can reflect a different time from a fresh build. This is
not a snapshot guarantee across an entire browsing session.

Physical iPhone testing is unavailable. The earlier startup report was a single
local emulated-WebKit timeout, followed by two passing reruns. It was not a
confirmed physical-device bug. The subsequent production smoke investigation
is recorded in [the production smoke report](listing-production-smoke-2026-09-21.md).

## Complexity and regression review

- Each visible page uses one bounded API request, plus the existing optional
  next-page prefetch. The former full-inventory browser workaround is removed.
- The database uses a shared, parameterized predicate for page and count inside
  one repeatable-read transaction. Filtering precedes pagination; two area
  bounds must match the same unit. No migration or extra catalogue cache.
- Public output remains explicitly selected, hidden inventory stays excluded,
  and coordinate rounding remains in place. Database tests cover injection,
  public fields, aliases, unknown markets, more than 500 matches and cache keys.
- URL state, pagination and the modal use the shared listing view. Changing a
  path-defined location/type moves to `/listings`, avoiding a misleading heading.
- Overview content, statistics, complete loader arrays and responsive local
  pagination remain separate. Build failures now stop earlier, before an HTML
  error page reaches sitemap validation.
- No production dependencies, database indexes, runtime feature registry,
  generalized query framework or extra retry loop were introduced. The existing
  transport owns bounded retries; React Query retries remain disabled.

## Final validation

- Fresh production SSG build passed against the actual local backend,
  Podman PostgreSQL 17 and Redis 7: 73 visible fixtures, one hidden fixture,
  three published overview levels and a 112-URL sitemap.
- **207/207 browser checks passed:** 69 each on desktop Chromium, mobile Chromium
  and iPhone-profile WebKit; no retries, failures, skips or flaky results.
  The second pass reused the unchanged application build from the first
  198-check pass and added old-tab refresh recovery, conflicting path/query
  location recovery, and out-of-range pagination after inventory shrinks.
- **11/11 real PostgreSQL integration tests passed.**
  Both audit passes ran these against fresh disposable local services.
- **29/29 listing URL, pagination, transport, metadata and SSR checks passed.**
  Build-cache checks (6), breadcrumbs (12), overview content (5), navigation
  generation and backend cache checks (6) also passed.
- Overview rebuild scenarios passed: missing geography rejected, broken loader
  rejected, published, delisted and republished. Links, HTML, sitemap and loader
  manifests followed publication state throughout.
- Website and harness TypeScript checks, changed TypeScript lint and
  `git diff --check` passed. Lint used the explicit rule options recorded in
  `listing-filters-review.md` for the existing installed-plugin mismatch.

Reproduce with `npm run test:listing:integration` from `wareongo-evals`, plus
`npm run test:listing-url`, `test:build-cache` and `test:navigation` from the
website. The overview lifecycle runner is `npm run test:overview:rebuild` in
the eval directory. This Fedora host uses the temporary WebKit runtime wrapper
documented in the earlier review. Set `LISTING_LEGACY_REF=3ee5594` for the
integration runner to build the previous revision and include the three
deployment-transition checks; these are skipped when no legacy build is supplied.

- Final full build, API/database logs and browser artifacts:
  `/tmp/wog-listing-integration-Zwft9a/`.
- Second audit API/database logs and 207 browser results:
  `/tmp/wog-listing-integration-QTt4RO/`.
- Previous-revision build and intentional old-tab reproduction failure:
  `/tmp/wog-listing-integration-rqMODz/`.
- [Browser report](../../wareongo-evals/output/listing-integration-report/index.html).
- [Browser results](../../wareongo-evals/output/listing-integration-results.json).
- Overview rebuild logs/builds: `/tmp/wareongo-overview-rebuild-2O4Lpv/`.
- Pre-fix browser failures: `/tmp/wog-listing-integration-JhR27H/browser/`.
- Pre-fix backend-capability and prerender failures:
  `/tmp/wog-listing-capability-before.log` and
  `/tmp/wog-prerender-errors-before.log`.

No commit, push or deployment was performed. The unrelated website lockfile and
backend webhook changes were preserved.
