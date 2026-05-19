import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Ruler, Building2, IndianRupee, ImageIcon, ShieldCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
const DOC_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip', '.rar'];
const IMAGE_HOSTS = ['r2.dev', 'cloudinary.com', 'imgur.com', 'amazonaws.com', 'googleusercontent.com', 'imagekit.io'];

const filterImageUrls = (urls: string[]): string[] => {
  return urls.filter(url => {
    if (!url || typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase().trim();
    if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) return false;
    if (DOC_EXTENSIONS.some(ext => lowerUrl.includes(ext))) return false;
    const hasImageExtension = IMAGE_EXTENSIONS.some(ext => lowerUrl.includes(ext));
    const isImageService = IMAGE_HOSTS.some(host => lowerUrl.includes(host));
    return hasImageExtension || isImageService;
  });
};

interface WarehouseCardProps {
  id: number;
  image?: string | null;
  images?: string[];
  address: string;
  location: {
    city: string;
    state: string;
  };
  size: number;
  ceilingHeight: number;
  price: number;
  fireCompliance: boolean;
  features: string[];
  onClick?: () => void;
  // Position in the grid — first 2 cards stay eager for LCP, the rest lazy-load.
  index?: number;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({
  id,
  image,
  images = [],
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
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Use images array if available, otherwise fall back to single image.
  // Memoize so the URL filter doesn't run on every render of every card in the listings grid.
  const availableImages = useMemo(() => {
    const raw = images.length > 0 ? images : (image ? [image] : []);
    return filterImageUrls(raw);
  }, [images, image]);

  const validImages = useMemo(
    () => availableImages.filter((_, idx) => !failedImages.has(idx)),
    [availableImages, failedImages],
  );

  // Preload adjacent images for smooth transitions
  React.useEffect(() => {
    if (validImages.length <= 1) return;

    const preloadImage = (url: string) => {
      const img = new Image();
      img.src = url;
    };

    // Preload previous and next images
    const currentValidIndex = validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]);
    const prevValidIndex = currentValidIndex === 0 ? validImages.length - 1 : currentValidIndex - 1;
    const nextValidIndex = currentValidIndex === validImages.length - 1 ? 0 : currentValidIndex + 1;

    const prevActualIndex = availableImages.indexOf(validImages[prevValidIndex]);
    const nextActualIndex = availableImages.indexOf(validImages[nextValidIndex]);

    if (availableImages[prevActualIndex]) preloadImage(availableImages[prevActualIndex]);
    if (availableImages[nextActualIndex]) preloadImage(availableImages[nextActualIndex]);
  }, [currentImageIndex, availableImages, validImages]);

  // Truncate address if too long
  const truncate = (str: string, n: number) => (str.length > n ? str.slice(0, n - 1) + '…' : str);

  const handleImageError = () => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(currentImageIndex);
      return newSet;
    });

    const remainingValidImages = availableImages.filter((_, idx) =>
      idx !== currentImageIndex && !failedImages.has(idx)
    );

    if (remainingValidImages.length === 0) {
      setImageError(true);
    } else {
      const nextValidIndex = availableImages.findIndex((img, idx) =>
        idx > currentImageIndex && !failedImages.has(idx)
      );

      if (nextValidIndex !== -1) {
        setCurrentImageIndex(nextValidIndex);
      } else {
        const firstValidIndex = availableImages.findIndex((img, idx) => !failedImages.has(idx));
        if (firstValidIndex !== -1 && firstValidIndex !== currentImageIndex) {
          setCurrentImageIndex(firstValidIndex);
        } else {
          setImageError(true);
        }
      }
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTransitioning) return;
    
    const currentValidIndex = validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]);
    const newValidIndex = currentValidIndex === 0 ? validImages.length - 1 : currentValidIndex - 1;
    const newActualIndex = availableImages.indexOf(validImages[newValidIndex]);
    
    setPrevImageIndex(currentImageIndex);
    setSlideDirection('right');
    setIsTransitioning(true);
    setImageLoading(true);
    setCurrentImageIndex(newActualIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setSlideDirection(null);
    }, 400);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTransitioning) return;
    
    const currentValidIndex = validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]);
    const newValidIndex = currentValidIndex === validImages.length - 1 ? 0 : currentValidIndex + 1;
    const newActualIndex = availableImages.indexOf(validImages[newValidIndex]);
    
    setPrevImageIndex(currentImageIndex);
    setSlideDirection('left');
    setIsTransitioning(true);
    setImageLoading(true);
    setCurrentImageIndex(newActualIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setSlideDirection(null);
    }, 400);
  };

  return (
    <Card
      className="cursor-pointer transition-colors duration-300 overflow-hidden group border border-wareongo-blue rounded-2xl bg-transparent hover:bg-wareongo-blue/5 shadow-none"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-t-2xl group/image border-b border-wareongo-blue">
        {imageError || validImages.length === 0 ? (
          <div className="w-full h-48 bg-wareongo-blue/5 flex flex-col items-center justify-center transition-colors duration-300">
            <ImageIcon className="w-8 h-8 text-wareongo-blue/40 mb-2" />
            <span className="text-xs text-wareongo-slate text-center px-2">
              Images available on request
            </span>
          </div>
        ) : (
          <>
            <div className="relative w-full h-48 overflow-hidden bg-wareongo-blue/5">
              {/* Loading spinner */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-wareongo-blue/5 z-20">
                  <Loader2 className="w-8 h-8 text-wareongo-blue animate-spin" />
                </div>
              )}
              
              {/* Previous image - slides out */}
              {slideDirection && prevImageIndex !== currentImageIndex && availableImages[prevImageIndex] && (
                <img
                  src={availableImages[prevImageIndex]}
                  alt=""
                  aria-hidden="true"
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
              <img
                key={`${id}-${currentImageIndex}-${availableImages[currentImageIndex]}`}
                src={availableImages[currentImageIndex]}
                alt={altText}
                className={`absolute inset-0 w-full h-48 object-cover object-center ${
                  slideDirection === 'left'
                    ? 'animate-slide-in-left'
                    : slideDirection === 'right'
                    ? 'animate-slide-in-right'
                    : ''
                }`}
                onLoad={() => setImageLoading(false)}
                onError={handleImageError}
                loading={isAboveFold ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={isAboveFold ? 'high' : 'auto'}
              />
            </div>
            
            {/* Carousel Navigation Buttons */}
            {validImages.length > 0 && (
              <>
                {/* Only show arrow buttons if there are multiple images */}
                {validImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory text-wareongo-blue p-1.5 rounded-full border border-wareongo-blue/20 transition-all duration-200 z-30 hover:scale-110 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory text-wareongo-blue p-1.5 rounded-full border border-wareongo-blue/20 transition-all duration-200 z-30 hover:scale-110 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                {/* Image indicators - only show if multiple images */}
                {validImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                    {validImages.map((_, validIndex) => {
                      const actualIndex = availableImages.indexOf(validImages[validIndex]);
                      return (
                        <button
                          key={actualIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(actualIndex);
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
            <span>{ceilingHeight}m height</span>
          </div>
          <div className="flex items-center text-wareongo-slate text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-wareongo-blue/70" />
            <span>Fire: {fireCompliance ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center text-wareongo-blue font-semibold text-xs sm:text-sm">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            <span>{price} / sqft</span>
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
