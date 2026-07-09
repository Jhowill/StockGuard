import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
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
  const [selected, setSelected] = useState<UsageType>(settings?.usageType ?? 'other');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const canContinue = useMemo(() => Boolean(selected), [selected]);

  return (
    <ScreenContainer scroll padded>
      <AppHeader title="Como voce usa o app?" subtitle="Isso ajuda a montar a experiencia inicial." />

      {options.map((option) => (
        <AppCard
          key={option.value}
          onPress={() => setSelected(option.value)}
          variant={selected === option.value ? 'hero' : 'default'}
        >
          <AppCard.Row icon="ellipse-outline" title={option.label} subtitle={option.description} />
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
