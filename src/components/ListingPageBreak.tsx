import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Loader2, Phone } from 'lucide-react';
import { SHORTLIST_HOURS } from '@/data/companyStats';
import { useLeadAnalytics } from '@/hooks/useLeadAnalytics';
import { listingBreakMarkets, type ListingBreakKind } from '@/lib/listingBreaks';
import { DEFAULT_FILTERS, writeListingSearch, type WarehouseFilters, type PAGE_SIZES } from '@/lib/listingSearch';
import { fetchMicromarkets, micromarketPath } from '@/services/micromarketsAPI';
import { submitListingEnquiry, type ListingEnquiryKind } from '@/services/listingEnquiry';

interface BreakProps {
  filters: WarehouseFilters;
  listId: string;
}

function useListingLeadForm(kind: ListingEnquiryKind, { filters, listId }: BreakProps) {
  const callback = kind === 'callback';
  const id = `listing-${kind}`;
  const [values, setValues] = useState({ name: '', phone: '', size: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const inFlight = useRef(false);
  const [seen, setSeen] = useState(false);
  const analytics = useLeadAnalytics(seen, {
    form_id: id, lead_type: 'warehouse_request', placement: id.replace(/-/g, '_'),
    list_id: listId, warehouse_city: filters.city, market_slug: filters.micromarket,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || submitted) return;
    analytics.attempt();
    const digits = values.phone.replace(/\D/g, '');
    const invalid = !callback && !values.name.trim()
      ? { field: 'name', message: 'Please enter your name.' }
      : !/^\+?[0-9()\-\s]+$/.test(values.phone.trim()) || digits.length < 7 || digits.length > 15
        ? { field: 'phone', message: 'Enter a valid phone number, including the country code if outside India.' }
        : !callback && (!/^\d+$/.test(values.size) || Number(values.size) < 1 || Number(values.size) > 100000000)
          ? { field: 'size', message: 'Enter the area you need in sqft (1–10,00,00,000).' } : null;
    if (invalid) {
      setError(invalid);
      analytics.invalid(invalid.field, 'validation_format');
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${invalid.field}"]`)?.focus();
      return;
    }
    setError(null);
    inFlight.current = true;
    setSubmitting(true);
    try {
      const result = await submitListingEnquiry({ kind, ...values, filters });
      if (!result.success) {
        analytics.failure(result.errorCode);
        setError({ message: result.error || 'We couldn’t send your request. Please try again.' });
        return;
      }
      analytics.success(result.leadId);
      setSubmitted(true);
      setValues({ name: '', phone: '', size: '' });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return { values, setValues, submitting, submitted, error, setError, seen, setSeen, analytics, handleSubmit };
}

type LeadForm = ReturnType<typeof useListingLeadForm>;
const ListingLeadForms = createContext<Record<ListingEnquiryKind, LeadForm> | null>(null);

/** Own form state above the grids: responsive placement can move a form to another batch. */
export function ListingBreaksProvider({ children, ...props }: BreakProps & { children: ReactNode }) {
  const shortlist = useListingLeadForm('shortlist', props);
  const callback = useListingLeadForm('callback', props);
  return <ListingLeadForms.Provider value={{ shortlist, callback }}>{children}</ListingLeadForms.Provider>;
}

function ListingLeadBreak({ kind }: { kind: ListingEnquiryKind }) {
  const forms = useContext(ListingLeadForms);
  if (!forms) throw new Error('ListingLeadBreak requires ListingBreaksProvider');
  const callback = kind === 'callback';
  const id = `listing-${kind}`;
  const { values, setValues, submitting, submitted, error, setError, seen, setSeen, analytics, handleSubmit } = forms[kind];
  const panelRef = useRef<HTMLElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const wasSubmitted = useRef(submitted);

  useEffect(() => {
    if (!panelRef.current || seen) return;
    if (typeof IntersectionObserver !== 'function') { setSeen(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setSeen(true); observer.disconnect(); }
    });
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [seen, setSeen]);

  useEffect(() => {
    if (submitted && !wasSubmitted.current) successRef.current?.focus({ preventScroll: true });
    wasSubmitted.current = submitted;
  }, [submitted]);

  function field(name: keyof typeof values, label: string, placeholder: string) {
    return <div className="listing-break__field">
      <label className="ui-label" htmlFor={`${id}-${name}`}>{label}</label>
      <input id={`${id}-${name}`} name={name} className="ui-field" required
        type={name === 'phone' ? 'tel' : 'text'} inputMode={name === 'size' ? 'numeric' : undefined}
        autoComplete={name === 'size' ? 'off' : name === 'phone' ? 'tel' : 'name'}
        maxLength={name === 'name' ? 120 : name === 'phone' ? 20 : 9}
        placeholder={placeholder} value={values[name]}
        onChange={event => {
          setValues(current => ({ ...current, [name]: event.target.value }));
          if (error?.field === name) setError(null);
        }}
        aria-invalid={error?.field === name || undefined}
        aria-describedby={error ? `${id}-error` : undefined} />
    </div>;
  }

  return <section ref={panelRef} className={`ui-panel listing-break listing-break--${kind}`} aria-labelledby={`${id}-title`}>
    <div className="listing-break__intro">
      <div className="listing-break__heading">
        {callback && <span className="listing-break__phone-icon"><Phone size={20} aria-hidden="true" /></span>}
        <div>
          <h2 id={`${id}-title`} className="ui-card-title">{callback ? 'Talk to a Warehouse Advisor' : 'Find the Right Space'}</h2>
          <p>{callback ? 'Leave your number for help comparing spaces.'
            : <>A shortlist matched to your needs, within <strong>{SHORTLIST_HOURS} hours.</strong></>}</p>
        </div>
      </div>
    </div>
    {submitted ? <div ref={successRef} tabIndex={-1} role="status" className="listing-break__success">
      <CheckCircle2 aria-hidden="true" />
      <div><h3 className="ui-card-title">{callback ? 'Callback Requested' : 'Your Request Is In'}</h3>
        <p>{callback ? 'A warehouse advisor will call you about your search.' : `Our team will contact you with a shortlist within ${SHORTLIST_HOURS} hours.`}</p></div>
    </div> : <form {...analytics.formProps} aria-label={callback ? 'Request an advisor callback' : 'Request a warehouse shortlist'}
      onSubmit={handleSubmit} aria-busy={submitting}>
      <fieldset disabled={submitting} className="listing-break__fields">
        <legend className="sr-only">{callback ? 'Your phone number' : 'Your warehouse requirements'}</legend>
        {!callback && field('name', 'Name', 'Your name')}
        {field('phone', 'Phone Number', 'Your phone number')}
        {!callback && field('size', 'Area (sqft)', 'e.g. 25000')}
        <button type="submit" className="ui-button">
          {submitting ? <><Loader2 size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />Sending…</>
            : <>{callback ? 'Request a callback' : 'Get my shortlist'}<ArrowRight size={18} aria-hidden="true" /></>}
        </button>
      </fieldset>
      {error && <p role="alert" id={`${id}-error`} className="listing-break__error">{error.message}</p>}
    </form>}
  </section>;
}

function MicromarketBreak({ filters, search, pageSize }: { filters: WarehouseFilters; search: string; pageSize: typeof PAGE_SIZES[number] }) {
  const navigate = useNavigate();
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['listing-break-micromarkets'], queryFn: ({ signal }) => fetchMicromarkets(signal),
    staleTime: 60_000, retry: 1, refetchOnWindowFocus: false,
  });
  const markets = listingBreakMarkets(data || [], filters);
  const place = filters.city || filters.state;

  return <section className="listing-break listing-break--markets" aria-labelledby="listing-markets-title">
    <div className="listing-break__market-heading">
      <h2 id="listing-markets-title" className="ui-card-title">{place ? 'Explore Nearby' : 'Explore Micromarkets'}</h2>
      <p>{place ? `All listings in ${place}` : 'All listings by location'}</p>
    </div>
    {isPending ? <div className="listing-break__market-loading" role="status"><Loader2 size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />Finding warehouse locations…</div>
      : isError && !data ? <div className="listing-break__market-loading" role="status">Locations couldn’t be loaded.
        <button type="button" className="ui-button ui-button--secondary ui-button--compact" disabled={isFetching} onClick={() => void refetch()}>Try again</button></div>
      : markets.length ? <ul className="listing-break__markets" aria-label="Explore warehouse micromarkets">
        {markets.map(market => {
          const preset = { ...DEFAULT_FILTERS, city: market.parentCity || '', micromarket: market.slug };
          const query = writeListingSearch(new URLSearchParams(search), {
            filters: { ...filters, city: preset.city, state: '', micromarket: market.slug }, page: 1, pageSize,
          }, preset).toString();
          const href = `${micromarketPath(market)}${query ? `?${query}` : ''}`;
          return <li key={`${market.citySlug}/${market.slug}`}>
            <Link to={href} data-analytics-placement="listing_micromarkets"
              onClick={event => {
                if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                // Commit navigation before a queued scroll can replace the old
                // listing URL. Modified clicks retain the link's native behavior.
                navigate(href, { flushSync: true });
              }}
              title={`${market.listings.toLocaleString('en-IN')} total listings in ${market.name}, ${market.parentCity}`}>
              <span>{market.name}{!filters.city && <span className="listing-break__city">, {market.parentCity}</span>}</span>
              <span className="listing-break__count">{market.listings.toLocaleString('en-IN')}<span className="sr-only"> listings</span></span>
            </Link>
          </li>;
        })}
      </ul> : <p className="listing-break__market-loading">No other micromarkets are available for this location yet.</p>}
  </section>;
}

export default function ListingPageBreak({ kind, filters, search, pageSize }: {
  kind: ListingBreakKind; filters: WarehouseFilters; search: string; pageSize: typeof PAGE_SIZES[number];
}): ReactNode {
  return kind === 'micromarkets' ? <MicromarketBreak filters={filters} search={search} pageSize={pageSize} />
    : <ListingLeadBreak kind={kind} />;
}
