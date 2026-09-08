import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Ruler, Building2, IndianRupee, ImageIcon, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import WarehousePhoto from '@/components/WarehousePhoto';
import { useWarehouseGallery } from '@/hooks/useWarehouseGallery';

interface WarehouseCardProps {
  id: number;
  image?: string | null;
  images?: string[];
  // Per-index fallback URL for images[i]. When a primary image (typically a
  // WebP) fails to load, the <img> swaps once to this URL before being marked
  // failed. null entries mean no fallback available.
  imageFallbacks?: (string | null)[];
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
  onClick?: () => void;
  // Position in the grid — first 3 cards stay eager for LCP, the rest lazy-load.
  index?: number;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({
  id,
  image,
  images = [],
  imageFallbacks = [],
  address,
  location,
  size,
  ceilingHeight,
  price,
  fireCompliance,
  features,
  onClick,
  index = 0,
}) => {
  // 3-col desktop grid → first row is 3 cards; keep them eager for LCP.
  const isAboveFold = index < 3;
  const altText = `${size ? size.toLocaleString() + ' sqft ' : ''}warehouse in ${location.city}, ${location.state}`;
  const [interacting, setInteracting] = useState(false);
  const gallery = useWarehouseGallery(id, images.length ? images : (image ? [image] : []), imageFallbacks, interacting);
  const { index: currentImageIndex, previous: prevImageIndex, direction: slideDirection } = gallery.state;
  const frame = gallery.frames[currentImageIndex];
  const truncate = (str: string, n: number) => (str.length > n ? str.slice(0, n - 1) + '…' : str);
  const navigate = (event: React.MouseEvent, delta: 1 | -1) => {
    event.stopPropagation();
    setInteracting(true);
    gallery.move(delta);
  };

  return (
    <Card
      className="cursor-pointer transition-colors duration-300 overflow-hidden group border border-wareongo-blue rounded-2xl bg-transparent hover:bg-wareongo-blue/5 shadow-none"
      onClick={onClick}
      data-warehouse-card={id}
      onPointerEnter={() => setInteracting(true)}
      onFocusCapture={() => setInteracting(true)}
      onTouchStart={() => setInteracting(true)}
    >
      <div className="relative overflow-hidden rounded-t-2xl group/image border-b border-wareongo-blue">
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
              {/* Previous image - slides out */}
              {slideDirection && prevImageIndex !== currentImageIndex && gallery.source(prevImageIndex) && (
                <img
                  src={gallery.source(prevImageIndex)}
                  alt=""
                  aria-hidden="true"
                  width={640}
                  height={480}
                  className={`absolute inset-0 w-full h-48 object-cover object-center ${
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
                fallback={frame.fallback}
                alt={altText}
                width={640}
                height={480}
                className={`absolute inset-0 w-full h-48 object-cover object-center ${
                  slideDirection === 'left'
                    ? 'animate-slide-in-left'
                    : slideDirection === 'right'
                    ? 'animate-slide-in-right'
                    : ''
                }`}
                onLoaded={(url) => gallery.loaded(currentImageIndex, url)}
                onFailed={() => gallery.failed(currentImageIndex)}
                loading={isAboveFold ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={isAboveFold ? 'high' : 'auto'}
              />
            </div>
            
            {/* Carousel Navigation Buttons */}
            {gallery.valid.length > 0 && (
              <>
                {/* Only show arrow buttons if there are multiple images */}
                {gallery.valid.length > 1 && (
                  <>
                    <button
                      onClick={(event) => navigate(event, -1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory text-wareongo-blue p-1.5 rounded-full border border-wareongo-blue/20 transition-all duration-200 z-30 hover:scale-110 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(event) => navigate(event, 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory text-wareongo-blue p-1.5 rounded-full border border-wareongo-blue/20 transition-all duration-200 z-30 hover:scale-110 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                {/* Image indicators - only show if multiple images */}
                {gallery.valid.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                    {gallery.valid.map((actualIndex, validIndex) => {
                      return (
                        <button
                          key={actualIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            gallery.select(actualIndex);
                          }}
                          className="group p-1"
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
            {truncate(address, 36)}
          </h2>
          <div className="flex items-center text-wareongo-slate text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location.city}, {location.state}</span>
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
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
            <span>Fire: {fireCompliance ? 'Yes' : 'No'}</span>
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

        {/* Features as bullet points */}
        {features.length > 0 && (
          <div className="pt-4 border-t border-wareongo-blue/10">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] font-medium text-wareongo-slate block mb-2">Key features</span>
            <ul className="list-disc pl-5 space-y-1 text-xs text-wareongo-slate">
              {features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WarehouseCard;
