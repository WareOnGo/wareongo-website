import type { AdPageContent } from './adPages';

type Point = readonly [number, number];
export type MapView = 'desktop' | 'tablet' | 'mobile';
export type BangaloreMapScope = 'belts' | 'city';

// Cameras match the complete local streets-v12 images, including attribution.
export const BANGALORE_MAP_VIEWS = {
  belts: {
    desktop: { width: 1260, height: 540, zoom: 9, center: [77.535, 12.99] as Point, src: '/bangalore/micromarkets-map.webp' },
    tablet: { width: 810, height: 540, zoom: 9, center: [77.535, 12.99] as Point, src: '/bangalore/micromarkets-map-tablet.webp' },
    mobile: { width: 360, height: 360, zoom: 8.2, center: [77.55, 13.06] as Point, src: '/bangalore/micromarkets-map-mobile.webp' },
  },
  city: {
    desktop: { width: 1260, height: 540, zoom: 10.5, center: [77.63, 13] as Point, src: '/bangalore/micromarkets-city-map.webp' },
    tablet: { width: 810, height: 540, zoom: 10.5, center: [77.63, 13] as Point, src: '/bangalore/micromarkets-city-map-tablet.webp' },
    mobile: { width: 360, height: 360, zoom: 9.7, center: [77.62, 13] as Point, src: '/bangalore/micromarkets-city-map-mobile.webp' },
  },
} as const;

export interface BangaloreMapArea {
  slug: string;
  canonical: string;
  scope: BangaloreMapScope;
  countSlug?: string;
  chipLabel?: string;
  mobileLabel?: string;
  chipCaption?: string;
  title?: string;
  caption?: string;
  textChip?: boolean;
  wideChip?: boolean;
  imageSlot: keyof AdPageContent['images'];
  label: Record<MapView, Point>;
}

// Desktop/tablet chips cover matching basemap names where practical. Compact
// mobile names follow the square basemap, with property cards in a separate track.
// Grouped areas deliberately omit totals: their inventory tags can overlap.
export const BANGALORE_MAP_AREAS: BangaloreMapArea[] = [
  { slug: 'dobbaspet', canonical: 'Dobbaspet', scope: 'belts', countSlug: 'dobbaspet', imageSlot: 'micromarket-dobbaspet', label: { desktop: [33, 18], tablet: [18, 19], mobile: [18, 32] } },
  { slug: 'doddaballapur', canonical: 'Doddaballapur', scope: 'belts', textChip: true, imageSlot: 'micromarket-doddaballapur', label: { desktop: [48, 8.5], tablet: [50, 8], mobile: [49, 21.5] } },
  { slug: 'devanahalli', canonical: 'Devanahalli', scope: 'belts', countSlug: 'devanahalli', imageSlot: 'micromarket-devanahalli', label: { desktop: [64, 17], tablet: [82, 19], mobile: [71, 31.5] } },
  { slug: 'nelamangala', canonical: 'Nelamangala', scope: 'belts', countSlug: 'nelamangala', imageSlot: 'micromarket-nelamangala', label: { desktop: [41, 36], tablet: [32, 37], mobile: [29, 45] } },
  { slug: 'hoskote', canonical: 'Hoskote', scope: 'belts', countSlug: 'hoskote', imageSlot: 'micromarket-hoskote', label: { desktop: [66, 40], tablet: [80, 40], mobile: [79, 47] } },
  { slug: 'peenya', canonical: 'Peenya', scope: 'belts', countSlug: 'peenya', imageSlot: 'micromarket-peenya', label: { desktop: [43, 53], tablet: [30, 55], mobile: [42, 56] } },
  { slug: 'whitefield', canonical: 'Whitefield', scope: 'belts', countSlug: 'whitefield', imageSlot: 'micromarket-whitefield', label: { desktop: [68, 57], tablet: [80, 58], mobile: [79, 60] } },
  { slug: 'bidadi', canonical: 'Mysore Road / Bidadi', scope: 'belts', countSlug: 'bidadi', chipLabel: 'Mysore Road', mobileLabel: 'Bidadi', chipCaption: 'Bidadi', imageSlot: 'micromarket-bidadi', label: { desktop: [41, 79], tablet: [14, 80], mobile: [29, 77] } },
  { slug: 'sarjapura', canonical: 'Sarjapur', scope: 'belts', countSlug: 'sarjapura', imageSlot: 'micromarket-sarjapur', label: { desktop: [64, 72], tablet: [86, 76], mobile: [80, 74] } },
  { slug: 'hosur-road', canonical: 'Hosur Road / Bommasandra / Jigani', scope: 'belts', chipLabel: 'Bommasandra', chipCaption: 'Jigani · Hosur Rd', title: 'Bommasandra / Jigani', caption: 'Hosur Road', textChip: true, wideChip: true, imageSlot: 'micromarket-bommasandra', label: { desktop: [59, 87], tablet: [50, 87], mobile: [58, 87] } },
  { slug: 'north-bangalore', canonical: 'Jakkur / Hebbal / Yelahanka', scope: 'city', chipLabel: 'Hebbal / Jakkur', mobileLabel: 'Hebbal / Jakkur / Yelahanka', chipCaption: 'Yelahanka', title: 'Hebbal / Jakkur', caption: 'Yelahanka', wideChip: true, imageSlot: 'micromarket-north-bangalore', label: { desktop: [49, 11], tablet: [45, 11], mobile: [43, 22] } },
  { slug: 'indiranagar', canonical: 'Indiranagar', scope: 'city', imageSlot: 'micromarket-indiranagar', label: { desktop: [53, 50], tablet: [56, 47], mobile: [58, 49] } },
  { slug: 'marathalli', canonical: 'Marathahalli', scope: 'city', countSlug: 'marathalli', imageSlot: 'micromarket-marathalli', label: { desktop: [66, 64], tablet: [81, 65], mobile: [78, 67] } },
  { slug: 'jp-nagar', canonical: 'JP Nagar', scope: 'city', imageSlot: 'micromarket-jp-nagar', label: { desktop: [39, 84], tablet: [31, 85], mobile: [31, 82] } },
  { slug: 'hsr', canonical: 'HSR Layout', scope: 'city', countSlug: 'hsr', imageSlot: 'micromarket-hsr', label: { desktop: [57, 85], tablet: [64, 85], mobile: [70, 83] } },
];
