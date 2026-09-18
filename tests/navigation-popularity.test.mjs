import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { popularLocationIds } from '../scripts/lib/navigation-popularity.mjs';

const run = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const place = (canonical, count = 99) => ({ canonical, slug: canonical.toLowerCase(), count });
const market = (canonical, count, citySlug = 'bengaluru') => ({
  ...place(canonical, count), parentCity: citySlug === 'bengaluru' ? 'Bengaluru' : 'Delhi', citySlug,
});
const summaries = () => {
  const labels = ['Zebra', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Eta', 'Theta'];
  const counts = [50, 80, 80, 20, 30, 40, 60, 70];
  return {
    cities: labels.map(label => place(label)), states: labels.map(label => place(label)),
    micromarkets: labels.map((label, i) => market(label, counts[i])),
    aggregates: {
      cities: labels.map((name, i) => ({ name, slug: name.toLowerCase(), listings: counts[i] })),
      states: labels.map((name, i) => ({ name, slug: name.toLowerCase(), listings: counts[i] })),
    },
  };
};

test('API counts rank each group highest first with six states, six cities and five micromarkets', () => {
  const data = summaries();
  const result = popularLocationIds(data, data.aggregates, 3);
  // The warehouse summaries deliberately all have the same count.
  for (const category of ['cities', 'states']) {
    assert.deepEqual(result[category], ['alpha', 'beta', 'theta', 'eta', 'zebra', 'epsilon'].map(slug => category + '/' + slug));
  }
  assert.deepEqual(result.micromarkets, ['alpha', 'beta', 'theta', 'eta', 'zebra'].map(slug => 'micromarkets/bengaluru/' + slug));
  data.cities.reverse(); data.states.reverse(); data.micromarkets.reverse();
  data.aggregates.cities.reverse(); data.aggregates.states.reverse();
  assert.deepEqual(popularLocationIds(data, data.aggregates, 3), result, 'API enumeration order must not break ties');
});

test('eligibility follows built listing routes and keeps state, city and parent-city identities distinct', () => {
  const data = {
    states: [place('Delhi'), place('Empty', 0)],
    cities: [place('Delhi'), place('Thin', 2)],
    micromarkets: [market('Area', 6, 'delhi'), market('Area', 6), market('Zero', 0),
      market('peb', 100), market('rcc', 100), { ...market('Orphan', 100), parentCity: '' }],
  };
  const result = popularLocationIds(data, {
    states: [{ slug: 'delhi', listings: 10 }, { slug: 'empty', listings: 1000 }],
    cities: [{ slug: 'delhi', listings: 10 }, { slug: 'thin', listings: 1000 }, { slug: 'unbuilt', listings: 2000 }],
  }, 3);
  assert.deepEqual(result, {
    states: ['states/delhi'], cities: ['cities/delhi'],
    micromarkets: ['micromarkets/bengaluru/area', 'micromarkets/delhi/area'],
  });
});

test('malformed or duplicated API records stop ranking instead of silently changing navigation', () => {
  for (const invalid of [-1, 1.5, NaN, Infinity, '100', null]) {
    const data = summaries();
    data.aggregates.cities[0].listings = invalid;
    assert.throws(() => popularLocationIds(data, data.aggregates, 3), /Invalid navigation listing count/);
    data.aggregates.cities[0].listings = 50;
    data.micromarkets[0].count = invalid;
    assert.throws(() => popularLocationIds(data, data.aggregates, 3), /Invalid navigation listing count/);
  }
  const data = summaries();
  assert.throws(() => popularLocationIds(data, { cities: [] }, 3), /Missing states/);
  assert.throws(() => popularLocationIds(data, { ...data.aggregates, states: [] }, 3), /No eligible states/);
  assert.throws(() => popularLocationIds(data, { ...data.aggregates, cities: [{ slug: '../escape', listings: 100 }] }, 3), /Invalid cities/);
  data.aggregates.cities.push(data.aggregates.cities[0]);
  assert.throws(() => popularLocationIds(data, data.aggregates, 3), /Duplicate cities/);
  data.aggregates.cities.pop();
  data.micromarkets.push(data.micromarkets[0]);
  assert.throws(() => popularLocationIds(data, data.aggregates, 3), /Duplicate micromarket/);
  assert.deepEqual(popularLocationIds({ cities: [], states: [], micromarkets: [] }, { cities: [], states: [] }, 3),
    { cities: [], states: [], micromarkets: [] });
});

const fixture = () => ({
  warehouses: [
    ...Array.from({ length: 3 }, (_, i) => ({ id: i + 1, city: 'Bangalore', state: 'Karnataka', warehouseType: 'PEB' })),
    ...Array.from({ length: 3 }, (_, i) => ({ id: i + 4, city: 'Hyderabad', state: 'Telangana', warehouseType: 'RCC' })),
    { id: 7, city: 'Jhajjar', state: 'Haryana', warehouseType: 'PEB' },
  ],
  locations: {
    cities: [{ slug: 'bengaluru', stateSlug: 'karnataka', listings: 10 },
      { slug: 'hyderabad', stateSlug: 'telangana', listings: 20 }, { slug: 'jhajjar', stateSlug: 'haryana', listings: 1 }],
    states: [{ slug: 'karnataka', listings: 10 }, { slug: 'telangana', listings: 20 }, { slug: 'haryana', listings: 1 }],
  },
  micromarkets: [
    { name: 'Hoskote', slug: 'hoskote', parentCity: 'Bengaluru', citySlug: 'bengaluru', listings: 4, hasPage: true, listingIds: [1, 2, 3, 4] },
    { name: 'Kompally', slug: 'kompally', parentCity: 'Hyderabad', citySlug: 'hyderabad', listings: 8, hasPage: true, listingIds: [4, 5, 6] },
    { name: 'Unpublished', slug: 'unpublished', parentCity: null, citySlug: null, listings: 1, hasPage: false, listingIds: [7, 7, 999] },
  ],
});

async function generatorHarness(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wareongo-navigation-build-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const preload = path.join(dir, 'api-fixture.mjs');
  await fs.writeFile(preload, [
    "import fs from 'node:fs';",
    "const fixture = JSON.parse(fs.readFileSync('fixture.json', 'utf8'));",
    "globalThis.fetch = async (url, init) => {",
    "  const endpoint = new URL(url).pathname;",
    "  fs.appendFileSync('requests.jsonl', JSON.stringify({ endpoint, cache: init.cache, headers: Object.fromEntries(init.headers) }) + '\\n');",
    "  if (!['/warehouses', '/locations', '/micromarkets'].includes(endpoint)) throw new Error('Unexpected request: ' + url);",
    "  const broken = endpoint === '/locations' && fixture.failure;",
    "  const body = endpoint === '/warehouses' ? { data: fixture.warehouses, pagination: { totalPages: 1 } }",
    "    : { data: endpoint === '/locations' ? fixture.locations : fixture.micromarkets };",
    "  return new Response(JSON.stringify(body), { status: broken === 'http' ? 400 : 200,",
    "    headers: broken === 'stale' ? {} : { 'X-Wareongo-Cache': 'bypass' } });",
    "};",
  ].join('\n'));
  return {
    dir,
    async generate(data) {
      await fs.writeFile(path.join(dir, 'fixture.json'), JSON.stringify(data));
      await run(process.execPath, ['--import', preload, path.join(root, 'scripts/generate-locations.mjs')], {
        cwd: dir, env: { ...process.env, WAREONGO_API_BASE: 'https://navigation-build.invalid' }, timeout: 15_000,
      });
    },
    async snapshot() { return fs.readFile(path.join(dir, 'src/data/locations.generated.ts'), 'utf8'); },
  };
}

function rankedIds(source) {
  const match = source.match(/export const POPULAR_LOCATION_IDS[^=]*= (\{[\s\S]*?\n\});/);
  assert.ok(match, 'the build must emit static ranked IDs');
  return JSON.parse(match[1]);
}

function filterMarkets(source) {
  const match = source.match(/export const FILTER_MICROMARKETS[^=]*= (\[[\s\S]*?\n\]);/);
  assert.ok(match, 'the build must emit all city-scoped micromarket choices');
  return JSON.parse(match[1]);
}

test('the real generator fetches fresh APIs and writes revised order only at build time', async t => {
  const harness = await generatorHarness(t);
  const data = fixture();
  await harness.generate(data);
  assert.deepEqual(rankedIds(await harness.snapshot()), {
    states: ['states/telangana', 'states/karnataka', 'states/haryana'],
    cities: ['cities/hyderabad', 'cities/bengaluru'],
    micromarkets: ['micromarkets/hyderabad/kompally', 'micromarkets/bengaluru/hoskote'],
  });
  assert.deepEqual(filterMarkets(await harness.snapshot()), [
    { canonical: 'Hoskote', slug: 'hoskote', count: 3, parentCity: 'Bengaluru', citySlug: 'bengaluru' },
    { canonical: 'Kompally', slug: 'kompally', count: 3, parentCity: 'Hyderabad', citySlug: 'hyderabad' },
    { canonical: 'Hoskote', slug: 'hoskote', count: 1, parentCity: 'Hyderabad', citySlug: 'hyderabad' },
    { canonical: 'Unpublished', slug: 'unpublished', count: 1, parentCity: 'Jhajjar', citySlug: 'jhajjar' },
  ], 'scope membership by actual inventory, resolve city aliases, deduplicate IDs and include small markets');
  const requests = (await fs.readFile(path.join(harness.dir, 'requests.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.deepEqual(requests.map(r => r.endpoint).sort(), ['/locations', '/micromarkets', '/warehouses']);
  for (const request of requests) {
    assert.equal(request.cache, 'no-store');
    assert.equal(request.headers['cache-control'], 'no-cache, no-store');
  }
  data.locations.cities[0].listings = 30;
  data.locations.states[0].listings = 30;
  data.micromarkets[0].listings = 12;
  data.micromarkets[0].listingIds = [1, 2];
  await harness.generate(data);
  const updated = rankedIds(await harness.snapshot());
  assert.equal(updated.cities[0], 'cities/bengaluru');
  assert.equal(updated.states[0], 'states/karnataka');
  assert.equal(updated.micromarkets[0], 'micromarkets/bengaluru/hoskote');
  assert.equal(filterMarkets(await harness.snapshot())[0].slug, 'kompally', 'a rebuild refreshes filter counts and order');
});

test('failed or stale APIs and malformed counts leave the previous generated snapshot untouched', async t => {
  const harness = await generatorHarness(t);
  await harness.generate(fixture());
  const previous = await harness.snapshot();
  for (const failure of ['http', 'stale', 'shape', 'count', 'empty']) {
    const data = fixture();
    if (failure === 'shape') data.locations = {};
    else if (failure === 'count') data.locations.cities[0].listings = -1;
    else if (failure === 'empty') data.locations.cities = [];
    else data.failure = failure;
    await assert.rejects(harness.generate(data), error => {
      assert.equal(error.code, 1, failure + ' must fail the generator');
      return true;
    });
    assert.equal(await harness.snapshot(), previous);
  }
});

test('production and development SSG builds generate popularity before compiling the website', async () => {
  const { scripts } = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  for (const name of ['build', 'build:dev']) {
    const generation = scripts[name].indexOf('node scripts/generate-locations.mjs');
    const compilation = scripts[name].indexOf('vite-react-ssg build');
    assert.ok(generation >= 0 && compilation > generation, name);
  }
});
