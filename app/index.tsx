import { useCallback, useRef, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { LoadingIndicator } from '@/components/loading-indicator';
import { SplashScreen } from '@/components/splash-screen';
import { useSmartBackHandler } from '@/hooks/use-smart-back-handler';
import { useAuth } from '@/hooks/use-auth';
import { useAuthHandlers } from '@/hooks/use-auth-handlers';
import { useInitialUrl } from '@/hooks/use-initial-url';
import { useSessionNavigation } from '@/hooks/use-session-navigation';
import { useWebViewNavigation } from '@/hooks/use-webview-navigation';
import { useWebViewErrors } from '@/hooks/use-webview-errors';
import { useTheme } from '@/lib/theme';
import {
  CHROME_USER_AGENT,
  DEFAULT_ROUTE_INFO,
  WEBVIEW_BASE_PROPS,
  type RouteInfo,
  type WebToAppMessage,
} from '@/lib/webview';

// ============================================================================
// Main Screen Component
// ============================================================================

export default function WebViewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const webViewRef = useRef<WebView>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(DEFAULT_ROUTE_INFO);

  // 네이티브 인증 상태 관리 (WebView에 토큰 자동 전달)
  const {
    session,
    isReady,
    signOut,
    signInWithGoogle,
    handleWebMessage,
  } = useAuth(webViewRef);

  // 세션 로드 완료 후 초기 URL 결정
  const { url, setUrl, isUrlInitialized } = useInitialUrl(session, isReady);

  useSmartBackHandler({ webViewRef, routeInfo });

  // Auth Handlers (로그아웃, 네이티브 로그인)
  const { handleLogout, handleNativeLogin } = useAuthHandlers({
    webViewRef,
    signOut,
    signInWithGoogle,
    setUrl,
    setRouteInfo,
  });

  // 세션 변경 감지 → URL 네비게이션 처리
  useSessionNavigation({
    session,
    isReady,
    isUrlInitialized,
    routeInfo,
    url,
    setUrl,
    setRouteInfo,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Message Handlers
  // ─────────────────────────────────────────────────────────────────────────

  // 선언적 메시지 핸들러 맵
  const messageHandlers = useMemo<Record<WebToAppMessage['type'], (msg: WebToAppMessage) => void>>(() => ({
    ROUTE_INFO: (msg) => setRouteInfo((msg as { type: 'ROUTE_INFO'; payload: RouteInfo }).payload),
    LOGOUT: () => handleLogout(),
    REQUEST_LOGIN: () => handleNativeLogin(),
    // 인증 관련 메시지는 useAuth에서 처리
    WEB_READY: handleWebMessage,
    SESSION_SET: handleWebMessage,
    REQUEST_SESSION_REFRESH: handleWebMessage,
    SESSION_EXPIRED: handleWebMessage,
  }), [handleLogout, handleNativeLogin, handleWebMessage]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message: WebToAppMessage = JSON.parse(event.nativeEvent.data);
      messageHandlers[message.type]?.(message);
    } catch {
      // Ignore parse errors
    }
  }, [messageHandlers]);

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation & Error Handlers (extracted to hooks)
  // ─────────────────────────────────────────────────────────────────────────

  const { handleLoadRequest, handleNavigation } = useWebViewNavigation({
    setUrl,
    setRouteInfo,
  });

  const { handleWebViewError, handleHttpError } = useWebViewErrors({
    webViewRef,
    setUrl,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBar} />
      {!isReady ? (
        <SplashScreen />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          userAgent={CHROME_USER_AGENT}
          {...WEBVIEW_BASE_PROPS}
          renderLoading={LoadingIndicator}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleLoadRequest}
          onNavigationStateChange={handleNavigation}
          onError={handleWebViewError}
          onHttpError={handleHttpError}
        />
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
