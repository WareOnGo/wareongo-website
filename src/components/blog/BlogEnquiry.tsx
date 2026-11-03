import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BlogEnquiry({ placement, compact = false }: { placement: string; compact?: boolean }) {
  const Heading = compact ? 'h3' : 'h2';
  return (
    <section className={`ui-panel blog-enquiry${compact ? ' blog-enquiry--compact' : ''}`} aria-label="Find a warehouse">
      <div>
        <p className="ui-label mb-3">Your Next Warehouse</p>
        <Heading className={compact ? 'ui-card-title' : 'ui-section-title'}>
          {compact ? 'Find the Right Space' : 'Tell Us What You Need'}
        </Heading>
        <p className="mt-3">{compact ? 'Share your requirements for a verified shortlist within 4 hours.' : "We'll send a verified warehouse shortlist within 4 hours."}</p>
      </div>
      <div className="blog-enquiry__actions">
        <Link to="/request-warehouse" data-analytics-placement={placement} className="ui-button">
          Request a warehouse {!compact && <ArrowRight aria-hidden="true" />}
        </Link>
        {!compact && <Link to="/listings" data-analytics-placement={placement} className="ui-button ui-button--secondary">Browse listings</Link>}
      </div>
    </section>
  );
}
