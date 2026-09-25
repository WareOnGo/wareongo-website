import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { build } from 'esbuild';
import { parseFragment } from 'parse5';

// Render the real components with their real hooks. Server rendering does not
// run gallery/analytics effects, so this needs no API, browser or hook mocks.
const { outputFiles } = await build({
  absWorkingDir: fileURLToPath(new URL('..', import.meta.url)),
  stdin: {
    contents: `
      import { MemoryRouter } from 'react-router-dom';
      import { renderToString } from 'react-dom/server';
      import WarehouseCard from './src/components/WarehouseCard';
      import FeaturedListingsSection from './src/components/FeaturedListingsSection';
      export { transformWarehouseData } from './src/services/warehouseAPI';
      export * from './src/lib/warehouseCardData';
      export const renderCard = props => renderToString(
        <MemoryRouter><WarehouseCard {...props} /></MemoryRouter>
      );
      export const renderFeatured = () => renderToString(
        <MemoryRouter><FeaturedListingsSection /></MemoryRouter>
      );
    `,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    loader: 'tsx',
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  loader: { '.css': 'empty' },
  define: {
    'process.env.NODE_ENV': '"production"',
    '__DEV_SERVER__': 'false',
    'import.meta.env': JSON.stringify({ SSR: true, PROD: false, DEV: false }),
  },
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(
  createRequire(import.meta.url), compiled, compiled.exports,
);
const { renderCard, renderFeatured, transformWarehouseData, parseClearHeight, parseDockCount, cardLocation, cardConstructionLabel, cardUpdateLabel } = compiled.exports;

const descendants = node => (node.childNodes ?? []).flatMap(child => [child, ...descendants(child)]);
const elements = (node, tag) => descendants(node).filter(child => child.tagName === tag);
const attr = (node, name) => node.attrs?.find(attribute => attribute.name === name)?.value;
const textOf = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(textOf).join('');

const fixture = {
  id: 1608,
  address: 'Nelamangala & Tumkur Road',
  location: { city: 'Bengaluru', state: 'Karnataka' },
  size: 34000,
  ceilingHeight: 30,
  price: 24,
  fireCompliance: true,
  features: [],
  href: '/warehouse/34000-sqft-rcc-warehouse-bengaluru-1608',
  images: ['https://images.example.test/front.webp', 'https://images.example.test/loading-bay.webp'],
};

function assertIndependentControls(root) {
  for (const anchor of elements(root, 'a')) {
    assert.equal(elements(anchor, 'button').length, 0, 'a property link must not wrap gallery or enquiry buttons');
    assert.equal(elements(anchor, 'a').length, 0, 'property links must not be nested');
  }
  for (const button of elements(root, 'button')) {
    assert.equal(elements(button, 'a').length, 0, 'buttons must not wrap property links');
  }
}

test('shared card publishes a descriptive property link in initial HTML', () => {
  const root = parseFragment(renderCard(fixture));
  const links = elements(root, 'a');
  assert.equal(links.length, 1);
  assert.equal(attr(links[0], 'href'), fixture.href);
  assert.ok(textOf(links[0]).includes(fixture.address));
  assert.ok(attr(links[0], 'aria-label').includes(fixture.location.city));
  assert.ok(elements(root, 'h2').some(heading => elements(heading, 'a').includes(links[0])),
    'the visible card title must be the link');
  assertIndependentControls(root);
});

test('long fallback addresses truncate early while retaining the full accessible address', () => {
  const address = 'Lakkenahalli, Kunigal Road, near Nelamangala';
  const root = parseFragment(renderCard({ ...fixture, address, micromarket: [] }));
  const heading = elements(root, 'h2')[0];
  assert.equal(textOf(heading), 'Lakkenahalli, Kunigal Road,…');
  assert.equal(attr(heading, 'title'), `${address} · Bengaluru`);
  assert.ok(attr(elements(heading, 'a')[0], 'aria-label').includes(address));
});

test('gallery and enquiry remain independent controls beside the property link', () => {
  const root = parseFragment(renderCard(fixture));
  const buttons = elements(root, 'button');
  assert.ok(buttons.some(button => attr(button, 'aria-label') === 'Previous image'));
  assert.ok(buttons.some(button => attr(button, 'aria-label') === 'Next image'));
  assert.equal(buttons.filter(button => attr(button, 'aria-label')?.startsWith('Go to image ')).length, 0);
  assert.ok(buttons.some(button => textOf(button).includes('Raise enquiry') && attr(button, 'aria-haspopup') === 'dialog'));
  assertIndependentControls(root);
});

test('a card without photographs still has a crawlable title and enquiry action', () => {
  const root = parseFragment(renderCard({ ...fixture, images: [] }));
  assert.equal(attr(elements(root, 'a')[0], 'href'), fixture.href);
  assert.ok(textOf(root).includes('Images available on request'));
  assert.ok(elements(root, 'button').some(button => textOf(button).includes('Raise enquiry')));
  assertIndependentControls(root);
});

test('all three featured cards publish property anchors with their visible identities', () => {
  const root = parseFragment(renderFeatured());
  const links = elements(root, 'a').filter(anchor => attr(anchor, 'href')?.startsWith('/warehouse/'));
  assert.equal(links.length, 3);
  for (const anchor of links) {
    const id = textOf(anchor).match(/ID:\s*(\d+)/)?.[1];
    assert.ok(id, 'featured links retain the visible property ID');
    assert.ok(attr(anchor, 'href').endsWith(`-${id}`), 'the destination refers to that same property');
    assert.ok(elements(anchor, 'h3').some(heading => textOf(heading).trim()), 'each link has a descriptive title');
  }
  assertIndependentControls(root);
});

test('approved card leads with area then decimal rent, and keeps the full locality in its link', () => {
  const locality = 'Nelamangala Industrial Area, Tumakuru Road';
  const root = parseFragment(renderCard({ ...fixture, size: 125000, price: 26.25, micromarket: [locality], warehouseType: 'PEB', numberOfDocks: 4 }));
  assert.deepEqual(elements(root, 'dt').map(textOf), ['Carpet area', 'Rent / month']);
  assert.deepEqual(elements(root, 'dd').map(textOf), ['1,25,000 sqft', '₹26.25 /sqft']);
  assert.equal(textOf(elements(root, 'a')[0]), locality);
  assert.deepEqual(elements(root, 'li').map(textOf), ['30 ft Clear Height', '4 Docks', 'Fire NOC: Yes']);
  assert.equal(elements(root, 'button').filter(node => textOf(node) === 'Raise enquiry').length, 1);
  assert.equal(elements(root, 'button').length, 3, 'only previous, next and enquiry controls');
});

for (const value of [true, false, null, undefined]) {
  test(`Fire NOC chip is shown only for confirmed Yes (${value})`, () => {
    const root = parseFragment(renderCard({ ...fixture, fireCompliance: value }));
    const chips = elements(root, 'li').filter(node => attr(node, 'data-spec') === 'fire');
    assert.equal(chips.length, value === true ? 1 : 0);
    if (value === true) assert.equal(textOf(chips[0]), 'Fire NOC: Yes');
    assert.ok(!textOf(root).includes('Fire NOC: No'));
  });
}

test('optional facts are omitted; absent rent has no fabricated currency or unit', () => {
  const root = parseFragment(renderCard({ ...fixture, ceilingHeight: null, numberOfDocks: null, fireCompliance: null, price: null }));
  assert.equal(elements(root, 'li').length, 0);
  assert.equal(elements(root, 'ul').length, 0, 'no empty chip row');
  assert.equal(textOf(elements(root, 'dd')[1]), 'Rent on request');
});

test('zero docks means grade level; one dock uses singular text', () => {
  for (const [count, label] of [[0, 'Grade level only'], [1, '1 Dock']]) {
    const root = parseFragment(renderCard({ ...fixture, numberOfDocks: count }));
    assert.equal(textOf(elements(root, 'li').find(node => attr(node, 'data-spec') === 'docks')), label);
  }
});

test('invalid area excludes the card instead of advertising zero or unknown sqft', () => {
  for (const size of [0, -1, null, undefined, NaN, Infinity]) assert.equal(renderCard({ ...fixture, size }), '');
});

test('single-image cards keep the enquiry action without redundant gallery controls', () => {
  const root = parseFragment(renderCard({ ...fixture, images: [fixture.images[0]] }));
  assert.equal(elements(root, 'button').length, 1);
  assert.equal(textOf(elements(root, 'button')[0]), 'Raise enquiry');
});

test('mapping retains API metadata and does not turn unknown compliance into No', () => {
  const mapped = transformWarehouseData({ id: 1, totalSpaceSqft: [125000], clearHeightFt: '30.5 ft', ratePerSqft: 'Rs. 26.25/- per sft', numberOfDocks: '4 Docks', city: 'Bangalore', state: 'Karnataka', address: 'Address', micromarket: ['Harohalli'], postalCode: '562112', warehouseType: 'PEB', updatedAt: '2026-09-01T00:00:00.000Z', photos: [], fireNocAvailable: null });
  assert.equal(mapped.ceilingHeight, 30.5);
  assert.equal(mapped.price, 26.25);
  assert.equal(mapped.numberOfDocks, 4);
  assert.equal(mapped.fireCompliance, null);
  assert.deepEqual(mapped.micromarket, ['Harohalli']);
  assert.equal(mapped.postalCode, '562112');
  assert.equal(mapped.updatedAt, '2026-09-01T00:00:00.000Z');
});

test('height and dock parsing never concatenates decimals or ranges', () => {
  assert.equal(parseClearHeight('30.5 ft'), 30.5);
  assert.equal(parseClearHeight('30 feet'), 30);
  assert.equal(parseDockCount('4 Docks'), 4);
  assert.equal(parseDockCount('0'), 0);
  for (const value of [null, '', 'N/A', '30-40 ft', '10 m', '-5', 'VDF']) assert.equal(parseClearHeight(value), null);
  for (const value of [null, '', 'N/A', '8-10 docks', '2.5', '-1', 'VDF']) assert.equal(parseDockCount(value), null);
});

test('location falls back through locality, address, pincode and city, and requires a city', () => {
  assert.deepEqual(cardLocation({ city: 'Bangalore', micromarket: ['N/A', 'Harohalli'], address: 'Address' }), { primary: 'Harohalli', city: 'Bengaluru' });
  assert.deepEqual(cardLocation({ city: 'Bengaluru', address: 'Address' }), { primary: 'Address', city: 'Bengaluru' });
  assert.deepEqual(cardLocation({ city: 'Bengaluru', address: 'N/A', postalCode: '562112' }), { primary: '562112', city: 'Bengaluru' });
  assert.deepEqual(cardLocation({ city: 'Bengaluru' }), { primary: 'Bengaluru', city: 'Bengaluru' });
  assert.equal(cardLocation({ city: null, address: 'Address' }), null);
  const root = parseFragment(renderCard({ ...fixture, location: { city: '', state: '' } }));
  assert.equal(attr(elements(root, 'a')[0], 'href'), fixture.href, 'unknown location still has a crawlable property link');
});

test('construction badges use known types without inventing one', () => {
  for (const [raw, label] of [['peb', 'PEB'], ['RCC', 'RCC'], ['Build-to-suit', 'Build to Suit'], ['BTS', 'Build to Suit'], ['Land', 'Open land'], ['PEB + RCC', 'PEB + RCC'], [null, null], ['N/A', null]]) assert.equal(cardConstructionLabel(raw), label);
});

test('the mapped micromarket with the most listings wins, within the warehouse city', () => {
  const markets = [
    { canonical: 'Hoskote', slug: 'hoskote', parentCity: 'Bengaluru', count: 40 },
    { canonical: 'Harohalli', slug: 'harohalli', parentCity: 'Bengaluru', count: 90 },
    { canonical: 'Hoskote', slug: 'hoskote', parentCity: 'Mumbai', count: 900 },
  ];
  for (const micromarket of [['Hoskote', 'Harohalli'], ['harohalli', 'Hoskote']]) {
    assert.deepEqual(cardLocation({ city: 'Bangalore', address: 'Address', micromarket, markets }), { primary: 'Harohalli', city: 'Bengaluru' });
  }
  assert.equal(cardLocation({ city: 'Bengaluru', address: 'Address', micromarket: ['New mapped belt'], markets }).primary, 'New mapped belt', 'a newly mapped tag remains usable before the next counts refresh');
  assert.equal(cardLocation({ city: 'Bengaluru', address: 'Address', micromarket: [], markets }).primary, 'Address');
});

test('update labels use the current visit date, mute old dates and omit missing or future dates', () => {
  const now = Date.parse('2026-09-25T12:00:00Z');
  assert.equal(cardUpdateLabel('2026-08-21T00:00:00Z', now), 'Updated Aug 2026');
  assert.equal(cardUpdateLabel('2025-02-01T00:00:00Z', now), 'Last updated Feb 2025');
  for (const date of [null, '', 'not a date', '2027-01-01']) assert.equal(cardUpdateLabel(date, now), null);
});
