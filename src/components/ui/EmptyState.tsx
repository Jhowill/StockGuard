import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({ title, description, actionLabel, onActionPress }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text>
      {actionLabel ? <AppButton label={actionLabel} onPress={onActionPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
