import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdPolicyNotice } from '@/components/ads/AdPolicyNotice';
import { useAdsAccess } from '@/hooks/useAdsAccess';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useI18n } from '@/hooks/useI18n';
import type { PremiumFeature } from '@/types/ads';

const features: Array<{ key: PremiumFeature; label: string }> = [
  { key: 'advanced_pdf_reports', label: 'PDF avancado' },
  { key: 'csv_export', label: 'Exportacao CSV' },
  { key: 'barcode_scanner', label: 'Leitor de codigo' },
  { key: 'encrypted_backup', label: 'Backup criptografado' },
  { key: 'profit_analysis', label: 'Analise de lucro' },
  { key: 'advanced_history', label: 'Historico avancado' },
  { key: 'unlimited_categories', label: 'Categorias ilimitadas' },
  { key: 'batch_expiration_control', label: 'Lote e validade' },
];

export default function PremiumScreen() {
  const { t } = useI18n();
  const { isTemporaryAdFree, adFreeExpiresAt, grantTemporaryAdFree, grantFeatureUnlock, error: adsError } = useAdsAccess();
  const [selectedFeature, setSelectedFeature] = useState<PremiumFeature>('advanced_pdf_reports');
  const { state, refreshAccess, error: featureError } = useFeatureGate(selectedFeature);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();

  const handleAdFree = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setActionError(undefined);
    try {
      const result = await grantTemporaryAdFree();
      if (result.status === 'failed') {
        setActionError(result.reason);
      }
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel liberar a recompensa.');
    } finally {
      setBusy(false);
    }
  };

  const handleFeatureUnlock = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setActionError(undefined);
    try {
      const result = await grantFeatureUnlock(selectedFeature);
      if (result.status === 'failed') {
        setActionError(result.reason);
      }
      await refreshAccess(selectedFeature);
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : 'Nao foi possivel liberar o recurso.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('premium.title')} subtitle={t('premium.subtitle')} />

      <AdPolicyNotice
        title={t('ads.premiumTitle')}
        body={t('ads.premiumBody')}
        icon="ribbon-outline"
        tone="reward"
      />

      {actionError || adsError || featureError ? (
        <EmptyState title="Recompensas" description={actionError ?? adsError ?? featureError ?? 'Nao foi possivel carregar recompensas.'} />
      ) : null}

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Remover anuncios temporariamente</AppCard.Title>
        <AppCard.Text>Assista a um anuncio e fique sem banners por um periodo curto.</AppCard.Text>
        <StatusBadge tone={isTemporaryAdFree ? 'success' : 'info'} label={isTemporaryAdFree ? `ate ${adFreeExpiresAt ?? 'agora'}` : 'ativo'} />
        <AppButton label={busy ? '...' : 'Assistir anuncio'} disabled={busy} onPress={() => void handleAdFree()} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Desbloquear recurso</AppCard.Title>
        <AppCard.Text>Escolha um recurso avancado para liberar por tempo ou uso limitado.</AppCard.Text>
        {features.map((feature) => (
          <AppButton
            key={feature.key}
            label={feature.label}
            variant={selectedFeature === feature.key ? 'primary' : 'ghost'}
            disabled={busy}
            onPress={() => setSelectedFeature(feature.key)}
          />
        ))}
        <StatusBadge tone={state?.allowed ? 'success' : 'warning'} label={state?.allowed ? 'Liberado' : 'Bloqueado'} />
        <AppButton label={busy ? '...' : 'Assistir e liberar'} variant="secondary" disabled={busy} onPress={() => void handleFeatureUnlock()} />
      </AppCard>
    </ScreenContainer>
  );
}
