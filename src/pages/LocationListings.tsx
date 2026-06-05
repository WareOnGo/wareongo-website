import { useLoaderData, useNavigate, Navigate, Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';
import { CITY_HUBS } from '@/data/cityHubs';
import { STATE_HUBS } from '@/data/stateHubs';
import { trackEvent } from '@/lib/analytics';
import { warehousePath } from '@/lib/warehouseSlug';
import type { LocationListingsLoaderData } from '@/loaders/locationLoader';

const LocationListings = () => {
  const data = useLoaderData() as LocationListingsLoaderData | null;
  const navigate = useNavigate();

  // No matching city/state — bounce back to the main listings page.
  if (!data) {
    return <Navigate to="/listings" replace />;
  }

  const { type, canonical, slug, warehouses, warehouseType, typeCounts } = data;
  const noun = type === 'city' ? canonical : `${canonical} state`;
  const basePath = `/listings/${type}/${slug}`;
  const path = warehouseType ? `${basePath}/${warehouseType.toLowerCase()}` : basePath;
  const typeLabel = warehouseType === 'PEB' ? 'PEB' : warehouseType === 'RCC' ? 'RCC' : '';
  const headingPrefix = warehouseType ? `${typeLabel} Warehouses` : 'Warehouses';
  // "Godowns" on base pages only — Search Console shows "godown for rent in {city}"
  // queries; type pages keep tighter titles (those queries say "PEB"/"RCC warehouse").
  const seoTitle = warehouseType
    ? `${headingPrefix} for Rent in ${canonical} | WareOnGo`
    : `Warehouses & Godowns for Rent in ${canonical} | WareOnGo`;
  const heading = `${headingPrefix} for Rent in ${canonical}`;
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
  const showStats = warehouses.length >= STATS_MIN_LISTINGS;
  const sizes = warehouses.map((w) => w.size).filter((s) => typeof s === 'number' && s > 0);
  const fmtSqft = (n: number) => n.toLocaleString('en-IN');
  const minSize = sizes.length > 0 ? Math.min(...sizes) : null;
  const maxSize = sizes.length > 0 ? Math.max(...sizes) : null;
  const sizeRange =
    minSize !== null && maxSize !== null
      ? minSize === maxSize
        ? `${fmtSqft(minSize)} sqft`
        : `${fmtSqft(minSize)} to ${fmtSqft(maxSize)} sqft`
      : null;
  // ", ranging from 5,000 to 120,000 sqft" / " of 24,000 sqft" (single listing)
  const sizeLead = sizeRange ? (minSize === maxSize ? ` of ${sizeRange}` : `, ranging from ${sizeRange}`) : '';
  const countNoun = `${warehouses.length} verified ${warehouseType ? `${typeLabel} ` : ''}warehouse${warehouses.length === 1 ? '' : 's'}`;

  // "godown" synonym on base pages only — exact-match for "godown for rent in {city}"
  // queries (Search Console shows them); Google bolds the matching phrase in the snippet.
  const godownClause = warehouseType ? '' : ` Also listed as godowns for rent in ${canonical}.`;
  const seoDescription = showStats
    ? `${countNoun} for rent in ${canonical}${sizeRange ? ` — ${sizeRange}` : ''}. Transparent pricing, curated shortlist in 4 hours.${godownClause}`
    : `${descSubject} for rent in ${canonical}. Verified listings with transparent pricing. Get custom options, expert guidance & site visit within 48 hours.${godownClause}`;

  // Machine-readable synonyms + micro-markets. "Godown" matches North-Indian query
  // phrasing; hub localities (curated in cityHubs.ts / stateHubs.ts) associate
  // locality-level queries ("warehouse in okhla") with the parent location page.
  // State pages additionally carry the cities that actually have inventory there,
  // derived live from the loader data (so they stay current as listings change).
  const hubs = warehouseType ? [] : ((type === 'city' ? CITY_HUBS[slug] : STATE_HUBS[slug]) ?? []);
  const titleCase = (s: string) =>
    s.toLowerCase().split(/\s+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const stateCities =
    type === 'state' && !warehouseType
      ? [...new Set(
          warehouses
            .map((w) => w.location.city?.trim() ?? '')
            // Skip junk/locality-grade values: too short, or comma-containing
            // ("Sector 78, Badshahpur") which would also corrupt the
            // comma-separated keywords string.
            .filter((c) => c.length > 2 && !c.includes(','))
            .map(titleCase),
        )].slice(0, 15)
      : [];
  const keywordPlaces = [...new Set([...stateCities, ...hubs])];
  const ldKeywords = warehouseType
    ? undefined
    : [
        `warehouse for rent in ${canonical}`,
        `godown for rent in ${canonical}`,
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
      numberOfItems: warehouses.length,
      itemListElement: warehouses.slice(0, 50).map((w, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}${warehousePath({ id: w.id, size: w.size, warehouseType: w.warehouseType, city: w.location.city })}`,
        name: `Warehouse ${w.id} — ${w.location.city}, ${w.location.state}`,
      })),
    },
  };

  const handleWarehouseClick = (warehouse: { id: number; size?: number; warehouseType?: string | null; location: { city: string } }) => {
    trackEvent('listing_open', {
      warehouse_id: warehouse.id,
      source: `${type}_page_${slug}`,
    });
    navigate(
      warehousePath({
        id: warehouse.id,
        size: warehouse.size,
        warehouseType: warehouse.warehouseType,
        city: warehouse.location.city,
      }),
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead title={seoTitle} description={seoDescription} path={path}>
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
      </PageHead>
      <Navbar />

      <main className="flex-grow bg-wareongo-ivory" role="main" aria-labelledby="location-title">
        <div className="section-container px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <Breadcrumbs
            className="mb-4 sm:mb-6"
            items={
              warehouseType
                ? ([
                    { label: 'Home', path: '/' },
                    { label: 'Listings', path: '/listings' },
                    { label: canonical, path: basePath },
                    { label: `${typeLabel} warehouses` },
                  ] satisfies BreadcrumbItem[])
                : ([
                    { label: 'Home', path: '/' },
                    { label: 'Listings', path: '/listings' },
                    { label: canonical },
                  ] satisfies BreadcrumbItem[])
            }
          />

          <header className="mb-8 sm:mb-10 max-w-3xl">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">
              {warehouseType ? `${typeLabel} · ${type === 'city' ? 'City' : 'State'}` : type === 'city' ? 'City' : 'State'}
            </span>
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
                    ? ` across ${typeCounts.PEB} PEB and ${typeCounts.RCC} RCC options`
                    : ''}
                  . Transparent pricing, direct contact, no middlemen.
                </>
              ) : (
                <>
                  Verified {warehouseType ? `${typeLabel} ` : ''}warehouses for rent in {canonical}.
                  Transparent pricing, direct contact, no middlemen.
                </>
              )}
            </p>

            {/* Type filter chips on base location pages — internal linking to PEB / RCC variants */}
            {!warehouseType && typeCounts && (typeCounts.PEB > 0 || typeCounts.RCC > 0) && (
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

          {warehouses.length === 0 ? (
            <div className="border border-wareongo-blue/30 rounded-2xl p-8 text-center max-w-md mx-auto">
              <p className="text-wareongo-slate mb-4">
                No active listings in {canonical} right now.
              </p>
              <button
                onClick={() => navigate('/request-warehouse')}
                className="inline-flex items-center px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
              >
                Request a warehouse
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {warehouses.map((warehouse, idx) => (
                <WarehouseCard
                  key={warehouse.id}
                  id={warehouse.id}
                  index={idx}
                  image={warehouse.image}
                  images={warehouse.images}
                  imageFallbacks={warehouse.imageFallbacks}
                  address={warehouse.address}
                  location={warehouse.location}
                  size={warehouse.size}
                  ceilingHeight={warehouse.ceilingHeight}
                  price={warehouse.price}
                  fireCompliance={warehouse.fireCompliance}
                  features={warehouse.features}
                  onClick={() => handleWarehouseClick(warehouse)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LocationListings;
