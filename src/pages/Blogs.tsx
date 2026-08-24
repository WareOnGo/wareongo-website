import { Link } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { blogs } from '@/data/blogs';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';

const TITLE = 'Blogs — Warehouse Leasing, Compliance & Costs in India | WareOnGo';
const DESCRIPTION =
  'Practical writing on warehousing in India: PEB vs RCC construction, Grade A specifications, compliance checklists, and how warehouse rent and lease terms work.';

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
        <div className="section-container px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs
              className="mb-4 sm:mb-6"
              items={
                [
                  { label: 'Home', path: '/' },
                  { label: 'Blogs' },
                ] satisfies BreadcrumbItem[]
              }
            />

            <header className="mb-8">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">
                Knowledge base
              </span>
              <h1 id="blogs-title" className="text-3xl sm:text-4xl font-bold text-wareongo-blue mb-3 leading-tight">
                Blogs
              </h1>
              <p className="text-base sm:text-lg text-wareongo-slate leading-relaxed">
                Practical, India-specific answers on warehouse construction types, grading, compliance and
                lease economics — written from {'1,500+'} verified listings and hands-on transactions.
              </p>
            </header>

            <ul className="space-y-4">
              {blogs.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={`/blogs/${g.slug}`}
                    className="block border border-wareongo-blue/15 rounded-2xl p-5 hover:border-wareongo-blue/40 hover:bg-wareongo-blue/[0.02] transition-colors"
                  >
                    <h2 className="text-lg sm:text-xl font-semibold text-wareongo-blue mb-1">{g.title}</h2>
                    <p className="text-sm text-wareongo-slate leading-relaxed">{g.description}</p>
                    <p className="text-xs text-wareongo-slate/70 mt-2">
                      Updated <time dateTime={g.updated}>{g.updated}</time>
                    </p>
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
