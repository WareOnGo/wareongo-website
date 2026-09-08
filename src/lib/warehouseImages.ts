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

export interface WarehouseImage { primary: string; fallback: string | null }

/** Also protects client navigation using payloads cached before the pairing fix. */
export function warehouseImages(images: string[], fallbacks: (string | null)[] = []): WarehouseImage[] {
  const seen = new Set<string>();
  return images.flatMap((value, i) => {
    const primary = typeof value === 'string' ? value.trim() : '';
    if (!isWarehouseImageUrl(primary) || seen.has(primary)) return [];
    seen.add(primary);
    const fallback = fallbacks[i]?.trim();
    return [{ primary, fallback: isWarehouseImageUrl(fallback) && fallback !== primary && sourceKey(primary) === sourceKey(fallback) ? fallback : null }];
  });
}
