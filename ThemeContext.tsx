import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId = 'slate' | 'gold' | 'light' | 'emerald';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  accentColor: string;
  dotColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'slate',
    name: 'Architectural Slate',
    tagline: 'Deep charcoal & obsidian with crisp silver borders',
    accentColor: '#ffffff',
    dotColor: '#94a3b8',
  },
  {
    id: 'gold',
    name: 'Imperial Gold',
    tagline: 'Midnight obsidian with champagne gold luster',
    accentColor: '#f59e0b',
    dotColor: '#fbbf24',
  },
  {
    id: 'light',
    name: 'Nordic Ivory',
    tagline: 'Minimalist daylight luxury with clean slate lines',
    accentColor: '#0f172a',
    dotColor: '#64748b',
  },
  {
    id: 'emerald',
    name: 'Emerald Noir',
    tagline: 'Deep pine obsidian with jewel-toned emerald accents',
    accentColor: '#10b981',
    dotColor: '#34d399',
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('estateview_theme') as ThemeId;
      if (saved && ['slate', 'gold', 'light', 'emerald'].includes(saved)) {
        return saved;
      }
    }
    return 'slate';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('estateview_theme', newTheme);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-slate', 'theme-gold', 'theme-light', 'theme-emerald');
      root.classList.add(`theme-${theme}`);
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEME_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
