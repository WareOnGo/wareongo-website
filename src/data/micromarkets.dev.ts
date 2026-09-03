import type { MicromarketContent } from './micromarkets';

// Placeholder content for previewing the micromarket editorial template on the
// dev server, before anything real exists in the CMS.
//
// This file never reaches a build. It is referenced from ./micromarkets.ts
// behind `__DEV_SERVER__`, which vite.config.ts defines as `command === 'serve'`
// — statically false for `build` and `build:dev` alike, so Rollup drops the
// branch and tree-shakes this module out entirely. (`import.meta.env.DEV` would
// not do: it is true under `build:dev` too.)
//
// The prose is lorem ipsum sized to sit within each slot's editorial band AND
// to roughly balance whatever it is laid out beside — the paragraph heights were
// measured against the figure, the chart and the specification table, then the
// word counts picked from the band to match. Hero 68, market 104, rents 96,
// spec 66. Everything else on the
// page — the stat tiles, the peer rent chart, the specification table, the
// listing grid — is computed from live inventory by the loader, so what you see
// is the real thing wrapped around fake words.
//
// Slugs have to match a micromarket the site actually builds, or the loader
// never finds this and the URL keeps serving the plain listing grid.

export const DEV_MICROMARKETS: MicromarketContent[] = [
  {
    citySlug: 'bengaluru',
    slug: 'nelamangala',
    seoTitle: '[dev] Warehouses for Rent in Nelamangala, Bengaluru',
    metaDescription:
      '[dev] Placeholder meta description for the micromarket editorial template. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    h1: '[dev] Warehouse for Rent in Nelamangala, Bengaluru',
    heroProse:
      'Lorem ipsum dolor sit amet consectetur adipiscing elit sed, do eiusmod tempor incididunt ut labore et dolore magna, aliqua. Ut enim ad minim veniam quis nostrud exercitation, ullamco laboris nisi ut aliquip ex ea commodo consequat, Duis aute. Irure dolor in reprehenderit in voluptate velit, esse cillum dolore eu fugiat nulla pariatur Excepteur sint, occaecat cupidatat non. Proident sunt in culpa qui officia, deserunt mollit anim id est.',
    // picsum rather than an R2 object: this is a dev fixture, and imageOpt
    // passes remote URLs through untouched outside a production build anyway.
    heroImage: {
      url: 'https://picsum.photos/seed/wog-micromarket-hero/1200/900',
      alt: '[dev] Placeholder hero image',
      width: 1200,
      height: 900,
    },
    marketProse:
      'Elit sed do eiusmod tempor incididunt ut labore et, dolore magna aliqua Ut enim ad minim veniam quis, nostrud. Exercitation ullamco laboris nisi ut aliquip ex ea, commodo consequat Duis aute irure dolor in reprehenderit in, voluptate velit. Esse cillum dolore eu fugiat nulla pariatur, Excepteur sint occaecat cupidatat non proident sunt in culpa, qui officia deserunt. Mollit anim id est laborum Sed, ut perspiciatis unde omnis iste natus error sit voluptatem, accusantium doloremque laudantium totam. Rem aperiam eaque ipsa quae, ab illo inventore veritatis et quasi architecto beatae vitae, dicta sunt explicabo nemo enim. Ipsam voluptatem quia voluptas, sit aspernatur aut odit aut.',
    marketImage: {
      url: 'https://picsum.photos/seed/wog-micromarket-market/1000/800',
      alt: '[dev] Placeholder market image',
      width: 1000,
      height: 800,
    },
    rentsProse:
      'Veniam quis nostrud exercitation ullamco laboris nisi ut aliquip, ex ea commodo consequat Duis aute irure dolor in, reprehenderit. In voluptate velit esse cillum dolore eu fugiat, nulla pariatur Excepteur sint occaecat cupidatat non proident sunt, in culpa. Qui officia deserunt mollit anim id est, laborum Sed ut perspiciatis unde omnis iste natus error, sit voluptatem accusantium. Doloremque laudantium totam rem aperiam eaque, ipsa quae ab illo inventore veritatis et quasi architecto, beatae vitae dicta sunt. Explicabo nemo enim ipsam voluptatem, quia voluptas sit aspernatur aut odit aut fugit Lorem, ipsum dolor sit amet consectetur. Adipiscing.',
    specProse:
      'Reprehenderit in voluptate velit esse cillum dolore eu fugiat, nulla pariatur Excepteur sint occaecat cupidatat non proident sunt, in. Culpa qui officia deserunt mollit anim id est, laborum Sed ut perspiciatis unde omnis iste natus error, sit voluptatem. Accusantium doloremque laudantium totam rem aperiam eaque, ipsa quae ab illo inventore veritatis et quasi architecto, beatae vitae dicta. Sunt explicabo nemo enim ipsam voluptatem, quia voluptas sit.',
    faqs: [
      {
        q: 'Lorem ipsum dolor sit amet consectetur?',
        a:
          'Sit amet consectetur adipiscing elit sed do eiusmod tempor, incididunt ut labore et dolore magna aliqua Ut enim, ad. Minim veniam quis nostrud exercitation ullamco laboris nisi, ut aliquip ex ea commodo consequat Duis aute irure, dolor in.',
      },
      {
        q: 'Quis nostrud exercitation ullamco laboris nisi?',
        a:
          'Tempor incididunt ut labore et dolore magna aliqua Ut, enim ad minim veniam quis nostrud exercitation ullamco laboris, nisi. Ut aliquip ex ea commodo consequat Duis aute, irure dolor in reprehenderit in voluptate velit esse cillum, dolore eu. Fugiat nulla pariatur Excepteur sint occaecat.',
      },
      {
        q: 'Duis aute irure dolor in reprehenderit?',
        a:
          'Nisi ut aliquip ex ea commodo consequat Duis aute, irure dolor in reprehenderit in voluptate velit esse cillum, dolore. Eu fugiat nulla pariatur Excepteur sint occaecat cupidatat, non proident sunt in culpa qui officia deserunt.',
      },
      {
        q: 'Excepteur sint occaecat cupidatat non proident?',
        a:
          'Dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat, non proident sunt in culpa qui officia deserunt mollit, anim. Id est laborum Sed ut perspiciatis unde omnis, iste natus error sit voluptatem accusantium doloremque laudantium totam, rem aperiam. Eaque ipsa quae.',
      },
    ],
    // Left empty: the slugs would have to match real blogs, and an unresolvable
    // one is silently dropped, so a placeholder here would preview as nothing.
    relatedBlogs: [],
  },
];
