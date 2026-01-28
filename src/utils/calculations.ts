import { ServiceType, TARIFFS, getTariffConfig } from '../config/tariffs';

export type ConsumptionLevel = 'low' | 'medium' | 'high';

// Re-exportar tipos de config para compatibilidad
export { ServiceType } from '../config/tariffs';

// Para compatibilidad con código existente
export const CONSUMPTION_PROFILES = TARIFFS.electricity.consumption;
export const OUR_PRICE_KWH = TARIFFS.electricity.ourPriceKwh;

export interface SimulationResult {
  serviceType: ServiceType;
  monthlyConsumption: number;
  currentMonthlyCost: number;
  ourMonthlyCost: number;
  monthlySavings: number;
  yearlySavings: number;
  percentageSavings: number;
}

export const calculateSavings = (
  currentPriceKwh: number,
  consumptionLevel: ConsumptionLevel,
  serviceType: ServiceType = 'electricity',
  customOurPrice?: number
): SimulationResult => {
  const tariff = getTariffConfig(serviceType);
  const ourPriceKwh = customOurPrice ?? tariff.ourPriceKwh;
  const monthlyConsumption = tariff.consumption[consumptionLevel];

  const currentMonthlyCost = currentPriceKwh * monthlyConsumption;
  const ourMonthlyCost = ourPriceKwh * monthlyConsumption;
  const monthlySavings = currentMonthlyCost - ourMonthlyCost;
  const yearlySavings = monthlySavings * 12;

  const percentageSavings =
    currentMonthlyCost > 0
      ? ((currentMonthlyCost - ourMonthlyCost) / currentMonthlyCost) * 100
      : 0;

  return {
    serviceType,
    monthlyConsumption,
    currentMonthlyCost,
    ourMonthlyCost,
    monthlySavings,
    yearlySavings,
    percentageSavings,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPriceKwh = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(price);
};
