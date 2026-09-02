import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StockMovementType } from '@/types/stock';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';

type MovementOption = {
  value: StockMovementType;
  titleKey: string;
  descriptionKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: 'success' | 'warning' | 'info' | 'danger';
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
  },
  {
    value: 'out',
    titleKey: 'movement.mainOutTitle',
    descriptionKey: 'movement.mainOutBody',
    icon: 'remove-circle-outline',
    accent: 'warning',
  },
  {
    value: 'adjustment_positive',
    titleKey: 'movement.adjustUpTitle',
    descriptionKey: 'movement.adjustUpBody',
    icon: 'swap-horizontal-outline',
    accent: 'info',
  },
];

const specialOptions: MovementOption[] = [
  {
    value: 'return',
    titleKey: 'movement.returnTitle',
    descriptionKey: 'movement.returnBody',
    icon: 'return-up-back-outline',
    accent: 'info',
  },
  {
    value: 'loss',
    titleKey: 'movement.lossTitle',
    descriptionKey: 'movement.lossBody',
    icon: 'warning-outline',
    accent: 'danger',
  },
];

function isAdjustment(value: StockMovementType) {
  return value === 'adjustment_positive' || value === 'adjustment_negative';
}

export function MovementTypePicker({ value, onChange }: Props) {
  const { t } = useI18n();
  const { palette } = useAppTheme();

  return (
    <View style={styles.root}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>{t('movement.whatHappened')}</Text>
        <Text style={[styles.sectionSubtitle, { color: palette.textMuted }]}>{t('movement.whatHappenedBody')}</Text>
      </View>

      <View style={styles.mainGrid}>
        {mainOptions.map((option) => {
          const selected = value === option.value || (option.value === 'adjustment_positive' && isAdjustment(value));
          const borderColor = selected ? palette.primary : palette.border;
          const backgroundColor = selected ? palette.surfaceMuted : palette.surface;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.mainCard,
                { backgroundColor, borderColor },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.iconShell, { backgroundColor: palette.background }]}>
                  <Ionicons name={option.icon} size={22} color={palette[option.accent]} />
                </View>
                <View style={[styles.accentPill, { borderColor: palette[option.accent], backgroundColor: palette.background }]}>
                  <Text style={[styles.accentPillText, { color: palette[option.accent] }]}>
                    {option.value === 'in'
                      ? t('movement.entry')
                      : option.value === 'out'
                        ? t('movement.exit')
                        : t('movement.adjustmentPositive')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.mainTitle, { color: palette.text }]}>{t(option.titleKey)}</Text>
              <Text style={[styles.description, { color: palette.textMuted }]}>{t(option.descriptionKey)}</Text>
            </Pressable>
          );
        })}
      </View>

      {isAdjustment(value) ? (
        <View style={styles.adjustmentBlock}>
          <Text style={[styles.smallSectionTitle, { color: palette.text }]}>{t('movement.supportTitle')}</Text>
          <View style={styles.adjustmentRow}>
            <Pressable
              onPress={() => onChange('adjustment_positive')}
              style={({ pressed }) => [
                styles.adjustmentChip,
                {
                  backgroundColor: value === 'adjustment_positive' ? palette.surfaceMuted : palette.surface,
                  borderColor: value === 'adjustment_positive' ? palette.primary : palette.border,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons name="arrow-up-outline" size={18} color={palette.success} />
              <View style={styles.chipTextBlock}>
                <Text style={[styles.chipTitle, { color: palette.text }]}>{t('movement.adjustUpTitle')}</Text>
                <Text style={[styles.chipBody, { color: palette.textMuted }]}>{t('movement.adjustUpBody')}</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => onChange('adjustment_negative')}
              style={({ pressed }) => [
                styles.adjustmentChip,
                {
                  backgroundColor: value === 'adjustment_negative' ? palette.surfaceMuted : palette.surface,
                  borderColor: value === 'adjustment_negative' ? palette.primary : palette.border,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons name="arrow-down-outline" size={18} color={palette.warning} />
              <View style={styles.chipTextBlock}>
                <Text style={[styles.chipTitle, { color: palette.text }]}>{t('movement.adjustDownTitle')}</Text>
                <Text style={[styles.chipBody, { color: palette.textMuted }]}>{t('movement.adjustDownBody')}</Text>
              </View>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.specialBlock}>
        <Text style={[styles.smallSectionTitle, { color: palette.text }]}>{t('movement.supportTitle')}</Text>
        <View style={styles.specialGrid}>
          {specialOptions.map((option) => {
            const selected = value === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                style={({ pressed }) => [
                  styles.specialCard,
                  {
                    backgroundColor: selected ? palette.surfaceMuted : palette.surface,
                    borderColor: selected ? palette.primary : palette.border,
                  },
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.optionHeader}>
                  <Ionicons name={option.icon} size={18} color={palette[option.accent]} />
                  <Text style={[styles.specialLabel, { color: palette[option.accent] }]}>{t(option.titleKey)}</Text>
                </View>
                <Text style={[styles.specialDescription, { color: palette.textMuted }]}>{t(option.descriptionKey)}</Text>
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
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  mainGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  mainCard: {
    flex: 1,
    minHeight: 134,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  accentPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  adjustmentBlock: {
    gap: 10,
  },
  smallSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  adjustmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  adjustmentChip: {
    flex: 1,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipTextBlock: {
    flex: 1,
    gap: 2,
  },
  chipTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  chipBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  specialBlock: {
    gap: 10,
  },
  specialGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  specialCard: {
    flex: 1,
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  specialLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  specialDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.88,
  },
});
