import FAQAccordion from '@/components/FAQAccordion';
import type { AdPageContent } from '@/data/adPages';

export default function BangaloreMarketGuide({ content }: { content: AdPageContent }) {
  return (
    <>
      <section className="bangalore-landing__rent-guide bangalore-landing__container" aria-labelledby="bangalore-rent-guide-title">
        <div className="bangalore-landing__section-heading">
          <h2 id="bangalore-rent-guide-title" className="bangalore-landing__section-title">{content.copy.rentHeading}</h2>
        </div>
        <div className="bangalore-landing__rent-guide-copy">
          <p>{content.rentGuide.intro}</p>
          <p>{content.rentGuide.description}</p>
        </div>
        <div className="bangalore-landing__guide-table-frame">
          <table className="ui-table bangalore-landing__guide-table bangalore-landing__rent-guide-table" aria-labelledby="bangalore-rent-guide-title">
            <thead>
              <tr><th scope="col">{content.copy.rentAreaHeading}</th><th scope="col">{content.copy.rentRateHeading} <span>{content.copy.rentUnit}</span></th></tr>
            </thead>
            <tbody>
              {content.rentGuide.rows.map(({ area, rent }) => (
                <tr key={area}><th scope="row">{area}</th><td>{rent}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bangalore-landing__faq bangalore-landing__container" aria-labelledby="bangalore-faq-title">
        <div className="bangalore-landing__section-heading">
          <h2 id="bangalore-faq-title" className="bangalore-landing__section-title">{content.copy.faqHeading}</h2>
        </div>
        <div className="bangalore-landing__faq-list">
          <FAQAccordion items={content.faqs} />
        </div>
      </section>
    </>
  );
}
