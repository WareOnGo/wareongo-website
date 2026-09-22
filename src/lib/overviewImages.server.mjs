// Build-time variants only. Original CMS/gallery URLs remain the source of truth.
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { prepareListingCover } from './listingCover.server.mjs';

export const OVERVIEW_IMAGE_CACHE = path.resolve('node_modules/.cache/wareongo-overview-images-v1');
const MAX_BYTES = 8 * 1024 * 1024;
const WIDTHS = [384, 768, 1280];

export function createEditorialImagePreparer({ cacheDir = OVERVIEW_IMAGE_CACHE, fetchImage = fetch } = {}) {
  const pending = new Map();
  const waiting = [];
  let active = 0;
  return function prepare(source) {
    let url;
    try { url = new URL(source); } catch { return Promise.resolve(undefined); }
    if (url.protocol !== 'https:' || !/^pub-[a-f0-9]+\.r2\.dev$/.test(url.hostname)
      || url.port || url.username || url.password || !/\.(?:webp|jpe?g|png)$/i.test(url.pathname)) return Promise.resolve(undefined);
    if (pending.has(source)) return pending.get(source);
    const job = (async () => {
      if (active >= 2) await new Promise(resolve => waiting.push(resolve));
      else active++;
      const key = createHash('sha256').update(`webp-384-768-1280-q72-v1:${source}`).digest('hex').slice(0, 24);
      const metadata = path.join(cacheDir, `${key}.json`);
      try {
        const cached = JSON.parse(await fs.readFile(metadata, 'utf8').catch(() => 'null'));
        if (cached?.length && (await Promise.all(cached.map(v => fs.stat(path.join(cacheDir, path.basename(v.src))).catch(() => null)))).every(file => file?.size > 0)) return cached;
        const response = await fetchImage(source, { signal: AbortSignal.timeout(12_000), redirect: 'error' });
        if (!response.ok || !response.body) throw new Error(`image HTTP ${response.status}`);
        if (Number(response.headers.get('content-length')) > MAX_BYTES) {
          await response.body.cancel();
          throw new Error('image exceeds download limit');
        }
        const parts = [];
        let bytes = 0;
        for await (const part of response.body) {
          bytes += part.byteLength;
          if (bytes > MAX_BYTES) throw new Error('image exceeds download limit');
          parts.push(part);
        }
        const original = Buffer.concat(parts);
        const variants = [];
        await fs.mkdir(cacheDir, { recursive: true });
        for (const width of WIDTHS) {
          const { data, info } = await sharp(original, { limitInputPixels: 16_000_000, sequentialRead: true })
            .timeout({ seconds: 8 }).rotate().resize({ width, withoutEnlargement: true })
            .webp({ quality: 72 }).toBuffer({ resolveWithObject: true });
          if (data.length >= original.length || variants.some(v => v.width === info.width)) continue;
          const name = `${key}-${info.width}.webp`;
          const file = path.join(cacheDir, name);
          await fs.writeFile(`${file}.${process.pid}.tmp`, data);
          await fs.rename(`${file}.${process.pid}.tmp`, file);
          variants.push({ src: `/overview-images/${name}`, width: info.width });
        }
        if (!variants.length) return undefined;
        await fs.writeFile(`${metadata}.${process.pid}.tmp`, JSON.stringify(variants));
        await fs.rename(`${metadata}.${process.pid}.tmp`, metadata);
        return variants;
      } catch (error) {
        console.warn('[overview-image] using original:', url.pathname, error.message);
        return undefined;
      } finally {
        const next = waiting.shift();
        if (next) next();
        else active--;
      }
    })();
    pending.set(source, job);
    return job;
  };
}

const prepareEditorialImage = createEditorialImagePreparer();

export async function prepareOverviewImages(content, warehouses) {
  const editorial = [content.heroImage, content.marketImage].filter(Boolean);
  const imageVariants = Object.fromEntries((await Promise.all(editorial.map(async image => {
    const variants = await prepareEditorialImage(image.url);
    return variants ? [image.url, variants] : null;
  }))).filter(Boolean));
  const sources = [...new Set(warehouses.map(w => w.images[0]).filter(Boolean))];
  const coverImages = Object.fromEntries((await Promise.all(sources.map(async source => {
    const cover = await prepareListingCover(source);
    return cover ? [source, cover.src] : null;
  }))).filter(Boolean));
  return { imageVariants, coverImages };
}
