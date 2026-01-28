import { create } from 'zustand';
import {
  SimulationData,
  ServiceContractData,
  SavingsMonth,
  NotificationSettings,
  getSimulation,
  saveSimulation,
  getContractElectricity,
  saveContractElectricity,
  getContractGas,
  saveContractGas,
  getNotificationSettings,
  saveNotificationSettings,
  calculateSavingsHistory,
  checkContractExpiration,
} from '../storage/localStorage';
import {
  scheduleContractExpirationNotification,
  cancelContractNotification,
  requestNotificationPermissions,
} from '../services/notifications';

interface AppState {
  // Estado de simulación
  simulation: SimulationData | null;
  isLoadingSimulation: boolean;

  // Contratos por servicio
  contractElectricity: ServiceContractData | null;
  contractGas: ServiceContractData | null;
  isLoadingContracts: boolean;

  // Historial de ahorros (calculado desde contratos)
  savingsHistory: SavingsMonth[];

  // Configuración de notificaciones
  notificationSettings: NotificationSettings;

  // Estado global de UI
  isAppReady: boolean;

  // Acciones de simulación
  loadSimulation: () => Promise<void>;
  setSimulation: (data: SimulationData) => Promise<void>;
  clearSimulation: () => void;

  // Acciones de contratos
  loadContracts: () => Promise<void>;
  setContractElectricity: (data: ServiceContractData) => Promise<void>;
  setContractGas: (data: ServiceContractData) => Promise<void>;
  clearContractElectricity: () => Promise<void>;
  clearContractGas: () => Promise<void>;

  // Acciones de notificaciones
  loadNotificationSettings: () => Promise<void>;
  setNotificationSettings: (data: NotificationSettings) => Promise<void>;

  // Recalcular historial
  recalculateSavingsHistory: () => void;

  // Verificar vencimientos
  getExpirationStatus: () => {
    electricity: { isExpiring: boolean; diasRestantes: number; fechaFin: Date | null };
    gas: { isExpiring: boolean; diasRestantes: number; fechaFin: Date | null };
  };

  // Inicializar app
  initializeApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Estado inicial
  simulation: null,
  isLoadingSimulation: false,
  contractElectricity: null,
  contractGas: null,
  isLoadingContracts: false,
  savingsHistory: [],
  notificationSettings: { avisarVencimiento: false, diasAnticipacion: 30 },
  isAppReady: false,

  // Cargar simulación desde storage
  loadSimulation: async () => {
    set({ isLoadingSimulation: true });
    const data = await getSimulation();
    set({ simulation: data, isLoadingSimulation: false });
  },

  // Guardar simulación
  setSimulation: async (data: SimulationData) => {
    await saveSimulation(data);
    set({ simulation: data });
  },

  // Limpiar simulación
  clearSimulation: () => {
    set({ simulation: null });
  },

  // Cargar contratos desde storage
  loadContracts: async () => {
    set({ isLoadingContracts: true });
    const [electricity, gas] = await Promise.all([
      getContractElectricity(),
      getContractGas(),
    ]);
    set({
      contractElectricity: electricity,
      contractGas: gas,
      isLoadingContracts: false,
    });
    // Recalcular historial
    get().recalculateSavingsHistory();
  },

  // Guardar contrato de electricidad
  setContractElectricity: async (data: ServiceContractData) => {
    await saveContractElectricity(data);
    set({ contractElectricity: data });
    get().recalculateSavingsHistory();

    // Programar notificación si está activado
    const { notificationSettings } = get();
    if (notificationSettings.avisarVencimiento) {
      await scheduleContractExpirationNotification(data, notificationSettings.diasAnticipacion);
    }
  },

  // Guardar contrato de gas
  setContractGas: async (data: ServiceContractData) => {
    await saveContractGas(data);
    set({ contractGas: data });
    get().recalculateSavingsHistory();

    // Programar notificación si está activado
    const { notificationSettings } = get();
    if (notificationSettings.avisarVencimiento) {
      await scheduleContractExpirationNotification(data, notificationSettings.diasAnticipacion);
    }
  },

  // Limpiar contrato de electricidad
  clearContractElectricity: async () => {
    await cancelContractNotification('electricity');
    set({ contractElectricity: null });
    get().recalculateSavingsHistory();
  },

  // Limpiar contrato de gas
  clearContractGas: async () => {
    await cancelContractNotification('gas');
    set({ contractGas: null });
    get().recalculateSavingsHistory();
  },

  // Cargar configuración de notificaciones
  loadNotificationSettings: async () => {
    const settings = await getNotificationSettings();
    set({ notificationSettings: settings });
  },

  // Guardar configuración de notificaciones
  setNotificationSettings: async (data: NotificationSettings) => {
    await saveNotificationSettings(data);
    set({ notificationSettings: data });

    // Si se activan las notificaciones, pedir permisos y programar
    if (data.avisarVencimiento) {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        const { contractElectricity, contractGas } = get();
        if (contractElectricity) {
          await scheduleContractExpirationNotification(contractElectricity, data.diasAnticipacion);
        }
        if (contractGas) {
          await scheduleContractExpirationNotification(contractGas, data.diasAnticipacion);
        }
      }
    } else {
      // Si se desactivan, cancelar notificaciones
      await cancelContractNotification('electricity');
      await cancelContractNotification('gas');
    }
  },

  // Recalcular historial basado en contratos
  recalculateSavingsHistory: () => {
    const { contractElectricity, contractGas } = get();
    const history = calculateSavingsHistory(contractElectricity, contractGas);
    set({ savingsHistory: history });
  },

  // Verificar estado de vencimiento de contratos
  getExpirationStatus: () => {
    const { contractElectricity, contractGas, notificationSettings } = get();
    return {
      electricity: checkContractExpiration(contractElectricity, notificationSettings.diasAnticipacion),
      gas: checkContractExpiration(contractGas, notificationSettings.diasAnticipacion),
    };
  },

  // Inicializar app (cargar todos los datos)
  initializeApp: async () => {
    const { loadSimulation, loadContracts, loadNotificationSettings } = get();
    await Promise.all([
      loadSimulation(),
      loadContracts(),
      loadNotificationSettings(),
    ]);
    set({ isAppReady: true });
  },
}));
