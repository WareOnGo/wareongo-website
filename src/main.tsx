import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import { claimReloadAttempt } from "./lib/staleDeployReload";
import "./index.css";

// Lazy route chunks are content-hashed per build, and Vercel only serves the
// current deployment's files. A document that outlived its deploy asks for a
// chunk that's now a 404 — "error loading dynamically imported module" — which
// on initial hydration is thrown by vite-react-ssg outside React entirely, so no
// error boundary can catch it. Vite fires this event for exactly that case.
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    // Only swallow the error if we're actually reloading. Suppressing it after
    // the guard has been spent would leave the page hanging with nothing
    // rendered and nothing thrown; better to let it surface.
    if (!claimReloadAttempt(`preload:${window.location.pathname}`)) {
      console.error("Chunk load failed again after a reload; surfacing the error.");
      return;
    }
    event.preventDefault();
    window.location.reload();
  });
}

// On client-side navigation, vite-react-ssg fetches
// `/static-loader-data-manifest-${window.__VITE_REACT_SSG_HASH__}.json` and calls
// .json() on it without checking res.ok. It picks that hash at random on every
// build and inlines it into each prerendered page, so a page served from a cache
// older than the current deploy asks for a manifest that no longer exists, gets
// the HTML 404 page back, and throws
// `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` inside the loader.
//
// Pin it to the stable copy published by scripts/stabilize-loader-data.mjs, which
// is always the current deploy's manifest. Defined as an accessor rather than
// assigned because the entry bundle is `type="module" async` while the inline
// hash assignment sits at the end of <body> — either can run first, and a plain
// assignment would lose the race half the time. Keep in sync with
// STABLE_MANIFEST_HASH in that script.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "__VITE_REACT_SSG_HASH__", {
    get: () => "stable",
    set: () => {}, // swallow the inline script's write instead of throwing
    configurable: true,
  });
}

export const createRoot = ViteReactSSG({ routes });
