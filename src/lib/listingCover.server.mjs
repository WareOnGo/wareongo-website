// Build only: never bundled into the browser or invoked by visitor requests.
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const COVER_CACHE = path.resolve('node_modules/.cache/wareongo-listing-covers-v1');
const MAX_BYTES = 8 * 1024 * 1024;
const VERSION = 'webp-768-q68-v1';

// SSG renders several routes concurrently. Bound download/decoding jobs and
// share a cover when city/state/type routes start with the same photo.
export function createListingCoverPreparer({ cacheDir = COVER_CACHE, fetchImage = fetch } = {}) {
  const pending = new Map();
  const waiting = [];
  let active = 0;
  const limited = async work => {
    if (active >= 2) await new Promise(resolve => waiting.push(resolve));
    else active++;
    try { return await work(); }
    finally {
      const next = waiting.shift();
      if (next) next();
      else active--;
    }
  };

  return function prepare(source) {
    if (!source) return Promise.resolve(undefined);
    let url;
    try { url = new URL(source); } catch { return Promise.resolve(undefined); }
    // These are public warehouse photos, not an arbitrary URL fetch service.
    if (url.protocol !== 'https:' || !/^pub-[a-f0-9]+\.r2\.dev$/.test(url.hostname)
      || url.port || url.username || url.password || !/\.(?:webp|jpe?g|png)$/i.test(url.pathname)) return Promise.resolve(undefined);
    if (pending.has(source)) return pending.get(source);
    const job = limited(async () => {
      const name = `${createHash('sha256').update(`${VERSION}:${source}`).digest('hex').slice(0, 24)}.webp`;
      const file = path.join(cacheDir, name);
      const result = { source, src: `/listing-covers/${name}` };
      try {
        if ((await fs.stat(file).catch(() => null))?.size > 0) return result;
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
        const cover = await sharp(original, { limitInputPixels: 16_000_000, sequentialRead: true })
          .timeout({ seconds: 8 }).rotate().resize({ width: 768, withoutEnlargement: true })
          .webp({ quality: 68 }).toBuffer();
        if (cover.length >= original.length) return undefined;
        await fs.mkdir(cacheDir, { recursive: true });
        const temporary = `${file}.${process.pid}.tmp`;
        await fs.writeFile(temporary, cover);
        await fs.rename(temporary, file);
        return result;
      } catch (error) {
        // Missing/unconvertible photos keep the existing WebP/original path.
        // An optional image optimization must not turn a valid page into a 404.
        console.warn('[listing-cover] using remote photo:', url.pathname, error.message);
        return undefined;
      }
    });
    pending.set(source, job);
    return job;
  };
}

export const prepareListingCover = createListingCoverPreparer();
