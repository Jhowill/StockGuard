import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from './AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  title?: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function ErrorState({ title = 'Algo saiu do esperado', description, actionLabel, onActionPress, icon = 'alert-circle-outline' }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.root, { borderColor: palette.danger, backgroundColor: palette.surface }]}>
      <View style={[styles.iconShell, { backgroundColor: palette.surfaceMuted, borderColor: palette.danger }]}>
        <Ionicons name={icon} size={22} color={palette.danger} />
      </View>
      <Text style={[styles.title, { color: palette.danger }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text>
      {actionLabel && onActionPress ? <AppButton label={actionLabel} variant="secondary" style={styles.action} onPress={onActionPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
  },
});
