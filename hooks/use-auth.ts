/**
 * 앱 인증 상태 관리 훅
 *
 * Native OAuth를 통해 Supabase 세션을 관리하고 WebView에 토큰을 전달합니다.
 * expo-web-browser를 사용해 네이티브 브라우저에서 OAuth 진행 후
 * deep link로 토큰을 받아 SecureStore에 저장합니다.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import WebView from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase/client';

// Expo AuthSession 웜업 (iOS에서 브라우저 세션 재사용)
WebBrowser.maybeCompleteAuthSession();

// ============================================================================
// Types
// ============================================================================

interface UseAuthResult {
  /** 현재 세션 (null이면 미인증) */
  session: Session | null;
  /** 초기화 완료 여부 */
  isReady: boolean;
  /** 로그인 진행 중 여부 */
  isLoggingIn: boolean;
  /** 로그아웃 함수 */
  signOut: () => Promise<void>;
  /** 네이티브 Google OAuth 시작 */
  signInWithGoogle: () => Promise<void>;
  /** WebView에 현재 토큰 전달 */
  syncTokenToWebView: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(webViewRef: React.RefObject<WebView | null>): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const lastTokenRef = useRef<string | null>(null);

  // WebView에 토큰 전달
  const sendTokenToWebView = useCallback((token: string | null) => {
    if (!webViewRef.current) return;

    // 토큰이 변경되지 않았으면 스킵
    if (lastTokenRef.current === token) return;
    lastTokenRef.current = token;

    const script = `
      (function() {
        const event = new CustomEvent('app-command', {
          detail: { type: 'SET_TOKEN', token: ${token ? JSON.stringify(token) : 'null'} }
        });
        window.dispatchEvent(event);
      })();
      true;
    `;

    webViewRef.current.injectJavaScript(script);
    console.log('[useAuth] Token synced to WebView:', token ? 'set' : 'cleared');
  }, [webViewRef]);

  // WebView에 현재 토큰 동기화 (수동 호출용)
  const syncTokenToWebView = useCallback(() => {
    sendTokenToWebView(session?.access_token ?? null);
  }, [session, sendTokenToWebView]);

  // 네이티브 Google OAuth
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      console.log('[useAuth] Starting native Google OAuth...');

      // Deep link redirect URI 생성
      const redirectTo = Linking.createURL('auth/callback');
      console.log('[useAuth] Redirect URI:', redirectTo);

      // Supabase OAuth URL 생성
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // 네이티브 브라우저 사용
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('[useAuth] OAuth URL generation failed:', error.message);
        throw error;
      }

      if (!data?.url) {
        throw new Error('No OAuth URL returned');
      }

      console.log('[useAuth] Opening browser for OAuth...');

      // 네이티브 브라우저에서 OAuth 진행
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        console.log('[useAuth] OAuth callback received:', result.url);

        // URL에서 토큰 추출
        const url = new URL(result.url);

        // Fragment (#) 또는 Query (?) 파라미터에서 추출
        const params = new URLSearchParams(
          url.hash.startsWith('#') ? url.hash.substring(1) : url.search
        );

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('[useAuth] Setting session from tokens...');

          // 세션 설정
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('[useAuth] Session set failed:', sessionError.message);
            throw sessionError;
          }

          console.log('[useAuth] Session established for:', sessionData.user?.email);
          // onAuthStateChange가 세션 업데이트를 처리함
        } else {
          // code 기반 PKCE 흐름인 경우
          const code = params.get('code');
          if (code) {
            console.log('[useAuth] Exchanging code for session...');
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.error('[useAuth] Code exchange failed:', exchangeError.message);
              throw exchangeError;
            }
          } else {
            console.error('[useAuth] No tokens or code in callback URL');
          }
        }
      } else if (result.type === 'cancel') {
        console.log('[useAuth] OAuth cancelled by user');
      } else {
        console.log('[useAuth] OAuth result:', result.type);
      }
    } catch (error) {
      console.error('[useAuth] OAuth error:', error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  // 초기 세션 로드 및 변경 구독
  useEffect(() => {
    // 1. 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
      console.log('[useAuth] Initial session:', session ? 'authenticated' : 'none');

      // 초기 세션이 있으면 WebView에 토큰 전달
      if (session?.access_token) {
        sendTokenToWebView(session.access_token);
      }
    });

    // 2. 세션 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('[useAuth] Auth state changed:', _event);
        setSession(session);

        // 세션 변경 시 WebView에 토큰 전달
        sendTokenToWebView(session?.access_token ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [sendTokenToWebView]);

  // 로그아웃
  const signOut = useCallback(async () => {
    console.log('[useAuth] Signing out...');
    await supabase.auth.signOut();
    sendTokenToWebView(null);
  }, [sendTokenToWebView]);

  return {
    session,
    isReady,
    isLoggingIn,
    signOut,
    signInWithGoogle,
    syncTokenToWebView,
  };
}
