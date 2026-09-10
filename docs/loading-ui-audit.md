# Loading UI audit — 11 September 2026

The first navigation to `/listings` used a route placeholder with `py-10`, two short text bars, and no filter toolbar. The real page used the default section padding, a longer heading block and a filter toolbar. The desktop browser baseline measured a **224px downward shift** of the first card when the loader completed.

`ListingsHeader` now renders the same heading, description and toolbar in both states. The route placeholder uses the real section spacing, 21 cards, and the same grid. Desktop and mobile checks allow at most 1px of movement in the first card's position and width.

## Route and component coverage

| Surface | Finding and resolution |
| --- | --- |
| Main listings | Fixed the initial route skeleton's padding, header, toolbar and card count. Existing inline pagination/filter skeletons stay responsible for changes within the same pathname. |
| City/state listings, PEB/RCC variants and micromarket grids | Replaced the generic main-listings skeleton with the location layout: breadcrumb, scoped heading, inventory-summary lines, overview link, relevant chips, result count and responsive grid. Generated location summaries supply names and card counts without another request. |
| State, city and micromarket overviews | Added missing route-loading UI. Reuses the real editorial hero and local CMS copy, starts the hero image loading, and skeletonizes the pending metrics and inventory. Corrected a further 23px mobile mismatch caused by placeholder metric baselines. |
| Warehouse detail | Verified the gallery's position and responsive dimensions. Matched its placeholder border and reused a map placeholder with the actual height, border and rounded corners for both the route and lazy map loads. |
| About, request form, blogs, case studies, legal, auth and other static routes | These pages have no remote content loader requiring a warehouse-shaped placeholder. Slow client navigation now displays a slim accessible loading indicator while the page chunk arrives. Production hard loads use prerendered HTML. |
| Listing photos/carousels and editorial images | Already reserve image frames. Warehouse photos already have a pending overlay, timeout and fallback handling; editorial figures reserve an aspect ratio. No extra page skeleton is needed for these image requests. |
| Forms, authentication and notifications | Submission feedback already stays inside the controls. Authentication initialization reads local storage; dashboard/admin pages are static. The deferred notification container does not need a visible skeleton. |

Pending navigation announces its destination category, restores scrolling on completion or cancellation, and uses reduced-motion-aware skeletons. Placeholder breadcrumbs do not insert temporary structured data into the document.

## Verification

- **18 passing browser checks** for initial listings loading, a delayed informational page chunk, slow/cached/failed pagination, retries, page size changes and cancellation by filters.
- **40 passing production-build browser checks** for warehouse gallery loading, all three overview levels, city/state/type/micromarket grid loading, cancellation, hydration, pagination, breadcrumbs, canonical URLs, prerendered HTML, sitemap and existing route IDs.
- Viewports: 1440×900 desktop and 390×844 mobile. The tested location and overview grids measured **0px vertical displacement** from placeholder to loaded content.
- Website and eval TypeScript checks, lint on all changed application files, and an isolated production SSG build against the local fixture API passed.

The browser regressions are in `../wareongo-evals/tests/specs/skeleton-layout.spec.ts` and `../wareongo-evals/tests/overview/loading.spec.ts`. Existing pagination tests remain in `../wareongo-evals/tests/specs/listings-loading.spec.ts`. Screenshots and reports are under the eval harness's `output` directory.

These measurements cover representative fixture content. The location summary skeleton estimates text lines before the inventory response; unusually long place names or different inventory summaries can still wrap differently. Optional overview metrics and warehouse feature lists also depend on the returned data. The placeholders match their responsive structure rather than claiming a fixed height for every possible dataset.
