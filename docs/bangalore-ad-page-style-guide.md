# Bangalore ad page style guide

Applies to `/bangalore`, its real CMS preview, and contact dialogs opened from
this page. The source of truth is
[`BangaloreLanding.tokens.css`](../src/pages/BangaloreLanding.tokens.css);
[`BangaloreLanding.css`](../src/pages/BangaloreLanding.css) applies those tokens
to the page and adapts shared components without changing other pages.

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

- Every light card, form, and table: **1px stroke, 12px radius, no shadow**.
  Use the outline role for actionable cards, forms and table frames; the line
  role for benefits, summary cards, image frames and internal dividers.
- Buttons and inputs: **8px radius**. Small fact badges: **4px radius**.
- Filter chips and map bubbles: pill shape. Their shape distinguishes their role.
- Primary buttons: navy fill and ivory text. Secondary buttons: surface fill or
  transparent ivory, thin line, navy text. Hover uses accent navy or the light tint.
- Clickable cards change their border on hover. Informational cards have no
  hover effect. Do not add lift, offset shadows, or a thicker resting outline.
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
phone padding. Forms use 32px desktop and 24px phone padding. Headings have a
24px gap before section content; title-to-copy gaps are 8px.

Inputs and primary form buttons are 48px tall; the prominent desktop hero form
uses the 56px large-control variant. Card CTAs, chips and arrow
controls have a minimum 44px touch target. Multiline labels may grow; never clip
copy or shrink controls below the touch target. Do not size buttons by unrelated
font utilities. Avoid duplicate primary actions inside a card.

## Component and responsive rules

- **Hero:** process steps, featured cards and company logos stay in the left
  column on desktop; the four-field form spans their combined height on the right.
  Align the form and logo strip's bottom edges. The full-width logo strip was
  explicitly reverted. Keep 24px between the left-column groups when the form
  does not need more height. Use the 32px form heading, no eyebrow, 56px desktop
  controls and a balanced description. Field gaps start at 16px; distribute only
  the remaining height. Keep the 1400px content cap so the hero cannot expand
  into excessively tall cards. Below 1024px the form follows the heading, uses
  48px controls and a natural height; phone field gaps are 12px.
- **Featured cards:** compact version of the listing type scale; horizontal track
  with accessible arrow controls. Photo, title, size, specifications, rent.
- **Available listings:** 3 columns on desktop, 2 on tablet. Below 768px, a native
  swipeable row with a visible next-card edge and one scrollable row of size
  chips. Selecting a size starts the listing row at the first card.
- **Micromarkets:** the same photo/gradient/count/title design at every size.
  Always 2 columns × 4 rows. Desktop stays beside the non-sticky map in one fold;
  mobile cards are 168px tall. Cards must never establish their width from an
  aspect ratio or overflow their grid column. Count badges are secondary metadata:
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
- **Site chrome:** retain the shared navbar/footer structure; use the page's
  typography and colors locally. Do not change global listing or city styles.

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
