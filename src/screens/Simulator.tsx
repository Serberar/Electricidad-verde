import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, PriceResult, Header } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { useAppStore } from '../store/appStore';
import {
  calculateSavings,
  ConsumptionLevel,
  formatPriceKwh,
  ServiceType,
} from '../utils/calculations';
import { RootStackParamList } from '../navigation/types';
import { SERVICE_OPTIONS, getTariffConfig } from '../config/tariffs';

type SimulatorScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Simulator'
>;

interface Props {
  navigation: SimulatorScreenNavigationProp;
}

const consumptionOptions: { key: ConsumptionLevel; label: string; description: string }[] = [
  { key: 'low', label: 'Bajo', description: '1-2 personas' },
  { key: 'medium', label: 'Medio', description: '2-3 personas' },
  { key: 'high', label: 'Alto', description: '4+ personas' },
];

export const Simulator: React.FC<Props> = ({ navigation }) => {
  const { setSimulation } = useAppStore();
  const scrollViewRef = useRef<ScrollView>(null);

  const [serviceType, setServiceType] = useState<ServiceType>('electricity');
  const [priceInput, setPriceInput] = useState('0.25');
  const [ourPriceInput, setOurPriceInput] = useState('0.12');
  const [consumption, setConsumption] = useState<ConsumptionLevel>('medium');
  const [result, setResult] = useState<ReturnType<typeof calculateSavings> | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Actualizar precios cuando cambia el tipo de servicio
  useEffect(() => {
    const tariff = getTariffConfig(serviceType);
    setPriceInput(tariff.defaultUserPrice.toString());
    setOurPriceInput(tariff.ourPriceKwh.toString());
    setResult(null); // Limpiar resultado anterior
  }, [serviceType]);

  const handleCalculate = async () => {
    const price = parseFloat(priceInput.replace(',', '.'));
    const ourPrice = parseFloat(ourPriceInput.replace(',', '.'));

    if (isNaN(price) || price <= 0 || isNaN(ourPrice) || ourPrice <= 0) {
      return;
    }

    setIsCalculating(true);

    // Simular pequeña espera para UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const savings = calculateSavings(price, consumption, serviceType, ourPrice);
    setResult(savings);

    // Guardar simulación
    await setSimulation({
      tipoServicio: serviceType,
      precioActual: price,
      nuestroPrecio: ourPrice,
      consumo: consumption,
      ahorroEstimado: savings.yearlySavings,
      fechaSimulacion: new Date().toISOString(),
    });

    setIsCalculating(false);

    // Auto-scroll al resultado
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleContact = () => {
    navigation.navigate('Contact');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Simula tu ahorro</Text>
          <Text style={styles.subtitle}>
            Descubre cuánto podrías ahorrar con nuestra tarifa
          </Text>

          {/* Selector de tipo de servicio */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Tipo de suministro</Text>
            <View style={styles.serviceContainer}>
              {SERVICE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.serviceOption,
                    serviceType === option.key && styles.serviceOptionSelected,
                  ]}
                  onPress={() => setServiceType(option.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.serviceIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.serviceLabel,
                      serviceType === option.key && styles.serviceLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Input de precio actual del usuario */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              ¿Cuánto pagas por kWh de {getTariffConfig(serviceType).label.toLowerCase()}?
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={priceInput}
                onChangeText={setPriceInput}
                keyboardType="decimal-pad"
                placeholder={getTariffConfig(serviceType).defaultUserPrice.toString()}
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>{getTariffConfig(serviceType).unit}</Text>
            </View>
            <Text style={styles.hint}>
              {getTariffConfig(serviceType).hint}
            </Text>
          </View>

          {/* Input de nuestro precio (editable) */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Nuestra tarifa de {getTariffConfig(serviceType).label.toLowerCase()}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.ourPriceInput]}
                value={ourPriceInput}
                onChangeText={setOurPriceInput}
                keyboardType="decimal-pad"
                placeholder={getTariffConfig(serviceType).ourPriceKwh.toString()}
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>{getTariffConfig(serviceType).unit}</Text>
            </View>
            <Text style={styles.hint}>
              Precio de Electricidad Verde (editable)
            </Text>
          </View>

          {/* Selector de consumo */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Tu consumo estimado</Text>
            <View style={styles.consumptionContainer}>
              {consumptionOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.consumptionOption,
                    consumption === option.key && styles.consumptionOptionSelected,
                  ]}
                  onPress={() => setConsumption(option.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.consumptionLabel,
                      consumption === option.key && styles.consumptionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.consumptionDescription,
                      consumption === option.key && styles.consumptionDescriptionSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botón calcular */}
          <Button
            title="Calcular ahorro"
            onPress={handleCalculate}
            loading={isCalculating}
            style={styles.calculateButton}
          />

          {/* Resultado */}
          {result && result.yearlySavings > 0 && (
            <View style={styles.resultSection}>
              <PriceResult
                amount={result.yearlySavings}
                period="al año"
                variant="savings"
              />

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Servicio</Text>
                  <Text style={styles.detailValue}>
                    {getTariffConfig(serviceType).icon} {getTariffConfig(serviceType).label}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tu precio actual</Text>
                  <Text style={styles.detailValue}>{formatPriceKwh(parseFloat(priceInput.replace(',', '.')))}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nuestro precio</Text>
                  <Text style={[styles.detailValue, styles.ourPrice]}>
                    {formatPriceKwh(parseFloat(ourPriceInput.replace(',', '.')))}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ahorro mensual</Text>
                  <Text style={styles.detailValue}>
                    ~{Math.round(result.monthlySavings)}€
                  </Text>
                </View>
              </View>

              <Button
                title="Hablar con un asesor"
                onPress={handleContact}
                style={styles.contactButton}
              />

              <Button
                title="Ver mi panel"
                onPress={handleGoHome}
                variant="outline"
                style={styles.homeButton}
              />
            </View>
          )}

          {result && result.yearlySavings <= 0 && (
            <View style={styles.resultSection}>
              <View style={styles.noSavingsContainer}>
                <Text style={styles.noSavingsIcon}>✓</Text>
                <Text style={styles.noSavingsTitle}>¡Ya tienes un buen precio!</Text>
                <Text style={styles.noSavingsText}>
                  Tu tarifa actual es muy competitiva. Si quieres, podemos revisar
                  otras formas de optimizar tu consumo.
                </Text>
                <Button
                  title="Contactar de todos modos"
                  onPress={handleContact}
                  variant="outline"
                  style={styles.contactButton}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
  inputSection: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  inputSuffix: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ourPriceInput: {
    color: colors.primary,
  },
  serviceContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  serviceOption: {
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
  serviceOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  serviceIcon: {
    fontSize: typography.fontSizes.xl,
  },
  serviceLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  serviceLabelSelected: {
    color: colors.primary,
  },
  consumptionContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  consumptionOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  consumptionOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  consumptionLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  consumptionLabelSelected: {
    color: colors.primary,
  },
  consumptionDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  consumptionDescriptionSelected: {
    color: colors.primaryDark,
  },
  calculateButton: {
    marginTop: spacing.md,
  },
  resultSection: {
    marginTop: spacing.xl,
  },
  detailsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  ourPrice: {
    color: colors.primary,
  },
  contactButton: {
    marginTop: spacing.lg,
  },
  homeButton: {
    marginTop: spacing.md,
  },
  noSavingsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  noSavingsIcon: {
    fontSize: 48,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  noSavingsTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noSavingsText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
