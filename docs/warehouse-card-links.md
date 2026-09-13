# Warehouse card links

Warehouse cards render a normal property anchor in their initial HTML. The
shared card accepts a required `href` built with the existing `warehousePath`
helper. Its visible title is the link; a stretched hit area keeps the rest of
the card clickable. Gallery and enquiry buttons remain outside the anchor and
above its hit area. The title link has a visible keyboard focus indicator.

This covers the main listings page, location grids, editorial overviews and
related properties. Homepage featured cards use a full-card link because they
contain no nested controls. Their existing authored warehouse paths are retained;
the published warehouse resolver/middleware handles historical slugs by ID.

The card wrapper no longer performs navigation. React Router handles ordinary
link clicks, while the browser retains modified-click and new-tab behavior.
Listing-open tracking belongs to the property link; gallery and enquiry actions
retain their own events. Impression tracking remains attached to the full card.

No route definitions, loader data fields, inventory facts, forms or pagination
behavior change. A normal full static build is required to publish the links in
HTML; `build:spa` is not a production release.

## Checks

`npm run test:card-links` renders the real shared/featured components on the
server and verifies descriptive anchors, no-photo cards and independent controls.

The sibling eval harness's `tests/specs/warehouse-card-links.spec.ts` covers
the four shared-card surfaces, city alias handling, title/image/keyboard
activation, modified and middle clicks, loading-image hit areas, desktop/mobile
gallery/enquiry controls and initial HTML from a fresh static build. Existing
`warehouse-card-enquiry.spec.ts` and `analytics.spec.ts` cover enquiry payloads,
error handling, attribution and event counts against mocked endpoints.

Run the fixture production pipeline in `../wareongo-evals` with
`npm run test:build-cache`. It prints an isolated `WEBSITE_DIR`; all generated
shared-card anchors should match that build's `warehouse-route-map.json`.
After production deployment, verify initial anchors on home, listings, location,
overview and property pages, follow the three featured redirects, and check
keyboard navigation plus the independent enquiry action on desktop and mobile.
