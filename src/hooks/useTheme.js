import { useState, useEffect, useCallback } from 'react';

// Dark/light theme, persisted across sessions.
export function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('nexusTheme') !== 'light');
  useEffect(() => { localStorage.setItem('nexusTheme', dark ? 'dark' : 'light'); }, [dark]);
  const toggleTheme = useCallback(() => setDark(d => !d), []);
  return { dark, toggleTheme };
}
