'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

const THEME_STORAGE_KEY = 'addis_eats_theme';

export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Helper to determine resolved theme based on choice and media query
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Initialize theme from localStorage or system on mount
  useEffect(() => {
    setMounted(true);
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system') {
        setThemeState(storedTheme);
        const resolved = storedTheme === 'system' ? getSystemTheme() : storedTheme;
        setResolvedTheme(resolved);
        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const initialResolved = getSystemTheme();
        setResolvedTheme(initialResolved);
        if (initialResolved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {
      // Storage access might fail in private windows or restrictions
    }
  }, [getSystemTheme]);

  // Handle system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      if (theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        if (newResolved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // Set theme manually
  const setTheme = useCallback(
    (newTheme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // Safe fallback
      }

      const nextResolved = newTheme === 'system' ? getSystemTheme() : newTheme;
      setResolvedTheme(nextResolved);

      if (nextResolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    [getSystemTheme]
  );

  // Quick toggle between light and dark
  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      mounted,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
