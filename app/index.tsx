import { Redirect } from 'expo-router';
import { useAppState } from '@/state/app-state';

export default function Index() {
  const { hasCompletedOnboarding } = useAppState();

  return (
    <Redirect
      href={hasCompletedOnboarding ? '/(tabs)' : '/onboarding'}
    />
  );
}
