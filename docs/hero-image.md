# Hero image upscaling

The desktop hero uses a 4× upscale of `../hero-fullres.png`, created with the
photo model `realesrgan-x4plus`. The source is 1086 × 1448; the lossless output
is 4344 × 5792. The mobile image is resized directly from the source photo.

## Regenerate the web assets

From the website repository root, using ImageMagick:

```sh
magick output/hero-upscale.local/hero-fullres-4x.png \
  -filter Lanczos -resize 1536x -strip -alpha off \
  -define webp:method=6 -quality 80 src/assets/hero-image.webp
magick output/hero-upscale.local/hero-fullres-4x.png \
  -filter Lanczos -resize 2560x -strip -alpha off \
  -define webp:method=6 -quality 80 src/assets/hero-image-2560.webp
magick output/hero-upscale.local/hero-fullres-4x.png \
  -filter Lanczos -resize 3840x -strip -alpha off \
  -define webp:method=6 -quality 80 src/assets/hero-image-3840.webp
magick ../hero-fullres.png -resize 960x -strip -alpha off \
  -define webp:method=6 -quality 80 src/assets/hero-image-mobile.webp
```

`HeroSection.tsx` uses `srcSet` with `sizes="100vw"` to select the desktop
asset for the screen width and pixel density. The 960-pixel mobile image is
selected below 768 CSS pixels. Vite gives every asset a content hash so image
replacements invalidate the browser cache.

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
