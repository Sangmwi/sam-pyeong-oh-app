import type { WebViewProps } from 'react-native-webview';

// ============================================================================
// WebView Base Configuration
// ============================================================================

/**
 * WebView 기본 속성
 * 디버그, 스크롤, OAuth/쿠키, 코어 기능, 로딩 관련 설정
 */
export const WEBVIEW_BASE_PROPS: Partial<WebViewProps> = {
  // Debug
  webviewDebuggingEnabled: __DEV__,

  // Scroll behavior
  bounces: false,
  overScrollMode: 'never',

  // OAuth & Cookie
  originWhitelist: ['*'],
  thirdPartyCookiesEnabled: true,
  sharedCookiesEnabled: true,
  mixedContentMode: 'compatibility',
  setSupportMultipleWindows: false,

  // Core features
  javaScriptEnabled: true,
  domStorageEnabled: true,
  cacheEnabled: true,
  mediaPlaybackRequiresUserAction: false,
  scalesPageToFit: true,

  // Loading
  startInLoadingState: true,
} as const;
