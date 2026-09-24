import type { LocationPageContent } from './locationPages';

// Placeholder content for previewing the city and state editorial template on
// the dev server, before anything real exists in the CMS.
//
// This file never reaches a build. It is referenced from ./locationPages.ts
// behind `__DEV_SERVER__`, which vite.config.ts defines as `command === 'serve'`
// — statically false for `build` and `build:dev` alike, so Rollup drops the
// branch and tree-shakes this module out entirely. (`import.meta.env.DEV` would
// not do: it is true under `build:dev` too.) Same arrangement as
// ./micromarkets.dev.ts.
//
// The city has review copy for its additional sections; the state keeps the
// existing lorem ipsum fixture. Inventory figures are computed by the loader.
// These examples help compare the shared layout across the two scopes.
//
// Slugs have to match a city or state the site actually builds, or the loader
// never finds this and the overview does not exist.

const HERO =
  'Lorem ipsum dolor sit amet consectetur adipiscing elit sed, do eiusmod tempor incididunt ut labore et dolore magna, aliqua. Ut enim ad minim veniam quis nostrud exercitation, ullamco laboris nisi ut aliquip ex ea commodo consequat, Duis aute. Irure dolor in reprehenderit in voluptate velit, esse cillum dolore eu fugiat nulla pariatur Excepteur sint, occaecat cupidatat non. Proident sunt in culpa qui officia, deserunt mollit anim id est.';

const MARKET =
  'Elit sed do eiusmod tempor incididunt ut labore et, dolore magna aliqua Ut enim ad minim veniam quis, nostrud. Exercitation ullamco laboris nisi ut aliquip ex ea, commodo consequat Duis aute irure dolor in reprehenderit in, voluptate velit. Esse cillum dolore eu fugiat nulla pariatur, Excepteur sint occaecat cupidatat non proident sunt in culpa, qui officia deserunt. Mollit anim id est laborum Sed, ut perspiciatis unde omnis iste natus error sit voluptatem, accusantium doloremque laudantium totam. Rem aperiam eaque ipsa quae, ab illo inventore veritatis et quasi architecto beatae vitae, dicta sunt explicabo nemo enim. Ipsam voluptatem quia voluptas, sit aspernatur aut odit aut.';

const RENTS =
  'Veniam quis nostrud exercitation ullamco laboris nisi ut aliquip, ex ea commodo consequat Duis aute irure dolor in, reprehenderit. In voluptate velit esse cillum dolore eu fugiat, nulla pariatur Excepteur sint occaecat cupidatat non proident sunt, in culpa. Qui officia deserunt mollit anim id est, laborum Sed ut perspiciatis unde omnis iste natus error, sit voluptatem accusantium. Doloremque laudantium totam rem aperiam eaque, ipsa quae ab illo inventore veritatis et quasi architecto, beatae vitae dicta sunt. Explicabo nemo enim ipsam voluptatem, quia voluptas sit aspernatur aut odit aut fugit Lorem, ipsum dolor sit amet consectetur. Adipiscing.';

const SPEC =
  'Reprehenderit in voluptate velit esse cillum dolore eu fugiat, nulla pariatur Excepteur sint occaecat cupidatat non proident sunt, in. Culpa qui officia deserunt mollit anim id est, laborum Sed ut perspiciatis unde omnis iste natus error, sit voluptatem. Accusantium doloremque laudantium totam rem aperiam eaque, ipsa quae ab illo inventore veritatis et quasi architecto, beatae vitae dicta. Sunt explicabo nemo enim ipsam voluptatem, quia voluptas sit.';

const FAQS = [
  {
    q: 'Lorem ipsum dolor sit amet consectetur?',
    a: 'Sit amet consectetur adipiscing elit sed do eiusmod tempor, incididunt ut labore et dolore magna aliqua Ut enim, ad. Minim veniam quis nostrud exercitation ullamco laboris nisi, ut aliquip ex ea commodo consequat Duis aute irure, dolor in.',
  },
  {
    q: 'Quis nostrud exercitation ullamco laboris nisi?',
    a: 'Tempor incididunt ut labore et dolore magna aliqua Ut, enim ad minim veniam quis nostrud exercitation ullamco laboris, nisi. Ut aliquip ex ea commodo consequat Duis aute, irure dolor in reprehenderit in voluptate velit esse cillum, dolore eu. Fugiat nulla pariatur Excepteur sint occaecat.',
  },
  {
    q: 'Duis aute irure dolor in reprehenderit?',
    a: 'Nisi ut aliquip ex ea commodo consequat Duis aute, irure dolor in reprehenderit in voluptate velit esse cillum, dolore. Eu fugiat nulla pariatur Excepteur sint occaecat cupidatat, non proident sunt in culpa qui officia deserunt.',
  },
];

export const DEV_LOCATION_PAGES: LocationPageContent[] = [
  {
    kind: 'CITY',
    slug: 'bengaluru',
    seoTitle: '[dev] Warehouses for Rent in Bengaluru',
    metaDescription:
      '[dev] Placeholder meta description for the city editorial template. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    h1: '[dev] Warehouse for Rent in Bengaluru',
    heroProse: "Bangalore’s warehousing is organised around the highways out of the city. Each corridor serves different goods movements, from regional distribution to manufacturing supply chains. The right location depends on where your goods enter and leave, the size of the unit and the infrastructure your operation needs. Use this overview to compare locations, asking rents and typical specifications, then browse the available spaces.",
    // picsum rather than an R2 object: this is a dev fixture, and imageOpt
    // passes remote URLs through untouched outside a production build anyway.
    heroImage: {
      url: 'https://picsum.photos/seed/wog-city-hero/1200/900',
      alt: '[dev] Placeholder hero image',
      width: 1200,
      height: 900,
    },
    marketHeading: 'Why rent a warehouse in Bangalore?',
    marketProse: 'Bangalore’s warehousing follows its outward routes. **Nelamangala** and the Tumkur Road belt serve movements towards the northwest. **Hoskote** and Old Madras Road connect the eastern side, while **Hosur Road** brings together industrial areas such as Bommasandra, Jigani and Attibele. **Devanahalli** provides a different setting for requirements connected with the airport. The starting point is the journey your goods make, rather than the distance from an office. Compare highway access with the final delivery routes, then check whether the unit can support your vehicle movements, storage system and operating hours. Larger industrial units and smaller urban godowns can have very different rents and specifications within the same city. A shortlist should reflect that distinction. The comparisons below bring those differences together so you can focus on suitable locations before arranging a visit.',
    corridorHeading: 'Where warehouse stock sits in Bangalore',
    corridorProse: 'Start with the routes that matter to your operation. The **Nelamangala / Tumkur Road** corridor serves the northwest, while **Hoskote / Old Madras Road** serves the east. **Hosur Road** connects the southern industrial areas; **Devanahalli / Airport** is relevant to northern and airport-facing requirements. Whitefield, Sarjapur and Peenya add options for smaller distribution and urban storage requirements. Mysore Road and the NICE corridor offer a southwestern approach. Compare the rent and median unit size in each group, then check individual listings for access, loading space and the documents your operation needs. Listings with ambiguous or unmapped locations remain in the unassigned row.',
    complianceHeading: 'Compliance and approvals in Bangalore',
    complianceProse: 'The documents needed for a warehouse depend on the property, its approved use and the activities planned inside it. Establish the land and building position for the shortlisted property, including whether it is in an industrial estate or on separately converted land. Ask the owner for the relevant approval documents and check that the permitted use matches your intended operation. Fire arrangements also need to be checked for the actual building and goods you plan to store. A listing’s recorded details provide a starting point for these discussions. The recorded figures show what is documented in the inventory; they do not replace a document review for an individual property. Confirm the applicable local requirements and any operational restrictions before committing to a lease.',
    marketImage: {
      url: 'https://picsum.photos/seed/wog-city-market/1000/800',
      alt: '[dev] Placeholder market image',
      width: 1000,
      height: 800,
    },
    rentsProse: 'Unit size helps explain the spread in asking rents. Smaller urban spaces can serve different uses from larger industrial warehouses, so a single city median is only a starting point. Use the size bands to find the closest comparison to your requirement, then compare the relevant locations. Check whether a quoted rate covers the same area basis, and discuss any additional charges with the counterparty. The city comparison gives broader context, while the individual listing and site visit establish what is included for a particular property.',
    specProse: 'Compare the specification for the size of unit you need. Clear height, dock provision, construction and flooring can vary considerably between smaller godowns and larger warehouses. Use these comparisons to guide a shortlist, then verify the actual usable height, loading arrangement and floor specification at the property before planning your storage or material-handling system.',
    faqs: [
      { q: 'What is the rent for a warehouse in Bangalore?', a: 'The pricing section shows asking rents from the current listing data. Compare the size band closest to your requirement, then review the corridor and individual listing.' },
      { q: 'Which part of Bangalore should I look in for my requirement?', a: 'Start with where your goods arrive and where they are delivered. Compare the highway corridors and the unit sizes available, then consider airport access, urban deliveries and proximity to your customers or suppliers.' },
      { q: 'What warehouse sizes are available in Bangalore?', a: 'The overview shows the recorded size range and median unit size. Browse the city listings to filter the available spaces against your requirement.' },
      { q: 'How do I check Fire NOC and land-use approvals?', a: 'Request the documents for the shortlisted property and confirm that the approvals cover its building and your intended activity. Recorded listing details are a starting point for that review.' },
      { q: 'Am I dealing with an owner or a broker?', a: 'Confirm the counterparty for each shortlisted property before arranging a site visit or discussing commercial terms.' },
      { q: 'How can I get a warehouse shortlist?', a: 'Use the request form to share your preferred locations, space requirement, timeline and operational needs. The team can then identify suitable options.' },
    ],
    // Left empty: the slugs would have to match real blogs, and an unresolvable
    // one is silently dropped, so a placeholder here would preview as nothing.
    relatedBlogs: [],
  },
  {
    kind: 'STATE',
    slug: 'karnataka',
    seoTitle: '[dev] Warehouses for Rent in Karnataka',
    metaDescription:
      '[dev] Placeholder meta description for the state editorial template. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    h1: '[dev] Warehouse for Rent in Karnataka',
    heroProse: HERO,
    heroImage: {
      url: 'https://picsum.photos/seed/wog-state-hero/1200/900',
      alt: '[dev] Placeholder hero image',
      width: 1200,
      height: 900,
    },
    marketProse: MARKET,
    rentsProse: RENTS,
    specProse: SPEC,
    faqs: FAQS,
    relatedBlogs: [],
  },
];
