import { useCallback, useRef, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { SplashScreen } from '@/components/splash-screen';
import {
  useSmartBackHandler,
  useAuth,
  useAuthHandlers,
  useInitialUrl,
  useSessionNavigation,
  useWebViewNavigation,
  useWebViewErrors,
  useImagePicker,
} from '@/hooks';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // Image Picker (네이티브 이미지 선택)
  const { handleImagePickerRequest, ImagePickerSheet } = useImagePicker(webViewRef);

  // Auth Handlers (로그아웃, 네이티브 로그인)
  const { handleLogout, handleNativeLogin } = useAuthHandlers({
    webViewRef,
    signOut,
    signInWithGoogle,
  });

  // 세션 변경 감지 → 로그아웃 시 로그인 페이지 이동
  useSessionNavigation({
    session,
    isReady,
    isUrlInitialized,
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
    REQUEST_IMAGE_PICKER: (msg) => {
      const { requestId, source } = msg as { type: 'REQUEST_IMAGE_PICKER'; requestId: string; source: 'camera' | 'gallery' | 'both' };
      handleImagePickerRequest({ requestId, source });
    },
    // 인증 관련 메시지는 useAuth에서 처리
    WEB_READY: handleWebMessage,
    SESSION_SET: handleWebMessage,
    REQUEST_SESSION_REFRESH: handleWebMessage,
    SESSION_EXPIRED: handleWebMessage,
  }), [handleLogout, handleNativeLogin, handleImagePickerRequest, handleWebMessage]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message: WebToAppMessage = JSON.parse(event.nativeEvent.data);
      console.log('[WebView] Received message:', message.type, message);
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

  // 로딩 상태: 세션 체크 중 또는 최초 WebView 로딩 중
  const showLoading = !isReady || isInitialLoad;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBar} />

      {/* WebView는 항상 렌더링 (isReady 후) - 로딩 오버레이로 커버 */}
      {isReady && (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          userAgent={CHROME_USER_AGENT}
          {...WEBVIEW_BASE_PROPS}
          onLoadEnd={() => setIsInitialLoad(false)}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleLoadRequest}
          onNavigationStateChange={handleNavigation}
          onError={handleWebViewError}
          onHttpError={handleHttpError}
        />
      )}

      {/* 로딩 오버레이 - WebView 위에 표시 */}
      {showLoading && (
        <View style={styles.loadingOverlay}>
          <SplashScreen />
        </View>
      )}

      {/* Image Picker ActionSheet */}
      {ImagePickerSheet}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
