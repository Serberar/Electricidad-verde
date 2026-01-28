import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, PriceResult, Header } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../utils/calculations';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const Home: React.FC<Props> = ({ navigation }) => {
  const {
    simulation,
    savingsHistory,
    contractElectricity,
    contractGas,
    notificationSettings,
    getExpirationStatus,
    isAppReady,
  } = useAppStore();

  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationInfo, setExpirationInfo] = useState<{
    type: string;
    dias: number;
  } | null>(null);

  // Verificar vencimientos al cargar
  useEffect(() => {
    if (isAppReady && notificationSettings.avisarVencimiento) {
      const status = getExpirationStatus();
      if (status.electricity.isExpiring) {
        setExpirationInfo({ type: 'electricidad', dias: status.electricity.diasRestantes });
        setShowExpirationModal(true);
      } else if (status.gas.isExpiring) {
        setExpirationInfo({ type: 'gas', dias: status.gas.diasRestantes });
        setShowExpirationModal(true);
      }
    }
  }, [isAppReady, notificationSettings.avisarVencimiento]);

  // Ya no forzamos ir al Simulator - el usuario decide

  // Calcular totales de ahorro
  const totalElectricity = savingsHistory.reduce((acc, month) => acc + month.ahorroElectricidad, 0);
  const totalGas = savingsHistory.reduce((acc, month) => acc + month.ahorroGas, 0);
  const totalSaved = totalElectricity + totalGas;

  // Calcular ahorro anual estimado basado en contratos
  const getYearlyEstimate = () => {
    let yearlyElectricity = 0;
    let yearlyGas = 0;

    if (contractElectricity) {
      const ahorroPorKwh = contractElectricity.precioAnterior - contractElectricity.precioActual;
      yearlyElectricity = ahorroPorKwh * contractElectricity.consumoMensual * 12;
    }

    if (contractGas) {
      const ahorroPorKwh = contractGas.precioAnterior - contractGas.precioActual;
      yearlyGas = ahorroPorKwh * contractGas.consumoMensual * 12;
    }

    return {
      electricity: Math.max(0, yearlyElectricity),
      gas: Math.max(0, yearlyGas),
      total: Math.max(0, yearlyElectricity + yearlyGas),
    };
  };

  const yearlyEstimate = getYearlyEstimate();
  const hasContracts = contractElectricity || contractGas;

  const handleContact = () => {
    navigation.navigate('Contact');
  };

  const handleSimulate = () => {
    navigation.navigate('Simulator');
  };

  const handleContract = () => {
    navigation.navigate('Contract');
  };

  const handleFAQ = () => {
    navigation.navigate('FAQ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack={false} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mensaje si no hay datos */}
        {!hasContracts && !simulation && (
          <Card style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Bienvenido a Electricidad Verde</Text>
            <Text style={styles.welcomeText}>
              Descubre cuánto puedes ahorrar con nuestras tarifas de luz y gas.
            </Text>
            <Button
              title="Hacer simulación"
              onPress={handleSimulate}
              size="medium"
              style={styles.welcomeButton}
            />
          </Card>
        )}

        {/* Card principal de ahorro */}
        {hasContracts ? (
          <Card variant="highlight" style={styles.mainCard}>
            <Text style={styles.mainCardLabel}>Ahorro estimado anual</Text>
            <Text style={styles.mainCardAmount}>{formatCurrency(yearlyEstimate.total)}</Text>
            <Text style={styles.mainCardSubtitle}>Basado en tus contratos actuales</Text>

            {/* Desglose */}
            <View style={styles.breakdownContainer}>
              {contractElectricity && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownIcon}>⚡</Text>
                  <Text style={styles.breakdownLabel}>Electricidad</Text>
                  <Text style={[styles.breakdownAmount, { color: colors.primary }]}>
                    {formatCurrency(yearlyEstimate.electricity)}/año
                  </Text>
                </View>
              )}
              {contractGas && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownIcon}>🔥</Text>
                  <Text style={styles.breakdownLabel}>Gas</Text>
                  <Text style={[styles.breakdownAmount, { color: colors.warning }]}>
                    {formatCurrency(yearlyEstimate.gas)}/año
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ) : simulation ? (
          <PriceResult
            amount={simulation.ahorroEstimado}
            period="estimado al año"
            variant="savings"
            subtitle="Según tu última simulación"
          />
        ) : null}

        {/* Acciones rápidas */}
        <View style={styles.actionsContainer}>
          <Card style={styles.actionCard}>
            <Text style={styles.actionIcon}>💡</Text>
            <Text style={styles.actionTitle}>Mis tarifas</Text>
            <Text style={styles.actionDescription}>Ahorro y servicios</Text>
            <Button
              title="Ver"
              onPress={handleContract}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </Card>

          <Card style={styles.actionCard}>
            <Text style={styles.actionIcon}>❓</Text>
            <Text style={styles.actionTitle}>Ayuda</Text>
            <Text style={styles.actionDescription}>Preguntas FAQ</Text>
            <Button
              title="Ver"
              onPress={handleFAQ}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </Card>
        </View>

        {/* Resumen de ahorro acumulado */}
        {totalSaved > 0 && (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryIcon}>💰</Text>
              <Text style={styles.summaryTitle}>Ahorro acumulado</Text>
            </View>
            <Text style={styles.summaryAmount}>{formatCurrency(totalSaved)}</Text>
            <Text style={styles.summaryPeriod}>
              en los últimos {savingsHistory.length} meses
            </Text>

            {/* Mini desglose */}
            <View style={styles.miniBreakdown}>
              {totalElectricity > 0 && (
                <View style={styles.miniBreakdownItem}>
                  <Text style={styles.miniBreakdownIcon}>⚡</Text>
                  <Text style={styles.miniBreakdownAmount}>{formatCurrency(totalElectricity)}</Text>
                </View>
              )}
              {totalGas > 0 && (
                <View style={styles.miniBreakdownItem}>
                  <Text style={styles.miniBreakdownIcon}>🔥</Text>
                  <Text style={styles.miniBreakdownAmount}>{formatCurrency(totalGas)}</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Estado de contratos */}
        {hasContracts && (
          <Card style={styles.contractsStatusCard}>
            <Text style={styles.contractsStatusTitle}>Estado de contratos</Text>
            <View style={styles.contractsStatusList}>
              {contractElectricity && (
                <TouchableOpacity
                  style={styles.contractStatusItem}
                  onPress={() => navigation.navigate('Contract', { tab: 'electricity' })}
                >
                  <Text style={styles.contractStatusIcon}>⚡</Text>
                  <View style={styles.contractStatusInfo}>
                    <Text style={styles.contractStatusLabel}>Electricidad</Text>
                    <Text style={styles.contractStatusValue}>
                      {contractElectricity.precioActual.toFixed(3)}€/kWh
                    </Text>
                  </View>
                  <View style={[styles.contractStatusBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.contractStatusBadgeText, { color: colors.primary }]}>Activo</Text>
                  </View>
                </TouchableOpacity>
              )}
              {contractGas && (
                <TouchableOpacity
                  style={styles.contractStatusItem}
                  onPress={() => navigation.navigate('Contract', { tab: 'gas' })}
                >
                  <Text style={styles.contractStatusIcon}>🔥</Text>
                  <View style={styles.contractStatusInfo}>
                    <Text style={styles.contractStatusLabel}>Gas</Text>
                    <Text style={styles.contractStatusValue}>
                      {contractGas.precioActual.toFixed(3)}€/kWh
                    </Text>
                  </View>
                  <View style={[styles.contractStatusBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.contractStatusBadgeText, { color: colors.primary }]}>Activo</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}

        {/* CTAs principales */}
        <View style={styles.ctaContainer}>
          <Button
            title="Hablar con un asesor"
            onPress={handleContact}
            variant="primary"
            size="large"
          />
          <Button
            title="Nueva simulación"
            onPress={handleSimulate}
            variant="outline"
            size="large"
            style={styles.secondaryButton}
          />
        </View>
      </ScrollView>

      {/* Modal de vencimiento */}
      <Modal
        visible={showExpirationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExpirationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Contrato próximo a vencer</Text>
            <Text style={styles.modalMessage}>
              Tu contrato de {expirationInfo?.type} vence en {expirationInfo?.dias} días.
              {'\n\n'}
              Contacta con nosotros para renovar y seguir ahorrando.
            </Text>
            <Button
              title="Ver mis contratos"
              onPress={() => {
                setShowExpirationModal(false);
                navigation.navigate('Contract');
              }}
              style={styles.modalButton}
            />
            <Button
              title="Más tarde"
              onPress={() => setShowExpirationModal(false)}
              variant="outline"
              style={styles.modalButtonSecondary}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  welcomeCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  welcomeButtons: {
    width: '100%',
    gap: spacing.sm,
  },
  welcomeButton: {
    width: '100%',
  },
  mainCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  mainCardLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mainCardAmount: {
    fontSize: typography.fontSizes.giant,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  mainCardSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  breakdownContainer: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  breakdownLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  breakdownAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  actionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
  },
  summaryCard: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  summaryAmount: {
    fontSize: typography.fontSizes.giant,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  summaryPeriod: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  miniBreakdown: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  miniBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  miniBreakdownIcon: {
    fontSize: 14,
  },
  miniBreakdownAmount: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  contractsStatusCard: {
    marginTop: spacing.xl,
  },
  contractsStatusTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  contractsStatusList: {
    gap: spacing.sm,
  },
  contractStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  contractStatusIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  contractStatusInfo: {
    flex: 1,
  },
  contractStatusLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  contractStatusValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  contractStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  contractStatusBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  ctaContainer: {
    marginTop: spacing.xl,
  },
  secondaryButton: {
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.warning,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  modalButton: {
    width: '100%',
  },
  modalButtonSecondary: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
