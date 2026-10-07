import { BANGALORE_AREA_FIT_GROUPS } from '@/data/bangaloreMarketGuide';
import type { BangaloreMapScope } from '@/data/bangaloreMicromarketMap';

export default function BangaloreAreaGuide({ scope }: { scope: BangaloreMapScope }) {
  return (
    <section id="bangalore-area-fit" className="bangalore-landing__area-fit bangalore-landing__container" aria-labelledby="bangalore-area-fit-title">
      <div className="bangalore-landing__section-heading">
        <h2 id="bangalore-area-fit-title" className="bangalore-landing__section-title">Which Area Fits You</h2>
      </div>
      <div className="bangalore-landing__area-fit-grid">
        {BANGALORE_AREA_FIT_GROUPS.map(({ id, scope: groupScope, title, rows }) => (
          <div key={id} className="bangalore-landing__guide-table-frame" data-mobile-active={scope === groupScope}>
            <table className="ui-table bangalore-landing__guide-table bangalore-landing__area-fit-table" aria-labelledby={`bangalore-${id}-title`}>
              <caption><h3 id={`bangalore-${id}-title`}>{title}</h3></caption>
              <thead>
                <tr><th scope="col">If You Need</th><th scope="col">Look At</th></tr>
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
