import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Card, ProgressBar, Button, Header } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAppStore } from '../store/appStore';
import { ServiceType, formatCurrency } from '../utils/calculations';
import { SERVICE_OPTIONS, getTariffConfig } from '../config/tariffs';
import { ServiceContractData } from '../storage/localStorage';
import { RootStackParamList } from '../navigation/types';

type TabType = 'electricity' | 'gas';
type FilterType = 'total' | 'electricity' | 'gas';

interface ContractFormData {
  precioAnterior: string;
  precioActual: string;
  consumoMensual: string;
  fechaInicio: string;
  duracionMeses: string;
}

const defaultFormData: ContractFormData = {
  precioAnterior: '',
  precioActual: '',
  consumoMensual: '',
  fechaInicio: new Date().toISOString().split('T')[0],
  duracionMeses: '12',
};

// Componente simple de gráfico de barras
const SimpleBarChart: React.FC<{
  data: { label: string; electricity: number; gas: number }[];
  maxValue: number;
  filter: FilterType;
}> = ({ data, maxValue, filter }) => {
  return (
    <View style={barStyles.container}>
      {data.map((item, index) => {
        const electricityHeight = maxValue > 0 ? (item.electricity / maxValue) * 100 : 0;
        const gasHeight = maxValue > 0 ? (item.gas / maxValue) * 100 : 0;

        return (
          <View key={index} style={barStyles.barContainer}>
            <View style={barStyles.barWrapper}>
              {(filter === 'total' || filter === 'gas') && item.gas > 0 && (
                <View
                  style={[
                    barStyles.bar,
                    barStyles.barGas,
                    { height: `${gasHeight}%` },
                  ]}
                />
              )}
              {(filter === 'total' || filter === 'electricity') && item.electricity > 0 && (
                <View
                  style={[
                    barStyles.bar,
                    barStyles.barElectricity,
                    { height: `${electricityHeight}%` },
                  ]}
                />
              )}
            </View>
            <Text style={barStyles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: '70%',
    height: 100,
    justifyContent: 'flex-end',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
    marginBottom: 2,
  },
  barElectricity: {
    backgroundColor: colors.primary,
  },
  barGas: {
    backgroundColor: colors.warning,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
});

export const Contract: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Contract'>>();
  const initialTab = route.params?.tab || 'electricity';

  const {
    contractElectricity,
    contractGas,
    setContractElectricity,
    setContractGas,
    notificationSettings,
    setNotificationSettings,
    getExpirationStatus,
    savingsHistory,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [formElectricity, setFormElectricity] = useState<ContractFormData>(defaultFormData);
  const [formGas, setFormGas] = useState<ContractFormData>(defaultFormData);
  const [showExpirationAlert, setShowExpirationAlert] = useState(false);
  const [expiringContract, setExpiringContract] = useState<{ type: ServiceType; dias: number } | null>(null);
  const [showEditContractModal, setShowEditContractModal] = useState(false);
  const [editingContractType, setEditingContractType] = useState<TabType>('electricity');
  const [savingsFilter, setSavingsFilter] = useState<FilterType>('total');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cargar datos existentes
  useEffect(() => {
    if (contractElectricity) {
      setFormElectricity({
        precioAnterior: contractElectricity.precioAnterior.toString(),
        precioActual: contractElectricity.precioActual.toString(),
        consumoMensual: contractElectricity.consumoMensual.toString(),
        fechaInicio: contractElectricity.fechaInicio.split('T')[0],
        duracionMeses: contractElectricity.duracionMeses.toString(),
      });
    } else {
      const tariff = getTariffConfig('electricity');
      setFormElectricity({
        ...defaultFormData,
        precioAnterior: tariff.defaultUserPrice.toString(),
        precioActual: tariff.ourPriceKwh.toString(),
        consumoMensual: tariff.consumption.medium.toString(),
      });
    }

    if (contractGas) {
      setFormGas({
        precioAnterior: contractGas.precioAnterior.toString(),
        precioActual: contractGas.precioActual.toString(),
        consumoMensual: contractGas.consumoMensual.toString(),
        fechaInicio: contractGas.fechaInicio.split('T')[0],
        duracionMeses: contractGas.duracionMeses.toString(),
      });
    } else {
      const tariff = getTariffConfig('gas');
      setFormGas({
        ...defaultFormData,
        precioAnterior: tariff.defaultUserPrice.toString(),
        precioActual: tariff.ourPriceKwh.toString(),
        consumoMensual: tariff.consumption.medium.toString(),
      });
    }
  }, [contractElectricity, contractGas]);

  // Verificar vencimientos al cargar
  useEffect(() => {
    if (notificationSettings.avisarVencimiento) {
      const status = getExpirationStatus();
      if (status.electricity.isExpiring) {
        setExpiringContract({ type: 'electricity', dias: status.electricity.diasRestantes });
        setShowExpirationAlert(true);
      } else if (status.gas.isExpiring) {
        setExpiringContract({ type: 'gas', dias: status.gas.diasRestantes });
        setShowExpirationAlert(true);
      }
    }
  }, [notificationSettings.avisarVencimiento]);

  const handleSaveContract = async (type: TabType) => {
    const form = type === 'electricity' ? formElectricity : formGas;

    const precioAnterior = parseFloat(form.precioAnterior.replace(',', '.'));
    const precioActual = parseFloat(form.precioActual.replace(',', '.'));
    const consumoMensual = parseFloat(form.consumoMensual.replace(',', '.'));
    const duracionMeses = parseInt(form.duracionMeses, 10);

    if (isNaN(precioAnterior) || isNaN(precioActual) || isNaN(consumoMensual) || isNaN(duracionMeses)) {
      Alert.alert('Error', 'Por favor, completa todos los campos correctamente');
      return;
    }

    const contractData: ServiceContractData = {
      tipoServicio: type,
      precioAnterior,
      precioActual,
      consumoMensual,
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      duracionMeses,
    };

    if (type === 'electricity') {
      await setContractElectricity(contractData);
    } else {
      await setContractGas(contractData);
    }

    Alert.alert('Guardado', `Contrato de ${type === 'electricity' ? 'electricidad' : 'gas'} guardado correctamente`);
    setShowEditContractModal(false);
  };

  const handleOpenEditModal = (type: TabType) => {
    setEditingContractType(type);
    setShowEditContractModal(true);
  };

  const handleNotificationToggle = async (value: boolean) => {
    await setNotificationSettings({
      ...notificationSettings,
      avisarVencimiento: value,
    });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      if (editingContractType === 'electricity') {
        setFormElectricity({ ...formElectricity, fechaInicio: dateString });
      } else {
        setFormGas({ ...formGas, fechaInicio: dateString });
      }
    }
    if (Platform.OS === 'ios') {
      // En iOS el picker se queda abierto, lo cerramos manualmente
    }
  };

  const getCurrentDateValue = () => {
    const dateStr = editingContractType === 'electricity'
      ? formElectricity.fechaInicio
      : formGas.fechaInicio;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Seleccionar fecha';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getContractStatus = (contract: ServiceContractData | null) => {
    if (!contract) return null;

    const fechaInicio = new Date(contract.fechaInicio);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + contract.duracionMeses);

    const now = new Date();
    const totalDias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
    const diasTranscurridos = Math.ceil((now.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
    const diasRestantes = Math.max(0, Math.ceil((fechaFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const porcentaje = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));

    const mesesRestantes = Math.max(0,
      (fechaFin.getFullYear() - now.getFullYear()) * 12 +
      (fechaFin.getMonth() - now.getMonth())
    );

    return {
      diasRestantes,
      mesesRestantes,
      porcentaje,
      fechaFin: fechaFin.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  };

  // Cálculos del historial de ahorros
  const totalElectricity = savingsHistory.reduce((acc, month) => acc + month.ahorroElectricidad, 0);
  const totalGas = savingsHistory.reduce((acc, month) => acc + month.ahorroGas, 0);
  const totalSaved = totalElectricity + totalGas;

  const getFilteredTotal = () => {
    switch (savingsFilter) {
      case 'electricity': return totalElectricity;
      case 'gas': return totalGas;
      default: return totalSaved;
    }
  };

  const maxSavings = Math.max(
    ...savingsHistory.map((m) => {
      switch (savingsFilter) {
        case 'electricity': return m.ahorroElectricidad;
        case 'gas': return m.ahorroGas;
        default: return m.ahorroTotal;
      }
    }),
    1
  );

  const chartData = savingsHistory.slice(-6).map((month) => ({
    label: month.mes.substring(0, 3),
    electricity: month.ahorroElectricidad,
    gas: month.ahorroGas,
  }));

  const currentContract = activeTab === 'electricity' ? contractElectricity : contractGas;
  const currentStatus = getContractStatus(currentContract);
  const tariffConfig = getTariffConfig(activeTab);
  const hasContracts = contractElectricity || contractGas;

  const getStatusColor = (diasRestantes: number) => {
    if (diasRestantes <= 30) return colors.danger;
    return colors.primary;
  };

  const filterOptions: { key: FilterType; label: string; icon: string }[] = [
    { key: 'total', label: 'Total', icon: '💰' },
    { key: 'electricity', label: 'Luz', icon: '⚡' },
    { key: 'gas', label: 'Gas', icon: '🔥' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Mis tarifas</Text>
        <Text style={styles.subtitle}>Tu luz y gas con Electricidad Verde</Text>

        {/* Tabs de servicio */}
        <View style={styles.tabContainer}>
          {SERVICE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.tab,
                activeTab === option.key && styles.tabActive,
              ]}
              onPress={() => setActiveTab(option.key)}
            >
              <Text style={styles.tabIcon}>{option.icon}</Text>
              <Text style={[
                styles.tabText,
                activeTab === option.key && styles.tabTextActive,
              ]}>
                {option.label}
              </Text>
              {(option.key === 'electricity' ? contractElectricity : contractGas) && (
                <View style={styles.tabBadge} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Estado del contrato actual */}
        {currentStatus ? (
          <Card variant="highlight" style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>
                {tariffConfig.icon} Contrato activo
              </Text>
              <View style={styles.statusHeaderRight}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(currentStatus.diasRestantes) + '20' },
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: getStatusColor(currentStatus.diasRestantes) },
                  ]}>
                    {currentStatus.diasRestantes <= 30 ? 'Por vencer' : 'Activo'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleOpenEditModal(activeTab)}
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ProgressBar
              progress={currentStatus.porcentaje}
              color={getStatusColor(currentStatus.diasRestantes)}
              height={12}
              showPercentage={false}
            />

            <View style={styles.statusDetails}>
              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>{currentStatus.mesesRestantes}</Text>
                <Text style={styles.statusLabel}>meses restantes</Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>{currentStatus.diasRestantes}</Text>
                <Text style={styles.statusLabel}>días</Text>
              </View>
            </View>

            <Text style={styles.statusEndDate}>
              Finaliza el {currentStatus.fechaFin}
            </Text>
          </Card>
        ) : (
          <Card style={styles.noContractCard}>
            <Text style={styles.noContractText}>
              No tienes contrato de {tariffConfig.label.toLowerCase()} registrado
            </Text>
            <Button
              title="Añadir contrato"
              onPress={() => handleOpenEditModal(activeTab)}
              style={styles.addContractButton}
            />
          </Card>
        )}

        {/* Configuración de notificaciones */}
        <Card style={styles.notificationCard}>
          <View style={styles.notificationRow}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Aviso de vencimiento</Text>
              <Text style={styles.notificationDescription}>
                Te avisaremos {notificationSettings.diasAnticipacion} días antes de que finalice tu contrato
              </Text>
            </View>
            <Switch
              value={notificationSettings.avisarVencimiento}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationSettings.avisarVencimiento ? colors.primary : colors.textLight}
            />
          </View>
        </Card>

        {/* Historial de ahorros */}
        <Card style={styles.savingsCard}>
          <Text style={styles.savingsTitle}>Historial de ahorro</Text>

          {!hasContracts ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Registra tus contratos para ver tu historial de ahorros
              </Text>
            </View>
          ) : savingsHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Tu historial aparecerá conforme avance el tiempo desde el inicio de tu contrato
              </Text>
            </View>
          ) : (
            <>
              {/* Filtros */}
              <View style={styles.filterContainer}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterButton,
                      savingsFilter === option.key && styles.filterButtonActive,
                    ]}
                    onPress={() => setSavingsFilter(option.key)}
                  >
                    <Text style={styles.filterIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.filterText,
                      savingsFilter === option.key && styles.filterTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Total ahorrado */}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total ahorrado</Text>
                <Text style={styles.totalAmount}>{formatCurrency(getFilteredTotal())}</Text>
              </View>

              {/* Gráfico */}
              {chartData.length > 0 && (
                <View style={styles.chartContainer}>
                  <SimpleBarChart data={chartData} maxValue={maxSavings} filter={savingsFilter} />
                  <View style={styles.legendContainer}>
                    {(savingsFilter === 'total' || savingsFilter === 'electricity') && (
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                        <Text style={styles.legendText}>Luz</Text>
                      </View>
                    )}
                    {(savingsFilter === 'total' || savingsFilter === 'gas') && (
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                        <Text style={styles.legendText}>Gas</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Lista de meses */}
              <View style={styles.monthsList}>
                {savingsHistory.slice().reverse().slice(0, 6).map((month, index) => (
                  <View key={index} style={styles.monthItem}>
                    <Text style={styles.monthName}>{month.mes} {month.year}</Text>
                    <View style={styles.monthAmounts}>
                      {(savingsFilter === 'total' || savingsFilter === 'electricity') && month.ahorroElectricidad > 0 && (
                        <Text style={[styles.monthAmount, { color: colors.primary }]}>
                          ⚡ {formatCurrency(month.ahorroElectricidad)}
                        </Text>
                      )}
                      {(savingsFilter === 'total' || savingsFilter === 'gas') && month.ahorroGas > 0 && (
                        <Text style={[styles.monthAmount, { color: colors.warning }]}>
                          🔥 {formatCurrency(month.ahorroGas)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </Card>

        {/* Nota de privacidad */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            Tus datos se almacenan solo en tu dispositivo. Electricidad Verde no guarda tu información.
          </Text>
        </View>
      </ScrollView>

      {/* Modal de alerta de vencimiento */}
      <Modal
        visible={showExpirationAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExpirationAlert(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Contrato próximo a vencer</Text>
            <Text style={styles.modalMessage}>
              Tu contrato de {expiringContract?.type === 'electricity' ? 'electricidad' : 'gas'} vence en {expiringContract?.dias} días.
              {'\n\n'}
              Contacta con nosotros para renovar y seguir ahorrando.
            </Text>
            <Button
              title="Entendido"
              onPress={() => setShowExpirationAlert(false)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para editar contrato */}
      <Modal
        visible={showEditContractModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditContractModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle2}>
              {editingContractType === 'electricity' ? '⚡ Contrato de luz' : '🔥 Contrato de gas'}
            </Text>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Precio anterior (lo que pagabas)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={editingContractType === 'electricity' ? formElectricity.precioAnterior : formGas.precioAnterior}
                    onChangeText={(text) => {
                      if (editingContractType === 'electricity') {
                        setFormElectricity({ ...formElectricity, precioAnterior: text });
                      } else {
                        setFormGas({ ...formGas, precioAnterior: text });
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0.25"
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.inputSuffix}>€/kWh</Text>
                </View>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Precio actual (con nosotros)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.inputHighlight]}
                    value={editingContractType === 'electricity' ? formElectricity.precioActual : formGas.precioActual}
                    onChangeText={(text) => {
                      if (editingContractType === 'electricity') {
                        setFormElectricity({ ...formElectricity, precioActual: text });
                      } else {
                        setFormGas({ ...formGas, precioActual: text });
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholder={getTariffConfig(editingContractType).ourPriceKwh.toString()}
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.inputSuffix}>€/kWh</Text>
                </View>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Consumo mensual estimado</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={editingContractType === 'electricity' ? formElectricity.consumoMensual : formGas.consumoMensual}
                    onChangeText={(text) => {
                      if (editingContractType === 'electricity') {
                        setFormElectricity({ ...formElectricity, consumoMensual: text });
                      } else {
                        setFormGas({ ...formGas, consumoMensual: text });
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholder="300"
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.inputSuffix}>kWh</Text>
                </View>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Fecha de inicio</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {formatDisplayDate(editingContractType === 'electricity' ? formElectricity.fechaInicio : formGas.fechaInicio)}
                  </Text>
                  <Text style={styles.datePickerIcon}>📅</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={getCurrentDateValue()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    locale="es-ES"
                  />
                )}
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Duración del contrato</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={editingContractType === 'electricity' ? formElectricity.duracionMeses : formGas.duracionMeses}
                    onChangeText={(text) => {
                      if (editingContractType === 'electricity') {
                        setFormElectricity({ ...formElectricity, duracionMeses: text });
                      } else {
                        setFormGas({ ...formGas, duracionMeses: text });
                      }
                    }}
                    keyboardType="number-pad"
                    placeholder="12"
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.inputSuffix}>meses</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEditContractModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <Button
                title="Guardar"
                onPress={() => handleSaveContract(editingContractType)}
                style={styles.modalSaveButton}
              />
            </View>
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
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  tabIcon: {
    fontSize: typography.fontSizes.xl,
  },
  tabText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusCard: {
    marginBottom: spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.secondary + '15',
  },
  editButtonText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.secondary,
  },
  statusTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusNumber: {
    fontSize: typography.fontSizes.giant,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
  },
  statusLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  noContractCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noContractText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  addContractButton: {
    minWidth: 160,
  },
  statusEndDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  notificationCard: {
    marginBottom: spacing.xl,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  notificationTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  notificationDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  // Estilos del historial de ahorros
  savingsCard: {
    marginBottom: spacing.lg,
  },
  savingsTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.primaryLight + '30',
  },
  filterIcon: {
    fontSize: 14,
  },
  filterText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  chartContainer: {
    marginBottom: spacing.md,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  monthsList: {
    gap: spacing.xs,
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  monthName: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  monthAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  monthAmount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  privacyNote: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
  },
  privacyNoteText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Modal styles
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
  modalContentLarge: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalScroll: {
    width: '100%',
    marginBottom: spacing.md,
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
  modalTitle2: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
    marginBottom: spacing.lg,
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
  modalInputGroup: {
    width: '100%',
    marginBottom: spacing.md,
  },
  modalInputLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  inputHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  inputSuffix: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  inputHint: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  datePickerText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  datePickerIcon: {
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
  },
  modalSaveButton: {
    flex: 1,
  },
});
