import FAQAccordion from '@/components/FAQAccordion';
import { BANGALORE_MARKET_FAQS, BANGALORE_RENT_GUIDE } from '@/data/bangaloreMarketGuide';

export default function BangaloreMarketGuide() {
  return (
    <>
      <section className="bangalore-landing__rent-guide bangalore-landing__container" aria-labelledby="bangalore-rent-guide-title">
        <div className="bangalore-landing__section-heading">
          <h2 id="bangalore-rent-guide-title" className="bangalore-landing__section-title">Warehouse Rent in Bangalore</h2>
        </div>
        <div className="bangalore-landing__rent-guide-copy">
          <p>{BANGALORE_RENT_GUIDE.intro}</p>
          <p>{BANGALORE_RENT_GUIDE.description}</p>
        </div>
        <div className="bangalore-landing__guide-table-frame">
          <table className="ui-table bangalore-landing__guide-table bangalore-landing__rent-guide-table" aria-labelledby="bangalore-rent-guide-title">
            <thead>
              <tr><th scope="col">Area</th><th scope="col">Rent <span>(₹/sq ft a month)</span></th></tr>
            </thead>
            <tbody>
              {BANGALORE_RENT_GUIDE.rows.map(({ area, rent }) => (
                <tr key={area}><th scope="row">{area}</th><td>{rent}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bangalore-landing__faq bangalore-landing__container" aria-labelledby="bangalore-faq-title">
        <div className="bangalore-landing__section-heading">
          <h2 id="bangalore-faq-title" className="bangalore-landing__section-title">Frequently Asked Questions</h2>
        </div>
        <div className="bangalore-landing__faq-list">
          <FAQAccordion items={BANGALORE_MARKET_FAQS} />
        </div>
      </section>
    </>
  );
}
