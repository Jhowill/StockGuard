import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdsAccess } from '@/hooks/useAdsAccess';
import { useFeatureGate } from '@/hooks/useFeatureGate';
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
  const { isTemporaryAdFree, adFreeExpiresAt, grantTemporaryAdFree, grantFeatureUnlock } = useAdsAccess();
  const [selectedFeature, setSelectedFeature] = useState<PremiumFeature>('advanced_pdf_reports');
  const { state } = useFeatureGate(selectedFeature);

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Recompensas e premium" subtitle="Libere recursos temporariamente por recompensa." />

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Remover anuncios temporariamente</AppCard.Title>
        <AppCard.Text>Assista a um anuncio e fique sem banners por um periodo curto.</AppCard.Text>
        <StatusBadge tone={isTemporaryAdFree ? 'success' : 'info'} label={isTemporaryAdFree ? `ate ${adFreeExpiresAt ?? 'agora'}` : 'ativo'} />
        <AppButton label="Assistir anuncio" onPress={() => void grantTemporaryAdFree()} />
      </AppCard>

      <AppCard style={{ gap: 12 }}>
        <AppCard.Title>Desbloquear recurso</AppCard.Title>
        <AppCard.Text>Escolha um recurso avancado para liberar por tempo ou uso limitado.</AppCard.Text>
        {features.map((feature) => (
          <AppButton
            key={feature.key}
            label={feature.label}
            variant={selectedFeature === feature.key ? 'primary' : 'ghost'}
            onPress={() => setSelectedFeature(feature.key)}
          />
        ))}
        <StatusBadge tone={state?.allowed ? 'success' : 'warning'} label={state?.allowed ? 'Liberado' : 'Bloqueado'} />
        <AppButton label="Assistir e liberar" variant="secondary" onPress={() => void grantFeatureUnlock(selectedFeature)} />
      </AppCard>
    </ScreenContainer>
  );
}
