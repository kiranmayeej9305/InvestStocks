"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import '../../styles/themes/professional-blue.css';

interface ProfessionalThemeContextType {
  isProfessionalTheme: boolean;
  toggleProfessionalTheme: () => void;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
  };
}

const ProfessionalThemeContext = createContext<ProfessionalThemeContextType | undefined>(undefined);

export function useProfessionalTheme() {
  const context = useContext(ProfessionalThemeContext);
  if (context === undefined) {
    throw new Error('useProfessionalTheme must be used within a ProfessionalThemeProvider');
  }
  return context;
}

interface ProfessionalThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: boolean;
}

export function ProfessionalThemeProvider({ 
  children, 
  defaultTheme = true 
}: ProfessionalThemeProviderProps) {
  const [isProfessionalTheme, setIsProfessionalTheme] = useState(defaultTheme);
  const { theme } = useTheme();
  
  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('professional-theme-enabled');
    if (saved !== null) {
      setIsProfessionalTheme(JSON.parse(saved));
    }
  }, []);

  // Apply professional theme CSS
  useEffect(() => {
    if (isProfessionalTheme) {
      // Dynamically import and apply the professional theme
      document.body.classList.add('professional-theme');
    } else {
      document.body.classList.remove('professional-theme');
    }
  }, [isProfessionalTheme]);

  const toggleProfessionalTheme = () => {
    const newValue = !isProfessionalTheme;
    setIsProfessionalTheme(newValue);
    localStorage.setItem('professional-theme-enabled', JSON.stringify(newValue));
  };

  // Define colors based on current theme mode and professional theme state
  const colors = {
    primary: isProfessionalTheme 
      ? (theme === 'dark' ? '#3C63FF' : '#2B46B9')
      : 'hsl(var(--primary))',
    secondary: isProfessionalTheme 
      ? (theme === 'dark' ? '#5BB3FF' : '#39A0ED')
      : 'hsl(var(--secondary))',
    success: isProfessionalTheme 
      ? (theme === 'dark' ? '#34D58E' : '#28A745')
      : 'hsl(var(--success))',
    warning: isProfessionalTheme 
      ? (theme === 'dark' ? '#FFB75A' : '#FFB43A')
      : 'hsl(var(--warning))',
    background: isProfessionalTheme 
      ? (theme === 'dark' ? '#0F1115' : '#FFFFFF')
      : 'hsl(var(--background))',
    foreground: isProfessionalTheme 
      ? (theme === 'dark' ? '#E5E7EB' : '#1F2937')
      : 'hsl(var(--foreground))',
    card: isProfessionalTheme 
      ? (theme === 'dark' ? '#1A1F29' : '#F9FAFB')
      : 'hsl(var(--card))',
    border: isProfessionalTheme 
      ? (theme === 'dark' ? '#1A1F29' : '#E5E7EB')
      : 'hsl(var(--border))',
  };

  return (
    <ProfessionalThemeContext.Provider 
      value={{
        isProfessionalTheme,
        toggleProfessionalTheme,
        colors,
      }}
    >
      {children}
    </ProfessionalThemeContext.Provider>
  );
}

// Theme Toggle Component
export function ProfessionalThemeToggle() {
  const { isProfessionalTheme, toggleProfessionalTheme } = useProfessionalTheme();
  
  return (
    <button
      onClick={toggleProfessionalTheme}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
      aria-label="Toggle professional theme"
    >
      <div 
        className={`w-4 h-4 rounded-full transition-colors ${
          isProfessionalTheme ? 'bg-primary' : 'bg-muted-foreground'
        }`} 
      />
      <span className="text-sm font-medium">
        {isProfessionalTheme ? 'Professional Theme' : 'Default Theme'}
      </span>
    </button>
  );
}