import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const { palette } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={[styles.backdrop, { backgroundColor: palette.overlay }]} onPress={onCancel}>
        <Pressable style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.title, { color: danger ? palette.danger : palette.text }]}>{title}</Text>
          <Text style={[styles.message, { color: palette.textMuted }]}>{message}</Text>
          <View style={styles.actions}>
            <AppButton label={cancelLabel} variant="ghost" style={styles.action} onPress={onCancel} />
            <AppButton label={confirmLabel} variant={danger ? 'danger' : 'primary'} style={styles.action} onPress={onConfirm} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
  },
});
