export const colors = {
  // Colores principales Aura
  primary: '#0EA5E9',      // Azul cyan (acento del logo)
  primaryDark: '#0077CC',  // Azul profundo
  primaryLight: '#7DD3FC', // Cyan claro

  // Secundarios
  secondary: '#1A202C',    // Casi negro (textos y títulos)
  secondaryLight: '#4A5568', // Gris oscuro
  accent: '#00CC77',       // Verde agua Aura

  // Alertas
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#00CC77',

  // Neutros
  white: '#FFFFFF',
  background: '#F0F9FF',   // Blanco con toque cyan
  card: '#FFFFFF',
  text: '#0F172A',         // Azul muy oscuro
  textSecondary: '#64748B',
  textLight: '#CBD5E1',
  border: '#E0F2FE',       // Borde con toque azul suave

  // Estados
  disabled: '#CBD5E1',

  // Degradado Aura (para uso con LinearGradient si se añade)
  gradientStart: '#AAEE33',
  gradientMid: '#00CC77',
  gradientEnd: '#0055BB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    giant: 48,
  },
  fontWeights: {
    regular: 'normal' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: 'bold' as const,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
