import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  busy?: boolean;
  onPress: () => void;
};

export function RewardCard({ title, description, actionLabel = 'Assistir anuncio', busy = false, onPress }: Props) {
  return (
    <AppCard variant="hero" style={{ gap: 12 }}>
      <AppCard.Row icon="sparkles-outline" title={title} subtitle={description} />
      <AppButton label={busy ? '...' : actionLabel} disabled={busy} onPress={onPress} />
    </AppCard>
  );
}
