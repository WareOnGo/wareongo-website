import { Link, Navigate, useParams } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import { getBlogBySlug, blogs, type BlogBlock, type BlogImage } from '@/data/blogs';
import { optimizedSrc, optimizedSrcSet, BLOG_FULL_WIDTHS, BLOG_TILE_WIDTHS } from '@/lib/imageOpt';
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
  return texts.join(' ').split(/\s+/).filter(Boolean).length;
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

// Collage geometry, derived from the image count alone: 1 full width, 2 side by
// side, 3 in a row, 4 as a 2×2. Mobile keeps two columns so a pair still reads
// as a pair, and the odd tile of a 3-up spans the width rather than shrinking to
// a ~110px thumbnail. The CMS preview holds a copy of this — wareongo-cms
// lib/collage.ts — and has to change with it.
const COLLAGE_GRID: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2',
};

const collageSpan = (count: number, index: number) =>
  count === 3 && index === 0 ? 'col-span-2 sm:col-span-1' : '';

/**
 * What the browser should download for one tile, matching the grid above: a
 * third of the column for a 3-up from `sm` (where that grid turns on), otherwise
 * half. The full-width tile of a mobile 3-up asks for the whole viewport.
 */
const tileSizes = (count: number, index: number) =>
  count === 3
    ? `(min-width: 640px) 256px, ${index === 0 ? '100vw' : '50vw'}`
    : '(min-width: 768px) 384px, 50vw';

/**
 * Vercel's optimizer returns an error rather than an image when it won't serve a
 * source — an unlisted remote host, or a 402 once the account's transformation
 * quota is spent (which has happened in production before). Dropping back to the
 * raw R2 URL once turns that into a slower image instead of a broken one.
 */
const fallbackToRaw = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  const raw = img.dataset.raw;
  if (!raw || img.src === raw) return;
  img.removeAttribute('srcset');
  img.removeAttribute('sizes');
  img.src = raw;
};

const ImagesBlock = ({ images, caption }: { images: BlogImage[]; caption?: string }) => {
  const count = images.length;
  if (count === 0) return null;

  return (
    <figure className="mb-6">
      {count === 1 ? (
        // Shown at its own aspect ratio, capped in height so a portrait photo
        // can't push the rest of the blog off the screen. w-auto alongside
        // max-w-full keeps it undistorted when that cap bites.
        <img
          src={optimizedSrc(images[0].url, 1080)}
          srcSet={optimizedSrcSet(images[0].url, BLOG_FULL_WIDTHS)}
          sizes="(min-width: 768px) 768px, 100vw"
          data-raw={images[0].url}
          alt={images[0].alt}
          width={images[0].width}
          height={images[0].height}
          loading="lazy"
          decoding="async"
          onError={fallbackToRaw}
          className="mx-auto block h-auto w-auto max-h-[32rem] max-w-full rounded-2xl border border-wareongo-blue/20 bg-wareongo-blue/5"
        />
      ) : (
        <div className={`grid gap-2 sm:gap-3 ${COLLAGE_GRID[count]}`}>
          {images.map((img, i) => (
            // Tiles are cropped to a common 4:3 so rows line up whatever the
            // source photos are; the wrapper owns the box, the img fills it.
            <div
              key={img.url}
              className={`aspect-[4/3] overflow-hidden rounded-xl sm:rounded-2xl border border-wareongo-blue/20 bg-wareongo-blue/5 ${collageSpan(count, i)}`}
            >
              <img
                src={optimizedSrc(img.url, 640)}
                srcSet={optimizedSrcSet(img.url, BLOG_TILE_WIDTHS)}
                sizes={tileSizes(count, i)}
                data-raw={img.url}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                onError={fallbackToRaw}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      {caption && (
        <figcaption className="mt-2 text-center text-xs sm:text-sm text-wareongo-slate">{caption}</figcaption>
      )}
    </figure>
  );
};

// Simple prose renderer for the structured blog blocks. Deliberately plain —
// these pages exist to be read (by people and by AI engines), not to dazzle.
const Block = ({ block }: { block: BlogBlock }) => {
  switch (block.kind) {
    case 'h2':
      return (
        <h2 className="text-xl sm:text-2xl font-bold text-wareongo-blue mt-10 mb-3">{block.text}</h2>
      );
    case 'h3':
      return (
        <h3 className="text-lg sm:text-xl font-semibold text-wareongo-charcoal mt-6 mb-2">{block.text}</h3>
      );
    case 'p':
      return <p className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed mb-4">{block.text}</p>;
    case 'ul':
      return (
        <ul className="list-disc pl-5 mb-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{item}</li>
          ))}
        </ol>
      );
    case 'table':
      // Flat full-strength borders + transparent background, matching the
      // listing-card / accordion idiom.
      return (
        <div className="overflow-x-auto mb-6">
          <div className="border border-wareongo-blue rounded-2xl overflow-hidden min-w-fit">
            <table className="w-full text-left text-[13px] sm:text-sm bg-transparent">
              <thead>
                <tr className="border-b border-wareongo-blue bg-wareongo-blue/5">
                  {block.table.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 font-semibold text-wareongo-blue text-[11px] sm:text-xs uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.table.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`transition-colors hover:bg-wareongo-blue/5 ${ri < block.table.rows.length - 1 ? 'border-b border-wareongo-blue/30' : ''}`}
                  >
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-4 py-3 align-top ${ci === 0 ? 'font-medium text-wareongo-charcoal' : 'text-wareongo-slate'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'images':
      return <ImagesBlock images={block.images} caption={block.caption} />;
  }
};

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
      acceptedAnswer: { '@type': 'Answer', text: a },
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
              <p className="text-[15px] sm:text-base text-wareongo-slate leading-relaxed">{blog.summary}</p>
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
                  to="/request-warehouse"
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
