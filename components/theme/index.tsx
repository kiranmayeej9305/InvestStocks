// Professional Theme System Exports
export { 
  ProfessionalThemeProvider, 
  ProfessionalThemeToggle,
  useProfessionalTheme 
} from './professional-theme-provider';

// Theme utilities and constants
export const PROFESSIONAL_THEME_COLORS = {
  light: {
    primary: '#2B46B9',
    secondary: '#39A0ED',
    success: '#28A745',
    warning: '#FFB43A',
    background: '#FFFFFF',
    foreground: '#1F2937',
    card: '#F9FAFB',
    border: '#E5E7EB'
  },
  dark: {
    primary: '#3C63FF',
    secondary: '#5BB3FF',
    success: '#34D58E',
    warning: '#FFB75A',
    background: '#0F1115',
    foreground: '#E5E7EB',
    card: '#1A1F29',
    border: '#1A1F29'
  }
} as const;

export const OVERPASS_FONT_FAMILY = "'Overpass', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" as const;