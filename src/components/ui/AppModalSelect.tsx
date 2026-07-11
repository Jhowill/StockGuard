import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import type { SelectOption } from './AppSelect';

type Props<T extends string> = {
  label: string;
  helperText?: string;
  placeholder: string;
  value: T;
  options: Array<SelectOption<T>>;
  onChange: (value: T) => void;
  onAdd?: () => void;
  disabled?: boolean;
};

export function AppModalSelect<T extends string>({
  label,
  helperText,
  placeholder,
  value,
  options,
  onChange,
  onAdd,
  disabled = false,
}: Props<T>) {
  const { palette } = useAppTheme();
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;

  const select = (nextValue: T) => {
    onChange(nextValue);
    setVisible(false);
  };

  const handleAdd = () => {
    setVisible(false);
    onAdd?.();
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      <View style={styles.controlRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled, expanded: visible }}
          disabled={disabled}
          onPress={() => setVisible(true)}
          style={({ pressed }) => [
            styles.selector,
            { backgroundColor: palette.surface, borderColor: palette.border },
            disabled ? styles.disabled : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={[styles.value, { color: value ? palette.text : palette.textMuted }]} numberOfLines={1}>
            {selectedLabel}
          </Text>
          <Ionicons name="chevron-down" size={18} color={palette.textMuted} />
        </Pressable>
        {onAdd ? (
          <Pressable
            accessibilityLabel={t('common.add')}
            accessibilityRole="button"
            disabled={disabled}
            onPress={handleAdd}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: palette.primary, borderColor: palette.primary },
              disabled ? styles.disabled : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons name="add" size={22} color={palette.primaryText} />
          </Pressable>
        ) : null}
      </View>
      {helperText ? <Text style={[styles.helper, { color: palette.textMuted }]}>{helperText}</Text> : null}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: palette.overlay }]} onPress={() => setVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={[styles.modalTitle, { color: palette.text }]}>{label}</Text>
                <Text style={[styles.modalSubtitle, { color: palette.textMuted }]}>{t('productNew.selectOption')}</Text>
              </View>
              <Pressable accessibilityLabel={t('common.close')} onPress={() => setVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={palette.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(option) => option.value || '__empty__'}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => select(item.value)}
                    style={({ pressed }) => [
                      styles.option,
                      { backgroundColor: selected ? palette.surfaceMuted : palette.surface, borderColor: selected ? palette.primary : palette.border },
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text style={[styles.optionLabel, { color: palette.text }]}>{item.label}</Text>
                    <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={selected ? palette.primary : palette.textMuted} />
                  </Pressable>
                );
              }}
            />
            {onAdd ? <Pressable onPress={handleAdd} style={[styles.modalAdd, { borderColor: palette.border }]}>
              <Ionicons name="add-circle-outline" size={20} color={palette.primary} />
              <Text style={[styles.modalAddLabel, { color: palette.primary }]}>{t('common.add')}</Text>
            </Pressable> : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700' },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selector: { minHeight: 48, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 },
  value: { flex: 1, fontSize: 15, fontWeight: '700' },
  addButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  helper: { fontSize: 12, lineHeight: 17, paddingHorizontal: 4 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 430, maxHeight: '78%', borderRadius: 24, borderWidth: 1, padding: 16, gap: 14 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  modalTitleBlock: { flex: 1, gap: 3 },
  modalTitle: { fontSize: 19, fontWeight: '900' },
  modalSubtitle: { fontSize: 12 },
  list: { gap: 8 },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  modalAdd: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1 },
  modalAddLabel: { fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
});
