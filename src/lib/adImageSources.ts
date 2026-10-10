import { adImageVariants } from '@/data/adImageVariants.generated';

// These sizes follow BangaloreLanding.css, including the mobile carousel.
export const FEATURED_IMAGE_SIZES = '(max-width: 767px) min(280px, calc((100vw - 40px) * .85)), (max-width: 1023px) calc((100vw - 88px) / 3), (max-width: 1100px) calc((100vw - 96px) * .56522 / 3 - 8px), calc((min(100vw - 64px, 1400px) - 48px) * .56522 / 3 - 8px)';
export const AVAILABLE_IMAGE_SIZES = '(max-width: 1023px) calc((100vw - 88px) / 2), calc((min(100vw - 64px, 1400px) - 48px) / 3)';
export const MARKET_IMAGE_SIZES = '(max-width: 767px) min(232px, calc((100vw - 40px) * .78)), 280px';
export const SERVICE_IMAGE_SIZES = '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), calc((min(100vw - 64px, 1400px) - 24px) / 2.25)';

/** Unknown/CMS-uploaded URLs retain their original source instead of a stale variant. */
export function adImageSources(src: string | undefined, sizes: string) {
  const srcSet = src?.startsWith('/') && !src.startsWith('//') ? adImageVariants[src.split('?')[0]] : undefined;
  return { src, srcSet, sizes: srcSet ? sizes : undefined };
}
