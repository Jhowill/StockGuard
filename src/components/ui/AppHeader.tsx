import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  rightAction?: ReactNode;
};

export function AppHeader({ title, subtitle, actionLabel, onActionPress, rightAction }: Props) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {rightAction ? (
        rightAction
      ) : actionLabel ? (
        <Pressable onPress={onActionPress} hitSlop={8} style={[styles.action, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
          <Ionicons name="add" size={22} color={palette.primary} />
          <Text style={[styles.actionText, { color: palette.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
