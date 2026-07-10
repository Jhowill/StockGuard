import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { useI18n } from '@/hooks/useI18n';

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  busy?: boolean;
  onPress: () => void;
};

export function RewardCard({ title, description, actionLabel, busy = false, onPress }: Props) {
  const { t } = useI18n();

  return (
    <AppCard variant="hero" style={{ gap: 12 }}>
      <AppCard.Row icon="sparkles-outline" title={title} subtitle={description} />
      <AppButton label={busy ? '...' : actionLabel ?? t('premium.watchAd')} disabled={busy} onPress={onPress} />
    </AppCard>
  );
}
