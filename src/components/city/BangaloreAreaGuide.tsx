import type { AdPageContent } from '@/data/adPages';
import type { AnalyticsParams } from '@/lib/analytics';

export default function BangaloreAreaGuide({ onContact, content }: {
  content: AdPageContent;
  onContact: (trigger: HTMLButtonElement, context: AnalyticsParams) => void;
}) {
  return (
    <section className="bangalore-landing__area-guide bangalore-landing__container" aria-labelledby="bangalore-area-guide-title">
      <div className="bangalore-landing__area-panel">
        <h2 id="bangalore-area-guide-title">{content.copy.areaHeading}</h2>
        <table>
          <thead><tr><th scope="col">{content.copy.areaNeedHeading}</th><th scope="col">{content.copy.areaLocationsHeading}</th></tr></thead>
          <tbody>
            {content.areaRows.map(({ need, areas }, index) => (
              <tr key={index}>
                <th scope="row">{need}</th>
                <td>
                  <div className="bangalore-landing__area-options">
                    {areas.map(area => area.trim()).filter(Boolean).map(area => (
                      <button
                        key={area}
                        type="button"
                        aria-haspopup="dialog"
                        aria-label={`Enquire about warehouse space in ${area}`}
                        onClick={event => onContact(event.currentTarget, {
                          placement: 'bangalore_area_guide', label: area,
                          source: `bangalore-area-guide-${area.toLowerCase()}`,
                        })}
                      >{area}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
