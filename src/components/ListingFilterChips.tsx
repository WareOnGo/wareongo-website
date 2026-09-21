import { X } from 'lucide-react';
import { micromarketsForCity, type WarehouseFilters } from '@/lib/listingSearch';

/** Shared geometry for live filters and the pending location route. */
export default function ListingFilterChips({ filters, onRemove }: {
  filters: WarehouseFilters;
  onRemove?: (reset: Partial<WarehouseFilters>) => void;
}) {
  const activeChips: { id: string; label: string; reset: Partial<WarehouseFilters> }[] = [
    ...(filters.state ? [{ id: 'state', label: `State: ${filters.state}`, reset: { state: '' } }] : []),
    ...(filters.city ? [{ id: 'city', label: `City: ${filters.city}`, reset: { city: '', micromarket: '' } }] : []),
    ...(filters.micromarket ? [{ id: 'micromarket',
      label: micromarketsForCity(filters.city).find(market => market.slug === filters.micromarket)?.canonical ?? filters.micromarket,
      reset: { micromarket: '' } }] : []),
    ...(filters.warehouseType ? [{ id: 'type', label: filters.warehouseType, reset: { warehouseType: '' } }] : []),
    ...(filters.fireCompliance === 'yes' ? [{ id: 'fire', label: 'Fire NOC required', reset: { fireCompliance: '' } }] : []),
    ...(filters.minSqft > 0 || filters.maxSqft < 100000 ? [{
      id: 'area',
      label: filters.maxSqft >= 100000 ? `${filters.minSqft.toLocaleString('en-IN')}+ sq ft`
        : `${filters.minSqft.toLocaleString('en-IN')}–${filters.maxSqft.toLocaleString('en-IN')} sq ft`,
      reset: { minSqft: 0, maxSqft: 100000 },
    }] : []),
  ];

  if (!activeChips.length) return null;
  return (
    <div role="group" aria-label="Active filters" className="mb-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-wareongo-slate">Filtering by</span>
      {activeChips.map(chip => <button key={chip.id} type="button" disabled={!onRemove} onClick={() => onRemove?.(chip.reset)}
        aria-label={`Remove ${chip.label} filter`}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-wareongo-blue/25 bg-transparent px-3 text-xs text-wareongo-blue hover:border-wareongo-blue hover:bg-wareongo-blue/5">
        {chip.label}<X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>)}
    </div>
  );
}
