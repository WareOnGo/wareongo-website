# Bangalore landing page photos

Curated from WareOnGo’s public warehouse listings and galleries on 2026-09-25. Each location photo belongs to a listing returned by that micromarket’s API filter. Prepared as 800 × 450 WebP images. Gallery numbers below are one-based after filtering out videos and empty URLs.

| File | Warehouse ID | Gallery photo | Original image |
| --- | --- | --- | --- |
| whitefield.webp | 2743 | 1 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/9e8c16194f4e87d1b0883597b7b41734257ad28e288e58e99747eab65a4effd3/sharp-w1280-q75-v1.webp |
| hoskote.webp | 967 | 1 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1769685006753.webp |
| nelamangala.webp | 591 | 3 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1763000597956.webp |
| devanahalli.webp | 2533 | 21 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/06e5eece83bda23520003a3dbb8a309a.webp |
| bommasandra.webp | 410 | 26 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/33ece4ce61aa939ed06421c486c30ac9.webp |
| jigani.webp | 1226 | 1 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/500b93fc8938832c08964dadf5f3ed55.webp |
| featured-devanahalli.webp | 408 | 11 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1759230375901.webp |
| peenya.webp | 332 | 1 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1757326397290.webp |
| dobbaspet.webp | 1121 | 8 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/1d85b87b949c2908456e9e8480ec24db.webp |

The hero’s three featured listings use public detail data from IDs **967**, **408** and **1226** (Hoskote, Devanahalli and Jigani). Their size, rent, warehouse type and clear height were checked against `GET /warehouses/:id`. The cards are curated snapshots, following the homepage featured-listing pattern; update their figures in `src/components/city/BangaloreFeaturedListings.tsx` when re-curating them. Hoskote and Jigani reuse the matching location photo.

## Featured micromarket selection

Expanded to eight on 2026-09-26, ranking by warehouse listing count among the original six localities and the requested additions: Peenya, Dobbaspet, Doddaballapura, Narsapura, Attibele, Harohalli and Bidadi. This is a curated shortlist, not a ranking of every Bangalore locality. Counts and display order update from the same city statistics used elsewhere on the page.

The `GET /locations` Bangalore overview reported: Nelamangala **108**, Whitefield **74**, Peenya **66**, Hoskote **65**, Devanahalli **54**, Dobbaspet **34**, Jigani **26**, and Bommasandra **17**. Below the cutoff were Attibele **12**, Harohalli **11**, Narsapura **10**, and Bidadi **6**. Doddaballapura has no separate micromarket tag in this feed; the Bangalore catalogue contained **12** address matches, also below the cutoff. Revisit the curated selection when inventory changes.

Peenya and Dobbaspet photos were added after reviewing 12 candidate photographs. Peenya's cover comes from a listing explicitly addressed in Peenya and uses a bottom-aligned crop to retain the warehouse floor; Dobbaspet's cover belongs to Sompura KIADB Estate, Dobbaspet.

## Micromarket map

The map beside the eight micromarket cards uses local static Mapbox `light-v11` basemaps rendered on 2026-09-26. Mapbox and OpenStreetMap attribution is retained in each image. The dashboard token was used only during asset generation; the page makes no Mapbox requests and contains no token.

| File | Image pixels | Mapbox viewport | Zoom | Center (longitude, latitude) |
| --- | --- | --- | --- | --- |
| micromarkets-map.webp | 1200 × 1200 | 600 × 600 @2x | 9 | 77.535, 12.99 |
| micromarkets-map-mobile.webp | 720 × 920 | 360 × 460 @2x | 8.2 | 77.535, 12.99 |

`src/data/bangaloreMicromarketMap.ts` stores the matching camera settings, approximate listing-group centers, and separate label positions for desktop and mobile. Centers are medians of geocoded listings whose public addresses match each micromarket, rather than exact individual warehouse pins. Labels are positioned in advance to prevent overlap, with connector lines to their geographic centers. Keep the complete image and its aspect ratio when changing the layout so the overlays remain aligned.

`BangaloreMicromarkets.tsx` supplies the same counts to cards and map labels, links their hover/focus highlights, and opens the existing contact modal from either control. Listings can carry multiple micromarket tags, so these counts are not added together as a total. The earlier `listings-map*.webp` assets are the original cluster-map snapshots; the micromarket section now uses the two basemaps above.

## Available warehouse cards

Selected on 2026-09-26 after reviewing 66 warehouse photographs from the public Bangalore inventory. There are six unique listings per size band: under 5,000 sq ft; 5,000–19,999 sq ft; and 20,000 sq ft and up. The All sizes filter shows two listings from each band. Photographs are genuine listing gallery photos, cropped to 800 × 450 WebP.

The figures are curated snapshots from `GET /warehouses?city=Bangalore&locationMatch=exact&pageSize=1000`. Refresh both the facts in `src/data/bangaloreAvailableWarehouses.ts` and the corresponding cover when re-curating. The footer's inventory total comes from the page's live city statistics. Listings whose location tags conflict with their address use the locality stated in their public address. Only explicitly numeric dock counts are shown.

| File | Warehouse ID | Size band | Sq ft | Source image |
| --- | --- | --- | --- | --- |
| available-1398.webp | 1398 | small | 2,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1776331426848.webp |
| available-612.webp | 612 | small | 4,450 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1763251050083.webp |
| available-2429.webp | 2429 | small | 4,600 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_3a3323e41b3287611285fa79ee7955ce.webp |
| available-1196.webp | 1196 | small | 3,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/37520f1855b025c3a91b78aaafe03b73.webp |
| available-1697.webp | 1697 | small | 4,300 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_20dc049e278b01b75f4488463868247a.webp |
| available-1222.webp | 1222 | small | 2,500 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1773659471790.webp |
| available-2744.webp | 2744 | medium | 10,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/3ff66644e01ac47d5f797c5ee696e7aab677c6a25fa63e8a14bccf19ada27aaf/sharp-w1280-q75-v1.webp |
| available-2142.webp | 2142 | medium | 12,800 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_3a68482740380013f6f0b3a604e23521.webp |
| available-1294.webp | 1294 | medium | 9,300 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1775117527561.webp |
| available-832.webp | 832 | medium | 10,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1766550503042.webp |
| available-2686.webp | 2686 | medium | 10,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/1960bdc031e77c3a8daa84dd4e26d838.webp |
| available-2255.webp | 2255 | medium | 17,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/f601ec158a4169b486a95d8af9a4c9a3.webp |
| available-2369.webp | 2369 | large | 1,20,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/6986d1720554225334c15c1810219b2f.webp |
| available-1121.webp | 1121 | large | 1,90,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/1d85b87b949c2908456e9e8480ec24db.webp |
| available-408.webp | 408 | large | 1,00,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1759230371973.webp |
| available-1037.webp | 1037 | large | 80,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/media_1770635881292.webp |
| available-2324.webp | 2324 | large | 50,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/scout_11f0dc8b37e8ac49ba97066756f14f67.webp |
| available-1884.webp | 1884 | large | 55,000 | https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/55e2d43430532efad873d91f8ec3acfe.webp |
