import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import WarehousePhoto from '@/components/WarehousePhoto';
import { useWarehouseGallery } from '@/hooks/useWarehouseGallery';

interface WarehouseImageCarouselProps {
  images: string[];
  imageFallbacks?: (string | null)[];
  warehouseId: number;
  className?: string;
  onImageError?: (imageUrl: string, error: Event) => void;
  city?: string;
  state?: string;
  sizeSqft?: number;
}

const arrowClass = 'absolute top-1/2 -translate-y-1/2 bg-wareongo-ivory/95 hover:bg-wareongo-ivory text-wareongo-blue h-10 w-10 sm:h-11 sm:w-11 rounded-full z-30 focus:ring-2 focus:ring-wareongo-blue/40 focus:ring-offset-2 backdrop-blur-sm md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 flex items-center justify-center border border-wareongo-blue/20';

const WarehouseImageCarousel: React.FC<WarehouseImageCarouselProps> = ({
  images = [], imageFallbacks = [], warehouseId, className = '', onImageError, city, state, sizeSqft,
}) => {
  const locationPart = city && state ? `in ${city}, ${state}` : city ? `in ${city}` : '';
  const sizePart = sizeSqft ? `${sizeSqft.toLocaleString()} sqft ` : '';
  const baseAlt = `${sizePart}warehouse ${locationPart}`.trim();
  const carouselRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const gallery = useWarehouseGallery(warehouseId, images, imageFallbacks, visible);
  const { index, previous, direction } = gallery.state;
  const frame = gallery.frames[index];
  const count = gallery.valid.length;
  const position = gallery.position + 1;

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') gallery.move(-1);
    else if (event.key === 'ArrowRight') gallery.move(1);
    else gallery.select(event.key === 'Home' ? gallery.valid[0] : gallery.valid[count - 1]);
  };

  return (
    <div
      ref={carouselRef}
      className={`relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] bg-wareongo-blue/5 border border-wareongo-blue rounded-2xl overflow-hidden group ${className}`}
      role="region"
      aria-label={`Warehouse ${warehouseId} image carousel with ${count} images`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={(event) => {
        const point = event.touches[0];
        touch.current = point ? { x: point.clientX, y: point.clientY } : null;
      }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={(event) => {
        const start = touch.current;
        const end = event.changedTouches[0];
        touch.current = null;
        if (!start || !end) return;
        const dx = start.x - end.clientX;
        const dy = start.y - end.clientY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) gallery.move(dx > 0 ? 1 : -1);
      }}
    >
      {count === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <ImageIcon className="w-12 h-12 text-wareongo-blue/40 mb-3" />
          <span className="text-sm text-wareongo-slate text-center px-4">Images available on request</span>
        </div>
      ) : <>
        {/* Preserve the resolved original when animating away from a failed WebP. */}
        {direction && previous !== index && gallery.source(previous) && (
          <img
            src={gallery.source(previous)} alt="" aria-hidden="true" width={1080} height={720}
            className={`absolute inset-0 w-full h-full object-cover ${direction === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right'}`}
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        )}
        <WarehousePhoto
          key={`${gallery.state.key}:${index}`}
          primary={frame.primary} initialSrc={gallery.source(index)} fallback={frame.fallback}
          alt={count > 1 ? `${baseAlt} — photo ${position} of ${count}` : baseAlt}
          width={1080} height={720}
          className={`absolute inset-0 w-full h-full object-cover ${direction === 'left' ? 'animate-slide-in-left' : direction === 'right' ? 'animate-slide-in-right' : ''}`}
          onLoaded={(url) => gallery.loaded(index, url)}
          onFailed={() => {
            gallery.failed(index);
            onImageError?.(frame.primary, new Event('error'));
          }}
          loading="eager" decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'}
        />

        <span className="sr-only" aria-live="polite" aria-atomic="true">Image {position} of {count}. Use arrow keys to navigate.</span>
        {count > 1 && <>
          <button type="button" className={`${arrowClass} left-2 sm:left-4`}
            aria-label={`Previous image. Currently showing image ${position} of ${count}`}
            disabled={!!direction} onClick={() => gallery.move(-1)}>
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button type="button" className={`${arrowClass} right-2 sm:right-4`}
            aria-label={`Next image. Currently showing image ${position} of ${count}`}
            disabled={!!direction} onClick={() => gallery.move(1)}>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-30 max-w-full overflow-x-auto"
            role="tablist" aria-label="Image navigation">
            {gallery.valid.map((actualIndex, validIndex) => {
              const isActive = actualIndex === index;
              return <button key={actualIndex} type="button" onClick={() => gallery.select(actualIndex)}
                className="group p-1 focus:outline-none focus:ring-2 focus:ring-wareongo-blue focus:ring-offset-2 rounded"
                aria-label={`Go to image ${validIndex + 1}${isActive ? ' (current)' : ''}`}
                role="tab" aria-selected={isActive} tabIndex={isActive ? 0 : -1}>
                <div aria-hidden="true" className={`rounded-full transition-all duration-300 w-2.5 h-2.5 sm:w-3 sm:h-3 ${isActive ? 'bg-white shadow-lg' : 'border-2 border-white/80 group-hover:border-white group-focus:border-white'}`} />
              </button>;
            })}
          </div>
          <div aria-hidden="true" className="absolute top-3 right-3 bg-wareongo-ivory/90 backdrop-blur-sm border border-wareongo-blue/20 text-wareongo-blue px-2.5 py-1 rounded-md text-xs font-semibold z-30">
            {position} / {count}
          </div>
        </>}
      </>}
    </div>
  );
};

export default WarehouseImageCarousel;
