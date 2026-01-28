import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConsumptionLevel, ServiceType } from '../utils/calculations';

const KEYS = {
  SIMULATION: 'simulation',
  CONTRACT_ELECTRICITY: 'contract_electricity',
  CONTRACT_GAS: 'contract_gas',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

export interface SimulationData {
  tipoServicio: ServiceType;
  precioActual: number;
  nuestroPrecio: number;
  consumo: ConsumptionLevel;
  ahorroEstimado: number;
  fechaSimulacion: string;
}

// Datos de contrato para cada servicio (luz o gas)
export interface ServiceContractData {
  tipoServicio: ServiceType;
  precioAnterior: number;    // Precio que pagaba antes (€/kWh)
  precioActual: number;      // Precio actual con nosotros (€/kWh)
  consumoMensual: number;    // Consumo mensual estimado (kWh)
  fechaInicio: string;       // Fecha de inicio del contrato
  duracionMeses: number;     // Duración del contrato en meses
}

// Configuración de notificaciones
export interface NotificationSettings {
  avisarVencimiento: boolean;
  diasAnticipacion: number;  // Días antes del vencimiento para avisar
}

// Historial de ahorro con desglose por servicio
export interface SavingsMonth {
  mes: string;
  year: number;
  ahorroElectricidad: number;
  ahorroGas: number;
  ahorroTotal: number;
}

// Simulación
export const saveSimulation = async (data: SimulationData): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SIMULATION, JSON.stringify(data));
};

export const getSimulation = async (): Promise<SimulationData | null> => {
  const data = await AsyncStorage.getItem(KEYS.SIMULATION);
  return data ? JSON.parse(data) : null;
};

export const clearSimulation = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.SIMULATION);
};

// Contratos por servicio
export const saveContractElectricity = async (data: ServiceContractData): Promise<void> => {
  await AsyncStorage.setItem(KEYS.CONTRACT_ELECTRICITY, JSON.stringify(data));
};

export const getContractElectricity = async (): Promise<ServiceContractData | null> => {
  const data = await AsyncStorage.getItem(KEYS.CONTRACT_ELECTRICITY);
  return data ? JSON.parse(data) : null;
};

export const saveContractGas = async (data: ServiceContractData): Promise<void> => {
  await AsyncStorage.setItem(KEYS.CONTRACT_GAS, JSON.stringify(data));
};

export const getContractGas = async (): Promise<ServiceContractData | null> => {
  const data = await AsyncStorage.getItem(KEYS.CONTRACT_GAS);
  return data ? JSON.parse(data) : null;
};

// Notificaciones
export const saveNotificationSettings = async (data: NotificationSettings): Promise<void> => {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(data));
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
  if (data) {
    return JSON.parse(data);
  }
  // Valores por defecto
  return { avisarVencimiento: false, diasAnticipacion: 30 };
};

// Calcular historial de ahorros basado en contratos
export const calculateSavingsHistory = (
  contractElectricity: ServiceContractData | null,
  contractGas: ServiceContractData | null
): SavingsMonth[] => {
  const history: SavingsMonth[] = [];
  const now = new Date();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Encontrar la fecha de inicio más antigua
  const dates: Date[] = [];

  if (contractElectricity) {
    dates.push(new Date(contractElectricity.fechaInicio));
  }

  if (contractGas) {
    dates.push(new Date(contractGas.fechaInicio));
  }

  if (dates.length === 0) {
    return history;
  }

  const startDate = dates.reduce((min, date) => date < min ? date : min, dates[0]);


  // Generar historial mes a mes desde la fecha de inicio hasta hoy
  const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (currentMonth <= now) {
    let ahorroElectricidad = 0;
    let ahorroGas = 0;

    // Calcular ahorro de electricidad si el contrato estaba activo
    if (contractElectricity) {
      const elecStart = new Date(contractElectricity.fechaInicio);
      const elecEnd = new Date(elecStart);
      elecEnd.setMonth(elecEnd.getMonth() + contractElectricity.duracionMeses);

      if (currentMonth >= elecStart && currentMonth <= elecEnd) {
        const ahorroKwh = contractElectricity.precioAnterior - contractElectricity.precioActual;
        ahorroElectricidad = ahorroKwh * contractElectricity.consumoMensual;
      }
    }

    // Calcular ahorro de gas si el contrato estaba activo
    if (contractGas) {
      const gasStart = new Date(contractGas.fechaInicio);
      const gasEnd = new Date(gasStart);
      gasEnd.setMonth(gasEnd.getMonth() + contractGas.duracionMeses);

      if (currentMonth >= gasStart && currentMonth <= gasEnd) {
        const ahorroKwh = contractGas.precioAnterior - contractGas.precioActual;
        ahorroGas = ahorroKwh * contractGas.consumoMensual;
      }
    }

    // Solo añadir si hay algún ahorro
    if (ahorroElectricidad > 0 || ahorroGas > 0) {
      history.push({
        mes: monthNames[currentMonth.getMonth()],
        year: currentMonth.getFullYear(),
        ahorroElectricidad: Math.round(ahorroElectricidad * 100) / 100,
        ahorroGas: Math.round(ahorroGas * 100) / 100,
        ahorroTotal: Math.round((ahorroElectricidad + ahorroGas) * 100) / 100,
      });
    }

    // Avanzar al siguiente mes
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return history;
};

// Verificar si algún contrato está próximo a vencer
export const checkContractExpiration = (
  contract: ServiceContractData | null,
  diasAnticipacion: number
): { isExpiring: boolean; diasRestantes: number; fechaFin: Date | null } => {
  if (!contract) {
    return { isExpiring: false, diasRestantes: 0, fechaFin: null };
  }

  const fechaInicio = new Date(contract.fechaInicio);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + contract.duracionMeses);

  const now = new Date();
  const diasRestantes = Math.ceil((fechaFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    isExpiring: diasRestantes > 0 && diasRestantes <= diasAnticipacion,
    diasRestantes: Math.max(0, diasRestantes),
    fechaFin,
  };
};

// Limpiar todo
export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    KEYS.SIMULATION,
    KEYS.CONTRACT_ELECTRICITY,
    KEYS.CONTRACT_GAS,
    KEYS.NOTIFICATION_SETTINGS,
  ]);
};
