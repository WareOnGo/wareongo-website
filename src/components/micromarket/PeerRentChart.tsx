import { Link } from 'react-router-dom';
import { micromarketPath, type PeerRent } from '@/services/micromarketsAPI';
import { EYEBROW, PANEL } from './tokens';

/**
 * Median asking rent for this belt against its siblings in the same city.
 *
 * Plain divs rather than a chart library: five bars on a static page don't
 * justify shipping one, and this way every value is real text in the
 * prerendered HTML — readable by a crawler, selectable by a reader, and legible
 * with CSS off.
 *
 * Bars are scaled against the highest value rather than zero-based headroom, so
 * the tallest always fills the plot and the differences stay visible even when
 * the whole city sits inside a ₹20–35 band.
 */
const PeerRentChart = ({ peers, asOf }: { peers: PeerRent[]; asOf?: string }) => {
  const max = Math.max(...peers.map((p) => p.medianRent));

  return (
    <figure className={`m-0 ${PANEL} p-4 sm:p-5`}>
      <figcaption className="mb-4">
        <span className={`block ${EYEBROW} text-wareongo-slate`}>
          Median asking rent · ₹ per sq ft / month
        </span>
        {asOf && <span className="mt-0.5 block text-[11px] text-wareongo-slate/80">{asOf}</span>}
      </figcaption>

      {/* A hairline under the bars: without it they float in the container's
          padding and the chart reads as five loose blocks. */}
      <div className="flex items-end gap-2 border-b border-wareongo-blue/15 sm:gap-3">
        {peers.map((p) => {
          const height = Math.max(12, Math.round((p.medianRent / max) * 100));
          const bar = (
            <>
              {/* Taller than before, and each bar capped in width. Five bars
                  filling a 640px column came out ~110px wide and ~130px tall —
                  squat blocks rather than a chart. The column stays flexible so
                  the labels below keep their room. */}
              <span className="flex h-32 w-full items-end sm:h-40">
                <span
                  style={{ height: `${height}%` }}
                  className={`mx-auto flex w-full max-w-[4.5rem] items-start justify-center rounded-t-md pt-1 text-[11px] font-semibold tabular-nums text-white transition-opacity ${
                    p.isSelf ? 'bg-wareongo-green' : 'bg-wareongo-blue group-hover:opacity-85'
                  }`}
                >
                  {p.medianRent}
                </span>
              </span>
              <span
                className={`mt-2 block text-center text-[10px] leading-tight ${
                  p.isSelf ? 'font-semibold text-wareongo-blue' : 'text-wareongo-slate'
                }`}
              >
                {p.name}
              </span>
            </>
          );

          return (
            <div key={`${p.citySlug}/${p.slug}`} className="min-w-0 flex-1">
              {/* The page's own belt isn't a link to itself. */}
              {p.isSelf ? (
                <div aria-current="page">{bar}</div>
              ) : (
                <Link to={micromarketPath(p)} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue/40 rounded-md">
                  {bar}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
};

export default PeerRentChart;
