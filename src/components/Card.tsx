import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'warning';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const getCardStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.card];

    if (variant === 'highlight') {
      baseStyle.push(styles.highlight);
    } else if (variant === 'warning') {
      baseStyle.push(styles.warning);
    }

    return baseStyle;
  };

  return <View style={[...getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  highlight: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  warning: {
    borderWidth: 2,
    borderColor: colors.warning,
    backgroundColor: '#FEF9E7',
  },
});
