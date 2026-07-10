import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  busy?: boolean;
  onUnlock?: () => void;
};

export function PremiumLock({ title, description, actionLabel, busy = false, onUnlock }: Props) {
  const { t } = useI18n();
  const { palette } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: palette.surfaceMuted, borderColor: palette.premium }]}>
      <Text style={[styles.kicker, { color: palette.premium }]}>{t('common.advancedFeature')}</Text>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text>
      {onUnlock ? <AppButton label={busy ? '...' : actionLabel ?? t('common.unlockWithAd')} disabled={busy} onPress={onUnlock} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
