# Navigation

The header implements Design 1 with the review changes: Contact Us is the
primary action; Request a Warehouse is secondary. Listings, Locations, Blogs
and About Us remain visible on desktop. Case Studies is omitted from navigation;
its existing pages and other links still work. Interaction colours use navy
and neutral backgrounds. All navigation text uses the site's Montserrat fonts.

`src/data/navigation.ts` owns the page links and location catalogue. The latter
uses the generated inventory snapshot and the same city threshold as the footer.
`src/lib/locationNavigation.ts` owns location identity, featured selection and
filtering. Micromarket identities include the parent city. Place links always
open listing routes; the separate guide card opens a published overview.

`scripts/generate-locations.mjs` fetches fresh warehouse inventory plus listing
counts from `/locations` and `/micromarkets` during both normal SSG builds. It
writes `POPULAR_LOCATION_IDS`: the six busiest states, six busiest cities and
five busiest eligible micromarkets, ordered by listing count, highest first.
Ties use the canonical name, then the full location ID. Only existing listing
routes are eligible. Failed requests, malformed counts and an empty ranking
for existing state/city inventory stop generation before the snapshot is written.
Desktop and mobile resolve the same ordered IDs; opening navigation makes no
API request. The full directory remains alphabetical.

`scripts/generate-micromarkets.mjs` also generates a small navigation guide
record, matching published CMS content with eligible backend geography. The
header does not import full articles or fetch inventory in the browser. If
there is no eligible guide, the card offers help choosing a location. Failed
photographs fall back to an icon without leaving a broken image.

The desktop disclosure starts at 1280px. Below it, the menu and directory share
one Radix dialog for focus containment and scroll locking. Directory layout
changes at 768px, compact phone padding at 360px, and short landscape layout at
540px height. Keep `NAVIGATION_DESKTOP_QUERY` and the CSS boundary in sync.
Navigation closes on route selection, Escape, and the appropriate outside
interaction. Closing restores focus to a visible trigger. Contact Us opens the
existing form with its original company requirement and analytics attribution.
Modified link clicks keep the current menu and directory filter intact while
the browser opens a new tab or window. Selecting the current location returns
focus to the disclosure trigger, including URLs with a trailing slash.
At the desktop breakpoint, focus moves only when its control disappears;
the visible logo and content links retain focus.

The base bar is 64px tall on desktop and 60px on mobile, retaining 44px control
targets. Desktop page links use 15px/500 and Contact Us uses 14px/600.
Request a Warehouse is a plain text link; Contact Us stays
filled navy. In the Locations panel, the title is 28px/600, column headings
14px/600, place names 15px/500 and parent cities 12px/400. The three directory
actions share a baseline. Phone and directory place names use 14px/500.

The base bar has no full-width fill behind it. One slim rounded container holds
the wordmark, plain page links, Request a Warehouse and the filled Contact Us
button. It has a faint border and shadow, and is capped at 1200px. The final
user-provided Rig.dev screenshot informed this grouping; colours and type
remain WareOnGo's.
Equal side columns keep the page-link group geometrically centered, including
when account controls appear. Desktop padding is 9px vertically and 24px
horizontally; mobile uses 7px and 16px, with 12px sides on the smallest phones.
General navigation guidance came from the
[USWDS basic header](https://designsystem.digital.gov/components/header/),
[HyperUI header patterns](https://www.hyperui.dev/components/marketing/headers)
and [NN/g menu guidelines](https://www.nngroup.com/articles/menu-design/).
The Locations panel keeps Design 1's existing layout and typography.

For a future Design 1 + 3 header search, reuse `locationCatalogue`,
`searchLocations(catalogue, query, optionalCategory)` and `LocationLinks`.
Omitting the category searches every location type; aliases such as Bangalore
and Gurgaon are included. A new search control can own its query and result
limit without adding another location source or changing destination URLs.
Add the control alongside the existing page-link and action groups, then
recheck the desktop fit and shared breakpoint.

Validation commands:

- Website: `npm run test:navigation`, `npx tsc --noEmit -p tsconfig.app.json`.
- Browser harness in `../wareongo-evals`: `npm run test:navigation` and
  `npm run typecheck`.
- Production bundle: `npm run build:spa` (the full SSG pipeline remains the
  normal deployment build).
- Production pipeline audit in `../wareongo-evals`:
  `node tests/support/check-navigation-build.mjs`. It builds a temporary copy
  against a local fixture API, omits the IndexNow notification, and checks
  generated-page hydration and both navbar layouts without browser inventory
  requests.

The browser suite covers widths from 320px to 1920px, both sides of the
navigation boundaries, laptop and landscape heights, typography, keyboard
interaction, directory filtering, account roles, contact forms, analytics and
loading transitions. It writes screenshots to
`../wareongo-evals/output/navigation-artifacts` and a report to
`../wareongo-evals/output/navigation-report`. It uses fixture inventory and
photographs plus local copies of the actual font faces for repeatable images.
