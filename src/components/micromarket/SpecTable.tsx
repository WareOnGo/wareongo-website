import { specRowsFor } from '@/lib/micromarketStats';
import type { Micromarket } from '@/services/micromarketsAPI';
import { HAIRLINE, PANEL } from './tokens';

const SpecTable = ({ stats }: { stats: Micromarket }) => {
  const rows = specRowsFor(stats);
  if (rows.length === 0) return null;

  return (
    <div className={`overflow-hidden ${PANEL}`}>
      <table className="w-full text-left text-[13px] sm:text-sm">
        <caption className="sr-only">
          Typical specification across the warehouses listed in this micromarket
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
