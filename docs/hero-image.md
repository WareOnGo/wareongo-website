# Hero image upscaling

The desktop hero uses a 4× upscale of `../hero-fullres.png`, created with the
photo model `realesrgan-x4plus`. The source is 1086 × 1448; the lossless output
is 4344 × 5792. The mobile image is resized directly from the source photo.

## Loading behavior

The hero uses AVIF with progressive JPEG fallbacks. The mobile photo stays
960 × 1280; desktop candidates stay 1536, 2560 and 3840 pixels wide, with the
same portrait proportions and CSS crop as before. The AVIF files are about
40–48% smaller than the previous WebPs at those dimensions.

A 144-pixel WebP preview (1,912 bytes) is embedded by Vite into the stylesheet.
The SSG build also embeds the page's critical styles into its HTML, including
the hero preview, so the first render need not wait for the shared stylesheet.
It uses the same positioning as the final image and is visible on the first
styled paint, with no extra image request. The full image remains an ordinary
eager, high-priority `<picture>` in the generated HTML. There is no JavaScript
load gate, opacity animation, or delay before displaying a downloaded image.
The preview remains underneath if the full image fails. Progressive JPEG
fallbacks fill the whole frame in successive scans on browsers without AVIF.

## Regenerate the web assets

From the website repository root, with ImageMagick and an FFmpeg build that
includes the `libaom-av1` encoder:

```sh
node scripts/generate-hero-images.mjs \
  ../hero-fullres.png output/hero-upscale.local/hero-fullres-4x.png
```

`HeroSection.tsx` uses `srcSet` with `sizes="100vw"` to select the desktop
asset for the screen width and pixel density. The 960-pixel mobile image is
selected below 768 CSS pixels. Vite gives every asset a content hash so image
replacements invalidate the browser cache.

## Verify loading

Against a generated SSG build (not a development server or SPA-only build):

```sh
node ../wareongo-evals/tests/support/check-hero-loading.mjs /path/to/build [/path/to/baseline-build]
```

The browser audit checks responsive source selection, a single photo request,
local font reuse, hydration, request/contact controls, the homepage main landmark,
and the preview while the photo is streaming or fails with JavaScript disabled.
It also delays the shared CSS to compare the initial and final hero geometry.

The September 21 image-only comparison reduced hero transfers from 161,196 to
84,373 bytes on mobile and 667,034 to 385,660 bytes at 1920 CSS pixels. Median
image download durations fell from about 2.39 to 1.55 seconds and 5.14 to
3.75 seconds, respectively; CLS was zero in both builds. Local text paint
metrics in that earlier image-only run stayed around 0.7–0.8 seconds. Those
controlled runs blocked external services and predate local fonts and critical
CSS; they are not the final Lighthouse scores or field Core Web Vitals.

See [the release evaluation](hero-loading-review-2026-09-21.md) for production
build, browser regression and Lighthouse results.

## Installed CLI

The portable executable and photo model are installed locally in
`.tools/realesrgan.local/`. The full PNG and inspection images are in
`output/hero-upscale.local/`. Both directories match the existing `*.local`
Git ignore rule.

### Run the installed CLI again

From the website repository root:

```sh
mkdir -p output/hero-upscale.local
.tools/realesrgan.local/realesrgan-ncnn-vulkan \
  -i ../hero-fullres.png \
  -o output/hero-upscale.local/hero-fullres-4x.png \
  -m .tools/realesrgan.local/models \
  -n realesrgan-x4plus -s 4 -t 256 -j 1:1:1 -f png
```

The CLI automatically selects a Vulkan GPU. The 256-pixel tiles limit memory
use. The model already sharpens edges, so no extra sharpening is applied.

## Download details

- Archive: [realesrgan-ncnn-vulkan-20220424-ubuntu.zip](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-ubuntu.zip)
- Downloaded archive SHA-256: `e5aa6eb131234b87c0c51f82b89390f5e3e642b7b70f2b9bbe95b6a285a40c96`
- Source image SHA-256: `5e404b6195dc1bf2fb36fcf9ae20ad237ecdfa14b65cba692794580cc9439ef8`

To restore the local CLI on another Linux x86-64 checkout:

```sh
curl -fL https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-ubuntu.zip \
  -o /tmp/wareongo-realesrgan.zip
mkdir -p .tools/realesrgan.local
unzip /tmp/wareongo-realesrgan.zip \
  realesrgan-ncnn-vulkan README_ubuntu.md \
  models/realesrgan-x4plus.bin models/realesrgan-x4plus.param \
  -d .tools/realesrgan.local
chmod u+x .tools/realesrgan.local/realesrgan-ncnn-vulkan
```
