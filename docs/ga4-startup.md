# GA4 initialization from static HTML

The production build injects an inline bootstrap at the beginning of `body`, after the SSG page title has been parsed. It queues the existing sanitized page context and Google configuration, then starts the asynchronous Google tag download. React, route chunks, and catalogue JSON no longer need to finish before analytics can initialize. The tag keeps its low download priority so fonts and visible images can take precedence.

The bootstrap is bundled from the same analytics source as the application. Both use a document-scoped initialization flag and page context. React updates the resolved metadata without installing another tag or issuing another initial configuration. Untitled SPA fallback documents continue to initialize through PageHead once metadata is available.

## Event ownership and safeguards

- **Keep Enhanced Measurement → Page changes based on browser history events ON.** Google continues to own initial and navigation page views. This change introduces no manual `page_view` events and does not change GA4 account settings.
- Existing custom events retain their names, normalization, page context, and Google queue. Confirmed lead events still depend on successful backend responses and the existing success guard. No sessions or leads are synthesized.
- Production hostname and preview-path gates, URL filtering, parameter allowlists, and lead-origin attribution remain in place. The inline bootstrap is silent on localhost, preview hosts, and `/preview/` paths.
- Queued commands are not proof of delivery. Ad blockers, failed downloads, abrupt exits, and network failures can still prevent collection.
- A navigation occurring before Google's history listener is installed can still be missed. Starting the tag from HTML reduces this window; **this change does not replay those navigations**. Adding manual replay without coordinating automatic history measurement can duplicate page views. `send_page_view: false` alone does not disable Enhanced Measurement history tracking. See [Google's page-view documentation](https://developers.google.com/analytics/devguides/collection/ga4/views).
- React event listeners still attach when React starts. No additional early click listener was introduced, preserving the existing explicit-handler/delegated-handler precedence.

## Validation — 11 October 2026

The baseline was `6a23220`. A production SSG build used the same published editorial content and fixture inventory as the preceding performance verification. All analytics collection requests were intercepted and fulfilled locally, and form submissions were mocked; test traffic did not enter the production GA4 property.

- 20 unit checks cover shared initialization across independent bundles, rendered titles, acquisition context, host/preview gates, URL and parameter filtering, event normalization, and existing transport logging. Run `npm run test:analytics`.
- 19 existing Playwright checks passed across `analytics.spec.ts`, `bangalore-analytics.spec.ts`, and `warehouse-card-enquiry.spec.ts`, including desktop/mobile validation failures, retries, successful leads, request origin, listing/filter events, and delegated click deduplication.
- Seven additional checks loaded Google's real tag against the local production SSG output. Homepage, Bangalore, and listings each sent one page view while the React bundle was held back; releasing React did not add another. A failed overview data request still produced a page view. Home → About → Listings → Back produced four views with correct titles/referrers and one session-start flag. A successful enquiry queued before the tag downloaded produced one lead and one initial page view. The production preview path stayed silent.
- Application and Vite configuration TypeScript checks, focused ESLint, and the isolated production SSG build passed.
- Homepage, Bangalore, listings, and overview rendered body markup was identical to the baseline after removing scripts and surrounding whitespace. No styles, content, layout, or form behavior changed. Compressed HTML increased by approximately 2.7 KiB per checked page.

Three paired runs per page used a cold browser cache, a local HTTPS origin, 150 ms latency, 1.6 Mbps download, and 4× CPU throttling. These are controlled browser timings, not Lighthouse scores or production field measurements:

| Median | Homepage before → after | Bangalore before → after |
| --- | --- | --- |
| GA configuration queued | 2.860 s → 0.260 s | 3.416 s → 0.269 s |
| First outgoing page-view request | 4.633 s → 3.556 s | 5.263 s → 3.909 s |
| First contentful paint | 0.456 s → 0.484 s | 0.528 s → 0.532 s |
| CLS | 0.0016 → 0.0016 | 0.0707 → 0.0707 |

The small paint differences were within the observed run ranges. A separate normal-priority experiment gave no clear page-view timing advantage, so low priority was retained. No guarantee is made that every short visit will be collected. The browser checks verify attempted outgoing payloads and counts, not ingestion or reporting inside GA4.
