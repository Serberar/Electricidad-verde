import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, Button } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type FAQScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FAQ'>;

interface Props {
  navigation: FAQScreenNavigationProp;
}


interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: '¿Cuánto puedo ahorrar realmente?',
    answer: 'El ahorro depende de tu consumo actual y de la tarifa que tengas contratada. En promedio, nuestros clientes ahorran entre un 15% y un 30% en su factura de la luz. Usa nuestro simulador para obtener una estimación personalizada.',
  },
  {
    id: '2',
    question: '¿Cómo calculáis el ahorro?',
    answer: 'Comparamos el precio por kWh que pagas actualmente con nuestra tarifa. Multiplicamos la diferencia por tu consumo estimado mensual y anual. El cálculo es transparente y puedes verlo en detalle tras la simulación.',
  },
  {
    id: '3',
    question: '¿Hay permanencia?',
    answer: 'No. Nuestros contratos no tienen permanencia. Puedes darte de baja cuando quieras sin penalización alguna. Creemos que la mejor forma de retenerte es ofrecerte un buen servicio.',
  },
  {
    id: '4',
    question: '¿Qué necesito para cambiarme?',
    answer: 'Solo necesitas una factura reciente de la luz y tus datos personales. Nosotros nos encargamos de todo el papeleo con tu compañía actual. El proceso es completamente gratuito.',
  },
  {
    id: '5',
    question: '¿Me quedaré sin luz durante el cambio?',
    answer: 'No, en ningún momento. El cambio de comercializadora es un trámite administrativo que no afecta al suministro. La electricidad sigue llegando a tu casa con total normalidad.',
  },
  {
    id: '6',
    question: '¿Cómo pago las facturas?',
    answer: 'Mediante domiciliación bancaria. Recibirás la factura por email y el cargo se realizará automáticamente en tu cuenta. También puedes consultar todas tus facturas en la app.',
  },
  {
    id: '7',
    question: '¿Cada cuánto se factura?',
    answer: 'La facturación es mensual. Recibirás tu factura entre el día 1 y 5 de cada mes con el consumo del mes anterior.',
  },
  {
    id: '8',
    question: '¿Cómo contacto con atención al cliente?',
    answer: 'Puedes contactarnos a través de la app. Nuestros agentes te contactarán lo antes posible.',
  },
];

interface AccordionItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isExpanded, onToggle }) => {
  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.question}>{item.question}</Text>
        <View style={[styles.chevron, isExpanded && styles.chevronExpanded]}>
          <Text style={[styles.chevronText, isExpanded && styles.chevronTextExpanded]}>
            {isExpanded ? '−' : '+'}
          </Text>
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

export const FAQ: React.FC<Props> = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Preguntas frecuentes</Text>
        <Text style={styles.subtitle}>
          Resolvemos tus dudas sobre el cambio de tarifa
        </Text>

        {/* Lista de FAQs */}
        <View style={styles.faqList}>
          {faqData.map(item => (
            <AccordionItem
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={() => handleToggle(item.id)}
            />
          ))}
        </View>

        {/* CTA final */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaText}>¿No encuentras lo que buscas?</Text>
          <Text style={styles.ctaSubtext}>
            Contacta con nosotros y te ayudaremos personalmente
          </Text>
          <Button
            title="Contactar"
            onPress={() => navigation.navigate('Contact')}
            style={styles.ctaButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    marginBottom: spacing.lg,
  },
  faqList: {
    gap: spacing.md,
  },
  accordionItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  question: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    paddingRight: spacing.md,
    lineHeight: 22,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronExpanded: {
    backgroundColor: colors.primary,
  },
  chevronText: {
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
  },
  chevronTextExpanded: {
    color: colors.white,
  },
  answerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 0,
  },
  answer: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  ctaContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  ctaText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ctaSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: spacing.md,
  },
});
