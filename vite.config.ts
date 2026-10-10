import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { ViteReactSSGOptions } from 'vite-react-ssg';
import { createCatalogueBuild } from './scripts/lib/catalogue-build.mjs';
import { createCriticalCssProcessor, prioritizeAdPageHtml } from './scripts/lib/critical-css.mjs';

const processCriticalCss = createCriticalCssProcessor();
const catalogueBuild = createCatalogueBuild({ processCss: processCriticalCss });

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: mode === "production" ? { drop: ["console", "debugger"] } : undefined,
  define: {
    // True only under `vite dev`. Deliberately not `import.meta.env.DEV`, which
    // is also true for `build:dev` (--mode development) — so anything guarded by
    // this is statically false in *every* build, and Rollup drops the branch and
    // tree-shakes whatever it referenced out of the bundle entirely.
    //
    // Used by src/data/micromarkets.dev.ts, the local placeholder content for
    // the micromarket editorial template.
    __DEV_SERVER__: JSON.stringify(command === "serve"),
  },
  ssgOptions: {
    onPageRendered: async (route, html, context) => {
      const rendered = await catalogueBuild.onPageRendered(route, html, context) || html;
      // The ad page is already rendered in HTML. Let its font and visible images
      // win bandwidth, and finish parsing the document before hydration runs.
      return processCriticalCss(prioritizeAdPageHtml(route, rendered));
    },
    onFinished: catalogueBuild.onFinished,
    // Each warehouse render reads details and specifications from the backend.
    // Keep build traffic within its small shared Supabase connection budget.
    concurrency: 5,
    script: "async",
    dirStyle: "nested",
    formatting: "none",
    // CSS extraction above shares the catalogue queue. SSG's independent
    // Beasties instance would race it and lose page-specific layout rules.
    beastiesOptions: false,
  } satisfies Partial<ViteReactSSGOptions>,
}));
