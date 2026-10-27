import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import InlineText from '@/components/InlineText';
import FAQAccordion from '@/components/FAQAccordion';
import SectionHeading from '@/components/micromarket/SectionHeading';
import MicromarketHero from '@/components/micromarket/MicromarketHero';
import EditorialImage from '@/components/micromarket/EditorialImage';
import PeerRentChart from '@/components/micromarket/PeerRentChart';
import InventoryBand from '@/components/micromarket/InventoryBand';
import SpecTable from '@/components/micromarket/SpecTable';
import { CorridorPanel, RentBySize, SpecSizeComparison, StateCitiesTable, StateCityCards, OtherCities } from '@/components/city/CityPanels';
import { CHIP, EYEBROW, PANEL, PROSE, SECTION_GAP, SECTION_RULE } from '@/components/micromarket/tokens';
import { blogSummaries as blogs } from '@/data/blogSummaries';
import { specRowsFor } from '@/lib/micromarketStats';
import type { EditorialLocationContentData } from '@/loaders/locationLoader';

/** Published editorial body, shared by overview pages and the listing footer. */
export default function EditorialLocationContent({ data, inventory, embedded = false }: {
  data: EditorialLocationContentData;
  inventory?: (index: number) => ReactNode;
  embedded?: boolean;
}) {
  const { content, stats, editorial } = data;
  const peers = data.peers ?? [];
  const { name, place, scope } = editorial;
  const isCity = scope === 'city';
  const isState = scope === 'state';
  const city = isCity ? data.cityOverview : undefined;
  const state = isState ? data.stateOverview : undefined;
  const stateCities = state?.cities ?? [];
  // A state's market figure falls back to a listing photo; other scopes show uploads only.
  const marketImage = content.marketImage ?? state?.marketImage ?? null;
  const heroVariants = content.heroImage && data.imageVariants?.[content.heroImage.url];

  // Which sections have something to say. Prose slots are optional in the CMS,
  // and a heading over an empty section is worse than no section — same rule the
  // location content templates follow: never publish half-filled copy.
  const hasMarket = Boolean(content.marketProse);
  const hasCityPanel = Boolean(city && (city.segments.large.listings > 0 || city.segments.small.listings > 0
    || (city.localityTable?.eligible && city.corridors.length > 0)));
  const hasCorridors = isCity && (Boolean(content.corridorProse) || hasCityPanel);
  const hasRents = Boolean(content.rentsProse) || peers.length > 0 || Boolean(city?.rentBySize.length);
  const hasSpec = Boolean(content.specProse) || specRowsFor(stats).length > 0;
  const hasCities = stateCities.length > 0;
  const hasCompliance = (isCity || isState) && Boolean(content.complianceProse);
  const hasFaqs = content.faqs.length > 0;

  // Number only sections rendered here; the listing footer already has its grid above.
  const intro = [...(hasMarket ? ['market'] : []), ...(hasCities ? ['cities'] : [])];
  const grid = inventory ? ['listings'] : [];
  const numbered = [
    ...(isState ? [...intro, ...grid] : [...grid, ...intro]),
    ...(hasCorridors ? ['corridors'] : []),
    ...(hasRents ? ['rents'] : []),
    ...(hasSpec ? ['specification'] : []),
    ...(hasCompliance ? ['compliance'] : []),
    ...(hasFaqs ? ['faq'] : []),
  ];
  const indexOf = (id: string) => numbered.indexOf(id) + 1;

  const siblings = city?.nearbyCities ?? state?.nearbyStates ?? peers.filter((p) => !p.isSelf);
  // The state's list in order, less the cities outside our listings.
  const cityLinks = stateCities.flatMap(({ name, path }) => path ? [{ name, path }] : []);
  const relatedBlogs = content.relatedBlogs
    .map((s) => blogs.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  // Defined here because a state renders them ahead of the listings.
  const marketSection = hasMarket && (
    <section id="market" className={SECTION_RULE}>
      <SectionHeading index={indexOf('market')} eyebrow="Market">
        {content.marketHeading ?? (isState ? `Why ${name} for Warehousing` : `Warehouse Space in ${name}: Where the Stock Sits`)}
      </SectionHeading>
      {/* Fixed figure width rather than a fraction. The prose caps its
          own measure at max-w-2xl for readability, so a fractional
          column just left a gap between where the text stopped and
          where the figure began — and a 5:4 figure in it came out
          482px tall against 192px of prose. At 22rem the figure's 4:3
          lands near the paragraph's own height. */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem] lg:gap-10">
        <p className={`max-w-2xl ${PROSE}`}><InlineText text={content.marketProse ?? ''} /></p>
        {marketImage && <EditorialImage image={marketImage} variants={data.imageVariants?.[marketImage.url]} />}
      </div>
    </section>
  );

  // State only: its chosen cities, as a table and as photo cards.
  const citiesSection = hasCities && (
    <section id="cities" className={SECTION_RULE}>
      <SectionHeading index={indexOf('cities')} eyebrow="Cities">
        {content.citiesHeading ?? `Where Warehouse Stock Sits in ${name}`}
      </SectionHeading>
      <StateCitiesTable cities={stateCities} place={name} />
      <StateCityCards cities={stateCities} imageVariants={data.imageVariants} />
      <OtherCities names={state.otherCities} />
    </section>
  );

  return (
    <>
      <section id={embedded ? "listing-overview-intro" : "overview"}>
        <MicromarketHero content={content} imageVariants={heroVariants} stats={stats} place={place}
          headingAs={embedded ? 'h2' : 'h1'}
          headingId={embedded ? 'listing-overview-title' : 'editorial-title'}
          imagePriority={!embedded}
          onBrowse={embedded || isCity || isState ? undefined : '#listings'}
          listings={!embedded && isState ? { path: editorial.listingPath, name } : undefined} />
      </section>

      <div>
        {isState && <>{marketSection}{citiesSection}</>}
        {inventory?.(indexOf('listings'))}
        {!isState && marketSection}

        {hasCorridors && (
          <section id="corridors" className={SECTION_RULE}>
            <SectionHeading index={indexOf('corridors')} eyebrow="Locations">
              {content.corridorHeading ?? `Where to Rent in ${name}`}
            </SectionHeading>
            {city && hasCityPanel && <CorridorPanel data={city} />}
            {content.corridorProse && (
              <p className={`mt-6 ${PROSE}`}><InlineText text={content.corridorProse} /></p>
            )}
          </section>
        )}

        {hasRents && (
          <section id="rents" className={SECTION_RULE}>
            <SectionHeading index={indexOf('rents')} eyebrow="Pricing">
              {content.rentsHeading ?? `Warehouse Rent in ${name}`}
            </SectionHeading>
            <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
              {peers.length > 0 && <PeerRentChart peers={peers} />}
              {content.rentsProse && (
                <p className={`max-w-2xl ${PROSE}`}>
                  <InlineText text={content.rentsProse} />
                </p>
              )}
            </div>
            {city && city.rentBySize.length > 0 && <div className="mt-6"><RentBySize bands={city.rentBySize} /></div>}
          </section>
        )}

        <div className={SECTION_GAP}>
          <InventoryBand stats={stats} heading="What You'll Find Here" excludedLabel={city ? 'land, build-to-suit or under construction' : undefined} />
        </div>

        {hasSpec && (
          <section id="specification" className={SECTION_RULE}>
            <SectionHeading index={indexOf('specification')} eyebrow="Specification">
              {content.specHeading ?? `Typical Specification in ${name}`}
            </SectionHeading>
            <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
              <SpecTable stats={stats} />
              {content.specProse && (
                <p className={`max-w-2xl ${PROSE}`}>
                  <InlineText text={content.specProse} />
                </p>
              )}
            </div>
            {city && <>
              <SpecSizeComparison cohorts={city.specsBySize} />
              <p className="mt-4 text-xs leading-relaxed text-wareongo-slate">Based on {stats.measured} existing warehouse listings. Each measure uses listings that record it; construction and flooring shares use recorded, recognised types.</p>
            </>}
          </section>
        )}

        {hasCompliance && (
          <section id="compliance" className={SECTION_RULE}>
            <SectionHeading index={indexOf('compliance')} eyebrow="Compliance">
              {content.complianceHeading ?? `Warehouse Compliance in ${name}`}
            </SectionHeading>
            <p className={PROSE}><InlineText text={content.complianceProse ?? ''} /></p>
          </section>
        )}

        {hasFaqs && (
          <section id="faq" className={SECTION_RULE}>
            <SectionHeading index={indexOf('faq')} eyebrow="FAQ">
              Frequently Asked Questions
            </SectionHeading>
            <FAQAccordion items={content.faqs} defaultOpenIndex={embedded ? null : 0} />
          </section>
        )}

        {/* Link block: siblings across, city up, editorial out. */}
        <section aria-label="Related pages" className={SECTION_RULE}>
          <dl className="space-y-5 text-sm">
            <div className="sm:flex sm:gap-6">
              <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>All listings</dt>
              <dd><Link to={editorial.listingPath} className="text-wareongo-blue hover:underline">
                Browse all warehouses in {name} →
              </Link></dd>
            </div>
            {city && city.micromarkets.length > 0 && (
              <div className="sm:flex sm:gap-6">
                <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>Micromarkets</dt>
                <dd className="flex flex-wrap gap-2">
                  {city.micromarkets.map((market) => market.path ? (
                    <Link key={market.slug} to={market.path} className={`inline-flex items-center gap-1.5 ${CHIP} px-3 py-1.5 text-wareongo-blue hover:bg-ui-tint`}>
                      {market.name}<span className="text-xs tabular-nums text-wareongo-slate">{market.listings}</span>
                    </Link>
                  ) : (
                    <span key={market.slug} className={`inline-flex items-center gap-1.5 ${CHIP} px-3 py-1.5 text-wareongo-slate`}>
                      {market.name}<span className="text-xs tabular-nums">{market.listings}</span>
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {cityLinks.length > 0 && (
              <div className="sm:flex sm:gap-6">
                <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>Cities</dt>
                <dd className="flex flex-wrap gap-2">
                  {cityLinks.map((c) => (
                    <Link key={c.path} to={c.path} className={`inline-flex items-center gap-1.5 ${CHIP} px-3 py-1.5 text-wareongo-blue hover:bg-ui-tint`}>
                      {c.name}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
            {siblings.length > 0 && (
              <div className="sm:flex sm:gap-6">
                <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>
                  {city?.nearbyLabel ?? (scope === 'state' ? (state?.nearbyStates ? 'Nearby states' : 'Other states') : 'Nearby markets')}
                </dt>
                <dd className="flex flex-wrap gap-2">
                  {siblings.map((s) => (
                    <Link
                      key={s.path}
                      to={s.path}
                      className={`inline-flex items-center gap-1.5 ${CHIP} px-3 py-1.5 text-wareongo-blue transition-colors hover:bg-ui-tint`}
                    >
                      {s.name}
                      {'medianRent' in s && typeof s.medianRent === 'number' && <span className="text-xs tabular-nums text-wareongo-slate">₹{s.medianRent}</span>}
                    </Link>
                  ))}
                </dd>
              </div>
            )}

            {editorial.up && (
              <div className="sm:flex sm:gap-6">
                <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>
                  {editorial.up.label}
                </dt>
                <dd>
                  <Link to={editorial.up.path} className="text-wareongo-blue hover:underline">
                    {editorial.up.linkLabel}
                  </Link>
                </dd>
              </div>
            )}

            {relatedBlogs.length > 0 && (
              <div className="sm:flex sm:gap-6">
                <dt className={`mb-2 min-w-[9rem] ${EYEBROW} text-wareongo-slate sm:mb-0`}>
                  Editorial
                </dt>
                <dd className="space-y-1.5">
                  {relatedBlogs.map((b) => (
                    <Link
                      key={b.slug}
                      to={`/blogs/${b.slug}`}
                      className="block text-wareongo-blue underline underline-offset-2"
                    >
                      {b.title} →
                    </Link>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <div className={`${SECTION_GAP} ${PANEL} p-6 text-center`}>
          <p className="mb-1 font-semibold text-wareongo-charcoal">
            Looking for space in {name}?
          </p>
          <p className="mb-4 text-sm text-wareongo-slate">
            Tell us the size, the compliance you need and when you want to move in. You get a
            curated shortlist within 4 hours.
          </p>
          <Link
            data-analytics-placement={embedded ? "listing_overview_footer" : "overview_footer"} to="/request-warehouse"
            className="ui-button"
          >
            Request a warehouse
          </Link>
        </div>
      </div>
    </>
  );
}
