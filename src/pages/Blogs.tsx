import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import PageHead from '@/components/PageHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogCard from '@/components/blog/BlogCard';
import BlogEnquiry from '@/components/blog/BlogEnquiry';
import { Input } from '@/components/ui/input';
import { blogSummaries, type BlogSummary } from '@/data/blogSummaries';
import thumbnailFallbacks from '@/data/blogThumbnailFallbacks.json';
import { blogTopic, filterBlogs, newestBlogs, STARTER_GUIDES } from '@/lib/blogPresentation';
import { SITE_URL, ORG_ID, WEBSITE_ID } from '@/config/config';
import '@/styles/blog.css';

const TITLE = 'Blogs: Warehouse Leasing, Compliance & Costs in India | WareOnGo';
const DESCRIPTION =
  'Practical writing on warehousing in India: PEB vs RCC construction, Grade A specifications, compliance checklists, and how warehouse rent and lease terms work.';
const TOPIC_ORDER = ['Leasing', 'Warehousing', 'Compliance', 'Market Insights', 'Guides'];

const Blogs = ({ entries = blogSummaries }: { entries?: BlogSummary[] } = {}) => {
  const [params, setParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const blogs = useMemo(() => newestBlogs(entries), [entries]);
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const blog of blogs) result.set(blogTopic(blog.slug), (result.get(blogTopic(blog.slug)) ?? 0) + 1);
    return result;
  }, [blogs]);
  const topics = ['All', ...TOPIC_ORDER.filter(topic => counts.has(topic))];
  const query = params.get('q') ?? '';
  const topic = topics.includes(params.get('topic') ?? '') ? params.get('topic')! : 'All';
  const filtered = useMemo(() => filterBlogs(blogs, query, topic), [blogs, query, topic]);
  const filtering = Boolean(query.trim()) || topic !== 'All';
  const featured = blogs[0];
  const starters = STARTER_GUIDES.flatMap(guide => {
    const blog = blogs.find(entry => entry.slug === guide.slug);
    return blog ? [{ ...guide, blog }] : [];
  });
  const updateFilter = (key: 'q' | 'topic', value: string) => {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value && !(key === 'topic' && value === 'All')) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: key === 'q', preventScrollReset: true });
  };
  const reset = () => {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.delete('q'); next.delete('topic');
      return next;
    }, { preventScrollReset: true });
    searchRef.current?.focus();
  };
  const collectionLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Blogs',
    description: DESCRIPTION, url: `${SITE_URL}/blogs`,
    isPartOf: { '@id': WEBSITE_ID }, provider: { '@id': ORG_ID },
    mainEntity: {
      '@type': 'ItemList', numberOfItems: filtered.length,
      itemListElement: filtered.map((blog, index) => ({
        '@type': 'ListItem', position: index + 1, url: `${SITE_URL}/blogs/${blog.slug}`, name: blog.title,
      })),
    },
  };

  return (
    <div className="blog-page min-h-screen flex flex-col">
      <PageHead title={TITLE} description={DESCRIPTION} path="/blogs" image={featured?.thumbnail?.url ?? thumbnailFallbacks[0].url}>
        <script type="application/ld+json">{JSON.stringify(collectionLd).replace(/</g, '\\u003c')}</script>
      </PageHead>
      <Navbar />
      <main className="flex-grow" aria-labelledby="blogs-title">
        <div className="section-container page-content blog-shell">
          <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Blogs' }]} />
          <header className="blog-intro">
            <p className="ui-label mb-4">WareOnGo Knowledge Base</p>
            <h1 id="blogs-title" className="ui-page-title">Everything to Know About a Warehouse</h1>
            <p className="blog-intro__description">All we've learned from leasing warehouses across India,<br className="blog-intro__break" />{' '}so you can sign with your eyes open.</p>
          </header>

          <div className="blog-tools">
            <form role="search" aria-label="Search blogs" onSubmit={event => event.preventDefault()} className="blog-search">
              <label htmlFor="blog-search" className="sr-only">Search blogs</label>
              <Search size={20} aria-hidden="true" />
              <Input ref={searchRef} id="blog-search" type="search" value={query} autoComplete="off"
                placeholder={'Search blogs, e.g. "fire NOC"'} aria-controls="blog-results"
                onChange={event => updateFilter('q', event.target.value)} />
              {query && <button type="button" className="blog-search__clear" aria-label="Clear search"
                onClick={() => { updateFilter('q', ''); searchRef.current?.focus(); }}><X size={18} aria-hidden="true" /></button>}
            </form>
            <div className="blog-topics" role="group" aria-label="Filter blogs by topic">
              {topics.map(name => <button type="button" key={name} className="blog-topic" aria-pressed={topic === name}
                aria-controls="blog-results" onClick={() => updateFilter('topic', name)}>
                {name} <span className="blog-topic__count">{name === 'All' ? blogs.length : counts.get(name)}</span>
              </button>)}
            </div>
          </div>

          {!filtering && featured && <section aria-label="Featured article"><BlogCard blog={featured} featured /></section>}

          {!filtering && starters.length > 0 && <section className="blog-section blog-section--starters" aria-labelledby="blog-starters-title">
            <div className="blog-section__heading"><h2 id="blog-starters-title" className="ui-section-title">New to Warehousing? Start Here</h2></div>
            <ul className="blog-starters">
              {starters.map(({ slug, label, blog }) => <li key={slug}>
                <BlogCard blog={blog} eyebrow={label} />
              </li>)}
            </ul>
          </section>}

          <section className="blog-section" aria-labelledby="blog-results-title" id="blog-results">
            <div className="blog-section__heading">
              <h2 id="blog-results-title" className="ui-section-title">{filtering ? 'Search Results' : 'All Blogs'}</h2>
              <p className="text-xs" role="status">{filtered.length} {filtered.length === 1 ? 'article' : 'articles'} · Most recently updated</p>
            </div>
            {filtered.length > 0 ? <ul className="blog-grid">
              {filtered.map(blog => <li key={blog.slug} data-blog-slug={blog.slug}><BlogCard blog={blog} showDescription /></li>)}
            </ul> : <div className="ui-panel blog-empty">
              <h3 className="ui-panel-title">{blogs.length ? 'No Matching Blogs' : 'More Guides Are on the Way'}</h3>
              <p className="my-4">{blogs.length ? 'Try another topic or a shorter search.' : 'Check back for practical guides to warehouse leasing.'}</p>
              {filtering && <button type="button" className="ui-button ui-button--secondary" onClick={reset}>Clear filters</button>}
            </div>}
          </section>

          <div className="blog-section"><BlogEnquiry placement="blogs_footer" /></div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blogs;
