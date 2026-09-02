import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function ScreenContainer({ children, scroll = false, padded = false, onRefresh, refreshing = false }: Props) {
  const { palette } = useAppTheme();

  const content = scroll ? (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, padded && styles.padded]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} colors={[palette.primary]} /> : undefined}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  ) : (
    <View style={[styles.content, padded && styles.padded]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 16,
  },
  padded: {
    padding: 16,
    paddingBottom: 28,
  },
});
