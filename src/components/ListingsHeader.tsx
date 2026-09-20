import { Filter, X } from 'lucide-react';
import type { Ref } from 'react';

/** Shared by the page and its route placeholder so text wrapping and controls
 * reserve exactly the same space on every viewport. */
export default function ListingsHeader({
  showFilters = false, active = false, loading = false, onToggle, onClear, filterButtonRef,
}: {
  showFilters?: boolean;
  active?: boolean;
  loading?: boolean;
  onToggle?: () => void;
  onClear?: () => void;
  filterButtonRef?: Ref<HTMLButtonElement>;
}) {
  return <>
    <div className="max-w-2xl mb-8 md:mb-12">
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">Inventory</span>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue mb-3 leading-tight">Warehouse Listings</h1>
      <p className="text-wareongo-slate text-sm sm:text-base md:text-lg">
        Premium warehouse spaces across India. Find the perfect storage solution for your business.
      </p>
    </div>
    <div className="pointer-events-none sticky top-[calc(var(--wog-nav-height)+8px)] z-40 mb-6 flex items-center justify-between gap-3" data-listing-filter-bar>
      <button ref={filterButtonRef} type="button" onClick={onToggle} disabled={loading}
        aria-haspopup="dialog" aria-expanded={showFilters} aria-controls={showFilters ? 'listing-filters' : undefined}
        className="pointer-events-auto inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-wareongo-blue text-wareongo-blue text-sm font-medium bg-wareongo-ivory hover:bg-[#efede8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue focus-visible:ring-offset-2 focus-visible:ring-offset-wareongo-ivory">
        <Filter className="w-4 h-4" aria-hidden="true" />
        Filters
        {active && <span className="ml-1 bg-wareongo-blue text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">Active</span>}
      </button>
      {active && <button onClick={onClear} disabled={loading}
        className="pointer-events-auto inline-flex min-h-11 items-center gap-1 rounded-lg bg-wareongo-ivory px-2 text-sm text-wareongo-slate transition-colors hover:text-wareongo-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue">
        <X className="w-4 h-4" />Clear all
      </button>}
    </div>
  </>;
}
