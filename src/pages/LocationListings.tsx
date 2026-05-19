import { useLoaderData, useNavigate, Navigate, Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import { SITE_URL } from '@/config/config';
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
  const seoTitle = `${headingPrefix} for Rent in ${canonical} | WareOnGo`;
  const heading = `${headingPrefix} for Rent in ${canonical}`;
  const descSubject = warehouseType ? `${typeLabel} warehouses` : 'Warehouses';
  const seoDescription = `${descSubject} for rent in ${canonical}. Verified listings with transparent pricing. Get custom options, expert guidance & site visit within 48 hours.`;

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: heading,
    description: seoDescription,
    url: `${SITE_URL}${path}`,
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
              {warehouses.length} verified {warehouseType ? `${typeLabel} ` : ''}warehouse{warehouses.length === 1 ? '' : 's'} available in {canonical}.
              Transparent pricing, direct contact, no middlemen.
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
