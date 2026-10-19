# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/727aec1c-75e9-4d24-8c03-c4a294d3a55c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/727aec1c-75e9-4d24-8c03-c4a294d3a55c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/727aec1c-75e9-4d24-8c03-c4a294d3a55c) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Micromarket overview URLs

### Micromarket ad pages

`/bangalore/peenya` uses `BangaloreLanding` and all its existing components and
responsive styles. Local copy comes from approved CMS `MicromarketAdPage` records
via `GET /ad-pages/micromarkets`. Common benefits, services, audiences, images,
fee FAQ and request CTA copy continue to come from the approved Bangalore CMS content.

All ad routes use one component library: `BangaloreLanding` composes the components
in `src/components/city/`, the shared `WarehouseCard`, `Navbar`,
`TrustedBySection`, `RequestCTASection`, `ad/AdFooter` and contact dialog. Keep visual and
interaction changes in those components and `BangaloreLanding.css`; new market
pages should provide configuration and inventory, without copying JSX or styles.
The local summary, callback note, area cards and WhatsApp button are the additional
elements specified in the Peenya sample. The existing responsive grids, card
sizes, controls, typography and section order remain shared.

To add a Bangalore micromarket, open **CMS → Ad pages → Micromarket ad pages →
New micromarket ad page**, select the inventory market, fill in the local copy,
preview at desktop/mobile sizes, and choose **Save for next build**. Drafts never
create public routes. The build generates both `micromarketAdPages.generated.ts`
and the tiny `micromarketAdPaths.generated.ts` analytics allowlist from approved
records; adding a page requires no route, JSX or CSS registration.

The CMS provides a downloadable JSON Schema and a blank writing template. The
strict contract is mirrored in `scripts/lib/micromarket-ad-content.mjs`: only
local headings, metadata, two area paragraphs, map-card bylines, rent-guide prose and local FAQs
are editable. Identity is fixed from inventory. Use `{listings}` and
`{rentRange}` for live values. Shared settings, callbacks, forms, images and
numeric overrides are rejected by the CMS and build validators.

`src/data/micromarketAdPages.ts` combines that local copy with the shared template.
Code-owned inventory filters, map cameras and comparison markets live in
`src/data/micromarket-ad-layouts/{slug}.json`. New markets default to their city
map and their own inventory rent range. Custom maps remain a developer task;
map markers reference `BANGALORE_MAP_AREAS`.

The optional `map` configuration supplies local Mapbox cameras and each marker's
longitude/latitude. Labels project from those coordinates for all three views.
Set the cameras around the selected markets, then provide `MAPBOX_ACCESS_TOKEN`
in the environment and run `npm run maps:ad-pages -- peenya` (substitute the new
slug with a code-owned layout). Commit the generated WebP assets with the configuration. Rendering keeps
the shared desktop/tablet/mobile dimensions and embedded attribution; no token
or Mapbox request is sent from the page. Omit `map` to reuse the city basemaps.

The southern page centres its cameras on the Hosur Road/Bommasandra and Sarjapur
area. Its approximate marker coordinates use the [GeoNames locality records](https://www.geonames.org/advanced-search.html?country=IN&q=Bengaluru+Urban&startRow=50).
Standard local map headings have a short mobile label; custom CMS headings are
shown as authored on both desktop and mobile.

The loader reads every inventory page per rent market. Cards show built stock,
prefer sheds, and retain real listing photos. Featured cards cover the 5,000 to
15,000, 15,000 to 30,000 and 50,000+ sq ft bands where available. Both grid and featured cards enforce the displayed rent floor and the shared 5,000 sq ft
size floor (`AD_MIN_SIZE`), and show locality names instead of street addresses. The size chips (5,000 to 15,000,
15,000 to 30,000, 30,000 to 50,000 and 50,000+ sq ft) are labelled in code from their bands on every ad page;
the CMS chip-label fields other than "All sizes" are no longer shown. Counts
and the rent guide use the full tagged inventory; Peenya's displayed cards also
require an explicit Peenya address and an asking rent of at least ₹25. Rent ranges exclude land/BTS and missing rates,
require at least ten rates, and use the lowest +10% and highest +15%, rounded
down to whole rupees. Peenya retains the requested ₹25 floor. Its upper limit
comes from current inventory (₹80 at implementation), and the hero, table and
FAQ share that value. Production figures refresh with the website build, as
with the other generated inventory pages; failed/incomplete reads fail the build.

Micromarket ads have their own canonical/OG URLs, `noindex,follow`, Organization
schema and a single GA bootstrap first in the generated head. They retain the
shared navbar and add a fixed WhatsApp contact. They are
intentionally excluded from the SEO sitemap. `/bangalore` retains its existing
city layout and content, plus the offer line under the H1 (city count rounded
down, and the lowest and highest rents in its CMS rent table). Every ad page shares
the callback line and the form intro's phone wording (the intro without "Share
your details." or its closing full stop), shown below 600px. All ad pages use the compact `AdFooter`: brand,
Privacy Policy, Terms of Service, Login and copyright. Deploy the backend migration/API before enabling the CMS and website builds;
the generator fails if the approved Peenya seed is missing or content is invalid.
The preview at `/preview/ad-pages/micromarket` accepts authenticated CMS messages
in memory, reads fresh inventory, and blocks lead submissions and navigation.
The 14 October handoff adds `/bangalore/hoskote`, `/bangalore/nelamangala`,
`/bangalore/electronic-city-jigani-bommasandra` and `/hosur` through the same
renderer. Hoskote excludes Narsapura; Nelamangala excludes Dobbaspet, Makali and
Peenya. The combined southern page reads the union of Hosur Road, Jigani and
Bommasandra tags, deduplicates listing IDs and excludes Attibele/Bannerghatta.
Hosur reads city-wide stock and renders Tamil Nadu, with its supplied map and
visible OpenFreeMap/OpenMapTiles/OpenStreetMap credit. Its route is registered
only when approved content includes it. A separate city page does not require
a second design or form implementation.

The backend migration `scripts/sql/20261014_area_ad_pages.sql` creates these
four as private drafts without changing Peenya. Approve them after deploying
the compatible backend and preview. The committed content snapshot allows
local review; a production build regenerates routes from approved CMS content.
The handoff's static counts/rents are examples: current inventory drives the
headline, cards and rent table. The mini footer remains on every ad page.

Run `npm run test:ad-pages` and
`npm run test:lead-submissions` when changing this template.

### Editorial overview pages

Published CMS content renders at `/overview/{state}/{city}/{micromarket}`.
Existing `/listings/city/{city}/{micromarket}` URLs always render the paginated
listing grid, with a link to the overview when one is published. State comes
from the backend's `parentState` / `stateSlug` fields; saved CMS content keeps
its existing city/micromarket key. Shorter state/city overview routes are
reserved for future work.

Deploy the backend with these geography fields before rebuilding this website.
No migration or new required environment variable is needed. For local builds
against a different backend, set both `VITE_API_BASE_URL` (route loaders) and
`WAREONGO_API_BASE` (build generators). A failed CMS content fetch stops the
build so existing overview pages cannot be silently removed. The sitemap reads
overview pages actually emitted by the build.

Validation: `node --test tests/overview-content-fetch.test.mjs`, plus the sibling
`wareongo-evals` behaviour suite and `test:overview` static-build suite.

## Build connection budget and read retries

Static generation renders five pages concurrently. Public warehouse and content
reads retry network failures and HTTP 429/500/502/503/504 at most twice, with
backoff and jitter. Other HTTP errors, including 404, return immediately. The
last failure still reaches the existing build guards; it is never replaced by
empty published data. No website environment variable is required for this.

Pagination uses that same three-attempt limit without additional React Query
retries. Its loading skeleton stays visible during automatic retries, and
changing filters cancels both the request and pending backoff. Forms and other
mutations are not retried. Run `npm run test:reads` for the retry checks and the
sibling harness's `listings-loading.spec.ts` for desktop/mobile verification.

## Fresh inventory during website builds

Deploy the backend cache-bypass support before rebuilding the website. No new
credentials or environment variables are required. `npm run build` and
`npm run build:dev` request fresh `/warehouses`, `/locations`, and `/micromarkets`
data during generation and server rendering. The browser keeps its ordinary
cached API requests.

Build requests send `Cache-Control: no-cache, no-store`; the backend skips Redis
reads and writes and acknowledges this with `X-Wareongo-Cache: bypass`. A backend
without that acknowledgement stops the build early with a deployment-order
message. Footer/location generation and sitemap generation use the same bypass.
Route enumeration shares its in-flight warehouse catalogue with other route
loaders, using pages of 500 to keep the number of database reads down.

The warehouse route-map guard still rejects missing or failed details. A warehouse
hidden while a build is already running can still trigger that guard; bypassing
Redis fixes stale cached inventory, not concurrent database edits.

Checks: `npm run test:build-cache` here tests the client contract. In
`../wareongo-evals`, the command with the same name runs the complete build
against a fixture whose cached list contains hidden warehouse 2027, then verifies
that it is absent from generated routes and the sitemap.
