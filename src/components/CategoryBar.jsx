'use client';

export default function CategoryBar({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  onCategoryChange,
  className = '',
}) {
  const handleSelect = onSelectCategory || onCategoryChange;

  return (
    <nav
      aria-label="Menu categories"
      className={`flex items-center gap-2.5 flex-wrap ${className}`}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => handleSelect?.(category)}
            className={`h-10 px-4 rounded-xl text-sm font-medium border transition-all duration-200 cursor-pointer inline-flex items-center justify-center ${
              isSelected
                ? 'border-amber-900 bg-amber-900 text-amber-50 shadow-sm shadow-amber-900/10'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            {category}
          </button>
        );
      })}
    </nav>
  );
}
