import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDecimalInput, formatIsoDateInput, formatMoneyInput } from '@/utils/input-format';

type Props = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  prefix?: string;
  mask?: 'money' | 'decimal' | 'date';
  maskOptions?: {
    maxFractionDigits?: number;
  };
  inputSize?: 'default' | 'large';
};

export function AppInput({ label, helperText, errorText, prefix, mask, maskOptions, inputSize = 'default', onChangeText, style, multiline, ...props }: Props) {
  const { palette } = useAppTheme();
  const hasError = Boolean(errorText);
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
      <View
        style={[
          styles.inputShell,
          {
            borderColor: hasError ? palette.danger : palette.border,
            backgroundColor: palette.surface,
          },
          multiline ? styles.inputShellMultiline : null,
          inputSize === 'large' ? styles.inputShellLarge : null,
        ]}
      >
        {prefix ? (
          <View style={[styles.prefixBadge, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
            <Text style={[styles.prefixText, { color: palette.text }]}>{prefix}</Text>
          </View>
        ) : null}
        <TextInput
          placeholderTextColor={palette.textMuted}
          style={[
            styles.input,
            { color: palette.text },
            prefix ? styles.inputWithPrefix : null,
            multiline ? styles.multiline : null,
            inputSize === 'large' ? styles.inputLarge : null,
            style,
          ]}
          multiline={multiline}
          onChangeText={handleChangeText}
          {...props}
        />
      </View>
      {errorText ? (
        <Text style={[styles.helper, { color: palette.danger }]}>{errorText}</Text>
      ) : helperText ? (
        <Text style={[styles.helper, { color: palette.textMuted }]}>{helperText}</Text>
      ) : null}
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
  inputShellMultiline: {
    alignItems: 'stretch',
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
  },
  inputShellLarge: {
    minHeight: 62,
    borderRadius: 18,
  },
  inputLarge: {
    minHeight: 62,
    paddingVertical: 16,
    fontSize: 17,
    fontWeight: '700',
  },
  inputWithPrefix: {},
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
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
  helper: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 4,
  },
});
