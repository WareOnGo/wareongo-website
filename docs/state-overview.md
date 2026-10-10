# State overview additions

State overview pages (`/overview/{state}`) use `EditorialLocationPage`, the
same template as city and micromarket overviews. Everything below applies to
the state scope only. City and micromarket overviews render as before, and the
CMS preview renders this website component directly, with unsaved edits and
current inventory supplied through the website preview route.

States add:

- A hero secondary button, "See available warehouses in {State} →", linking to
  `/listings/state/{slug}`. Micromarkets keep "Browse the listings ↓"; cities
  still have no secondary button.
- A new section order: Market, Cities, Inventory, Pricing, the inventory band,
  Specification, Compliance and FAQ. Sections are numbered as rendered. A state
  is too broad to browse first, so the listings follow its market and cities.
  There is no section nav; sections keep the same classes as on city pages.
- A default market heading, "Why {State} for Warehousing", when none is set.
- A market figure beside the prose whenever the market section renders: the
  uploaded market image, else a listing photo from the state (see below).
- A Cities section (`#cities`): a table of the state's city list, one photo
  card per city, and a plain-text line naming the state's other cities with
  listings. The default heading is "Where Warehouse Stock Sits in {State}".
- A "View all warehouses in {State} →" link under the listing pagination.
- Optional authored compliance copy, with the same markup as the city section.
- "Cities" and "Nearby states" chips in the related-pages block, between
  "All listings" and "Editorial".

Breadcrumbs, structured data, the inventory band, FAQ and footer CTA are
unchanged.

## Data rules

The loader (`stateOverviewFor` in `src/loaders/locationLoader.ts`) builds a
small `stateOverview` object rather than shipping whole city records. Which
cities it lists is decided by `resolveStateCities` in `src/lib/stateCities.ts`,
which the loading layout shares.

- **The city list** is the editor's `stateCities` list when it has entries.
  Otherwise it is the four `/locations` cities in the state with the most
  listings (then by name); a state with fewer cities lists fewer. Each entry
  names one of our cities in the state by slug, or none for a city outside our
  listings. A slug we no longer have in that state counts as none.
- **Our cities** show exactly what their own page shows: the city's figures
  merged with its `cityOverview.summary`, then, when the city overview is
  published, that page's statistic overrides. Columns are spaces, rent range,
  median unit size and main build; missing values show a dash. The name, its
  card and its chip link to the published city overview ("{City} warehousing
  overview →"), else to the city's listing page ("Warehouses in {City} →"). An
  edited entry's name replaces the `/locations` name.
- **A city outside our listings** shows dashes, plain text in the table and a
  card that is not a link ("No listings yet", no hover). It has no chip. Its
  card shows the editor's photo or the plain ink surface.
- **Card photos** are the editor's upload for that entry. Otherwise the card
  uses the city's best T1 listing photo, and, without one (or from a backend
  that does not report quality tiers yet), the cover of its best listing by
  the listing grid's rule (`orderForDisplay`: listings with photos first, then
  the largest). A city with no photo keeps the ink surface; no unrelated image
  is substituted.
- **The best T1 photo** (`bestTierOnePhoto` in `src/lib/warehouseImages.ts`)
  comes from the backend's gallery grading: `imageQuality` on each warehouse,
  aligned with `images` (`qualityTier`, `coverSuitable`, `width`, `height`;
  `images` itself stays the shared image contract). Among T1 photos it prefers cover-suitable
  ones, then landscape, then the larger listing, then the lower listing ID,
  then gallery order. It uses the WebP when there is one, with the original as
  the fallback, and the caption as alt text ("Warehouse in {Place}" without
  one). A page never shows the same photo twice: cards pick in list order, each
  skipping photos already used.
- **The market figure** is the uploaded market image. Otherwise it is the
  state's best T1 photo across all its listings, skipping the card photos;
  from a backend without quality tiers, the cover of the state's best listing
  instead. Without either, the prose takes the full width as before. City and
  micromarket market sections still show uploads only.
- **Image variants.** Card and market photos go through the existing overview
  image pipeline (`prepareOverviewImages`), so production builds publish
  optimized responsive variants with the hero and market images.
- **Other cities** are the state's remaining cities with listing pages that
  are not in the list, busiest first, as plain text.
- **Nearby states** come from the backend's `nearbyStates`, a static,
  symmetric land-border configuration filtered to states in the inventory. The
  website links only neighbours with a published state overview. A backend
  without the field falls back to the previous "Other states" peer links.
- **Loading layout.** The route skeleton (`OverviewSkeleton`) draws the same
  order: the bundled market copy with its figure (the upload, or a placeholder
  for the listing photo), then the cities table and cards for the resolved
  list, then the other cities line, so the listing grid does not jump on load.
  The list comes from the bundled content and `STATE_CITIES` in
  `src/data/locations.generated.ts` (every city per state with its listings and
  page flag, emitted by `scripts/generate-locations.mjs` in the loader's order).

## CMS fields

`citiesHeading` and `stateCities` are optional state fields. `stateCities` is
an ordered list of at most eight `{ name, slug, image }` entries: `slug` is our
city's slug or null for a city outside our listings, and `image` is an optional
upload that replaces the automatic photo. An empty or missing list uses the
default. `complianceHeading` and `complianceProse` are available to states as
well as cities, with the same 110 to 160 word guidance. Corridor fields remain
city-only. Old rows and deployment snapshots without these keys load, save,
revert and compare without changes. The website applies its heading-case and
punctuation normalization to the new heading and compliance copy.

## Shared styles

The cards use shared classes in `src/styles/ui.css` (`ui-photo-card*`, with
`ui-photo-card--static` for a card that is not a link) and tokens in
`src/styles/ui.tokens.css` (`--ui-photo-shade`, `--ui-photo-card-height`). The
CMS mirrors them through `scripts/sync-ui-styles.mjs`.

## Rollout

1. Apply the additive backend SQL script `scripts/sql/state-overview-v1.sql`.
   It adds the nullable `citiesHeading` and `stateCities` columns to
   `LocationPage`; no backfill is needed. Do not use `prisma db push` from the
   CMS.
2. Deploy the backend. It adds `nearbyStates` to state entries in `/locations`,
   keeps compliance copy and the city list on state pages, adds quality tiers
   to public gallery images and bumps the location cache key.
3. Deploy the CMS.
4. Author and publish the state content. Compliance copy still needs to be
   written, with dated sources, before it appears on any state page.
5. Build and deploy the website. Until the backend reports quality tiers, card
   and market photos use listing covers.

Dev fixtures (`src/data/locationPages.dev.ts`) give Karnataka a cities heading
and placeholder compliance copy, with the default city list. With minimal
Hubli, Mangaluru and Kolar city pages, that list links Bengaluru, Mangaluru and
Hubli to their overviews and Dharwad to its listing page; Kolar, also
published, falls to the other cities line. Tamil Nadu has an edited list with
an uploaded card photo and a city outside our listings. Neither state has a
market image, so both show the listing-photo figure. Fixtures are not
production CMS content.

## Verification

- `npx tsc --noEmit -p tsconfig.app.json` and ESLint on the changed files.
- The existing overview content, overview image, punctuation, heading-case,
  pagination, breadcrumb and listing tests.
- Browser review of the state layout at phone and desktop widths, the CMS
  preview and a production build remain to be done.
