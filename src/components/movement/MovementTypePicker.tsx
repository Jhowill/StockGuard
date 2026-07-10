import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StockMovementType } from '@/types/stock';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';

type MovementOption = {
  value: StockMovementType;
  titleKey: string;
  descriptionKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: 'success' | 'warning' | 'info' | 'danger';
  deltaLabel: string;
};

type Props = {
  value: StockMovementType;
  onChange: (value: StockMovementType) => void;
};

const mainOptions: MovementOption[] = [
  {
    value: 'in',
    titleKey: 'movement.mainInTitle',
    descriptionKey: 'movement.mainInBody',
    icon: 'add-circle-outline',
    accent: 'success',
    deltaLabel: '+ saldo',
  },
  {
    value: 'out',
    titleKey: 'movement.mainOutTitle',
    descriptionKey: 'movement.mainOutBody',
    icon: 'remove-circle-outline',
    accent: 'warning',
    deltaLabel: '- saldo',
  },
];

const supportOptions: MovementOption[] = [
  {
    value: 'return',
    titleKey: 'movement.returnTitle',
    descriptionKey: 'movement.returnBody',
    icon: 'return-up-back-outline',
    accent: 'info',
    deltaLabel: '+ volta',
  },
  {
    value: 'loss',
    titleKey: 'movement.lossTitle',
    descriptionKey: 'movement.lossBody',
    icon: 'warning-outline',
    accent: 'danger',
    deltaLabel: '- baixa',
  },
  {
    value: 'adjustment_positive',
    titleKey: 'movement.adjustUpTitle',
    descriptionKey: 'movement.adjustUpBody',
    icon: 'arrow-up-outline',
    accent: 'success',
    deltaLabel: '+ ajuste',
  },
  {
    value: 'adjustment_negative',
    titleKey: 'movement.adjustDownTitle',
    descriptionKey: 'movement.adjustDownBody',
    icon: 'arrow-down-outline',
    accent: 'danger',
    deltaLabel: '- ajuste',
  },
];

export function MovementTypePicker({ value, onChange }: Props) {
  const { t } = useI18n();
  const { palette } = useAppTheme();

  return (
    <View style={styles.root}>
      <View style={styles.mainGrid}>
        {mainOptions.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.mainCard,
                {
                  backgroundColor: selected ? palette.surfaceMuted : palette.surface,
                  borderColor: selected ? palette.primary : palette.border,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.iconShell, { backgroundColor: palette.background }]}>
                  <Ionicons name={option.icon} size={22} color={palette[option.accent]} />
                </View>
                <Text style={[styles.deltaPill, { color: palette[option.accent], borderColor: palette[option.accent] }]}>{option.deltaLabel}</Text>
              </View>
              <Text style={[styles.mainTitle, { color: palette.text }]}>{t(option.titleKey)}</Text>
              <Text style={[styles.description, { color: palette.textMuted }]}>{t(option.descriptionKey)}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.supportBlock}>
        <Text style={[styles.supportTitle, { color: palette.text }]}>{t('movement.supportTitle')}</Text>
        <View style={styles.supportGrid}>
          {supportOptions.map((option) => {
            const selected = value === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                style={({ pressed }) => [
                  styles.supportCard,
                  {
                    backgroundColor: selected ? palette.surfaceMuted : palette.surface,
                    borderColor: selected ? palette.primary : palette.border,
                  },
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.supportHeader}>
                  <Ionicons name={option.icon} size={18} color={palette[option.accent]} />
                  <Text style={[styles.supportDelta, { color: palette[option.accent] }]}>{option.deltaLabel}</Text>
                </View>
                <Text style={[styles.supportLabel, { color: palette.text }]}>{t(option.titleKey)}</Text>
                <Text style={[styles.supportDescription, { color: palette.textMuted }]}>{t(option.descriptionKey)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  mainGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  mainCard: {
    flex: 1,
    minHeight: 138,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
    overflow: 'hidden',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  supportBlock: {
    gap: 10,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  supportGrid: {
    gap: 10,
  },
  supportCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  supportDelta: {
    fontSize: 11,
    fontWeight: '800',
  },
  supportLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  supportDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.88,
  },
});
