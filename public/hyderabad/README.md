# Hyderabad ad-page map

Rendered on 2026-10-22 with `npm run maps:ad-pages -- hyderabad`, using the
Mapbox `streets-v12` style and the map-rendering credential, as the Bangalore
maps were. The images keep the Mapbox and OpenStreetMap attribution; the page
makes no Mapbox requests and contains no token.

| File | Image pixels | Mapbox viewport | Zoom | Center (longitude, latitude) |
| --- | --- | --- | --- | --- |
| micromarkets-map.webp | 2520 × 1080 | 1260 × 540 @2x | 9 | 78.429, 17.45 |
| micromarkets-map-tablet.webp | 1620 × 1080 | 810 × 540 @2x | 9 | 78.429, 17.45 |
| micromarkets-map-mobile.webp | 720 × 720 | 360 × 360 @2x | 9 | 78.429, 17.45 |

All three views use zoom 9 (the Bangalore belt map's desktop scale; its phone
view is 8.2) and the framing of the 17 Oct review wireframe, which keeps the four
markers clear of the phone map's edges and attribution. Medchal, Kompally / Devaryamjal, Shamshabad and
Patancheru are placed from the approximate coordinates in
`src/data/micromarket-ad-layouts/hyderabad.json`; Kompally and Devaryamjal
share one marker. Regenerate the images whenever a camera changes.
