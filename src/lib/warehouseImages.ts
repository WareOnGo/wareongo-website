import type { PagePhoto } from '@/data/editorial';

const IMAGE_EXTENSIONS = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i;
const IMAGE_HOSTS = ['r2.dev', 'cloudinary.com', 'imgur.com', 'amazonaws.com', 'googleusercontent.com', 'imagekit.io', 'picsum.photos', 'unsplash.com'];

/** Accept browser image formats, never videos/documents just because R2 hosts them. */
export function isWarehouseImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const pathname = decodeURIComponent(url.pathname);
    if (IMAGE_EXTENSIONS.test(pathname)) return true;
    // Image CDNs can expose extensionless URLs. An explicit unknown extension
    // (including .mp4/.mov/.pdf/.heic) is not a browser-decodable photo.
    if (/\.[^/.]+$/.test(pathname)) return false;
    return IMAGE_HOSTS.some(host => url.hostname === host || url.hostname.endsWith('.' + host));
  } catch { return false; }
}

/** Supports the API's JSON arrays and legacy comma-separated strings. */
export function photoUrls(raw: unknown): string[] {
  let value = raw;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { /* Plain URL or legacy CSV. */ }
  }
  const entries = Array.isArray(value) ? value : [value];
  return entries.flatMap(entry => typeof entry === 'string'
    ? entry.split(/,\s*(?=https?:\/\/)/i).map(url => url.trim())
    : []).filter(isWarehouseImageUrl);
}

// Matches the backfill's webp/<source path without extension>.webp naming.
// Source identity survives null slots, reordering and different public hosts.
function sourceKey(url: string): string {
  return decodeURIComponent(new URL(url).pathname)
    .replace(/^\/webp\//, '/')
    .replace(IMAGE_EXTENSIONS, '');
}

export function buildPreferredImages(originalInput: unknown, webpInput: unknown): {
  images: string[]; fallbacks: (string | null)[];
} {
  const variants = new Map(photoUrls(webpInput)
    .filter(url => /\.webp$/i.test(new URL(url).pathname))
    .map(url => [sourceKey(url), url]));
  const images: string[] = [];
  const fallbacks: (string | null)[] = [];
  for (const original of new Set(photoUrls(originalInput))) {
    const preferred = variants.get(sourceKey(original)) ?? original;
    images.push(preferred);
    fallbacks.push(preferred !== original ? original : null);
  }
  return { images, fallbacks };
}

export interface ImageRecord {
  id: number | null;
  originalUrl: string;
  webpUrl: string | null;
  displayUrl: string;
  classification: string | null;
  documentKind: string | null;
  caption: string | null;
}

/**
 * Website-only gallery metadata, sent beside `images` in the same order (the
 * images themselves stay the shared contract). Older backends omit it.
 */
export interface ImageQuality {
  /** The graded quality after the resolution ceiling. */
  qualityTier: 'T1' | 'T2' | 'T3' | null;
  coverSuitable: boolean | null;
  width: number | null;
  height: number | null;
}

type Gallery = { images?: ImageRecord[]; imageQuality?: (ImageQuality | null)[] };

/** API rows carry explicit original/variant pairs, including pending images. */
export function preferredWarehouseImages(warehouse: {
  images?: ImageRecord[]; photos?: unknown; photosWebp?: unknown;
}): { images: string[]; fallbacks: (string | null)[] } {
  if (!Array.isArray(warehouse.images)) return buildPreferredImages(warehouse.photos, warehouse.photosWebp);
  const images: string[] = [], fallbacks: (string | null)[] = [];
  const seen = new Set<string>();
  for (const row of warehouse.images) {
    if (!row || typeof row.originalUrl !== 'string' || seen.has(row.originalUrl)) continue;
    const primary = isWarehouseImageUrl(row.webpUrl) ? row.webpUrl : row.originalUrl;
    if (!isWarehouseImageUrl(primary)) continue;
    seen.add(row.originalUrl);
    images.push(primary);
    fallbacks.push(primary !== row.originalUrl ? row.originalUrl : null);
  }
  return { images, fallbacks };
}

/** Whether any of these listings' photos carry a quality tier; older backends report none. */
export const reportsQualityTiers = (listings: Gallery[]): boolean =>
  listings.some(listing => Array.isArray(listing.imageQuality) && listing.imageQuality.some(q => typeof q?.qualityTier === 'string'));

const dimension = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;

/**
 * The best T1 gallery photo among some listings: cover-suitable first, then
 * landscape, then from the larger listing, then the lower listing id, then
 * gallery order. `used` holds original URLs already on the page, so one page
 * never shows a photo twice. The caption is the alt text when there is one.
 */
export function bestTierOnePhoto(
  listings: ({ id: number; size: number | null | undefined } & Gallery)[],
  used: ReadonlySet<string>,
  alt: string,
): PagePhoto | null {
  const candidates = listings.flatMap(listing => (listing.images ?? []).flatMap((row, order) => {
    const quality = Array.isArray(listing.imageQuality) ? listing.imageQuality[order] : undefined;
    if (quality?.qualityTier !== 'T1' || typeof row?.originalUrl !== 'string' || used.has(row.originalUrl)) return [];
    const url = isWarehouseImageUrl(row.webpUrl) ? row.webpUrl : row.originalUrl;
    if (!isWarehouseImageUrl(url)) return [];
    const width = dimension(quality.width), height = dimension(quality.height);
    return [{ row, url, width, height, order, id: listing.id, size: listing.size ?? 0,
      cover: Number(quality.coverSuitable === true), landscape: Number(Boolean(width && height && width >= height)) }];
  }));
  const best = candidates.sort((a, b) => b.cover - a.cover || b.landscape - a.landscape
    || b.size - a.size || a.id - b.id || a.order - b.order)[0];
  if (!best) return null;
  return {
    url: best.url, alt: best.row.caption?.trim() || alt,
    ...(best.width && best.height ? { width: best.width, height: best.height } : {}),
    ...(best.url !== best.row.originalUrl ? { fallback: best.row.originalUrl } : {}),
  };
}

export interface WarehouseImage { primary: string; fallback: string | null }

// Curated/CMS cards also use photos bundled with the website. Keep API image
// parsing absolute-only, while allowing root-relative photo paths in galleries.
function isGalleryImageUrl(value: unknown): value is string {
  if (isWarehouseImageUrl(value)) return true;
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
    && isWarehouseImageUrl(`https://wareongo.com${value}`);
}

/** API and CMS photo pairs; filenames need not be related. */
export function warehouseImages(images: string[], fallbacks: (string | null)[] = []): WarehouseImage[] {
  const seen = new Set<string>();
  return images.flatMap((value, i) => {
    const primary = typeof value === 'string' ? value.trim() : '';
    if (!isGalleryImageUrl(primary) || seen.has(primary)) return [];
    seen.add(primary);
    const fallback = fallbacks[i]?.trim();
    return [{ primary, fallback: isGalleryImageUrl(fallback) && fallback !== primary ? fallback : null }];
  });
}
