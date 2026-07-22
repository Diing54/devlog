import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'devlog-theme';

export function useTheme() {
  // index.html already set data-theme before React mounted — just read it.
  // Single source of truth: no duplicate detection logic here.
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
