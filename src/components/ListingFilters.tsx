import { useRef, type RefObject } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  CITY_OPTIONS, STATE_OPTIONS, CITY_SEARCH_ALIASES, WAREHOUSE_TYPE_OPTIONS, AREA_PRESETS,
  micromarketsForCity, selectedAreaPresets,
  type WarehouseFilters,
} from '@/lib/listingSearch';

const cities = CITY_OPTIONS.map(city => ({ value: city, label: city, keywords: CITY_SEARCH_ALIASES[city] }));
const states = STATE_OPTIONS.map(state => ({ value: state, label: state }));
const areaPresets = [{ value: '', label: 'Any area', compactLabel: 'Any' }, ...AREA_PRESETS];

interface ListingFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement>;
  filters: WarehouseFilters;
  onChange: <K extends keyof WarehouseFilters>(key: K, value: WarehouseFilters[K]) => void;
  onAreaChange: (values: number[]) => void;
  onApply: () => void;
  onReset: () => void;
}

const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue focus-visible:ring-offset-2 focus-visible:ring-offset-wareongo-ivory';

function TypeControl({ filters, onChange }: Pick<ListingFiltersProps, 'filters' | 'onChange'>) {
  return <fieldset className="min-w-0">
    <legend className="mb-1 w-full text-xs font-medium text-wareongo-blue sm:mb-3 sm:text-sm">Warehouse type<span className="float-right text-[11px] font-normal text-wareongo-slate sm:text-xs">Select any</span></legend>
    <div className="grid grid-cols-5 gap-1 sm:gap-3">
      {['', ...WAREHOUSE_TYPE_OPTIONS].map(type => {
        const selected = type ? filters.warehouseTypes.includes(type) : !filters.warehouseTypes.length;
        return <button key={type} type="button"
        aria-label={type || 'Any type'} aria-pressed={selected}
        onClick={() => onChange('warehouseTypes', type
          ? WAREHOUSE_TYPE_OPTIONS.filter(option => option === type ? !selected : filters.warehouseTypes.includes(option)) : [])}
        className={`relative h-11 min-w-0 rounded-xl border px-1 text-xs transition-colors sm:h-12 sm:px-3 sm:text-sm ${focusClass} ${selected
          ? 'border-wareongo-blue bg-wareongo-blue font-medium text-wareongo-ivory'
          : 'border-wareongo-blue/25 text-wareongo-blue hover:border-wareongo-blue hover:bg-wareongo-blue/5'}`}>
        {type || <><span className="sm:hidden">Any</span><span className="hidden sm:inline">Any type</span></>}
        {selected && type && <X aria-hidden="true" className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />}
      </button>;
      })}
    </div>
  </fieldset>;
}

function FireControl({ filters, onChange }: Pick<ListingFiltersProps, 'filters' | 'onChange'>) {
  const fireRequired = filters.fireCompliance === 'yes';
  return <button type="button" role="switch" aria-label="Fire NOC required" aria-checked={fireRequired}
    onClick={() => onChange('fireCompliance', fireRequired ? '' : 'yes')}
    className={`flex min-h-11 w-full items-center justify-between gap-5 rounded-lg text-left ${focusClass}`}>
    <span>
      <span className="block text-xs font-medium text-wareongo-blue sm:text-sm">Fire NOC required</span>
      <span className="mt-1 hidden text-sm leading-relaxed text-wareongo-slate sm:block">{fireRequired ? 'Only warehouses with Fire NOC.' : 'Include all warehouses.'}</span>
    </span>
    <span aria-hidden="true" className={`flex h-7 w-12 shrink-0 items-center rounded-full border border-wareongo-blue p-1 transition-colors ${fireRequired ? 'bg-wareongo-blue' : 'bg-transparent'}`}>
      <span className={`h-[18px] w-[18px] rounded-full transition-transform ${fireRequired ? 'translate-x-5 bg-wareongo-ivory' : 'translate-x-0 bg-wareongo-blue'}`} />
    </span>
  </button>;
}

function AreaControls({ filters, onChange, onAreaChange }: Pick<ListingFiltersProps, 'filters' | 'onChange' | 'onAreaChange'>) {
  const ranges = selectedAreaPresets(filters);
  const min = ranges.length === 1 ? ranges[0].min : filters.minSqft;
  const max = ranges.length === 1 ? ranges[0].max : filters.maxSqft;
  const minLabel = min === 0 ? 'No minimum' : min.toLocaleString('en-IN');
  const maxLabel = max === 100000 ? 'No maximum' : max.toLocaleString('en-IN');
  return <fieldset className="min-w-0">
    <legend className="mb-1 w-full text-xs font-medium text-wareongo-blue sm:mb-4 sm:text-sm">Area <span className="font-normal text-wareongo-slate">(sq ft)</span><span className="float-right text-[11px] font-normal text-wareongo-slate sm:text-xs">Select any</span></legend>
    <div role="group" aria-label="Quick area filters" className="mb-1 grid grid-cols-5 gap-1 sm:mb-5 sm:flex sm:flex-wrap sm:gap-2">
      {areaPresets.map(preset => {
        const selected = preset.value ? ranges.some(range => range.value === preset.value)
          : !ranges.length && min === 0 && max === 100000;
        return <button key={preset.label} type="button" aria-label={preset.label} aria-pressed={selected}
          onClick={() => onChange('areaRanges', preset.value
            ? AREA_PRESETS.filter(option => option.value === preset.value ? !selected : ranges.some(range => range.value === option.value)).map(option => option.value) : [])}
          className={`relative min-h-11 min-w-0 rounded-xl border px-0.5 py-2 text-[11px] transition-colors sm:px-3 sm:text-[13px] ${focusClass} ${selected
            ? 'border-wareongo-blue bg-wareongo-blue font-medium text-wareongo-ivory'
            : 'border-wareongo-blue/25 text-wareongo-blue hover:border-wareongo-blue hover:bg-wareongo-blue/5'}`}>
          <span className="sm:hidden">{preset.compactLabel}</span><span className="hidden sm:inline">{preset.label}</span>
          {selected && preset.value && <X aria-hidden="true" className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />}
        </button>;
      })}
    </div>
    {ranges.length > 1 ? <div className="text-xs text-wareongo-slate sm:text-sm">
      <p>Match any selected range.</p>
      <button type="button" onClick={() => onAreaChange([0, 100000])}
        className={`min-h-11 rounded-lg text-wareongo-blue underline underline-offset-4 ${focusClass}`}>Use a custom range</button>
    </div> : <>
    <div aria-hidden="true" className="flex justify-between gap-4 sm:mb-2">
      <div>
        <span className="mb-1 hidden text-xs text-wareongo-slate sm:block">Minimum</span>
        <span className="text-xs font-medium tabular-nums text-wareongo-blue sm:text-base">{minLabel}</span>
      </div>
      <div className="text-right">
        <span className="mb-1 hidden text-xs text-wareongo-slate sm:block">Maximum</span>
        <span className="text-xs font-medium tabular-nums text-wareongo-blue sm:text-base">{maxLabel}</span>
      </div>
    </div>
    <div className="px-2.5">
      <Slider min={0} max={100000} step={1000} value={[min, max]}
        thumbLabels={['Minimum area', 'Maximum area']}
        thumbValueTexts={[min === 0 ? 'No minimum area' : `${minLabel} square feet`, max === 100000 ? 'No maximum area' : `${maxLabel} square feet`]}
        onValueChange={onAreaChange} className="h-11" />
    </div>
    </>}
  </fieldset>;
}

export default function ListingFilters({ open, onOpenChange, triggerRef, filters, onChange, onAreaChange, onApply, onReset }: ListingFiltersProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const micromarkets = micromarketsForCity(filters.city).map(market => ({ value: market.slug, label: market.canonical }));

  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[70] bg-wareongo-blue/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
      <Dialog.Content id="listing-filters" aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[71] flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-wareongo-blue bg-wareongo-ivory font-sans shadow-2xl outline-none"
        onOpenAutoFocus={event => {
          event.preventDefault();
          // Keep the keyboard and city suggestions closed until a field is chosen.
          titleRef.current?.focus({ preventScroll: true });
        }}
        onCloseAutoFocus={event => {
          event.preventDefault();
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onEscapeKeyDown={event => {
          // Escape dismisses an open combobox first, then the modal.
          if (event.target instanceof HTMLElement && event.target.matches('[role="combobox"][aria-expanded="true"]')) event.preventDefault();
        }}>
        <div className="shrink-0 border-b border-wareongo-blue/15 px-4 py-2 sm:px-8 sm:py-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 hidden text-[10px] uppercase tracking-[0.2em] text-wareongo-slate sm:block">Your requirements</p>
              <Dialog.Title ref={titleRef} tabIndex={-1} className="py-2 text-lg max-[359px]:text-base font-bold leading-tight text-wareongo-blue outline-none sm:py-0 sm:text-3xl">Filter warehouses</Dialog.Title>
            </div>
            <Dialog.Close aria-label="Close filters" className={`-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-wareongo-blue/20 text-wareongo-blue transition-colors hover:border-wareongo-blue hover:bg-wareongo-blue/5 ${focusClass}`}>
              <X aria-hidden="true" className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only text-sm leading-relaxed text-wareongo-slate sm:not-sr-only sm:mt-2">Find the right space for your business.</Dialog.Description>
        </div>

        <div ref={bodyRef} className="min-h-0 space-y-1.5 overflow-y-auto overscroll-contain px-4 py-1.5 sm:space-y-7 sm:px-8 sm:py-7">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            <div className="min-w-0">
              <Label htmlFor="state" className="mb-1 block text-xs font-medium text-wareongo-blue sm:mb-3 sm:text-sm">State</Label>
              <Combobox id="state" label="State" value={filters.state} options={states} emptyLabel="All states" placeholder="All states"
                popupBoundaryRef={bodyRef} onValueChange={value => onChange('state', value)} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="city" className="mb-1 block text-xs font-medium text-wareongo-blue sm:mb-3 sm:text-sm">City</Label>
              <Combobox id="city" label="City" value={filters.city} options={cities} emptyLabel="All cities" placeholder="All cities"
                popupBoundaryRef={bodyRef} onValueChange={value => onChange('city', value)} />
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-1">
              <Label htmlFor="micromarket" className="mb-1 block text-xs font-medium text-wareongo-blue sm:mb-3 sm:text-sm">Micromarket</Label>
              <Combobox key={filters.city} id="micromarket" label="Micromarket" value={filters.micromarket}
                options={micromarkets} disabled={!filters.city} placeholder={!filters.city ? 'City first' : 'Any'}
                emptyLabel="All micromarkets" popupBoundaryRef={bodyRef} onValueChange={value => onChange('micromarket', value)} />
            </div>
          </div>
          <TypeControl filters={filters} onChange={onChange} />
          <AreaControls filters={filters} onChange={onChange} onAreaChange={onAreaChange} />
          <div className="border-t border-wareongo-blue/15 pt-1 sm:pt-6"><FireControl filters={filters} onChange={onChange} /></div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-wareongo-blue/15 px-4 py-2 sm:px-8 sm:py-5">
          <button type="button" onClick={onReset} className={`-ml-2 h-11 rounded-xl px-2 text-sm font-medium text-wareongo-slate transition-colors hover:bg-wareongo-blue/5 hover:text-wareongo-blue sm:h-12 sm:px-3 ${focusClass}`}>Reset</button>
          <button type="button" onClick={onApply} className={`h-11 rounded-xl border border-wareongo-blue bg-wareongo-blue px-5 text-sm font-medium text-wareongo-ivory transition-colors hover:bg-wareongo-blue/90 sm:h-12 sm:px-8 ${focusClass}`}>Apply filters</button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
