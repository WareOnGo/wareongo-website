type Point = readonly [number, number];
export type MapView = 'desktop' | 'mobile';

// Match the cameras used to render the local Mapbox basemaps. Coordinates are
// approximate medians of listings whose addresses match each micromarket.
export const BANGALORE_MAP_VIEWS = {
  desktop: { width: 600, height: 600, zoom: 9, center: [77.535, 12.99] as Point },
  mobile: { width: 360, height: 460, zoom: 8.2, center: [77.535, 12.99] as Point },
} as const;

export const BANGALORE_MAP_AREAS: Record<string, { coordinates: Point; label: Record<MapView, Point> }> = {
  dobbaspet: { coordinates: [77.25, 13.2], label: { desktop: [15, 17], mobile: [22, 20] } },
  nelamangala: { coordinates: [77.36, 13.14], label: { desktop: [26, 37], mobile: [28, 37] } },
  peenya: { coordinates: [77.51, 13.02], label: { desktop: [39, 52], mobile: [23, 54] } },
  devanahalli: { coordinates: [77.74, 13.19], label: { desktop: [73, 17], mobile: [74, 19] } },
  hoskote: { coordinates: [77.82, 13.115], label: { desktop: [86, 38], mobile: [77, 42] } },
  whitefield: { coordinates: [77.74, 12.98], label: { desktop: [83, 57], mobile: [77, 60] } },
  jigani: { coordinates: [77.65, 12.78], label: { desktop: [54, 85], mobile: [27, 83] } },
  bommasandra: { coordinates: [77.68, 12.81], label: { desktop: [81, 75], mobile: [76, 80] } },
};

function mercator([longitude, latitude]: Point): Point {
  return [(longitude + 180) / 360, (1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2];
}

/** Percentage coordinates preserve alignment as the static image scales. */
export function micromarketMapPoint(slug: string, view: MapView): Point {
  const camera = BANGALORE_MAP_VIEWS[view];
  const [x, y] = mercator(BANGALORE_MAP_AREAS[slug].coordinates);
  const [cx, cy] = mercator(camera.center);
  const scale = 512 * 2 ** camera.zoom;
  return [50 + (x - cx) * scale / camera.width * 100, 50 + (y - cy) * scale / camera.height * 100];
}
