import { useState, useEffect, useCallback } from 'react';

export type AppTheme = 'dark' | 'light' | 'normal';

const STORAGE_KEY = 'hallmark-theme';
const DEFAULT_THEME: AppTheme = 'dark';

function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  // Remove all theme classes
  root.classList.remove('dark', 'light', 'normal');
  // Add the new theme class
  root.classList.add(theme);
  // Also set data-theme attribute for CSS selector fallback
  root.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
      if (stored && ['dark', 'light', 'normal'].includes(stored)) return stored;
    } catch {
      // ignore
    }
    return DEFAULT_THEME;
  });

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    // Apply immediately (don't wait for re-render)
    applyTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  }, []);

  return { theme, setTheme };
}
