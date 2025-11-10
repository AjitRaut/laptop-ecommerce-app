import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery } from '@/store/api/productsApi';
import { SORT_OPTIONS, ITEMS_PER_PAGE } from '@/utils/constants';
import { formatPrice } from '@/utils/formatters';
import { clsx } from 'clsx';
import type { ProductFilters } from '@/types';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import Input from '@/components/common/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ProductCard from '@/components/common/ProductCard';
import Pagination from '@/components/common/Pagination';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    ordering: searchParams.get('ordering') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const { data: productsData, isLoading, error } = useGetProductsQuery(filters);
  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery();

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') params.set(key, value.toString());
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const updateFilter = (key: keyof ProductFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      min_price: '',
      max_price: '',
      ordering: '',
      page: 1,
    });
  };

  const totalPages = productsData ? Math.ceil(productsData.count / ITEMS_PER_PAGE) : 1;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="Error loading products"
          description="We encountered an error while loading products. Please try again."
          action={
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const FilterSection: React.FC = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <Disclosure as="div" className="border-b border-gray-200 pb-6">
        {({ open }) => (
          <>
            <h3 className="-my-3 flow-root">
              <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                <span className="font-medium text-gray-900">Price Range</span>
                <ChevronDownIcon
                  className={clsx(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                />
              </Disclosure.Button>
            </h3>
            <Disclosure.Panel className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Min Price"
                    type="number"
                    value={filters.min_price}
                    onChange={(e) => updateFilter('min_price', e.target.value)}
                    fullWidth={false}
                  />
                  <Input
                    placeholder="Max Price"
                    type="number"
                    value={filters.max_price}
                    onChange={(e) => updateFilter('max_price', e.target.value)}
                    fullWidth={false}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[10000, 25000, 50000, 75000, 100000].map((price) => (
                    <button
                      key={price}
                      onClick={() => updateFilter('max_price', price.toString())}
                      className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Under {formatPrice(price)}
                    </button>
                  ))}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Categories */}
      <Disclosure as="div" className="border-b border-gray-200 pb-6" defaultOpen>
        {({ open }) => (
          <>
            <h3 className="-my-3 flow-root">
              <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                <span className="font-medium text-gray-900">Category</span>
                <ChevronDownIcon
                  className={clsx(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                />
              </Disclosure.Button>
            </h3>
            <Disclosure.Panel className="pt-6">
              <div className="space-y-4">
                {categories?.results?.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      id={`filter-category-${category.id}`}
                      name="category"
                      type="radio"
                      checked={filters.category === category.id.toString()}
                      onChange={() => updateFilter('category', category.id.toString())}
                      className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`filter-category-${category.id}`}
                      className="ml-3 text-sm text-gray-600 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Brands */}
      <Disclosure as="div" className="border-b border-gray-200 pb-6">
        {({ open }) => (
          <>
            <h3 className="-my-3 flow-root">
              <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                <span className="font-medium text-gray-900">Brand</span>
                <ChevronDownIcon
                  className={clsx(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                />
              </Disclosure.Button>
            </h3>
            <Disclosure.Panel className="pt-6">
              <div className="space-y-4">
                {brands?.results
?.map((brand) => (
                  <div key={brand.id} className="flex items-center">
                    <input
                      id={`filter-brand-${brand.id}`}
                      name="brand"
                      type="radio"
                      checked={filters.brand === brand.id.toString()}
                      onChange={() => updateFilter('brand', brand.id.toString())}
                      className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`filter-brand-${brand.id}`}
                      className="ml-3 text-sm text-gray-600 cursor-pointer"
                    >
                      {brand.name}
                    </label>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Clear Filters */}
      <div className="pt-6">
        <Button
          variant="outline"
          onClick={clearFilters}
          fullWidth
          size="sm"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Products</h1>
            {productsData && (
              <p className="mt-2 text-sm text-gray-600">
                Showing {productsData.results.length} of {productsData.count} products
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                Sort
                <ChevronDownIcon className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              </Menu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {SORT_OPTIONS.map((option) => (
                      <Menu.Item key={option.name}>
                        {({ active }) => (
                          <button
                            onClick={() => updateFilter('ordering', option.value)}
                            className={clsx(
                              option.value === filters.ordering ? 'font-medium text-gray-900' : 'text-gray-500',
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm w-full text-left hover:bg-gray-50'
                            )}
                          >
                            {option.name}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden"
              leftIcon={<FunnelIcon className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>
        </div>

        <section aria-labelledby="products-heading" className="pb-24 pt-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Filters</h2>
                <FilterSection />
              </div>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : productsData?.results.length === 0 ? (
                <EmptyState
                  title="No products found"
                  description="Try adjusting your filters or search criteria to find what you're looking for."
                  action={
                    <Button onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  }
                />
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {productsData?.results.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination
                        currentPage={filters.page as any || 1}
                        totalPages={totalPages}
                        onPageChange={(page) => updateFilter('page', page)}
                        totalItems={productsData?.count || 0}
                        itemsPerPage={ITEMS_PER_PAGE}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Mobile Filter Dialog */}
        <Transition show={mobileFiltersOpen}>
          <div className="relative z-40 lg:hidden">
            <Transition.Child
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="mt-4 px-4">
                    <FilterSection />
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default Products;