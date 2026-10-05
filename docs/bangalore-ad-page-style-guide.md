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
| Ink | `#0A2239` | Headings, body text, primary buttons, dark sections |
| Accent | `#173E5A` | Links, icons, active and hover states |
| Page | `#FAF9F5` | Light ivory background |
| Surface | `#FFFEFA` | Cards, form fields, dialogs |
| Secondary text | `#0A2239` | Descriptions, labels, metadata; shares ink |
| Placeholder | `#47515B` | Form placeholders |
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
700 for the hero and trust line. Do not use synthetic bold.

Use title case for page, section, form, and card headings: “Find Your
Warehouse”, “Featured Warehouses”, and “Our Services”. Capitalize the major
words; keep articles, conjunctions, and prepositions such as “a”, “the”,
“and”, “for”, “in”, and “to” lowercase within a heading. Preserve WareOnGo,
3PLs, PEB, and units such as sqft. Descriptions, helper text, FAQ questions,
and button copy stay in their written sentence case. Use authored text,
not CSS `capitalize`, so the wording is consistent for every reader. CMS
headings also pass through `normalizeHeadingCase` when the page renders.

| Role | Desktop | Phone, below 768px | Weight / leading |
| --- | --- | --- | --- |
| Hero | Fluid 38–52px | Fluid 30–32px | 700 / 1.12 |
| Section heading | 32px | 20px | 600 / 1.25 |
| Featured section heading | 14px | 20px | 600 / 1.25 |
| Hero form heading | 28px | 20px | 600 / 1.25 |
| Dialog heading | 24px | 20px | 600 / 1.25 |
| Card title | 18px | 14px | 600 / 1.4 |
| Compact listing / photo-card title | 16px | 14px | 600 / 1.4 |
| Featured-card title | 12px | 14px | 600 / 1.5 |
| Main prose | 16px | 14px | 400 / 1.6 |
| Form inputs | 16px | 16px | 400 / 1.6 |
| Card descriptions | 14px | 14px; 12px in two-column cards | 400 / 1.6 |
| Control labels | 14px | 12px | 600 / 1.5 |
| Trust line | 16px | 14px | 700 / 1.5 |
| Metadata, captions, table headers | 12px | 12px | 400–600 / 1.5 |
| Main figures | 24px | 20px | 600 / 1.25 |
| Company proof metrics | 32px | 20px | 600 / 1.25 |
| Featured-card figures | 14px | 16px | 600 / 1.25 |

Keep the phone scale in `BangaloreLanding.tokens.css`: 20px for section,
form and dialog headings; 14px for card titles and regular prose; 12px for
compact descriptions, labels, buttons and metadata. Compact benefit/service
copy uses 1.5 leading; regular prose uses 1.6. Keep inputs at 16px and compact
listing figures at 16px. Proof and market figures use 20px at every phone width.
Use `--landing-text-body` and `--landing-text-control` for those roles instead
of redefining type tokens inside individual sections.

Section headings use `-.025em` tracking; card titles and body copy use normal
tracking. Eyebrows are uppercase, 12px/600 with `.1em` tracking. The trust line
retains its uppercase bold treatment, with 14px text and `.1em` tracking on phones.
Preserve the written case of form labels. Use tabular numerals for prices,
areas, counts, and table data. Let copy wrap at word boundaries; balance short
headings and service copy, and use pretty wrapping for longer paragraphs.
Do not add manual line breaks, clamp prose, force full sentences onto one line,
or shrink typography for an individual card.

## Borders, corners, icons, and states

- Every light card, form, and table: **1px stroke and 12px radius**.
  All cards remain flat, including listings and loading placeholders.
  Use the outline role for actionable cards, forms and table frames; the line
  role for benefits, summary cards, image frames and internal dividers.
- Buttons and inputs: **8px radius**. Small fact badges: **4px radius**.
- Filter chips use a pill shape. Desktop map chips use the same 12px corners and ivory
  surface as their expanded photo cards; compact mobile name labels use 6px corners.
- Primary buttons: navy fill and ivory text. Secondary buttons: surface fill or
  transparent ivory, thin line, navy text. Hover uses accent navy or the light tint.
- Clickable cards change their border on hover. Informational cards have no
  hover effect. Listing cards change from the standard outline to accent navy
  and fill with soft darker ivory (`#F6F4EE`) on pointer hover. Use the shared 160ms color
  transition and disable it for reduced motion. Do not add lift, sinking,
  shadows or a thicker stroke.
- Keyboard focus: a visible **2px accent ring**. On photo or navy backgrounds,
  use an ivory ring. A map bubble expands into an in-map photo card on hover,
  keyboard focus, or tap, keeping the focus ring visible around the preview.
  Focused inputs also use the accent outline in both the hero and dialogs.
- Lucide icons: **1.5px strokes**, 20px in icon tiles and 16px in controls.
  Tiles are 40px desktop / 32px phone with an 8px radius and the light blue tint.
- Motion: 160ms for color changes. Map chips morph into cards over 280ms with
  a gentle ease-out, a 100ms hover intent delay, and a 140ms leave grace period.
  Respect reduced-motion preferences; do not scale text or add bounce.

## Spacing and controls

Use the 4px rhythm: 4, 8, 12, 16, 20, 24, 32, 48, 64. Page content caps at
1400px with 32px desktop gutters and 20px phone gutters. Major sections use
one 64px desktop / 48px phone gap, owned by `.bangalore-landing__main`.
Do not add section margins or outer vertical padding that stacks with this gap.
Hidden mobile sections contribute no space. The main's bottom padding uses the
same value before the footer. The navy request banner retains its own internal
padding. Nested card grids use 16px / 12px gaps.

Regular content cards use 24px padding. Compact cards use 16px desktop and 12px
phone padding. The hero form uses 20px vertical and 24px horizontal padding,
reduced to 16px on phones;
dialogs use 32px desktop and 24px phone padding. Headings have a 24px gap before
section content; title-to-copy gaps are 8px.

Inputs and primary form buttons are 48px tall. The mobile hero form uses 44px
inputs and a 44px submit button, with 16px input text.
Card CTAs, chips and arrow
controls have a minimum 44px touch target. Multiline labels may grow; never clip
copy or shrink controls below the touch target. Do not size buttons by unrelated
font utilities. Avoid duplicate primary actions inside a card.

## Component and responsive rules

- **Hero:** use “Warehouses for Rent in Bangalore” with no trailing period.
  The heading and featured cards stay in the left column on desktop;
  the four-field form stretches on the right to align its bottom with the
  featured cards. Distribute the added height between form fields. The company logo
  carousel spans the full content width beneath both columns, with the heading
  “Trusted by 200+ Companies across India” above the logos on every screen size.
  On desktop, match the homepage trust line: 16px Montserrat, weight 700,
  uppercase, 0.2em letter spacing and ink colour. Phones use the shared 14px
  role with 0.1em tracking. Keep 16px below it for the logo carousel.
  There is no process-step strip. Keep 24px between hero groups and the 1400px
  content cap. Use a 28px form heading, no eyebrow, a 14px description,
  48px controls and 16px input text. Field gaps are 12px with 4px between labels
  and inputs. Below 768px, use a 20px heading, 12px description and labels,
  8px field gaps, and 44px controls to bring the client carousel higher.
  Keep input text at 16px. Below 1024px the form follows the heading at its
  natural height. The benefits section sits outside the hero grid and follows
  the client carousel on desktop, using the shared gap between major sections.
  Below 768px, the order is heading, form, client logos, featured cards, then
  benefits.
- **Featured cards:** reuse `WarehouseCard` with compact 12px padding. From
  1024px, use 14px figures and 12px locality titles; smaller screens retain
  16px figures and 14px titles. Metadata/button labels stay at 12px. Keep a 44px “Get details”
  touch target and the standard photo/type badge,
  labeled area and rent, locality/city and specification badges. At 768px and
  above, show all three in equal columns with no horizontal scroll or carousel
  controls. On phones, retain the swipe track and accessible arrow controls.
  Use the shared 20px section-heading size; let the controls flow onto their
  own row only when the heading and both 44px controls cannot fit together.
  Narrow desktop cards stack their metrics so values stay readable. Keep the
  full three-card row within the desktop hero's first fold.
- **Available listings:** use “Warehouses and Godowns in Bangalore” with no
  eyebrow. Keep 3 columns on desktop and 2 on tablet. Hide the entire
  section below 768px, including its heading, size filters, cards and footer.
- **Micromarkets:** a full-width road map with two accessible views: Warehouse
  Belts (10 areas) and City Areas (5 groups/areas). Group Bommasandra/Jigani with
  Hosur Road, and Hebbal/Jakkur with Yelahanka; show Bidadi as Mysore Road / Bidadi.
  Use the PPT generator's Mapbox `streets-v12` basemap with local images and
  matching cameras: 7:3 from 1200px, 3:2 from 600–1199px, and square below 600px.
  Keep the complete image and preserve attribution. Do not add connector lines
  or endpoint dots.
  From 768px, retain the in-map ivory chips and photo previews. Position chips
  over matching map names where practical. Each chip shares its thumbnail,
  title, metadata, thin outline and 12px corners with its expanded photo card.
  Use 12px/600 chip titles, 12px/400 metadata, and 16px expanded titles. Hover,
  keyboard focus, or tap expands one chip into a 264 × 224px card; clamp it
  inside the map with room for attribution. Keep a preview open while moving
  into it; support Escape, the close button, and clicking away. The enquiry
  dialog restores focus to the stable chip.
  Below 768px, mark the basemap with small, noninteractive name chips and keep
  the horizontal micromarket photo-card track 16px beneath it. Map annotations
  use 11px/500 type, 3px × 6px padding, a 1px outline and 6px corners on ivory.
  Omit thumbnails, counts, connector lines and dots from these small labels.
  Keep their positions geographically representative and prevent overlap.
  The detailed cards remain the enquiry targets. Keep both map views; switching views resets the track
  to its first card. Cards use the original navy-gradient photo treatment,
  14px titles, 12px metadata/actions, thin outlines and 12px corners. Show a
  partial next card, use native horizontal scrolling with scroll snapping,
  and keep the page itself within the viewport. Every card opens the existing
  enquiry dialog and restores focus to its own visible button on dismissal.
  Use the city overview's counts with generated inventory as fallback; omit
  counts for grouped or untagged areas rather than summing overlapping listings.
  Keep touch targets at least 44px and use no shadows.
- **Area guide:** follows the micromarket map on all screen sizes. The Highway
  Belts and Inside the City tables sit side by side on desktop and stack below
  1024px. Keep area names intact on narrow phones and use the shared table styles.
- **Benefits:** follows the client carousel on desktop and featured listings on phones, with
  a centered heading. A navy strip shows four metrics: 4 Hour Curated Shortlist,
  2.5 Mn+ Sq Ft Leased, 90+ Cities Covered, and 3000+ Verified Spaces across India, followed
  by six static cards with real Lucide icons and supporting copy. Use four
  equal metric columns on desktop and a 2 × 2 grid on phones. Use 3 × 2 benefit cards on desktop and
  2 × 3 on tablet and phones. Center each metric's
  value and caption within equal-width cells, with subtle vertical dividers.
  Below 768px, show all six benefits in a static two-column grid with 8px gaps,
  12px padding, 14px titles and 12px descriptions. Use the full approved copy
  on both desktop and mobile, while preserving authored CMS edits. Hide decorative icons
  on phones. Informational benefits must not require horizontal
  scrolling, expansion or another action to read. Compact the metric strip to
  20px figures, 8px vertical padding and 12px horizontal padding.
  Aim for roughly half to three-quarters of a typical phone viewport without
  clipping authored copy or setting a fixed section height. Keep the section,
  heading, metric strip and card grid centered within the same page gutters. Ivory cards retain the soft
  line border, 12px corners and no hover effect. Supporting copy accepts the
  existing safe inline emphasis format. Replace untouched CMS wireframe
  placeholders and exact previous descriptions with the current copy while
  preserving edited titles and text.
  There is no section photo or placeholder copy. Let content grow without clipping.
- **Request banner:** below 768px, use a 20px heading, 14px introduction,
  and 12px supporting copy and button labels. Keep the 48px button height
  and existing desktop typography. Put “You only pay when you close.” on its
  own line on phones, with the preceding separator hidden.
- **Services:** 2 columns × 2 rows, including phones. Keep bottom-aligned CTAs.
  Use detailed desktop headings and descriptions from the approved content.
  Below 768px, show the distinct short headings and descriptions in
  `MOBILE_SERVICE_COPY`. Both sizes use the same numbered cards and CTA buttons;
  the first CTA reads “Get my shortlist”. Switch text with CSS so resizing works
  without hydration changes and the hidden variant is excluded from accessibility.
- **Audiences:** match the service-card surface, copy, title and control styles.
- **Bangalore market:** keep one “Warehouse Rent in Bangalore” section with the
  highway-corridor paragraph, a four-stat strip, and the five-row rent-by-size
  table. The strip shows Bangalore listings, median rent for units at least
  20,000 sq ft, median rent below 20,000 sq ft, and the standard deposit.
  Counts, both medians and rent prose come from the same city inventory response
  as the table; never use static CMS counts or rent claims as a fallback. The
  CMS still owns the first corridor paragraph and fourth deposit stat. Legacy
  numeric copy slots remain in the schema for compatibility only. Missing
  measures show a dash; unavailable rent data offers a retry, not old figures.
  Keep 24px between paragraph, strip and table; use four stat columns on desktop
  and two on phones. The table fits without horizontal scrolling, with neutral
  surfaces and right-aligned numbers. Omit the duplicate statistics heading,
  range tiles, corridor comparison, city chart, inventory mix and specification
  tables from this ad page. Keep those shared components on city overview pages.
- **Dialogs:** 24px headings on desktop and the shared 20px heading role on phones, with the same field, label and button styles as the hero form.
  Keep focus trapping, close controls, validation and focus restoration intact.
- **Site chrome:** retain the shared navbar/footer structure and visual roles.
  Keep ad-page layout adaptations local; shared listing and city components
  now consume the same standard at their source.

## Maintaining the guide

Use an existing role before adding a new size or color. Change the token once
instead of stacking breakpoint overrides. The CMS uses the real page renderer,
so it must match without maintaining a second style implementation.

Review at 320px, 390px, 768px, 1024px, 1440px and 1920px. Check wrapped copy,
native swiping, the 2×3/2×2 grids, map previews, image loading, keyboard focus, modal
triggers, table overflow and the real CMS preview. A fresh-load check alone is
not enough during development: verify the running page after a full refresh.

Also check the production page before JavaScript loads. The Bangalore and
preview routes declare their `entry` files in `src/routes.tsx` so the static
build discovers the page's CSS and inlines the initial layout. The `lazyDefault`
wrapper hides that dependency from automatic detection; removing `entry`
causes an unstyled first paint and a large layout jump at hydration. Verify a
cold load with the entry script delayed, not only a settled screenshot.
