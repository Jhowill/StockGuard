import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  helperText?: string;
  value: T;
  options: Array<SelectOption<T>>;
  onChange: (value: T) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function AppSelect<T extends string>({ label, helperText, value, options, onChange, disabled = false, compact = false }: Props<T>) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      <View style={[styles.shell, compact ? styles.compactShell : null, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
        <View style={styles.options}>
          {options.map((option) => (
            <AppButton
              key={option.value}
              label={option.label}
              variant={value === option.value ? 'primary' : 'ghost'}
              style={[styles.option, compact ? styles.compactOption : null]}
              disabled={disabled}
              onPress={() => onChange(option.value)}
            />
          ))}
        </View>
      </View>
      {helperText ? <Text style={[styles.helper, { color: palette.textMuted }]}>{helperText}</Text> : null}
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
  shell: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 6,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    minHeight: 42,
    flexGrow: 1,
    flexBasis: 110,
  },
  compactShell: {
    borderRadius: 16,
    padding: 4,
  },
  compactOption: {
    minHeight: 36,
    flexBasis: '22%',
    paddingHorizontal: 8,
  },
  helper: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 4,
  },
});
