# Warehouse URL resolution

Warehouse IDs are permanent; size, construction type and city in the descriptive
URL can change. `/warehouse/32000-sqft-peb-warehouse-bengaluru-2096` can therefore
resolve to `/warehouse/30000-sqft-peb-warehouse-bengaluru-2096` without recording
every historical spelling in the database or Vercel redirect configuration.

## Publication and direct visits

`npm run build` generates `dist/warehouse-route-map.json` **after** prerendering
and stabilizing the loader manifest. Only paths in that build's manifest are
eligible. The generator fails if a destination is missing its HTML or matching
warehouse payload, or if one ID has multiple destinations.

Vercel bundles that map into `middleware.ts`, which matches `/warehouse/*`:

- A known ID with a different path receives a 308 to its published path.
- Canonical paths continue to the static HTML. Unknown or malformed IDs continue
  to the host's real HTTP 404.
- GET and HEAD redirects retain query parameters. The browser retains fragments.
- Redirects carry `no-store` for browsers and CDNs. This prevents cached A → B
  redirects looping if a later correction changes the slug back from B to A.

There is no per-request database/API lookup. This is one middleware route with a
bundled lookup table, rather than a Vercel configuration entry for each alias.
Normal middleware runtime, bundle-size and request-usage limits still apply.

Use the normal Vercel `npm run build` deployment. No new environment variables,
database migration or audit-log backfill are needed. `build:spa` does not generate
this map and is not a supported production deployment command.

## Client navigation

`createWebsiteRouter` captures the authored loader structure before
`vite-react-ssg` mutates it. In prerendered documents it installs the warehouse
resolver after SSG's loader replacement and removes synthetic loaders on layout
routes that originally had no data loader. This prevents duplicate requests and
layout errors racing the warehouse resolver. Other data routes retain their SSG
loaders; the development server retains its API loaders.

The warehouse resolver indexes the stable manifest by ID, redirects aliases
through React Router, then reads the published detail payload. It preserves
queries and fragments. An absent ID or failed payload gets one fresh-manifest
retry to handle tabs that outlive a deployment. Failed requests render a retryable
error; an ID absent from the refreshed manifest renders the missing-listing page.
Cancelled navigations abort their fetches.

The pending-navigation skeleton follows the detail page's gallery, information,
stats, callback, map and infrastructure layout at desktop and mobile breakpoints.
It hides the outgoing page, announces loading, and respects reduced motion.

## Verification

Run the production build in this repository, then in `../wareongo-evals`:

```sh
npm run typecheck
npm test
npm run test:redirects
```

The redirect suite bundles the real middleware for a web runtime and serves real
SSG output with HTTP 404s for missing files. It checks direct and client redirects,
all generated destinations, stale manifests, error recovery, cancellations, and
desktop/mobile skeleton screenshots and geometry. It is a local host simulation;
after deployment, verify the actual Vercel response as well:

```sh
curl -I https://wareongo.com/warehouse/32000-sqft-peb-warehouse-bengaluru-2096
curl -IL https://wareongo.com/warehouse/32000-sqft-peb-warehouse-bengaluru-2096
```

Expect a 308 with the current published path, followed by 200. The destination
depends on the warehouse's data at build time.

## Publication timing

This resolves aliases for published warehouses. New inventory and changed slugs
become public after the next successful build (including the scheduled 2 am IST
build). Until then, an existing warehouse continues to resolve to its previously
published page. Unpublished or deleted IDs are not redirected to another warehouse.

Listing results use the maximum warehouse ID captured by the deployed build.
`generate-locations.mjs` starts with an uncapped inventory read and writes
`src/data/warehouse-build.generated.json`. Later inventory pages, SSG loaders,
the sitemap and browser listing requests use that same `maxId`. The backend
applies `id <= maxId` before counting and pagination; both API and browser query
caches include the cutoff. New higher IDs appear after the next successful
deployment. Vite development keeps its live detail loaders and uncapped inventory.

Deploy backend `maxId` support before rebuilding the frontend. Capped build reads
require `X-Wareongo-Listing-Filters: 3`; an older backend fails the build rather
than silently ignoring the cutoff. The generated route map also verifies that
the cutoff matches the highest rendered warehouse, with valid HTML and payload.
The cutoff ships inside the frontend deployment, so a failed build does not
advance the live site's limit. No scheduled task or manually maintained setting
is needed beyond the existing nightly build.

This ceiling covers newly allocated IDs. An older, previously hidden ID becoming
visible after a build can still need the next build before its detail page exists.

Run `npm run test:warehouse-cutoff` and `npm run test:build-cache` here, and
`npm run test:warehouse-cutoff` plus `npm run test:warehouse-filters` in the
backend (the latter requires its dedicated local PostgreSQL test database).
The sibling eval harness's `npm run test:warehouse-cutoff -- --project=desktop
--project=mobile` provisions local PostgreSQL/Redis, runs the database tests and
full SSG build, tests browsing, adds matching warehouses across all type, area,
Fire NOC and geography filters, verifies they stay excluded, then rebuilds and
verifies their listings and detail pages. Artifacts stay
under the printed `/tmp/wog-listing-integration-*` directory. Set
`LISTING_POSTGRES_PORT` if its default port 55439 is already occupied.

Adversarial review on 7 October 2026 found no cutoff-related filtering regression.
The PostgreSQL suite now checks all 768 type/area/Fire NOC combinations at five
cutoffs (including no cutoff and a cutoff excluding every match), with independent
expected IDs, totals, every page and the empty page after the end. It also checks
every supported API filter individually and combined, controller forwarding and
separate cached results for different cutoffs. Legacy budget/height text comparison
and `hasCoordinates=false` behavior remain unchanged; those are not website controls.

The local review passed 20 PostgreSQL tests, 112 desktop/mobile browser checks and
two full SSG builds. Eight new warehouses were excluded at cutoff 2007, including
new city/state/micromarket matches, then appeared with pages after the rebuild
advanced the cutoff to 2015. The browser checks also cover custom ranges, hybrid
types, empty results, reset/history, counts, paging, reload, prefetch and attempted
URL overrides of `maxId`. The production readiness check requires capability 3
and tests an actual `maxId=1` request; production deployment has not been tested
as part of this local review.
