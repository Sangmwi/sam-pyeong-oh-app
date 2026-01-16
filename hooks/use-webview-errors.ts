/**
 * WebView 에러 핸들러 훅
 *
 * WebView 연결 실패 및 HTTP 에러를 처리합니다.
 * - 연결 에러: 커스텀 에러 모달로 표시
 * - HTTP 에러: 5xx만 표시, 4xx(인증 에러)는 웹에서 처리하도록 무시
 * - 자동 복구: foreground 복귀 시 자동 reload
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type WebView from 'react-native-webview';
import type { WebViewError } from '@/components/error-modal';

// ============================================================================
// Types
// ============================================================================

interface WebViewErrorEvent {
  nativeEvent: {
    description?: string;
    code?: number;
    url?: string;
  };
}

interface HttpErrorEvent {
  nativeEvent: {
    url?: string;
    statusCode?: number;
    description?: string;
  };
}

interface UseWebViewErrorsParams {
  webViewRef: React.RefObject<WebView | null>;
}

interface UseWebViewErrorsResult {
  /** WebView 연결 에러 핸들러 */
  handleWebViewError: (event: WebViewErrorEvent) => void;
  /** HTTP 에러 핸들러 */
  handleHttpError: (event: HttpErrorEvent) => void;
  /** 현재 에러 상태 (모달에서 사용) */
  error: WebViewError | null;
  /** 에러 상태 초기화 */
  clearError: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useWebViewErrors({
  webViewRef,
}: UseWebViewErrorsParams): UseWebViewErrorsResult {
  // 에러 상태 (모달에서 사용)
  const [error, setError] = useState<WebViewError | null>(null);

  // 에러 발생 여부 추적 (foreground 복귀 시 자동 reload용)
  const hasError = useRef(false);
  const appState = useRef(AppState.currentState);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
    hasError.current = false;
  }, []);

  // AppState 리스너 - foreground 복귀 시 에러 상태면 자동 reload
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      // background/inactive → active 전환 감지
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (hasError.current) {
          console.log('[WebView] 🔄 Auto-reloading on foreground return');
          webViewRef.current?.reload();
          // 자동 reload 후 에러 클리어 (성공하면 에러 모달 안 뜸)
          hasError.current = false;
          setError(null);
        }
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [webViewRef]);

  /**
   * WebView 연결 에러 처리
   * 네트워크 연결 실패, 서버 연결 불가 등
   */
  const handleWebViewError = useCallback(
    (syntheticEvent: WebViewErrorEvent) => {
      const { description, code, url: errorUrl } = syntheticEvent.nativeEvent;

      console.log('[WebView] 🔴 Connection error:', { description, code, errorUrl });

      // 에러 플래그 설정 (foreground 복귀 시 자동 reload용)
      hasError.current = true;

      // 에러 상태 설정 (모달 표시)
      setError({
        type: 'connection',
        code,
        description,
        url: errorUrl,
      });
    },
    []
  );

  /**
   * HTTP 에러 처리
   * - 401, 403: 웹에서 처리 (리다이렉트)
   * - 5xx: 서버 오류 모달
   * - 기타: 로그만 출력
   */
  const handleHttpError = useCallback(
    (event: HttpErrorEvent) => {
      const { url: errorUrl, statusCode, description } = event.nativeEvent;

      console.log('[WebView] 🟠 HTTP error:', { errorUrl, statusCode, description });

      // 401, 403 인증 에러는 웹에서 처리 (무시)
      if (statusCode === 401 || statusCode === 403) {
        console.log('[WebView] Auth error ignored - handled by web');
        return;
      }

      // 5xx 서버 에러만 사용자에게 표시
      if (statusCode && statusCode >= 500) {
        setError({
          type: 'http',
          statusCode,
          description,
          url: errorUrl,
        });
      }
    },
    []
  );

  return {
    handleWebViewError,
    handleHttpError,
    error,
    clearError,
  };
}
