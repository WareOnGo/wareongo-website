import { X } from 'lucide-react';
import { micromarketsForCity, selectedAreaPresets, type WarehouseFilters } from '@/lib/listingSearch';

/** Shared geometry for live filters and the pending location route. */
export default function ListingFilterChips({ filters, onRemove }: {
  filters: WarehouseFilters;
  onRemove?: (reset: Partial<WarehouseFilters>) => void;
}) {
  const ranges = selectedAreaPresets(filters);
  const activeChips: { id: string; label: string; reset: Partial<WarehouseFilters> }[] = [
    ...(filters.state ? [{ id: 'state', label: `State: ${filters.state}`, reset: { state: '' } }] : []),
    ...(filters.city ? [{ id: 'city', label: `City: ${filters.city}`, reset: { city: '', micromarket: '' } }] : []),
    ...(filters.micromarket ? [{ id: 'micromarket',
      label: micromarketsForCity(filters.city).find(market => market.slug === filters.micromarket)?.canonical ?? filters.micromarket,
      reset: { micromarket: '' } }] : []),
    ...filters.warehouseTypes.map(type => ({ id: `type-${type}`, label: type,
      reset: { warehouseTypes: filters.warehouseTypes.filter(value => value !== type) } })),
    ...(filters.fireCompliance === 'yes' ? [{ id: 'fire', label: 'Fire NOC required', reset: { fireCompliance: '' } }] : []),
    ...ranges.map(range => ({ id: `area-${range.value}`, label: `${range.label} sq ft`,
      reset: { areaRanges: ranges.filter(value => value !== range).map(value => value.value), minSqft: 0, maxSqft: 100000 } })),
    ...(!ranges.length && (filters.minSqft > 0 || filters.maxSqft < 100000) ? [{
      id: 'area',
      label: filters.maxSqft >= 100000 ? `${filters.minSqft.toLocaleString('en-IN')}+ sq ft`
        : `${filters.minSqft.toLocaleString('en-IN')}–${filters.maxSqft.toLocaleString('en-IN')} sq ft`,
      reset: { areaRanges: [], minSqft: 0, maxSqft: 100000 },
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
