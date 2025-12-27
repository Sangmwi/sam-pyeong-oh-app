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
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,

  // Pinch zoom - 비활성화 (네이티브 앱 UX)
  setBuiltInZoomControls: false,
  scalesPageToFit: false,

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

  // Loading - renderLoading 대신 오버레이 방식 사용
  startInLoadingState: false,
} as const;
