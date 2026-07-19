import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '@/components/ui/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'required' | 'reward';
};

const toneConfig = {
  required: {
    icon: 'shield-checkmark-outline' as const,
  },
  reward: {
    icon: 'sparkles-outline' as const,
  },
} satisfies Record<NonNullable<Props['tone']>, { icon: keyof typeof Ionicons.glyphMap }>;

export function AdPolicyNotice({ title, body, icon, tone = 'required' }: Props) {
  const { palette } = useAppTheme();
  const resolvedIcon = icon ?? toneConfig[tone].icon;

  return (
    <AppCard variant="hero" style={styles.card}>
      <View style={[styles.iconShell, { backgroundColor: palette.background }]}>
        <Ionicons name={resolvedIcon} size={20} color={tone === 'reward' ? palette.premium : palette.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.body, { color: palette.textMuted }]}>{body}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
  },
});
