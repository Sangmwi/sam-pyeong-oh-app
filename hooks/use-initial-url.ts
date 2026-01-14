import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

import { getInitialUrl, getLoginUrl, getAppInitUrl } from '@/lib/webview';

// ============================================================================
// Types
// ============================================================================

type UseInitialUrlResult = {
  url: string;
  setUrl: (url: string) => void;
  isUrlInitialized: boolean;
};

// ============================================================================
// Hook
// ============================================================================

/**
 * 세션 로드 완료 후 초기 URL 결정
 * - 세션이 있으면 /app-init (세션 동기화 후 홈 이동)
 * - 없으면 로그인
 */
export function useInitialUrl(
  session: Session | null,
  isReady: boolean
): UseInitialUrlResult {
  const [url, setUrl] = useState(getInitialUrl);
  const [isUrlInitialized, setIsUrlInitialized] = useState(false);

  useEffect(() => {
    if (isReady && !isUrlInitialized) {
      setIsUrlInitialized(true);
      // 세션이 있으면 /app-init으로 시작 (미들웨어 우회)
      // SET_SESSION 처리 후 useWebViewCommands에서 홈으로 이동
      const startUrl = session ? getAppInitUrl() : getLoginUrl();
      console.log('[WebView] Session ready, starting with:', session ? 'app-init' : 'login');
      setUrl(startUrl);
    }
  }, [isReady, session, isUrlInitialized]);

  return { url, setUrl, isUrlInitialized };
}
