import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  compact?: boolean;
};

export function MetricCard({ label, value, hint, compact }: Props) {
  const { palette } = useAppTheme();

  return (
    <View
      style={[
        styles.root,
        compact && styles.compact,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
      ]}
    >
      <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: palette.text }]}>{value}</Text>
      {hint ? <Text style={[styles.hint, { color: palette.primary }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 6,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  compact: {
    minWidth: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
  },
});
