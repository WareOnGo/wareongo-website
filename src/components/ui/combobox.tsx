import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  keywords?: readonly string[];
}

interface ComboboxProps {
  id: string;
  label: string;
  value: string;
  options: readonly ComboboxOption[];
  emptyLabel: string;
  placeholder?: string;
  disabled?: boolean;
  popupBoundaryRef?: RefObject<HTMLElement>;
  onValueChange: (value: string) => void;
}

const normalize = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Searchable single selection. Typing is a draft; Enter/click commits a choice. */
export function Combobox({ id, label, value, options, emptyLabel, placeholder = emptyLabel, disabled = false, popupBoundaryRef, onValueChange }: ComboboxProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [popup, setPopup] = useState<{ above: boolean; maxHeight: number; left: number; width?: number }>({ above: false, maxHeight: 240, left: 0 });
  const selectedLabel = options.find(option => option.value === value)?.label ?? value;
  const choices = [{ value: '', label: emptyLabel }, ...options];
  // Saved links can reference a location outside the latest build catalogue.
  if (value && !options.some(option => option.value === value)) choices.push({ value, label: value });
  const words = normalize(query ?? '').trim().split(/\s+/).filter(Boolean);
  const matches = choices.filter(option => {
    const text = normalize([option.label, ...(option.keywords ?? [])].join(' '));
    return words.every(word => text.includes(word));
  });
  const expanded = open && !disabled;
  const active = expanded && activeIndex >= 0 && activeIndex < matches.length ? activeIndex : -1;

  const close = () => { setOpen(false); setQuery(null); setActiveIndex(-1); };
  const choose = (option: ComboboxOption) => { onValueChange(option.value); close(); };

  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[active];
    if (!list || !option) return;
    const bounds = list.getBoundingClientRect();
    const item = option.getBoundingClientRect();
    // Scroll the options themselves; scrollIntoView also jumps the page.
    if (item.top < bounds.top) list.scrollTop -= bounds.top - item.top;
    else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom;
  }, [active]);

  useLayoutEffect(() => {
    if (!expanded) return;
    const measure = () => {
      const bounds = inputRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      // Keep suggestions inside the modal's scrollable body as well as the
      // visual viewport, including when a mobile keyboard reduces its height.
      const boundaryElement = popupBoundaryRef?.current;
      const boundary = boundaryElement?.getBoundingClientRect();
      const top = Math.max(viewportTop, boundary?.top ?? viewportTop);
      const bottom = Math.min(viewportTop + (viewport?.height ?? window.innerHeight), boundary?.bottom ?? Infinity);
      const below = bottom - bounds.bottom;
      const above = bounds.top - top;
      const desired = Math.min(240, Math.max(1, matches.length) * 44) + 20;
      const flip = below < desired && above > below;
      const maxHeight = Math.max(44, Math.min(240, (flip ? above : below) - 20));
      // Compact, side-by-side fields still need room for full location names.
      // Expand the suggestions within the body's padding without clipping them.
      const boundaryStyle = boundaryElement ? getComputedStyle(boundaryElement) : null;
      const leftEdge = boundary ? boundary.left + parseFloat(boundaryStyle!.paddingLeft) : bounds.left;
      const rightEdge = boundary ? boundary.right - parseFloat(boundaryStyle!.paddingRight) : bounds.right;
      const width = Math.max(bounds.width, Math.min(280, rightEdge - leftEdge));
      const left = Math.max(leftEdge, Math.min(bounds.left, rightEdge - width)) - bounds.left;
      setPopup(previous => previous.above === flip && previous.maxHeight === maxHeight && previous.left === left && previous.width === width
        ? previous : { above: flip, maxHeight, left, width });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    window.visualViewport?.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('scroll', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.visualViewport?.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('scroll', measure);
    };
  }, [expanded, matches.length, popupBoundaryRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(previous => event.key === 'ArrowDown'
        ? Math.min(open ? previous + 1 : 0, matches.length - 1)
        : previous < 0 || !open ? matches.length - 1 : Math.max(0, previous - 1));
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      if (active >= 0) choose(matches[active]);
      else if (query?.trim()) {
        const typed = normalize(query.trim());
        const exact = matches.find(option => [option.label, ...(option.keywords ?? [])].some(name => normalize(name) === typed));
        if (exact || matches.length === 1) choose(exact ?? matches[0]);
      }
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === 'Tab') {
      close();
    }
  };

  return (
    <div className={`relative min-w-0 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) close();
    }}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-label={label}
          aria-autocomplete="list"
          disabled={disabled}
          aria-expanded={expanded}
          aria-controls={expanded ? listId : undefined}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query ?? selectedLabel}
          onFocus={() => { setOpen(true); setActiveIndex(-1); }}
          onClick={() => setOpen(true)}
          onChange={event => { setQuery(event.target.value); setOpen(true); setActiveIndex(-1); }}
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-xl border border-wareongo-blue/30 bg-transparent pl-3 pr-9 text-base text-wareongo-blue placeholder:text-wareongo-slate transition-colors hover:border-wareongo-blue focus:border-wareongo-blue focus:outline-none focus:ring-2 focus:ring-wareongo-blue/20 disabled:cursor-not-allowed disabled:bg-wareongo-blue/5 md:text-sm"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={`Toggle ${label.toLowerCase()} options`}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-wareongo-slate disabled:cursor-not-allowed"
          onMouseDown={event => event.preventDefault()}
          onClick={() => {
            inputRef.current?.focus();
            if (open) close();
            else { setQuery(null); setOpen(true); setActiveIndex(-1); }
          }}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>
      {expanded && (
        <div className={`absolute z-30 w-full overflow-hidden rounded-2xl border border-wareongo-blue bg-wareongo-ivory p-1.5 ${popup.above ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          style={{ left: popup.left, width: popup.width }}>
          <ul ref={listRef} id={listId} role="listbox" aria-label={`${label} options`} className="overflow-y-auto overscroll-contain" style={{ maxHeight: popup.maxHeight }}>
            {matches.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={active >= 0 ? index === active : option.value === value}
                onMouseDown={event => event.preventDefault()}
                onClick={() => choose(option)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-wareongo-blue hover:bg-wareongo-blue/5 ${index === active ? 'bg-wareongo-blue/10' : ''}`}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </li>
            ))}
          </ul>
          {matches.length === 0 && <p role="status" className="px-3 py-4 text-sm text-wareongo-slate">No matches. Try another name.</p>}
        </div>
      )}
    </div>
  );
}
