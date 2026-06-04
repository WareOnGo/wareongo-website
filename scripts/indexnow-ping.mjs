// IndexNow ping — notifies Bing (and other participating engines: Yandex,
// Naver, Seznam) about our URLs right after a production deploy, so new and
// changed pages get crawled in hours instead of weeks. ChatGPT search
// retrieves from Bing's index, so this is GEO-critical plumbing.
//
// Free, no account: the key below is self-generated and proven by hosting
// public/<key>.txt (ships with every deploy). https://www.indexnow.org/
//
// Runs as the last step of `npm run build`. Skips outside production deploys
// (set INDEXNOW_FORCE=1 to override for a manual ping). Never fails the build.

import fs from 'node:fs/promises';

const HOST = 'wareongo.com';
const KEY = '607d2bf6ce0d68e8237e5c0e5c2b97d3'; // matches public/<key>.txt
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000; // protocol cap per request

if (process.env.VERCEL_ENV !== 'production' && !process.env.INDEXNOW_FORCE) {
  console.log('[indexnow] skipped — not a production deploy (set INDEXNOW_FORCE=1 to ping manually)');
  process.exit(0);
}

try {
  const xml = await fs.readFile('dist/sitemap.xml', 'utf8');
  // Plain <loc> only — the image-sitemap extension uses <image:loc>, which this
  // pattern deliberately does not match.
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => u.startsWith(`https://${HOST}`))
    .slice(0, MAX_URLS);

  if (urls.length === 0) {
    console.log('[indexnow] no URLs found in dist/sitemap.xml — nothing to submit');
    process.exit(0);
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  // 200 = processed, 202 = accepted (key not yet verified) — both are success.
  console.log(`[indexnow] submitted ${urls.length} URLs — HTTP ${res.status} ${res.statusText}`);
} catch (err) {
  // Indexing pings must never break a deploy.
  console.warn('[indexnow] ping failed (non-fatal):', err.message ?? err);
}
