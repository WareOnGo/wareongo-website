# City overview production audit — 2026-09-23

The city overview changes pass the local production builds and integration
checks. At audit completion on September 23, no changes had been pushed,
deployed, or applied to production data.
The only code adjustment during this audit is an ESLint configuration fix that
passes the existing rule defaults explicitly; the accepted page design is intact.

## Verified

| Area | Result |
| --- | --- |
| Database migration | The exact `city-overview-v2.sql` ran twice against isolated PostgreSQL. All four columns are nullable text; an existing row and its deployment snapshot remained unchanged. |
| Backend | Prisma validation/client generation and real server startup passed with local PostgreSQL and Redis. The backend is plain Node.js and has no separate compile/build command. |
| API | All 123 cities reconciled listing, corridor, size-band and exclusion totals. Comparison rents matched each city's summary. Draft content stayed private; state responses omitted city-only content fields. Repeated cached responses matched. |
| Backend tests | 22 passed: locations/micromarkets/city calculations (12), cache bypass (6), connection-pool behavior (4). |
| CMS | Unmodified `npm run build` passed using Next.js 16.3.0/Turbopack and the normal Google Montserrat font. TypeScript and `npm run lint` passed. |
| CMS tests | 33 passed: city save/clear/revert, legacy snapshots, state scope, authentication/stale saves (5), deployment behavior (28). |
| CMS browser | Production server rejected unauthenticated editor access. Authenticated city edits survived save/reload and appeared in the real backend API, then were restored. Desktop/mobile previews passed; state forms omitted the four city fields. |
| Website | Full `npm run build` passed, rendering **2,538 pages** from 2,113 public warehouse fixtures. It published 213 listing-cover images, 726 overview image assets, a 2,113-entry warehouse route map and a 2,439-URL sitemap. No route filter or image-fetch mock was used. |
| Website tests | 50 passed: overview publishing (5), formatting (13), listing URLs/pagination/inventory/prerender failures (32). TypeScript and lint for all city-change files passed. |
| Website browser | City, state and Kompally micromarket pages passed at 1440, 768 and 390 pixels. Verified 18/12/6 visible listing cards, three hero metrics, correct section scope, Montserrat, full-width single-column city paragraphs, canonical URLs, FAQ/CollectionPage schema and no document overflow. All city internal links pointed to built pages. City sections also appeared without JavaScript. No page errors occurred. |

Build copies, logs, source hashes, test JSON and screenshots are in
`/tmp/wareongo-city-production-audit`. The built site is served locally at
`http://127.0.0.1:8086/overview/karnataka/bengaluru` while that audit server runs.

## Remaining issues and scope

- Website-wide lint now runs instead of crashing in
  `@typescript-eslint/no-unused-expressions`. It reports **8 existing errors and
  5 warnings**, all outside the city changes. The eight error-bearing files were
  checked against Git HEAD and are unchanged: `EdgeContactFormDialog.tsx`,
  `RequestFormSection.tsx`, `WarehouseLocationMap.tsx`, `ui/textarea.tsx`,
  `RequestWarehouse.tsx`, `geocodingService.ts`, `warehouseRequest.ts`, and
  `tailwind.config.ts`. These do not fail the production build, but the entire
  repository cannot be described as lint-clean.
- The backend and website working trees also contain separate image-pipeline
  work. Keep its changes out of a city-only release. In particular, stage only
  the `LocationPage` additions in the backend Prisma schema; its
  `labeled_warehouse_images` changes belong to the image rollout.
- This audit used an isolated database with public inventory fixtures and local
  city/state editorial examples. It did not publish the example copy to the
  production CMS. The fixture schema omitted unrelated unsupported spatial/vector
  columns and indexes; this is not a geospatial or image-pipeline migration audit.
- The initial machine storage and sandbox errors were resolved using temporary
  storage and a clean build cache. Vite's SPA preview returned the homepage for
  extensionless nested URLs, so final browser checks used the repository's
  existing static-host harness and real middleware instead. No application
  routing change was required.

## Migration applied — 2026-09-24

The user authorized the production migration and local commits in all three
repositories, with only the backend to be pushed at this stage. The exact
`city-overview-v2.sql` migration was applied at 09:24 UTC and verified through
both backend and CMS database connections. All four columns are nullable text
with no default; the existing location row and its content were preserved.

The user will deploy the backend on Render. CMS/website pushes, deployment and
post-deployment testing remain pending the user's next instruction.

## Push and deployment order

1. **Database first:** apply
   `WareOnGo-Website-Backend/scripts/sql/city-overview-v2.sql` to the database used
   by both backend and CMS. Existing app versions tolerate these nullable columns.
   Do not use the CMS's partial schema with `prisma db push`.
2. **Backend:** push/deploy the city changes and regenerate its Prisma client.
   Verify `/locations` supplies `cityOverview.version = 1` for cities and
   `/location-pages` still serves published content. The new cache key is
   `locations:v2`; build reads already bypass visitor caches.
3. **CMS:** push/deploy with its regenerated client. Save/publish the real city
   copy and images, including any optional corridor/compliance copy. Check the
   preview and the backend's published response before building the website.
4. **Website last:** push/deploy through the normal full build so its generated
   content and analytics use the updated backend and published CMS content.
   Check the city URL, a state URL and a micromarket URL after deployment.

Each deployment should finish successfully before proceeding to the next.
For rollback, restore the prior website/backend/CMS versions as appropriate and
leave the additive columns in place; dropping them is unnecessary and would
discard authored content.

## City release scope

- **Backend:** location controller/service, the three helper exports in
  `micromarketService.js`, new city config/statistics services, `LocationPage`
  schema hunk, additive SQL, location tests and `test:locations` script.
- **CMS:** location actions/schema/staging/deployment snapshot fields, shared
  editorial form/preview, new city panels/types, `LocationPage` schema and tests.
- **Website:** shared editorial page/hero/inventory/skeleton updates, location
  loader/content/API types, city panels/types, dev-only review copy, audit docs
  and ESLint compatibility configuration. Exclude the separate changes to
  `warehouseImages.ts`, `warehouseAPI.ts` and image-pipeline tests.
