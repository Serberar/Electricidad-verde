/**
 * Configuración de Tarifas - Aura
 *
 * TODOS LOS PRECIOS SE LEEN DEL ARCHIVO .env
 * Para cambiar precios, edita el .env y reinicia la app.
 */

import Constants from 'expo-constants';

export type ServiceType = 'electricity' | 'gas';

export interface TariffConfig {
  ourPriceKwh: number;
  defaultUserPrice: number;
  consumption: {
    low: number;
    medium: number;
    high: number;
  };
  label: string;
  unit: string;
  icon: string;
  hint: string;
}

// Leer variables de entorno desde expo-constants
const env = Constants.expoConfig?.extra || {};

// Helper para parsear números del .env
const parseEnvNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

// =============================================
// TARIFAS - VALORES LEÍDOS DEL .env
// =============================================
export const TARIFFS: Record<ServiceType, TariffConfig> = {
  electricity: {
    ourPriceKwh: parseEnvNumber(env.ELECTRICITY_PRICE_KWH, 0.12),
    defaultUserPrice: parseEnvNumber(env.ELECTRICITY_DEFAULT_USER_PRICE, 0.25),
    consumption: {
      low: parseEnvNumber(env.ELECTRICITY_CONSUMPTION_LOW, 150),
      medium: parseEnvNumber(env.ELECTRICITY_CONSUMPTION_MEDIUM, 300),
      high: parseEnvNumber(env.ELECTRICITY_CONSUMPTION_HIGH, 500),
    },
    label: 'Electricidad',
    unit: '€/kWh',
    icon: '⚡',
    hint: 'Puedes encontrar este dato en tu factura de la luz',
  },
  gas: {
    ourPriceKwh: parseEnvNumber(env.GAS_PRICE_KWH, 0.10),
    defaultUserPrice: parseEnvNumber(env.GAS_DEFAULT_USER_PRICE, 0.10),
    consumption: {
      low: parseEnvNumber(env.GAS_CONSUMPTION_LOW, 100),
      medium: parseEnvNumber(env.GAS_CONSUMPTION_MEDIUM, 200),
      high: parseEnvNumber(env.GAS_CONSUMPTION_HIGH, 400),
    },
    label: 'Gas',
    unit: '€/kWh',
    icon: '🔥',
    hint: 'Puedes encontrar este dato en tu factura del gas',
  },
};

// Helper para obtener la configuración de una tarifa
export const getTariffConfig = (serviceType: ServiceType): TariffConfig => {
  return TARIFFS[serviceType];
};

// Lista de servicios disponibles para el selector
export const SERVICE_OPTIONS: { key: ServiceType; label: string; icon: string }[] = [
  { key: 'electricity', label: 'Electricidad', icon: '⚡' },
  { key: 'gas', label: 'Gas', icon: '🔥' },
];
