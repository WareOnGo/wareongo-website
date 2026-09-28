import { Filter } from 'lucide-react';
import type { Ref, ReactNode } from 'react';

/** Shared by the page and its route placeholder so text wrapping and controls
 * reserve exactly the same space on every viewport. */
export default function ListingsHeader({
  showFilters = false, active = false, loading = false, onToggle, filterButtonRef, heading,
}: {
  showFilters?: boolean;
  active?: boolean;
  loading?: boolean;
  onToggle?: () => void;
  filterButtonRef?: Ref<HTMLButtonElement>;
  heading?: ReactNode;
}) {
  return <>
    {heading ?? <div className="max-w-2xl mb-8 md:mb-12">
      <span className="ui-eyebrow text-wareongo-slate block mb-3">Inventory</span>
      <h1 className="ui-page-title text-wareongo-blue mb-3">Warehouse Listings</h1>
      <p className="text-wareongo-slate text-sm sm:text-base md:text-lg">
        Premium warehouse spaces across India. Find the perfect storage solution for your business.
      </p>
    </div>}
    <div className="wog-listing-filter-bar pointer-events-none sticky z-40 mb-6 flex items-center" data-listing-filter-bar>
      <button ref={filterButtonRef} type="button" onClick={onToggle} disabled={loading}
        aria-label={active ? 'Filters Active' : 'Filters'}
        aria-haspopup="dialog" aria-expanded={showFilters} aria-controls={showFilters ? 'listing-filters' : undefined}
        className="ui-button ui-button--secondary pointer-events-auto gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue focus-visible:ring-offset-2 focus-visible:ring-offset-wareongo-ivory">
        <Filter className="w-4 h-4" aria-hidden="true" />
        Filters
        {active && <span aria-hidden="true" className="ml-1 h-2 w-2 shrink-0 rounded-full bg-ui-accent" />}
      </button>
    </div>
  </>;
}
