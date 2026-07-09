import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'hero';
  style?: StyleProp<ViewStyle>;
};

function Title({ children }: { children: ReactNode }) {
  const { palette } = useAppTheme();
  return <Text style={[styles.title, { color: palette.text }]}>{children}</Text>;
}

function Body({ children }: { children: ReactNode }) {
  const { palette } = useAppTheme();
  return <Text style={[styles.body, { color: palette.textMuted }]}>{children}</Text>;
}

function Row({
  icon,
  title,
  subtitle,
  trailing,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: palette.background }]}>
        <Ionicons name={icon ?? 'ellipse-outline'} size={18} color={palette.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: palette.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSubtitle, { color: palette.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

type AppCardComponent = {
  (props: Props): ReactElement;
  Title: typeof Title;
  Text: typeof Body;
  Row: typeof Row;
};

function CardBase({ children, onPress, variant = 'default', style }: Props) {
  const { palette } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: variant === 'hero' ? palette.surfaceMuted : palette.surface,
          borderColor: palette.border,
        },
        pressed && onPress ? styles.pressed : null,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export const AppCard = Object.assign(CardBase, {
  Title,
  Text: Body,
  Row,
}) as AppCardComponent;

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.88,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    fontSize: 12,
  },
});
