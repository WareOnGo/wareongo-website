import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Ruler, Building2, IndianRupee, ImageIcon, ShieldCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Filter out non-image URLs (PDFs, docs, etc.) and invalid URLs
  const filterImageUrls = (urls: string[]): string[] => {
    return urls.filter(url => {
      if (!url || typeof url !== 'string') return false;
      
      const lowerUrl = url.toLowerCase().trim();
      
      // Must be a valid URL
      if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
        console.log(`Filtering out invalid URL: ${url}`);
        return false;
      }
      
      // Exclude PDFs and document files
      if (lowerUrl.includes('.pdf') || 
          lowerUrl.includes('.doc') || 
          lowerUrl.includes('.docx') ||
          lowerUrl.includes('.xls') ||
          lowerUrl.includes('.xlsx') ||
          lowerUrl.includes('.txt') ||
          lowerUrl.includes('.zip') ||
          lowerUrl.includes('.rar')) {
        console.log(`Filtering out non-image URL: ${url}`);
        return false;
      }
      
      // Check for valid image extensions or known image services
      const hasImageExtension = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].some(ext => lowerUrl.includes(ext));
      const isImageService = lowerUrl.includes('r2.dev') || 
                            lowerUrl.includes('cloudinary.com') ||
                            lowerUrl.includes('imgur.com') ||
                            lowerUrl.includes('amazonaws.com') ||
                            lowerUrl.includes('googleusercontent.com') ||
                            lowerUrl.includes('imagekit.io');
      
      // Only accept if it looks like an image
      if (!hasImageExtension && !isImageService) {
        console.log(`Filtering out URL without image indicators: ${url}`);
        return false;
      }
      
      return true;
    });
  };

  // Use images array if available, otherwise fall back to single image
  const rawImages = images.length > 0 ? images : (image ? [image] : []);
  const availableImages = filterImageUrls(rawImages);
  
  // Filter out images that have failed to load
  const validImages = availableImages.filter((_, index) => !failedImages.has(index));
  const hasMultipleImages = validImages.length > 1;

  console.log(`Warehouse ${id}:`, {
    rawImages: rawImages.length,
    afterFiltering: availableImages.length,
    failedImages: failedImages.size,
    validImages: validImages.length,
    currentIndex: currentImageIndex
  });

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
    const failedUrl = availableImages[currentImageIndex];
    console.log(`Image ${currentImageIndex} failed to load for warehouse ${id}:`, failedUrl);
    
    // Add to failed images set
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(currentImageIndex);
      return newSet;
    });
    
    // Find next valid image
    const remainingValidImages = availableImages.filter((_, idx) => 
      idx !== currentImageIndex && !failedImages.has(idx)
    );
    
    console.log(`Remaining valid images: ${remainingValidImages.length}`);
    
    // If no valid images remain, show placeholder
    if (remainingValidImages.length === 0) {
      console.log('No valid images remaining, showing placeholder');
      setImageError(true);
    } else {
      // Try to navigate to next valid image
      const nextValidIndex = availableImages.findIndex((img, idx) => 
        idx > currentImageIndex && !failedImages.has(idx)
      );
      
      if (nextValidIndex !== -1) {
        console.log(`Navigating to next valid image at index ${nextValidIndex}`);
        setCurrentImageIndex(nextValidIndex);
      } else {
        // Loop back to first valid image
        const firstValidIndex = availableImages.findIndex((img, idx) => !failedImages.has(idx));
        if (firstValidIndex !== -1 && firstValidIndex !== currentImageIndex) {
          console.log(`Looping back to first valid image at index ${firstValidIndex}`);
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
    
    console.log('Prev button clicked - setting slideDirection to RIGHT');
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
    
    console.log('Next button clicked - setting slideDirection to LEFT');
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
      className="cursor-pointer hover:shadow-2xl transition-shadow duration-300 overflow-hidden group border border-gray-200 rounded-xl bg-white"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-t-xl group/image">
        {imageError || validImages.length === 0 ? (
          <div className="w-full h-48 bg-gray-200 flex flex-col items-center justify-center group-hover:bg-gray-300 transition-colors duration-300">
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 text-center px-2">
              Images available on request
            </span>
          </div>
        ) : (
          <>
            <div className="relative w-full h-48 overflow-hidden bg-gray-100">
              {/* Loading spinner */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                  <Loader2 className="w-8 h-8 text-wareongo-blue animate-spin" />
                </div>
              )}
              
              {/* Previous image - slides out */}
              {slideDirection && prevImageIndex !== currentImageIndex && availableImages[prevImageIndex] && (
                <img
                  src={availableImages[prevImageIndex]}
                  alt={`Warehouse ${id} - Previous`}
                  className={`absolute inset-0 w-full h-48 object-cover object-center ${
                    slideDirection === 'left' 
                      ? 'animate-slide-out-left' 
                      : 'animate-slide-out-right'
                  }`}
                  onError={(e) => {
                    console.log('Previous image failed to load, hiding it');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              {/* New image - slides in */}
              <img
                key={`${id}-${currentImageIndex}-${availableImages[currentImageIndex]}`}
                src={availableImages[currentImageIndex]}
                alt={`Warehouse ${id} - Image ${currentImageIndex + 1}`}
                className={`absolute inset-0 w-full h-48 object-cover object-center ${
                  slideDirection === 'left' 
                    ? 'animate-slide-in-left' 
                    : slideDirection === 'right' 
                    ? 'animate-slide-in-right' 
                    : ''
                }`}
                onLoad={() => {
                  console.log('Image loaded successfully');
                  setImageLoading(false);
                }}
                onError={handleImageError}
                loading="eager"
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-xl transition-all duration-200 z-50 hover:scale-110 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-xl transition-all duration-200 z-50 hover:scale-110 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                {/* Image indicators - only show if multiple images */}
                {validImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
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
        <div className="absolute top-3 right-3 bg-wareongo-blue text-white px-2 py-1 rounded text-xs font-semibold shadow z-10">
          ID: {id}
        </div>
      </div>

      <CardContent className="p-5">
        {/* Title & Address */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={address}>
            {truncate(address, 36)}
          </h2>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mr-1 text-wareongo-blue" />
            <span>{location.city}, {location.state}</span>
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center text-gray-600 text-xs">
            <Ruler className="w-4 h-4 mr-1 text-wareongo-blue" />
            <span>{size.toLocaleString()} sqft</span>
          </div>
          <div className="flex items-center text-gray-600 text-xs">
            <Building2 className="w-4 h-4 mr-1 text-wareongo-blue" />
            <span>{ceilingHeight}m height</span>
          </div>
          <div className="flex items-center text-gray-600 text-xs">
            <ShieldCheck className="w-4 h-4 mr-1 text-wareongo-blue" />
            <span>Fire Compliance: {fireCompliance ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center text-wareongo-blue font-semibold text-xs">
            <IndianRupee className="w-4 h-4 mr-1" />
            <span>{price} per sqft</span>
          </div>
        </div>

        {/* Features as bullet points */}
        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-800 mb-1">Key Features</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            {features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseCard;
