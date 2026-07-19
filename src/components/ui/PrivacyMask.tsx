import { useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet, Text, View } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  disableAppSwitcherProtectionAsync,
  enableAppSwitcherProtectionAsync,
} from 'expo-screen-capture';
import { useAppState } from '@/state/app-state';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/i18n';

function PrivacyCaptureGuard() {
  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        if (active && Platform.OS === 'ios') {
          await enableAppSwitcherProtectionAsync(0.55);
        }
      } catch {
        // If app-switcher protection is unavailable, keep the visual mask only.
      }
    })();

    return () => {
      active = false;
      void (async () => {
        if (Platform.OS === 'ios') {
          try {
            await disableAppSwitcherProtectionAsync();
          } catch {
            // Best-effort cleanup.
          }
        }
      })();
    };
  }, []);

  return null;
}

export function PrivacyMask() {
  const { palette } = useAppTheme();
  const { t } = useI18n();
  const { isReady } = useAppState();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  const visible = !isReady || appState !== 'active';

  if (!visible) {
    return <PrivacyCaptureGuard />;
  }

  return (
    <>
      <PrivacyCaptureGuard />
      <View
        pointerEvents="auto"
        style={[
          styles.root,
          {
            backgroundColor: palette.background,
          },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              shadowColor: palette.shadow,
            },
          ]}
        >
          <View style={[styles.iconShell, { backgroundColor: palette.surfaceMuted }]}>
            <Ionicons name="lock-closed-outline" size={28} color={palette.primary} />
          </View>
          <Text style={[styles.title, { color: palette.text }]}>{t('common.privacyMaskTitle')}</Text>
          <Text style={[styles.body, { color: palette.textMuted }]}>{t('common.privacyMaskBody')}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  iconShell: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
