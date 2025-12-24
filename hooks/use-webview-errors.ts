/**
 * WebView 에러 핸들러 훅
 *
 * WebView 연결 실패 및 HTTP 에러를 처리합니다.
 * 디버깅용 Alert로 상세 정보를 표시합니다.
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import type WebView from 'react-native-webview';
import { FALLBACK_URL } from '@/lib/webview';

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
  setUrl: (url: string) => void;
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
  setUrl,
}: UseWebViewErrorsParams): UseWebViewErrorsResult {
  /**
   * WebView 연결 에러 처리
   * 네트워크 연결 실패, 서버 연결 불가 등
   */
  const handleWebViewError = useCallback(
    (syntheticEvent: WebViewErrorEvent) => {
      const { description, code, url: errorUrl } = syntheticEvent.nativeEvent;

      console.log('[WebView] 🔴 onError triggered:', { description, code, errorUrl });

      // 디버깅용 상세 Alert
      Alert.alert(
        '연결 실패',
        `서버에 연결할 수 없습니다.\n\n[DEBUG]\nURL: ${errorUrl}\nCode: ${code}\nDesc: ${description}`,
        [
          { text: '홈으로', onPress: () => setUrl(FALLBACK_URL) },
          { text: '재시도', onPress: () => webViewRef.current?.reload(), style: 'cancel' },
          { text: '뒤로가기', onPress: () => webViewRef.current?.goBack() },
        ]
      );
    },
    [webViewRef, setUrl]
  );

  /**
   * HTTP 에러 처리
   * 4xx, 5xx 응답 등
   */
  const handleHttpError = useCallback(
    (event: HttpErrorEvent) => {
      const { url: errorUrl, statusCode, description } = event.nativeEvent;

      console.log('[WebView] 🟠 onHttpError:', { errorUrl, statusCode, description });

      if (!errorUrl?.includes('localhost')) {
        Alert.alert(
          'HTTP 에러',
          `[DEBUG]\nURL: ${errorUrl}\nStatus: ${statusCode}\nDesc: ${description}`,
          [
            { text: '확인' },
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
