# CMS legal pages

Privacy Policy and Terms of Service retain their existing routes and layouts.
`scripts/generate-legal-pages.mjs` reads the approved content from the backend's
`GET /legal-pages` endpoint during `build` and `build:dev`. The resulting module
is committed for local development and replaced on every SSG build.

Drafts are never returned by this endpoint. Both policies must be present and
valid before the generated file is replaced. Failures stop deployment, keeping
the previously deployed site intact. There is no client-side content fetch.

Deployment order: backend legal-page SQL, backend deployment, then CMS and
website deployments. The SQL was applied and verified on production on
11 September 2026. No new environment variables are required.

See the CMS repo's `docs/legal-pages.md` for the editor workflow, schema ownership
and eval instructions. This increment does not change homepage, About Us,
site settings, case studies, or inventory pages.
