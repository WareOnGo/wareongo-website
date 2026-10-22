// Keep the acquisition URL allowlist small enough for the inline analytics tag.
import { micromarketAdPaths } from './micromarketAdPaths.generated';
export const MICROMARKET_AD_SLUGS = micromarketAdPaths.filter(path => path.startsWith('/bangalore/')).map(path => path.slice('/bangalore/'.length));
// City pages (AD_CITY_PAGES in scripts/lib/micromarket-ad-content.mjs) are served at /{city}.
export const micromarketAdPath = (slug: string, citySlug = 'bengaluru') => ['hosur', 'hyderabad'].includes(citySlug) ? `/${citySlug}` : `/bangalore/${slug}`;
const paths = new Set<string>(micromarketAdPaths);
export const isMicromarketAdPath = (path: string) => paths.has(path.replace(/\/$/, ''));
