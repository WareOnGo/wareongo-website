import { specRowsFor } from '@/lib/micromarketStats';
import type { DerivedStats } from '@/services/derivedStats';
import { HAIRLINE, PANEL } from './tokens';

const SpecTable = ({ stats, caption = 'Typical specification across the warehouses listed in this micromarket' }: { stats: DerivedStats; caption?: string }) => {
  const rows = specRowsFor(stats);
  if (rows.length === 0) return null;

  return (
    <div className={`warehouse-spec-table overflow-hidden ${PANEL}`}>
      <table className="w-full text-left text-[13px] sm:text-sm">
        <caption className="sr-only">
          {caption}
        </caption>
        <tbody>
          {rows.map(([label, value], i) => (
            <tr key={label} className={i > 0 ? `border-t ${HAIRLINE}` : ''}>
              <th scope="row" className="px-4 py-3 text-left align-top font-medium text-wareongo-slate">
                {label}
              </th>
              <td className="px-4 py-3 text-right align-top tabular-nums text-wareongo-charcoal">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpecTable;
