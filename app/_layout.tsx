import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/state/app-state';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppState } from '@/state/app-state';

function AppStatusBar() {
  const { mode } = useAppTheme();

  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}

function AppShell() {
  const pathname = usePathname();
  const { isReady, hasCompletedOnboarding, appLockEnabled, isUnlocked } = useAppState();

  if (hasCompletedOnboarding && appLockEnabled && !isUnlocked && pathname !== '/unlock') {
    return <Redirect href="/unlock" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="unlock" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="onboarding/usage-type" />
      <Stack.Screen name="onboarding/preferences" />
      <Stack.Screen name="onboarding/security" />
      <Stack.Screen name="onboarding/done" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="products/[id]" />
      <Stack.Screen name="products/edit" />
      <Stack.Screen name="products/new" />
      <Stack.Screen name="products/movement" />
      <Stack.Screen name="categories/index" />
      <Stack.Screen name="suppliers/index" />
      <Stack.Screen name="security/pin" />
      <Stack.Screen name="security/biometric" />
      <Stack.Screen name="premium" />
      <Stack.Screen name="backup" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AppStatusBar />
          <AppShell />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
