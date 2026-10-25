import React, { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/productsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductSearch } from '@/components/common/SearchBar';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';
import ProductImage from './ProductImage';
import { categoryIcon } from './categoryVisuals';

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type PaletteOption =
  | { kind: 'search'; id: string; query: string }
  | { kind: 'product'; id: string; product: Product }
  | { kind: 'link'; id: string; label: string; href: string; hint: string; icon: Icon };

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const MIN_QUERY = 2;

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const term = useDebounce(query.trim(), 250);
  const navigate = useNavigate();
  const search = useProductSearch();

  const { data: results, isFetching } = useGetProductsQuery(
    { search: term, page: 1 },
    { skip: !open || term.length < MIN_QUERY }
  );
  const { data: categories } = useGetCategoriesQuery(undefined, { skip: !open });

  const quickLinks = useMemo<PaletteOption[]>(
    () => [
      { kind: 'link', id: 'all', label: 'All products', href: '/products', hint: 'Browse', icon: Squares2X2Icon },
      ...(categories?.results ?? []).map(
        (category): PaletteOption => ({
          kind: 'link',
          id: `category-${category.id}`,
          label: category.name,
          href: `/products?category=${category.id}`,
          hint: 'Category',
          icon: categoryIcon(category.name),
        })
      ),
      { kind: 'link', id: 'orders', label: 'My orders', href: '/orders', hint: 'Account', icon: ClipboardDocumentListIcon },
      { kind: 'link', id: 'wishlist', label: 'Wishlist', href: '/wishlist', hint: 'Account', icon: HeartIcon },
    ],
    [categories]
  );

  const trimmed = query.trim();
  const products = term.length >= MIN_QUERY ? (results?.results ?? []).slice(0, 6) : [];
  const options: PaletteOption[] = trimmed
    ? [
        { kind: 'search', id: 'search', query: trimmed },
        ...products.map((product): PaletteOption => ({ kind: 'product', id: `product-${product.id}`, product })),
      ]
    : quickLinks;

  const handleSelect = (option: PaletteOption | null) => {
    if (!option) return;
    if (option.kind === 'search') search(option.query);
    else if (option.kind === 'product') navigate(`/products/${option.product.id}`);
    else navigate(option.href);
    onClose();
  };

  const searching = trimmed.length >= MIN_QUERY && (isFetching || term !== trimmed);

  return (
    <Transition.Root show={open} as={Fragment} afterLeave={() => setQuery('')} appear>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-sf-bg/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto px-4 pt-[12vh] sm:px-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="sf-glass sf-gradient-border mx-auto max-w-2xl overflow-hidden rounded-sf-xl bg-sf-glass-strong shadow-sf-float">
              <Dialog.Title className="sr-only">Search LaptopWorld</Dialog.Title>
              <Combobox<PaletteOption | null> value={null} onChange={handleSelect} nullable>
                {({ activeOption }) => (
                  <>
                    <div className="relative border-b border-sf-line">
                      <MagnifyingGlassIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-sf-subtle"
                      />
                      <Combobox.Input
                        autoFocus
                        aria-label="Search products"
                        placeholder="Search laptops, brands, accessories…"
                        className="h-16 w-full border-0 bg-transparent pl-14 pr-16 text-base text-sf-ink placeholder:text-sf-subtle focus:outline-none focus:ring-0 focus-visible:outline-none"
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                          if (event.key === 'Enter' && !activeOption && search(query)) onClose();
                        }}
                      />
                      <kbd className="absolute right-5 top-1/2 -translate-y-1/2 rounded-md border border-sf-line-strong px-1.5 py-0.5 font-body text-[11px] text-sf-subtle">
                        Esc
                      </kbd>
                    </div>

                    <Combobox.Options static className="max-h-[60vh] scroll-py-2 overflow-y-auto p-2">
                      {!trimmed && (
                        <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-sf-subtle">
                          Quick links
                        </p>
                      )}
                      {options.map((option) => (
                        <Combobox.Option key={option.id} value={option} as={Fragment}>
                          {({ active }) => (
                            <li
                              className={clsx(
                                'flex cursor-pointer select-none items-center gap-3 rounded-sf px-3 py-2.5 transition-colors',
                                active ? 'bg-sf-surface-2 text-sf-ink' : 'text-sf-muted'
                              )}
                            >
                              {option.kind === 'product' ? (
                                <>
                                  <ProductImage
                                    src={option.product.primary_image}
                                    alt=""
                                    label={option.product.brand_name}
                                    className="h-12 w-12 flex-shrink-0 rounded-sf-sm"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium text-sf-ink">{option.product.name}</span>
                                    <span className="block truncate text-xs text-sf-subtle">{option.product.brand_name}</span>
                                  </span>
                                  <span className="text-sm font-semibold tabular-nums text-sf-ink">
                                    {formatPrice(option.product.discounted_price)}
                                  </span>
                                </>
                              ) : option.kind === 'search' ? (
                                <>
                                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sf-sm bg-sf-gradient text-sf-on-accent">
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                  </span>
                                  <span className="min-w-0 flex-1 truncate">
                                    Search for <span className="font-semibold text-sf-ink">“{option.query}”</span>
                                  </span>
                                  <ArrowRightIcon className={clsx('h-4 w-4 transition-opacity', active ? 'opacity-100' : 'opacity-0')} />
                                </>
                              ) : (
                                <>
                                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sf-sm bg-sf-surface-2 text-sf-accent ring-1 ring-sf-line">
                                    <option.icon className="h-5 w-5" />
                                  </span>
                                  <span className="min-w-0 flex-1 truncate font-medium text-sf-ink">{option.label}</span>
                                  <span className="text-xs text-sf-subtle">{option.hint}</span>
                                </>
                              )}
                            </li>
                          )}
                        </Combobox.Option>
                      ))}

                      {searching && (
                        <li role="status" className="px-3 py-3 text-sm text-sf-subtle">
                          Searching…
                        </li>
                      )}
                      {!searching && trimmed.length >= MIN_QUERY && products.length === 0 && (
                        <li className="px-3 py-3 text-sm text-sf-subtle">No products match “{trimmed}”. Press Enter to search anyway.</li>
                      )}
                    </Combobox.Options>

                    <div className="hidden items-center gap-4 border-t border-sf-line px-5 py-3 text-xs text-sf-subtle sm:flex">
                      <span><kbd className="font-body">↑</kbd> <kbd className="font-body">↓</kbd> to navigate</span>
                      <span><kbd className="font-body">↵</kbd> to select</span>
                      <span><kbd className="font-body">Esc</kbd> to close</span>
                    </div>
                  </>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CommandPalette;
