import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Story } from '@/pages/caseStudyStories';

const StoryView: React.FC<{ story: Story }> = ({ story }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Story Header */}
      <div className="border border-wareongo-blue rounded-2xl bg-wareongo-blue overflow-hidden">
        <div className="px-6 sm:px-9 py-7 sm:py-9">
          <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/50 mb-3 block">
            {story.badge}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-white leading-[1.15] mb-2">
            {story.title}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">{story.meta}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/10">
          {story.metrics.map((m, i) => (
            <div
              key={i}
              className={`text-center px-4 py-4 ${
                i < story.metrics.length - 1 ? 'border-r border-white/10' : ''
              } ${i >= 2 ? 'border-t border-white/10 sm:border-t-0' : ''}`}
            >
              <div className="text-lg sm:text-xl font-bold text-wareongo-ivory leading-none mb-1">
                {m.n}
              </div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/60">{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Body */}
      <div className="border border-wareongo-blue rounded-2xl bg-transparent overflow-hidden">
        {story.sections.map((sec, si) => (
          <div
            key={si}
            className={`px-6 sm:px-9 py-7 ${
              si < story.sections.length - 1 ? 'border-b border-wareongo-blue' : ''
            }`}
          >
            {/* Section label */}
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-wareongo-charcoal block mb-3">
              {sec.label}
            </span>

            {/* Heading */}
            {sec.heading && (
              <h3 className="text-lg sm:text-xl font-bold text-wareongo-blue leading-snug mb-4">
                {sec.heading}
              </h3>
            )}

            {/* Prose paragraphs */}
            {sec.prose?.map((p, pi) => (
              <p
                key={pi}
                className="text-sm text-wareongo-slate leading-[1.8] mb-3 last:mb-0"
              >
                {p}
              </p>
            ))}

            {/* Quote */}
            {sec.quote && (
              <div className="border border-wareongo-blue rounded-xl px-5 py-4 my-4 text-sm text-wareongo-slate leading-[1.7] bg-wareongo-blue/[0.03]">
                <span className="text-wareongo-blue font-bold text-base mr-1">"</span>
                {sec.quote}
              </div>
            )}

            {/* Steps */}
            {sec.steps && (
              <div className="mt-2 divide-y divide-wareongo-blue/20">
                {sec.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 py-3.5">
                    <div className="text-base font-bold text-wareongo-charcoal/40 leading-none flex-shrink-0 w-7 pt-0.5 font-mono">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-wareongo-blue mb-1">
                        {step.title}
                      </div>
                      <div className="text-[13px] text-wareongo-slate leading-relaxed">
                        {step.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table */}
            {sec.table && (
              <div className="mt-3 border border-wareongo-blue rounded-xl overflow-hidden">
                <div className="grid grid-cols-[45%_1fr] bg-wareongo-blue text-wareongo-ivory text-[10px] font-semibold tracking-[0.12em] uppercase">
                  <div className="px-4 py-2.5 border-r border-wareongo-ivory/20">Metric</div>
                  <div className="px-4 py-2.5">Result</div>
                </div>
                {sec.table.map((row, ri) => (
                  <div
                    key={ri}
                    className={`grid grid-cols-[45%_1fr] text-[13px] border-t border-wareongo-blue/20 ${
                      ri % 2 === 0 ? 'bg-wareongo-blue/[0.03]' : 'bg-transparent'
                    }`}
                  >
                    <div className="px-4 py-2.5 text-wareongo-slate border-r border-wareongo-blue/20">
                      {row.metric}
                    </div>
                    <div className="px-4 py-2.5 text-wareongo-blue font-medium">{row.result}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Outcomes */}
            {sec.outcomes && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {sec.outcomes.map((o, oi) => (
                  <div
                    key={oi}
                    className="border border-wareongo-blue rounded-xl px-4 py-3 bg-transparent hover:bg-wareongo-blue/5 transition-colors"
                  >
                    <div className="text-base font-bold text-wareongo-blue leading-tight mb-1">
                      {o.n}
                    </div>
                    <div className="text-[12px] text-wareongo-slate leading-snug">{o.l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryView;
