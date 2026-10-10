import InlineText from '@/components/InlineText';
import { plainInlineText } from '@/lib/inline-format';
import { Link, useParams } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import { ContentBlock } from '@/components/ContentBlock';
import { getServiceBySlug, type ServicePage } from '@/data/servicePages';
import { SERVICE_PAGES, servicePath } from '@/data/serviceCatalog';
import { SITE_URL, ORG_ID } from '@/config/config';
import NotFound from './NotFound';

const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export default function ServiceDetail({ content }: { content?: ServicePage } = {}) {
  const { slug } = useParams<{ slug: string }>();
  const page = content ?? (slug ? getServiceBySlug(slug) : undefined);
  if (!page) return <NotFound />;
  const path = servicePath(page.slug);
  const image = page.blocks.flatMap(b => b.kind === 'images' ? b.images : [])[0]?.url;
  const serviceLd = {
    '@context': 'https://schema.org', '@type': 'Service',
    '@id': `${SITE_URL}${path}#service`,
    name: page.title, serviceType: SERVICE_PAGES[page.slug], description: page.description,
    url: `${SITE_URL}${path}`, provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'India' },
    ...(image ? { image } : {}),
  };
  const webPageLd = {
    '@context': 'https://schema.org', '@type': 'WebPage',
    '@id': `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`,
    name: page.title, description: page.description,
    mainEntity: { '@id': serviceLd['@id'] },
    ...(page.keywords.length ? { keywords: page.keywords.join(', ') } : {}),
  };
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: page.faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: plainInlineText(a) } })),
  };
  return <div className="min-h-screen flex flex-col bg-wareongo-ivory">
    <PageHead title={page.seoTitle} description={page.description} path={path} image={image}>
      <script type="application/ld+json">{jsonLd(serviceLd)}</script>
      <script type="application/ld+json">{jsonLd(webPageLd)}</script>
      {page.faqs.length > 0 && <script type="application/ld+json">{jsonLd(faqLd)}</script>}
    </PageHead>
    <Navbar />
    <main className="flex-grow" aria-labelledby="service-title">
      <div className="section-container page-content pb-6 sm:pb-10">
        <div className="max-w-3xl mx-auto break-words">
          <Breadcrumbs className="mb-4 sm:mb-6" items={[{ label: 'Home', path: '/' }, { label: page.title }]} />
          <header className="mb-8">
            <span className="ui-eyebrow text-wareongo-slate block mb-3">Our services</span>
            <h1 id="service-title" className="ui-page-title text-wareongo-blue mb-4">{page.title}</h1>
            <p className="text-base text-wareongo-slate leading-relaxed"><InlineText text={page.summary} /></p>
          </header>
          {page.blocks.map((block, i) => <ContentBlock key={i} block={block} />)}
          {page.faqs.length > 0 && <section aria-labelledby="service-faq" className="mt-10">
            <h2 id="service-faq" className="ui-section-title text-wareongo-blue mb-4">Frequently Asked Questions</h2>
            <FAQAccordion items={page.faqs} />
          </section>}
          <div className="mt-10 border border-ui-line rounded-xl p-6 text-center">
            <p className="text-wareongo-charcoal font-semibold mb-4">Tell us what you need</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link data-analytics-placement="service_footer" to="/request-warehouse"
                className="ui-button">Discuss your requirement</Link>
              <a href="mailto:sales@wareongo.com" className="ui-button ui-button--secondary">Contact us</a>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
