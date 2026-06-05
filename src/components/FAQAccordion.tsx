import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export interface FAQEntry {
  q: string;
  a: string;
  /** Optional trailing link rendered after the answer text (e.g. to a guide). */
  link?: { to: string; label: string };
}

interface FAQAccordionProps {
  items: FAQEntry[];
  /** Index opened on mount; null for all collapsed. Defaults to the first item. */
  defaultOpenIndex?: number | null;
}

// Same accordion pattern as the homepage FAQSection: answers are height-animated
// via CSS grid (0fr → 1fr) and stay in the DOM when collapsed, so the SSG'd HTML
// always contains the full answer text — keeping FAQPage JSON-LD (generated from
// the same items array by the caller) consistent with the rendered page.
const FAQAccordion = ({ items, defaultOpenIndex = 0 }: FAQAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <div className="bg-transparent border border-wareongo-blue rounded-2xl shadow-none overflow-hidden">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.q}
            className="bg-transparent border-t border-wareongo-blue first:border-t-0 transition-colors duration-300 hover:bg-wareongo-blue/5"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left p-5 sm:p-6"
            >
              <h3 className="text-base sm:text-lg font-semibold text-wareongo-blue">{item.q}</h3>
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-wareongo-blue transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                strokeWidth={2}
              />
            </button>

            {/* Height-animated answer panel (grid 0fr → 1fr) */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-wareongo-slate leading-relaxed">
                  {item.a}
                  {item.link && (
                    <>
                      {' '}
                      <Link
                        to={item.link.to}
                        className="text-wareongo-blue underline-offset-2 hover:underline whitespace-nowrap"
                      >
                        {item.link.label}
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;
