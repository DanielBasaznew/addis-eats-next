'use client';

import { Children, useEffect, useState } from 'react';
import useSWR from 'swr';
import CategoryBar from './CategoryBar';
import { fetcher } from '@/lib/fetcher';

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function FilterShell({ categories = [], children }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const query = debouncedSearch.trim();

  const { data, error, isLoading } = useSWR(
    query || page > 1
      ? `/api/dishes?q=${encodeURIComponent(query)}&page=${page}`
      : null,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  const allChildren = Children.toArray(children);

  const displayedChildren =
    query || page > 1
      ? data?.dishes
        ? allChildren.filter((child) => {
            const childId = String(
              child.props?.['data-dish-id']
            );

            return data.dishes.some(
              (dish) => String(dish.id) === childId
            );
          })
        : allChildren
      : allChildren;

  const filteredChildren = displayedChildren.filter((child) => {
    if (selectedCategory === 'All') return true;

    return (
      child.props?.['data-category'] === selectedCategory
    );
  });

  // Sync from URL search params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    const rawPage = parseInt(params.get('page'), 10);

    if (qParam || (!isNaN(rawPage) && rawPage > 1)) {
      queueMicrotask(() => {
        if (qParam) setSearchTerm(qParam);
        if (!isNaN(rawPage) && rawPage > 1) setPage(rawPage);
      });
    }
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get('q') || '';
      const rawPage = parseInt(params.get('page'), 10);
      const pageParam = !isNaN(rawPage) && rawPage > 1 ? rawPage : 1;
      setSearchTerm(qParam);
      setPage(pageParam);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function updateQueryString(newPage, newQuery) {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    if (newPage > 1) {
      params.set('page', String(newPage));
    } else {
      params.delete('page');
    }
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.pushState(null, '', newUrl);
  }

  // Update URL search query param when debounced search term changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const currentQ = params.get('q') || '';
    if (query !== currentQ) {
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      params.delete('page');
      const qs = params.toString();
      const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [query]);

  const totalPages =
    query || page > 1
      ? data?.totalPages || 1
      : Math.max(1, Math.ceil(allChildren.length / 3));

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setPage(1);
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    updateQueryString(newPage, query);
  }

  function handleCategoryChange(category) {
    setSelectedCategory(category);
    setPage(1);
    updateQueryString(1, query);
  }

  function resetFilters() {
    setSearchTerm('');
    setSelectedCategory('All');
    setPage(1);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.pathname);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
            />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search dishes..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-800 dark:focus:border-amber-500 transition-all shadow-xs"
          />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onSelectCategory={handleCategoryChange}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 dark:text-red-400">
          Failed to load dishes.
        </p>
      )}

      {isLoading && query && filteredChildren.length === 0 && (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Searching...
        </p>
      )}

      {!isLoading && filteredChildren.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stone-500 dark:text-stone-400">
            No dishes found.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-sm font-semibold text-amber-900 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {filteredChildren.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChildren}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 cursor-pointer transition-colors"
          >
            Previous
          </button>

          <span className="text-sm text-stone-600 dark:text-stone-400">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}