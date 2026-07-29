import React from 'react';
import type { Story, StoryTable } from '@/data/caseStudies';

// Two-column key/value table. Renders a header row only when the section
// supplies one — the "At a Glance" block is deliberately headerless.
const Table: React.FC<{ table: StoryTable }> = ({ table }) => (
  <div className="mt-3 overflow-x-auto">
    <div className="border border-wareongo-blue rounded-xl overflow-hidden">
      <table className="w-full text-left text-[13px] bg-transparent">
        {table.headers && (
          <thead>
            <tr className="bg-wareongo-blue text-wareongo-ivory text-[10px] font-semibold tracking-[0.12em] uppercase">
              <th scope="col" className="px-4 py-2.5 w-[42%] border-r border-wareongo-ivory/20">
                {table.headers[0]}
              </th>
              <th scope="col" className="px-4 py-2.5">
                {table.headers[1]}
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((row, ri) => (
            <tr
              key={ri}
              className={`${ri > 0 || table.headers ? 'border-t border-wareongo-blue/20' : ''} ${
                ri % 2 === 0 ? 'bg-wareongo-blue/[0.03]' : 'bg-transparent'
              }`}
            >
              <th
                scope="row"
                className="px-4 py-2.5 w-[42%] align-top font-medium text-wareongo-slate border-r border-wareongo-blue/20"
              >
                {row.label}
              </th>
              <td className="px-4 py-2.5 align-top text-wareongo-blue font-medium">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StoryView: React.FC<{ story: Story }> = ({ story }) => {
  return (
    <div className="space-y-6">
      {/* Story Header */}
      <div className="border border-wareongo-blue rounded-2xl bg-wareongo-blue overflow-hidden">
        <div className="px-6 sm:px-9 py-7 sm:py-9">
          <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-white/50 mb-3 block">
            {story.badge}
          </span>
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-white leading-[1.15] mb-2">
            {story.title}
          </h1>
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

      {/* Direct-answer summary — the first thing answer engines extract. The id is
          referenced by the Article LD's speakable cssSelector. */}
      <div
        id="case-study-summary"
        className="border-l-4 border-wareongo-blue/40 bg-wareongo-blue/5 rounded-r-xl px-5 py-4"
      >
        <p className="text-sm font-semibold text-wareongo-charcoal mb-1">In short</p>
        <p className="text-[14.5px] text-wareongo-slate leading-relaxed">{story.summary}</p>
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
              <h2 className="text-lg sm:text-xl font-bold text-wareongo-blue leading-snug mb-4">
                {sec.heading}
              </h2>
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

            {/* Bullet list */}
            {sec.bullets && (
              <ul className="mt-1 space-y-2.5">
                {sec.bullets.map((b, bi) => (
                  <li key={bi} className="flex items-start gap-2.5 text-sm text-wareongo-slate leading-[1.75]">
                    <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-wareongo-blue/40" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Numbered steps with a bold lead-in */}
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
            {sec.table && <Table table={sec.table} />}

            {/* Closing prose, after steps or table */}
            {sec.proseAfter?.map((p, pi) => (
              <p key={pi} className="text-sm text-wareongo-slate leading-[1.8] mt-4 mb-3 last:mb-0">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryView;
