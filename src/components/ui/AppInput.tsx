import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = TextInputProps & {
  label?: string;
};

export function AppInput({ label, style, ...props }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.root}>
      {label ? <Text style={[styles.label, { color: palette.text }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={palette.textMuted}
        style={[
          styles.input,
          { borderColor: palette.border, backgroundColor: palette.surface, color: palette.text },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
