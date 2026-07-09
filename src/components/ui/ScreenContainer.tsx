import { ScrollView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

export function ScreenContainer({ children, scroll = false, padded = false }: Props) {
  const { palette } = useAppTheme();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, padded && styles.padded]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
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
  content: {
    flexGrow: 1,
    gap: 16,
  },
  padded: {
    padding: 16,
  },
});
