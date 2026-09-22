import type { EditorialImage as ImageData, EditorialImageVariant } from '@/data/editorial';
import { useEffect, useRef } from 'react';
import { optimizedSrc, optimizedSrcSet, BLOG_TILE_WIDTHS } from '@/lib/imageOpt';

export const EDITORIAL_HERO_SIZES = '(min-width: 1400px) 516px, (min-width: 1280px) 468px, (min-width: 1024px) 365px, (min-width: 768px) 720px, (min-width: 640px) 592px, calc(100vw - 32px)';

/**
 * A CMS-uploaded figure on a micromarket page, cropped to a fixed ratio so the
 * two-column sections line up whatever the source photo is.
 *
 * Build-generated variants avoid per-request image optimization. If a variant
 * is unavailable, retry the original CMS photo once without changing its crop.
 */
const fallbackToRaw = (img: HTMLImageElement) => {
  const raw = img.dataset.raw;
  if (!raw || img.src === raw) return;
  img.removeAttribute('srcset');
  img.removeAttribute('sizes');
  img.src = raw;
};

const EditorialImage = ({
  image,
  variants,
  sizes = '(min-width: 1024px) 352px, (min-width: 768px) 720px, (min-width: 640px) 592px, calc(100vw - 32px)',
  ratio = 'aspect-[4/3]',
  priority = false,
  className = '',
}: {
  image: ImageData;
  variants?: EditorialImageVariant[];
  sizes?: string;
  /**
   * Tailwind aspect class. One ratio across the page by default: two different
   * ones made the market figure tower over its paragraph while the hero's sat
   * comfortably beside its column.
   */
  ratio?: string;
  /** Discover the hero eagerly; its desktop preload supplies high priority. */
  priority?: boolean;
  className?: string;
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A missing static asset can fail before hydration attaches onError.
    const img = imageRef.current;
    if (img?.complete && img.naturalWidth === 0) fallbackToRaw(img);
  }, [image.url]);
  return (
    <div
      className={`${ratio} overflow-hidden rounded-2xl border border-wareongo-blue bg-wareongo-blue/5 ${className}`}
    >
      <img
        ref={imageRef}
        src={variants?.at(-1)?.src ?? optimizedSrc(image.url, 960)}
        srcSet={variants?.map(v => `${v.src} ${v.width}w`).join(', ') || optimizedSrcSet(image.url, BLOG_TILE_WIDTHS)}
        sizes={sizes}
        data-raw={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'auto' : undefined}
        decoding="async"
        onError={event => fallbackToRaw(event.currentTarget)}
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export default EditorialImage;
