import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { optimizedSrc, optimizedSrcSet, DETAIL_WIDTHS, DETAIL_SIZES } from '@/lib/imageOpt';

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

interface WarehouseImageCarouselProps {
  images: string[];
  // Per-index fallback URL (typically the original when images[i] is a WebP).
  // The carousel swaps src to this once before counting an image as failed.
  imageFallbacks?: (string | null)[];
  warehouseId: number;
  className?: string;
  onImageError?: (imageUrl: string, error: Event) => void;
  // Used to build descriptive alt text (e.g. "45,000 sqft warehouse in Bengaluru, Karnataka").
  city?: string;
  state?: string;
  sizeSqft?: number;
}

const WarehouseImageCarousel: React.FC<WarehouseImageCarouselProps> = ({
  images = [],
  imageFallbacks = [],
  warehouseId,
  className = '',
  onImageError,
  city,
  state,
  sizeSqft,
}) => {
  const locationPart = city && state ? `in ${city}, ${state}` : city ? `in ${city}` : '';
  const sizePart = sizeSqft ? `${sizeSqft.toLocaleString()} sqft ` : '';
  const baseAlt = `${sizePart}warehouse ${locationPart}`.trim() || `Warehouse ${warehouseId}`;
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

  const { availableImages, availableFallbacks } = useMemo(() => {
    const filtered = filterImageUrls(images);
    const indexMap = filtered.map(url => images.indexOf(url));
    const fbs = indexMap.map(idx => (idx >= 0 ? imageFallbacks[idx] ?? null : null));
    return { availableImages: filtered, availableFallbacks: fbs };
  }, [images, imageFallbacks]);
  const validImages = useMemo(
    () => availableImages.filter((_, idx) => !failedImages.has(idx)),
    [availableImages, failedImages],
  );
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

    // Preload the optimized variant — it's what the <img> will actually request.
    if (availableImages[prevActualIndex]) preloadImage(optimizedSrc(availableImages[prevActualIndex], 1080));
    if (availableImages[nextActualIndex]) preloadImage(optimizedSrc(availableImages[nextActualIndex], 1080));
  }, [currentImageIndex, availableImages, validImages]);

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;

    // Step 0: if we're showing a Vercel-optimized variant, drop srcset and
    // retry the raw source URL before the fallback/retry chain (which assumes
    // plain photo URLs — its `split('?')` logic would mangle /_vercel/image).
    const raw = img.dataset.raw;
    if (raw && img.src !== raw) {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.dataset.raw = '';
      img.src = raw;
      return;
    }

    // One-shot fallback: if the failing image has a fallback URL (the
    // original-format photo behind a WebP), swap once before counting retries.
    const fallback = img.dataset.fallback;
    if (fallback && img.src.split('?')[0] !== fallback) {
      img.dataset.fallback = '';
      img.src = fallback;
      return;
    }

    const failedUrl = availableImages[currentImageIndex];
    const currentRetries = retryCount.get(currentImageIndex) || 0;
    const maxRetries = 2;

    if (onImageError) {
      onImageError(failedUrl, event.nativeEvent);
    }

    if (currentRetries < maxRetries) {
      setRetryCount(prev => {
        const newMap = new Map(prev);
        newMap.set(currentImageIndex, currentRetries + 1);
        return newMap;
      });
      const img = event.currentTarget;
      const originalSrc = img.src.split('?')[0];
      img.src = `${originalSrc}?retry=${currentRetries + 1}&t=${Date.now()}`;
      return;
    }

    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(currentImageIndex);
      return newSet;
    });

    const remainingValidImages = availableImages.filter((_, idx) =>
      idx !== currentImageIndex && !failedImages.has(idx)
    );

    if (remainingValidImages.length === 0) {
      setImageLoading(false);
      return;
    }

    const nextValidIndex = availableImages.findIndex((img, idx) =>
      idx > currentImageIndex && !failedImages.has(idx)
    );

    if (nextValidIndex !== -1) {
      setCurrentImageIndex(nextValidIndex);
      setImageLoading(true);
    } else {
      const firstValidIndex = availableImages.findIndex((img, idx) => !failedImages.has(idx));
      if (firstValidIndex !== -1 && firstValidIndex !== currentImageIndex) {
        setCurrentImageIndex(firstValidIndex);
        setImageLoading(true);
      } else {
        setImageLoading(false);
      }
    }
  }, [availableImages, currentImageIndex, failedImages, retryCount, onImageError]);

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
      <div className={`relative w-full h-96 md:h-[600px] bg-wareongo-blue/5 border border-wareongo-blue/20 flex flex-col items-center justify-center rounded-2xl ${className}`}>
        <ImageIcon className="w-12 h-12 text-wareongo-blue/40 mb-3" />
        <span className="text-sm text-wareongo-slate text-center px-4">
          Images available on request
        </span>
      </div>
    );
  }

  return (
    <div 
      ref={carouselRef}
      className={`relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-wareongo-blue/5 border border-wareongo-blue rounded-2xl overflow-hidden group ${className}`}
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
        <div className="absolute inset-0 flex items-center justify-center bg-wareongo-blue/5 z-20">
          <Loader2 className="w-10 h-10 text-wareongo-blue animate-spin" />
        </div>
      )}
      
      {/* Previous image - sliding out, decorative duplicate of current */}
      {slideDirection && prevImageIndex !== currentImageIndex && availableImages[prevImageIndex] && (
        <img
          src={optimizedSrc(availableImages[prevImageIndex], 1080)}
          alt=""
          aria-hidden="true"
          width={1080}
          height={720}
          className={`absolute inset-0 w-full h-full object-cover ${
            slideDirection === 'left'
              ? 'animate-slide-out-left'
              : 'animate-slide-out-right'
          }`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* Current image - slides in. First image stays eager (LCP); others lazy. */}
      <img
        key={`${warehouseId}-${currentImageIndex}-${availableImages[currentImageIndex]}`}
        src={optimizedSrc(availableImages[currentImageIndex], 1080)}
        srcSet={optimizedSrcSet(availableImages[currentImageIndex], DETAIL_WIDTHS)}
        sizes={DETAIL_SIZES}
        data-raw={availableImages[currentImageIndex]}
        data-fallback={availableFallbacks[currentImageIndex] || ''}
        alt={validImages.length > 1 ? `${baseAlt} — photo ${currentImageIndex + 1} of ${validImages.length}` : baseAlt}
        width={1080}
        height={720}
        className={`absolute inset-0 w-full h-full object-cover ${
          slideDirection === 'left'
            ? 'animate-slide-in-left'
            : slideDirection === 'right'
            ? 'animate-slide-in-right'
            : ''
        }`}
        onLoad={() => {
          if (currentImageIndex === 0 && imageLoading) {
            setImageLoading(false);
          }
          setRetryCount(prev => {
            const newMap = new Map(prev);
            newMap.delete(currentImageIndex);
            return newMap;
          });
        }}
        onError={handleImageError}
        loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={currentImageIndex === 0 ? 'high' : 'auto'}
      />

      {/* Navigation buttons - only show if multiple images */}
      {hasMultipleImages && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory active:bg-wareongo-ivory text-wareongo-blue h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-opacity duration-200 z-30 focus:ring-2 focus:ring-wareongo-blue/40 focus:ring-offset-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center justify-center border border-wareongo-blue/20"
            aria-label={`Previous image. Currently showing image ${validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]) + 1} of ${validImages.length}`}
            type="button"
            disabled={isTransitioning}
          >
            <ChevronLeft className="w-5 h-5 text-wareongo-blue" aria-hidden="true" />
          </button>

          <button
            onClick={handleNextImage}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory active:bg-wareongo-ivory text-wareongo-blue h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-opacity duration-200 z-30 focus:ring-2 focus:ring-wareongo-blue/40 focus:ring-offset-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center justify-center border border-wareongo-blue/20"
            aria-label={`Next image. Currently showing image ${validImages.findIndex((_, i) => availableImages[currentImageIndex] === validImages[i]) + 1} of ${validImages.length}`}
            type="button"
            disabled={isTransitioning}
          >
            <ChevronRight className="w-5 h-5 text-wareongo-blue" aria-hidden="true" />
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
          className="absolute top-3 right-3 bg-wareongo-ivory/90 backdrop-blur-sm border border-wareongo-blue/20 text-wareongo-blue px-2.5 py-1 rounded-md text-xs font-semibold z-30"
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