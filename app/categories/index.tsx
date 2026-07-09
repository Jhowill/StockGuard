import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { demoCategories } from '@/data/demo';
import { useI18n } from '@/hooks/useI18n';

export default function CategoriesScreen() {
  const { t } = useI18n();

  return (
    <ScreenContainer scroll padded>
      <AppHeader title={t('categories.title')} subtitle={t('categories.subtitle')} />

      {demoCategories.length === 0 ? (
        <EmptyState title={t('categories.emptyTitle')} description={t('categories.emptyBody')} />
      ) : (
        demoCategories.map((category) => (
          <AppCard key={category.id}>
            <AppCard.Row icon={category.icon} title={category.name} subtitle={category.description} />
          </AppCard>
        ))
      )}
    </ScreenContainer>
  );
}
