// Keep the acquisition URL allowlist small enough for the inline analytics tag.
import { micromarketAdSlugs } from './micromarketAdPaths.generated';
export const MICROMARKET_AD_SLUGS = micromarketAdSlugs;
export const micromarketAdPath = (slug: string) => `/bangalore/${slug}`;
const paths = new Set<string>(MICROMARKET_AD_SLUGS.map(micromarketAdPath));
export const isMicromarketAdPath = (path: string) => paths.has(path.replace(/\/$/, ''));
