import { Redirect } from 'expo-router';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useAppState } from '@/state/app-state';

export default function Index() {
  const { hasCompletedOnboarding, isReady } = useAppState();
  const { palette } = useAppTheme();
  const { t } = useI18n();

  if (isReady) {
    return (
      <Redirect
        href={hasCompletedOnboarding ? '/(tabs)' : '/onboarding'}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <View style={[styles.glow, styles.glowTop, { backgroundColor: palette.primary }]} />
      <View style={[styles.glow, styles.glowBottom, { backgroundColor: palette.premium }]} />

      <View style={styles.center}>
        <View style={[styles.logoShell, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <Image
            source={require('../icons/android/expo/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: palette.text }]}>{t('splash.title')}</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>{t('splash.subtitle')}</Text>

        <View style={[styles.loadingCard, { borderColor: palette.border, backgroundColor: palette.surface }]}>
          <ActivityIndicator color={palette.primary} />
          <Text style={[styles.loadingText, { color: palette.textMuted }]}>{t('splash.loading')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  center: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 18,
  },
  logoShell: {
    width: 136,
    height: 136,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  logo: {
    width: 110,
    height: 110,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  loadingCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.12,
  },
  glowTop: {
    width: 240,
    height: 240,
    top: -80,
    right: -80,
  },
  glowBottom: {
    width: 280,
    height: 280,
    bottom: -100,
    left: -120,
  },
});
