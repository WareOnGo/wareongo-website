import { Link } from 'react-router-dom';

/**
 * Previous / numbered / Next pager.
 *
 * Extracted from Listings.tsx, which owned the only copy. Both callers page
 * through warehouses and should look identical doing it, but they page different
 * things: /listings refetches from the API, a micromarket page slices an array it
 * already has. So this component owns the control and its window arithmetic, and
 * the caller owns what a page change *means* — including its own analytics event
 * name and where to scroll.
 */

/** Numbered buttons shown at once; the window slides around the current page. */
const WINDOW = 5;

export type PageChangeDirection = 'prev' | 'next' | 'jump';

/**
 * Which page numbers to show. Keeps the current page inside the window and the
 * window inside 1..totalPages, so the row never changes width mid-navigation.
 */
const windowFor = (currentPage: number, totalPages: number): number[] => {
  const size = Math.min(totalPages, WINDOW);
  const first =
    totalPages <= WINDOW || currentPage <= 3
      ? 1
      : currentPage >= totalPages - 2
        ? totalPages - WINDOW + 1
        : currentPage - 2;
  return Array.from({ length: size }, (_, i) => first + i);
};

const Pagination = ({
  currentPage,
  totalPages,
  onChange,
  hrefForPage,
  disabled = false,
  className = '',
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number, direction: PageChangeDirection) => void;
  hrefForPage: (page: number) => string;
  disabled?: boolean;
  className?: string;
}) => {
  if (totalPages <= 1) return null;

  const control = (page: number, label: string, direction: PageChangeDirection, className: string, unavailable = false, active = false) => {
    const props = { className, 'aria-current': active ? 'page' as const : undefined };
    if (unavailable) return <button key={label} type="button" {...props} disabled>{label}</button>;
    return (
      <Link key={label} to={hrefForPage(page)} {...props} data-analytics-ignore
        className={`${className} inline-flex items-center justify-center`}
        preventScrollReset
        onClick={(event) => {
          // Preserve native new-tab/window and copy-link behavior. An ordinary
          // click goes through the caller's existing analytics/scroll handler.
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onChange(page, direction);
        }}
      >{label}</Link>
    );
  };

  return (
    <nav aria-label="Pagination" data-analytics-ignore className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {control(currentPage - 1, 'Previous', 'prev',
        'h-9 rounded-lg border border-wareongo-blue/30 px-4 text-sm font-medium text-wareongo-blue transition-colors hover:bg-wareongo-blue/5 disabled:cursor-not-allowed disabled:opacity-40',
        disabled || currentPage === 1)}

      <div className="order-first flex w-full justify-center gap-1.5 min-[420px]:order-none min-[420px]:w-auto">
        {windowFor(currentPage, totalPages).map((pageNum) => {
          const isActive = pageNum === currentPage;
          return control(pageNum, String(pageNum), 'jump',
              `h-9 w-9 rounded-lg border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive
                  ? 'border-wareongo-blue bg-wareongo-blue text-white'
                  : 'border-wareongo-blue/30 bg-transparent text-wareongo-blue hover:bg-wareongo-blue/5'
              }`, disabled, isActive);
        })}
      </div>

      {control(currentPage + 1, 'Next', 'next',
        'h-9 rounded-lg border border-wareongo-blue/30 px-4 text-sm font-medium text-wareongo-blue transition-colors hover:bg-wareongo-blue/5 disabled:cursor-not-allowed disabled:opacity-40',
        disabled || currentPage === totalPages)}
    </nav>
  );
};

export default Pagination;
