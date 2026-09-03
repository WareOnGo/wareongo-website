/// <reference types="vite/client" />

/**
 * True only when running under `vite dev` — statically `false` in every build,
 * including `build:dev`. Defined in vite.config.ts.
 *
 * Guarding a value with this is how dev-only fixtures stay out of the shipped
 * bundle: Rollup evaluates the branch away and tree-shakes the module it came
 * from, so the fixture can't reach production even by accident.
 */
declare const __DEV_SERVER__: boolean;
