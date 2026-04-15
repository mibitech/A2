/**
 * Design Tokens - A2Tech
 * 
 * Tokens de design centralizados que alimentam o Tailwind CSS e componentes.
 * Qualquer alteração na identidade visual deve ser feita aqui.
 */

// ===== CORES =====

export const colors = {
  brand: {
    DEFAULT: '#6B3FA0',
    50: '#F5F2F9',
    100: '#EBE4F3',
    200: '#D6C9E7',
    300: '#C2AEDB',
    400: '#8E6BB8',
    500: '#6B3FA0',
    600: '#5A3586',
    700: '#4A2C6D',
    800: '#3A2254',
    900: '#2A193B',
    950: '#1A0F22',
    hover: '#5A3586',
    light: '#EBE4F3',
    dark: '#4A2C6D',
  },
  success: {
    DEFAULT: '#10B981',
    light: '#D1FAE5',
    dark: '#047857',
  },
  error: {
    DEFAULT: '#EF4444',
    light: '#FEE2E2',
    dark: '#B91C1C',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1D4ED8',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
} as const

// ===== TIPOGRAFIA =====

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  },
  fontSize: {
    // Headings
    h1: { size: '2.5rem', lineHeight: '3rem', weight: '700' },      // 40px
    h2: { size: '2rem', lineHeight: '2.5rem', weight: '700' },      // 32px
    h3: { size: '1.75rem', lineHeight: '2.25rem', weight: '600' },  // 28px
    h4: { size: '1.5rem', lineHeight: '2rem', weight: '600' },      // 24px
    h5: { size: '1.25rem', lineHeight: '1.75rem', weight: '600' },  // 20px
    h6: { size: '1.125rem', lineHeight: '1.5rem', weight: '600' },  // 18px
    
    // Body
    bodyLg: { size: '1.125rem', lineHeight: '1.75rem', weight: '400' }, // 18px
    body: { size: '1rem', lineHeight: '1.5rem', weight: '400' },        // 16px
    bodySm: { size: '0.875rem', lineHeight: '1.25rem', weight: '400' }, // 14px
    
    // Caption
    caption: { size: '0.75rem', lineHeight: '1rem', weight: '400' },     // 12px
    captionSm: { size: '0.6875rem', lineHeight: '1rem', weight: '400' }, // 11px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

// ===== ESPAÇAMENTOS =====

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
} as const

// ===== BORDER RADIUS =====

export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const

// ===== SHADOWS =====

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.12)',
} as const

// ===== BREAKPOINTS =====

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ===== Z-INDEX =====

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

// ===== TRANSITIONS =====

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// ===== EXPORTS COMBINADOS =====

export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  transitions,
} as const

export default tokens
