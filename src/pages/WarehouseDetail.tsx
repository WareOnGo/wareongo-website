import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseImageCarousel from '@/components/WarehouseImageCarousel';
import WarehouseInfo from '@/components/WarehouseInfo';
import WarehouseLocationMap from '@/components/WarehouseLocationMap';
import ContactFormDialog from '@/components/ContactFormDialog';
import { warehouseAPI, WarehouseAPIError, transformWarehouseDetailData } from '@/services/warehouseAPI';
import { trackEvent } from '@/lib/analytics';

const WarehouseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  // Fetch warehouse data using React Query
  const {
    data: warehouseData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      if (!id) {
        throw new WarehouseAPIError('No warehouse ID provided', 400, 'MISSING_ID');
      }
      
      const warehouse = await warehouseAPI.getWarehouseById(id);
      return transformWarehouseDetailData(warehouse);
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry for 404 errors or invalid IDs
      if (error instanceof WarehouseAPIError && 
          (error.code === 'WAREHOUSE_NOT_FOUND' || error.code === 'INVALID_ID')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

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

  // Handle back navigation
  const handleBackClick = () => {
    navigate('/listings');
  };

  // Handle contact form opening
  const handleRequestCallback = () => {
    trackEvent('cta_click', {
      label: 'Request a callback',
      cta_location: 'warehouse_detail',
      warehouse_id: id ? Number(id) : undefined,
    });
    setIsContactDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-wareongo-ivory">
        <Navbar />
        <main className="flex-grow bg-wareongo-ivory">
          <div className="section-container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-wareongo-blue animate-spin mx-auto mb-4" />
                <h2 className="text-lg sm:text-xl font-semibold text-wareongo-blue mb-1">
                  Loading warehouse details
                </h2>
                <p className="text-wareongo-slate text-sm">
                  Please wait while we fetch the information.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    const apiError = error as WarehouseAPIError;
    const isNotFound = apiError.code === 'WAREHOUSE_NOT_FOUND' || apiError.code === 'INVALID_ID';
    
    return (
      <div className="min-h-screen flex flex-col bg-wareongo-ivory">
        <Navbar />
        <main className="flex-grow bg-wareongo-ivory">
          <div className="section-container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md border border-wareongo-blue/30 rounded-2xl p-8">
                <AlertCircle className="w-12 h-12 text-wareongo-blue mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-semibold text-wareongo-blue mb-2">
                  {isNotFound ? 'Warehouse not found' : 'Error loading warehouse'}
                </h2>
                <p className="text-wareongo-slate text-sm mb-6">
                  {isNotFound
                    ? 'The warehouse you are looking for does not exist or has been removed.'
                    : apiError.message || 'Something went wrong while loading the warehouse details.'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleBackClick}
                    className="inline-flex items-center px-4 h-10 rounded-xl border border-wareongo-blue/30 text-wareongo-blue text-sm font-medium hover:bg-wareongo-blue/5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to listings
                  </button>
                  {!isNotFound && (
                    <button
                      onClick={() => refetch()}
                      className="px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                    >
                      Try again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Main content
  if (!warehouseData) {
    return (
      <div className="min-h-screen flex flex-col bg-wareongo-ivory">
        <Navbar />
        <main className="flex-grow bg-wareongo-ivory">
          <div className="section-container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center border border-wareongo-blue/30 rounded-2xl p-8">
                <AlertCircle className="w-10 h-10 text-wareongo-blue/50 mx-auto mb-4" />
                <h2 className="text-lg sm:text-xl font-semibold text-wareongo-blue mb-2">
                  No data available
                </h2>
                <p className="text-wareongo-slate text-sm mb-5">
                  Unable to load warehouse information.
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

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <Navbar />
      
      <main 
        className="flex-grow bg-wareongo-ivory bg-opacity-50"
        role="main"
        aria-labelledby="warehouse-title"
      >
        <div className="section-container px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center text-sm font-medium text-wareongo-slate hover:text-wareongo-blue focus:outline-none focus:ring-2 focus:ring-wareongo-blue/40 focus:ring-offset-2 rounded-md px-1 -ml-1 transition-colors"
              aria-label="Go back to warehouse listings"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Back to listings
            </button>
          </div>

          {/* Main Content - Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Image Carousel - Mobile: order-1, Desktop: spans 2 rows */}
            <div className="space-y-4 order-1 lg:row-span-2">
              <WarehouseImageCarousel 
                images={warehouseData.images}
                warehouseId={warehouseData.id}
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
                  {warehouseData.specifications.location.city}, {warehouseData.specifications.location.state}
                </h1>
                <address className="not-italic">
                  <p className="text-sm sm:text-base text-wareongo-slate leading-relaxed">
                    {warehouseData.specifications.location.address}
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
                      {warehouseData.specifications.space.totalSpace.toLocaleString()}
                      <span className="text-sm font-medium text-wareongo-slate ml-1">sqft</span>
                    </div>
                  </div>
                  <div className="border border-wareongo-blue/30 rounded-xl p-4 sm:p-5">
                    <div className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-wareongo-slate mb-1.5">
                      Rate
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-wareongo-blue">
                      ₹{warehouseData.specifications.space.ratePerSqft}
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
                <WarehouseLocationMap
                  address={warehouseData.specifications.location.address}
                  city={warehouseData.specifications.location.city}
                  state={warehouseData.specifications.location.state}
                  postalCode={warehouseData.specifications.location.postalCode}
                  warehouseId={warehouseData.id}
                  className="w-full h-48 sm:h-56 lg:h-60"
                />
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
        description={`Request a callback from our team to discuss this warehouse opportunity. Warehouse ID: ${warehouseData.id} located at ${warehouseData.specifications.location.address}, ${warehouseData.specifications.location.city}, ${warehouseData.specifications.location.state}.`}
        successMessage="Callback requested successfully! Our team will contact you soon."
        source={`warehouse-detail-${warehouseData.id}-callback`}
      />
    </div>
  );
};

export default WarehouseDetail;
