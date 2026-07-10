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
import { useSettings } from '@/hooks/useSettings';
import type { UsageType } from '@/types/settings';

const options: Array<{ value: UsageType; label: string; description: string }> = [
  { value: 'store', label: 'Loja', description: 'Vendas e reposicao de produtos.' },
  { value: 'workshop', label: 'Oficina', description: 'Pecas, ferramentas e consumo.' },
  { value: 'personal', label: 'Pessoal', description: 'Itens e organizacao domestica.' },
  { value: 'service', label: 'Servico', description: 'Materiais usados em atendimento.' },
  { value: 'other', label: 'Outro', description: 'Uso geral e personalizado.' },
];

export default function UsageTypeScreen() {
  const { settings, saveSettings } = useSettings();
  const { palette } = useAppTheme();
  const [selected, setSelected] = useState<UsageType>(settings?.usageType ?? 'other');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const canContinue = useMemo(() => Boolean(selected), [selected]);

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Como voce usa o app?" subtitle="Isso ajuda a montar a experiencia inicial." variant="page" onBackPress={() => router.back()} />

      <AppCard variant="hero" style={styles.heroCard}>
        <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="layers-outline" size={24} color={palette.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Escolha a rotina que mais combina com voce</Text>
          <Text style={[styles.heroBody, { color: palette.textMuted }]}>Essa escolha ajuda a montar o fluxo inicial do app sem alterar nenhuma função.</Text>
        </View>
        <View style={styles.heroBadges}>
          <StatusBadge tone="info" label="Etapa 1 de 4" />
        </View>
      </AppCard>

      <AppCard.Text>Escolha a rotina que mais se aproxima do seu uso real.</AppCard.Text>

      {options.map((option) => (
        <AppCard
          key={option.value}
          onPress={() => setSelected(option.value)}
          variant={selected === option.value ? 'hero' : 'default'}
        >
          <AppCard.Row icon="ellipse-outline" title={option.label} subtitle={option.description} trailing={<StatusBadge tone={selected === option.value ? 'success' : 'info'} label={selected === option.value ? 'Selecionado' : 'Escolher'} />} />
        </AppCard>
      ))}

      <AppButton
        label={saving ? '...' : 'Proximo'}
        disabled={saving}
        onPress={async () => {
          if (!canContinue || saving) return;

          setSaving(true);
          setError(undefined);
          try {
            await saveSettings({ usageType: selected });
            router.push('/onboarding/preferences');
          } catch {
            setError('Nao foi possivel salvar esta etapa.');
          } finally {
            setSaving(false);
          }
        }}
      />
      {error ? <AppCard><AppCard.Text>{error}</AppCard.Text></AppCard> : null}
      <AppButton label="Voltar" variant="ghost" onPress={() => router.back()} />
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
