import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const { outputFiles } = await build({
  stdin: { contents: `export * from './src/loaders/micromarketLandingLoader';
    export * from './src/data/micromarketAdPages';
    export { warehouseAPI } from './src/services/warehouseAPI';`,
  resolveDir: fileURLToPath(new URL('../', import.meta.url)), loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs',
  define: { 'import.meta.env': '{"SSR":false}', __DEV_SERVER__: 'false' },
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(createRequire(import.meta.url), compiled, compiled.exports);
const { marketRentRange, marketListings, featuredMarketListings, readMarketInventory, AD_MIN_SIZE,
  micromarketLandingLoader, warehouseAPI, getMicromarketAdPage, micromarketAdContent, marketText, selectAdInventory, loadMicromarketAdInventory } = compiled.exports;

const warehouse = (id, size, rate, type = 'Shed') => ({ id, totalSpaceSqft: [size], ratePerSqft: rate,
  warehouseType: type, city: 'Bangalore', state: 'Karnataka', address: 'Peenya', micromarket: ['Peenya'],
  photos: [`https://images.example.test/warehouse-${id}.webp`], clearHeightFt: '20', fireNocAvailable: false });

test('rent uses every measured asking rate, excludes BTS, respects the floor and requires ten rates', () => {
  const stock = Array.from({ length: 10 }, (_, index) => warehouse(index, 6000, index === 9 ? '70' : '15'));
  stock.push(warehouse(11, 30000, '400', 'BTS'), warehouse(12, 7000, 'Not disclosed'));
  assert.deepEqual(marketRentRange(stock, 25), { min: 25, max: 80, label: '₹25 to ₹80' });
  assert.equal(marketRentRange(stock.slice(1), 25), null);
  assert.equal(marketRentRange(Array.from({ length: 10 }, (_, id) => warehouse(id, 6000, '180'))).max, 207);
});

test('featured spaces use local photos, prefer sheds and cover the size bands above the size and rent floors', () => {
  const stock = [warehouse(1, 4999, '25'), warehouse(2, 5000, '30', 'PEB'), warehouse(3, 20000, '28', 'RCC'),
    warehouse(4, 8000, '20'), warehouse(5, 7000, '27'), warehouse(6, 40000, '26', 'BTS')];
  const listings = marketListings(stock, 'Peenya');
  assert.equal(listings.length, 5);
  const shown = listings.filter(item => item.size >= AD_MIN_SIZE);
  const featured = featuredMarketListings(shown, 25);
  assert.deepEqual(featured.map(item => item.id), [5, 3, 2]);
  assert.ok(featured.every(item => item.locality === 'Peenya' && item.image.includes(`warehouse-${item.id}`)));
  assert.deepEqual(featuredMarketListings(shown.filter(item => item.size < 20000), 25).map(item => item.id), [5, 2]);
});

test('inventory reads all pages with exact city/tag filters and refuses an incomplete snapshot', async () => {
  const original = warehouseAPI.getWarehouses;
  const calls = [];
  try {
    warehouseAPI.getWarehouses = async (...args) => {
      calls.push(args);
      return { data: [warehouse(args[0], 6000, '25')], pagination: { totalItems: 2, totalPages: 2 } };
    };
    assert.equal((await readMarketInventory('Bengaluru', 'Peenya')).length, 2);
    assert.deepEqual(calls.map(args => args[0]), [1, 2]);
    assert.deepEqual(calls[0][2], { city: 'Bengaluru', micromarket: 'peenya', locationMatch: 'exact' });
    assert.equal(calls[0][4], 'live');
    warehouseAPI.getWarehouses = async () => ({ data: [], pagination: { totalItems: 1, totalPages: 1 } });
    await assert.rejects(readMarketInventory('Bengaluru', 'Peenya'), /Incomplete inventory/);
  } finally { warehouseAPI.getWarehouses = original; }
});

test('combined southern stock is a deduplicated union with neighboring areas excluded', () => {
  const page = getMicromarketAdPage('electronic-city-jigani-bommasandra');
  const stock = [
    { ...warehouse(1, 2000, '25'), micromarket: ['Hosur Road'] },
    { ...warehouse(2, 8000, '30'), micromarket: ['Hosur Road', 'Jigani'] },
    { ...warehouse(3, 25000, '40'), micromarket: ['Bommasandra'] },
    { ...warehouse(4, 8000, '30'), micromarket: ['Hosur Road', 'Attibele'] },
    { ...warehouse(5, 8000, '30'), micromarket: ['Hosur Road', 'Bannerghatta Road'] },
    warehouse(6, 2000, '30'),
  ];
  assert.deepEqual(selectAdInventory([...stock, stock[1]], page.inventory).map(item => item.id), [1, 2, 3]);
  const stretch = page.rentGuide.markets.find(row => row.slug === 'electronic-city-stretch');
  assert.deepEqual(selectAdInventory(stock.filter(item => item.micromarket.includes('Hosur Road')), stretch.inventory).map(item => item.id), [1]);
});

test('Hoskote and Nelamangala exclude neighboring tags while rent subareas stay inside their parent', () => {
  for (const [slug, parent, excluded, subarea] of [['hoskote', 'Hoskote', 'Narsapura', 'Soukya Road'], ['nelamangala', 'Nelamangala', 'Dobbaspet', 'Budihal']]) {
    const page = getMicromarketAdPage(slug);
    const stock = [
      { ...warehouse(1, 8000, '25'), micromarket: [parent] },
      { ...warehouse(2, 8000, '25'), micromarket: [parent, excluded] },
      { ...warehouse(3, 8000, '25'), micromarket: [parent, subarea] },
    ];
    assert.deepEqual(selectAdInventory(stock, page.inventory).map(item => item.id), [1, 3]);
    const row = page.rentGuide.markets.find(row => row.name === subarea);
    assert.equal(row.inventory.market, parent);
    assert.deepEqual(selectAdInventory(stock, row.inventory).map(item => item.id), [3]);
  }
});

test('Hosur uses city-wide inventory, a standalone route, Tamil Nadu cards and local shared copy', async () => {
  const page = getMicromarketAdPage('hosur', 'hosur');
  assert.equal(getMicromarketAdPage('hosur'), undefined);
  assert.equal(page.path, '/hosur');
  assert.equal(page.state, 'Tamil Nadu');
  assert.deepEqual(page.inventory, { city: 'Hosur' });
  assert.equal(page.rentGuide.markets[1].inventory.city, 'Bengaluru');
  assert.match(page.map.credit, /OpenFreeMap.*OpenStreetMap/);
  const cards = marketListings([{ ...warehouse(1, 4200, '25'), city: 'Hosur', state: 'Tamil Nadu', micromarket: [] }], page.name, { minimumRent: 18 }, page);
  assert.equal(cards[0].region, 'Tamil Nadu');
  assert.equal(cards[0].city, 'Hosur');
  const base = JSON.parse(readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url)));
  const content = micromarketAdContent(base, page, { listingCount: 38, rentRange: '₹18 to ₹32', rentRows: [] });
  assert.equal(content.slug, 'hosur');
  assert.doesNotMatch(JSON.stringify(content.services), /Bangalore/);
  assert.doesNotMatch(JSON.stringify(content.audiences.find(item => item.id === 'owners')), /Bangalore/);
  assert.match(content.copy.enquiryDescription, /Hosur/);
  assert.doesNotMatch(page.callbackNote, /Bangalore/);
});

test('every grid and featured card obeys the computed headline rent floor and the size floor', async () => {
  const previous = warehouseAPI.getWarehouses;
  const previousFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ data: [] });
    const stock = Array.from({ length: 12 }, (_, index) => ({ ...warehouse(index + 1, index < 4 ? 3000 : index < 8 ? 8000 : 30000, index === 0 ? '20' : '30'), micromarket: ['Hosur Road'] }));
    warehouseAPI.getWarehouses = async (_page, _size, filters) => ({ data: !filters.micromarket || filters.micromarket === 'hosur-road' ? stock : [], pagination: { totalItems: !filters.micromarket || filters.micromarket === 'hosur-road' ? stock.length : 0, totalPages: 1 } });
    const data = await loadMicromarketAdInventory(getMicromarketAdPage('electronic-city-jigani-bommasandra'), undefined, true);
    assert.equal(data.listingCount, 12);
    assert.equal(data.rentRange, '₹22 to ₹34');
    // Counts keep every listing; cards drop the ₹20 listing and everything under 5,000 sq ft.
    assert.equal(data.listings.length, 8);
    assert.ok(data.listings.every(item => item.price >= 22 && item.size >= AD_MIN_SIZE));
    assert.ok(data.featured.every(item => item.price >= 22));
    assert.equal(data.featured.length, 3);
  } finally { warehouseAPI.getWarehouses = previous; globalThis.fetch = previousFetch; }
});

test('only registered micromarkets resolve as ad pages', async () => {
  assert.equal(getMicromarketAdPage('peenya').name, 'Peenya');
  assert.equal(getMicromarketAdPage('not-a-market'), undefined);
  await assert.rejects(micromarketLandingLoader({ params: { micromarket: 'not-a-market' }, request: new Request('https://wareongo.com/bangalore/not-a-market') }), error => error.status === 404);
});

test('hero, rent table and FAQ share one inventory snapshot while city content stays intact', () => {
  const base = JSON.parse(readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url)));
  const before = structuredClone(base);
  const page = getMicromarketAdPage('peenya');
  const data = { listingCount: 62, rentRange: '₹25 to ₹80', rentRows: [{ area: 'Peenya', rent: '₹25 to ₹80' }] };
  const content = micromarketAdContent(base, page, data);
  assert.match(marketText(page.heroSummary, data), /62 warehouses in Peenya · ₹25 to ₹80/);
  assert.equal(content.rentGuide.rows[0].rent, data.rentRange);
  assert.match(content.faqs[1].a, /₹25 to ₹80/);
  assert.match(content.copy.availableFooter, /all 62 Peenya listings/);
  assert.deepEqual(content.services, base.services);
  assert.deepEqual(content.benefits, base.benefits);
  assert.equal(content.copy.requestDetails, base.copy.requestDetails);
  assert.doesNotMatch(content.benefits.find(item => item.id === 'benefit-4').body, /Pan-India/);
  assert.doesNotMatch(content.copy.requestDetails, /Pan-India/);
  assert.deepEqual(base, before);
  const sparse = micromarketAdContent(base, page, { ...data, rentRange: null, rentRows: [] });
  assert.doesNotMatch(sparse.faqs[1].a, /₹|from Rent on request/);
});

test('Peenya cards require an explicit Peenya address and an asking rent of at least ₹25 in every size band', () => {
  const page = getMicromarketAdPage('peenya');
  const stock = [warehouse(1, 2000, '25'), warehouse(2, 8000, '24.99'), warehouse(3, 65000, '30'),
    { ...warehouse(4, 8000, '27'), address: 'Nelamangala, Tumkur Road' },
    { ...warehouse(5, 8000, '27'), address: 'PEENYA 2nd Stage, Bengaluru' },
    warehouse(6, 8000, 'Not disclosed'), { ...warehouse(7, 8000, '27'), address: 'Newpeenya Road' }];
  const cards = marketListings(stock, 'Peenya', page.listingPolicy);
  assert.deepEqual(cards.map(card => card.id).sort(), [1, 3, 5]);
  assert.deepEqual(featuredMarketListings(cards, 25).map(card => card.id), [5, 3, 1]);
  assert.match(page.heroSummaryCompact, /Options within 4 hours/);
  assert.deepEqual(page.mapBylines, { peenya: 'North-West Bangalore', nelamangala: 'Tumkur Road, NH-48', dobbaspet: 'Tumkur Road, NH-48' });
});

test('Hyderabad is a standalone city page with its own map, Telangana cards, one area card and a sectioned rent guide', () => {
  const page = getMicromarketAdPage('hyderabad', 'hyderabad');
  assert.equal(getMicromarketAdPage('hyderabad'), undefined);
  assert.equal(page.path, '/hyderabad');
  assert.equal(page.state, 'Telangana');
  assert.deepEqual(page.inventory, { city: 'Hyderabad' });
  assert.doesNotMatch(page.callbackNote, /Bangalore/);
  assert.equal(page.map.views.desktop.src, '/hyderabad/micromarkets-map.webp');
  // Markers project from coordinates onto the rendered cameras and stay on the map.
  for (const location of page.mapLocations) for (const [x, y] of Object.values(location.label)) assert.ok(x > 0 && x < 100 && y > 0 && y < 100, location.slug);
  assert.equal(page.mapLocations.find(location => location.slug === 'patancheru').showCount, false);
  const pair = page.mapLocations.find(location => location.slug === 'kompally-devaryamjal');
  assert.deepEqual(selectAdInventory([
    { ...warehouse(1, 8000, '25'), city: 'Hyderabad', micromarket: ['Kompally'] },
    { ...warehouse(2, 8000, '25'), city: 'Hyderabad', micromarket: ['Kompally', 'Devaryamjal'] },
    { ...warehouse(3, 8000, '25'), city: 'Hyderabad', micromarket: ['Medchal'] },
  ], pair.inventory).map(item => item.id), [1, 2]);
  const cards = marketListings([{ ...warehouse(1, 9000, '25'), city: 'Hyderabad', state: 'Telangana', micromarket: ['Kompally', 'Devaryamjal'] },
    { ...warehouse(2, 9000, '25'), city: 'Hyderabad', state: 'Telangana', micromarket: [] }], page.place, { minimumRent: 17 }, page);
  // A named area shows its city, as in the review ("Kompally · Hyderabad"); the city itself shows the state.
  assert.deepEqual(cards.map(card => [card.locality, card.region]), [['Hyderabad', 'Telangana'], ['Kompally', 'Hyderabad']]);
  const hosur = getMicromarketAdPage('hosur', 'hosur');
  assert.equal(marketListings([{ ...warehouse(3, 9000, '25'), city: 'Hosur', micromarket: ['Kelamangalam'] }], hosur.place, { minimumRent: 18 }, hosur)[0].region, 'Tamil Nadu');
  assert.deepEqual(page.areaCards, [{ title: '', body: page.areaCards[0].body }]);
  const base = JSON.parse(readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url)));
  const content = micromarketAdContent(base, page, { listingCount: 184, rentRange: '₹17 to ₹126', rentRows: [] });
  assert.equal(content.slug, 'hyderabad');
  assert.equal(content.rentGuide.description, '');
  assert.deepEqual(content.rentGuide.sections.map(section => section.title), ['Where the Stock Sits', 'What Drives the Rent', 'What to Check']);
  assert.match(content.faqs[1].a, /₹17 to ₹126/);
  assert.match(content.copy.metaDescription, /^184 live/);
  assert.doesNotMatch(JSON.stringify(content.services), /Bangalore/);
  assert.doesNotMatch(JSON.stringify(content.audiences.find(item => item.id === 'owners')), /Bangalore/);
  assert.equal(content.copy.heroAccent, 'in Hyderabad');
  assert.doesNotMatch(content.images.services.alt, /Bangalore/);
  const titled = micromarketAdContent(base, { ...page, rentGuide: { ...page.rentGuide, sections: [{ title: 'Rents From {rentRange}', body: '**Bold** {listings}.' }] } }, { listingCount: 184, rentRange: '₹17 to ₹126', rentRows: [] });
  assert.deepEqual(titled.rentGuide.sections, [{ title: 'Rents From ₹17 to ₹126', body: '**Bold** 184.' }]);
});

test('industrial sheds select every Bangalore shed by listing type and name Bangalore as their place', () => {
  const page = getMicromarketAdPage('sheds');
  assert.equal(page.path, '/bangalore/sheds');
  assert.equal(page.place, 'Bangalore');
  assert.equal(page.map, undefined, 'the shed page reuses the city belt map');
  const stock = [
    { ...warehouse(1, 8000, '25'), micromarket: ['Budigere', 'Bidrahalli'] },
    { ...warehouse(2, 8000, '25', 'PEB'), micromarket: ['Budigere'] },
    { ...warehouse(3, 8000, '25', ' shed '), micromarket: [] },
    { ...warehouse(4, 8000, '25', 'Shed'), micromarket: ['Peenya'] },
    { ...warehouse(5, 8000, '25', 'BTS'), micromarket: ['Peenya'] },
  ];
  assert.deepEqual(selectAdInventory(stock, page.inventory).map(item => item.id), [1, 3, 4]);
  const budigere = page.rentGuide.markets.find(row => row.slug === 'budigere');
  assert.deepEqual(selectAdInventory(stock, budigere.inventory).map(item => item.id), [1]);
  assert.deepEqual(page.mapLocations.map(location => location.slug), ['budigere', 'whitefield', 'jakkur-yelahanka', 'peenya', 'jigani-bommasandra', 'nelamangala', 'hoskote', 'kumbalgodu']);
  assert.ok(page.mapLocations.every(location => location.inventory.type === 'Shed'));
  const cards = marketListings(selectAdInventory(stock, page.inventory), page.place, { minimumRent: 13 }, page);
  assert.deepEqual(cards.map(card => card.locality).sort(), ['Bangalore', 'Budigere', 'Peenya']);
  const data = { listingCount: 57, rentRange: '₹13 to ₹80', rentRows: [] };
  assert.equal(marketText(page.heroSummary, data), '57 industrial sheds in Bangalore · ₹13 to ₹80 per sq ft · Options within 4 hours');
  assert.deepEqual(page.areaCards.map(card => card.title), ['Where They Are', 'Who They Suit']);
  const base = JSON.parse(readFileSync(new URL('../src/data/ad-pages/bangalore.json', import.meta.url)));
  const content = micromarketAdContent(base, page, data);
  assert.equal(content.copy.heroAccent, 'in Bangalore');
  assert.equal(content.copy.mapLabel, 'Bangalore');
  assert.match(content.copy.availableFooter, /all 57 industrial sheds for you/);
  assert.match(content.copy.enquiryDescription, /industrial shed in Bangalore/);
  assert.match(content.faqs[1].a, /₹13 to ₹80/);
  assert.equal(content.rentGuide.sections, undefined);
  assert.deepEqual(content.services, base.services);
  const sparse = micromarketAdContent(base, page, { ...data, rentRange: null });
  assert.match(sparse.faqs[1].a, /current asking rents in Bangalore/);
  assert.equal(content.name, 'Bangalore', 'the empty featured state names the place, not "Industrial Sheds"');
  assert.equal(page.whatsappMessage, "Hi, I'm looking for an industrial shed in Bangalore. (From the industrial sheds page)");
});

test('the shed loader reads Bangalore once, counts only sheds and labels untagged cards Bangalore', async () => {
  const previous = warehouseAPI.getWarehouses;
  const previousFetch = globalThis.fetch;
  const calls = [];
  try {
    // The micromarket feed counts every listing type; shed markers must not use it.
    globalThis.fetch = async () => Response.json({ data: [{ citySlug: 'bengaluru', slug: 'peenya', listings: 999 }] });
    const stock = [
      // The lowest rent sets the floor (₹22), so the ₹20 listing is counted but not shown.
      ...Array.from({ length: 10 }, (_, index) => ({ ...warehouse(index + 1, 8000 + index * 1000, index ? '30' : '20'), micromarket: ['Budigere', 'Bidrahalli'] })),
      { ...warehouse(20, 9000, '30'), micromarket: ['Peenya'] },
      { ...warehouse(21, 60000, '30'), micromarket: [] },
      { ...warehouse(22, 9000, '30', 'PEB'), micromarket: ['Peenya'] },
      { ...warehouse(23, 9000, '30', 'RCC'), micromarket: ['Budigere'] },
    ];
    warehouseAPI.getWarehouses = async (...args) => { calls.push(args); return { data: stock, pagination: { totalItems: stock.length, totalPages: 1 } }; };
    const page = getMicromarketAdPage('sheds');
    const data = await loadMicromarketAdInventory(page, undefined, true);
    assert.equal(calls.length, 1, 'one city-wide read serves the page, its rent rows and its markers');
    assert.deepEqual(calls[0][2], { city: 'Bengaluru', locationMatch: 'exact' });
    assert.equal(data.listingCount, 12);
    assert.equal(data.marketCounts.peenya, 1);
    assert.equal(data.marketCounts.budigere, 10);
    assert.deepEqual(data.rentRows.map(row => row.area), ['All Bangalore sheds', 'Budigere (Old Madras Road)']);
    assert.ok(data.listings.every(listing => listing.warehouseType === 'Shed' && listing.region === 'Bengaluru'));
    assert.equal(data.listings.length, 11);
    assert.deepEqual(data.listings.find(listing => listing.id === 21).locality, 'Bangalore');
  } finally { warehouseAPI.getWarehouses = previous; globalThis.fetch = previousFetch; }
});
