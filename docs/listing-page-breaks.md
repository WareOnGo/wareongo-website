# Listing page breaks

Variant 1 is shared by `/listings` and the city, state, type and micromarket
listing routes through `ListingsView`.

| Break | Desktop / tablet | Phone |
| --- | --- | --- |
| Inline shortlist | After row 4 | After card 4 |
| Micromarket strip | After row 8 | After card 8 |
| Advisor callback | After row 12 | After card 12 |

Positions count rows of visible, unique cards from the first loaded batch,
including direct page links. Each batch starts a new grid, so a partial final
row counts as one row. On desktop with the default 21-card batches, the breaks
follow cards 12, 24 and 36. Appending results does not repeat the breaks. Short
result sets only show breaks whose rows they reach. Changing applied filters
resets the forms; drafts, pending submissions and confirmations survive viewport
changes, even when a break moves between batches.

The components use the shared paper/surface/ink palette, card typography,
12px corners, 8px field corners and 48px controls. The shortlist and callback
are compact horizontal rows on desktop. CSS limits the location strip to three
links on tablets, four on smaller desktops and five from 1280px, without arrows
or scrolling. Long labels use ellipsis while retaining their full accessible
name and title. It scrolls locally on phones, with counts from the micromarkets endpoint. Counts
describe all listings in that location; links retain the user's non-location
refinements and attribution. The stylesheet is included in the main CSS entry
so every listing route receives its styles before hydration.

`SHORTLIST_HOURS` supplies the existing four-hour promise. Callback copy does
not introduce a new response-time commitment. No fixed number of matches is
promised.

## Form integration

`submitListingEnquiry` posts to the existing `/customer-requests` endpoint.
The companion backend change accepts two compact form sources:

- `listing-shortlist`: requires name, phone and a positive whole area in sqft.
- `listing-advisor-callback`: requires phone only.

The backend constructs and saves the requirements, including source, area and
search filters, before invoking the existing CRM, email and Sheets destinations.
Uncollected names remain empty and uncollected companies remain null. Existing
request-form requirements are unchanged. No schema migration is required.

Deploy the backend change before, or together with, the website. An older backend
will reject compact submissions because it requires company details. Errors stay
inline and preserve the entered values. Tests intercept submissions and mock the
lead destinations; they do not send real leads or verify production delivery.

## Verification

In `wareongo-evals`:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome \
  npx playwright test --config=playwright.listing-breaks.config.ts
```

This runs placement, 320–1440px layout, input readability, native-link,
submission/retry, analytics privacy, resize and existing infinite-scroll checks.
Screenshots include all three breaks and the surrounding listing cards.

In the website: `tsc -p tsconfig.app.json --noEmit`, focused ESLint,
`npm run test:listing-url`, `npm run test:lead-submissions`, and `npm run build:spa`.
In the backend:

```sh
node --test tests/listing-enquiry.test.js tests/crm-lead-flow.test.js tests/enquiry-company.test.js
```
