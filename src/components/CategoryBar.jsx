'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export default function CategoryBar({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  onCategoryChange,
  className = '',
}) {
  const handleSelect = onSelectCategory || onCategoryChange;
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const overflow = maxScroll > 6;

    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < maxScroll - 6);

    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    } else {
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    // Re-check after images/fonts settle
    const timer = setTimeout(updateScrollState, 200);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      clearTimeout(timer);
    };
  }, [categories, updateScrollState]);

  // Smoothly center the active category item when selected
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector('[data-selected="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedCategory]);

  const slide = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className={`flex flex-col w-full min-w-0 ${className}`}>
      <div className="relative flex items-center w-full min-w-0">
        {/* Left Slider Arrow Button */}
        {hasOverflow && canScrollLeft && (
          <button
            type="button"
            onClick={() => slide('left')}
            aria-label="Slide categories left"
            className="absolute -left-2 z-20 w-8 h-8 rounded-full bg-white/95 border border-stone-200/90 text-stone-700 hover:text-stone-950 hover:bg-stone-50 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Left Edge Fade Mask */}
        {hasOverflow && canScrollLeft && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-50 to-transparent z-10"
          />
        )}

        {/* Horizontal Slider Track */}
        <nav
          ref={scrollRef}
          aria-label="Menu categories"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 w-full"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                data-selected={isSelected}
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

        {/* Right Edge Fade Mask */}
        {hasOverflow && canScrollRight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-stone-50 to-transparent z-10"
          />
        )}

        {/* Right Slider Arrow Button */}
        {hasOverflow && canScrollRight && (
          <button
            type="button"
            onClick={() => slide('right')}
            aria-label="Slide categories right"
            className="absolute -right-2 z-20 w-8 h-8 rounded-full bg-white/95 border border-stone-200/90 text-stone-700 hover:text-stone-950 hover:bg-stone-50 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Visual Slider Indicator Track for Phone & Desktop */}
      {hasOverflow && (
        <div
          className="flex items-center justify-center pt-1.5"
          aria-hidden="true"
        >
          <div className="h-1 w-20 bg-stone-200/80 rounded-full overflow-hidden relative shadow-inner">
            <div
              className="absolute top-0 bottom-0 bg-amber-900 rounded-full transition-all duration-100 ease-out"
              style={{
                width: '32%',
                left: `${scrollProgress * 68}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
