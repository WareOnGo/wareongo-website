// Vercel Image Optimization helpers (/_vercel/image endpoint).
//
// Only absolute remote URLs (the R2 listing photos) get rewritten — local
// /public assets are already small WebP. In dev builds there is no
// /_vercel/image endpoint, so raw URLs pass through untouched.
//
// The `w` values used here must exist in vercel.json `images.sizes`.
//
// COST NOTE: Vercel bills Image Optimization per unique *source* image
// transformed in the billing window (plan-dependent included quota, overage
// after). Only images actually requested by visitors are transformed. To turn
// the whole thing off, flip ENABLED to false and redeploy — every <img>
// reverts to the raw R2 URL.
const ENABLED = import.meta.env.PROD;

const REMOTE = /^https:\/\//i;

// Listing-card grid: 3-col desktop ≈ 1/3 viewport, full-width-ish on mobile.
export const CARD_WIDTHS = [384, 640, 960];
export const CARD_SIZES = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 92vw';

// Warehouse-detail gallery: large hero, near full container width.
export const DETAIL_WIDTHS = [640, 1080, 1600];
export const DETAIL_SIZES = '(min-width: 768px) 66vw, 100vw';

export const isOptimizable = (url: string | null | undefined): url is string =>
  ENABLED && !!url && REMOTE.test(url);

export const optimizedSrc = (url: string, width: number, quality = 75): string =>
  isOptimizable(url) ? `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}` : url;

export const optimizedSrcSet = (url: string, widths: number[]): string | undefined =>
  isOptimizable(url) ? widths.map((w) => `${optimizedSrc(url, w)} ${w}w`).join(', ') : undefined;
