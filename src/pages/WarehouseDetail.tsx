import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ClientOnly } from 'vite-react-ssg';
import PageHead from '@/components/PageHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseImageCarousel from '@/components/WarehouseImageCarousel';
import WarehouseInfo from '@/components/WarehouseInfo';
import ContactFormDialog from '@/components/ContactFormDialog';
import { SITE_URL } from '@/config/config';
import { trackEvent } from '@/lib/analytics';
import type { WarehouseLoaderData } from '@/loaders/warehouseLoader';

// Leaflet touches `window` at module import time — lazy-load behind ClientOnly so SSG never resolves it.
const WarehouseLocationMap = lazy(() => import('@/components/WarehouseLocationMap'));

const buildJsonLd = (data: NonNullable<WarehouseLoaderData>) => {
  const loc = data.specifications.location;
  const space = data.specifications.space;
  // RealEstateListing is in schema.org's pending namespace; pairing with Place keeps
  // compatibility with crawlers that haven't adopted the pending vocab yet.
  return {
    '@context': 'https://schema.org',
    '@type': ['RealEstateListing', 'Place'],
    '@id': `${SITE_URL}/warehouse/${data.id}`,
    name: `Warehouse ${data.id} — ${loc.city}, ${loc.state}`,
    url: `${SITE_URL}/warehouse/${data.id}`,
    image: data.images && data.images.length > 0 ? data.images : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.address,
      addressLocality: loc.city,
      addressRegion: loc.state,
      postalCode: loc.postalCode ?? undefined,
      addressCountry: 'IN',
    },
    additionalProperty: [
      space.totalSpace
        ? { '@type': 'PropertyValue', name: 'Total area (sqft)', value: space.totalSpace }
        : null,
      space.ratePerSqft
        ? { '@type': 'PropertyValue', name: 'Rate (INR per sqft)', value: space.ratePerSqft }
        : null,
      data.specifications.infrastructure.type
        ? { '@type': 'PropertyValue', name: 'Warehouse type', value: data.specifications.infrastructure.type }
        : null,
      data.specifications.infrastructure.clearHeight
        ? { '@type': 'PropertyValue', name: 'Clear height', value: data.specifications.infrastructure.clearHeight }
        : null,
    ].filter(Boolean),
  };
};

const WarehouseDetail = () => {
  const warehouseData = useLoaderData() as WarehouseLoaderData;
  const navigate = useNavigate();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  useEffect(() => {
    if (!warehouseData) return;
    trackEvent('view_listing', {
      warehouse_id: warehouseData.id,
      city: warehouseData.specifications?.location?.city,
      state: warehouseData.specifications?.location?.state,
      size_sqft: warehouseData.specifications?.space?.totalSpace,
      price_per_sqft: warehouseData.specifications?.space?.ratePerSqft,
    });
  }, [warehouseData]);

  const handleBackClick = () => {
    navigate('/listings');
  };

  const handleRequestCallback = () => {
    if (!warehouseData) return;
    trackEvent('cta_click', {
      label: 'Request a callback',
      cta_location: 'warehouse_detail',
      warehouse_id: warehouseData.id,
    });
    setIsContactDialogOpen(true);
  };

  // Loader returned null — warehouse not found / invalid id.
  if (!warehouseData) {
    return (
      <div className="min-h-screen flex flex-col bg-wareongo-ivory">
        <PageHead
          title="Warehouse not found | WareOnGo"
          description="This warehouse listing is no longer available."
          path="/warehouse/not-found"
          noindex
        />
        <Navbar />
        <main className="flex-grow bg-wareongo-ivory">
          <div className="section-container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md border border-wareongo-blue/30 rounded-2xl p-8">
                <AlertCircle className="w-12 h-12 text-wareongo-blue mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-semibold text-wareongo-blue mb-2">
                  Warehouse not found
                </h2>
                <p className="text-wareongo-slate text-sm mb-6">
                  The warehouse you are looking for does not exist or has been removed.
                </p>
                <button
                  onClick={handleBackClick}
                  className="inline-flex items-center px-4 h-10 rounded-xl border border-wareongo-blue/30 text-wareongo-blue text-sm font-medium hover:bg-wareongo-blue/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to listings
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const loc = warehouseData.specifications.location;
  const space = warehouseData.specifications.space;
  const seoTitle = `Warehouse ${warehouseData.id} — ${space.totalSpace ? space.totalSpace.toLocaleString() + ' sqft' : 'space'} in ${loc.city}, ${loc.state} | WareOnGo`;
  const seoDescription = `${space.totalSpace ? space.totalSpace.toLocaleString() + ' sqft warehouse' : 'Warehouse space'} for rent at ${loc.address}, ${loc.city}, ${loc.state}${space.ratePerSqft ? ` — ₹${space.ratePerSqft}/sqft` : ''}. ${warehouseData.specifications.infrastructure.type !== 'Standard' ? warehouseData.specifications.infrastructure.type + ' construction. ' : ''}List with WareOnGo.`;
  const ogImage = warehouseData.images && warehouseData.images.length > 0 ? warehouseData.images[0] : undefined;
  const jsonLd = buildJsonLd(warehouseData);

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title={seoTitle}
        description={seoDescription}
        path={`/warehouse/${warehouseData.id}`}
        image={ogImage}
      >
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </PageHead>
      <Navbar />

      <main
        className="flex-grow bg-wareongo-ivory bg-opacity-50"
        role="main"
        aria-labelledby="warehouse-title"
      >
        <div className="section-container px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            className="mb-4 sm:mb-6"
            items={[
              { label: 'Home', path: '/' },
              { label: 'Listings', path: '/listings' },
              { label: `Warehouse #${warehouseData.id} — ${loc.city}, ${loc.state}` },
            ]}
          />

          {/* Main Content - Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Image Carousel - Mobile: order-1, Desktop: spans 2 rows */}
            <div className="space-y-4 order-1 lg:row-span-2">
              <WarehouseImageCarousel
                images={warehouseData.images}
                warehouseId={warehouseData.id}
                city={loc.city}
                state={loc.state}
                sizeSqft={space.totalSpace}
              />
            </div>

            {/* Warehouse Information - Mobile: order-2, Desktop: top right */}
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-2">
              {/* Header */}
              <header>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate">
                    Warehouse
                  </span>
                  <span
                    className="bg-wareongo-ivory border border-wareongo-blue/20 text-wareongo-blue px-2.5 py-1 rounded-md text-xs font-semibold"
                    aria-label={`Warehouse ID ${warehouseData.id}`}
                  >
                    ID: {warehouseData.id}
                  </span>
                </div>
                <h1
                  id="warehouse-title"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-wareongo-blue leading-tight mb-3"
                >
                  {loc.city}, {loc.state}
                </h1>
                <address className="not-italic">
                  <p className="text-sm sm:text-base text-wareongo-slate leading-relaxed">
                    {loc.address}
                  </p>
                </address>
              </header>

              {/* Quick Stats */}
              <section aria-labelledby="quick-stats-title">
                <h2 id="quick-stats-title" className="sr-only">Quick Statistics</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="border border-wareongo-blue/30 rounded-xl p-4 sm:p-5">
                    <div className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-wareongo-slate mb-1.5">
                      Total area
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-wareongo-blue">
                      {space.totalSpace.toLocaleString()}
                      <span className="text-sm font-medium text-wareongo-slate ml-1">sqft</span>
                    </div>
                  </div>
                  <div className="border border-wareongo-blue/30 rounded-xl p-4 sm:p-5">
                    <div className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-wareongo-slate mb-1.5">
                      Rate
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-wareongo-blue">
                      ₹{space.ratePerSqft}
                      <span className="text-sm font-medium text-wareongo-slate ml-1">/ sqft</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Button */}
              <section aria-labelledby="contact-actions-title">
                <h2 id="contact-actions-title" className="sr-only">Contact Actions</h2>
                <button
                  onClick={handleRequestCallback}
                  className="w-full h-12 rounded-xl bg-wareongo-blue text-white text-sm font-medium tracking-wide hover:bg-wareongo-blue/90 focus:outline-none focus:ring-2 focus:ring-wareongo-blue/40 focus:ring-offset-2 transition-colors"
                  aria-describedby="request-callback-desc"
                >
                  Request a callback
                </button>
                <span id="request-callback-desc" className="sr-only">
                  Opens a form to request a callback from our team about this warehouse
                </span>
              </section>
            </div>

            {/* Location Map - Mobile: order-3 (below info), Desktop: bottom right */}
            <div className="order-3 lg:order-3">
              <section aria-labelledby="location-map-title">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-2">
                  Location
                </span>
                <h2 id="location-map-title" className="sr-only">Location</h2>
                <ClientOnly fallback={<div className="w-full h-48 sm:h-56 lg:h-60 bg-muted animate-pulse rounded" />}>
                  {() => (
                    <Suspense fallback={<div className="w-full h-48 sm:h-56 lg:h-60 bg-muted animate-pulse rounded" />}>
                      <WarehouseLocationMap
                        address={loc.address}
                        city={loc.city}
                        state={loc.state}
                        postalCode={loc.postalCode}
                        warehouseId={warehouseData.id}
                        className="w-full h-48 sm:h-56 lg:h-60"
                      />
                    </Suspense>
                  )}
                </ClientOnly>
              </section>
            </div>
          </div>

          {/* Detailed Information */}
          <section aria-labelledby="detailed-info-title">
            <h2 id="detailed-info-title" className="sr-only">Detailed Warehouse Information</h2>
            <WarehouseInfo specifications={warehouseData.specifications} />
          </section>
        </div>
      </main>

      <Footer />

      {/* Contact Form Dialog */}
      <ContactFormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        title="Request Callback"
        description={`Request a callback from our team to discuss this warehouse opportunity. Warehouse ID: ${warehouseData.id} located at ${loc.address}, ${loc.city}, ${loc.state}.`}
        successMessage="Callback requested successfully! Our team will contact you soon."
        source={`warehouse-detail-${warehouseData.id}-callback`}
      />
    </div>
  );
};

export default WarehouseDetail;
