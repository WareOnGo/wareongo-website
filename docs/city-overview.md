# City overview additions

City overview pages use `EditorialLocationPage`, the same template as state and
micromarket overviews. The hero keeps three metrics; the full paginated listing
grid leads the page. The existing section spacing, rent chart, inventory band,
specification table, FAQ and footer links are retained. There is no section nav.
City heroes omit the secondary "Browse the listings" button. The shared template
and CMS preview use Montserrat consistently, and the corridor/compliance copy
uses the full section width in one column.

Cities add:

- A corridor comparison and small/large unit summary after the market section.
- Asking rent by size band within Pricing.
- A comparison of warehouse specifications by size within Specification.
- Optional authored compliance copy, followed by the existing FAQ section.
- Micromarket links and counts within the existing related-pages block.

The CMS uses the shared `EditorialPreview` with these same conditional sections.
Its only new content fields are `corridorHeading`, `corridorProse`,
`complianceHeading` and `complianceProse`, all optional and city-only. They are
included in saving, validation, deployment snapshots and revert. Old snapshots
without the fields remain compatible. Existing text formatting and statistic
overrides continue to work; no statistic-insertion control was added.

## Inventory data

The backend adds a versioned `cityOverview` object to each city in `/locations`.
Legacy city summary fields and state/micromarket calculations remain intact.
City overview calculations exclude land, plots, build-to-suit and listings
explicitly marked under construction. Rents retain the existing rate safeguards;
sizes below 100 sq ft are ignored, recorded zero docks are retained, and medians
preserve fractional values. Missing measures stay missing. Construction and
flooring shares use recognised, recorded values, with sample counts provided.

Corridor membership is configured in the backend's
`services/cityOverviewConfig.js`, initially for Bengaluru. Other cities show
locality groups until a corridor map is supplied. Each listing is counted once;
ambiguous or unmapped tags go into Other / unassigned. City comparison rents and
nearby-city links are separate datasets. Micromarket directory links are checked
against actual buildable pages by the website loader.

## Rollout

Before deploying the backend or CMS, apply the additive backend SQL script
`scripts/sql/city-overview-v2.sql`. It adds four nullable columns to `LocationPage`;
existing content needs no backfill. Both Prisma schemas include the fields.
Do not use `prisma db push` from the CMS, which intentionally has a partial
schema. The location cache uses `locations:v2` to avoid stale response shapes.
Deploy the backend, then the CMS. Publish the intended city content through the
CMS before building/deploying the website. Dev fixtures are not production CMS
content and do not create production overview URLs on their own.

The local review uses an isolated Podman database and an inventory snapshot.
Preview content and authentication helpers live under
`/tmp/wareongo-city-overview-preview`; production data is not changed.

## Verification

- Backend: `npm run test:locations` covers legacy locations, micromarkets and
  the new city calculations, boundary values, missing data and deduplication.
- CMS: `npm run test:locations` covers save, clear, revert, legacy snapshots,
  state scope, authentication and stale-save protection.
- Website: `npx tsc --noEmit -p tsconfig.app.json`; CMS: `npx tsc --noEmit`.
- Local browser checks cover desktop/mobile layout, pagination, FAQ/schema,
  table overflow and the CMS save/reload and preview flow.
- The complete production build and browser audit passed on 2026-09-23:
  2,538 pages, image optimization, sitemap generation, and city/state/micromarket
  browser checks at three viewport sizes. See
  [the production audit](city-overview-production-audit.md) for evidence,
  remaining repository lint debt, and the exact deployment order.
