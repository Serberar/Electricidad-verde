import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Header, Button } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

const env = Constants.expoConfig?.extra || {};
const PRIVACY_ACCEPTED_KEY = '@privacy_accepted';

type ContactScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Contact'
>;

interface Props {
  navigation: ContactScreenNavigationProp;
}

export const Contact: React.FC<Props> = ({ navigation }) => {
  const formularioUrl = env.FORMULARIO as string;
  const privacyPolicyUrl = env.PRIVACY_POLICY_URL as string;
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Cargar estado de aceptación al montar
  useEffect(() => {
    const loadPrivacyStatus = async () => {
      try {
        const accepted = await AsyncStorage.getItem(PRIVACY_ACCEPTED_KEY);
        setPrivacyAccepted(accepted === 'true');
      } catch {
        setPrivacyAccepted(false);
      }
    };
    loadPrivacyStatus();
  }, []);

  const handleOpenPrivacyUrl = () => {
    if (privacyPolicyUrl) {
      Linking.openURL(privacyPolicyUrl);
    }
  };

  const handleContinue = async () => {
    if (checkboxChecked) {
      try {
        await AsyncStorage.setItem(PRIVACY_ACCEPTED_KEY, 'true');
        setPrivacyAccepted(true);
      } catch {
        // Si falla el guardado, igual dejamos continuar
        setPrivacyAccepted(true);
      }
    }
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Cargando formulario...</Text>
    </View>
  );

  // Mientras carga el estado de privacidad
  if (privacyAccepted === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        {/* Tip */}
        <Card style={styles.tipCard} variant="highlight">
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Ten tu factura de la luz a mano cuando te llamemos. Así podremos
            darte una valoración más precisa.
          </Text>
        </Card>

        {/* Aceptación de política de privacidad */}
        {!privacyAccepted ? (
          <Card style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>Antes de continuar</Text>
            <Text style={styles.privacyDescription}>
              Para poder contactarte necesitamos que aceptes nuestra política de privacidad.
            </Text>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setCheckboxChecked(!checkboxChecked)}
            >
              <View style={[styles.checkbox, checkboxChecked && styles.checkboxChecked]}>
                {checkboxChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                He leído y acepto la{' '}
                <Text style={styles.privacyLink} onPress={() => setShowPrivacyModal(true)}>
                  política de privacidad
                </Text>
              </Text>
            </TouchableOpacity>

            <Button
              title="Continuar"
              onPress={handleContinue}
              disabled={!checkboxChecked}
              style={styles.continueButton}
            />
          </Card>
        ) : (
          <>
            {/* Formulario incrustado */}
            {formularioUrl ? (
              <View style={styles.webviewContainer}>
                <WebView
                  source={{ uri: formularioUrl }}
                  style={styles.webview}
                  startInLoadingState={true}
                  renderLoading={renderLoading}
                  scalesPageToFit={true}
                />
              </View>
            ) : (
              <View style={styles.noFormContainer}>
                <Text style={styles.noFormText}>
                  No hay formulario configurado
                </Text>
              </View>
            )}

            {/* Info de privacidad con enlace */}
            <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
              <Text style={styles.privacyText}>
                Tus datos están protegidos. Ver{' '}
                <Text style={styles.privacyTextLink}>política de privacidad</Text>
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Modal de política de privacidad */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Política de Privacidad</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.modalText}>
                <Text style={styles.modalBold}>Responsable del tratamiento:{'\n'}</Text>
                Aura{'\n\n'}

                <Text style={styles.modalBold}>Finalidad:{'\n'}</Text>
                Los datos personales que nos proporciones a través de este formulario serán utilizados únicamente para ponernos en contacto contigo y ofrecerte información sobre nuestros servicios de luz y gas.{'\n\n'}

                <Text style={styles.modalBold}>Datos que recogemos:{'\n'}</Text>
                • Nombre y apellidos{'\n'}
                • Número de teléfono{'\n'}
                • Correo electrónico (opcional){'\n\n'}

                <Text style={styles.modalBold}>Conservación:{'\n'}</Text>
                Tus datos se conservarán mientras exista una relación comercial o hasta que solicites su eliminación.{'\n\n'}

                <Text style={styles.modalBold}>Derechos:{'\n'}</Text>
                Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición y portabilidad escribiéndonos a nuestro correo de contacto.{'\n\n'}

                <Text style={styles.modalBold}>Seguridad:{'\n'}</Text>
                Tus datos se almacenan de forma segura y no se comparten con terceros salvo obligación legal.{'\n\n'}

                <Text style={styles.modalBold}>Importante:{'\n'}</Text>
                No vendemos ni cedemos tus datos a empresas de marketing o publicidad. Solo los usamos para contactarte sobre nuestros servicios.
                {privacyPolicyUrl ? (
                  <>
                    {'\n\n'}
                    <Text style={styles.modalTextSmall}>
                      Puedes consultar la versión completa en{' '}
                      <Text style={styles.modalLink} onPress={handleOpenPrivacyUrl}>
                        este enlace
                      </Text>
                      .
                    </Text>
                  </>
                ) : null}
              </Text>
            </ScrollView>
            <Button
              title="Entendido"
              onPress={() => setShowPrivacyModal(false)}
              style={styles.modalButton}
            />
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
  content: {
    flex: 1,
    padding: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  webviewContainer: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  noFormContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFormText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  privacyText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  privacyTextLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  privacyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  privacyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  privacyDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.fontWeights.bold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  privacyLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  continueButton: {
    minWidth: 200,
  },
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
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: spacing.md,
  },
  modalText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    lineHeight: 22,
  },
  modalBold: {
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary,
  },
  modalTextSmall: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  modalLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  modalButton: {
    width: '100%',
  },
});
