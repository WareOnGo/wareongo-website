import { useLoaderData, Navigate, Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';
import { CITY_HUBS } from '@/data/cityHubs';
import { STATE_HUBS } from '@/data/stateHubs';
import { warehousePath } from '@/lib/warehouseSlug';
import type { LocationListingSeed } from '@/loaders/locationLoader';
import { readLocationListingSeed } from '@/lib/locationListingSeed';
import { ListingsView } from './Listings';

export default function LocationListings() {
  const loaded = useLoaderData() as LocationListingSeed | null;
  if (!loaded) return <Navigate to="/listings" replace />;
  const data = readLocationListingSeed(loaded);
  const { type, canonical, slug, warehouses, warehouseType, typeCounts, parentCity } = data;
  const total = data.pagination.totalItems;
  const isMicromarket = type === 'micromarket';
  const noun = type === 'state' ? `${canonical} state` : canonical;
  // Micromarkets nest under their parent city: /listings/city/{city}/{locality}.
  const basePath =
    isMicromarket && parentCity
      ? `/listings/city/${parentCity.slug}/${slug}`
      : `/listings/${type}/${slug}`;
  const path = warehouseType ? `${basePath}/${warehouseType.toLowerCase()}` : basePath;
  const typeLabel = warehouseType === 'PEB' ? 'PEB' : warehouseType === 'RCC' ? 'RCC' : '';
  const headingPrefix = warehouseType ? `${typeLabel} Warehouses` : 'Warehouses';
  // A bare locality name is ambiguous on its own ("Ernakulam" is also a city
  // name elsewhere in the data), so micromarket titles carry the parent city.
  const titlePlace =
    isMicromarket && parentCity && parentCity.canonical !== canonical
      ? `${canonical}, ${parentCity.canonical}`
      : canonical;
  // "Godowns" on base pages only — Search Console shows "godown for rent in {city}"
  // queries; type pages keep tighter titles (those queries say "PEB"/"RCC warehouse").
  const seoTitle = warehouseType
    ? `${headingPrefix} for Rent in ${titlePlace} | WareOnGo`
    : `Warehouses & Godowns for Rent in ${titlePlace} | WareOnGo`;
  const heading = `${headingPrefix} for Rent in ${titlePlace}`;
  const descSubject = warehouseType ? `${typeLabel} warehouses` : 'Warehouses';

  // Build-time stats baked into the meta description + lead copy — concrete,
  // extractable numbers (count, size range) anchored to the location name.
  // Rates are deliberately excluded: missing ratePerSqft defaults to 35 in
  // transformWarehouseData, so a computed range would be unreliable.
  //
  // Thin-market threshold: below this count, the copy drops the count and
  // size range — "1 verified warehouse in Pune" advertises weakness, not
  // inventory. The grid itself still shows whatever exists.
  const STATS_MIN_LISTINGS = 5;
  const showStats = total >= STATS_MIN_LISTINGS;
  const fmtSqft = (n: number) => n.toLocaleString('en-IN');
  const minSize = data.summary.minSize;
  const maxSize = data.summary.maxSize;
  const sizeRange =
    minSize !== null && maxSize !== null
      ? minSize === maxSize
        ? `${fmtSqft(minSize)} sqft`
        : `${fmtSqft(minSize)} to ${fmtSqft(maxSize)} sqft`
      : null;
  // ", ranging from 5,000 to 120,000 sqft" / " of 24,000 sqft" (single listing)
  const sizeLead = sizeRange ? (minSize === maxSize ? ` of ${sizeRange}` : `, ranging from ${sizeRange}`) : '';
  const countNoun = `${total} verified ${warehouseType ? `${typeLabel} ` : ''}warehouse${total === 1 ? '' : 's'}`;

  // "godown" synonym on base pages only — exact-match for "godown for rent in {city}"
  // queries (Search Console shows them); Google bolds the matching phrase in the snippet.
  const godownClause = warehouseType ? '' : ` Also listed as godowns for rent in ${canonical}.`;
  const seoDescription = showStats
    ? `${countNoun} for rent in ${titlePlace}${sizeRange ? `, ${sizeRange}` : ''}. Transparent pricing, curated shortlist in 4 hours.${godownClause}`
    : `${descSubject} for rent in ${titlePlace}. Verified listings with transparent pricing. Get custom options, expert guidance & site visit within 48 hours.${godownClause}`;

  // Machine-readable synonyms + micro-markets. "Godown" matches North-Indian query
  // phrasing; hub localities (curated in cityHubs.ts / stateHubs.ts) associate
  // locality-level queries ("warehouse in okhla") with the parent location page.
  // State pages additionally carry the cities that actually have inventory there,
  // derived live from the loader data (so they stay current as listings change).
  // Micromarket pages are themselves a locality, so they get no hub list — the
  // parent-city keyword below is the association that matters for them.
  const hubs =
    warehouseType || isMicromarket
      ? []
      : ((type === 'city' ? CITY_HUBS[slug] : STATE_HUBS[slug]) ?? []);
  const stateCities = type === 'state' && !warehouseType ? data.summary.cities : [];
  const keywordPlaces = [...new Set([...stateCities, ...hubs])];
  const ldKeywords = warehouseType
    ? undefined
    : [
        `warehouse for rent in ${canonical}`,
        `godown for rent in ${canonical}`,
        // "warehouse in nelamangala bangalore" — the qualified phrasing people
        // actually search for a locality.
        ...(isMicromarket && parentCity && parentCity.canonical !== canonical
          ? [
              `warehouse for rent in ${canonical} ${parentCity.canonical}`,
              `godown for rent in ${canonical} ${parentCity.canonical}`,
            ]
          : []),
        ...keywordPlaces.map((p) => `warehouse for rent in ${p}`),
      ].join(', ');

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: heading,
    ...(warehouseType ? {} : { alternateName: `Godowns for Rent in ${canonical}` }),
    ...(ldKeywords ? { keywords: ldKeywords } : {}),
    description: seoDescription,
    url: `${SITE_URL}${path}`,
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORG_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListElement: warehouses.slice(0, 50).map((w, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}${warehousePath({ id: w.id, size: w.size, warehouseType: w.warehouseType, city: w.location.city })}`,
        name: `Warehouse ${w.id}, ${w.location.city}, ${w.location.state}`,
      })),
    },
  };

  return <ListingsView key={path} initialData={data} preset={data.filters}
    listId={`location:${type}:${slug}:${warehouseType || 'all'}`}
    head={<PageHead title={seoTitle} description={seoDescription} path={path}>
      <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
    </PageHead>}
    header={<>
          <Breadcrumbs
            className="mb-4 sm:mb-6"
            items={
              warehouseType
                ? ([
                    { label: 'Home', path: '/' },
                    { label: 'Listings', path: '/listings' },
                    ...(data.breadcrumbAncestors ?? []),
                    { label: canonical, path: basePath },
                    { label: `${typeLabel} warehouses` },
                  ] satisfies BreadcrumbItem[])
                : ([
                    { label: 'Home', path: '/' },
                    { label: 'Listings', path: '/listings' },
                    ...(data.breadcrumbAncestors ?? []),
                    { label: canonical },
                  ] satisfies BreadcrumbItem[])
            }
          />

          <header className="mb-8 sm:mb-10 max-w-3xl">
            <h1
              id="location-title"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue mb-3 leading-tight"
            >
              {heading}
            </h1>
            <p className="text-base sm:text-lg text-wareongo-slate leading-relaxed">
              {showStats ? (
                <>
                  {countNoun} available for rent in {canonical}
                  {sizeLead}
                  {!warehouseType && typeCounts && typeCounts.PEB > 0 && typeCounts.RCC > 0
                    ? ` including ${typeCounts.PEB} PEB and ${typeCounts.RCC} RCC options`
                    : ''}
                  . Transparent pricing and expert guidance.
                </>
              ) : (
                <>
                  Verified {warehouseType ? `${typeLabel} ` : ''}warehouses for rent in {canonical}.
                  Transparent pricing and expert guidance.
                </>
              )}
            </p>

            {data.overviewPath && (
              <Link to={data.overviewPath} className="mt-4 inline-block text-sm text-wareongo-blue hover:underline">
                Read the {canonical} overview →
              </Link>
            )}

            {/* Micromarkets have no PEB/RCC variants — they link up to their city instead. */}
            {isMicromarket && parentCity && parentCity.canonical !== canonical && (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/listings/city/${parentCity.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-wareongo-blue/30 text-sm text-wareongo-blue hover:bg-wareongo-blue/5 transition-colors"
                >
                  All warehouses in {parentCity.canonical}
                </Link>
              </div>
            )}

            {/* Type filter chips on base location pages — internal linking to PEB / RCC variants */}
            {!warehouseType && !isMicromarket && typeCounts && (typeCounts.PEB > 0 || typeCounts.RCC > 0) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {typeCounts.PEB > 0 && (
                  <Link
                    to={`${basePath}/peb`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-wareongo-blue/30 text-sm text-wareongo-blue hover:bg-wareongo-blue/5 transition-colors"
                  >
                    PEB warehouses
                    <span className="text-xs text-wareongo-slate">({typeCounts.PEB})</span>
                  </Link>
                )}
                {typeCounts.RCC > 0 && (
                  <Link
                    to={`${basePath}/rcc`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-wareongo-blue/30 text-sm text-wareongo-blue hover:bg-wareongo-blue/5 transition-colors"
                  >
                    RCC warehouses
                    <span className="text-xs text-wareongo-slate">({typeCounts.RCC})</span>
                  </Link>
                )}
              </div>
            )}
          </header>
    </>} />;
}
