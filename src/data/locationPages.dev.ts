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
// The prose is lorem ipsum sized to the same editorial bands the micromarket
// placeholder uses — hero 68, market 104, rents 96, spec 66 words — because the
// slots are laid out beside the same figure, chart and specification table.
// Everything else on the page is computed from live inventory by the loader, so
// what you see is the real thing wrapped around fake words.
//
// One of each kind, deliberately: a city page has a parent state to link up to
// and a state page has none, which is the only structural difference between
// the two and the thing worth eyeballing.
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
    heroProse: HERO,
    // picsum rather than an R2 object: this is a dev fixture, and imageOpt
    // passes remote URLs through untouched outside a production build anyway.
    heroImage: {
      url: 'https://picsum.photos/seed/wog-city-hero/1200/900',
      alt: '[dev] Placeholder hero image',
      width: 1200,
      height: 900,
    },
    marketProse: MARKET,
    marketImage: {
      url: 'https://picsum.photos/seed/wog-city-market/1000/800',
      alt: '[dev] Placeholder market image',
      width: 1000,
      height: 800,
    },
    rentsProse: RENTS,
    specProse: SPEC,
    faqs: FAQS,
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
