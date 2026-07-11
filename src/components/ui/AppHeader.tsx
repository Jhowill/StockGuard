import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'page';
  onBackPress?: () => void;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
  rightAction?: ReactNode;
};

export function AppHeader({
  title,
  subtitle,
  variant = 'default',
  onBackPress,
  actionLabel,
  actionIcon,
  onActionPress,
  rightAction,
}: Props) {
  const { palette } = useAppTheme();
  const isPage = variant === 'page';
  const iconOnlyAction = actionLabel?.trim() === '+';
  const resolvedActionIcon = iconOnlyAction ? 'add' : actionIcon;

  return (
    <View style={[styles.wrapper, isPage ? styles.pageWrapper : null]}>
      {isPage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={onBackPress ? onBackPress : () => router.back()}
          hitSlop={10}
          style={[styles.navButton, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}
        >
          <Ionicons name="chevron-back" size={20} color={palette.text} />
        </Pressable>
      ) : null}

      <View style={[styles.textBlock, isPage ? styles.pageTextBlock : null]}>
        <Text style={[styles.title, isPage ? styles.pageTitle : null, { color: palette.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, isPage ? styles.pageSubtitle : null, { color: palette.textMuted }]}>{subtitle}</Text> : null}
      </View>

      {rightAction ? (
        rightAction
      ) : actionLabel ? (
        iconOnlyAction ? (
          <Pressable
            onPress={onActionPress}
            hitSlop={10}
            style={[styles.iconOnlyAction, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}
          >
            <Ionicons name={resolvedActionIcon ?? 'add'} size={24} color={palette.primary} />
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onActionPress} hitSlop={8} style={[styles.action, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
            {resolvedActionIcon ? <Ionicons name={resolvedActionIcon} size={20} color={palette.primary} /> : null}
            <Text style={[styles.actionText, { color: palette.primary }]}>{actionLabel}</Text>
          </Pressable>
        )
      ) : isPage ? (
        <View style={styles.navButtonPlaceholder} />
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
  pageWrapper: {
    justifyContent: 'flex-start',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  pageTextBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
  },
  pageSubtitle: {
    fontSize: 12,
    textAlign: 'center',
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
  iconOnlyAction: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
