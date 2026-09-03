/**
 * One definition per typographic and container role on the micromarket page.
 *
 * These roles had drifted: eyebrows were set at 0.2em, 0.16em and 0.12em
 * tracking in four different components, prose at two sizes, and containers at
 * three border weights — so the page read as several designs sharing a URL.
 *
 * Values follow the rest of the site rather than inventing a local scale:
 * tracking-[0.2em] is its dominant eyebrow tracking, and a full-strength
 * wareongo-blue stroke is what cards, the FAQ accordion and the bento panels
 * already use for an outer container. Anything lighter (/20) is reserved for
 * rules *inside* a container, which is why the two never compete.
 */

/** Small uppercase label. Colour is the caller's, since these sit on both grounds. */
export const EYEBROW = 'text-[10px] font-semibold uppercase tracking-[0.2em]';

/** Section body copy. */
export const PROSE = 'text-[15px] leading-relaxed text-wareongo-slate sm:text-base';

/** The hero's standfirst — one step up from PROSE, and the only place it is used. */
export const LEAD = 'text-base leading-relaxed text-wareongo-slate sm:text-lg';

/** Outer container: chart, specification table, call to action. */
export const PANEL = 'rounded-2xl border border-wareongo-blue';

/** Rules and secondary strokes inside a panel. */
export const HAIRLINE = 'border-wareongo-blue/20';

/**
 * Inline metric readout — the hero's count / size / rent tiles.
 *
 * A lighter stroke and no fill, on purpose. PANEL's full-strength stroke is for
 * things that *contain* content; these are a line of metadata under a
 * standfirst, and giving them container weight made three small boxes shout
 * louder than the H1 above them.
 *
 * Both breakpoints live in one string, and deliberately use no `divide-*`
 * utility. `divide-y` compiles to a `& > * + *` rule that sets top *and* bottom
 * width, which outranks a plain `border` on the child — so switching a ruled
 * strip to boxes that way stripped the top and bottom edges off every tile
 * except the first, leaving them as open brackets. Per-element utilities only,
 * so all three tiles resolve identically.
 */
export const METRIC =
  'border-b border-wareongo-blue/15 sm:rounded-xl sm:border sm:border-wareongo-blue/20';

/**
 * Small navigational pill. Deliberately a lighter stroke than PANEL — these are
 * a row of links, not a container, and at full strength four of them read as
 * four boxes competing with the panels above. /30 is the weight the city page's
 * own filter chips already use.
 */
export const CHIP = 'rounded-full border border-wareongo-blue/30';

/**
 * Separator above a section. The page previously relied on vertical space
 * alone, which on a phone left five prose sections running into one another.
 */
export const SECTION_RULE =
  'mt-10 border-t border-wareongo-blue/15 pt-10 sm:mt-14 sm:pt-14';

/** Spacing for blocks that delimit themselves (the navy band, the CTA panel). */
export const SECTION_GAP = 'mt-10 sm:mt-14';
