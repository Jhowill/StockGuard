import { StyleSheet, Text, View } from 'react-native';

type Tone = 'success' | 'warning' | 'danger' | 'info';

type Props = {
  label: string;
  tone?: Tone;
};

const tones: Record<Tone, { backgroundColor: string; color: string }> = {
  success: { backgroundColor: '#143221', color: '#7EE19A' },
  warning: { backgroundColor: '#33280D', color: '#FFD166' },
  danger: { backgroundColor: '#33161A', color: '#FF8677' },
  info: { backgroundColor: '#132033', color: '#79BEFF' },
};

export function StatusBadge({ label, tone = 'info' }: Props) {
  const colors = tones[tone];

  return (
    <View style={[styles.root, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
