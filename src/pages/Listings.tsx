import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLoaderData, useLocation, useNavigationType } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import PageHead from '@/components/PageHead';
import Pagination from '@/components/Pagination';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import { WarehouseGridSkeleton } from '@/components/PageSkeletons';
import ListingFilterChips from '@/components/ListingFilterChips';
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
  writeListingSearch as serializeListingSearch, filtersFromSearchParams, changeListingFilter, type WarehouseFilters,
} from '@/lib/listingSearch';

const analyticsFilters = (filters: WarehouseFilters) => {
  const api = toApiFilters(filters);
  return { warehouse_city: api.city ? String(api.city).split(',')[0] : undefined,
    market_slug: api.micromarket, warehouse_type: api.warehouseType,
    fire_noc: api.fireNocAvailable as boolean | undefined, min_sqft: api.minSpace as number | undefined,
    max_sqft: api.maxSpace as number | undefined, filter_count: Object.keys(api).filter(key => key !== 'locationMatch').length };
};

export function ListingsView({ initialData, preset = DEFAULT_FILTERS, header, head, listId = 'all_warehouses' }: {
  initialData: ListingsLoaderData | null;
  preset?: WarehouseFilters;
  header?: ReactNode;
  head?: ReactNode;
  listId?: string;
}) {
  const { searchParams, setSearchParams, hrefFor, hydrated } = useListingSearch(preset);
  const writeListingSearch = (search: URLSearchParams, state: ReturnType<typeof readListingSearch>) =>
    serializeListingSearch(search, state, preset);
  const location = useLocation();
  const navigationType = useNavigationType();
  const initialLocationKey = useRef(location.key);
  const hasNavigated = useRef(false);
  if (location.key !== initialLocationKey.current) hasNavigated.current = true;
  const action = useRef<{ search: string; trigger: string } | null>(null);
  const state = useMemo(() => readListingSearch(searchParams, preset), [searchParams, preset]);
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
  const filterButtonRef = useRef<HTMLButtonElement>(null);
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
  const isInitialQuery = JSON.stringify(apiFilters) === JSON.stringify(toApiFilters(preset)) && currentPage === 1 && pageSize === DEFAULT_PAGE_SIZE;

  const { data, isPending, isPlaceholderData, isFetching, isError, isLoadingError, isRefetchError, refetch } = useQuery({
    ...listingsQueryOptions(currentPage, pageSize, apiFilters),
    enabled: hydrated,
    // An older build's seed paints immediately, then refreshes in the
    // background before we preload more pages from the current inventory.
    initialDataUpdatedAt: initialData?.fetchedAt ?? 0,
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
    if (!hydrated || hrefFor(new URLSearchParams(normalizedSearch)) === `${location.pathname}${location.search}${location.hash}`) return;
    action.current = { search: normalizedSearch, trigger: resultTrigger };
    setSearchParams(new URLSearchParams(normalizedSearch), { replace: true });
  }, [hydrated, normalizedSearch, searchParams, setSearchParams, resultTrigger, hrefFor, location]);

  const handleFilterChange = (key: keyof WarehouseFilters, value: string | number) => {
    setDraft({ key: filterKey, filters: changeListingFilter(filters, key, value) });
  };

  const handleSqftRangeChange = (values: number[]) => {
    setDraft({ key: filterKey, filters: { ...filters, minSqft: values[0], maxSqft: values[1] } });
  };

  useListingResults({ list_id: listId, placement: listId === 'all_warehouses' ? 'listings_grid' : 'location_grid', page: currentPage, page_size: pageSize,
    result_count: isLoadingError ? 0 : warehouses.length, total_count: isLoadingError ? undefined : pagination.totalItems,
    result_status: isLoadingError ? 'error' : warehouses.length ? 'success' : 'empty',
    trigger: resultTrigger, ...analyticsFilters(appliedFilters) }, hydrated && !loadingResults);

  const applyFilters = () => {
    scrollAfterPaging.current = null;
    const next = writeListingSearch(searchParams, { filters, page: 1, pageSize });
    const normalizedFilters = filtersFromSearchParams(next, preset);
    setDraft({ key: JSON.stringify(normalizedFilters), filters: normalizedFilters });
    trackEvent('filter_apply', { list_id: listId, trigger: 'apply', ...analyticsFilters(normalizedFilters) });
    changeSearch(writeListingSearch(next, { filters: normalizedFilters, page: 1, pageSize }), 'apply');
    setShowFilters(false);
  };

  const clearFilters = () => {
    scrollAfterPaging.current = null;
    trackEvent('filter_clear', { list_id: listId, trigger: 'clear', ...analyticsFilters(appliedFilters) });
    setDraft({ key: JSON.stringify(DEFAULT_FILTERS), filters: DEFAULT_FILTERS });
    changeSearch(writeListingSearch(searchParams, { filters: DEFAULT_FILTERS, page: 1, pageSize }), 'clear');
  };

  const hasActiveFilters = () => {
    return Boolean(
      appliedFilters.state || appliedFilters.city ||
        appliedFilters.micromarket ||
        appliedFilters.fireCompliance ||
        appliedFilters.warehouseType ||
        appliedFilters.minSqft > 0 ||
        appliedFilters.maxSqft < 100000,
    );
  };


  const removeFilter = (reset: Partial<WarehouseFilters>) => {
    const nextFilters = { ...appliedFilters, ...reset };
    scrollAfterPaging.current = null;
    setDraft({ key: JSON.stringify(nextFilters), filters: nextFilters });
    trackEvent('filter_apply', { list_id: listId, trigger: 'apply', ...analyticsFilters(nextFilters) });
    changeSearch(writeListingSearch(searchParams, { filters: nextFilters, page: 1, pageSize }), 'apply');
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const validSize = PAGE_SIZES.find(size => size === newPageSize);
    if (loadingResults || !validSize || validSize === pageSize) return;
    scrollAfterPaging.current = { page: 1, pageSize: validSize };
    trackEvent('listing_page_size_change', { list_id: listId, from_page_size: pageSize, page_size: newPageSize });
    changeSearch(writeListingSearch(searchParams, { ...state, pageSize: validSize, page: 1 }), 'page_size');
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      {head ?? <PageHead
        title="Warehouse & Godown for Rent in India | Verified Listings | WareOnGo"
        description={`Find warehouse & godown space for rent across India, ${verifiedWarehousesLabel} verified listings with transparent pricing. Get custom options, expert guidance & site visit within 48 hours.`}
        path="/listings"
      />}
      <Navbar />

      <main className="flex-grow bg-wareongo-ivory">
        <div className="section-container">
          <ListingsHeader
            heading={header}
            showFilters={showFilters}
            active={hasActiveFilters()}
            filterButtonRef={filterButtonRef}
            onToggle={() => {
              setDraft({ key: filterKey, filters: appliedFilters });
              trackEvent('filter_open', { list_id: listId });
              setShowFilters(true);
            }}
            onClear={clearFilters}
          />

          <ListingFilters open={showFilters} onOpenChange={setShowFilters} triggerRef={filterButtonRef}
            filters={filters} onChange={handleFilterChange} onAreaChange={handleSqftRangeChange}
            onApply={applyFilters} onReset={() => setDraft({ key: filterKey, filters: DEFAULT_FILTERS })} />

          <ListingFilterChips filters={appliedFilters} onRemove={removeFilter} />

          <p role="status" className="sr-only">
            {loadingResults
              ? `Loading page ${currentPage} of warehouses…`
              : isLoadingError ? 'Warehouse results could not be loaded.'
                : `${warehouses.length} warehouses shown on page ${pagination.currentPage}.`}
          </p>
          <section ref={resultsRef} aria-label="Warehouse results" aria-busy={loadingResults} tabIndex={-1} className="scroll-mt-[calc(var(--wog-nav-height)+68px)] focus:outline-none">
            {/* Match the page size and card proportions to avoid a collapsing grid. */}
            {loadingResults && (
              <div className="mb-12">
                <WarehouseGridSkeleton count={pageSize} />
              </div>
            )}

            {/* A failed refresh still has valid data for this exact query.
                A failed new search has no data and must never show old cards. */}
            {isRefetchError && !loadingResults && (
              <div role="status" className="flex flex-wrap items-center justify-between gap-3 mb-6 px-4 py-3 border border-wareongo-blue/20 rounded-xl text-sm text-wareongo-slate">
                <p>Could not refresh listings. Showing the last loaded results.</p>
                <button
                  disabled={isFetching}
                  onClick={() => { trackEvent('content_retry', { list_id: listId }); void refetch(); }}
                  className="min-h-11 px-4 rounded-lg border border-wareongo-blue/30 text-wareongo-blue hover:bg-wareongo-blue/5 disabled:opacity-50"
                >Retry refresh</button>
              </div>
            )}
            {isLoadingError && !loadingResults && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load warehouses. Please try again later.</p>
                <button
                  onClick={() => { trackEvent('content_retry', { list_id: listId }); void refetch(); }}
                  className="px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Warehouse Grid */}
            {!loadingResults && !isLoadingError && warehouses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {warehouses.map((warehouse, idx) => (
                  <WarehouseCard
                    key={warehouse.id}
                    id={warehouse.id}
                    index={idx}
                    analyticsContext={{ list_id: listId, placement: listId === 'all_warehouses' ? 'listings_grid' : 'location_grid', page: currentPage, page_size: pageSize, list_position: (currentPage - 1) * pageSize + idx + 1 }}
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
            {!loadingResults && !isLoadingError && warehouses.length === 0 && (
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
            {!isLoadingError && warehouses.length > 0 && (
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
                      list_id: listId, page_size: pageSize,
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

export default function Listings() {
  const initialData = useLoaderData() as ListingsLoaderData | null;
  return <ListingsView initialData={initialData} />;
}
