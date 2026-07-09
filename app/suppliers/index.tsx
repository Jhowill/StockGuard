import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { demoSuppliers } from '@/data/demo';
import { useI18n } from '@/hooks/useI18n';

export default function SuppliersScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('suppliers.title')} subtitle={t('suppliers.subtitle')} />

      {demoSuppliers.length === 0 ? (
        <EmptyState title={t('suppliers.emptyTitle')} description={t('suppliers.emptyBody')} />
      ) : (
        demoSuppliers.map((supplier) => (
          <AppCard key={supplier.id}>
            <AppCard.Row icon="business-outline" title={supplier.name} subtitle={supplier.phone} />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
