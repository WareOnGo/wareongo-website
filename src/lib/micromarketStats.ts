import type { Micromarket, Spread } from '@/services/micromarketsAPI';

/**
 * Presentation of the figures on a micromarket page, and the one piece of
 * arithmetic the site still does: laying the CMS's manual corrections over what
 * the backend derived.
 *
 * The derivation itself used to live here — parsing free-text rates and clear
 * heights, bucketing construction labels, deciding what counts as unbuilt stock.
 * It moved to the backend (services/micromarketService.js) because the same
 * rules existed in three places, and nothing announced the moment they stopped
 * agreeing. The CMS reads the same endpoint, so an editor cannot be shown a
 * median the site would not publish.
 */

// ----- formatting -----------------------------------------------------------

/** 2100 → "2,100"; 424000 → "4.24 lakh". Indian reading, not 424K. */
export const formatSqft = (n: number): string =>
  n >= 100000
    ? `${(n / 100000).toFixed(2).replace(/\.?0+$/, '')} lakh`
    : n.toLocaleString('en-IN');

export const formatSqftRange = (s: Spread): string =>
  s.min === s.max ? formatSqft(s.min) : `${formatSqft(s.min)}–${formatSqft(s.max)}`;

export const formatRentRange = (s: Spread): string =>
  s.min === s.max ? `₹${s.min}` : `₹${s.min}–${s.max}`;

// ----- the specification table ----------------------------------------------

/**
 * Typical specification for the belt.
 *
 * Every row is dropped when the data behind it is null — a spec sheet saying
 * "Docks: not specified" is worse than one that doesn't mention docks, and these
 * columns are unevenly recorded across the inventory. Returns an empty array
 * when nothing is recorded, which is the caller's cue to drop the section rather
 * than render an empty table.
 */
export const specRowsFor = (stats: Micromarket): [string, string][] => {
  const rows: [string, string][] = [];

  if (stats.clearHeight) {
    const { min, max, median } = stats.clearHeight;
    rows.push(['Clear height', min === max ? `${min} ft` : `${min}–${max} ft · median ${median}`]);
  }
  if (stats.docksMedian !== null) {
    rows.push(['Docks', `${stats.docksMedian} per site (median)`]);
  }
  if (stats.construction.length > 0) {
    rows.push([
      'Construction type',
      stats.construction.map((c) => `${c.share}% ${c.label}`).join(' · '),
    ]);
  }
  if (stats.flooring.length > 0) {
    rows.push(['Flooring type', stats.flooring.map((f) => `${f.label} ${f.share}%`).join(' · ')]);
  }
  if (stats.size) {
    rows.push(['Median unit size', `${formatSqft(stats.size.median)} sq ft`]);
  }

  return rows;
};

// ----- editor overrides -----------------------------------------------------

import type { MicromarketStatOverrides } from '@/data/micromarkets';

/**
 * Lays the CMS's manual corrections over the derived figures.
 *
 * Merges per field rather than per block: setting a rent median leaves the min
 * and max derived, so the page keeps tracking inventory everywhere the editor
 * has not intervened. That matters because these pages rebuild on every deploy —
 * a wholesale override would freeze a section the day it was written.
 *
 * A spread needs all three of min, median and max. Where nothing was derivable
 * (no parseable rents at all) an override can supply the whole set; a partial one
 * is dropped rather than rendered with holes, the same rule the spec table
 * follows for null rows.
 *
 * Values are clamped to a sane order so a typo produces a slightly wrong range
 * rather than a nonsensical one like "₹30 to ₹12". The CMS mirrors this merge in
 * lib/micromarket-format.ts so its preview agrees with what publishes.
 */
const mergeSpread = (
  computed: Spread | null,
  override: { min?: number | null; median?: number | null; max?: number | null } | undefined,
): Spread | null => {
  if (!override) return computed;
  const min = override.min ?? computed?.min;
  const median = override.median ?? computed?.median;
  const max = override.max ?? computed?.max;
  if (min === undefined || median === undefined || max === undefined) return computed;
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return { min: low, median: Math.min(Math.max(median, low), high), max: high };
};

export const applyStatOverrides = (
  stats: Micromarket,
  overrides: MicromarketStatOverrides | undefined,
): Micromarket => {
  if (!overrides) return stats;
  const rent = mergeSpread(stats.rent, overrides.rent);

  /**
   * The chart's own bar has to follow a corrected median, or the page
   * contradicts itself: the tiles and table would show the corrected figure
   * while the bar labelled with this belt's name showed the raw one. It was
   * worse than that before this — the peers came straight from the endpoint, so
   * an override of `rent.median` changed nothing anywhere and the field looked
   * broken.
   *
   * Only the self bar. A sibling's median belongs to that sibling's own page,
   * where it is derived the same way; letting this page assert a different one
   * would put two numbers for one belt on two URLs.
   */
  // Optional-chained: the endpoint always sends peers, but a caller handing this
  // a partial object should not take a whole page render down with it.
  const peers =
    rent && stats.peers?.length
      ? stats.peers.map((p) => (p.isSelf ? { ...p, medianRent: rent.median } : p))
      : stats.peers;

  return {
    ...stats,
    rent,
    peers,
    size: mergeSpread(stats.size, overrides.size),
    clearHeight: mergeSpread(stats.clearHeight, overrides.clearHeight),
    docksMedian: overrides.docksMedian ?? stats.docksMedian,
    fireNoc: overrides.fireNoc ?? stats.fireNoc,
    commercialClu: overrides.commercialClu ?? stats.commercialClu,
  };
};
