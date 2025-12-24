import { useCallback, RefObject } from 'react';
import { WebView } from 'react-native-webview';
import CookieManager from '@react-native-cookies/cookies';

import {
  LOGIN_ROUTE_INFO,
  getInitialUrl,
  getLoginUrl,
  type RouteInfo,
} from '@/lib/webview';

// ============================================================================
// Types
// ============================================================================

type UseAuthHandlersOptions = {
  webViewRef: RefObject<WebView | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  setUrl: (url: string) => void;
  setRouteInfo: (routeInfo: RouteInfo) => void;
};

type UseAuthHandlersResult = {
  handleLogout: () => Promise<void>;
  handleNativeLogin: () => Promise<void>;
};

// ============================================================================
// Hook
// ============================================================================

/**
 * WebView 인증 핸들러 (로그아웃, 네이티브 OAuth 로그인)
 */
export function useAuthHandlers({
  webViewRef,
  signOut,
  signInWithGoogle,
  setUrl,
  setRouteInfo,
}: UseAuthHandlersOptions): UseAuthHandlersResult {
  /**
   * 로그아웃 처리
   * 1. 네이티브 Supabase 세션 로그아웃 (SecureStore 토큰 삭제)
   * 2. 쿠키 삭제 시도 (레거시 호환)
   * 3. 로그인 페이지로 이동
   */
  const handleLogout = useCallback(async () => {
    console.log('[WebView] Logout received, clearing session...');

    // 1. 네이티브 Supabase 세션 로그아웃
    await signOut();

    // 2. 쿠키 삭제 시도 (레거시 호환)
    try {
      const webUrl = getInitialUrl();
      const cookies = await CookieManager.get(webUrl);

      for (const cookieName of Object.keys(cookies)) {
        await CookieManager.clearByName(webUrl, cookieName);
      }
    } catch {
      console.log('[WebView] Cookie clear skipped (Android)');
    }

    // 3. 로그인 페이지로 이동
    setUrl(getLoginUrl());
    setRouteInfo(LOGIN_ROUTE_INFO);

    console.log('[WebView] Redirecting to login...');
  }, [signOut, setUrl, setRouteInfo]);

  /**
   * 네이티브 OAuth 로그인 (웹에서 REQUEST_LOGIN 수신 시)
   */
  const handleNativeLogin = useCallback(async () => {
    console.log('[WebView] Native login requested from web');
    try {
      await signInWithGoogle();
      // 로그인 성공 시 onAuthStateChange가 토큰을 WebView에 전달
    } catch (error) {
      console.error('[WebView] Native login failed:', error);
      // 에러 시 웹에 알림 (로딩 해제)
      webViewRef.current?.injectJavaScript(`
        window.dispatchEvent(new CustomEvent('app-command', {
          detail: { type: 'LOGIN_ERROR', error: 'Native login failed' }
        }));
        true;
      `);
    }
  }, [signInWithGoogle, webViewRef]);

  return { handleLogout, handleNativeLogin };
}
