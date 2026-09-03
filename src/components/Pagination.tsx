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
  className = '',
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number, direction: PageChangeDirection) => void;
  className?: string;
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={`flex justify-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(currentPage - 1, 'prev')}
        disabled={currentPage === 1}
        className="h-9 rounded-lg border border-wareongo-blue/30 px-4 text-sm font-medium text-wareongo-blue transition-colors hover:bg-wareongo-blue/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <div className="flex gap-1.5">
        {windowFor(currentPage, totalPages).map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onChange(pageNum, 'jump')}
              aria-current={isActive ? 'page' : undefined}
              className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${
                isActive
                  ? 'border-wareongo-blue bg-wareongo-blue text-white'
                  : 'border-wareongo-blue/30 bg-transparent text-wareongo-blue hover:bg-wareongo-blue/5'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange(currentPage + 1, 'next')}
        disabled={currentPage === totalPages}
        className="h-9 rounded-lg border border-wareongo-blue/30 px-4 text-sm font-medium text-wareongo-blue transition-colors hover:bg-wareongo-blue/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
