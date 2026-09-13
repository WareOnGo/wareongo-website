import { Link, useParams } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import { ContentBlock } from '@/components/ContentBlock';
import { getServiceBySlug } from '@/data/servicePages';
import { SERVICE_PAGES, servicePath } from '@/data/serviceCatalog';
import { SITE_URL, ORG_ID } from '@/config/config';
import NotFound from './NotFound';

const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getServiceBySlug(slug) : undefined;
  if (!page) return <NotFound />;
  const path = servicePath(page.slug);
  const image = page.blocks.flatMap(b => b.kind === 'images' ? b.images : [])[0]?.url;
  const serviceLd = {
    '@context': 'https://schema.org', '@type': 'Service',
    name: page.title, serviceType: SERVICE_PAGES[page.slug], description: page.description,
    url: `${SITE_URL}${path}`, provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'India' },
    ...(image ? { image } : {}),
  };
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: page.faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  return <div className="min-h-screen flex flex-col bg-wareongo-ivory">
    <PageHead title={page.seoTitle} description={page.description} path={path} image={image}>
      <script type="application/ld+json">{jsonLd(serviceLd)}</script>
      {page.faqs.length > 0 && <script type="application/ld+json">{jsonLd(faqLd)}</script>}
    </PageHead>
    <Navbar />
    <main className="flex-grow" aria-labelledby="service-title">
      <div className="section-container px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-3xl mx-auto break-words">
          <Breadcrumbs className="mb-4 sm:mb-6" items={[{ label: 'Home', path: '/' }, { label: page.title }]} />
          <header className="mb-8">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate block mb-3">Our services</span>
            <h1 id="service-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-wareongo-blue leading-tight mb-4">{page.title}</h1>
            <p className="text-base sm:text-lg text-wareongo-slate leading-relaxed">{page.summary}</p>
          </header>
          {page.blocks.map((block, i) => <ContentBlock key={i} block={block} />)}
          {page.faqs.length > 0 && <section aria-labelledby="service-faq" className="mt-10">
            <h2 id="service-faq" className="text-xl sm:text-2xl font-bold text-wareongo-blue mb-4">Frequently asked questions</h2>
            <FAQAccordion items={page.faqs} />
          </section>}
          <div className="mt-10 border border-wareongo-blue/20 rounded-2xl p-6 text-center">
            <p className="text-wareongo-charcoal font-semibold mb-4">Tell us what you need</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link data-analytics-placement="service_footer" to="/request-warehouse"
                className="inline-flex items-center px-5 h-10 rounded-xl bg-wareongo-blue text-white text-sm font-medium hover:bg-wareongo-blue/90 transition-colors">Discuss your requirement</Link>
              <a href="mailto:sales@wareongo.com" className="inline-flex items-center px-5 h-10 rounded-xl border border-wareongo-blue/30 text-wareongo-blue text-sm font-medium hover:bg-wareongo-blue/5 transition-colors">Contact us</a>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
