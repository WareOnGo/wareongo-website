# SEO status

Snapshot of where SEO optimization stands on the site. Last updated alongside the
type-segmented location pages + warehouse slug URL migration.

## Build stats

- **918 SSG'd HTML pages** generated per deploy
- **913 URLs in `sitemap.xml`** (auto-regenerated each build)
- Build pipeline: `generate-locations → vite-react-ssg build → generate-sitemap`

| Page kind | Count |
|---|---|
| Static pages (home, about, listings, request, privacy, terms, etc.) | 12 |
| Case studies | 5 |
| Warehouse detail (semantic slugs) | 671 |
| City landing pages | 85 |
| State landing pages | 23 |
| City × type (PEB / RCC) | 88 |
| State × type (PEB / RCC) | 34 |
| Auth / utility (noindex) | a few |

---

## ✅ Done

### Infrastructure

- **SSG migration** via `vite-react-ssg` — every public route ships real HTML, not an empty SPA shell.
- **Vercel routing fix** — removed the legacy `/(.*) → /index.html` rewrite that was serving the homepage for every URL.
- **`vercel.json` cache headers** — 1-year immutable for assets, 1-day s-maxage + 7-day stale-while-revalidate for HTML, 1-hour for `sitemap.xml`.
- **Real HTTP 404** — `dist/404.html` is auto-flattened by the postbuild script; Vercel serves it with HTTP 404 for unmatched paths.
- **Auto-generated `sitemap.xml`** — fetched from the backend each build, includes warehouses + locations + case studies + static pages.
- **`robots.txt`** in place, disallows `/admin-panel` and `/user-dashboard`.

### Metadata (per-page)

- `<title>`, `<meta name="description">`, `<link rel="canonical">` — unique per route.
- Open Graph: `og:type`, `og:title`, `og:description`, `og:url`, `og:image`.
- Twitter card: `summary_large_image`, title, description, image.
- `noindex,follow` on auth/utility pages (`/login`, `/user-dashboard`, `/admin-panel`, `/unauthorized`, `/404`).
- `og:type=article` on case-study detail pages (others stay `website`).

### JSON-LD structured data

| Page | Schemas |
|---|---|
| `/` | Organization (canonical node, `@id`=`ORG_ID`, with registered address) |
| `/about-us` | Organization (references same `@id`=`ORG_ID` — one merged entity, not a duplicate) |
| `/warehouse/:slug` (×671) | `RealEstateListing` + `Place` (array `@type`) + `BreadcrumbList` |
| `/listings/city/:city` (×85) | `CollectionPage` + `ItemList` + `BreadcrumbList` |
| `/listings/state/:state` (×23) | `CollectionPage` + `ItemList` + `BreadcrumbList` |
| `/listings/city/:city/:type` (×88) | `CollectionPage` + `ItemList` + `BreadcrumbList` |
| `/listings/state/:state/:type` (×34) | `CollectionPage` + `ItemList` + `BreadcrumbList` |
| `/casestudies/:slug` (×5) | `Article` |

### URL structure

- **Semantic warehouse slugs** — `/warehouse/{size}-sqft-{type}-warehouse-{city}-{id}` (ID at the tail for stable parsing).
- **Per-city / per-state landing pages** — `/listings/city/bengaluru`, `/listings/state/karnataka`.
- **Type segmentation** — `/listings/city/bengaluru/peb`, `/listings/state/karnataka/rcc`.
- Alias collapsing — `Bangalore → Bengaluru`, `Bombay → Mumbai`, `Madras → Chennai`, `Calcutta → Kolkata`, `Gurgaon → Gurugram`.
- Clean URLs (`cleanUrls: true` in `vercel.json`), no trailing slashes.

### Content / pre-rendered HTML

- **`/listings`** — 21 default warehouse cards baked into SSG HTML (3-col × 7 rows). Filter UI hydrates client-side.
- **`/warehouse/:slug`** — full card, photos, specs, an auto-generated "About this warehouse" paragraph, and a "More warehouses in {city}" section (up to 6 related cards) — all in initial HTML.
- **Location pages** — full grid of matching warehouse cards, city/state-specific h1 + lead paragraph.

### Internal linking

- Visible **breadcrumbs** on `/warehouse/:slug` and all location pages (Home › Listings › … › current).
- **PEB / RCC chip links** on base city/state pages → type variants (e.g., `/listings/city/bengaluru/peb`).
- **Related warehouses** section on every warehouse page (in-city listings).
- **"Explore our spaces" footer** — collapsible (collapsed by default, links present in DOM so crawlers see them) covering all six location dimensions.
- Site-wide nav (header, footer quick links) consistent.

### Accessibility / Core Web Vitals signals

- **Heading audit** — exactly one `<h1>` per indexable page.
- **Real alt text** built from listing data (`"34,000 sqft warehouse in Bengaluru, Karnataka"`), not `"Image 1 of 5"`.
- **Image loading hints** — first row of cards eager + `fetchPriority="high"`, rest lazy + `decoding="async"`.
- **Hero LCP fix** — `hero.mp4` no longer preloaded; mounted only on `min-width: 768px` post-hydration so mobile doesn't pay for it.
- Decorative carousel images marked `aria-hidden="true"` with empty alt.
- `lovable-tagger` runtime + script tag fully removed.

---

## 🔲 Still left

### Operational (non-code, do these manually)

| Item | Why | Where |
|---|---|---|
| **Submit `sitemap.xml` to Google Search Console** | Without this, indexing is slow | search.google.com/search-console |
| **Submit to Bing Webmaster Tools** | Bing + Yahoo combined ≈ 5% of search traffic | bing.com/webmasters |
| **Request indexing** for homepage + 5–10 representative pages in GSC | Seeds the initial crawl faster | GSC URL inspection tool |
| **Backend data cleanup** | Typos like `Banglore`, `Karanataka` split ranking signal across duplicate pages; postal codes are leaking into the state field | Backend |
| **Social profile URLs for `sameAs`** | LinkedIn added (`linkedin.com/company/wareongo`). Add Instagram / X to `organizationLd.sameAs` in `src/pages/Index.tsx` once those accounts exist. | Index.tsx |

### Code, ordered by ROI

| # | Item | Effort | Why |
|---|---|---|---|
| 1 | **Image optimization (WebP/AVIF, srcset)** | Medium | Listings R2 images are served raw (likely 1–3 MB each). Pipe through Vercel Image Optimization. Big LCP win. |
| 2 | **PageSpeed Insights audit** | Manual | Measure actual LCP / CLS / INP. Often uncovers quick fixes. |
| ~~3~~ | ~~**Image sitemap**~~ ✅ DONE | — | Google image-sitemap extension now embedded in `sitemap.xml` (warehouse photos, ≤10/listing). |
| 4 | **`lastmod` from real data** | Small | Sitemap currently uses today's date for every URL. Wire the backend's `updatedAt` (if exposed) so freshness signal is honest. |
| 5 | **Footer curation to top 20 cities** | Tiny | Concentrates link equity. Currently ~315 links in "Explore our spaces" — quality diluted across long tail (sitemap still covers everything). |
| 6 | **`WebSite` + `SearchAction` JSON-LD on `/`** | Medium | Unlocks Google's sitelinks search box. Requires `?q=` full-text param on `/listings` first (we already have `?city=`, `?state=`, etc. — full-text is the gap). |
| 7 | **301 redirects for legacy `/warehouse/:id` URLs** | Small | We dropped them per call. If any old URLs got indexed before the slug migration, add redirects in `vercel.json` so equity survives. |
| 8 | **`width`/`height` on `<img>` tags** | Tiny | Currently relying on Tailwind fixed-size containers + `object-cover`. No actual CLS in testing, but Lighthouse will still flag. |
| 9 | **"More cities in {state}" cross-link** on city pages | Small | Internal linking between sibling pages. Adds another crawl path. |

### Won't-do / deferred

| Item | Reason |
|---|---|
| Numeric-range size buckets (`/listings/.../under-10000-sqft`) | Deferred per call — wait until type segmentation has rankings to measure incremental value. |
| `prerender.io` style runtime rendering | SSG with `vite-react-ssg` covers this. |
| AMP | Not worth the maintenance burden in 2026. |
| Migration to Next.js | SSG-only build outputs static files; current setup is portable across Vercel / S3+CloudFront / any CDN. No framework lock-in. |

---

## Where to look in code

| Concern | File |
|---|---|
| Per-page metadata | `src/components/PageHead.tsx` |
| Warehouse JSON-LD | `src/pages/WarehouseDetail.tsx` (`buildJsonLd`) |
| Location JSON-LD | `src/pages/LocationListings.tsx` (`collectionLd`) |
| Breadcrumbs (UI + JSON-LD) | `src/components/Breadcrumbs.tsx` |
| Slug helpers | `src/lib/warehouseSlug.ts` |
| Warehouse loader / static paths | `src/loaders/warehouseLoader.ts` |
| Location loader / aliases / type combos | `src/loaders/locationLoader.ts` |
| Sitemap generation | `scripts/generate-sitemap.mjs` |
| Footer city/state link data | `scripts/generate-locations.mjs` → `src/data/locations.generated.ts` |
| Cache headers + clean URLs | `vercel.json` |
| Site origin constant | `src/config/config.ts` (`SITE_URL`) |

---

## Quick verification commands

```bash
# Fresh build
npm run build

# Inspect a warehouse page's structured data
SAMPLE=$(ls -d dist/warehouse/*bengaluru* | head -1)
tr -d '\n' < "$SAMPLE/index.html" | grep -oE '"@type":"[^"]+"|"@type":\[[^]]+\]' | sort -u

# Count baked-in listing cards
grep -c "sqft warehouse in" dist/listings/index.html
grep -c "sqft warehouse in" dist/listings/city/bengaluru/index.html

# Sitemap size + sample
wc -l dist/sitemap.xml
head -20 dist/sitemap.xml
```

After any deploy, paste a live URL into:

- **`search.google.com/test/rich-results`** — Google's official check
- **`validator.schema.org`** — strict schema.org validation
