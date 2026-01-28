export const colors = {
  // Colores principales
  primary: '#2ECC71',      // Verde
  primaryDark: '#27AE60',
  primaryLight: '#58D68D',

  // Secundarios
  secondary: '#2C3E50',    // Azul oscuro
  secondaryLight: '#34495E',

  // Alertas
  warning: '#F1C40F',      // Amarillo
  danger: '#E74C3C',       // Rojo
  success: '#2ECC71',

  // Neutros
  white: '#FFFFFF',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  border: '#ECF0F1',

  // Estados
  disabled: '#BDC3C7',
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
