import EditorialLocationContent from '@/components/EditorialLocationContent';
import { editorialFaqLd, serializeEditorialLd } from '@/lib/editorialSeo';
import { Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WarehouseCard from '@/components/WarehouseCard';
import Pagination from '@/components/Pagination';
import SectionHeading from '@/components/micromarket/SectionHeading';
import { EDITORIAL_HERO_SIZES } from '@/components/micromarket/EditorialImage';
import { usePagedListings } from '@/hooks/usePagedListings';
import { SECTION_RULE } from '@/components/micromarket/tokens';
import type { EditorialPageData } from '@/loaders/locationLoader';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';
import { trackEvent } from '@/lib/analytics';
import { useListingResults } from '@/hooks/useListingAnalytics';
import { warehousePath } from '@/lib/warehouseSlug';
import { catalogueSeo } from '@/lib/catalogueSeo';
import { orderForDisplay } from '@/lib/warehouseCardData';

/** Shared CMS wireframe for state, city and micromarket /overview pages. */

const EditorialLocationPage = ({ data }: { data: EditorialPageData }) => {
  const { content, warehouses, editorial } = data;
  const { name, path, place, scope } = editorial;
  const isState = scope === 'state';
  const heroVariants = content.heroImage && data.imageVariants?.[content.heroImage.url];
  const hasFaqs = content.faqs.length > 0;

  const ordered = orderForDisplay(warehouses);
  // Six listings per page at every breakpoint, with scrolling back to the grid.
  const {
    shown,
    currentPage,
    perPage,
    totalPages: listingsPages,
    start: pageStart,
    anchorRef: listingsRef,
    goTo,
    hrefForPage,
    hydrated,
  } = usePagedListings(ordered, true, data.seedSearch);

  const listId = `overview:${path}`;
  useListingResults({ list_id: listId, placement: 'overview_grid', market_slug: path.split('/').pop(),
    page: currentPage, page_size: perPage, result_count: shown.length, total_count: warehouses.length,
    result_status: shown.length ? 'success' : 'empty' }, hydrated);

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: content.h1,
    alternateName: `Godowns for Rent in ${name}`,
    description: content.metaDescription,
    url: `${SITE_URL}${catalogueSeo(path, currentPage > 1 ? `page=${currentPage}` : '').path}`,
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORG_ID },
    keywords: [
      `warehouse for rent in ${name}`,
      `godown for rent in ${name}`,
      // "warehouse in nelamangala bangalore" — the qualified phrasing people
      // search for a locality. `place` already carries the qualifier where one
      // is warranted, and equals the name where it is not.
      ...(place !== name ? [`warehouse for rent in ${place}`] : []),
    ].join(', '),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: warehouses.length,
      itemListElement: shown.map((w, idx) => ({
        '@type': 'ListItem',
        position: pageStart + idx + 1,
        url: `${SITE_URL}${warehousePath({ id: w.id, size: w.size, warehouseType: w.warehouseType, city: w.location.city })}`,
        name: `Warehouse ${w.id}, ${w.location.city}, ${w.location.state}`,
      })),
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-wareongo-ivory font-sans">
      <PageHead
        title={content.seoTitle}
        description={content.metaDescription}
        path={path}
        image={content.heroImage?.url}
        noindex
      >
        {content.heroImage && (
          <link
            rel="preload"
            as="image"
            media="(min-width: 1024px)"
            href={heroVariants?.at(-1)?.src ?? content.heroImage.url}
            imageSrcSet={heroVariants?.map(v => `${v.src} ${v.width}w`).join(', ')}
            imageSizes={EDITORIAL_HERO_SIZES}
            fetchPriority="high"
          />
        )}
        <script type="application/ld+json">{serializeEditorialLd(collectionLd)}</script>
        {hasFaqs && <script type="application/ld+json">{serializeEditorialLd(editorialFaqLd(content.faqs))}</script>}
      </PageHead>
      <Navbar />

      <main className="flex-grow" role="main" aria-labelledby="editorial-title">
        <div className="section-container page-content pb-6 sm:pb-10">
          <Breadcrumbs
            className="mb-4 sm:mb-6"
            items={
              [
                { label: 'Home', path: '/' },
                { label: 'Listings', path: '/listings' },
                ...editorial.ancestors,
                { label: name },
              ] satisfies BreadcrumbItem[]
            }
          />

          <EditorialLocationContent data={data} inventory={index => (
            <section
              id="listings"
              ref={listingsRef as React.RefObject<HTMLElement>}
              className={`scroll-mt-24 ${SECTION_RULE}`}
            >
              <SectionHeading index={index} eyebrow="Inventory">
                {content.inventoryHeading ?? `Warehouses for Rent in ${name}`}
              </SectionHeading>

              <p className="mb-5 text-sm text-wareongo-slate">
                Showing {pageStart + 1}&ndash;{pageStart + shown.length} of {ordered.length}
                {listingsPages > 1 && ` · page ${currentPage} of ${listingsPages}`}
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {shown.map((w, idx) => (
                  <WarehouseCard
                    key={w.id}
                    // The initial grid is below the hero. Paging scrolls it into
                    // view, so prioritize its first photo on subsequent pages.
                    index={idx}
                    priority={currentPage > 1 && idx === 0}
                    analyticsContext={{ list_id: listId, placement: 'overview_grid', market_slug: path.split('/').pop(), page: currentPage, page_size: perPage, list_position: pageStart + idx + 1 }}
                    id={w.id}
                    image={w.image}
                    images={w.images}
                    coverImage={data.coverImages?.[w.images[0]]}
                    imageFallbacks={w.imageFallbacks}
                    address={w.address}
                    location={w.location}
                    size={w.size}
                    ceilingHeight={w.ceilingHeight}
                    price={w.price}
                    fireCompliance={w.fireCompliance}
                    numberOfDocks={w.numberOfDocks}
                    warehouseType={w.warehouseType}
                    micromarket={w.micromarket}
                    postalCode={w.postalCode}
                    updatedAt={w.updatedAt}
                    features={w.features}
                    href={warehousePath({ id: w.id, size: w.size, warehouseType: w.warehouseType, city: w.location.city })}
                  />
                ))}
              </div>

              <Pagination
                hrefForPage={hrefForPage}
                className="mt-8"
                currentPage={currentPage}
                totalPages={listingsPages}
                onChange={(next, direction) => {
                  if (next === currentPage) return;
                  trackEvent('listings_paginate', {
                    list_id: listId, market_slug: path.split('/').pop(), page_size: perPage,
                    from_page: currentPage,
                    to_page: next,
                    direction,
                  });
                  // Back to the top of this section, not the top of the
                  // document: the grid sits well down a long editorial page, so
                  // scrolling to 0 would strand the reader in the hero.
                  goTo(next);
                }}
              />
              {isState && (
                <Link to={editorial.listingPath} className="mt-6 inline-block text-sm font-semibold text-wareongo-blue hover:underline">
                  View all warehouses in {name} →
                </Link>
              )}
            </section>
          )} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditorialLocationPage;
