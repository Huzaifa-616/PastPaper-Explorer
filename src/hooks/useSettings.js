import { useState, useEffect, useCallback } from 'react';
import { THEMES } from '../config/themes';

const KEY = 'nexusSettings';
const DEFAULTS = { themeId: 'midnight', lastDarkId: 'midnight', lastLightId: 'daylight', fontScale: 1, defaultSubject: '' , symbolField: true , backdrop: 'falling', glass: true };

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && THEMES[saved.themeId]) return { ...DEFAULTS, ...saved };
  } catch { /* fall through */ }
  // Migrate from the old single dark/light key so existing users keep their choice
  const legacy = localStorage.getItem('nexusTheme');
  if (legacy === 'light') return { ...DEFAULTS, themeId: 'daylight' };
  return { ...DEFAULTS };
}

// Read a setting outside React (e.g. ExplorerPage's initial subject).
export function getSetting(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return (saved && saved[key] !== undefined) ? saved[key] : DEFAULTS[key];
  } catch { return DEFAULTS[key]; }
}

export function useSettings() {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('nexus-settings', { detail: settings }));
  }, [settings]);

  const setSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      // remember the user's preferred dark AND light themes separately, so the
      // Sun/Moon toggle returns to each side's chosen theme (like the Code Lab)
      if (key === 'themeId') {
        if (THEMES[value]?.isDark) next.lastDarkId = value;
        else if (THEMES[value]) next.lastLightId = value;
      }
      return next;
    });
  }, []);

  const theme = THEMES[settings.themeId] || THEMES.midnight;
  const dark = theme.isDark;

  // Sun/Moon button behaviour: dark ⇄ light, each side returning to the
  // user's own chosen theme (not always Midnight / Daylight).
  const toggleTheme = useCallback(() => {
    setSettings(prev => {
      const isDark = THEMES[prev.themeId]?.isDark;
      return { ...prev, themeId: isDark ? (prev.lastLightId || 'daylight') : (prev.lastDarkId || 'midnight') };
    });
  }, []);

  const resetSettings = useCallback(() => setSettings({ ...DEFAULTS }), []);

  return { settings, setSetting, resetSettings, theme, dark, toggleTheme };
}
