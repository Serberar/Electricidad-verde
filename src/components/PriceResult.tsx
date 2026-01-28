import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { colors, spacing, typography } from '../theme/colors';

interface PriceResultProps {
  amount: number;
  period?: string;
  subtitle?: string;
  variant?: 'savings' | 'warning';
}

export const PriceResult: React.FC<PriceResultProps> = ({
  amount,
  period = 'al año',
  subtitle,
  variant = 'savings',
}) => {
  const formattedAmount = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <Card variant={variant === 'warning' ? 'warning' : 'highlight'}>
      <View style={styles.container}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.label}>
          {variant === 'savings' ? 'Ahorro estimado' : 'Pagas de más'}
        </Text>
        <Text
          style={[
            styles.amount,
            variant === 'warning' ? styles.warningText : styles.savingsText,
          ]}
        >
          {formattedAmount}
        </Text>
        <Text style={styles.period}>{period}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: typography.fontSizes.giant,
    fontWeight: typography.fontWeights.bold,
  },
  savingsText: {
    color: colors.primary,
  },
  warningText: {
    color: colors.danger,
  },
  period: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
