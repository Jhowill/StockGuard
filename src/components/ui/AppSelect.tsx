import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  value: T;
  options: Array<SelectOption<T>>;
  onChange: (value: T) => void;
};

export function AppSelect<T extends string>({ label, value, options, onChange }: Props<T>) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <AppButton
            key={option.value}
            label={option.label}
            variant={value === option.value ? 'primary' : 'ghost'}
            style={styles.option}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    minHeight: 42,
    flexGrow: 1,
  },
});
