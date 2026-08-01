/**
 * Pins the static-loader-data manifest to a build-independent URL.
 *
 * vite-react-ssg names its loader-data manifest with a hash that is *random per
 * build* (`Math.random().toString(36)` in its build plugin), and bakes that hash
 * into every prerendered HTML page as `window.__VITE_REACT_SSG_HASH__`. On
 * hydration the client fetches `/static-loader-data-manifest-<hash>.json` and
 * calls `.json()` on it without checking `res.ok`.
 *
 * So any browser holding HTML from an *older* deploy (Vercel edge cache is
 * `s-maxage=86400, stale-while-revalidate=604800` on /listings/*) asks for a
 * manifest this deploy no longer has, gets the HTML 404 page back, and blows up
 * with `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` inside the
 * route loader.
 *
 * Fix: also publish the manifest under a stable name. New builds point at it
 * directly (see src/main.tsx); already-cached HTML from old deploys reaches it
 * via the rewrite in vercel.json. Either way the client gets the *current*
 * manifest, whose entries point at per-route data files that actually exist.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

export const STABLE_MANIFEST_HASH = 'stable';

const DIST = 'dist';
const stableName = `static-loader-data-manifest-${STABLE_MANIFEST_HASH}.json`;

async function main() {
  const entries = await fs.readdir(DIST);
  const hashed = entries.filter(
    (f) => /^static-loader-data-manifest-.+\.json$/.test(f) && f !== stableName,
  );

  if (hashed.length === 0) {
    // Hard failure: shipping without this file would break every client, not
    // just stale ones, because main.tsx points the runtime at the stable URL.
    throw new Error(
      `no static-loader-data-manifest-*.json in ${DIST}/ — did vite-react-ssg build run?`,
    );
  }
  if (hashed.length > 1) {
    throw new Error(`expected one hashed manifest in ${DIST}/, found: ${hashed.join(', ')}`);
  }

  const src = path.join(DIST, hashed[0]);
  const dest = path.join(DIST, stableName);
  await fs.copyFile(src, dest);
  console.log(`[loader-data] copied ${src} → ${dest}`);
}

main().catch((err) => {
  console.error('[loader-data]', err?.message ?? err);
  process.exit(1);
});
