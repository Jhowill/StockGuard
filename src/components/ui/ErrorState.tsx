import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  title?: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ErrorState({ title = 'Algo saiu do esperado', description, actionLabel, onActionPress }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.root, { borderColor: palette.danger, backgroundColor: palette.surface }]}>
      <Text style={[styles.title, { color: palette.danger }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text>
      {actionLabel && onActionPress ? <AppButton label={actionLabel} variant="secondary" onPress={onActionPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
});
