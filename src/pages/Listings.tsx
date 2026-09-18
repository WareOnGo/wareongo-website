import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useLocation, useNavigationType } from 'react-router-dom';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHead from '@/components/PageHead';
import Pagination from '@/components/Pagination';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import { WarehouseGridSkeleton } from '@/components/PageSkeletons';
import { X } from 'lucide-react';
import ListingFilters from '@/components/ListingFilters';
import ListingsHeader from '@/components/ListingsHeader';
import { listingsQueryOptions } from '@/lib/listingsQuery';
import { useListingsPrefetch } from '@/hooks/useListingsPrefetch';
import { trackEvent } from '@/lib/analytics';
import { useListingResults } from '@/hooks/useListingAnalytics';
import { warehousePath } from '@/lib/warehouseSlug';
import type { ListingsLoaderData } from '@/loaders/warehouseLoader';
import { verifiedWarehousesLabel } from '@/data/companyStats';

import { useListingSearch } from '@/hooks/useListingSearch';
import {
  DEFAULT_FILTERS, DEFAULT_PAGE_SIZE, PAGE_SIZES, readListingSearch, toApiFilters,
  writeListingSearch, filtersFromSearchParams, changeListingFilter, micromarketsForCity, type WarehouseFilters,
} from '@/lib/listingSearch';

const analyticsFilters = (filters: WarehouseFilters) => {
  const api = toApiFilters(filters);
  return { warehouse_city: api.city ? String(api.city).split(',')[0] : undefined,
    market_slug: api.micromarket, warehouse_type: api.warehouseType,
    fire_noc: api.fireNocAvailable as boolean | undefined, min_sqft: api.minSpace as number | undefined,
    max_sqft: api.maxSpace as number | undefined, filter_count: Object.keys(api).length };
};

const Listings = () => {
  const queryClient = useQueryClient();
  // Loader baked in at SSG time (page 1, default page size). null if backend was unreachable.
  const initialData = useLoaderData() as ListingsLoaderData | null;
  const { searchParams, setSearchParams, hrefFor, hydrated } = useListingSearch();
  const location = useLocation();
  const navigationType = useNavigationType();
  const initialLocationKey = useRef(location.key);
  const hasNavigated = useRef(false);
  if (location.key !== initialLocationKey.current) hasNavigated.current = true;
  const action = useRef<{ search: string; trigger: string } | null>(null);
  const state = useMemo(() => readListingSearch(searchParams), [searchParams]);
  const { filters: appliedFilters, page: currentPage, pageSize } = state;
  const filterKey = JSON.stringify(appliedFilters);
  const [draft, setDraft] = useState({ key: filterKey, filters: appliedFilters });
  // Unsaved edits survive pagination, while a changed applied filter restores
  // the corresponding controls immediately, including browser history.
  const filters = draft.key === filterKey ? draft.filters : appliedFilters;
  useEffect(() => {
    setDraft(previous => previous.key === filterKey ? previous : { key: filterKey, filters: appliedFilters });
  }, [filterKey, appliedFilters]);
  const resultTrigger = navigationType !== 'POP' && action.current?.search === searchParams.toString()
    ? action.current.trigger
    : hasNavigated.current ? 'history' : 'deeplink';
  const changeSearch = (next: URLSearchParams, trigger: string, replace = false) => {
    action.current = { search: next.toString(), trigger };
    setSearchParams(next, { replace });
  };
  const [showFilters, setShowFilters] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const scrollAfterPaging = useRef<{ page: number; pageSize: number } | null>(null);

  useEffect(() => {
    const target = scrollAfterPaging.current;
    // Router navigation can commit later than the click. A passive effect from
    // the outgoing render must not consume the requested page's scroll.
    if (!target || target.page !== currentPage || target.pageSize !== pageSize) return;
    scrollAfterPaging.current = null;
    // Commit the skeleton (or cached cards) before moving the viewport. An
    // instant scroll also cannot be cancelled when a short final page arrives.
    resultsRef.current?.focus({ preventScroll: true });
    resultsRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [currentPage, pageSize]);

  const apiFilters = useMemo(() => toApiFilters(appliedFilters), [appliedFilters]);
  // Use the SSG-baked data only when the user hasn't filtered or paged.
  const isInitialQuery = Object.keys(apiFilters).length === 0 && currentPage === 1 && pageSize === DEFAULT_PAGE_SIZE;

  const { data, isPending, isPlaceholderData, isFetching, isError, refetch } = useQuery({
    ...listingsQueryOptions(currentPage, pageSize, apiFilters, queryClient),
    enabled: hydrated,
    initialData: isInitialQuery && initialData
      ? {
          warehouses: initialData.warehouses,
          pagination: initialData.pagination,
        }
      : undefined,
    placeholderData: keepPreviousData,
  });

  // Previous data keeps the pager's totals stable, but its cards belong to a
  // different page/filter. Background refreshes of the same page keep its cards.
  const outOfRange = !isPending && !isPlaceholderData && !isError && data &&
    currentPage > Math.max(1, data.pagination.totalPages);
  const loadingResults = isPending || isPlaceholderData || !!outOfRange;
  const warehouses = data?.warehouses ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize,
  };
  const pagerRef = useListingsPrefetch({
    page: currentPage, pageSize, filters: apiFilters, totalPages: pagination.totalPages,
    ready: hydrated && !loadingResults && !isFetching && !isError && warehouses.length > 0,
    resultsRef,
  });

  // Normalize malformed/default parameters without adding a history entry.
  // Clamp only against this query's response, never a previous filter's totals.
  const normalizedSearch = writeListingSearch(searchParams, {
    ...state, page: outOfRange ? Math.max(1, data.pagination.totalPages) : currentPage,
  }).toString();
  useEffect(() => {
    if (!hydrated || normalizedSearch === searchParams.toString()) return;
    action.current = { search: normalizedSearch, trigger: resultTrigger };
    setSearchParams(new URLSearchParams(normalizedSearch), { replace: true });
  }, [hydrated, normalizedSearch, searchParams, setSearchParams, resultTrigger]);

  const handleFilterChange = (key: keyof WarehouseFilters, value: string | number) => {
    setDraft({ key: filterKey, filters: changeListingFilter(filters, key, value) });
  };

  const handleSqftRangeChange = (values: number[]) => {
    setDraft({ key: filterKey, filters: { ...filters, minSqft: values[0], maxSqft: values[1] } });
  };

  useListingResults({ list_id: 'all_warehouses', placement: 'listings_grid', page: currentPage, page_size: pageSize,
    result_count: isError ? 0 : warehouses.length, total_count: isError ? undefined : pagination.totalItems,
    result_status: isError ? 'error' : warehouses.length ? 'success' : 'empty',
    trigger: resultTrigger, ...analyticsFilters(appliedFilters) }, hydrated && !loadingResults);

  const applyFilters = () => {
    scrollAfterPaging.current = null;
    const next = writeListingSearch(searchParams, { filters, page: 1, pageSize });
    const normalizedFilters = filtersFromSearchParams(next);
    setDraft({ key: JSON.stringify(normalizedFilters), filters: normalizedFilters });
    trackEvent('filter_apply', { list_id: 'all_warehouses', trigger: 'apply', ...analyticsFilters(normalizedFilters) });
    changeSearch(writeListingSearch(next, { filters: normalizedFilters, page: 1, pageSize }), 'apply');
  };

  const clearFilters = () => {
    scrollAfterPaging.current = null;
    trackEvent('filter_clear', { list_id: 'all_warehouses', trigger: 'clear', ...analyticsFilters(appliedFilters) });
    setDraft({ key: JSON.stringify(DEFAULT_FILTERS), filters: DEFAULT_FILTERS });
    changeSearch(writeListingSearch(searchParams, { filters: DEFAULT_FILTERS, page: 1, pageSize }), 'clear');
  };

  const hasActiveFilters = () => {
    return Boolean(
      appliedFilters.city ||
        appliedFilters.micromarket ||
        appliedFilters.fireCompliance ||
        appliedFilters.warehouseType ||
        appliedFilters.minSqft > 0 ||
        appliedFilters.maxSqft < 100000,
    );
  };

  const activeChips: { id: string; label: string; reset: Partial<WarehouseFilters> }[] = [
    ...(appliedFilters.city ? [{ id: 'city', label: `City: ${appliedFilters.city}`, reset: { city: '', micromarket: '' } }] : []),
    ...(appliedFilters.micromarket ? [{ id: 'micromarket',
      label: micromarketsForCity(appliedFilters.city).find(market => market.slug === appliedFilters.micromarket)?.canonical ?? appliedFilters.micromarket,
      reset: { micromarket: '' } }] : []),
    ...(appliedFilters.warehouseType ? [{ id: 'type', label: appliedFilters.warehouseType, reset: { warehouseType: '' } }] : []),
    ...(appliedFilters.fireCompliance === 'yes' ? [{ id: 'fire', label: 'Fire NOC required', reset: { fireCompliance: '' } }] : []),
    ...(appliedFilters.minSqft > 0 || appliedFilters.maxSqft < 100000 ? [{
      id: 'area',
      label: appliedFilters.maxSqft >= 100000 ? `${appliedFilters.minSqft.toLocaleString('en-IN')}+ sq ft`
        : `${appliedFilters.minSqft.toLocaleString('en-IN')}–${appliedFilters.maxSqft.toLocaleString('en-IN')} sq ft`,
      reset: { minSqft: 0, maxSqft: 100000 },
    }] : []),
  ];

  const removeFilter = (reset: Partial<WarehouseFilters>) => {
    const nextFilters = { ...appliedFilters, ...reset };
    scrollAfterPaging.current = null;
    setDraft({ key: JSON.stringify(nextFilters), filters: nextFilters });
    trackEvent('filter_apply', { list_id: 'all_warehouses', trigger: 'apply', ...analyticsFilters(nextFilters) });
    changeSearch(writeListingSearch(searchParams, { filters: nextFilters, page: 1, pageSize }), 'apply');
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const validSize = PAGE_SIZES.find(size => size === newPageSize);
    if (loadingResults || !validSize || validSize === pageSize) return;
    scrollAfterPaging.current = { page: 1, pageSize: validSize };
    trackEvent('listing_page_size_change', { list_id: 'all_warehouses', from_page_size: pageSize, page_size: newPageSize });
    changeSearch(writeListingSearch(searchParams, { ...state, pageSize: validSize, page: 1 }), 'page_size');
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead
        title="Warehouse & Godown for Rent in India | Verified Listings | WareOnGo"
        description={`Find warehouse & godown space for rent across India, ${verifiedWarehousesLabel} verified listings with transparent pricing. Get custom options, expert guidance & site visit within 48 hours.`}
        path="/listings"
      />
      <Navbar />

      <main className="flex-grow bg-wareongo-ivory">
        <div className="section-container">
          <ListingsHeader
            showFilters={showFilters}
            active={hasActiveFilters()}
            onToggle={() => { if (!showFilters) trackEvent('filter_open', { list_id: 'all_warehouses' }); setShowFilters(!showFilters); }}
            onClear={clearFilters}
          />

          {showFilters && <ListingFilters filters={filters} onChange={handleFilterChange}
            onAreaChange={handleSqftRangeChange} onApply={applyFilters} onClear={clearFilters} />}

          {activeChips.length > 0 && <div role="group" aria-label="Active filters" className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-wareongo-slate">Filtering by</span>
            {activeChips.map(chip => <button key={chip.id} type="button" onClick={() => removeFilter(chip.reset)}
              aria-label={`Remove ${chip.label} filter`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-wareongo-blue/25 bg-transparent px-3 text-xs text-wareongo-blue hover:border-wareongo-blue hover:bg-wareongo-blue/5">
              {chip.label}<X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </button>)}
          </div>}

          <p role="status" className="sr-only">
            {loadingResults
              ? `Loading page ${currentPage} of warehouses…`
              : isError ? 'Warehouse results could not be loaded.'
                : `${warehouses.length} warehouses shown on page ${pagination.currentPage}.`}
          </p>
          <section ref={resultsRef} aria-label="Warehouse results" aria-busy={loadingResults} tabIndex={-1} className="scroll-mt-24 focus:outline-none">
            {/* Match the page size and card proportions to avoid a collapsing grid. */}
            {loadingResults && (
              <div className="mb-12">
                <WarehouseGridSkeleton count={pageSize} />
              </div>
            )}

            {/* Error State */}
            {isError && !loadingResults && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load warehouses. Please try again later.</p>
                <button
                  onClick={() => { trackEvent('content_retry', { list_id: 'all_warehouses' }); void refetch(); }}
                  className="px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Warehouse Grid */}
            {!loadingResults && !isError && warehouses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {warehouses.map((warehouse, idx) => (
                  <WarehouseCard
                    key={warehouse.id}
                    id={warehouse.id}
                    index={idx}
                    analyticsContext={{ list_id: 'all_warehouses', placement: 'listings_grid', page: currentPage, page_size: pageSize, list_position: (currentPage - 1) * pageSize + idx + 1 }}
                    image={warehouse.image}
                    images={warehouse.images}
                    imageFallbacks={warehouse.imageFallbacks}
                    address={warehouse.address}
                    location={warehouse.location}
                    size={warehouse.size}
                    ceilingHeight={warehouse.ceilingHeight}
                    price={warehouse.price}
                    fireCompliance={warehouse.fireCompliance}
                    features={warehouse.features}
                    href={warehousePath({ id: warehouse.id, size: warehouse.size, warehouseType: warehouse.warehouseType, city: warehouse.location.city })}
                  />
                ))}
              </div>
            )}

            {/* No Results Message */}
            {!loadingResults && !isError && warehouses.length === 0 && (
              <div className="text-center py-16 border border-wareongo-blue/30 rounded-2xl">
                <p className="text-lg sm:text-xl text-wareongo-blue font-semibold mb-2">No warehouses found</p>
                <p className="text-wareongo-slate text-sm mb-6">
                  Try adjusting your filters to see more results.
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination Info and Controls */}
            {!isError && warehouses.length > 0 && (
              <div ref={pagerRef} className="text-center space-y-5">
                <p className="text-wareongo-slate text-sm">
                  {loadingResults ? `Loading page ${currentPage}…` : <>
                    Showing {warehouses.length} of {pagination.totalItems} warehouses
                    {pagination.totalPages > 1 && ` · Page ${pagination.currentPage} of ${pagination.totalPages}`}
                  </>}
                </p>

                {pagination.totalItems > 10 && (
                  <div className="flex justify-center items-center gap-3">
                    <label htmlFor="pageSize" className="text-xs uppercase tracking-[0.18em] text-wareongo-slate">
                      Per page
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      disabled={loadingResults}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-3 h-9 bg-transparent border border-wareongo-blue/30 rounded-lg text-sm text-wareongo-blue focus:outline-none focus:ring-2 focus:ring-wareongo-blue/30"
                    >
                      <option value={10}>10</option>
                      <option value={21}>21</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}

                <Pagination
                  currentPage={currentPage}
                  hrefForPage={(page) => hrefFor(writeListingSearch(searchParams, { ...state, page }))}
                  totalPages={pagination.totalPages}
                  disabled={loadingResults}
                  onChange={(page, direction) => {
                    if (loadingResults || page === currentPage) return;
                    trackEvent('listings_paginate', {
                      list_id: 'all_warehouses', page_size: pageSize,
                      from_page: pagination.currentPage,
                      to_page: page,
                      direction,
                    });
                    scrollAfterPaging.current = { page, pageSize };
                    changeSearch(writeListingSearch(searchParams, { ...state, page }), 'paginate');
                  }}
                />
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

    </div>
  );
};

export default Listings;
