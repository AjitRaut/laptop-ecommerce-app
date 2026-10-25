import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react';
import { AdjustmentsHorizontalIcon, ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery } from '@/store/api/productsApi';
import { SORT_OPTIONS, ITEMS_PER_PAGE } from '@/utils/constants';
import { formatPrice } from '@/utils/formatters';
import type { Brand, Category, ProductFilters } from '@/types';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import ProductGrid from '@/components/common/ProductGrid';
import SearchBar from '@/components/common/SearchBar';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import { SfButton } from '@/components/storefront/SfButton';
import { TextField } from '@/components/storefront/Field';
import { Skeleton } from '@/components/storefront/Skeleton';
import { container } from '@/components/storefront/utils';

type FilterKey = keyof ProductFilters;

const EMPTY_FILTERS: ProductFilters = {
  search: '',
  category: '',
  brand: '',
  min_price: '',
  max_price: '',
  ordering: '',
  page: 1,
};

const PRICE_SHORTCUTS = [10000, 25000, 50000, 75000, 100000];

const filtersFromParams = (params: URLSearchParams): ProductFilters => ({
  search: params.get('search') || '',
  category: params.get('category') || '',
  brand: params.get('brand') || '',
  min_price: params.get('min_price') || '',
  max_price: params.get('max_price') || '',
  ordering: params.get('ordering') || '',
  page: parseInt(params.get('page') || '1') || 1,
});

const paramsFromFilters = (filters: ProductFilters): URLSearchParams => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== '') params.set(key, value.toString());
  });
  return params;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/* ─────────────────────────── Filter panel ─────────────────────────── */

interface FilterPanelProps {
  idPrefix: string;
  filters: ProductFilters;
  onChange: (key: FilterKey, value: string) => void;
  onClear: () => void;
  categories?: Category[];
  brands?: Brand[];
}

const OptionPills: React.FC<{
  name: string;
  legend: string;
  options: { id: string; name: string }[];
  value: string;
  onSelect: (value: string) => void;
}> = ({ name, legend, options, value, onSelect }) => (
  <fieldset>
    <legend className="sr-only">{legend}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <label
            key={option.id || 'all'}
            className={clsx(
              'cursor-pointer select-none rounded-full border px-3.5 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sf-accent-strong has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-sf-bg',
              selected
                ? 'border-transparent bg-sf-gradient font-medium text-sf-on-accent shadow-sf-glow'
                : 'border-sf-line-strong text-sf-muted hover:border-sf-accent/50 hover:text-sf-ink'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={selected}
              onChange={() => onSelect(option.id)}
              className="sr-only"
            />
            {option.name}
          </label>
        );
      })}
    </div>
  </fieldset>
);

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Disclosure as="div" defaultOpen className="border-b border-sf-line py-5 first:pt-0">
    {({ open }) => (
      <>
        <h3>
          <Disclosure.Button className="flex w-full items-center justify-between rounded-sf-sm text-left text-sm font-semibold text-sf-ink">
            {title}
            <ChevronDownIcon className={clsx('h-4 w-4 text-sf-subtle transition-transform duration-300', open && 'rotate-180')} />
          </Disclosure.Button>
        </h3>
        <Disclosure.Panel className="pt-4">{children}</Disclosure.Panel>
      </>
    )}
  </Disclosure>
);

// Defined at module level (not inside Products) so inputs keep focus while typing.
const FilterPanel: React.FC<FilterPanelProps> = ({ idPrefix, filters, onChange, onClear, categories, brands }) => (
  <div>
    <FilterSection title="Price Range">
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id={`${idPrefix}-min-price`}
          label="Min (₹)"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="0"
          value={filters.min_price}
          onChange={(e) => onChange('min_price', e.target.value)}
          className="h-11"
        />
        <TextField
          id={`${idPrefix}-max-price`}
          label="Max (₹)"
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Any"
          value={filters.max_price}
          onChange={(e) => onChange('max_price', e.target.value)}
          className="h-11"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRICE_SHORTCUTS.map((price) => {
          const active = filters.max_price === price.toString();
          return (
            <button
              key={price}
              type="button"
              aria-pressed={active}
              onClick={() => onChange('max_price', price.toString())}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                active
                  ? 'border-sf-accent-strong bg-sf-accent/10 text-sf-accent'
                  : 'border-sf-line-strong text-sf-muted hover:border-sf-accent/50 hover:text-sf-ink'
              )}
            >
              Under {formatPrice(price)}
            </button>
          );
        })}
      </div>
    </FilterSection>

    <FilterSection title="Category">
      <OptionPills
        name={`${idPrefix}-category`}
        legend="Category"
        value={filters.category ?? ''}
        onSelect={(value) => onChange('category', value)}
        options={[{ id: '', name: 'All' }, ...(categories ?? []).map((c) => ({ id: c.id.toString(), name: c.name }))]}
      />
    </FilterSection>

    <FilterSection title="Brand">
      <OptionPills
        name={`${idPrefix}-brand`}
        legend="Brand"
        value={filters.brand ?? ''}
        onSelect={(value) => onChange('brand', value)}
        options={[{ id: '', name: 'All' }, ...(brands ?? []).map((b) => ({ id: b.id.toString(), name: b.name }))]}
      />
    </FilterSection>

    <div className="pt-5">
      <SfButton variant="outline" onClick={onClear} fullWidth size="md">
        Clear All Filters
      </SfButton>
    </div>
  </div>
);

/* ─────────────────────────── Page ─────────────────────────── */

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const [filters, setFilters] = useState<ProductFilters>(() => filtersFromParams(searchParams));

  const { data: productsData, isLoading, isFetching, error } = useGetProductsQuery(filters);
  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery();

  // URL → filters: header search / mega-menu links can change the query while this page stays mounted.
  const paramsKey = searchParams.toString();
  useEffect(() => {
    const fromUrl = filtersFromParams(new URLSearchParams(paramsKey));
    setFilters((prev) =>
      paramsFromFilters(prev).toString() === paramsFromFilters(fromUrl).toString() ? prev : fromUrl
    );
  }, [paramsKey]);

  // filters → URL (skip when nothing changed; normalising defaults replaces instead of pushing history).
  useEffect(() => {
    const params = paramsFromFilters(filters);
    if (params.toString() === searchParams.toString()) return;
    const onlyNormalising =
      paramsFromFilters(filtersFromParams(searchParams)).toString() === params.toString();
    setSearchParams(params, { replace: onlyNormalising });
    // searchParams is read for comparison only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, setSearchParams]);

  const updateFilter = (key: FilterKey, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  const changePage = (page: number) => {
    updateFilter('page', page);
    resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const totalPages = productsData ? Math.ceil(productsData.count / ITEMS_PER_PAGE) : 1;
  const currentPage = Number(filters.page) || 1;

  const categoryList = categories?.results;
  const brandList = brands?.results;
  // Header links filter by name ("laptop", "accessories"): the API matches it against
  // category names, so title the page after the single match or a pluralised term.
  const textCategoryName = (term: string) => {
    const matches = categoryList?.filter((c) => c.name.toLowerCase().includes(term.toLowerCase())) ?? [];
    if (matches.length === 1) return matches[0].name;
    const label = capitalize(term);
    return label.endsWith('s') ? label : `${label}s`;
  };
  const categoryName =
    filters.category &&
    (categoryList?.find((c) => c.id.toString() === filters.category)?.name ??
      (/^\d+$/.test(filters.category) ? filters.category : textCategoryName(filters.category)));
  const brandName = filters.brand && (brandList?.find((b) => b.id.toString() === filters.brand)?.name ?? filters.brand);
  const sortName = SORT_OPTIONS.find((option) => option.value === filters.ordering)?.name ?? 'Most Popular';

  const heading = filters.search
    ? `Results for “${filters.search}”`
    : categoryName || (brandName ? `${brandName} products` : 'All products');

  type Chip = { key: FilterKey; label: string };
  const chipCandidates: (Chip | null)[] = [
    filters.search ? { key: 'search', label: `“${filters.search}”` } : null,
    categoryName ? { key: 'category', label: categoryName } : null,
    brandName ? { key: 'brand', label: brandName } : null,
    filters.min_price ? { key: 'min_price', label: `From ${formatPrice(filters.min_price)}` } : null,
    filters.max_price ? { key: 'max_price', label: `Under ${formatPrice(filters.max_price)}` } : null,
  ];
  const activeChips = chipCandidates.filter((chip): chip is Chip => chip !== null);

  if (error) {
    return (
      <div className={clsx(container, 'flex min-h-[70vh] items-center justify-center')}>
        <SEO title="Products" />
        <EmptyState
          headingLevel="h1"
          illustration="error"
          title="Error loading products"
          description="We encountered an error while loading products. Please try again."
          action={<SfButton onClick={() => window.location.reload()}>Retry</SfButton>}
        />
      </div>
    );
  }

  const panelProps = {
    filters,
    onChange: (key: FilterKey, value: string) => updateFilter(key, value),
    onClear: clearFilters,
    categories: categoryList,
    brands: brandList,
  };

  return (
    <div className={clsx(container, 'pb-8 pt-8 sm:pt-12')}>
      <SEO
        title={heading}
        description="Browse premium laptops and accessories at LaptopWorld. Filter by category, brand and price."
      />

      {/* Header */}
      <header className="relative">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-sf-accent">Shop</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-sf-ink sm:text-5xl lg:text-6xl">
          {heading}
        </h1>
        <div className="mt-3 text-sm text-sf-muted" aria-live="polite">
          {productsData ? (
            <>
              Showing {productsData.results.length} of {productsData.count} products
            </>
          ) : (
            <Skeleton className="h-4 w-40" />
          )}
        </div>
      </header>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          className="w-full sm:max-w-md"
          defaultValue={filters.search}
          onSearch={(query) => updateFilter('search', query)}
          onClear={() => updateFilter('search', '')}
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <SfButton
            variant="secondary"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden"
            leftIcon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
          >
            Filters{activeChips.length > 0 && ` (${activeChips.length})`}
          </SfButton>

          <Menu as="div" className="relative">
            <Menu.Button className="sf-glass inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm text-sf-muted transition-colors hover:text-sf-ink">
              <span className="hidden sm:inline">Sort:</span>
              <span className="font-medium text-sf-ink">{sortName}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="sf-glass absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-sf-lg bg-sf-glass-strong p-1.5 shadow-sf-float focus:outline-none">
                {SORT_OPTIONS.map((option) => (
                  <Menu.Item key={option.name}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => updateFilter('ordering', option.value)}
                        className={clsx(
                          'flex w-full items-center justify-between rounded-sf-sm px-3 py-2 text-left text-sm',
                          active && 'bg-sf-surface-2',
                          option.value === filters.ordering ? 'font-medium text-sf-ink' : 'text-sf-muted'
                        )}
                      >
                        {option.name}
                        {option.value === filters.ordering && <CheckIcon className="h-4 w-4 text-sf-accent" />}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Active filters */}
      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => updateFilter(chip.key, '')}
              aria-label={`Remove filter ${chip.label}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-sf-accent/10 px-3 py-1 text-xs font-medium text-sf-accent ring-1 ring-inset ring-sf-accent/25 transition-colors hover:bg-sf-accent/15"
            >
              {chip.label}
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          ))}
          <button type="button" onClick={clearFilters} className="px-2 text-xs font-medium text-sf-subtle hover:text-sf-ink">
            Clear all
          </button>
        </div>
      )}

      <section ref={resultsRef} aria-labelledby="products-heading" className="scroll-mt-28 pb-16 pt-8">
        <h2 id="products-heading" className="sr-only">
          Products
        </h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Desktop filters */}
          <aside className="hidden lg:col-span-3 lg:block">
            <GlassPanel className="sticky top-24">
              <h2 className="mb-5 font-display text-lg font-semibold text-sf-ink">Filters</h2>
              <FilterPanel idPrefix="desktop" {...panelProps} />
            </GlassPanel>
          </aside>

          {/* Product grid */}
          <div className={clsx('lg:col-span-9 transition-opacity duration-300', isFetching && !isLoading && 'opacity-60')}>
            <ProductGrid
              key={currentPage}
              products={productsData?.results ?? []}
              isLoading={isLoading}
              skeletonCount={6}
              columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              emptyStateProps={{
                title: 'No products found',
                description: "Try adjusting your filters or search criteria to find what you're looking for.",
                action: <SfButton onClick={clearFilters}>Clear Filters</SfButton>,
              }}
            />

            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={changePage}
                  totalItems={productsData?.count || 0}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileFiltersOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-sf-bg/70 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-sf-out duration-500 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="sf-glass relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto border-y-0 border-r-0 bg-sf-glass-strong px-5 pb-10 pt-5">
                <div className="mb-6 flex items-center justify-between">
                  <Dialog.Title className="font-display text-lg font-semibold text-sf-ink">Filters</Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <FilterPanel idPrefix="mobile" {...panelProps} />
                <SfButton className="mt-6" fullWidth onClick={() => setMobileFiltersOpen(false)}>
                  Show {productsData?.count ?? ''} results
                </SfButton>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default Products;
