# Bangalore ad page style guide

Applies to `/bangalore`, its real CMS preview, and contact dialogs opened from
this page. The shared visual roles now live in
[`ui.tokens.css`](../src/styles/ui.tokens.css).
[`BangaloreLanding.tokens.css`](../src/pages/BangaloreLanding.tokens.css) aliases
them and retains the ad page's exceptions; [`BangaloreLanding.css`](../src/pages/BangaloreLanding.css)
owns its layout. See the [shared UI guide](ui-standard.md) for the website-wide
implementation.

Open the [visual guide](bangalore-ad-page-style-guide.html) through the website's
dev server at `/docs/bangalore-ad-page-style-guide.html` to review the real
tokens and component styles together.

## Palette

| Role | Color | Use |
| --- | --- | --- |
| Ink | `#0A2239` | Headings, primary buttons, dark sections |
| Accent | `#173E5A` | Links, icons, active and hover states |
| Page | `#FAF9F5` | Light ivory background |
| Surface | `#FFFEFA` | Cards, form fields, dialogs |
| Secondary text | `#47515B` | Descriptions, labels, metadata |
| Tint | `#EDF2F7` | Icon tiles and quiet interaction feedback |
| Line | `#D5DDE5` | Dividers and informational card outlines |
| Outline | `#AEBDCA` | Actionable cards, forms, controls and table frames |
| Inverse secondary | `#D5DDE5` | Supporting text on navy |

Keep the pale ivory surface difference: the page is slightly warmer than the
cards. Slightly darker outlines define actionable cards and controls; internal
dividers and informational cards stay quieter. Use color, never added stroke
weight or shadows, to create this distinction.

Tables retain neutral ivory headers (`#F3F2EE`) and subtle alternating rows
(`#FCFBF8`), with the darker frame and softer row rules. Row hover uses the same
light blue tint as navbar menu hover (`#EDF2F7`). Rust is reserved for form
errors. Green, purple, arbitrary blue variants, and opacity-reduced body text
are not part of this page's decorative palette.

## Typography

Montserrat throughout, including fields and portaled dialogs. Use 400 for prose,
500 for labels and secondary table headings, 600 for titles and controls, and
700 only for the hero. Do not use synthetic bold.

| Role | Desktop | Phone, below 768px | Weight / leading |
| --- | --- | --- | --- |
| Hero | Fluid 38–52px | Fluid 30–40px | 700 / 1.12 |
| Section heading | 32px | 24px | 600 / 1.25 |
| Hero form heading | 32px | 24px | 600 / 1.25 |
| Dialog heading | 24px | 24px | 600 / 1.25 |
| Card title | 18px | 16px | 600 / 1.4 |
| Compact listing / photo-card title | 16px | 14px | 600 / 1.4 |
| Main prose and inputs | 16px | 16px | 400 / 1.6 |
| Card descriptions | 14px | 14px; 12px in two-column cards | 400 / 1.6 |
| Control labels | 14px | 14px; 12px in compact cards and chips | 600 / 1.5 |
| Metadata, captions, table headers | 12px | 12px | 400–600 / 1.5 |
| Main figures | 24px | 20px | 600 / 1.25 |
| Featured-card figures | 18px | 18px | 600 / 1.5 |

The phone's two-column benefit and service cards use 14px titles. Section
headings use `-.025em` tracking; card titles and body copy use normal tracking.
Eyebrows alone are uppercase, 12px/600 with `.1em` tracking. Preserve the written
case of form labels. Use tabular numerals for prices, areas, counts, and table data.

## Borders, corners, icons, and states

- Every light card, form, and table: **1px stroke and 12px radius**.
  Listing cards use the original navy stroke, 2px navy hard shadow and sinking hover;
  other cards, forms and tables remain flat.
  Use the outline role for other actionable cards, forms and table frames; the line
  role for benefits, summary cards, image frames and internal dividers.
- Buttons and inputs: **8px radius**. Small fact badges: **4px radius**.
- Filter chips and map bubbles: pill shape. Their shape distinguishes their role.
- Primary buttons: navy fill and ivory text. Secondary buttons: surface fill or
  transparent ivory, thin line, navy text. Hover uses accent navy or the light tint.
- Clickable cards change their border on hover. Informational cards have no
  hover effect. Listing cards alone retain their navy stroke, press down 2px,
  reduce their navy hard shadow to 1px and warm the fill to `#F6F4EE` on pointer
  hover, using the original 180ms ease-out. Reduced motion suppresses movement.
  Do not add lift, heavy shadows, or a thicker resting outline.
- Keyboard focus: a visible **2px accent ring**. On photo or navy backgrounds,
  use an ivory ring. A selected map bubble uses navy fill and an ivory count.
  Focused inputs also use the accent outline in both the hero and dialogs.
- Lucide icons: **1.5px strokes**, 20px in icon tiles and 16px in controls.
  Tiles are 40px desktop / 32px phone with an 8px radius and the light blue tint.
- Motion: 160ms for color changes; respect reduced-motion preferences.

## Spacing and controls

Use the 4px rhythm: 4, 8, 12, 16, 20, 24, 32, 48, 64. Page content caps at
1400px with 32px desktop gutters and 20px phone gutters. Sections use 64px
desktop / 48px phone spacing; nested card grids use 16px / 12px gaps.

Regular content cards use 24px padding. Compact cards use 16px desktop and 12px
phone padding. The hero form uses 20px vertical and 24px horizontal padding;
dialogs use 32px desktop and 24px phone padding. Headings have a 24px gap before
section content; title-to-copy gaps are 8px.

Inputs and primary form buttons are 48px tall, including the hero form.
Card CTAs, chips and arrow
controls have a minimum 44px touch target. Multiline labels may grow; never clip
copy or shrink controls below the touch target. Do not size buttons by unrelated
font utilities. Avoid duplicate primary actions inside a card.

## Component and responsive rules

- **Hero:** the heading and featured cards stay in the left column on desktop;
  the four-field form stretches on the right to align its bottom with the
  featured cards. Distribute the added height between form fields. The company logo
  carousel spans the full content width beneath both columns, with the heading
  “Trusted by 200+ Companies across India” above the logos on every screen size.
  There is no process-step strip. Keep 24px between hero groups and the 1400px
  content cap. Use a 28px form heading (22px on phones), no eyebrow, a 14px
  description, 48px controls and 16px input text. Field gaps are 12px with 4px
  between labels and inputs. Below 1024px the form follows the heading at its
  natural height; below 768px, the client carousel follows the form and comes
  before the featured cards.
- **Featured cards:** compact version of the listing type scale; horizontal track
  with accessible arrow controls. Photo, title, size, specifications, rent.
- **Available listings:** use “Warehouses and Godowns in Bangalore” with no
  eyebrow. Keep 3 columns on desktop and 2 on tablet. Hide the entire
  section below 768px, including its heading, size filters, cards and footer.
- **Micromarkets:** the same photo/gradient/count/title design at every size.
  Use 2 columns × 4 rows on tablet and desktop; desktop stays beside the
  non-sticky map in one fold. Below 768px, place the cards in one horizontally
  scrolling row beneath the map, with native swipe, snap points and a visible
  next-card edge. Mobile cards are 168px tall and up to 240px wide. Cards must
  never establish their width from an aspect ratio or overflow their grid column.
  Count badges are secondary metadata:
  12px/500 muted text, 3px × 6px padding, no border, and 90% surface ivory
  (`--landing-badge-surface`). Keep map labels more prominent as interactive controls.
- **Area guide:** visible on tablet and desktop; hidden below 768px.
- **Benefits:** image plus six cards on desktop. On phones, hide the image and
  keep 2 columns × 3 rows. Future copy can grow the rows; it is not truncated.
- **Services:** 2 columns × 2 rows, including phones. Keep bottom-aligned CTAs.
- **Audiences:** match the service-card surface, copy, title and control styles.
- **Statistics:** neutral table surfaces, right-aligned numerical columns, and
  the same title, label, metric, stroke and corner roles used above. Wide tables
  scroll inside their panels on phones.
- **Dialogs:** the compact 24px heading role, with the same field, label and button styles as the hero form.
  Keep focus trapping, close controls, validation and focus restoration intact.
- **Site chrome:** retain the shared navbar/footer structure and visual roles.
  Keep ad-page layout adaptations local; shared listing and city components
  now consume the same standard at their source.

## Maintaining the guide

Use an existing role before adding a new size or color. Change the token once
instead of stacking breakpoint overrides. The CMS uses the real page renderer,
so it must match without maintaining a second style implementation.

Review at 320px, 390px, 768px, 1024px, 1440px and 1920px. Check wrapped copy,
native swiping, the 2×4/2×3/2×2 grids, image loading, keyboard focus, modal
triggers, table overflow and the real CMS preview. A fresh-load check alone is
not enough during development: verify the running page after a full refresh.

Also check the production page before JavaScript loads. The Bangalore and
preview routes declare their `entry` files in `src/routes.tsx` so the static
build discovers the page's CSS and inlines the initial layout. The `lazyDefault`
wrapper hides that dependency from automatic detection; removing `entry`
causes an unstyled first paint and a large layout jump at hydration. Verify a
cold load with the entry script delayed, not only a settled screenshot.
