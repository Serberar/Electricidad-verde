import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ServiceContractData } from '../storage/localStorage';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// IDs de notificaciones para poder cancelarlas
const NOTIFICATION_IDS = {
  ELECTRICITY_EXPIRATION: 'electricity-expiration',
  GAS_EXPIRATION: 'gas-expiration',
};

// Solicitar permisos de notificaciones
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Verificar si tenemos permisos
export const hasNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

// Programar notificación de vencimiento de contrato
export const scheduleContractExpirationNotification = async (
  contract: ServiceContractData,
  diasAnticipacion: number
): Promise<string | null> => {
  const hasPermission = await hasNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  const fechaInicio = new Date(contract.fechaInicio);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + contract.duracionMeses);

  // Calcular fecha de notificación (X días antes del vencimiento)
  const fechaNotificacion = new Date(fechaFin);
  fechaNotificacion.setDate(fechaNotificacion.getDate() - diasAnticipacion);

  // Si la fecha de notificación ya pasó, no programar
  if (fechaNotificacion <= new Date()) {
    return null;
  }

  const isElectricity = contract.tipoServicio === 'electricity';
  const notificationId = isElectricity
    ? NOTIFICATION_IDS.ELECTRICITY_EXPIRATION
    : NOTIFICATION_IDS.GAS_EXPIRATION;

  // Cancelar notificación anterior si existe
  await cancelContractNotification(contract.tipoServicio);

  // Programar nueva notificación
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Contrato de ${isElectricity ? 'electricidad' : 'gas'} próximo a vencer`,
      body: `Tu contrato vence en ${diasAnticipacion} días. Contacta con nosotros para renovar y seguir ahorrando.`,
      data: { type: 'contract-expiration', service: contract.tipoServicio },
      sound: true,
    },
    trigger: {
      date: fechaNotificacion,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
    identifier: notificationId,
  });

  return identifier;
};

// Cancelar notificación de un tipo de contrato
export const cancelContractNotification = async (
  serviceType: 'electricity' | 'gas'
): Promise<void> => {
  const notificationId = serviceType === 'electricity'
    ? NOTIFICATION_IDS.ELECTRICITY_EXPIRATION
    : NOTIFICATION_IDS.GAS_EXPIRATION;

  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

// Cancelar todas las notificaciones programadas
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Obtener notificaciones programadas (para debug)
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// Configurar canal de notificaciones para Android
export const setupNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('contract-alerts', {
      name: 'Alertas de contratos',
      description: 'Notificaciones sobre vencimiento de contratos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22c55e',
    });
  }
};
