# WareOnGo shared UI standard

The approved Bangalore design now supplies the website's shared visual roles.
Page composition and content remain local: the homepage can retain its photo
hero, an article can keep its reading column, and searchable listings remain a
vertical grid on phones.

## Source of truth

- [`ui.tokens.css`](../src/styles/ui.tokens.css): colors, typography, spacing,
  corners, controls, icons and responsive values.
- [`ui.css`](../src/styles/ui.css): reusable presentation classes. Imported by
  `src/index.css` inside Tailwind's base/component layers; utility classes can
  deliberately adapt layout without specificity overrides.
- `tailwind.config.ts`: `ui.*` color utilities, legacy `wareongo.blue/ivory/slate`
  aliases, and shared corner values. RGB tokens support opacity utilities.
- `BangaloreLanding.tokens.css`: aliases the shared roles, keeping only the
  ad page's additional treatments and responsive exceptions. Its layout CSS
  stays scoped to the page and its portaled dialog.

Use the [Bangalore visual guide](bangalore-ad-page-style-guide.html) for specimens
and its [page guide](bangalore-ad-page-style-guide.md) for the specific hero,
micromarket and mobile layouts. The wider resumption brief is stored outside
the Git repositories in `../WAREONGO_UI_STYLE_HANDOFF.md`.

## Palette and surfaces

| Role | Value | Usage |
| --- | --- | --- |
| Paper | `#FAF9F5` | Page background |
| Surface | `#FFFEFA` | Cards, fields, dialogs |
| Ink | `#0A2239` | Headings, body text, primary controls |
| Accent | `#173E5A` | Links, icons, active borders |
| Muted | `#0A2239` | Supporting text, labels and metadata; aliases ink |
| Placeholder | `#47515B` | Form placeholders and loading placeholders |
| Tint | `#EDF2F7` | Menu/table hover and icon backgrounds |
| Line | `#D5DDE5` | Inner dividers and informational cards |
| Outline | `#AEBDCA` | Interactive cards, fields, panel frames |

Cards use a 1px border and 12px corners, with no offset shadows or hover movement.
Listing cards use the standard outline (`#AEBDCA`). Pointer hover changes the
border to accent navy and the fill to a soft darker ivory (`#F6F4EE`), using the
shared 160ms color transition. Reduced motion removes the transition; touch
screens retain their resting colors. Loading cards use the same flat outline.
Controls use 8px corners; small badges use 4px. Pills remain appropriate
for filters. Informational cards have no whole-card interaction feedback.
Navy surfaces use ivory text and line-colored secondary text. Status/error
colors remain functional exceptions; brand assets keep their own artwork.
Keep text on light surfaces opaque and use weight and size for hierarchy.
Form placeholders use `--ui-placeholder` / `placeholder:text-ui-placeholder`
so labels, entered values and supporting copy retain the dark ink color.

## Typography and classes

Montserrat uses real font weights, with font synthesis disabled.

Use title case for page, section, form, and card headings, including blog and
case-study headings. Keep articles, conjunctions, and prepositions lowercase
inside a heading. Preserve brands, acronyms, and units (WareOnGo, 3PLs, PEB,
Grade A, sqft, kVA). Body copy, FAQ questions, helper text, and buttons retain
their written sentence case. CMS editorial headings use `normalizeHeadingCase`
before rendering and structured-data generation; avoid CSS `capitalize`.

| Class | Desktop | Phone below 768px |
| --- | --- | --- |
| `ui-page-title` | 38–52px fluid, 700 | 30–40px fluid, 700 |
| `ui-section-title` | 32px, 600 | 24px, 600 |
| `ui-panel-title` | 24px, 600 | 24px, 600 |
| `ui-card-title` | 18px, 600 | 16px, 600 |
| `ui-metric` | 24px, 600, tabular | 20px, 600, tabular |
| `ui-prose` | 16px / 1.6, 400 | Same |
| `ui-label` | 14px / 1.5, 500 | Same |
| `ui-eyebrow` | 12px / 1.5, 600, uppercase | Same |

Compact descriptions use 14px; metadata uses 12px. Keep inputs at 16px on
phones. Compact listing figures may use 18px; Bangalore's hero uses 14px
figures and 12px titles on desktop, with 16px figures and 14px titles below
1024px. Its metadata/button labels stay at 12px. Do not apply a card-title class
to navigation group labels: navigation owns its compact 14px hierarchy.
Labels preserve written case; uppercase tracking is reserved for eyebrows.

## Component usage

| Class or component | Contract |
| --- | --- |
| `ui-card` / `Card` | Surface with soft line; supply appropriate padding |
| `ui-card ui-card--action` | A real link/button card with stronger outline and border hover |
| `ui-listing-card` | Flat outline with border/fill color feedback on pointer hover; combine with the listing component |
| `ui-listing-placeholder` | Same resting listing outline, without hover feedback |
| `ui-panel` | Stronger framed form/table/panel; no implied clickability |
| `ui-icon` | 40px desktop / 32px phone tile, 20px icon, 1.5px stroke |
| `ui-button` | Navy primary action, 48px minimum height, 14px/600 |
| `ui-button--secondary` | Surface action with outline and pale blue hover |
| `ui-button--inverse` | Ivory action on navy |
| `ui-button--on-dark` | Outlined action on navy |
| `ui-button--compact` | 44px minimum; use with `ui-button` |
| `ui-field` / `Input` / `Textarea` | Surface, defined border, block layout, 16px type |
| `ui-table` | Neutral header/stripes, blue row hover, soft dividers, tabular figures |

Retain the real DOM semantics, destinations, secondary actions, labels,
validation and focus behavior. A styled `div` is not an interactive card.
The existing Radix primitives still own focus trapping, portals and scroll
locking. Shared tokens are at `:root`, so portaled controls inherit them.

## Responsive layout

- General sections use 64px vertical spacing on desktop and 48px on phones;
  gutters are 32px/20px. `.section-container` allows 1400px of content plus its
  gutters. Existing narrow articles/forms stay narrow. The navbar retains its
  independent 1600px cap and existing desktop breakpoint. Its restored 1px
  outline uses the lighter `--ui-line`; adjusted inner padding preserves header height.
- Use 24px standard card padding and 16px/12px for compact cards. Keep title,
  copy and action spacing on the 4px rhythm.
- Fields and primary controls are 48px tall. The Bangalore desktop form keeps
  its intentional 56px variant. Compact controls are at least 44px and may
  grow to accommodate wrapping.
- Keep wide tables inside scrollable regions. Corridor comparisons retain
  their 700px minimum width; specification comparisons retain 480px. Never
  squeeze six columns into unreadable phone-sized cells.
- Grid children need `min-width: 0`. Long chart labels can wrap. Preserve image
  aspect ratios and intrinsic dimensions to avoid loading jumps.
- Loading cards use the same flat outline, photo ratio, and control height
  as their loaded counterparts. Use `ui-listing-placeholder` to retain the
  resting frame without making a placeholder respond to hover. The darker
  ivory loading-fill experiment was rejected; retain the previous skeleton
  and image-loading colors.
- The main listings, city and micromarket search pages remain vertical grids.
  Bangalore's compact featured listing cards use three columns from 768px and
  a carousel on phones. The existing homepage featured track retains its carousel.
- The Bangalore page uses a horizontal micromarket track on phones, with static
  two-column benefit and service grids. Benefits keep the full approved copy, 14px titles
  and 12px descriptions on phones; informational reading must not require
  horizontal scrolling. These layouts and its hidden mobile
  image/area-guide rules remain local.
  Service cards use separate concise mobile headings and descriptions below
  768px, while desktop shows the detailed copy. CTA actions remain shared.
- Use visible 2px focus rings and respect reduced motion. A mobile width change
  can move the browser's scroll anchor; interaction tests should scroll from
  the resulting position when checking scroll direction.

## Coverage and verification

Shared roles are applied to the homepage sections, listings and detail cards,
city/state/micromarket templates, articles, case studies, services, About,
request forms, legal pages, account/error shells, navbar/footer and dialogs.
The CMS now mirrors these tokens and presentation styles in its own versioned
`styles/` directory, with Tailwind 4 aliases and the Next font variable. Its
admin controls use the same palette, type and outline roles. Blog, service,
legal and editorial previews render at real 1440px/390px iframe widths; the
ad-page preview continues to use the actual website renderer. See the sibling
CMS `docs/ui-standard.md` and `scripts/sync-ui-styles.mjs` for upkeep. The
backend is unchanged.

The sibling `wareongo-evals` harness owns the browser checks and artifacts:

```sh
npx playwright test --config=playwright.ui-standard.config.ts
node tests/support/check-ui-standard-build.mjs
```

The first command checks 19 page types at 320, 390, 834 and 1440px, plus mobile
enquiry/filter interactions. It captures screenshots and checks overflow,
font size, card treatment and control height. The production helper copies
the website to `/tmp`, uses a read-only fixture API, prerenders 17 routes and
compares initial/hydrated headings at 390 and 1440px on five page families.
It also checks Bangalore and preview `noindex`. It does not publish assets,
submit leads, call a deploy hook or mutate live content.

Navigation, contrast, enquiry submission, gallery swiping and native-link
regressions are covered by the existing harness suites. Fixtures demonstrate
renderer behavior; they do not validate the live catalogue or CMS database.
Review screenshots as well as assertions, and retain the explicit Bangalore
route `entry` fields required for correct initial CSS discovery.
