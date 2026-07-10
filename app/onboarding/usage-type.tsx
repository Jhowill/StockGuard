import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useSettings } from '@/hooks/useSettings';
import type { UsageType } from '@/types/settings';

const options: Array<{ value: UsageType; labelKey: string; descriptionKey: string }> = [
  { value: 'store', labelKey: 'onboarding.store', descriptionKey: 'onboarding.storeBody' },
  { value: 'workshop', labelKey: 'onboarding.workshop', descriptionKey: 'onboarding.workshopBody' },
  { value: 'personal', labelKey: 'onboarding.personal', descriptionKey: 'onboarding.personalBody' },
  { value: 'service', labelKey: 'onboarding.service', descriptionKey: 'onboarding.serviceBody' },
  { value: 'other', labelKey: 'onboarding.other', descriptionKey: 'onboarding.otherBody' },
];

export default function UsageTypeScreen() {
  const { settings, saveSettings } = useSettings();
  const { t } = useI18n();
  const { palette } = useAppTheme();
  const [selected, setSelected] = useState<UsageType>(settings?.usageType ?? 'other');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const canContinue = useMemo(() => Boolean(selected), [selected]);

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('onboarding.usageTitle')} subtitle={t('onboarding.usageSubtitle')} variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="layers-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>{t('onboarding.usageHeroTitle')}</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>{t('onboarding.usageHeroBody')}</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label={t('onboarding.step1')} />
        </View>
      </AppCard>

      <AppCard.Text>{t('onboarding.usageBody')}</AppCard.Text>

      {options.map((option) => (
        <AppCard
          key={option.value}
          onPress={() => setSelected(option.value)}
          variant={selected === option.value ? 'hero' : 'default'}
        >
          <AppCard.Row
            icon="ellipse-outline"
            title={t(option.labelKey)}
            subtitle={t(option.descriptionKey)}
            trailing={<StatusBadge tone={selected === option.value ? 'success' : 'info'} label={selected === option.value ? t('onboarding.selected') : t('onboarding.choose')} />}
          />
        </AppCard>
      ))}

      <AppButton
        label={saving ? '...' : t('onboardingPrefs.next')}
        disabled={saving}
        onPress={async () => {
          if (!canContinue || saving) return;

          setSaving(true);
          setError(undefined);
          try {
            await saveSettings({ usageType: selected });
            router.push('/onboarding/preferences');
          } catch {
            setError(t('onboarding.usageSaveFailed'));
          } finally {
            setSaving(false);
          }
        }}
      />
      {error ? <AppCard><AppCard.Text>{error}</AppCard.Text></AppCard> : null}
      <AppButton label={t('common.back')} variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 14,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    gap: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
