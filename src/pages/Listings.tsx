import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLoaderData, useLocation, useNavigationType } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Head } from 'vite-react-ssg';
import PageHead from '@/components/PageHead';
import Pagination from '@/components/Pagination';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import { WarehouseGridSkeleton } from '@/components/PageSkeletons';
import ListingFilterChips from '@/components/ListingFilterChips';
import ListingFilters from '@/components/ListingFilters';
import ListingsHeader from '@/components/ListingsHeader';
import { useListingsPrefetch } from '@/hooks/useListingsPrefetch';
import { useInfiniteListings } from '@/hooks/useInfiniteListings';
import { useAutoLoadListings, useListingScroll } from '@/hooks/useListingScroll';
import { trackEvent } from '@/lib/analytics';
import { useListingResults } from '@/hooks/useListingAnalytics';
import { warehousePath } from '@/lib/warehouseSlug';
import type { ListingsLoaderData } from '@/loaders/warehouseLoader';
import { verifiedWarehousesLabel } from '@/data/companyStats';
import { config } from '@/config/config';
import { warehouseImages } from '@/lib/warehouseImages';

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

export function ListingsView({ initialData, preset = DEFAULT_FILTERS, header, head, content, listId = 'all_warehouses' }: {
  initialData: ListingsLoaderData | null;
  preset?: WarehouseFilters;
  header?: ReactNode;
  content?: ReactNode;
  head?: ReactNode | ((results: Pick<ListingsLoaderData, 'warehouses' | 'pagination'> & { search: string }) => ReactNode);
  listId?: string;
}) {
  const { searchParams, setSearchParams, hrefFor, hydrated } = useListingSearch(preset, initialData?.seedSearch);
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
  }, [currentPage, pageSize, filterKey]);

  const apiFilters = useMemo(() => toApiFilters(appliedFilters), [appliedFilters]);
  // A seed belongs to one exact filter/page/size query. Later API requests,
  // history and prefetch continue to use their existing independent cache keys.
  const isInitialQuery = JSON.stringify(apiFilters) === JSON.stringify(toApiFilters(preset))
    && pageSize === (initialData?.pagination.pageSize ?? DEFAULT_PAGE_SIZE);

  const { data, isPending, isPlaceholderData, isFetching, isPaused, isError, isLoadingError, isRefetchError, refetch,
    startPage, hasNextPage, fetchNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteListings({
    page: currentPage, pageSize, filters: apiFilters, hydrated,
    seed: isInitialQuery ? initialData ?? undefined : undefined,
  });

  const lastPage = data?.pages[data.pages.length - 1];
  const outOfRange = !isPending && !isPlaceholderData && !isError && data &&
    currentPage > Math.max(1, lastPage.pagination.totalPages);
  const loadingResults = isPending || isPlaceholderData || !!outOfRange;
  // Inventory may change between requests; keep the first occurrence of a card.
  const chunks = useMemo(() => {
    const seen = new Set<number>();
    return (data?.pages ?? []).map(chunk => ({ ...chunk, warehouses: chunk.warehouses.filter(w => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    }) }));
  }, [data]);
  const warehouses = chunks.flatMap(chunk => chunk.warehouses);
  const visiblePage = data?.pages.find(chunk => chunk.pagination.currentPage === currentPage) ?? lastPage;
  const firstWarehouse = !loadingResults && !isLoadingError ? warehouses[0] : undefined;
  const firstSource = firstWarehouse ? warehouseImages(firstWarehouse.images.length
    ? firstWarehouse.images : [firstWarehouse.image])[0]?.primary : undefined;
  const coverImage = initialData?.coverImage;
  const firstPhoto = coverImage && coverImage.source === firstSource ? coverImage.src : firstSource;
  const pagination = {
    currentPage: visiblePage?.pagination.currentPage ?? currentPage,
    // Counts can change between batches. Earlier visible pages must not revive
    // obsolete totals or links after the last response reports fewer results.
    totalPages: lastPage?.pagination.totalPages ?? 1,
    totalItems: lastPage?.pagination.totalItems ?? 0,
    pageSize,
  };
  const tailPage = lastPage?.pagination.currentPage ?? currentPage;
  const pagerRef = useListingsPrefetch({
    page: tailPage, activePage: isFetchingNextPage ? tailPage + 1 : tailPage,
    pageSize, filters: apiFilters, totalPages: pagination.totalPages,
    ready: hydrated && !loadingResults && !isFetching && !isPaused && !isError && warehouses.length > 0,
    resultsRef,
  });
  const focusNextPage = useRef<number | null>(null);
  const loadMore = (manual = false) => {
    if (!hasNextPage || isFetching || isPaused || loadingResults) return;
    if (manual) focusNextPage.current = tailPage + 1;
    trackEvent('listings_paginate', { list_id: listId, page_size: pageSize,
      from_page: tailPage, to_page: tailPage + 1, direction: 'next', trigger: manual ? 'load_more' : 'scroll' });
    void fetchNextPage({ cancelRefetch: false });
  };
  useAutoLoadListings({ sentinelRef: pagerRef, page: tailPage,
    enabled: hydrated && !loadingResults && !isFetching && !isPaused && !isError && !!hasNextPage && !showFilters,
    load: () => loadMore() });
  useListingScroll({ resultsRef, ready: hydrated && !loadingResults && !isLoadingError,
    onVisiblePage: page => {
      if (page === currentPage) return;
      const next = writeListingSearch(searchParams, { ...state, page });
      action.current = { search: next.toString(), trigger: 'scroll' };
      setSearchParams(next, { replace: true, state: { listingStartPage: startPage } });
    } });
  useEffect(() => {
    if (isFetchingNextPage || !focusNextPage.current) return;
    const link = resultsRef.current?.querySelector<HTMLElement>(`[data-listing-page="${focusNextPage.current}"] a`);
    if (link) {
      focusNextPage.current = null;
      link.focus({ preventScroll: true });
      link.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [isFetchingNextPage, data]);

  // Normalize malformed/default parameters without adding a history entry.
  // Clamp only against this query's response, never a previous filter's totals.
  const normalizedSearch = writeListingSearch(searchParams, {
    ...state, page: outOfRange ? Math.max(1, lastPage.pagination.totalPages) : currentPage,
  }).toString();
  useEffect(() => {
    if (!hydrated || hrefFor(new URLSearchParams(normalizedSearch)) === `${location.pathname}${location.search}${location.hash}`) return;
    action.current = { search: normalizedSearch, trigger: resultTrigger };
    setSearchParams(new URLSearchParams(normalizedSearch), { replace: true });
  }, [hydrated, normalizedSearch, searchParams, setSearchParams, resultTrigger, hrefFor, location]);

  const handleFilterChange = <K extends keyof WarehouseFilters,>(key: K, value: WarehouseFilters[K]) => {
    setDraft({ key: filterKey, filters: changeListingFilter(filters, key, value) });
  };

  const handleSqftRangeChange = (values: number[]) => {
    setDraft({ key: filterKey, filters: { ...filters, areaRanges: [], minSqft: values[0], maxSqft: values[1] } });
  };

  useListingResults({ list_id: listId, placement: listId === 'all_warehouses' ? 'listings_grid' : 'location_grid', page: currentPage, page_size: pageSize,
    result_count: isLoadingError ? 0 : visiblePage?.warehouses.length ?? 0, total_count: isLoadingError ? undefined : pagination.totalItems,
    result_status: isLoadingError ? 'error' : warehouses.length ? 'success' : 'empty',
    trigger: resultTrigger, ...analyticsFilters(appliedFilters) }, hydrated && !loadingResults);

  const applyFilters = () => {
    scrollAfterPaging.current = { page: 1, pageSize };
    const next = writeListingSearch(searchParams, { filters, page: 1, pageSize });
    const normalizedFilters = filtersFromSearchParams(next, preset);
    setDraft({ key: JSON.stringify(normalizedFilters), filters: normalizedFilters });
    trackEvent('filter_apply', { list_id: listId, trigger: 'apply', ...analyticsFilters(normalizedFilters) });
    changeSearch(writeListingSearch(next, { filters: normalizedFilters, page: 1, pageSize }), 'apply');
    setShowFilters(false);
  };

  const clearFilters = () => {
    scrollAfterPaging.current = { page: 1, pageSize };
    trackEvent('filter_clear', { list_id: listId, trigger: 'clear', ...analyticsFilters(appliedFilters) });
    setDraft({ key: JSON.stringify(DEFAULT_FILTERS), filters: DEFAULT_FILTERS });
    changeSearch(writeListingSearch(searchParams, { filters: DEFAULT_FILTERS, page: 1, pageSize }), 'clear');
  };

  const hasActiveFilters = () => {
    return Boolean(
      appliedFilters.state || appliedFilters.city ||
        appliedFilters.micromarket ||
        appliedFilters.fireCompliance ||
        appliedFilters.warehouseTypes.length || appliedFilters.areaRanges.length ||
        appliedFilters.minSqft > 0 ||
        appliedFilters.maxSqft < 100000,
    );
  };


  const removeFilter = (reset: Partial<WarehouseFilters>) => {
    const nextFilters = { ...appliedFilters, ...reset };
    scrollAfterPaging.current = { page: 1, pageSize };
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
      <Head>
        <link rel="preconnect" href={new URL(config.apiBaseUrl).origin} crossOrigin="anonymous" />
        {firstSource && <link rel="preconnect" href={new URL(firstSource).origin} />}
        {firstPhoto && <link rel="preload" as="image" href={firstPhoto} fetchPriority="high" />}
      </Head>
      {(typeof head === 'function' ? head({ warehouses: loadingResults || isLoadingError ? [] : visiblePage?.warehouses ?? [],
        pagination, search: searchParams.toString() }) : head) ?? <PageHead
        title="Warehouse & Godown for Rent in India | Verified Listings | WareOnGo"
        description={`Find warehouse & godown space for rent across India, ${verifiedWarehousesLabel} verified listings with transparent pricing. Get custom options, expert guidance & site visit within 48 hours.`}
        path="/listings"
      />}
      <Navbar scrollLocked={showFilters} />

      <main className="flex-grow bg-wareongo-ivory">
        <div className="section-container page-content">
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
          />

          <ListingFilters open={showFilters} onOpenChange={setShowFilters} triggerRef={filterButtonRef}
            filters={filters} onChange={handleFilterChange} onAreaChange={handleSqftRangeChange}
            onApply={applyFilters} onReset={() => setDraft({ key: filterKey, filters: DEFAULT_FILTERS })} />

          <ListingFilterChips filters={appliedFilters} onRemove={removeFilter} onClear={clearFilters} />

          <p role="status" className="sr-only">
            {isPaused ? 'Waiting for a connection. Loading will resume automatically.' : loadingResults
              ? `Loading page ${currentPage} of warehouses…`
              : isLoadingError ? 'Warehouse results could not be loaded.'
                : `${visiblePage?.warehouses.length ?? 0} warehouses shown on page ${pagination.currentPage}.`}
          </p>
          <section ref={resultsRef} aria-label="Warehouse results" aria-busy={loadingResults || isFetchingNextPage} tabIndex={-1} className="scroll-mt-[calc(var(--wog-nav-height)+68px)] focus:outline-none">
            {/* Match the page size and card proportions to avoid a collapsing grid. */}
            {loadingResults && (
              <div className="mb-12">
                <WarehouseGridSkeleton count={pageSize} />
              </div>
            )}

            {/* A failed refresh still has valid data for this exact query.
                A failed new search has no data and must never show old cards. */}
            {isRefetchError && !isFetchNextPageError && !loadingResults && (
              <div role="status" className="flex flex-wrap items-center justify-between gap-3 mb-6 px-4 py-3 border border-ui-line rounded-xl text-sm text-wareongo-slate">
                <p>Could not refresh listings. Showing the last loaded results.</p>
                <button
                  disabled={isFetching}
                  onClick={() => { trackEvent('content_retry', { list_id: listId }); void refetch(); }}
                  className="min-h-11 px-4 rounded-lg border border-ui-outline text-wareongo-blue hover:bg-ui-tint disabled:opacity-50"
                >Retry refresh</button>
              </div>
            )}
            {isLoadingError && !loadingResults && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load warehouses. Please try again later.</p>
                <button
                  onClick={() => { trackEvent('content_retry', { list_id: listId }); void refetch(); }}
                  className="px-5 h-10 rounded-xl bg-wareongo-blue text-ui-surface text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Warehouse Grid */}
            {!loadingResults && !isLoadingError && warehouses.length > 0 && (
              <div className="space-y-6 mb-8">
                {chunks.map(chunk => (
                  <div key={chunk.pagination.currentPage} data-listing-page={chunk.pagination.currentPage}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chunk.warehouses.map((warehouse, idx) => (
                      <WarehouseCard
                        key={warehouse.id}
                        id={warehouse.id}
                        index={idx}
                        priority={chunk.pagination.currentPage === startPage && idx === 0}
                        analyticsContext={{ list_id: listId, placement: listId === 'all_warehouses' ? 'listings_grid' : 'location_grid', page: chunk.pagination.currentPage, page_size: pageSize, list_position: (chunk.pagination.currentPage - 1) * pageSize + idx + 1 }}
                        image={warehouse.image}
                        images={warehouse.images}
                        imageFallbacks={warehouse.imageFallbacks}
                        coverImage={coverImage && coverImage.source === (warehouse.images[0] ?? warehouse.image)
                          ? coverImage.src : undefined}
                        address={warehouse.address}
                        location={warehouse.location}
                        size={warehouse.size}
                        ceilingHeight={warehouse.ceilingHeight}
                        price={warehouse.price}
                        fireCompliance={warehouse.fireCompliance}
                        numberOfDocks={warehouse.numberOfDocks}
                        warehouseType={warehouse.warehouseType}
                        micromarket={warehouse.micromarket}
                        postalCode={warehouse.postalCode}
                        updatedAt={warehouse.updatedAt}
                        features={warehouse.features}
                        href={warehousePath({ id: warehouse.id, size: warehouse.size, warehouseType: warehouse.warehouseType, city: warehouse.location.city })}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {!loadingResults && !isLoadingError && warehouses.length === 0 && (
              <div className="text-center py-16 border border-ui-outline rounded-xl">
                <p className="text-lg sm:text-xl text-wareongo-blue font-semibold mb-2">No warehouses found</p>
                <p className="text-wareongo-slate text-sm mb-6">
                  Try adjusting your filters to see more results.
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="ui-button"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* This marker also warms the next row before automatic loading. */}
            {!isLoadingError && warehouses.length > 0 && (
              <div className="space-y-6">
                <div ref={pagerRef} data-testid="listings-load-more" className="min-h-20 text-center space-y-3">
                  <p role="status" aria-live="polite" aria-atomic="true" className="flex items-center justify-center gap-2 text-sm text-wareongo-slate">
                    {isPaused ? 'Waiting for a connection. Loading will resume automatically.'
                      : isFetchingNextPage ? <><Loader2 aria-hidden="true" className="h-4 w-4 text-wareongo-blue animate-spin motion-reduce:animate-none" />Loading more warehouses…</>
                      : loadingResults ? 'Loading warehouses…'
                        : isFetchNextPageError ? 'Could not load more warehouses. Your results are still here.'
                          : !hasNextPage ? 'You’ve reached the end of these results.' : 'Scroll to explore more warehouses'}
                  </p>
                  {!loadingResults && <p className="text-xs text-wareongo-slate">Showing {warehouses.length} of {pagination.totalItems} warehouses</p>}
                  {hasNextPage && !isFetchingNextPage && !isPaused && !loadingResults && (
                    <Link to={hrefFor(writeListingSearch(searchParams, { ...state, page: tailPage + 1 }))}
                      data-analytics-ignore className="ui-button ui-button--secondary ui-button--compact"
                      onClick={event => {
                        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault();
                        loadMore(true);
                      }}>
                      {isFetchNextPageError ? 'Retry loading warehouses' : 'Load more warehouses'}
                    </Link>
                  )}
                </div>
                {isFetchingNextPage && <WarehouseGridSkeleton count={Math.min(pageSize, Math.max(1, pagination.totalItems - tailPage * pageSize))} />}

                <details className="group border-t border-ui-line pt-5 text-center">
                  <summary className="mx-auto w-fit min-h-11 cursor-pointer text-sm text-wareongo-slate hover:text-wareongo-blue">Browse by page</summary>
                  <div className="space-y-5 pt-3">
                    {pagination.totalItems > 10 && (
                      <div className="flex justify-center items-center gap-3">
                        <label htmlFor="pageSize" className="ui-label ui-eyebrow text-wareongo-slate">
                          Per page
                        </label>
                        <select
                          id="pageSize"
                          value={pageSize}
                          disabled={loadingResults}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                          className="px-3 h-9 bg-transparent border border-ui-outline rounded-lg text-sm text-wareongo-blue focus:outline-none focus:ring-2 focus:ring-wareongo-blue/30"
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
                </details>
              </div>
            )}
          </section>
          {content}
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
