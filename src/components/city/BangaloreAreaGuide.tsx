import type { AdPageContent } from '@/data/adPages';
import type { BangaloreMapScope } from '@/data/bangaloreMicromarketMap';

export default function BangaloreAreaGuide({ scope, content }: { scope: BangaloreMapScope; content: AdPageContent }) {
  return (
    <section id="bangalore-area-fit" className="bangalore-landing__area-fit bangalore-landing__container" aria-labelledby="bangalore-area-fit-title">
      <div className="bangalore-landing__section-heading">
        <h2 id="bangalore-area-fit-title" className="bangalore-landing__section-title">{content.copy.areaHeading}</h2>
      </div>
      <div className="bangalore-landing__area-fit-grid">
        {content.areaGroups.map(({ id, scope: groupScope, title, rows }) => (
          <div key={id} className="bangalore-landing__guide-table-frame" data-mobile-active={scope === groupScope}>
            <table className="ui-table bangalore-landing__guide-table bangalore-landing__area-fit-table" aria-labelledby={`bangalore-${id}-title`}>
              <caption><h3 id={`bangalore-${id}-title`}>{title}</h3></caption>
              <thead>
                <tr><th scope="col">{content.copy.areaNeedHeading}</th><th scope="col">{content.copy.areaLocationsHeading}</th></tr>
              </thead>
              <tbody>
                {rows.map(({ need, areas }) => (
                  <tr key={need}><th scope="row">{need}</th><td>{areas}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}
