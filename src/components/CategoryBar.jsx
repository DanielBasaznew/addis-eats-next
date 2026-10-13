'use client';

import { useRef } from 'react';

export default function CategoryBar({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  onCategoryChange,
  className = '',
}) {
  const handleSelect = onSelectCategory || onCategoryChange;
  const scrollRef = useRef(null);

  return (
    <div className={`relative flex items-center w-full min-w-0 ${className}`}>
      {/* Horizontal Slider Track */}
      <nav
        ref={scrollRef}
        aria-label="Menu categories"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 w-full"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => handleSelect?.(category)}
              className={`h-10 px-4.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap inline-flex items-center justify-center active:scale-95 ${
                isSelected
                  ? 'border-amber-900 bg-amber-900 text-amber-50 shadow-sm shadow-amber-900/20'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              {category}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
