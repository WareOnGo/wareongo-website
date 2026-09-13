import type { BlogBlock, BlogImage } from '@/data/blogs';
import { optimizedSrc, optimizedSrcSet, BLOG_FULL_WIDTHS, BLOG_TILE_WIDTHS } from '@/lib/imageOpt';

// Collage geometry, derived from the image count alone: 1 full width, 2 side by
// side, 3 in a row, 4 as a 2×2. Mobile keeps two columns so a pair still reads
// as a pair, and the odd tile of a 3-up spans the width rather than shrinking to
// a ~110px thumbnail. The CMS preview holds a copy of this — wareongo-cms
// lib/collage.ts — and has to change with it.
const COLLAGE_GRID: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2',
};

const collageSpan = (count: number, index: number) =>
  count === 3 && index === 0 ? 'col-span-2 sm:col-span-1' : '';

/**
 * What the browser should download for one tile, matching the grid above: a
 * third of the column for a 3-up from `sm` (where that grid turns on), otherwise
 * half. The full-width tile of a mobile 3-up asks for the whole viewport.
 */
const tileSizes = (count: number, index: number) =>
  count === 3
    ? `(min-width: 640px) 256px, ${index === 0 ? '100vw' : '50vw'}`
    : '(min-width: 768px) 384px, 50vw';

/**
 * Vercel's optimizer returns an error rather than an image when it won't serve a
 * source — an unlisted remote host, or a 402 once the account's transformation
 * quota is spent (which has happened in production before). Dropping back to the
 * raw R2 URL once turns that into a slower image instead of a broken one.
 */
const fallbackToRaw = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  const raw = img.dataset.raw;
  if (!raw || img.src === raw) return;
  img.removeAttribute('srcset');
  img.removeAttribute('sizes');
  img.src = raw;
};

const ImagesBlock = ({ images, caption }: { images: BlogImage[]; caption?: string }) => {
  const count = images.length;
  if (count === 0) return null;

  return (
    <figure className="mb-6">
      {count === 1 ? (
        // Shown at its own aspect ratio, capped in height so a portrait photo
        // can't push the rest of the blog off the screen. w-auto alongside
        // max-w-full keeps it undistorted when that cap bites.
        <img
          src={optimizedSrc(images[0].url, 1080)}
          srcSet={optimizedSrcSet(images[0].url, BLOG_FULL_WIDTHS)}
          sizes="(min-width: 768px) 768px, 100vw"
          data-raw={images[0].url}
          alt={images[0].alt}
          width={images[0].width}
          height={images[0].height}
          loading="lazy"
          decoding="async"
          onError={fallbackToRaw}
          className="mx-auto block h-auto w-auto max-h-[32rem] max-w-full rounded-2xl border border-wareongo-blue/20 bg-wareongo-blue/5"
        />
      ) : (
        <div className={`grid gap-2 sm:gap-3 ${COLLAGE_GRID[count]}`}>
          {images.map((img, i) => (
            // Tiles are cropped to a common 4:3 so rows line up whatever the
            // source photos are; the wrapper owns the box, the img fills it.
            <div
              key={img.url}
              className={`aspect-[4/3] overflow-hidden rounded-xl sm:rounded-2xl border border-wareongo-blue/20 bg-wareongo-blue/5 ${collageSpan(count, i)}`}
            >
              <img
                src={optimizedSrc(img.url, 640)}
                srcSet={optimizedSrcSet(img.url, BLOG_TILE_WIDTHS)}
                sizes={tileSizes(count, i)}
                data-raw={img.url}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                onError={fallbackToRaw}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      {caption && (
        <figcaption className="mt-2 text-center text-xs sm:text-sm text-wareongo-slate">{caption}</figcaption>
      )}
    </figure>
  );
};

// Simple prose renderer for the structured blog blocks. Deliberately plain —
// these pages exist to be read (by people and by AI engines), not to dazzle.
export const ContentBlock = ({ block }: { block: BlogBlock }) => {
  switch (block.kind) {
    case 'h2':
      return (
        <h2 className="text-xl sm:text-2xl font-bold text-wareongo-blue mt-10 mb-3">{block.text}</h2>
      );
    case 'h3':
      return (
        <h3 className="text-lg sm:text-xl font-semibold text-wareongo-charcoal mt-6 mb-2">{block.text}</h3>
      );
    case 'p':
      return <p className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed mb-4">{block.text}</p>;
    case 'ul':
      return (
        <ul className="list-disc pl-5 mb-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{item}</li>
          ))}
        </ol>
      );
    case 'table':
      // Flat full-strength borders + transparent background, matching the
      // listing-card / accordion idiom.
      return (
        <div className="overflow-x-auto mb-6">
          <div className="border border-wareongo-blue rounded-2xl overflow-hidden min-w-fit">
            <table className="w-full text-left text-[13px] sm:text-sm bg-transparent">
              <thead>
                <tr className="border-b border-wareongo-blue bg-wareongo-blue/5">
                  {block.table.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 font-semibold text-wareongo-blue text-[11px] sm:text-xs uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.table.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`transition-colors hover:bg-wareongo-blue/5 ${ri < block.table.rows.length - 1 ? 'border-b border-wareongo-blue/30' : ''}`}
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-4 py-3 align-top ${ci === 0 ? 'font-medium text-wareongo-charcoal' : 'text-wareongo-slate'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'images':
      return <ImagesBlock images={block.images} caption={block.caption} />;
  }
};
