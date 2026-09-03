import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
    script: "async",
    dirStyle: "nested",
    formatting: "none",
  },
}));
