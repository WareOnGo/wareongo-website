import type { MicromarketImage } from '@/data/micromarkets';
import { optimizedSrc, optimizedSrcSet, BLOG_TILE_WIDTHS } from '@/lib/imageOpt';

/**
 * A CMS-uploaded figure on a micromarket page, cropped to a fixed ratio so the
 * two-column sections line up whatever the source photo is.
 *
 * Same fallback behaviour as the blog renderer: Vercel's optimizer returns an
 * error rather than an image when it won't serve a source (unlisted host, or a
 * spent transformation quota), so one retry against the raw R2 URL turns that
 * into a slower image instead of a broken one.
 */
const fallbackToRaw = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  const raw = img.dataset.raw;
  if (!raw || img.src === raw) return;
  img.removeAttribute('srcset');
  img.removeAttribute('sizes');
  img.src = raw;
};

const EditorialImage = ({
  image,
  ratio = 'aspect-[4/3]',
  priority = false,
  className = '',
}: {
  image: MicromarketImage;
  /**
   * Tailwind aspect class. One ratio across the page by default: two different
   * ones made the market figure tower over its paragraph while the hero's sat
   * comfortably beside its column.
   */
  ratio?: string;
  /** The hero image is above the fold, so it must not be lazy. */
  priority?: boolean;
  className?: string;
}) => (
  <div
    className={`${ratio} overflow-hidden rounded-2xl border border-wareongo-blue bg-wareongo-blue/5 ${className}`}
  >
    <img
      src={optimizedSrc(image.url, 960)}
      srcSet={optimizedSrcSet(image.url, BLOG_TILE_WIDTHS)}
      sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 92vw"
      data-raw={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onError={fallbackToRaw}
      className="h-full w-full object-cover"
    />
  </div>
);

export default EditorialImage;
