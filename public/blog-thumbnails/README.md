# Blog warehouse photos

The blog warehouse photo selection was refreshed on 4 November 2026 from the database-backed public warehouse galleries. Every selected image was currently public, graded T1 in its aligned `imageQuality` entry, and marked cover-suitable. The stored 1280px WebPs replace the old 320px thumbnails, with their actual decoded dimensions recorded for stable layout.

The selection is in `src/data/blogThumbnailFallbacks.json`. `src/data/blogImageReplacements.json` replaces the two legacy RCC/PEB article photos by exact source URL. The blog generator and CMS preview apply the same replacements, preserving article order and captions. The article charts and credited Dabaspet project illustration remain editorial content. The old local thumbnail files are retained but are no longer selected.

| Warehouse | Image record | City | Type | Stored size | Source |
| --- | --- | --- | --- | --- | --- |
| 3238 | 68401791 | Guwahati | PEB | 1280 × 960 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/823c5558ae5e6c5635420e1ca86900b49940e7e88aa1133df0a8a56f8a0817e1/sharp-w1280-q75-v1.webp) |
| 3248 | 70382862 | Bangalore | PEB | 1280 × 720 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/8adc5ddd2fc7958a9a3e1250e73c4a89801b62bf6081342e5c694807d23df76c/sharp-w1280-q75-v1.webp) |
| 3174 | 56905604 | Nashik | PEB | 1280 × 720 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/a1870a8a94309e5c3b8703e29b608a2f2697b38358430ff1696e1d1225adf1c9/sharp-w1280-q75-v1.webp) |
| 3231 | 64709436 | Sonipat | PEB | 1280 × 960 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/141744fd9e45723033f531d8ddf33cdd95a951b4a9bd69cb40b7a4a508967ef0/sharp-w1280-q75-v1.webp) |
| 3177 | 57064539 | Patna | PEB | 1280 × 720 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/4407adbc50808645ba134653324a722f6b758132ab5fd3393c9242ddd246c763/sharp-w1280-q75-v1.webp) |
| 3198 | 57363999 | Rajpura | PEB | 1280 × 960 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/7e53d971d3deb16fb3d780ba5f52c2ea33cb4a5524ea12d36580a3a49805f321/sharp-w1280-q75-v1.webp) |
| 2883 | 18109163 | Bangalore | RCC | 1280 × 720 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/c518a8fe10bf96c64d7e9ade976aa344fcdfa50ad88e0ee3f15f4da14d1b467a/sharp-w1280-q75-v1.webp) |
| 3247 | 70286333 | Bangalore | PEB | 1280 × 720 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/65bb3533a01d8939e5c5ce3531b2a86a5852d4f061a9093e5f58255f20ec3d10/sharp-w1280-q75-v1.webp) |
| 2156 | 10927 | Kochi | PEB | 1280 × 725 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/6809a40cf057d06e749accc6a1449903.webp) |
| 3168 | 56627299 | Bhubaneswar | RCC | 1280 × 720 | [WebP](https://pub-94c0eb3cd2df4e71a1b6f5b73273bc71.r2.dev/webp/images/913ddd819174e0b61f139d427e0abe9d2d629138197b09697da13fcdc159d208/sharp-w1280-q75-v1.webp) |

The public API applies current visibility, membership, approval, overrides and resolution ceilings before exposing these images. For another refresh, verify each image ID against its warehouse's current `images`/`imageQuality` pair, prefer the stored `webpUrl`, and measure that file rather than copying the original source dimensions. After editing the selection, run `node scripts/generate-blogs.mjs` and `npm run test:blogs`.

The November 2026 format audit downloaded and decoded all 28 distinct article,
card and fallback image URLs: every file was already WebP with an `image/webp`
response from R2. Blog social previews also use those images, including the
matching card photo for an article without an opening image. The local LinkedIn
share asset is a lossless WebP conversion of the official PNG (2,420 bytes instead
of 8,375), preserving its dimensions, colors and transparency.
