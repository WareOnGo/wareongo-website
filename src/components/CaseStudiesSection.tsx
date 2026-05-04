import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import CircularCursor from './CircularCursor';

const studies = [
  {
    image:
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    eyebrow: 'Case Study 01',
    title: 'Headline placeholder for the first case study',
    description:
      'Short summary of the client, the challenge, and the outcome WareOnGo delivered.',
    href: '/case-study-1',
  },
  {
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    eyebrow: 'Case Study 02',
    title: 'Headline placeholder for the second case study',
    description:
      'Short summary of the client, the challenge, and the outcome WareOnGo delivered.',
    href: '/case-study-2',
  },
];

const CaseStudiesSection = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [entryPos, setEntryPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <section className="bg-wareongo-ivory py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-wareongo-blue mb-2 md:mb-3">
            Case Studies
          </h2>
          <p className="text-wareongo-slate text-sm sm:text-base md:text-lg">
            How we've helped teams find the right space, fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 [perspective:1200px]">
          {studies.map((s) => (
            <a
              key={s.eyebrow}
              href={s.href}
              onMouseEnter={(e) => {
                setEntryPos({ x: e.clientX, y: e.clientY });
                setIsHovering(true);
              }}
              onMouseLeave={() => setIsHovering(false)}
              className="case-card group bg-transparent border border-wareongo-blue rounded-2xl overflow-hidden flex flex-col hover:bg-wareongo-blue/5"
            >
              <div className="aspect-[16/10] overflow-hidden bg-wareongo-ivory">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 sm:p-6 md:p-8 flex flex-col gap-2 sm:gap-3">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-wareongo-slate">
                  {s.eyebrow}
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-wareongo-blue leading-snug">
                  {s.title}
                </h3>
                <p className="text-sm sm:text-base text-wareongo-slate">
                  {s.description}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-wareongo-blue">
                  Read more
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>

        <style>{`
          .case-card,
          .case-card * {
            cursor: none !important;
          }
          .case-card {
            transform: perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0);
            transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 400ms;
            will-change: transform;
          }
          .case-card:hover {
            transform: perspective(1200px) rotateX(3deg) rotateY(-4deg) translateY(-4px);
          }
          .case-card:nth-child(2):hover {
            transform: perspective(1200px) rotateX(3deg) rotateY(4deg) translateY(-4px);
          }
          @media (prefers-reduced-motion: reduce) {
            .case-card, .case-card:hover { transform: none; transition: none; }
          }
        `}</style>
      </div>
      <CircularCursor visible={isHovering} initialPos={entryPos} text=" READ ARTICLE -★-  READ ARTICLE   -★-   " />
    </section>
  );
};

export default CaseStudiesSection;
