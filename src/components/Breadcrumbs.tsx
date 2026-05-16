import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/config/config';

export interface BreadcrumbItem {
  // Display label
  label: string;
  // Absolute site path (e.g. "/listings"). Omit for the current page (last item).
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = '' }: BreadcrumbsProps) => {
  // BreadcrumbList JSON-LD — skip pathless intermediate items (Google requires a URL on
  // every item except optionally the last one). Positions renumber after the filter.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
      .map((item, idx) => {
        const isLast = idx === items.length - 1;
        if (!item.path && !isLast) return null;
        const entry: { '@type': string; position: number; name: string; item?: string } = {
          '@type': 'ListItem',
          position: 0,
          name: item.label,
        };
        if (item.path) entry.item = `${SITE_URL}${item.path}`;
        return entry;
      })
      .filter((x): x is { '@type': string; position: number; name: string; item?: string } => x !== null)
      .map((entry, idx) => ({ ...entry, position: idx + 1 })),
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex items-center flex-wrap gap-1 text-xs sm:text-sm text-wareongo-slate">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={`${item.label}-${idx}`} className="flex items-center gap-1">
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-wareongo-slate/50" aria-hidden="true" />
                )}
                {item.path && !isLast ? (
                  <Link
                    to={item.path}
                    className="hover:text-wareongo-blue focus:outline-none focus:ring-2 focus:ring-wareongo-blue/40 focus:ring-offset-2 rounded transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-wareongo-blue font-medium truncate max-w-[60vw]' : ''}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
