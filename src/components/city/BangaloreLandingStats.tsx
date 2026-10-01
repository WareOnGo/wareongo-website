import { useRevalidator } from 'react-router-dom';
import type { AdPageContent } from '@/data/adPages';
import defaults from '@/data/ad-pages/bangalore.json';
import type { BangaloreLandingData } from '@/loaders/bangaloreLandingLoader';
import { RentBySize } from './CityPanels';

const money = (value: number | undefined) => value === undefined
  ? '—'
  : `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function BangaloreLandingStats({ data, content }: { data: BangaloreLandingData | null; content: AdPageContent }) {
  const revalidator = useRevalidator();
  const overview = data?.cityOverview;
  const under5000 = overview?.rentBySize.find(band => band.min === 0 && band.max === 5000)?.rent?.median;
  const largeRent = overview?.segments.large.rent?.median;
  const smallRent = overview?.segments.small.rent?.median;
  const rentDetails = [
    under5000 === undefined ? '' : `Units under 5,000 sq ft ask a median ${money(under5000)} per sq ft a month.`,
    largeRent === undefined ? '' : `For units of 20,000 sq ft and up, the median is ${money(largeRent)} per sq ft a month.`,
  ].filter(Boolean).join(' ');

  // Inventory figures and rent prose share the table's backend data. Older CMS
  // revisions still carry static values in these slots; never publish them.
  const summary = [
    { value: data?.stats.listings.toLocaleString('en-IN') ?? '—', label: 'Bangalore listings' },
    { value: money(largeRent), label: 'median, 20,000 sq ft and up' },
    { value: money(smallRent), label: 'median, under 20,000 sq ft' },
    content.overviewStats[3] ?? defaults.overviewStats[3],
  ];

  return (
    <div className="bangalore-landing__stats-content">
      <div className="bangalore-landing__content-columns">
        <p>{content.overviewParagraphs[0] ?? defaults.overviewParagraphs[0]}</p>
        <p>{rentDetails || defaults.overviewParagraphs[1]}</p>
      </div>

      <dl className="bangalore-landing__market-summary">
        {summary.map(({ value, label }) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>

      {overview && overview.rentBySize.length > 0 ? (
        <RentBySize bands={overview.rentBySize} />
      ) : (
        <div className="bangalore-landing__market-unavailable">
          <p role="status">Bangalore rent data is temporarily unavailable.</p>
          <button
            type="button"
            onClick={() => revalidator.revalidate()}
            disabled={revalidator.state === 'loading'}
            className="bangalore-landing__button bangalore-landing__button--outline"
          >
            {revalidator.state === 'loading' ? 'Loading rent data…' : 'Retry rent data'}
          </button>
        </div>
      )}
    </div>
  );
}
