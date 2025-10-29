import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseImageCarousel from '@/components/WarehouseImageCarousel';
import WarehouseInfo from '@/components/WarehouseInfo';
import ContactFormDialog from '@/components/ContactFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { warehouseAPI, WarehouseAPIError, transformWarehouseDetailData } from '@/services/warehouseAPI';

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

  // Handle back navigation
  const handleBackClick = () => {
    navigate('/listings');
  };

  // Handle contact form opening
  const handleRequestCallback = () => {
    setIsContactDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-wareongo-ivory bg-opacity-50">
          <div className="section-container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-wareongo-blue animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-wareongo-charcoal mb-2">
                  Loading warehouse details...
                </h2>
                <p className="text-gray-600">
                  Please wait while we fetch the warehouse information.
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-wareongo-ivory bg-opacity-50">
          <div className="section-container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-wareongo-charcoal mb-2">
                  {isNotFound ? 'Warehouse Not Found' : 'Error Loading Warehouse'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {isNotFound 
                    ? 'The warehouse you are looking for does not exist or has been removed.'
                    : apiError.message || 'Something went wrong while loading the warehouse details.'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleBackClick} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Listings
                  </Button>
                  {!isNotFound && (
                    <Button onClick={() => refetch()} className="bg-wareongo-blue hover:bg-blue-700">
                      Try Again
                    </Button>
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-wareongo-ivory bg-opacity-50">
          <div className="section-container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-wareongo-charcoal mb-2">
                  No Data Available
                </h2>
                <p className="text-gray-600 mb-4">
                  Unable to load warehouse information.
                </p>
                <Button onClick={handleBackClick} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Listings
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main 
        className="flex-grow bg-wareongo-ivory bg-opacity-50"
        role="main"
        aria-labelledby="warehouse-title"
      >
        <div className="section-container px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-4 sm:mb-6">
            <Button 
              onClick={handleBackClick} 
              variant="ghost" 
              className="text-wareongo-blue hover:text-blue-700 focus:ring-2 focus:ring-wareongo-blue focus:ring-offset-2"
              aria-label="Go back to warehouse listings"
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Listings
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Image Carousel */}
            <div className="space-y-4 order-1">
              <WarehouseImageCarousel 
                images={warehouseData.images}
                warehouseId={warehouseData.id}
              />
            </div>

            {/* Warehouse Information */}
            <div className="space-y-4 sm:space-y-6 order-2">
              {/* Header */}
              <header>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <h1 
                    id="warehouse-title"
                    className="text-2xl sm:text-3xl font-bold text-wareongo-charcoal leading-tight"
                  >
                    Warehouse Details
                  </h1>
                  <span 
                    className="bg-wareongo-blue text-white px-3 py-1 rounded text-sm font-semibold self-start"
                    aria-label={`Warehouse ID ${warehouseData.id}`}
                  >
                    ID: {warehouseData.id}
                  </span>
                </div>
                <address className="not-italic">
                  <p className="text-base sm:text-lg text-gray-600">
                    {warehouseData.specifications.location.address}, {warehouseData.specifications.location.city}, {warehouseData.specifications.location.state}
                  </p>
                </address>
              </header>

              {/* Quick Stats */}
              <section aria-labelledby="quick-stats-title">
                <h2 id="quick-stats-title" className="sr-only">Quick Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-wareongo-blue">
                        {warehouseData.specifications.space.totalSpace.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Space (sqft)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-wareongo-blue">
                        ₹{warehouseData.specifications.space.ratePerSqft}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Per sqft</div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Contact Button */}
              <section aria-labelledby="contact-actions-title">
                <h2 id="contact-actions-title" className="sr-only">Contact Actions</h2>
                <Button 
                  onClick={handleRequestCallback}
                  className="w-full bg-wareongo-blue hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white py-3"
                  size="lg"
                  aria-describedby="request-callback-desc"
                >
                  Request a Callback
                </Button>
                <span id="request-callback-desc" className="sr-only">
                  Opens a form to request a callback from our team about this warehouse
                </span>
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