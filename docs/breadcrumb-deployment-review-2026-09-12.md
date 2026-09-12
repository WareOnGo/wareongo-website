Deployment assessment: the breadcrumb changes are ready to deploy after the robustness correction made during this review. No outstanding deployment blockers were found. This assessment covers the website breadcrumb changes, not unrelated work in the workspace. Nothing was deployed during the assessment.

The reviewed scope is warehouse details, city listings including PEB/RCC variants, micromarket listings, case-study details, and the affected loading placeholder. Existing overview trails retain their published-overview/grid fallback behavior.

| Check | Result |
| --- | --- |
| Current production inventory evaluated through the actual resolver | 2,006 unique listings |
| Geographic catalogue | 116 cities, 23 states, 64 buildable micromarkets |
| Distinct generated ancestor destinations | 177; all appear in the deployed loader manifest and in the current listing-route catalogue |
| Existing city-alias spellings in live inventory | 152 listings |
| Listings with multiple eligible matching micromarkets | 376; zero differences from descending listing-count selection, with deterministic slug tie-breaking |
| Unit and real-loader regression tests | 12 passed |
| Desktop/mobile browser checks on the final build | 48 passed |
| TypeScript and targeted ESLint checks | Passed |
| Production build pipeline against the local fixture API | Passed; 99 URLs, including 65 warehouses |

One issue was found and corrected. The API readers validate their top-level collections, but malformed membership rows could still throw while constructing the shared breadcrumb lookup. That would make auxiliary geography a new source of warehouse-loader failures. The resolver now ignores malformed rows while preserving valid entries. A regression test first reproduced the failure and then passed after the correction. The final build and browser checks include that fix.

Live-data behavior is deliberately conservative. 705 listings receive state, city and micromarket ancestors; 1,300 receive state and city; one receives only its state. Listing 1779 belongs to the Navi Mumbai city group but has Tamil Nadu as its recorded state. The resolver excludes the conflicting city/micromarket hierarchy. This is an existing data inconsistency, not a deployment blocker. Three Dadri listings have a micromarket with the same name as their city; the duplicate name is suppressed. Every warehouse retains Home and Listings above these geographic ancestors.

Route validation uses the same city/state summaries that enumerate the listing pages, not arbitrary slugs derived from addresses. Micromarket membership comes from backend listing IDs, so raw city aliases and tag punctuation do not produce guessed URLs. Nonexistent parents, non-buildable markets, and the reserved PEB/RCC URL slots are excluded. State/city pairs with identical names remain distinct routes. If metadata is unavailable, the trail shortens and keeps the general Listings destination.

The browser checks covered visible trails and matching BreadcrumbList JSON-LD, working ancestor links, warehouse-to-micromarket-to-city-to-state navigation, HTML before JavaScript, desktop/mobile overflow, loading geometry, reduced motion, cancellation, existing overview navigation, pagination, and sitemap behavior. Payloads without the new optional breadcrumb field were also exercised: navigation remains functional and retains the Listings fallback. The production browser made no new geography API requests in that compatibility check. Route definitions and route IDs are unchanged; existing loader fields are retained for older bundles.

The lookup is constructed once per process and serialized into existing route data. Evaluating the whole live catalogue took under 15 ms locally; this is a resolver timing, not a production latency benchmark. No database migration, backend release, URL migration, or redirect change is required for this feature.

The evidence has two separate scopes: browser/build validation used a deterministic fixture catalogue, while all 2,006 live listings were evaluated separately against current public API data and the deployed route manifest. This was not a full live-content production rebuild or an HTTP crawl of every listing. Inventory can change after the snapshot, so deployment should use the website's existing full build pipeline, which regenerates its route data.

The source fingerprints, aggregate live-data results and artifact locations are recorded in [the evidence file](breadcrumb-deployment-review-2026-09-12.evidence.json). Focused tests are in `tests/breadcrumbs.test.mjs`; browser checks are in the sibling `wareongo-evals/tests/overview/breadcrumbs.spec.ts`, `locations.spec.ts` and `loading.spec.ts`. The new `src/lib/listingBreadcrumbs.ts` module is part of the deployment change and must accompany its importing files.
