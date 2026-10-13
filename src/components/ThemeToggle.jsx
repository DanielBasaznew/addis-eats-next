'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ className = '', showLabel = false, size = 'default' }) {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  const isDark = mounted && resolvedTheme === 'dark';

  const sizeClasses =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
      ? 'w-10 h-10 text-sm'
      : 'w-9 h-9 text-xs';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      className={`group relative inline-flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40 select-none ${
        showLabel ? 'px-3.5 py-2 gap-2.5 w-full justify-between' : sizeClasses
      } ${
        isDark
          ? 'bg-stone-850 hover:bg-stone-800 text-amber-400 border border-stone-700/80 shadow-xs'
          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/90 shadow-xs'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
        {/* Sun Icon (shown in dark mode) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4.5 h-4.5 transition-all duration-500 ease-spring ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
              : '-rotate-90 scale-0 opacity-0 absolute'
          }`}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>

        {/* Moon Icon (shown in light mode) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4.5 h-4.5 transition-all duration-500 ease-spring ${
            isDark
              ? 'rotate-90 scale-0 opacity-0 absolute'
              : 'rotate-0 scale-100 opacity-100 text-stone-700 group-hover:text-amber-900'
          }`}
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </div>

      {showLabel && (
        <span className="text-sm font-semibold tracking-tight text-inherit">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}

      {showLabel && (
        <span className="text-[11px] font-medium opacity-60">
          {isDark ? '☀️ Active' : '🌙 Active'}
        </span>
      )}
    </button>
  );
}
