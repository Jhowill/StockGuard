import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PremiumLock } from '@/components/ui/PremiumLock';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdPolicyNotice } from '@/components/ads/AdPolicyNotice';
import { useAdsAccess } from '@/hooks/useAdsAccess';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useI18n } from '@/hooks/useI18n';
import type { PremiumFeature } from '@/types/ads';

const features: Array<{ key: PremiumFeature; label: string; description: string }> = [
  { key: 'advanced_pdf_reports', label: 'PDF avancado', description: 'Gere relatórios mais completos.' },
  { key: 'csv_export', label: 'Exportacao CSV', description: 'Leve dados para planilhas rapidamente.' },
  { key: 'barcode_scanner', label: 'Leitor de codigo', description: 'Facilita a leitura em campo.' },
  { key: 'encrypted_backup', label: 'Backup criptografado', description: 'Proteja seus arquivos locais.' },
  { key: 'profit_analysis', label: 'Analise de lucro', description: 'Veja margens com mais clareza.' },
  { key: 'advanced_history', label: 'Historico avancado', description: 'Acesse uma trilha mais detalhada.' },
  { key: 'unlimited_categories', label: 'Categorias ilimitadas', description: 'Organize sem limites extras.' },
  { key: 'batch_expiration_control', label: 'Lote e validade', description: 'Controle itens com mais rigor.' },
];

export default function PremiumScreen() {
  const { t } = useI18n();
  const { palette } = useAppTheme();
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
      <AppHeader
        title={t('premium.title')}
        subtitle={t('premium.subtitle')}
        variant="page"
        onBackPress={() => router.back()}
        rightAction={<Ionicons name="ribbon-outline" size={22} color={palette.primary} />}
      />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="sparkles-outline" size={24} color={palette.premium} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Ganhe recompensas com fluxo visual simples</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>A pagina destaca os recursos liberados por anuncio e mantém tudo fácil de entender.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone={isTemporaryAdFree ? 'success' : 'info'} label={isTemporaryAdFree ? `ate ${adFreeExpiresAt ?? 'agora'}` : 'anuncios ativos'} />
          <StatusBadge tone={state?.allowed ? 'success' : 'warning'} label={state?.allowed ? 'Liberado' : 'Bloqueado'} />
        </View>
      </AppCard>

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
        <View style={styles.featureGrid}>
          {features.map((feature) => (
            <AppCard
              key={feature.key}
              onPress={() => setSelectedFeature(feature.key)}
              variant={selectedFeature === feature.key ? 'hero' : 'default'}
              style={styles.featureCard}
            >
              <AppCard.Row
                icon="sparkles-outline"
                title={feature.label}
                subtitle={feature.description}
                trailing={<StatusBadge tone={selectedFeature === feature.key ? 'success' : 'info'} label={selectedFeature === feature.key ? 'Selecionado' : 'Escolher'} />}
              />
            </AppCard>
          ))}
        </View>
        <StatusBadge tone={state?.allowed ? 'success' : 'warning'} label={state?.allowed ? 'Liberado' : 'Bloqueado'} />
        <AppButton label={busy ? '...' : 'Assistir e liberar'} variant="secondary" disabled={busy} onPress={() => void handleFeatureUnlock()} />
      </AppCard>
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
  featureGrid: {
    gap: 10,
  },
  featureCard: {
    padding: 14,
  },
});
