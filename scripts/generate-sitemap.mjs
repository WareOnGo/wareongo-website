import fs from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://wareongo.com';
const API_BASE = 'https://wareongo-website-backend.onrender.com';
const today = new Date().toISOString().slice(0, 10);

const STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/listings', changefreq: 'daily', priority: '0.9' },
  { path: '/about-us', changefreq: 'monthly', priority: '0.6' },
  { path: '/casestudies', changefreq: 'monthly', priority: '0.7' },
  { path: '/request-warehouse', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
];

// Keep in sync with src/data/caseStudies.tsx.
const CASE_STUDY_SLUGS = [
  'hyderabad-automobile-warehouse',
  'devanahalli-fssai-warehouse',
  'hoskote-royal-enfield-warehouse',
  'hyderabad-fire-compliant-warehouse',
  'kochi-3pl-warehouse',
];

async function fetchAllWarehouseIds() {
  const ids = [];
  let page = 1;
  const pageSize = 50;
  while (true) {
    const url = `${API_BASE}/warehouses?page=${page}&pageSize=${pageSize}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);
    const json = await resp.json();
    for (const w of json.data) ids.push(w.id);
    if (page >= json.pagination.totalPages || json.data.length === 0) break;
    page += 1;
  }
  return ids;
}

function urlEntry(loc, changefreq, priority) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  const warehouseIds = await fetchAllWarehouseIds();
  const entries = [
    ...STATIC_PATHS.map((p) => urlEntry(p.path, p.changefreq, p.priority)),
    ...CASE_STUDY_SLUGS.map((slug) => urlEntry(`/casestudies/${slug}`, 'monthly', '0.7')),
    ...warehouseIds.map((id) => urlEntry(`/warehouse/${id}`, 'weekly', '0.8')),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
  const outPath = path.join('dist', 'sitemap.xml');
  await fs.writeFile(outPath, xml, 'utf8');
  console.log(`[sitemap] wrote ${outPath} with ${entries.length} URLs (${warehouseIds.length} warehouses)`);
}

main().catch((err) => {
  console.error('[sitemap] generation failed:', err);
  process.exit(1);
});
