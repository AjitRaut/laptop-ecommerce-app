import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

/**
 * The storefront's search behaviour: trim the query, then either hand it to a
 * caller (`onSearch`) or open the products listing. Shared by the inline
 * SearchBar and the Ctrl/Cmd+K command palette.
 */
export const useProductSearch = (onSearch?: (query: string) => void) => {
  const navigate = useNavigate();
  return useCallback(
    (rawQuery: string): boolean => {
      const query = rawQuery.trim();
      if (!query) return false;
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/products?search=${encodeURIComponent(query)}`);
      }
      return true;
    },
    [navigate, onSearch]
  );
};

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  /** Initial/controlled-from-outside value (e.g. the current `search` filter). */
  defaultValue?: string;
  /** Called when the clear button is pressed. */
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search laptops, accessories...',
  className,
  onSearch,
  defaultValue = '',
  onClear,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const search = useProductSearch(onSearch);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={clsx('relative', className)}>
      <label htmlFor="sf-search-input" className="sr-only">
        Search products
      </label>
      <MagnifyingGlassIcon
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sf-subtle"
      />
      <input
        id="sf-search-input"
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sf-field h-12 w-full rounded-full border border-sf-line-strong bg-sf-surface/70 pl-12 pr-12 text-sf-ink placeholder:text-sf-subtle transition-[border-color,box-shadow] focus:border-sf-accent-strong focus:outline-none focus:ring-4 focus:ring-sf-accent-strong/20 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('');
            onClear?.();
          }}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-sf-subtle hover:bg-sf-surface-2 hover:text-sf-ink"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
