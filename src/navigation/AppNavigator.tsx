import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Splash,
  Simulator,
  Home,
  Contract,
  Contact,
  FAQ,
} from '../screens';
import { colors } from '../theme/colors';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Simulator"
          component={Simulator}
          options={{
            title: 'Simulador',
            headerBackTitle: 'Atrás',
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: 'Inicio',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="Contract"
          component={Contract}
          options={{
            title: 'Mi contrato',
            headerBackTitle: 'Atrás',
          }}
        />
        <Stack.Screen
          name="Contact"
          component={Contact}
          options={{
            title: 'Contacto',
            headerBackTitle: 'Atrás',
          }}
        />
        <Stack.Screen
          name="FAQ"
          component={FAQ}
          options={{
            title: 'Ayuda',
            headerBackTitle: 'Atrás',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
