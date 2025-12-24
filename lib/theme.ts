import { useColorScheme } from 'react-native';

// ============================================================================
// WebView Theme Configuration
// ============================================================================

/**
 * 공통 색상
 */
export const COLORS = {
  primary: '#22c55e', // green-500 (웹과 동일)
  primaryLight: 'rgba(34, 197, 94, 0.2)', // primary/20
  primaryMedium: 'rgba(34, 197, 94, 0.15)', // primary/15
  primarySubtle: 'rgba(34, 197, 94, 0.1)', // primary/10
  textMuted: '#94a3b8', // slate-400
  textMutedDark: '#64748b', // slate-500
} as const;

/**
 * 웹 테마와 일치하는 네이티브 색상
 */
export const WEBVIEW_THEME = {
  light: {
    background: '#f8faf8', // 웹 라이트모드 배경
    statusBar: 'dark' as const,
    text: '#0f172a', // slate-900
    textMuted: COLORS.textMutedDark,
  },
  dark: {
    background: '#0f172a', // 웹 다크모드 배경 (slate-900)
    statusBar: 'light' as const,
    text: '#f8fafc', // slate-50
    textMuted: COLORS.textMuted,
  },
} as const;

export type ThemeMode = keyof typeof WEBVIEW_THEME;
export type Theme = (typeof WEBVIEW_THEME)[ThemeMode];

// ============================================================================
// Hook
// ============================================================================

/**
 * 현재 시스템 테마에 맞는 WebView 테마 반환
 */
export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return isDark ? WEBVIEW_THEME.dark : WEBVIEW_THEME.light;
}
