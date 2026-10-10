import { build } from 'esbuild';

/** Inline a small, independently bundled entry into every built document. */
export function analyticsBootstrapPlugin() {
  let root;
  let production;
  let bundled;
  return {
    name: 'wareongo-analytics-bootstrap',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      production = config.isProduction;
    },
    transformIndexHtml: {
      order: 'post',
      async handler() {
        if (!production) return [];
        bundled ||= build({
          absWorkingDir: root,
          entryPoints: ['src/lib/analyticsBootstrap.ts'],
          bundle: true, write: false, format: 'iife', platform: 'browser',
          target: 'es2020', minify: true,
          define: { 'import.meta.env.PROD': 'true', 'import.meta.env.DEV': 'false' },
        });
        const result = await bundled;
        // At the start of body, PageHead's SSG title has already been parsed.
        // The same insertion is retained by SSG and paginated catalogue pages.
        return [{ tag: 'script', attrs: { id: 'wareongo-analytics-bootstrap' },
          children: result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script'), injectTo: 'body-prepend' }];
      },
    },
  };
}
