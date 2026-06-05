import React, { useState } from 'react';
import { Head } from 'vite-react-ssg';
import { ChevronDown } from 'lucide-react';

type FAQ = {
  question: string;
  answer: string;
};

const FAQS: FAQ[] = [
  {
    question: 'How long does it take to find a warehouse on WareOnGo?',
    answer: 'Curated shortlist within 4 hours. Most deals are finalized within a couple of weeks.',
  },
  {
    question: 'How are listings verified?',
    answer: 'Every property is physically inspected and validated for relevance, specifications and compliances by our Area Managers.',
  },
  {
    question: "What's the difference between a godown and a warehouse?",
    answer: "Same thing in most contexts — 'godown' is more common in North India, 'warehouse' in logistics markets. We use the terms interchangeably.",
  },
  {
    question: 'Can I list my own warehouse with WareOnGo?',
    answer: 'Yes. Listing your warehouse takes 5 minutes on WareOnGo — list your warehouse or give us a call.',
  },
  {
    question: 'Which cities do you cover?',
    answer: '90+ cities pan-India, with deepest coverage in Bengaluru, Hyderabad, Mumbai, Bhiwandi, Chennai, Pune, Gurgaon, Noida and Delhi.',
  },
  {
    question: 'Do you handle compliance and legal?',
    answer: 'Yes — end-to-end coordination through move-in day, from lease drafting to municipal approvals.',
  },
  {
    question: 'Can I see properties without visiting?',
    answer: 'Yes — by signing up to WareOnGo Edge, you can gain access to our curated 360° virtual tours of verified warehouses!',
  },
];

// FAQPage structured data — single source of truth is the FAQS array above.
// Google requires the answer text in the schema to match the on-page answer,
// which it does (every Q&A is rendered and accessible in the accordion below).
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
};

const FAQItem = ({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="bg-transparent border-t border-wareongo-blue first:border-t-0 transition-colors duration-300 hover:bg-wareongo-blue/5">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="w-full flex items-center justify-between gap-4 text-left p-5 sm:p-6"
    >
      <h3 className="text-base sm:text-lg font-semibold text-wareongo-blue">
        {faq.question}
      </h3>
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
          {faq.answer}
        </p>
      </div>
    </div>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-wareongo-ivory pt-16 pb-16 md:pt-24 md:pb-24">
      <Head>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Head>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-wareongo-slate font-medium mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion — single unit */}
        <div className="max-w-3xl mx-auto bg-transparent border border-wareongo-blue rounded-2xl shadow-none overflow-hidden">
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
