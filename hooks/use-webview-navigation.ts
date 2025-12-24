/**
 * WebView 네비게이션 핸들러 훅
 *
 * URL 로드 요청 처리 및 네비게이션 상태 추적을 담당합니다.
 * - intent:// 스킴 차단
 * - localhost → 에뮬레이터 IP 변환
 * - 경로 정보 추출 및 탭 라우트 판단
 */

import { useCallback } from 'react';
import type { WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import {
  type RouteInfo,
  isTabRoute,
  extractPath,
  toEmulatorUrl,
  hasLocalhost,
} from '@/lib/webview';

// ============================================================================
// Types
// ============================================================================

interface UseWebViewNavigationParams {
  setUrl: (url: string) => void;
  setRouteInfo: React.Dispatch<React.SetStateAction<RouteInfo>>;
}

interface UseWebViewNavigationResult {
  /** URL 로드 요청 핸들러 (intent:// 차단, localhost 변환) */
  handleLoadRequest: (request: ShouldStartLoadRequest) => boolean;
  /** 네비게이션 상태 변경 핸들러 */
  handleNavigation: (navState: WebViewNavigation) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useWebViewNavigation({
  setUrl,
  setRouteInfo,
}: UseWebViewNavigationParams): UseWebViewNavigationResult {
  /**
   * URL 로드 요청 처리
   * - intent:// 스킴 차단
   * - localhost → 에뮬레이터 IP 변환
   */
  const handleLoadRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      const { url: requestUrl } = request;

      // Block intent:// scheme
      if (requestUrl.startsWith('intent://')) return false;

      // Convert localhost to emulator IP
      if (hasLocalhost(requestUrl)) {
        setUrl(toEmulatorUrl(requestUrl));
        return false;
      }

      return true;
    },
    [setUrl]
  );

  /**
   * 네비게이션 상태 변경 처리
   * - 경로 정보 추출
   * - 탭 라우트 판단
   * - 뒤로가기 가능 여부 결정
   */
  const handleNavigation = useCallback(
    (navState: WebViewNavigation) => {
      const path = extractPath(navState.url);
      const onTabRoute = isTabRoute(path);
      const isHome = path === '/';

      setRouteInfo((prev) => ({
        ...prev,
        path,
        isTabRoute: onTabRoute,
        isHome,
        // 홈에서는 뒤로가기 불가 (앱 종료로 이어짐), 그 외에는 WebView 상태 따름
        canGoBack: navState.canGoBack && !isHome,
      }));

      if (hasLocalhost(navState.url)) {
        setUrl(toEmulatorUrl(navState.url));
      }
    },
    [setUrl, setRouteInfo]
  );

  return {
    handleLoadRequest,
    handleNavigation,
  };
}
