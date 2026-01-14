import { useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
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
  // Message Handler (switch-case로 타입 내로잉)
  // ─────────────────────────────────────────────────────────────────────────

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg: WebToAppMessage = JSON.parse(event.nativeEvent.data);

      switch (msg.type) {
        // 라우트 → 실제 목적지 도착 시 스플래시 숨김
        case 'ROUTE_INFO':
          setRouteInfo(msg.payload);
          if (msg.payload.path !== '/app-init') {
            setIsInitialLoad(false);
          }
          break;

        // 인증 요청
        case 'LOGOUT':
          handleLogout();
          break;
        case 'REQUEST_LOGIN':
          handleNativeLogin();
          break;

        // 이미지 선택
        case 'REQUEST_IMAGE_PICKER':
          handleImagePickerRequest({
            requestId: msg.requestId,
            source: msg.source,
          });
          break;

        // 웹 준비 (스플래시는 ROUTE_INFO에서 처리)
        case 'WEB_READY':
          handleWebMessage(msg);
          break;

        // 세션 (useAuth 위임)
        case 'SESSION_SET':
        case 'REQUEST_SESSION_REFRESH':
        case 'SESSION_EXPIRED':
          handleWebMessage(msg);
          break;
      }
    } catch {
      // Ignore parse errors
    }
  }, [handleLogout, handleNativeLogin, handleImagePickerRequest, handleWebMessage]);

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation & Error Handlers (extracted to hooks)
  // ─────────────────────────────────────────────────────────────────────────

  const { handleLoadRequest, handleNavigation } = useWebViewNavigation({
    setUrl,
    setRouteInfo,
  });

  const { handleWebViewError, handleHttpError } = useWebViewErrors({
    webViewRef,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  // 로딩 상태: 세션 체크 중 또는 최초 WebView 로딩 중
  const showLoading = !isReady || isInitialLoad;

  // 로딩 완료 시 네이티브 스플래시 숨기기
  useEffect(() => {
    if (!showLoading) {
      ExpoSplashScreen.hideAsync();
    }
  }, [showLoading]);

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
          // onLoadEnd 대신 WEB_READY 메시지로 스플래시 숨김 (흰 화면 방지)
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
