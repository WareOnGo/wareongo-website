# Multi-select listing filters

The subsequent [fresh evaluation](listing-multiselect-eval-2026-09-21.md) includes
the previously skipped refresh checks, the initial assertion failure and its
verified resolution, and an exhaustive filter-combination matrix.

Area and warehouse-type chips are independent toggle buttons. Selected chips have
the existing navy fill and an × in the top-right corner; the whole chip remains
the click/keyboard target (`aria-pressed`, minimum 44 px height). “Any” clears its
group. Applied selections can also be removed individually above the results.

Selections within a group use OR; location, type, area and Fire NOC groups combine
with AND. Area bands retain their inclusive boundaries and 50,000+ has no upper
limit. Selecting separated bands does not include the gap. When several bands are
selected, “Use a custom range” switches back to the slider and clears those bands
in the draft. Apply, Reset and Cancel keep their existing behavior.

Multiple types use `type=PEB,RCC`; multiple bands use
`area=0-10000,50000-`. A single area continues to use `minSqft`/`maxSqft`, including
existing saved links. URL normalization preserves attribution, pagination and
history. Expanding a type-specific location route moves to the shared listings
route while retaining its location.

The backend accepts `spaceRanges=0-10000,50000-` (at most four validated bands).
It matches any band against a single unit inside the existing SQL `EXISTS`;
count and page queries share the predicate. Multiple warehouse types now preserve
the existing single-type substring match, including hybrid “PEB + RCC” stock.
The browser still requests one bounded page; there is no client-side catalogue
scan or merge of independently paginated searches. Overview queries are unchanged.

Deploy the backend change before rebuilding/publishing the website. It advertises
`X-Wareongo-Listing-Filters: 2`; the website build requires version 2 or later.
The warehouse response cache moves to v6 so old multi-type results are not reused.
No database migration is required.

Validation on 2026-09-21:

- Website TypeScript, changed-file ESLint, 32 listing/URL tests, 7 build-cache tests
  and 15 navigation tests passed.
- 13 PostgreSQL integration tests passed, covering disjoint/overlapping/open bands,
  multiple units, hybrid types, malformed requests, cache separation, pagination
  and unchanged overview data. Six backend cache tests also passed.
- The full production SSG build against the local backend passed: 117 rendered
  routes, 112 sitemap URLs. Integration artifacts are in
  `/tmp/wog-listing-integration-DTwxO8`.
- 216 browser checks passed across desktop Chromium, mobile Chromium and emulated
  iPhone WebKit. Three optional previous-deployment refresh checks were skipped
  because no legacy build was supplied. New checks cover multi-select persistence,
  pagination, history, independent removal, keyboard toggling, custom range switching
  and all chips selected at 320 × 568 with no scrolling and 44 px targets. Existing
  overview inventory, statistics, navigation and layout checks passed.
- Selected desktop and small-mobile screenshots were visually inspected. The
  desktop capture is `/tmp/wog-multiselect-desktop.png`; mobile captures are in the
  integration artifacts. No physical-device test was performed.

Reproduce the full integration run from `wareongo-evals` with:

```sh
LISTING_POSTGRES_PORT=55449 WOG_WEBKIT_EXECUTABLE=/tmp/wog-webkit-browser npm run test:listing:integration
```

The optional PostgreSQL port override avoids an existing QA container on 55439.
The WebKit executable override uses the locally installed browser wrapper.
