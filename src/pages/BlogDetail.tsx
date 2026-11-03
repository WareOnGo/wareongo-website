import InlineText from '@/components/InlineText';
import { plainInlineText } from '@/lib/inline-format';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHead from '@/components/PageHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import BlogCard from '@/components/blog/BlogCard';
import BlogContents from '@/components/blog/BlogContents';
import BlogEnquiry from '@/components/blog/BlogEnquiry';
import BlogShare from '@/components/blog/BlogShare';
import { getBlogBySlug, blogs, type Blog } from '@/data/blogs';
import { blogSummaries } from '@/data/blogSummaries';
import thumbnailFallbacks from '@/data/blogThumbnailFallbacks.json';
import { blogDate, blogHeadings, blogTopic, blogWordCount } from '@/lib/blogPresentation';
import { ContentBlock as Block } from '@/components/ContentBlock';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';
import '@/styles/blog.css';

const bylineName = (author: string) => author.replace(/^\s*by\s+/i, '').trim();

const BlogDetail = ({ content }: { content?: Blog } = {}) => {
  const { slug } = useParams<{ slug: string }>();
  const blog = content ?? (slug ? getBlogBySlug(slug) : undefined);
  if (!blog) return <Navigate to="/blogs" replace />;

  const path = `/blogs/${blog.slug}`;
  const url = `${SITE_URL}${path}`;
  const relatedBlogs = [...new Set(blog.related)].filter(related => related !== blog.slug)
    .map(related => blogs.find(entry => entry.slug === related)).filter((entry): entry is Blog => Boolean(entry));
  const images = blog.blocks.flatMap(block => block.kind === 'images' ? block.images : []);
  const cover = blog.thumbnail;
  // An opening image/collage already belongs to the article. Move it into the
  // cover slot with the same renderer, retaining every image and its caption.
  const openingImages = !cover && blog.blocks[0]?.kind === 'images' && blog.blocks[0].images.length
    ? blog.blocks[0] : undefined;
  const leadImage = images[0]?.url ?? cover?.url
    ?? blogSummaries.find(entry => entry.slug === blog.slug)?.thumbnail?.url
    ?? thumbnailFallbacks[0].url;
  const wordCount = blogWordCount(blog);
  const date = blogDate(blog.updated);
  const author = blog.author ? bylineName(blog.author) : 'WareOnGo';
  const headings = blogHeadings(blog.blocks);
  const headingIds = new Map(headings.map(heading => [heading.index, heading.id]));

  const articleLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: blog.title,
    description: blog.description, url, mainEntityOfPage: url,
    datePublished: blog.published ?? blog.updated, dateModified: blog.updated,
    articleSection: 'Blogs', wordCount, image: leadImage,
    ...(blog.keywords?.length ? { keywords: blog.keywords.join(', ') } : {}),
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#blog-summary'] },
    isPartOf: { '@id': WEBSITE_ID },
    author: blog.author ? { '@type': 'Person', name: author } : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID }, inLanguage: 'en', isAccessibleForFree: true,
  };
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: blog.faqs.map(({ q, a }) => ({
      '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: plainInlineText(a) },
    })),
  };

  return (
    <div className="blog-page blog-page--article min-h-screen flex flex-col">
      <PageHead title={blog.seoTitle} description={blog.description} path={path} image={leadImage} ogType="article">
        <script type="application/ld+json">{JSON.stringify(articleLd).replace(/</g, '\\u003c')}</script>
        {blog.faqs.length > 0 && <script type="application/ld+json">{JSON.stringify(faqLd).replace(/</g, '\\u003c')}</script>}
      </PageHead>
      <Navbar />
      <main className="flex-grow" aria-labelledby="blog-title">
        <div className="section-container page-content blog-shell">
          <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Blogs', path: '/blogs' }, { label: blog.title }]} />
          <article>
            <header className="blog-article__header">
              <span className="blog-tag">{blogTopic(blog.slug)}</span>
              <h1 id="blog-title" className="ui-page-title" tabIndex={-1}>{blog.title}</h1>
              <p className="blog-article__description">{blog.description}</p>
              <div className="blog-article__meta blog-tag">
                <span>By {author}</span>
                {date && <span>Updated <time dateTime={blog.updated}>{date}</time></span>}
                {wordCount > 0 && <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>}
              </div>
            </header>

            {cover && <figure key={cover.url} className="blog-article__cover">
              <img src={cover.url} alt={cover.alt} width={cover.width} height={cover.height} decoding="async"
                onError={event => { event.currentTarget.closest('figure')?.setAttribute('hidden', ''); }} />
            </figure>}
            {openingImages && <div className="blog-article__cover"><Block block={openingImages} /></div>}

            <div className="blog-article__layout">
              <div className="blog-article__share"><BlogShare key={url} url={url} title={blog.title} /></div>
              <aside className="blog-article__sidebar">
                <BlogContents key={blog.slug} headings={headings} hasFaq={blog.faqs.length > 0} />
                <BlogEnquiry placement="blog_sidebar" compact />
              </aside>
              <div className="blog-article__body">
                <div id="blog-summary" className="ui-panel blog-summary mb-8" tabIndex={-1}>
                  <p className="ui-label">In Short</p>
                  <p><InlineText text={blog.summary} /></p>
                </div>
                {blog.blocks.map((block, index) => index === 0 && openingImages ? null : <Block key={index} block={block} headingId={headingIds.get(index)} />)}
                <div className="blog-article__end">
                  <p>Written by {author}{date && <> · Updated <time dateTime={blog.updated}>{date}</time></>}</p>
                  <a href="#blog-title" className="underline underline-offset-4">Back to top</a>
                </div>
                {blog.faqs.length > 0 && <section aria-labelledby="blog-faq" className="blog-section">
                  <h2 id="blog-faq" className="ui-section-title mb-6" tabIndex={-1}>Frequently Asked Questions</h2>
                  <FAQAccordion items={blog.faqs} />
                </section>}
              </div>
            </div>
          </article>

          {relatedBlogs.length > 0 && <section aria-label="Related blogs" className="blog-section">
            <div className="blog-section__heading">
              <h2 className="ui-section-title">More Blogs</h2>
              <Link to="/blogs">View all blogs <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            <ul className={`blog-grid${relatedBlogs.length === 4 ? ' blog-grid--four' : ''}`}>
              {relatedBlogs.map(related => <li key={related.slug}>
                <BlogCard blog={blogSummaries.find(entry => entry.slug === related.slug) ?? related} />
              </li>)}
            </ul>
          </section>}
          <div className="blog-section"><BlogEnquiry placement="blog_footer" /></div>
        </div>
      </main>
      <Footer />
      <div className="blog-mobile-enquiry" aria-label="Warehouse enquiry">
        <span>A verified shortlist in 4 hours</span>
        <Link to="/request-warehouse" className="ui-button" data-analytics-placement="blog_mobile">Request a warehouse</Link>
      </div>
    </div>
  );
};

export default BlogDetail;
