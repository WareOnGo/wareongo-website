// Keep the acquisition URL allowlist small enough for the inline analytics tag.
export const MICROMARKET_AD_SLUGS = ['peenya'] as const;
export const micromarketAdPath = (slug: string) => `/bangalore/${slug}`;
const paths = new Set<string>(MICROMARKET_AD_SLUGS.map(micromarketAdPath));
export const isMicromarketAdPath = (path: string) => paths.has(path.replace(/\/$/, ''));
