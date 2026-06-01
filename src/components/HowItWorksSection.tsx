import React from 'react';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';

type Step = {
  n: number;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    n: 1,
    title: 'Share your brief',
    description: 'Tell us your required city, sqft, type, and timeline. Sharper briefs, more relevant shortlists.',
  },
  {
    n: 2,
    title: 'Get a curated shortlist',
    description: '3–5 matched options within 36 hours.',
  },
  {
    n: 3,
    title: 'Site visits for the best options',
    description: 'Only visit the most relevant options: we prioritise your time and peace of mind.',
  },
  {
    n: 4,
    title: 'Advice and support from our experts',
    description: 'We get hands-on, and use our expertise to get you the best warehouse.',
  },
  {
    n: 5,
    title: 'Negotiation & terms',
    description: 'We negotiate commercials — you save 8–12% on average. Owners get the best clients, and clients get the best commercials.',
  },
  {
    n: 6,
    title: 'Compliance & handover',
    description: "End-to-end compliance and legal support. We handle the nitty-gritties, so you don't have to.",
  },
];

const LINE = 'bg-wareongo-blue/30';
const TIP = 'text-wareongo-blue/40';

const StepCard = ({ step }: { step: Step }) => (
  <div className="flex-1 bg-transparent border border-wareongo-blue rounded-2xl shadow-none p-5 sm:p-6 flex flex-col items-start text-left transition-colors duration-300 hover:bg-wareongo-blue/5">
    <div className="flex items-center gap-3 mb-4">
      <span className="w-8 h-8 shrink-0 rounded-full bg-wareongo-blue text-white text-sm font-bold flex items-center justify-center tabular-nums">
        {step.n}
      </span>
      <h3 className="text-base sm:text-lg font-semibold text-wareongo-blue leading-tight">
        {step.title}
      </h3>
    </div>
    <p className="text-sm sm:text-base text-wareongo-slate leading-relaxed">
      {step.description}
    </p>
  </div>
);

// Extended horizontal connector — a line that spans the full gutter, capped
// with an arrowhead so the path reads as one continuous flow.
const ConnectorRight = () => (
  <div className="flex items-center shrink-0 w-16 px-1">
    <div className={`h-0.5 flex-1 rounded-full ${LINE}`} />
    <ChevronRight className={`w-5 h-5 shrink-0 -ml-1.5 ${TIP}`} strokeWidth={2.5} />
  </div>
);

const ConnectorLeft = () => (
  <div className="flex items-center shrink-0 w-16 px-1">
    <ChevronLeft className={`w-5 h-5 shrink-0 -mr-1.5 ${TIP}`} strokeWidth={2.5} />
    <div className={`h-0.5 flex-1 rounded-full ${LINE}`} />
  </div>
);

// Spacer matching the connector gutter so the vertical turn lines up.
const Gutter = () => <div className="w-16 shrink-0" />;

const HowItWorksSection = () => {
  const topRow = STEPS.slice(0, 3);
  // Bottom row flows right-to-left (boustrophedon), so render it reversed:
  // card 4 sits under card 3, then 5, then 6 on the far left.
  const bottomRow = STEPS.slice(3, 6).reverse();

  return (
    <section className="bg-wareongo-ivory pt-16 pb-16 md:pt-24 md:pb-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-wareongo-slate font-medium mb-3">
            How WareOnGo Works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wareongo-blue">
            Get your Warehouse: Faster, Better, Cheaper.
          </h2>
        </div>

        {/* Snake-style flowchart */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop: boustrophedon snake — 1→2→3, down, 4←5←6 */}
          <div className="hidden md:block">
            {/* Top row: left → right */}
            <div className="flex items-stretch">
              {topRow.map((step, i) => (
                <React.Fragment key={step.n}>
                  <StepCard step={step} />
                  {i < topRow.length - 1 && <ConnectorRight />}
                </React.Fragment>
              ))}
            </div>

            {/* Right-side turn: vertical line from card 3 down to card 4 */}
            <div className="flex items-stretch h-16">
              <div className="flex-1" />
              <Gutter />
              <div className="flex-1" />
              <Gutter />
              <div className="flex-1 flex flex-col items-center">
                <div className={`w-0.5 flex-1 rounded-full ${LINE}`} />
                <ChevronDown className={`w-5 h-5 -mt-1.5 ${TIP}`} strokeWidth={2.5} />
              </div>
            </div>

            {/* Bottom row: right → left */}
            <div className="flex items-stretch">
              {bottomRow.map((step, i) => (
                <React.Fragment key={step.n}>
                  <StepCard step={step} />
                  {i < bottomRow.length - 1 && <ConnectorLeft />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Mobile: single column, top → bottom in order */}
          <div className="md:hidden flex flex-col items-stretch">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.n}>
                <StepCard step={step} />
                {i < STEPS.length - 1 && (
                  <div className="flex flex-col items-center h-10 self-center">
                    <div className={`w-0.5 flex-1 rounded-full ${LINE}`} />
                    <ChevronDown className={`w-5 h-5 -mt-1.5 ${TIP}`} strokeWidth={2.5} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
