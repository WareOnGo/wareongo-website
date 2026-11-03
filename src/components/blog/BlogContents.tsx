import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { BlogHeading } from '@/lib/blogPresentation';

export default function BlogContents({ headings, hasFaq }: { headings: BlogHeading[]; hasFaq: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  if (!headings.length && !hasFaq) return null;
  return (
    <nav className="ui-panel blog-contents" aria-label="On This Page" data-expanded={expanded}>
      <p className="blog-contents__desktop-title ui-label">On This Page</p>
      <button type="button" className="blog-contents__toggle" aria-expanded={expanded} aria-controls={id}
        onClick={() => setExpanded(value => !value)}>
        On This Page <ChevronDown size={20} aria-hidden="true" />
      </button>
      <ol id={id} className="blog-contents__links">
        <li><a href="#blog-summary" data-analytics-ignore>In Short</a></li>
        {headings.map(heading => <li key={heading.id} className={heading.level === 'h3' ? 'blog-contents__subheading' : undefined}>
          <a href={`#${heading.id}`} data-analytics-ignore>{heading.text}</a>
        </li>)}
        {hasFaq && <li><a href="#blog-faq" data-analytics-ignore>Frequently Asked Questions</a></li>}
      </ol>
    </nav>
  );
}
