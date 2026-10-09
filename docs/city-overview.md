# City overview additions

City overview pages use `EditorialLocationPage`, the same template as state and
micromarket overviews. The hero keeps three metrics; the full paginated listing
grid leads the page. The existing section spacing, rent chart, inventory band,
specification table, FAQ and footer links are retained. There is no section nav.
City heroes omit the secondary "Browse the listings" button. The shared template
and CMS preview use Montserrat consistently, and the corridor/compliance copy
uses the full section width in one column.
State overviews add their own sections to this template; see
[state-overview.md](state-overview.md).

Cities add:

- A gated locality comparison and small/large unit summary after the market section.
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

The locality table appears only when at least 25 distinct visible listings have
valid micromarket tags. The gate is recalculated from inventory in both directions;
no city allowlist is maintained. Untagged listings and unresolved 32-character tag
IDs never create rows or contribute to the gate or denominator. The listings grid,
small/large unit cards and authored location prose are independent of this gate.

Ordinary cities have one row per micromarket. Bengaluru uses the ten exact area
groups in `services/cityOverviewConfig.js`, matching the Bangalore ads landing
page; there is no corridor mode, address matching or catch-all row. Multiple tags
within one area count once, while a listing can count in several different rows.
The denominator is distinct tagged listings, restricted in Bengaluru to listings
matching at least one configured area. Gate and denominator counts use visible
inventory; row figures retain the built-stock exclusions above. Row `share` is
the percentage of that denominator, so overlapping rows can total over 100%.
Rows with fewer than three eligible listings retain their count but omit rent,
size and main build. Other city statistics retain their original calculations.

The additive `localityTable` metadata supplies eligibility, threshold, tagged
count, denominator and grouping mode. `corridors` remains the API field for rows
for compatibility, but `corridorMode` is always `localities`; ineligible cities
return no rows. Website and CMS preview suppress tables from older backends that
do not supply the gate metadata. City comparison rents and nearby-city links are
separate datasets. Micromarket directory links are checked against actual
buildable pages by the website loader.

## Rollout

Before deploying the backend or CMS, apply the additive backend SQL script
`scripts/sql/city-overview-v2.sql`. It adds four nullable columns to `LocationPage`;
existing content needs no backfill. Both Prisma schemas include the fields.
Do not use `prisma db push` from the CMS, which intentionally has a partial
schema. The location cache uses `locations:v4` to avoid stale response shapes.
Deploy the backend, then the CMS. Publish the intended city content through the
CMS before building/deploying the website. Dev fixtures are not production CMS
content and do not create production overview URLs on their own.

The locality gate requires no schema migration. Deploy the updated backend and
CMS, then rebuild the website so prerendered overview data contains the new
calculation. Subsequent tagging changes are reflected on the next inventory
refresh/build; the gate does not add browser polling to static overview pages.

The local review uses an isolated Podman database and an inventory snapshot.
Preview content and authentication helpers live under
`/tmp/wareongo-city-overview-preview`; production data is not changed.

## Verification

- Backend: `npm run test:locations` covers legacy locations, micromarkets and
  the new city calculations, boundary values, missing data and deduplication.
- CMS: `npm run test:locations` covers save, clear, revert, legacy snapshots,
  state scope, authentication and stale-save protection.
- Website: `npx tsc --noEmit -p tsconfig.app.json`; CMS: `npx tsc --noEmit`.
- Website and CMS: `npm run test:city-localities` checks table visibility,
  retained size cards and count-only rows against rendered markup.
- Evals: `npm run test:city-localities` derives synthetic inventory through the
  backend and checks the complete website and CMS page templates at 1440 and
  390 pixels, with JavaScript both disabled and enabled. It also exercises
  threshold changes after hydration and saves screenshots in a temporary folder.
- Backend locality tests include 400 deterministic generated inventories,
  checked against independent membership sets and medians, plus fresh API reads
  that cross the threshold as visibility and tagging change.
- Local browser checks cover desktop/mobile layout, pagination, FAQ/schema,
  table overflow and the CMS save/reload and preview flow.
- The complete production build and browser audit passed on 2026-09-23:
  2,538 pages, image optimization, sitemap generation, and city/state/micromarket
  browser checks at three viewport sizes. See
  [the production audit](city-overview-production-audit.md) for evidence,
  remaining repository lint debt, and the exact deployment order.
