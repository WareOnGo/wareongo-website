// Vercel Image Optimization helpers (/_vercel/image endpoint).
//
// Vercel currently rejects transformations with HTTP 402. Serve stored WebPs
// (or their originals) directly; the existing helper API also covers blog images.
// Re-enable only after an explicit decision to use the paid optimizer.
const ENABLED = false;

const REMOTE = /^https:\/\//i;

// Listing-card grid: 3-col desktop ≈ 1/3 viewport, full-width-ish on mobile.
export const CARD_WIDTHS = [384, 640, 960];
export const CARD_SIZES = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 92vw';

// Warehouse-detail gallery: large hero, near full container width.
export const DETAIL_WIDTHS = [640, 1080, 1600];
export const DETAIL_SIZES = '(min-width: 768px) 66vw, 100vw';

// Blog figures. The prose column is max-w-3xl, so 768 CSS px at its widest —
// a full-width figure never needs more than 1600 (2× on a phone), and a collage
// tile is a half or a third of that. Two lists rather than one shared superset:
// every extra srcset entry is another source transformation Vercel can bill.
// The matching `sizes` strings live with the grid in pages/BlogDetail.tsx,
// since the two have to agree.
export const BLOG_FULL_WIDTHS = [640, 1080, 1600];
export const BLOG_TILE_WIDTHS = [384, 640, 960];

export const isOptimizable = (url: string | null | undefined): url is string =>
  ENABLED && !!url && REMOTE.test(url);

export const optimizedSrc = (url: string, width: number, quality = 75): string =>
  isOptimizable(url) ? `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}` : url;

export const optimizedSrcSet = (url: string, widths: number[]): string | undefined =>
  isOptimizable(url) ? widths.map((w) => `${optimizedSrc(url, w)} ${w}w`).join(', ') : undefined;
