import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { setupNotificationChannel } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Configurar canal de notificaciones para Android
    setupNotificationChannel();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}