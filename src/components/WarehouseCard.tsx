import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Ruler, Building2, IndianRupee, ImageIcon, ShieldCheck, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ContactFormDialog from '@/components/ContactFormDialog';
import WarehousePhoto from '@/components/WarehousePhoto';
import { useWarehouseGallery } from '@/hooks/useWarehouseGallery';
import { useGallerySwipe } from '@/hooks/useGallerySwipe';
import WarehouseGalleryPreview from '@/components/WarehouseGalleryPreview';
import { trackEvent, type AnalyticsParams } from '@/lib/analytics';
import { useListingImpression } from '@/hooks/useListingAnalytics';

interface WarehouseCardProps {
  id: number;
  image?: string | null;
  images?: string[];
  // Per-index fallback URL for images[i]. When a primary image (typically a
  // WebP) fails to load, the <img> swaps once to this URL before being marked
  // failed. null entries mean no fallback available.
  imageFallbacks?: (string | null)[];
  coverImage?: string;
  address: string;
  location: {
    city: string;
    state: string;
  };
  size: number;
  ceilingHeight: number | null;
  price: number | null;
  fireCompliance: boolean;
  features: string[];
  href: string;
  // Only the first photo is critical at every grid width. Native lazy loading
  // still discovers the other visible desktop/tablet cards after layout.
  index?: number;
  analyticsContext?: AnalyticsParams;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({
  id,
  image,
  images = [],
  imageFallbacks = [],
  coverImage,
  address,
  location,
  size,
  ceilingHeight,
  price,
  fireCompliance,
  href,
  index = 0,
  analyticsContext = {},
}) => {
  const listingContext = { ...analyticsContext, warehouse_id: id, warehouse_city: location.city, warehouse_state: location.state, size_sqft: size, price_per_sqft: price ?? undefined };
  const impressionRef = useListingImpression(listingContext);
  const isFirstCard = index === 0;
  const altText = `${size ? size.toLocaleString() + ' sqft ' : ''}warehouse in ${location.city}, ${location.state}`;
  const [interacting, setInteracting] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const enquirySource = `warehouse-card-${id}-callback`;
  const gallery = useWarehouseGallery(id, images.length ? images : (image ? [image] : []), imageFallbacks, interacting);
  const { index: currentImageIndex, previous: prevImageIndex, direction: slideDirection } = gallery.state;
  const frame = gallery.frames[currentImageIndex];
  const truncate = (str: string, n: number) => (str.length > n ? str.slice(0, n - 1) + '…' : str);
  const moveImage = (delta: 1 | -1, offset = 0) => {
    setInteracting(true);
    if (gallery.valid.length > 1 && !slideDirection) trackEvent('listing_gallery_interaction', { ...listingContext, placement: 'warehouse_card', action: delta === 1 ? 'next' : 'previous', image_index: ((gallery.position + delta + gallery.valid.length) % gallery.valid.length) + 1 });
    gallery.move(delta, offset);
  };
  const swipe = useGallerySwipe({
    viewport: imageRef, target: impressionRef, enabled: gallery.valid.length > 1, busy: !!slideDirection,
    resetKey: `${gallery.state.key}:${currentImageIndex}`, onSwipe: moveImage,
  });

  return (
    <>
    <Card
      {...swipe.handlers}
      className="relative isolate transition-colors duration-300 overflow-hidden group border border-wareongo-blue rounded-2xl bg-transparent hover:bg-wareongo-blue/5 shadow-none"
      ref={impressionRef}
      data-warehouse-card={id}
      onPointerEnter={() => setInteracting(true)}
      onFocusCapture={() => setInteracting(true)}
      onTouchStart={() => setInteracting(true)}
    >
      <div ref={imageRef} style={{ ...gallery.transitionStyle, ...swipe.photoStyle }}
        className="relative overflow-hidden rounded-t-2xl group/image border-b border-wareongo-blue">
        {gallery.valid.length === 0 ? (
          <div className="w-full h-48 bg-wareongo-blue/5 flex flex-col items-center justify-center transition-colors duration-300">
            <ImageIcon className="w-8 h-8 text-wareongo-blue/40 mb-2" />
            <span className="text-xs text-wareongo-slate text-center px-2">
              Images available on request
            </span>
          </div>
        ) : (
          <>
            <div className="relative w-full h-48 overflow-hidden bg-wareongo-blue/5">
              <WarehouseGalleryPreview gallery={gallery} delta={swipe.preview} />
              {/* Previous image - slides out */}
              {slideDirection && prevImageIndex !== currentImageIndex && gallery.source(prevImageIndex) && (
                <img
                  src={gallery.source(prevImageIndex)}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  width={640}
                  height={480}
                  className={`warehouse-gallery-photo absolute inset-0 w-full h-48 object-cover object-center ${
                    slideDirection === 'left'
                      ? 'animate-slide-out-left'
                      : 'animate-slide-out-right'
                  }`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              {/* New image - slides in */}
              <WarehousePhoto
                key={`${gallery.state.key}:${currentImageIndex}`}
                primary={frame.primary}
                initialSrc={gallery.source(currentImageIndex)}
                preview={currentImageIndex === 0 && (!gallery.state.resolved[0] || gallery.state.resolved[0] === coverImage)
                  ? coverImage : undefined}
                fallback={frame.fallback}
                alt={altText}
                width={640}
                height={480}
                draggable={false}
                className={`warehouse-gallery-photo absolute inset-0 w-full h-48 object-cover object-center ${
                  slideDirection === 'left'
                    ? 'animate-slide-in-left'
                    : slideDirection === 'right'
                    ? 'animate-slide-in-right'
                    : ''
                }`}
                onLoaded={(url) => gallery.loaded(currentImageIndex, url)}
                onFailed={() => gallery.failed(currentImageIndex)}
                loading={isFirstCard ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={isFirstCard ? 'high' : 'auto'}
              />
            </div>
            
            {/* Carousel Navigation Buttons */}
            {gallery.valid.length > 0 && (
              <>
                {/* Only show arrow buttons if there are multiple images */}
                {gallery.valid.length > 1 && (
                  <>
                    <button
                      onClick={() => moveImage(-1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory text-wareongo-blue p-1.5 rounded-full border border-wareongo-blue/20 transition-all duration-200 z-30 hover:scale-110 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveImage(1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory text-wareongo-blue p-1.5 rounded-full border border-wareongo-blue/20 transition-all duration-200 z-30 hover:scale-110 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                {/* Image indicators - only show if multiple images */}
                {gallery.valid.length > 1 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex max-w-[calc(100%-1.5rem)] overflow-x-auto z-30">
                    {gallery.valid.map((actualIndex, validIndex) => {
                      return (
                        <button
                          key={actualIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (actualIndex !== currentImageIndex && !slideDirection) trackEvent('listing_gallery_interaction', { ...listingContext, placement: 'warehouse_card', action: 'dot', image_index: validIndex + 1 });
                            gallery.select(actualIndex);
                          }}
                          className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          aria-label={`Go to image ${validIndex + 1}`}
                        >
                          <div
                            className={`rounded-full transition-all duration-300 ${
                              actualIndex === currentImageIndex
                                ? 'w-2 h-2 bg-white shadow-lg'
                                : 'w-2 h-2 border-2 border-white/80 group-hover:border-white group-hover:scale-110'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <CardContent className="p-5 sm:p-6">
        {/* Title & Address */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-wareongo-blue mb-1.5 truncate" title={address}>
            {/* Stretch the link across the card; gallery/enquiry controls sit above it. */}
            <Link
              to={href}
              aria-label={`View warehouse ${id}: ${address}, ${location.city}, ${location.state}`}
              onClick={() => trackEvent('listing_open', listingContext)}
              onAuxClick={(event) => {
                if (event.button === 1) trackEvent('listing_open', listingContext);
              }}
              className="after:absolute after:inset-0 after:z-20 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-wareongo-blue"
            >
              {truncate(address, 36)}
            </Link>
          </h2>
          <div className="flex items-center text-wareongo-slate text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location.city}, {location.state}</span>
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center text-wareongo-slate text-xs sm:text-sm">
            <Ruler className="w-4 h-4 mr-1.5 text-wareongo-blue/70" />
            <span>{size.toLocaleString()} sqft</span>
          </div>
          <div className="flex items-center text-wareongo-slate text-xs sm:text-sm">
            <Building2 className="w-4 h-4 mr-1.5 text-wareongo-blue/70" />
            <span>{ceilingHeight === null ? 'Height not specified' : `${ceilingHeight} ft height`}</span>
          </div>
          <div className="flex items-center text-wareongo-slate text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-wareongo-blue/70" />
            <span>Fire NOC: {fireCompliance ? 'Yes' : 'No'}</span>
          </div>
          <div
            className={
              price === null
                ? 'flex items-center text-wareongo-slate text-xs sm:text-sm'
                : 'flex items-center text-wareongo-blue font-semibold text-xs sm:text-sm'
            }
          >
            <IndianRupee className={price === null ? 'w-4 h-4 mr-0.5 text-wareongo-blue/70' : 'w-4 h-4 mr-0.5'} />
            <span>{price === null ? 'Price on request' : `${price} / sqft`}</span>
          </div>
        </div>

        <button
          type="button"
          aria-haspopup="dialog"
          onClick={(event) => {
            event.stopPropagation();
            trackEvent('cta_click', {
              ...listingContext,
              label: 'Raise Enquiry',
              placement: 'warehouse_card',
              cta_id: 'raise_enquiry', form_id: 'warehouse_card_enquiry', lead_type: 'warehouse_enquiry',
              warehouse_id: id,
              source: enquirySource,
            });
            setIsEnquiryOpen(true);
          }}
          className="relative z-30 group/enquiry mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-wareongo-blue/25 px-4 text-sm font-semibold text-wareongo-blue transition-colors hover:border-wareongo-blue hover:bg-wareongo-blue hover:text-wareongo-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue focus-visible:ring-offset-2 focus-visible:ring-offset-wareongo-ivory"
        >
          Raise Enquiry
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/enquiry:-rotate-45 group-focus-visible/enquiry:-rotate-45 motion-reduce:transition-none" aria-hidden="true" />
        </button>
      </CardContent>
    </Card>
    <ContactFormDialog
      open={isEnquiryOpen}
      onOpenChange={setIsEnquiryOpen}
      title="Raise Enquiry"
      description={`Interested in ${address}, ${location.city}? Leave your details and our team will get in touch about this warehouse.`}
      successMessage="Enquiry sent successfully! Our team will contact you soon."
      source={enquirySource}
      requireCompanyName
      analyticsContext={{ ...listingContext, placement: 'warehouse_card' }}
    />
    </>
  );
};

export default WarehouseCard;
