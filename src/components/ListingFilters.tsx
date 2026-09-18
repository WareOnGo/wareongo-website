import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  CITY_OPTIONS, CITY_SEARCH_ALIASES, WAREHOUSE_TYPE_OPTIONS, micromarketsForCity,
  type WarehouseFilters,
} from '@/lib/listingSearch';

const cities = CITY_OPTIONS.map(city => ({ value: city, label: city, keywords: CITY_SEARCH_ALIASES[city] }));

interface ListingFiltersProps {
  filters: WarehouseFilters;
  onChange: (key: keyof WarehouseFilters, value: string | number) => void;
  onAreaChange: (values: number[]) => void;
  onApply: () => void;
  onClear: () => void;
}

const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue focus-visible:ring-offset-2 focus-visible:ring-offset-wareongo-ivory';

/** Nonmodal disclosure: tab through the controls, Escape or click outside to close. */
function FilterPopover({ label, children, trigger }: { label: string; children: ReactNode; trigger: ReactNode }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState({ above: false, height: 480, width: 352, left: 0 });

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const bounds = root.current?.getBoundingClientRect();
      if (!bounds) return;
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const bottom = top + (viewport?.height ?? window.innerHeight);
      const below = bottom - bounds.bottom;
      const above = bounds.top - top;
      const flip = below < 360 && above > below;
      const width = Math.min(352, (viewport?.width ?? window.innerWidth) - 32);
      const left = Math.max(16 - bounds.left, Math.min(0, window.innerWidth - bounds.left - width - 16));
      setPlacement({ above: flip, height: Math.max(44, (flip ? above : below) - 20), width, left });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [open]);

  return <div ref={root} className="relative min-w-0" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      button.current?.focus();
    }
  }}>
    <button ref={button} id={`${id}-trigger`} type="button" aria-label={label} aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => setOpen(!open)}
      className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-wareongo-blue/30 bg-transparent px-3 text-sm text-wareongo-blue transition-colors hover:border-wareongo-blue hover:bg-wareongo-blue/5 ${focusClass}`}>
      {trigger}<ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div id={id} role="group" aria-label={label}
      className={`absolute z-40 overflow-y-auto overscroll-contain rounded-2xl border border-wareongo-blue bg-wareongo-ivory p-5 ${placement.above ? 'bottom-full mb-2' : 'top-full mt-2'}`}
      style={{ maxHeight: placement.height, width: placement.width, left: placement.left }}>
      {children}
      <div className="mt-4 flex justify-end border-t border-wareongo-blue/10 pt-2">
        <button type="button" onClick={() => { setOpen(false); button.current?.focus(); }}
          className={`h-11 rounded-xl border border-wareongo-blue px-4 text-sm font-medium text-wareongo-blue hover:bg-wareongo-blue/5 ${focusClass}`}>Done</button>
      </div>
    </div>}
  </div>;
}

function TypeControl({ filters, onChange }: Pick<ListingFiltersProps, 'filters' | 'onChange'>) {
  return <fieldset className="min-w-0">
    <legend className="mb-2 text-xs font-medium leading-5 text-wareongo-blue">Warehouse type</legend>
    <div className="flex flex-wrap gap-0.5 rounded-xl bg-wareongo-blue/5">
      {['', ...WAREHOUSE_TYPE_OPTIONS].map(type => <button key={type} type="button"
        aria-pressed={filters.warehouseType === type} onClick={() => onChange('warehouseType', type)}
        className={`h-11 min-w-11 flex-1 rounded-xl px-2.5 text-[13px] transition-colors ${focusClass} ${filters.warehouseType === type
          ? 'bg-wareongo-blue font-medium text-wareongo-ivory'
          : 'text-wareongo-blue hover:bg-wareongo-blue/5'}`}>{type || 'Any'}</button>)}
    </div>
  </fieldset>;
}

function FireControl({ filters, onChange }: Pick<ListingFiltersProps, 'filters' | 'onChange'>) {
  const fireRequired = filters.fireCompliance === 'yes';
  return <button type="button" role="switch" aria-label="Fire NOC required" aria-checked={fireRequired}
    onClick={() => onChange('fireCompliance', fireRequired ? '' : 'yes')}
    className={`flex h-11 shrink-0 items-center gap-2.5 rounded-lg text-sm text-wareongo-blue ${focusClass}`}>
    <span aria-hidden="true" className={`flex h-6 w-10 items-center rounded-full border border-wareongo-blue p-0.5 transition-colors ${fireRequired ? 'bg-wareongo-blue' : 'bg-transparent'}`}>
      <span className={`h-4 w-4 rounded-full transition-transform ${fireRequired ? 'translate-x-4 bg-wareongo-ivory' : 'translate-x-0 bg-wareongo-blue'}`} />
    </span>
    <span>Fire NOC</span>
  </button>;
}

function AreaControls({ filters, onAreaChange }: Pick<ListingFiltersProps, 'filters' | 'onAreaChange'>) {
  const minLabel = filters.minSqft === 0 ? 'No min' : filters.minSqft.toLocaleString('en-IN');
  const maxLabel = filters.maxSqft === 100000 ? 'No max' : filters.maxSqft.toLocaleString('en-IN');
  return <fieldset className="min-w-0">
    <legend className="sr-only">Area (in sqft)</legend>
    <div aria-hidden="true" className="flex items-center justify-between gap-3 text-xs leading-5">
      <span className="font-medium text-wareongo-blue">Area (in sqft)</span>
      <span className="whitespace-nowrap tabular-nums text-wareongo-slate">{minLabel} – {maxLabel}</span>
    </div>
    <div className="px-2.5">
      <Slider min={0} max={100000} step={1000} value={[filters.minSqft, filters.maxSqft]}
        thumbLabels={['Minimum area', 'Maximum area']}
        thumbValueTexts={[filters.minSqft === 0 ? 'No minimum area' : `${minLabel} square feet`, filters.maxSqft === 100000 ? 'No maximum area' : `${maxLabel} square feet`]}
        onValueChange={onAreaChange} className="h-11" />
    </div>
  </fieldset>;
}

export default function ListingFilters({ filters, onChange, onAreaChange, onApply, onClear }: ListingFiltersProps) {
  const micromarkets = micromarketsForCity(filters.city).map(market => ({ value: market.slug, label: market.canonical }));
  const areaActive = filters.minSqft > 0 || filters.maxSqft < 100000;
  const requirementCount = Number(Boolean(filters.warehouseType)) + Number(filters.fireCompliance === 'yes') + Number(areaActive);
  return (
    <section id="listing-filters" aria-labelledby="listing-filters-heading" className="mb-6 rounded-2xl border border-wareongo-blue bg-wareongo-ivory p-3 sm:p-4">
      <h2 id="listing-filters-heading" className="sr-only">Find the right space</h2>
      <div data-filter-row="location" className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_minmax(252px,0.95fr)] lg:gap-4">
        <div className="min-w-0">
          <Label htmlFor="city" className="mb-2 block text-xs font-medium leading-5 text-wareongo-blue">City</Label>
          <Combobox id="city" label="City" value={filters.city} options={cities} emptyLabel="All cities" placeholder="All cities" onValueChange={value => onChange('city', value)} />
        </div>
        <div className="min-w-0">
          <Label htmlFor="micromarket" className={`mb-2 block text-xs font-medium leading-5 ${!filters.city ? 'text-wareongo-slate/50' : 'text-wareongo-blue'}`}>Micromarket</Label>
          <Combobox key={filters.city} id="micromarket" label="Micromarket" value={filters.micromarket}
            options={micromarkets} disabled={!filters.city} placeholder={!filters.city ? 'Select city' : 'Any locality'}
            emptyLabel="All micromarkets" onValueChange={value => onChange('micromarket', value)} />
        </div>
        <div className="hidden min-w-0 md:block"><TypeControl filters={filters} onChange={onChange} /></div>
      </div>
      <div data-filter-row="requirements" className="mt-3 flex items-center gap-2 sm:gap-3">
        <div className="mr-auto min-w-0 md:hidden">
          <FilterPopover label="More filters" trigger={<span className="flex items-center gap-1.5"><SlidersHorizontal aria-hidden="true" className="hidden h-4 w-4 min-[360px]:block" />Filters{requirementCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-wareongo-blue px-1 text-[11px] font-medium text-wareongo-ivory">{requirementCount}</span>}</span>}>
            <div className="space-y-4">
              <TypeControl filters={filters} onChange={onChange} />
              <AreaControls filters={filters} onAreaChange={onAreaChange} />
              <div className="border-t border-wareongo-blue/15 pt-2"><FireControl filters={filters} onChange={onChange} /></div>
            </div>
          </FilterPopover>
        </div>
        <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex lg:gap-6">
          <div className="min-w-0 flex-1">
            <AreaControls filters={filters} onAreaChange={onAreaChange} />
          </div>
          <FireControl filters={filters} onChange={onChange} />
        </div>
        <button type="button" onClick={onClear} className={`h-11 shrink-0 rounded-lg px-2 text-sm text-wareongo-slate transition-colors hover:bg-wareongo-blue/5 hover:text-wareongo-blue sm:px-3 ${focusClass}`}>Reset</button>
        <button type="button" aria-label="Apply filters" onClick={onApply} className={`h-11 shrink-0 rounded-xl border border-wareongo-blue bg-wareongo-blue px-4 text-sm font-medium text-wareongo-ivory transition-colors hover:bg-wareongo-blue/90 sm:px-5 ${focusClass}`}>Apply<span className="hidden md:inline"> filters</span></button>
      </div>
    </section>
  );
}
