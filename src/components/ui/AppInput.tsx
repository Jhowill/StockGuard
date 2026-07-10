import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDecimalInput, formatIsoDateInput, formatMoneyInput } from '@/utils/input-format';

type Props = TextInputProps & {
  label?: string;
  prefix?: string;
  mask?: 'money' | 'decimal' | 'date';
  maskOptions?: {
    maxFractionDigits?: number;
  };
};

export function AppInput({ label, prefix, mask, maskOptions, onChangeText, style, ...props }: Props) {
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
      {prefix ? (
        <View style={[styles.inputShell, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <View style={[styles.prefixBadge, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
            <Text style={[styles.prefixText, { color: palette.text }]}>{prefix}</Text>
          </View>
          <TextInput
            placeholderTextColor={palette.textMuted}
            style={[styles.inputWithPrefix, { color: palette.text }, style]}
            onChangeText={handleChangeText}
            {...props}
          />
        </View>
      ) : (
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
      )}
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
  inputShell: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 12,
    gap: 10,
  },
  inputWithPrefix: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
  },
  prefixBadge: {
    minWidth: 52,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  prefixText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
