import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StockMovementType } from '@/types/stock';
import { useAppTheme } from '@/hooks/useAppTheme';

type MovementOption = {
  value: StockMovementType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: 'success' | 'warning' | 'info' | 'danger';
  deltaLabel: string;
};

type Props = {
  value: StockMovementType;
  onChange: (value: StockMovementType) => void;
};

const primaryOptions: MovementOption[] = [
  {
    value: 'in',
    title: 'Entrada',
    description: 'Aumenta o saldo do estoque.',
    icon: 'arrow-up-circle-outline',
    accent: 'success',
    deltaLabel: '+ saldo',
  },
  {
    value: 'out',
    title: 'Saída',
    description: 'Reduz a quantidade disponível.',
    icon: 'arrow-down-circle-outline',
    accent: 'warning',
    deltaLabel: '- saldo',
  },
];

const secondaryOptions: MovementOption[] = [
  {
    value: 'return',
    title: 'Devolução',
    description: 'Reverte uma saída anterior.',
    icon: 'return-up-back-outline',
    accent: 'info',
    deltaLabel: 'reentrada',
  },
  {
    value: 'loss',
    title: 'Perda',
    description: 'Baixa por avaria ou extravio.',
    icon: 'warning-outline',
    accent: 'danger',
    deltaLabel: 'baixa',
  },
  {
    value: 'adjustment_positive',
    title: 'Ajuste +',
    description: 'Corrige o saldo para cima.',
    icon: 'add-circle-outline',
    accent: 'success',
    deltaLabel: 'ajuste',
  },
  {
    value: 'adjustment_negative',
    title: 'Ajuste -',
    description: 'Corrige o saldo para baixo.',
    icon: 'remove-circle-outline',
    accent: 'danger',
    deltaLabel: 'ajuste',
  },
];

export function MovementTypePicker({ value, onChange }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Fluxo principal</Text>
        <View style={styles.primaryGrid}>
          {primaryOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: value === option.value ? palette.surfaceMuted : palette.surface,
                  borderColor: value === option.value ? palette.primary : palette.border,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={[styles.iconShell, { backgroundColor: palette.background }]}>
                <Ionicons name={option.icon} size={20} color={palette[option.accent]} />
              </View>
              <View style={styles.optionBody}>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionTitle, { color: palette.text }]}>{option.title}</Text>
                  <Text style={[styles.deltaPill, { color: palette[option.accent], borderColor: palette[option.accent] }]}>{option.deltaLabel}</Text>
                </View>
                <Text style={[styles.optionDescription, { color: palette.textMuted }]}>{option.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Ajustes rápidos</Text>
        <View style={styles.secondaryGrid}>
          {secondaryOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.secondaryCard,
                {
                  backgroundColor: value === option.value ? palette.surfaceMuted : palette.surface,
                  borderColor: value === option.value ? palette.primary : palette.border,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.secondaryHeader}>
                <Ionicons name={option.icon} size={18} color={palette[option.accent]} />
                <Text style={[styles.secondaryBadge, { color: palette[option.accent] }]}>{option.deltaLabel}</Text>
              </View>
              <Text style={[styles.secondaryTitle, { color: palette.text }]}>{option.title}</Text>
              <Text style={[styles.secondaryDescription, { color: palette.textMuted }]}>{option.description}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryGrid: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  optionBody: {
    flex: 1,
    gap: 4,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    overflow: 'hidden',
  },
  secondaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryCard: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  secondaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  secondaryBadge: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  secondaryTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.88,
  },
});
