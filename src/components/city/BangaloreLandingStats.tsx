import type { AdPageCopy } from '@/data/adPages';
import { useRevalidator } from 'react-router-dom';
import { CorridorPanel, RentBySize, SpecSizeComparison } from './CityPanels';
import InventoryBand from '@/components/micromarket/InventoryBand';
import PeerRentChart from '@/components/micromarket/PeerRentChart';
import SpecTable from '@/components/micromarket/SpecTable';
import { formatRentRange, formatSqftRange, specRowsFor } from '@/lib/micromarketStats';
import type { BangaloreLandingData } from '@/loaders/bangaloreLandingLoader';

export default function BangaloreLandingStats({ data, copy }: { data: BangaloreLandingData | null; copy: AdPageCopy }) {
  const revalidator = useRevalidator();

  if (!data) {
    return (
      <div className="border border-wareongo-blue/20 p-6 text-center">
        <p role="status" className="text-sm text-wareongo-slate">Bangalore statistics are temporarily unavailable.</p>
        <button
          type="button"
          onClick={() => revalidator.revalidate()}
          disabled={revalidator.state === 'loading'}
          className="mt-4 rounded-md bg-wareongo-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {revalidator.state === 'loading' ? 'Loading statistics…' : 'Retry statistics'}
        </button>
      </div>
    );
  }

  const { stats, cityOverview } = data;
  const summary = [
    { value: String(stats.listings), label: 'Verified spaces' },
    ...(stats.size ? [{ value: formatSqftRange(stats.size), label: 'Sq ft range' }] : []),
    ...(stats.rent ? [{ value: formatRentRange(stats.rent), label: 'Per sq ft / mo' }] : []),
  ];
  const hasSpecifications = specRowsFor(stats).length > 0;

  return (
    <div className="bangalore-landing__stats-content">
      <dl className="bangalore-landing__stats-summary">
        {summary.map(({ value, label }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {cityOverview && cityOverview.corridors.length > 0 && (
        <section aria-labelledby="bangalore-corridors-title">
          <h3 id="bangalore-corridors-title" className="bangalore-landing__stats-subtitle">{copy.statsLocationsHeading}</h3>
          <CorridorPanel data={cityOverview} />
        </section>
      )}

      {(stats.peers.length > 0 || Boolean(cityOverview?.rentBySize.length)) && (
        <section aria-labelledby="bangalore-rents-title">
          <h3 id="bangalore-rents-title" className="bangalore-landing__stats-subtitle">{copy.statsRentHeading}</h3>
          <div className="bangalore-landing__rent-grid">
            {stats.peers.length > 0 && <PeerRentChart peers={stats.peers} />}
            {cityOverview && cityOverview.rentBySize.length > 0 && <RentBySize bands={cityOverview.rentBySize} />}
          </div>
        </section>
      )}

      <InventoryBand
        stats={stats}
        heading={copy.statsInventoryHeading}
        excludedLabel={cityOverview ? 'land, build-to-suit or under construction' : undefined}
      />

      {hasSpecifications && (
        <section aria-labelledby="bangalore-specifications-title">
          <h3 id="bangalore-specifications-title" className="bangalore-landing__stats-subtitle">{copy.statsSpecificationsHeading}</h3>
          <div className="bangalore-landing__specs-grid">
            <div className="bangalore-landing__spec-overview">
              <h4 className="bangalore-landing__table-title">{copy.statsCityHeading}</h4>
              <SpecTable stats={stats} caption="Typical specification across warehouses listed in Bangalore" />
            </div>
            {cityOverview && <SpecSizeComparison cohorts={cityOverview.specsBySize} />}
          </div>
          {cityOverview && (
            <p className="mt-4 text-xs leading-relaxed text-wareongo-slate">
              Based on {stats.measured} existing warehouse listings. Each measure uses listings that record it; construction and flooring shares use recorded, recognised types.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
