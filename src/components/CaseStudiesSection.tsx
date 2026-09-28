import { ArrowUpRight } from 'lucide-react';

const studies = [
  {
    image:
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    eyebrow: 'Case Study 01 · Kochi, Kerala',
    title: "India's hardest warehouse market. Cracked at ₹22/sqft.",
    description:
      '3PL Company · Electrical & Appliances Logistics · Closed ₹2.5–3/sqft below market with 5 follow-on mandates.',
    href: '/casestudies/kochi-3pl-warehouse',
  },
  {
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    eyebrow: 'Case Study 02 · Hyderabad',
    title: 'Fire-compliant warehouse. 2 months of failure. Then us.',
    description:
      'Manufacturer · 22 properties screened · Closed at ₹18.5/sqft for 50,000 sqft fire-compliant. ~₹90L saved.',
    href: '/casestudies/hyderabad-fire-compliant-warehouse',
  },
];

const CaseStudiesSection = () => {
  return (
    <section className="bg-wareongo-ivory py-12 md:py-16">
      <div className="container mx-auto">
        <div className="max-w-2xl mb-8 md:mb-12">
          <h2 className="ui-section-title text-wareongo-blue mb-2 md:mb-3">
            Case Studies
          </h2>
          <p className="text-wareongo-slate text-base">
            How we've helped teams find the right space, fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 [perspective:1200px]">
          {studies.map((s) => (
            <a
              key={s.eyebrow}
              href={s.href}
              className="ui-card ui-card--action case-card group flex overflow-hidden flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-wareongo-ivory">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  width={720}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 sm:p-6 md:p-8 flex flex-col gap-2 sm:gap-3">
                <span className="ui-eyebrow text-wareongo-slate">
                  {s.eyebrow}
                </span>
                <h3 className="ui-card-title text-wareongo-blue">
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
      </div>
    </section>
  );
};

export default CaseStudiesSection;
