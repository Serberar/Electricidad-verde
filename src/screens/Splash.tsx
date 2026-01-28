import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Logo } from '../components';
import { colors, spacing, typography } from '../theme/colors';
import { useAppStore } from '../store/appStore';
import { RootStackParamList } from '../navigation/types';

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const Splash: React.FC<Props> = ({ navigation }) => {
  const { initializeApp, isAppReady } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  // Ir directamente al Home cuando la app esté lista
  useEffect(() => {
    if (isAppReady) {
      navigation.replace('Home');
    }
  }, [isAppReady, navigation]);

  const handleSimulate = () => {
    navigation.navigate('Simulator');
  };

  const handleContact = () => {
    navigation.navigate('Contact');
  };

  const handleFAQ = () => {
    navigation.navigate('FAQ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" style={styles.logo} />
          <Text style={styles.claim}>
            Ahorra en tu factura de la luz{'\n'}sin complicaciones
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Simular ahorro"
            onPress={handleSimulate}
            variant="primary"
            size="large"
          />
          <View style={styles.spacer} />
          <Button
            title="Contacto"
            onPress={handleContact}
            variant="outline"
            size="large"
          />
          <TouchableOpacity
            style={styles.faqLink}
            onPress={handleFAQ}
            activeOpacity={0.7}
          >
            <Text style={styles.faqLinkText}>¿Tienes dudas? Consulta las FAQ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: spacing.xl,
  },
  claim: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    paddingBottom: spacing.lg,
  },
  spacer: {
    height: spacing.md,
  },
  faqLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  faqLinkText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
