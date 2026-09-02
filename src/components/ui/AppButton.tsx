import type { StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({ label, onPress, variant = 'primary', style, disabled = false, loading = false }: Props) {
  const { palette } = useAppTheme();
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const backgroundColor = isPrimary
    ? palette.primary
    : isSecondary
      ? palette.surfaceMuted
      : isDanger
        ? palette.danger
      : palette.surface;
  const textColor = isDanger ? '#FFFFFF' : isPrimary ? palette.primaryText : palette.text;
  const borderColor = isPrimary || isDanger ? 'transparent' : palette.border;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
        },
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
        pressed ? styles.pressed : null,
        disabled || loading ? styles.disabled : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={textColor} /> : null}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  primary: {
    borderColor: 'transparent',
  },
  secondary: {},
  danger: {
    borderColor: 'transparent',
  },
  ghost: {
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
