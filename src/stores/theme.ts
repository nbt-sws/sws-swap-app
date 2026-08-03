import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'sws-theme';

function resolve(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  resolvedTheme: 'dark',

  setTheme: (theme) => {
    const resolved = resolve(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.classList.toggle('light', resolved === 'light');
    set({ theme, resolvedTheme: resolved });
  },

  initTheme: () => {
    // App is dark-only by design (neon/arcade tokens have no light variants
    // yet). Force dark and clear any stale stored preference so the removed
    // toggle can never resurrect a broken light mode.
    localStorage.setItem(STORAGE_KEY, 'dark');
    get().setTheme('dark');
  },

  toggleTheme: () => {
    const next = get().resolvedTheme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
