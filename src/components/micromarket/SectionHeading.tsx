import { EYEBROW } from './tokens';

/**
 * The numbered section header used down the editorial template: an index, an
 * eyebrow and the H2. The index is decorative — it counts sections as rendered,
 * so a page missing its rents copy numbers 01, 02, 03 rather than skipping one.
 */
const SectionHeading = ({
  index,
  eyebrow,
  children,
}: {
  index: number;
  eyebrow: string;
  children: React.ReactNode;
}) => (
  <header className="mb-4">
    <div className="mb-2 flex items-baseline gap-3">
      <span className={`${EYEBROW} tabular-nums text-wareongo-blue/45`}>
        {String(index).padStart(2, '0')}
      </span>
      <span className={`${EYEBROW} text-wareongo-slate`}>{eyebrow}</span>
    </div>
    <h2 className="text-xl font-bold leading-tight text-wareongo-blue sm:text-2xl md:text-[1.75rem]">
      {children}
    </h2>
  </header>
);

export default SectionHeading;
