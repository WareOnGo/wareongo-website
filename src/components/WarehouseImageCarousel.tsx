import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WarehouseImageCarouselProps {
  images: string[];
  warehouseId: number;
  className?: string;
  onImageError?: (imageUrl: string, error: Event) => void;
}

const WarehouseImageCarousel: React.FC<WarehouseImageCarouselProps> = ({
  images = [],
  warehouseId,
  className = '',
  onImageError
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState<Map<number, number>>(new Map());
  const [isVisible, setIsVisible] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter out non-image URLs (PDFs, docs, etc.) and invalid URLs
  const filterImageUrls = useCallback((urls: string[]): string[] => {
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
  }, []);

  const availableImages = filterImageUrls(images);
  const validImages = availableImages.filter((_, index) => !failedImages.has(index));
  const hasMultipleImages = validImages.length > 1;

  // Preload adjacent images for smooth transitions
  useEffect(() => {
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

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const failedUrl = availableImages[currentImageIndex];
    const currentRetries = retryCount.get(currentImageIndex) || 0;
    const maxRetries = 2;
    
    console.log(`Image ${currentImageIndex} failed to load for warehouse ${warehouseId}:`, failedUrl, `(attempt ${currentRetries + 1})`);
    
    // Call optional error callback
    if (onImageError) {
      onImageError(failedUrl, event.nativeEvent);
    }
    
    // Retry logic for network failures
    if (currentRetries < maxRetries) {
      console.log(`Retrying image load (${currentRetries + 1}/${maxRetries})`);
      setRetryCount(prev => {
        const newMap = new Map(prev);
        newMap.set(currentImageIndex, currentRetries + 1);
        return newMap;
      });
      
      // Force reload by updating the image src with a cache-busting parameter
      const img = event.currentTarget;
      const originalSrc = img.src.split('?')[0]; // Remove existing query params
      img.src = `${originalSrc}?retry=${currentRetries + 1}&t=${Date.now()}`;
      return;
    }
    
    // Max retries reached, mark as failed
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
    
    // If no valid images remain, stop loading and let the component show placeholder
    if (remainingValidImages.length === 0) {
      console.log('No valid images remaining, showing placeholder');
      setImageLoading(false);
      return;
    }
    
    // Try to navigate to next valid image
    const nextValidIndex = availableImages.findIndex((img, idx) => 
      idx > currentImageIndex && !failedImages.has(idx)
    );
    
    if (nextValidIndex !== -1) {
      console.log(`Navigating to next valid image at index ${nextValidIndex}`);
      setCurrentImageIndex(nextValidIndex);
      setImageLoading(true); // Reset loading state for new image
    } else {
      // Loop back to first valid image
      const firstValidIndex = availableImages.findIndex((img, idx) => !failedImages.has(idx));
      if (firstValidIndex !== -1 && firstValidIndex !== currentImageIndex) {
        console.log(`Looping back to first valid image at index ${firstValidIndex}`);
        setCurrentImageIndex(firstValidIndex);
        setImageLoading(true); // Reset loading state for new image
      } else {
        // No valid images found
        setImageLoading(false);
      }
    }
  }, [availableImages, currentImageIndex, failedImages, warehouseId, retryCount, onImageError]);

  const navigateToImage = useCallback((direction: 'prev' | 'next') => {
    if (isTransitioning || validImages.length <= 1) return;
    
    const currentValidIndex = validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]);
    let newValidIndex: number;
    
    if (direction === 'prev') {
      newValidIndex = currentValidIndex === 0 ? validImages.length - 1 : currentValidIndex - 1;
    } else {
      newValidIndex = currentValidIndex === validImages.length - 1 ? 0 : currentValidIndex + 1;
    }
    
    const newActualIndex = availableImages.indexOf(validImages[newValidIndex]);
    
    setPrevImageIndex(currentImageIndex);
    setSlideDirection(direction === 'prev' ? 'right' : 'left');
    setIsTransitioning(true);
    // Don't show loading spinner for navigation - images should be preloaded
    setCurrentImageIndex(newActualIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setSlideDirection(null);
    }, 400);
  }, [isTransitioning, validImages, availableImages, currentImageIndex]);

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigateToImage('prev');
  }, [navigateToImage]);

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigateToImage('next');
  }, [navigateToImage]);

  // Touch/swipe support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };

  // Intersection Observer for lazy loading optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  // Keyboard navigation - only when carousel is focused
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard events when the carousel or its children are focused
      const activeElement = document.activeElement;
      const carouselElement = carouselRef.current;
      
      if (!carouselElement || !activeElement) return;
      
      const isCarouselFocused = carouselElement.contains(activeElement) || 
                               activeElement === carouselElement;
      
      if (!isCarouselFocused) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevImage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextImage();
      } else if (event.key === 'Home') {
        event.preventDefault();
        goToImage(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goToImage(availableImages.length - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevImage, handleNextImage, availableImages.length]);

  const goToImage = (index: number) => {
    if (index === currentImageIndex || isTransitioning) return;
    
    setPrevImageIndex(currentImageIndex);
    setSlideDirection(index > currentImageIndex ? 'left' : 'right');
    setIsTransitioning(true);
    // Don't show loading spinner for navigation - images should be preloaded
    setCurrentImageIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setSlideDirection(null);
    }, 400);
  };

  if (validImages.length === 0) {
    return (
      <div className={`relative w-full h-96 md:h-[600px] bg-gray-200 flex flex-col items-center justify-center rounded-lg ${className}`}>
        <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
        <span className="text-lg text-gray-500 text-center px-4">
          Images available on request
        </span>
      </div>
    );
  }

  return (
    <div 
      ref={carouselRef}
      className={`relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-gray-100 rounded-lg overflow-hidden group ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label={`Warehouse ${warehouseId} image carousel with ${validImages.length} images`}
      aria-live="polite"
      aria-atomic="false"
      tabIndex={0}
      onFocus={() => {
        // Announce current image when carousel receives focus
        const currentValidIndex = validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]);
        const announcement = `Image ${currentValidIndex + 1} of ${validImages.length}. Use arrow keys to navigate.`;
        // Create a temporary announcement for screen readers
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = announcement;
        document.body.appendChild(announcer);
        setTimeout(() => document.body.removeChild(announcer), 1000);
      }}
    >
      {/* Loading spinner - only show on initial load, not during navigation */}
      {imageLoading && currentImageIndex === 0 && !isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      )}
      
      {/* Previous image - slides out */}
      {slideDirection && prevImageIndex !== currentImageIndex && availableImages[prevImageIndex] && (
        <img
          src={availableImages[prevImageIndex]}
          alt={`Warehouse ${warehouseId} - Previous`}
          className={`absolute inset-0 w-full h-full object-cover ${
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
      
      {/* Current image - slides in */}
      <img
        key={`${warehouseId}-${currentImageIndex}-${availableImages[currentImageIndex]}`}
        src={availableImages[currentImageIndex]}
        alt={`Warehouse ${warehouseId} - Image ${currentImageIndex + 1} of ${validImages.length}`}
        className={`absolute inset-0 w-full h-full object-cover ${
          slideDirection === 'left' 
            ? 'animate-slide-in-left' 
            : slideDirection === 'right' 
            ? 'animate-slide-in-right' 
            : ''
        }`}
        onLoad={() => {
          console.log('Image loaded successfully');
          // Only hide loading spinner if this is the initial load
          if (currentImageIndex === 0 && imageLoading) {
            setImageLoading(false);
          }
          // Reset retry count for successful loads
          setRetryCount(prev => {
            const newMap = new Map(prev);
            newMap.delete(currentImageIndex);
            return newMap;
          });
        }}
        onError={handleImageError}
        loading={isVisible ? "eager" : "lazy"}
      />

      {/* Navigation buttons - only show if multiple images */}
      {hasMultipleImages && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white active:bg-white text-gray-800 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-xl transition-opacity duration-200 z-30 focus:ring-2 focus:ring-wareongo-blue focus:ring-offset-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center justify-center border border-gray-200"
            aria-label={`Previous image. Currently showing image ${validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]) + 1} of ${validImages.length}`}
            type="button"
            disabled={isTransitioning}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" aria-hidden="true" />
          </button>
          
          <button
            onClick={handleNextImage}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white active:bg-white text-gray-800 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-xl transition-opacity duration-200 z-30 focus:ring-2 focus:ring-wareongo-blue focus:ring-offset-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center justify-center border border-gray-200"
            aria-label={`Next image. Currently showing image ${validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]) + 1} of ${validImages.length}`}
            type="button"
            disabled={isTransitioning}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Image indicators - only show if multiple images */}
      {hasMultipleImages && (
        <div 
          className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-30"
          role="tablist"
          aria-label="Image navigation"
        >
          {validImages.map((_, validIndex) => {
            const actualIndex = availableImages.indexOf(validImages[validIndex]);
            const isActive = actualIndex === currentImageIndex;
            return (
              <button
                key={actualIndex}
                onClick={() => goToImage(actualIndex)}
                className="group p-1 focus:outline-none focus:ring-2 focus:ring-wareongo-blue focus:ring-offset-2 rounded"
                aria-label={`Go to image ${validIndex + 1}${isActive ? ' (current)' : ''}`}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
              >
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white shadow-lg'
                      : 'w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white/80 group-hover:border-white group-focus:border-white group-hover:scale-110 group-focus:scale-110'
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Image counter */}
      {hasMultipleImages && (
        <div 
          className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium z-30"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="sr-only">Image </span>
          {validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]) + 1}
          <span className="sr-only"> of </span>
          <span aria-hidden="true"> / </span>
          {validImages.length}
        </div>
      )}
    </div>
  );
};

export default WarehouseImageCarousel;