import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const compiled = await build({
  stdin: { resolveDir: process.cwd(), contents: `
    import React from 'react';
    import { renderToString } from 'react-dom/server';
    import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
    import RouteErrorBoundary from './src/components/RouteErrorBoundary';
    export async function prerender() {
      const routes = [{ path: '/listings/city/test', element: React.createElement('p', null, 'Listings'),
        errorElement: React.createElement(RouteErrorBoundary),
        loader: () => { throw new Error('Fixture filtered API unavailable'); } }];
      const handler = createStaticHandler(routes);
      const context = await handler.query(new Request('https://fixture.invalid/listings/city/test'));
      const router = createStaticRouter(handler.dataRoutes, context);
      return renderToString(React.createElement(StaticRouterProvider, { router, context }));
    }`,
  },
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
  define: { 'import.meta.env': JSON.stringify({ SSR: true }) },
  plugins: [{ name: 'unused-error-page-layout', setup(build) {
    // The test exercises the real router, error boundary and SSR renderer.
    // Layout components are irrelevant to whether a failed route is published.
    build.onResolve({ filter: /^@\/components\/(Navbar|Footer|PageHead)$/ }, args => ({ path: args.path, namespace: 'layout' }));
    build.onLoad({ filter: /.*/, namespace: 'layout' }, () => ({ contents: 'export default () => null;' }));
  } }],
});
const module = { exports: {} };
new Function('module', 'exports', 'require', compiled.outputFiles[0].text)(module, module.exports, createRequire(import.meta.url));

test('an API failure caught by the route boundary still fails prerendering instead of publishing an error page', async () => {
  await assert.rejects(module.exports.prerender(), /Fixture filtered API unavailable/);
});
