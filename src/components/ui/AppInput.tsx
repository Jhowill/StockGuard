import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDecimalInput, formatIsoDateInput, formatMoneyInput } from '@/utils/input-format';

type Props = TextInputProps & {
  label?: string;
  mask?: 'money' | 'decimal' | 'date';
  maskOptions?: {
    maxFractionDigits?: number;
  };
};

export function AppInput({ label, mask, maskOptions, onChangeText, style, ...props }: Props) {
  const { palette } = useAppTheme();
  const handleChangeText: NonNullable<TextInputProps['onChangeText']> = (text) => {
    if (!onChangeText) {
      return;
    }

    if (mask === 'money') {
      onChangeText(formatMoneyInput(text));
      return;
    }

    if (mask === 'decimal') {
      onChangeText(formatDecimalInput(text, maskOptions?.maxFractionDigits ?? 3));
      return;
    }

    if (mask === 'date') {
      onChangeText(formatIsoDateInput(text));
      return;
    }

    onChangeText(text);
  };

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
        onChangeText={handleChangeText}
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
