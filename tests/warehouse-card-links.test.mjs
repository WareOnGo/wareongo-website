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
const { renderCard, renderFeatured } = compiled.exports;

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

test('gallery and enquiry remain independent controls beside the property link', () => {
  const root = parseFragment(renderCard(fixture));
  const buttons = elements(root, 'button');
  assert.ok(buttons.some(button => attr(button, 'aria-label') === 'Previous image'));
  assert.ok(buttons.some(button => attr(button, 'aria-label') === 'Next image'));
  assert.equal(buttons.filter(button => attr(button, 'aria-label')?.startsWith('Go to image ')).length, 2);
  assert.ok(buttons.some(button => textOf(button).includes('Raise Enquiry') && attr(button, 'aria-haspopup') === 'dialog'));
  assertIndependentControls(root);
});

test('a card without photographs still has a crawlable title and enquiry action', () => {
  const root = parseFragment(renderCard({ ...fixture, images: [] }));
  assert.equal(attr(elements(root, 'a')[0], 'href'), fixture.href);
  assert.ok(textOf(root).includes('Images available on request'));
  assert.ok(elements(root, 'button').some(button => textOf(button).includes('Raise Enquiry')));
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
