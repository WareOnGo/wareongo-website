import { getLocationPageContent } from '@/data/locationPages';
import { applyStatOverrides } from '@/lib/micromarketStats';
import type { CityOverviewStats } from '@/services/cityOverview';
import type { DerivedStats } from '@/services/derivedStats';
import { locationStats } from '@/services/locationsAPI';

export interface BangaloreLandingData {
  stats: DerivedStats;
  cityOverview?: CityOverviewStats;
}

/** Reuse the city overview's figures without loading its warehouse catalogue. */
export async function bangaloreLandingLoader(): Promise<BangaloreLandingData | null> {
  try {
    const location = await locationStats('CITY', 'bengaluru');
    if (!location) throw new Error('Bangalore city statistics are unavailable.');

    const cityOverview = location.cityOverview;
    const content = getLocationPageContent('CITY', 'bengaluru');
    const stats = applyStatOverrides(
      cityOverview
        ? { ...location, ...cityOverview.summary, peers: cityOverview.comparisonCities }
        : location,
      content?.statOverrides,
    );

    return { stats, cityOverview };
  } catch (error) {
    // A build must not publish missing figures. In the browser, keep the shell
    // available for review and let the visitor retry the statistics request.
    if (import.meta.env.SSR) throw error;
    console.warn('Unable to load Bangalore statistics.', error);
    return null;
  }
}
