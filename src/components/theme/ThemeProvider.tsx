'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserTheme, updateUserTheme, type Theme } from '@/lib/db/userSettings';
import { createClientComponentClient } from '@/lib/supabase';

type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  initialTheme?: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({ initialTheme = 'system', children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isHydrated, setIsHydrated] = useState(false);
  const supabase = createClientComponentClient();

  // Get system preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve theme to actual light/dark
  const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Apply theme to DOM
  const applyTheme = (resolved: ResolvedTheme) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Load theme from localStorage on client
  useEffect(() => {
    const stored = localStorage.getItem('focusly_theme') as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
    }
    setIsHydrated(true);
  }, []);

  // Load theme from Supabase when user is authenticated
  useEffect(() => {
    if (!isHydrated) return;

    const loadUserTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userTheme = await getUserTheme(user.id);
          if (userTheme) {
            setThemeState(userTheme);
            // Sync with localStorage
            localStorage.setItem('focusly_theme', userTheme);
          }
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
      }
    };

    loadUserTheme();
  }, [isHydrated, supabase.auth]);

  // Update resolved theme when theme changes
  useEffect(() => {
    const newResolved = resolveTheme(theme);
    setResolvedTheme(newResolved);
    applyTheme(newResolved);
  }, [theme]);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newResolved = resolveTheme(theme);
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to localStorage immediately
    localStorage.setItem('focusly_theme', newTheme);
    
    // Save to Supabase if user is authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateUserTheme(user.id, newTheme);
      }
    } catch (error) {
      console.error('Error saving theme to Supabase:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ThemeScript component for SSR-safe theme application
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('focusly_theme') || 'system';
              var resolved = theme === 'system' 
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : theme;
              
              if (resolved === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {
              // Fallback to system preference
              if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
              }
            }
          })();
        `,
      }}
    />
  );
}
