import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

const pageButton =
  'inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40';

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalItems = 0,
  itemsPerPage = 12,
  className,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range: (number | string)[] = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (totalPages > 1) {
      range.unshift(1);
    }

    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }
    if (totalPages > 1 && !range.includes(totalPages)) {
      range.push(totalPages);
    }

    return range;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={clsx('flex flex-col items-center gap-4 sm:flex-row sm:justify-between', className)}>
      {showInfo && (
        <p className="text-sm text-sf-muted">
          Showing <span className="font-medium text-sf-ink">{startItem}</span> to{' '}
          <span className="font-medium text-sf-ink">{endItem}</span> of{' '}
          <span className="font-medium text-sf-ink">{totalItems}</span> results
        </p>
      )}

      <nav aria-label="Pagination" className="sf-glass inline-flex items-center gap-1 rounded-full p-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={clsx(pageButton, 'text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {getVisiblePages().map((page, index) =>
          page === '...' ? (
            <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-sf-subtle">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              aria-current={currentPage === page ? 'page' : undefined}
              aria-label={`Page ${page}`}
              className={clsx(
                pageButton,
                currentPage === page
                  ? 'bg-sf-gradient text-sf-on-accent shadow-sf-glow'
                  : 'text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={clsx(pageButton, 'text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink')}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
