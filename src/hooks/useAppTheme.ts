import { useColorScheme } from 'react-native';
import { useAppState } from '@/state/app-state';
import { themeTokens } from '@/theme';

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const { theme } = useAppState();
  const mode = theme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme;

  return {
    mode,
    palette: mode === 'dark' ? themeTokens.dark : themeTokens.light,
  };
}
