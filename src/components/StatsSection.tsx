import React from 'react';
import {
  CITIES_COVERED,
  SHORTLIST_HOURS,
  SQFT_TRANSACTED_M,
  VERIFIED_WAREHOUSES,
} from '@/data/companyStats';

/**
 * The homepage figures.
 *
 * Rendered statically, and that is the point. These used to count up from zero
 * once the strip scrolled into view, which meant the prerendered HTML — the
 * thing crawlers and any client that does not run JavaScript actually read —
 * said "0+ verified warehouses, 0.0M+ sqft transacted, 0-hour shortlist". The
 * numbers only existed after hydration plus a scroll. An animation is not worth
 * publishing zeros for the four claims the homepage leads with.
 */

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
};

const stats: Stat[] = [
  { value: VERIFIED_WAREHOUSES, suffix: '+', label: 'verified warehouses' },
  { value: SQFT_TRANSACTED_M, decimals: 1, suffix: 'M+', label: 'sqft transacted' },
  { value: CITIES_COVERED, suffix: '+', label: 'cities covered' },
  // This said 8 while the rest of the site said 4. See SHORTLIST_HOURS.
  { value: SHORTLIST_HOURS, suffix: '-hour', label: 'shortlist' },
];

/**
 * Grouped, not just fixed to a precision.
 *
 * toFixed rendered the warehouse count as "1500+" while the About Us strip
 * showed "1,500+" for the same figure — the two blocks disagreed on formatting
 * as well as on value, and both were reported together. Indian grouping,
 * matching how the number reads everywhere else on the site.
 */
const format = (value: number, decimals = 0) =>
  value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const StatTile = ({ stat }: { stat: Stat }) => (
  <div className="flex flex-col items-center text-center">
    <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-wareongo-blue leading-none tabular-nums whitespace-nowrap">
      {stat.prefix}
      {format(stat.value, stat.decimals)}
      {stat.suffix}
    </div>
    <p className="mt-3 text-sm sm:text-base text-wareongo-slate">{stat.label}</p>
  </div>
);

const StatsSection = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 w-full">
    {stats.map((s) => (
      <StatTile key={s.label} stat={s} />
    ))}
  </div>
);

export default StatsSection;
