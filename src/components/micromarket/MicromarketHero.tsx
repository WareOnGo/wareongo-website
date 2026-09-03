import { Link } from 'react-router-dom';
import EditorialImage from './EditorialImage';
import type { MicromarketContent } from '@/data/micromarkets';
import { formatRentRange, formatSqftRange } from '@/lib/micromarketStats';
import type { Micromarket } from '@/services/micromarketsAPI';
import { EYEBROW, LEAD, METRIC } from './tokens';

interface Tile {
  value: string;
  label: string;
  /** The rent tile is the one people came for; it gets the accent colour. */
  accent?: boolean;
}

const MicromarketHero = ({
  content,
  stats,
  place,
  onBrowse,
}: {
  content: MicromarketContent;
  stats: Micromarket;
  /** "Nelamangala, Bengaluru" — the fully qualified place, for the eyebrow default. */
  place: string;
  onBrowse: string;
}) => {
  // Built from live inventory, and each one is dropped when the data behind it
  // isn't there — a rent tile reading "₹0" would be worse than three tiles.
  const tiles: Tile[] = [
    { value: String(stats.listings), label: 'Verified spaces' },
    ...(stats.size ? [{ value: formatSqftRange(stats.size), label: 'Sq ft range' }] : []),
    ...(stats.rent
      ? [{ value: formatRentRange(stats.rent), label: 'Per sq ft / mo', accent: true }]
      : []),
  ];

  return (
    <header className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
      <div>
        <span className={`mb-3 block ${EYEBROW} text-wareongo-slate`}>
          {content.heroEyebrow ?? `Warehouses and godowns · ${place}`}
        </span>
        <h1
          id="micromarket-title"
          className="mb-4 text-3xl font-bold leading-tight text-wareongo-blue sm:text-4xl md:text-5xl"
        >
          {content.h1}
        </h1>
        <p className={`max-w-2xl ${LEAD}`}>{content.heroProse}</p>

        {/*
          Boxed tiles from `sm`, a ruled strip below it.
          
          Not a style preference — a measurement. In a half-width tile on a
          390px phone the value box is 143px wide, and real size ranges do not
          fit: "2,100–2.82 lakh" measures 144px and "10,000–4.24 lakh" 156px, so
          both wrapped mid-number. Shrinking the type only moves the threshold.
          Full-width rows give the value the whole column, which no value can
          overrun, and the strip is shorter than the two rows of boxes it
          replaces — 3 rules instead of 6 borders.
        */}
        {tiles.length > 0 && (
          <dl className="mt-7 grid grid-cols-1 border-t border-wareongo-blue/15 sm:grid-cols-3 sm:gap-3 sm:border-t-0">
            {tiles.map((t) => (
              // row-reverse so the label (second in the DOM, because dd precedes
              // dt) reads on the left, with the figure right-aligned against it.
              <div
                key={t.label}
                className={`flex flex-row-reverse items-baseline justify-between gap-3 py-2.5 sm:block sm:gap-0 sm:px-3.5 sm:py-2.5 ${METRIC}`}
              >
                <dd
                  className={`text-[17px] font-semibold tabular-nums leading-none ${
                    t.accent ? 'text-wareongo-green' : 'text-wareongo-blue'
                  }`}
                >
                  {t.value}
                </dd>
                <dt className={`${EYEBROW} text-wareongo-slate sm:mt-1.5`}>{t.label}</dt>
              </div>
            ))}
          </dl>
        )}

        {/* Full width on a phone: stacked buttons sized to their own text read as
            a ragged edge, and these are the page's primary tap targets. */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/request-warehouse"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-wareongo-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-wareongo-blue/90"
          >
            Get a shortlist in 4 hours →
          </Link>
          {/* Down arrow, not right: this jumps to a section of this page rather
              than navigating anywhere. The count is deliberately not repeated —
              the "verified spaces" tile directly above already carries it. */}
          <a
            href={onBrowse}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-wareongo-blue/30 px-5 text-sm font-medium text-wareongo-blue transition-colors hover:bg-wareongo-blue/5"
          >
            Browse the listings ↓
          </a>
        </div>
      </div>

      {content.heroImage && (
        <EditorialImage image={content.heroImage} ratio="aspect-[4/3]" priority className="lg:mt-1" />
      )}
    </header>
  );
};

export default MicromarketHero;
