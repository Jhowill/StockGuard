import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from './AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({ title, description, actionLabel, onActionPress, icon = 'sparkles-outline' }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={[styles.iconShell, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
        <Ionicons name={icon} size={22} color={palette.primary} />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text>
      {actionLabel ? <AppButton label={actionLabel} style={styles.action} onPress={onActionPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
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
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
  },
});
