/**
 * WebView 에러 핸들러 훅
 *
 * WebView 연결 실패 및 HTTP 에러를 처리합니다.
 * - 연결 에러: 사용자에게 재시도 옵션 제공
 * - HTTP 에러: 5xx만 표시, 4xx(인증 에러)는 웹에서 처리하도록 무시
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import type WebView from 'react-native-webview';

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
}

// ============================================================================
// Hook
// ============================================================================

export function useWebViewErrors({
  webViewRef,
}: UseWebViewErrorsParams): UseWebViewErrorsResult {
  /**
   * WebView 연결 에러 처리
   * 네트워크 연결 실패, 서버 연결 불가 등
   */
  const handleWebViewError = useCallback(
    (syntheticEvent: WebViewErrorEvent) => {
      const { description, code, url: errorUrl } = syntheticEvent.nativeEvent;

      console.log('[WebView] 🔴 Connection error:', { description, code, errorUrl });

      Alert.alert(
        '연결 실패',
        '서버에 연결할 수 없습니다.\n인터넷 연결을 확인해주세요.',
        [
          { text: '재시도', onPress: () => webViewRef.current?.reload() },
        ]
      );
    },
    [webViewRef]
  );

  /**
   * HTTP 에러 처리
   * - 401, 403: 웹에서 처리 (리다이렉트)
   * - 5xx: 서버 오류 Alert
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
        Alert.alert(
          '서버 오류',
          '잠시 후 다시 시도해주세요.',
          [
            { text: '재시도', onPress: () => webViewRef.current?.reload() },
          ]
        );
      }
    },
    [webViewRef]
  );

  return {
    handleWebViewError,
    handleHttpError,
  };
}
