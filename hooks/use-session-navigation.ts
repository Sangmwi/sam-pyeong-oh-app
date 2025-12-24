import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

import {
  DEFAULT_ROUTE_INFO,
  LOGIN_ROUTE_INFO,
  getInitialUrl,
  getLoginUrl,
  type RouteInfo,
} from '@/lib/webview';

// ============================================================================
// Types
// ============================================================================

type UseSessionNavigationOptions = {
  session: Session | null;
  isReady: boolean;
  isUrlInitialized: boolean;
  routeInfo: RouteInfo;
  url: string;
  setUrl: (url: string) => void;
  setRouteInfo: (routeInfo: RouteInfo) => void;
};

// ============================================================================
// Hook
// ============================================================================

/**
 * 세션 변경 감지 → URL 네비게이션 처리
 * (토큰 전달은 useAuth의 onAuthStateChange에서 자동 처리)
 */
export function useSessionNavigation({
  session,
  isReady,
  isUrlInitialized,
  routeInfo,
  url,
  setUrl,
  setRouteInfo,
}: UseSessionNavigationOptions): void {
  useEffect(() => {
    if (!isReady || !isUrlInitialized) return;

    if (session) {
      // 로그인됨: 로그인 페이지면 홈으로 이동
      if (routeInfo.path === '/login' || url.includes('/login')) {
        console.log('[WebView] Redirecting to home after login');
        setUrl(getInitialUrl());
        setRouteInfo(DEFAULT_ROUTE_INFO);
      }
    } else {
      // 로그아웃됨: 로그인 페이지로 이동
      console.log('[WebView] Session cleared, redirecting to login');
      if (!url.includes('/login')) {
        setUrl(getLoginUrl());
        setRouteInfo(LOGIN_ROUTE_INFO);
      }
    }
  }, [session, isReady, isUrlInitialized, routeInfo.path, url, setUrl, setRouteInfo]);
}
