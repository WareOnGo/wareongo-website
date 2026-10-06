import { Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { blogSummaries as blogs } from '@/data/blogSummaries';
import thumbnailFallbacks from '@/data/blogThumbnailFallbacks.json';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';

const TITLE = 'Blogs: Warehouse Leasing, Compliance & Costs in India | WareOnGo';
const DESCRIPTION =
  'Practical writing on warehousing in India: PEB vs RCC construction, Grade A specifications, compliance checklists, and how warehouse rent and lease terms work.';
const updatedDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});
const fallbackThumbnail = thumbnailFallbacks[0];

const Blogs = () => {
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blogs',
    description: DESCRIPTION,
    url: `${SITE_URL}/blogs`,
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORG_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: blogs.length,
      itemListElement: blogs.map((g, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/blogs/${g.slug}`,
        name: g.title,
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead title={TITLE} description={DESCRIPTION} path="/blogs">
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
      </PageHead>
      <Navbar />

      <main className="flex-grow" role="main" aria-labelledby="blogs-title">
        <div className="section-container page-content pb-6 sm:pb-10">
          <div className="w-full">
            <Breadcrumbs
              className="mb-4 sm:mb-6"
              items={
                [
                  { label: 'Home', path: '/' },
                  { label: 'Blogs' },
                ] satisfies BreadcrumbItem[]
              }
            />

            <header className="mb-6 sm:mb-8">
              <h1 id="blogs-title" className="ui-page-title text-wareongo-blue mb-3">
                Blogs
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-wareongo-charcoal leading-relaxed">
                Practical guides to warehouse types, compliance and leasing costs in India.
              </p>
            </header>

            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {blogs.map((g, index) => (
                <li key={g.slug} className="min-w-0">
                  <Link
                    to={`/blogs/${g.slug}`}
                    aria-labelledby={`blog-${g.slug}`}
                    className="ui-card ui-card--action grid h-full cursor-pointer grid-cols-[5rem_minmax(0,1fr)] items-start gap-3 p-3 hover:bg-ui-tint sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-4 sm:p-5 xl:grid-cols-[8rem_minmax(0,1fr)] xl:gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wareongo-blue focus-visible:ring-offset-4 focus-visible:ring-offset-wareongo-ivory"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-lg bg-ui-tint">
                      <img
                        src={g.thumbnail?.url ?? fallbackThumbnail.url}
                        alt={g.thumbnail?.alt ?? fallbackThumbnail.alt}
                        width={g.thumbnail?.width ?? fallbackThumbnail.width}
                        height={g.thumbnail?.height ?? fallbackThumbnail.height}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        onError={(event) => {
                          const image = event.currentTarget;
                          if (image.getAttribute('src') === fallbackThumbnail.url) return;
                          image.src = fallbackThumbnail.url;
                          image.alt = fallbackThumbnail.alt;
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="mb-2 text-xs leading-normal text-wareongo-charcoal">
                        Updated <time dateTime={g.updated}>{updatedDate.format(new Date(`${g.updated}T00:00:00Z`))}</time>
                      </p>
                      <h2 id={`blog-${g.slug}`} className="ui-card-title text-wareongo-blue">
                        {g.title}
                      </h2>
                      <p className="mt-2 hidden text-sm leading-relaxed text-wareongo-charcoal lg:line-clamp-2">
                        {g.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blogs;
