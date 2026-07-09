import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  title?: string;
  description?: string;
};

export function LoadingState({ title = 'Carregando...', description }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.root, { borderColor: palette.border, backgroundColor: palette.surface }]}>
      <ActivityIndicator color={palette.primary} />
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },
});
