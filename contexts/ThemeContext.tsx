import React, { createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

export type ThemeSetting = 'light' | 'dark' | 'auto';

interface ThemeContextProps {
  themeSetting: ThemeSetting;
  setThemeSetting: Dispatch<SetStateAction<ThemeSetting>>;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProviderContext = ({ children }: { children: ReactNode }) => {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('themeSetting') as ThemeSetting | null;
      if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
        return storedTheme;
      }
    }
    return 'auto'; // Default to auto
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeSetting', themeSetting);
    }
  }, [themeSetting]);

  return (
    <ThemeContext.Provider value={{ themeSetting, setThemeSetting }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProviderContext');
  }
  return context;
}; 