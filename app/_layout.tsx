import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/state/app-state';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding/index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="products/[id]" />
            <Stack.Screen name="products/new" />
            <Stack.Screen name="products/movement" />
            <Stack.Screen name="categories/index" />
            <Stack.Screen name="suppliers/index" />
            <Stack.Screen name="premium" />
            <Stack.Screen name="backup" />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
