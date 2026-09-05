'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type UITheme = 'romantic' | 'neo-brutal';

interface ThemeContextType {
  uiTheme: UITheme;
  setUITheme: (theme: UITheme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [uiTheme, setUIThemeState] = useState<UITheme>('romantic');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('ui-theme') as UITheme;
    if (savedTheme === 'romantic' || savedTheme === 'neo-brutal') {
      setUIThemeState(savedTheme);
      document.documentElement.setAttribute('data-ui-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-ui-theme', 'romantic');
    }
  }, []);

  const setUITheme = (theme: UITheme) => {
    setUIThemeState(theme);
    localStorage.setItem('ui-theme', theme);
    document.documentElement.setAttribute('data-ui-theme', theme);
  };

  return (
    <ThemeContext.Provider value={{ uiTheme, setUITheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useUITheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useUITheme must be used within a ThemeProvider');
  }
  return context;
}
