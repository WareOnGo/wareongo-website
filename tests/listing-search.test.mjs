import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const { outputFiles } = await build({
  stdin: { contents: `export * from './src/lib/listingSearch.ts';
    export { CITIES, FILTER_MICROMARKETS } from './src/data/locations.generated.ts';`, resolveDir: process.cwd() },
  bundle: true, write: false, platform: 'node', format: 'cjs',
});
const compiled = { exports: {} };
new Function('module', 'exports', outputFiles[0].text)(compiled, compiled.exports);
const { readListingSearch, writeListingSearch, DEFAULT_FILTERS, listingShouldRevalidate, toApiFilters,
  changeListingFilter, selectedAreaPresets, micromarketsForCity, listingSearchHref, CITY_OPTIONS, CITIES, FILTER_MICROMARKETS } = compiled.exports;
const read = query => readListingSearch(new URLSearchParams(query));

test('shared filters, page and selected page size round trip without dropping attribution', () => {
  const query = new URLSearchParams('utm_source=mail&utm_content=a&utm_content=b&city=Bangalore&state=Karnataka&fire=yes&type=PEB&minSqft=20000&maxSqft=80000&page=3&pageSize=30');
  const state = readListingSearch(query);
  assert.equal(state.page, 3);
  assert.equal(state.pageSize, 30);
  assert.equal(state.filters.fireCompliance, 'yes');
  const written = writeListingSearch(query, state);
  assert.deepEqual(readListingSearch(written), state);
  assert.deepEqual(written.getAll('utm_content'), ['a', 'b']);
  assert.equal(written.get('utm_source'), 'mail');
  assert.equal(written.get('state'), 'Karnataka', 'state filters remain visible and shareable');
});

test('invalid page numbers and unsupported page sizes never reach API offsets', () => {
  for (const page of ['0', '-1', '3.5', '2junk', 'NaN', 'Infinity', '9007199254740991', '99999999999999999999999']) {
    assert.equal(read(`page=${page}`).page, 1, page);
  }
  for (const pageSize of ['0', '-1', '18', '1000000', '21junk']) {
    assert.equal(read(`pageSize=${pageSize}`).pageSize, 21, pageSize);
  }
  assert.equal(read('page=0003&pageSize=10').page, 3);
});

test('case, all values, duplicates, and ranges normalize to one meaningful query', () => {
  assert.deepEqual(read('city=all&state=ALL&type=all&fire=invalid').filters, DEFAULT_FILTERS);
  const state = read('city=bengaluru&type=peb&fire=YES&minSqft=90000&maxSqft=20000&page=2&page=4');
  assert.equal(state.filters.city, 'Bengaluru');
  assert.deepEqual(state.filters.warehouseTypes, ['PEB']);
  assert.equal(state.filters.fireCompliance, 'yes');
  assert.equal(state.filters.minSqft, 20000);
  assert.equal(state.filters.maxSqft, 90000);
  const written = writeListingSearch(new URLSearchParams('page=2&page=4'), state);
  assert.deepEqual(written.getAll('page'), ['2']);
  assert.deepEqual(read('minSqft=-1&maxSqft=999999').filters, DEFAULT_FILTERS);
  assert.deepEqual(read('minSqft=garbage&maxSqft=5junk').filters, DEFAULT_FILTERS);
  assert.equal(read('city=Mumbai').filters.city, 'Mumbai', 'existing free-form location links remain supported');
});

test('every offered building type survives a shared URL and reaches the backend', () => {
  for (const type of ['PEB', 'RCC', 'BTS', 'Shed']) {
    const state = read(`type=${type.toLowerCase()}`);
    assert.deepEqual(state.filters.warehouseTypes, [type]);
    assert.deepEqual(toApiFilters(state.filters), { warehouseType: type });
    assert.equal(writeListingSearch(new URLSearchParams(), state).get('type'), type);
  }
  assert.deepEqual(read('type=invalid').filters.warehouseTypes, []);
});

test('multiple types and disjoint area bands round trip in canonical order without filling gaps', () => {
  const query = new URLSearchParams('type=rcc,peb&type=RCC,unknown&area=50000-,0-10000&area=0-10000&minSqft=20000&maxSqft=25000&utm_source=shared&page=2');
  const state = readListingSearch(query);
  assert.deepEqual(state.filters.warehouseTypes, ['PEB', 'RCC']);
  assert.deepEqual(state.filters.areaRanges, ['0-10000', '50000-']);
  assert.deepEqual(toApiFilters(state.filters), { warehouseType: 'PEB,RCC', spaceRanges: '0-10000,50000-' });
  const written = writeListingSearch(query, state);
  assert.deepEqual(written.getAll('type'), ['PEB,RCC']);
  assert.deepEqual(written.getAll('area'), ['0-10000,50000-']);
  assert.equal(written.has('minSqft') || written.has('maxSqft'), false);
  assert.equal(written.get('utm_source'), 'shared');
  assert.deepEqual(readListingSearch(written), state);
});

test('selecting, removing and clearing area chips replaces the custom range without changing other filters', () => {
  const filters = read('type=PEB,RCC&minSqft=15000&maxSqft=19000').filters;
  const multiple = changeListingFilter(filters, 'areaRanges', ['0-10000', '50000-']);
  assert.deepEqual(toApiFilters(multiple), { warehouseType: 'PEB,RCC', spaceRanges: '0-10000,50000-' });
  const single = changeListingFilter(multiple, 'areaRanges', ['50000-']);
  assert.deepEqual(toApiFilters(single), { warehouseType: 'PEB,RCC', minSpace: 50000 });
  const written = writeListingSearch(new URLSearchParams('area=0-10000,50000-'), { filters: single, page: 1, pageSize: 21 });
  assert.equal(written.has('area'), false);
  assert.equal(written.get('minSqft'), '50000');
  assert.deepEqual(selectedAreaPresets(readListingSearch(written).filters).map(range => range.value), ['50000-']);
  assert.deepEqual(toApiFilters(changeListingFilter(single, 'areaRanges', [])), { warehouseType: 'PEB,RCC' });
  assert.equal(filters.minSqft, 15000, 'draft changes leave the original untouched');
  assert.deepEqual(read('area=bad,500-100,10000').filters, DEFAULT_FILTERS);
});

test('expanding a type-specific route keeps the location and both types in the shared search', () => {
  const preset = { ...DEFAULT_FILTERS, city: 'Bengaluru', warehouseTypes: ['PEB'] };
  const state = readListingSearch(new URLSearchParams('type=RCC,PEB&area=0-10000,50000-&utm_source=shared'), preset);
  const written = writeListingSearch(new URLSearchParams('utm_source=shared'), state, preset);
  const href = new URL(listingSearchHref('/listings/city/bengaluru/peb', written, '#results', preset), 'https://wareongo.com');
  assert.equal(href.pathname, '/listings');
  assert.equal(href.searchParams.get('city'), 'Bengaluru');
  assert.equal(href.searchParams.get('type'), 'PEB,RCC');
  assert.equal(href.searchParams.get('area'), '0-10000,50000-');
  assert.equal(href.hash, '#results');
  assert.equal(href.searchParams.get('utm_source'), 'shared');
});

test('canonical location selections include legacy inventory spellings in API requests', () => {
  for (const [alias, canonical, api] of [
    ['bangalore', 'Bengaluru', 'Bangalore,Bengaluru'],
    ['gurgaon', 'Gurugram', 'Gurgaon,Gurugram'],
    ['bombay', 'Mumbai', 'Bombay,Mumbai'],
    ['madras', 'Chennai', 'Madras,Chennai'],
    ['calcutta', 'Kolkata', 'Calcutta,Kolkata'],
  ]) {
    const state = read(`city=${alias}`);
    assert.equal(state.filters.city, canonical);
    assert.equal(toApiFilters(state.filters).city, canonical);
    assert.equal(toApiFilters(state.filters).locationMatch, 'exact');
    assert.equal(writeListingSearch(new URLSearchParams(), state).get('city'), canonical);
  }
  assert.equal(toApiFilters(read('city=Ahmedabad&state=gujarat').filters).state, 'Gujarat');
  assert.deepEqual(toApiFilters(read('city=constructor').filters), { city: 'constructor', locationMatch: 'exact' });
});

test('cities and their micromarkets use descending inventory order with alphabetical ties', () => {
  const groups = [[CITY_OPTIONS, CITIES], ...CITY_OPTIONS.map(city => {
    const markets = micromarketsForCity(city);
    for (const market of markets) assert.equal(market.parentCity, city);
    return [markets.map(market => market.canonical), FILTER_MICROMARKETS.filter(market => market.parentCity === city)];
  })];
  for (const [options, locations] of groups) {
    assert.equal(options.length, locations.length);
    assert.equal(new Set(options).size, locations.length);
    const counts = new Map(locations.map(location => [location.canonical, location.count]));
    for (let i = 0; i < options.length; i++) {
      assert.ok(counts.has(options[i]));
      if (i === 0) continue;
      assert.ok(counts.get(options[i - 1]) >= counts.get(options[i]), options[i] + ' is out of order');
      if (counts.get(options[i - 1]) === counts.get(options[i])) {
        assert.ok(options[i - 1].localeCompare(options[i], 'en') < 0);
      }
    }
  }
});

test('micromarket URLs are scoped to the selected city, including city aliases', () => {
  const state = read('city=bangalore&micromarket=WHITEFIELD&type=BTS');
  assert.equal(state.filters.micromarket, 'whitefield');
  assert.deepEqual(toApiFilters(state.filters), { city: 'Bengaluru', locationMatch: 'exact', micromarket: 'whitefield', warehouseType: 'BTS' });
  assert.deepEqual(readListingSearch(writeListingSearch(new URLSearchParams('utm_source=test'), state)).filters, state.filters);
  assert.equal(read('micromarket=whitefield').filters.micromarket, '');
  assert.equal(read('city=Ahmedabad&micromarket=whitefield').filters.micromarket, 'whitefield');
  assert.equal(read('city=Bengaluru&micromarket=unknown-locality').filters.micromarket, 'unknown-locality');
  assert.deepEqual(micromarketsForCity(''), []);
  assert.deepEqual(micromarketsForCity('Unknown city'), []);
});

test('changing or clearing a city clears its micromarket and preserves the other requirements', () => {
  const draft = { ...DEFAULT_FILTERS, city: 'Bengaluru', micromarket: 'whitefield', warehouseTypes: ['Shed'] };
  assert.deepEqual(changeListingFilter(draft, 'city', 'Pune'), { ...draft, city: 'Pune', micromarket: '' });
  assert.deepEqual(changeListingFilter(draft, 'city', ''), { ...draft, city: '', micromarket: '' });
  assert.deepEqual(changeListingFilter(draft, 'city', 'Bengaluru'), draft);
  assert.deepEqual(changeListingFilter(draft, 'micromarket', ''), { ...draft, micromarket: '' });
  assert.deepEqual(changeListingFilter(draft, 'fireCompliance', 'yes'), { ...draft, fireCompliance: 'yes' });
  assert.equal(draft.micromarket, 'whitefield', 'changes must not mutate the current draft');
});

test('Fire NOC off includes all statuses, including old negative-filter URLs', () => {
  assert.deepEqual(toApiFilters(read('fire=YES').filters), { fireNocAvailable: true });
  for (const fire of ['', 'no', 'all', 'invalid']) {
    const query = new URLSearchParams({ fire, utm_source: 'saved-link' });
    const state = readListingSearch(query);
    assert.equal(state.filters.fireCompliance, '');
    assert.deepEqual(toApiFilters(state.filters), {});
    assert.equal(writeListingSearch(query, state).toString(), 'utm_source=saved-link');
  }
});

test('the open-ended area preset never sends a hidden upper bound', () => {
  assert.deepEqual(toApiFilters(read('minSqft=50000').filters), { minSpace: 50000 });
  assert.deepEqual(toApiFilters(read('minSqft=10000&maxSqft=25000').filters), { minSpace: 10000, maxSpace: 25000 });
});

test('reset clears owned filters and page while retaining selected page size and unrelated parameters', () => {
  const next = writeListingSearch(new URLSearchParams('city=Delhi&page=4&pageSize=30&utm_source=mail'), {
    filters: DEFAULT_FILTERS, page: 1, pageSize: 30,
  });
  assert.equal(next.toString(), 'utm_source=mail&pageSize=30');
  assert.equal(writeListingSearch(new URLSearchParams('page=1&pageSize=21'), read('')).toString(), '');
});

const revalidate = (from, to, extra = {}) => listingShouldRevalidate({
  currentUrl: new URL(from, 'https://wareongo.com'), nextUrl: new URL(to, 'https://wareongo.com'),
  currentParams: {}, nextParams: {}, defaultShouldRevalidate: true, ...extra,
});

test('query-only pagination/filter navigation retains loader data and ongoing preloads', () => {
  assert.equal(revalidate('/listings', '/listings?page=2'), false);
  assert.equal(revalidate('/listings?city=Delhi', '/listings?city=Bangalore&pageSize=30'), false);
  assert.equal(revalidate('/listings?city=Bengaluru', '/listings?city=Bengaluru&micromarket=whitefield'), false);
  assert.equal(revalidate('/listings/city/bengaluru', '/listings/city/bengaluru?area=0-10000,50000-&type=PEB,RCC'), false);
  assert.equal(revalidate('/listings/city/bengaluru', '/listings/city/bengaluru?page=2&pageSize=18'), false);
  assert.equal(revalidate('/overview/karnataka/bengaluru?page=3&pageSize=6', '/overview/karnataka/bengaluru?page=1'), false);
});

test('path changes, unrelated search changes, actions and explicit revalidation keep router defaults', () => {
  assert.equal(revalidate('/listings/city/bengaluru?page=2', '/listings/city/delhi?page=2'), true);
  assert.equal(revalidate('/listings?utm_source=a', '/listings?page=2&utm_source=b'), true);
  assert.equal(revalidate('/listings/city/bengaluru', '/listings/city/bengaluru?city=Delhi'), false);
  assert.equal(revalidate('/listings?page=2', '/listings?page=2'), true);
  for (const extra of [{ formMethod: 'GET' }, { formMethod: 'POST' }, { actionResult: null }, { actionStatus: 200 }]) {
    assert.equal(revalidate('/listings', '/listings?page=2', extra), true);
  }
  assert.equal(revalidate('/listings', '/listings', { defaultShouldRevalidate: false }), false);
});


test('location presets stay in clean URLs while refinements and history remain explicit', () => {
  for (const preset of [
    { ...DEFAULT_FILTERS, city: 'Bengaluru' },
    { ...DEFAULT_FILTERS, state: 'Karnataka' },
    { ...DEFAULT_FILTERS, city: 'Bengaluru', micromarket: 'nelamangala' },
    { ...DEFAULT_FILTERS, city: 'Bengaluru', warehouseTypes: ['PEB'] },
  ]) {
    const state = readListingSearch(new URLSearchParams('utm_source=test&page=2'), preset);
    assert.deepEqual(state.filters, preset);
    const query = writeListingSearch(new URLSearchParams('utm_source=test'), { ...state, filters: { ...preset, minSqft: 10000 } }, preset);
    assert.equal(query.toString(), 'utm_source=test&minSqft=10000&page=2');
    assert.deepEqual(readListingSearch(query, preset).filters, { ...preset, minSqft: 10000 });
    assert.equal(listingSearchHref('/listings/city/bengaluru', query, '#results', preset), '/listings/city/bengaluru?utm_source=test&minSqft=10000&page=2#results');
    const cleared = writeListingSearch(new URLSearchParams('utm_source=test'), { filters: DEFAULT_FILTERS, page: 1, pageSize: 21 }, preset);
    assert.equal(listingSearchHref('/listings/city/bengaluru', cleared, '#results', preset), '/listings?utm_source=test#results');
  }
});

test('switching geography drops dependent selections without hiding requirements', () => {
  const preset = { ...DEFAULT_FILTERS, state: 'Karnataka', city: 'Bengaluru', micromarket: 'nelamangala', warehouseTypes: ['PEB'] };
  assert.deepEqual(changeListingFilter(preset, 'city', 'Delhi'), { ...preset, state: '', city: 'Delhi', micromarket: '' });
  assert.deepEqual(changeListingFilter(preset, 'state', 'Delhi'), { ...preset, state: 'Delhi', city: '', micromarket: '' });
  const filters = changeListingFilter(preset, 'city', 'Delhi');
  const query = writeListingSearch(new URLSearchParams('utm_source=test'), { filters, page: 1, pageSize: 21 }, preset);
  assert.equal(listingSearchHref('/listings/city/bengaluru/nelamangala', query, '', preset), '/listings?utm_source=test&city=Delhi&type=PEB');
});
