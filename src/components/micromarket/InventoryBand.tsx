import type { Micromarket } from '@/services/micromarketsAPI';
import { EYEBROW } from './tokens';

interface Tile {
  value: number;
  label: string;
  /** Percentage of the measured set, so the count reads against a denominator. */
  share: number;
}

/** Tailwind needs static class names, so the column count is looked up. */
const COLUMNS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

/**
 * The navy strip: what is actually standing in this belt.
 *
 * Counts rather than shares alone, because a count is checkable against the grid
 * further down the page in a way a percentage is not. But a bare count is also
 * unreadable — "38 Commercial CLU" means nothing without knowing 38 of what — so
 * each tile carries its share and a bar, and the header states the denominator
 * once for all of them.
 *
 * Construction types come from the live mix rather than being hard-coded, so a
 * belt of sheds says "Shed" instead of showing an empty PEB tile. A tile whose
 * count is zero is dropped, and the strip hides itself if that leaves nothing.
 */
const InventoryBand = ({ stats, heading }: { stats: Micromarket; heading: string }) => {
  const { listings, measured } = stats;
  // Clamped: the counts are overridable in the CMS but `measured` is not, so a
  // correction above the built-stock total would otherwise print "238%".
  const shareOf = (n: number) =>
    measured > 0 ? Math.min(100, Math.round((n / measured) * 100)) : 0;

  const tiles: Tile[] = [
    ...stats.construction.slice(0, 2).map((c) => ({ value: c.count, label: c.label, share: c.share })),
    { value: stats.fireNoc, label: 'Fire NOC on file', share: shareOf(stats.fireNoc) },
    { value: stats.commercialClu, label: 'Commercial CLU', share: shareOf(stats.commercialClu) },
  ].filter((t) => t.value > 0);

  if (tiles.length === 0) return null;

  // Land, open plots and build-to-suit sites are in the listing count and out of
  // every figure here. Saying so is the difference between a strip a reader can
  // reconcile against the grid and one that just looks wrong.
  const unbuilt = listings - measured;
  const denominator =
    unbuilt > 0
      ? `of ${measured} built units · ${unbuilt} land or build-to-suit excluded`
      : `of ${measured} listed units`;

  return (
    <section
      aria-labelledby="inventory-band"
      className="rounded-2xl bg-wareongo-blue px-5 py-6 text-wareongo-ivory sm:px-7 sm:py-7"
    >
      <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-wareongo-ivory/15 pb-4">
        <h2
          id="inventory-band"
          className={`${EYEBROW} text-wareongo-ivory/70`}
        >
          {heading}
        </h2>
        <p className="text-xs tabular-nums text-wareongo-ivory/50 sm:ml-auto">{denominator}</p>
      </div>

      <dl className={`grid grid-cols-2 gap-3 ${COLUMNS[tiles.length] ?? COLUMNS[4]}`}>
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-xl border border-wareongo-ivory/10 bg-wareongo-ivory/[0.06] px-4 py-3.5"
          >
            <div className="flex items-baseline gap-1.5">
              <dd className="text-2xl font-bold tabular-nums leading-none sm:text-[1.75rem]">
                {t.value}
              </dd>
              <span className="text-xs font-semibold tabular-nums text-wareongo-ivory/50">
                {t.share}%
              </span>
            </div>
            <dt className="mt-1.5 text-xs leading-snug text-wareongo-ivory/80">{t.label}</dt>
            {/* The bar restates the share visually, which is what makes four
                tiles read as one comparison instead of four separate facts.
                aria-hidden: the number above it already says this. */}
            <div
              aria-hidden="true"
              className="mt-2.5 h-1 overflow-hidden rounded-full bg-wareongo-ivory/15"
            >
              <div
                className="h-full rounded-full bg-wareongo-ivory/60"
                style={{ width: `${Math.max(t.share, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default InventoryBand;
