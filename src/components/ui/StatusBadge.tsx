import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type Tone = 'success' | 'warning' | 'danger' | 'info';

type Props = {
  label: string;
  tone?: Tone;
};

export function StatusBadge({ label, tone = 'info' }: Props) {
  const { palette } = useAppTheme();
  const color = {
    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
    info: palette.info,
  }[tone];

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: palette.surface,
          borderColor: color,
        },
      ]}
      >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
