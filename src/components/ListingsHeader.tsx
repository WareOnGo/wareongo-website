import { Filter, X } from 'lucide-react';

/** Shared by the page and its route placeholder so text wrapping and controls
 * reserve exactly the same space on every viewport. */
export default function ListingsHeader({
  showFilters = false, active = false, loading = false, onToggle, onClear,
}: {
  showFilters?: boolean;
  active?: boolean;
  loading?: boolean;
  onToggle?: () => void;
  onClear?: () => void;
}) {
  return <>
    <div className="max-w-2xl mb-8 md:mb-12">
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">Inventory</span>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue mb-3 leading-tight">Warehouse Listings</h1>
      <p className="text-wareongo-slate text-sm sm:text-base md:text-lg">
        Premium warehouse spaces across India. Find the perfect storage solution for your business.
      </p>
    </div>
    <div className="mb-6 flex justify-between items-center gap-3">
      <button onClick={onToggle} disabled={loading}
        className="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-wareongo-blue text-wareongo-blue text-sm font-medium bg-transparent hover:bg-wareongo-blue/5 transition-colors">
        <Filter className="w-4 h-4" />
        {showFilters ? 'Hide filters' : 'Show filters'}
        {active && <span className="ml-1 bg-wareongo-blue text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">Active</span>}
      </button>
      {active && <button onClick={onClear} disabled={loading}
        className="inline-flex items-center gap-1 text-sm text-wareongo-slate hover:text-wareongo-blue transition-colors">
        <X className="w-4 h-4" />Clear all
      </button>}
    </div>
  </>;
}
