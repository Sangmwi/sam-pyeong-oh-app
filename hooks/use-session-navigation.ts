import { useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';

import {
  LOGIN_ROUTE_INFO,
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
  url: string;
  setUrl: (url: string) => void;
  setRouteInfo: (routeInfo: RouteInfo) => void;
};

// ============================================================================
// Hook
// ============================================================================

/**
 * 세션 변경 감지 → 로그아웃 시 로그인 페이지로 이동
 *
 * 로그인 성공 시 홈 리다이렉트는 웹(use-webview-bridge.ts)에서 처리합니다.
 * 이 훅은 로그아웃 시에만 앱에서 WebView URL을 변경합니다.
 */
export function useSessionNavigation({
  session,
  isReady,
  isUrlInitialized,
  url,
  setUrl,
  setRouteInfo,
}: UseSessionNavigationOptions): void {
  // 이전 세션 상태 추적 (로그아웃 감지용)
  const prevSessionRef = useRef<Session | null>(null);

  useEffect(() => {
    if (!isReady || !isUrlInitialized) return;

    const wasLoggedIn = !!prevSessionRef.current;
    const isLoggedIn = !!session;

    // 로그아웃 감지: 세션 있음 → 세션 없음
    if (wasLoggedIn && !isLoggedIn) {
      console.log('[WebView] Session cleared, redirecting to login');
      if (!url.includes('/login')) {
        setUrl(getLoginUrl());
        setRouteInfo(LOGIN_ROUTE_INFO);
      }
    }

    prevSessionRef.current = session;
  }, [session, isReady, isUrlInitialized, url, setUrl, setRouteInfo]);
}
