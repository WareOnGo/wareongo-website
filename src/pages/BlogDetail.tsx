import InlineText from '@/components/InlineText';
import { plainInlineText } from '@/lib/inline-format';
import { Link, Navigate, useParams } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import { getBlogBySlug, blogs, type BlogBlock, type BlogImage } from '@/data/blogs';
import { ContentBlock as Block } from '@/components/ContentBlock';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';

// Plain-text length of a blog (summary + blocks) for the Article wordCount.
const countWords = (blog: NonNullable<ReturnType<typeof getBlogBySlug>>): number => {
  const texts: string[] = [blog.summary];
  for (const b of blog.blocks) {
    if (b.kind === 'p' || b.kind === 'h2' || b.kind === 'h3') texts.push(b.text);
    else if (b.kind === 'ul' || b.kind === 'ol') texts.push(...b.items);
    else if (b.kind === 'table') texts.push(...b.table.headers, ...b.table.rows.flat());
    // Captions are visible prose; alt text is not, so it stays out of the count.
    else if (b.kind === 'images' && b.caption) texts.push(b.caption);
  }
  for (const f of blog.faqs) texts.push(f.q, f.a);
  return texts.map(plainInlineText).join(' ').split(/\s+/).filter(Boolean).length;
};

/**
 * The CMS byline is free text, so an editor can reasonably type "By the Editorial
 * Team" where only the name belongs. The page supplies the "By" itself, so strip
 * a leading one rather than render "By By …" — and strip it for the JSON-LD too,
 * where a Person's name should be the name alone.
 */
const bylineName = (author: string) => author.replace(/^\s*by\s+/i, '').trim();

/** Every blog image, in reading order — first one doubles as the page's og:image. */
const imagesIn = (blocks: BlogBlock[]): BlogImage[] =>
  blocks.flatMap((b) => (b.kind === 'images' ? b.images : []));

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const blog = slug ? getBlogBySlug(slug) : undefined;

  if (!blog) {
    return <Navigate to="/blogs" replace />;
  }

  const path = `/blogs/${blog.slug}`;
  const relatedBlogs = blog.related
    .map((s) => blogs.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  // A blog with images is better represented by its own first image than by the
  // generic site card — in the Article LD and in the social preview alike.
  const leadImage = imagesIn(blog.blocks)[0]?.url;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.description,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    datePublished: blog.published ?? blog.updated,
    dateModified: blog.updated,
    articleSection: 'Blogs',
    wordCount: countWords(blog),
    image: leadImage ?? `${SITE_URL}/og-image.jpg`,
    ...(blog.keywords && blog.keywords.length > 0 ? { keywords: blog.keywords.join(', ') } : {}),
    // GEO marking: points answer engines at the direct-answer summary block.
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#blog-summary'],
    },
    isPartOf: { '@id': WEBSITE_ID },
    // A named byline is a Person; the organisation stays the publisher either
    // way. Without a byline this is the organisation, as every blog was before.
    author: blog.author ? { '@type': 'Person', name: bylineName(blog.author) } : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
    isAccessibleForFree: true,
  };

  // Answers are fully visible on the page (no accordion), satisfying Google's
  // requirement that FAQPage schema text matches rendered content.
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: blog.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: plainInlineText(a) },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <PageHead title={blog.seoTitle} description={blog.description} path={path} image={leadImage} ogType="article">
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </PageHead>
      <Navbar />

      <main className="flex-grow" role="main" aria-labelledby="blog-title">
        <div className="section-container px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <article className="max-w-3xl mx-auto">
            <Breadcrumbs
              className="mb-4 sm:mb-6"
              items={
                [
                  { label: 'Home', path: '/' },
                  { label: 'Blogs', path: '/blogs' },
                  { label: blog.title },
                ] satisfies BreadcrumbItem[]
              }
            />

            <header className="mb-6">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">
                Blog
              </span>
              <h1 id="blog-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-wareongo-blue leading-tight mb-3">
                {blog.title}
              </h1>
              <p className="text-xs text-wareongo-slate">
                {blog.author ? (
                  <>
                    By {bylineName(blog.author)} · Updated <time dateTime={blog.updated}>{blog.updated}</time>
                  </>
                ) : (
                  <>
                    Updated <time dateTime={blog.updated}>{blog.updated}</time> · WareOnGo
                  </>
                )}
              </p>
            </header>

            {/* Direct-answer summary — the first thing answer engines extract.
                The id is referenced by the Article LD's speakable cssSelector. */}
            <div id="blog-summary" className="border-l-4 border-wareongo-blue/40 bg-wareongo-blue/5 rounded-r-xl px-4 py-3 mb-8">
              <p className="text-sm font-semibold text-wareongo-charcoal mb-1">In short</p>
              <p className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed"><InlineText text={blog.summary} /></p>
            </div>

            {blog.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}

            {/* Accordion answers stay in the DOM when collapsed (see FAQAccordion),
                so the SSG HTML always matches the FAQPage JSON-LD. */}
            <section aria-labelledby="blog-faq" className="mt-10">
              <h2 id="blog-faq" className="text-xl sm:text-2xl font-bold text-wareongo-blue mb-4">
                Frequently asked questions
              </h2>
              <FAQAccordion items={blog.faqs.map(({ q, a }) => ({ q, a }))} />
            </section>

            {relatedBlogs.length > 0 && (
              <section aria-label="Related blogs" className="mt-10">
                <h2 className="text-base font-semibold text-wareongo-charcoal mb-3">Related blogs</h2>
                <ul className="space-y-2">
                  {relatedBlogs.map((g) => (
                    <li key={g.slug}>
                      <Link to={`/blogs/${g.slug}`} className="text-wareongo-blue hover:underline">
                        {g.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* CTA — blogs feed the transactional pages */}
            <div className="mt-10 border border-wareongo-blue/20 rounded-2xl p-6 text-center">
              <p className="text-wareongo-charcoal font-semibold mb-1">Looking for warehouse space?</p>
              <p className="text-sm text-wareongo-slate mb-4">
                Browse verified, physically inspected warehouses across India, or tell us your requirement and get a
                curated shortlist within 4 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/listings"
                  className="inline-flex items-center px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors"
                >
                  Browse listings
                </Link>
                <Link
                  data-analytics-placement="blog_footer" to="/request-warehouse"
                  className="inline-flex items-center px-5 h-10 rounded-xl border border-wareongo-blue/30 text-wareongo-blue text-sm font-medium hover:bg-wareongo-blue/5 transition-colors"
                >
                  Request a warehouse
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
