import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// TODO: 여기를 실제 Next.js 프로젝트의 URL로 변경하세요.
// 로컬 테스트 시 (Android): 'http://10.0.2.2:3000'
// 로컬 테스트 시 (iOS): 'http://localhost:3000'
const getTargetUrl = () => {
  const originalUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://www.google.com';
  
  // 개발 환경 편의성: 안드로이드 에뮬레이터에서 localhost 접속 시 10.0.2.2로 자동 변환
  if (__DEV__ && Platform.OS === 'android' && originalUrl.includes('localhost')) {
    return originalUrl.replace('localhost', '10.0.2.2');
  }
  return originalUrl;
};

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  // URL을 상태로 관리하여 에러 발생 시 변경 가능하도록 함
  const [currentUrl, setCurrentUrl] = useState(getTargetUrl());

  const [isLoading, setIsLoading] = useState(true);

  // 안드로이드 하드웨어 뒤로가기 버튼 핸들링
  const handleBackPress = useCallback(() => {
    if (Platform.OS === 'android' && webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true; // 이벤트를 소비함 (앱 종료 방지)
    }
    return false; // 기본 동작 수행 (앱 종료)
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        backHandler.remove();
      };
    }
  }, [handleBackPress]);

  // 웹뷰 로드 에러 핸들러
  const handleError = () => {
    setIsLoading(false); // 로딩 해제
    Alert.alert(
      '연결 실패',
      '서버에 연결할 수 없습니다. 개발 서버가 켜져 있는지 확인해주세요.\n임시로 구글로 이동합니다.',
      [
        {
          text: '확인',
          onPress: () => setCurrentUrl('https://www.google.com'),
        },
        {
          text: '재시도',
          onPress: () => webViewRef.current?.reload(),
          style: 'cancel',
        }
      ]
    );
  };

  // 로딩 상태 변경 핸들러
  const handleLoadStart = () => setIsLoading(true);
  const handleLoadEnd = () => setIsLoading(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        // 웹뷰 네비게이션 상태 변경 시 호출
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        // 로드 시작/종료 핸들링
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        // 에러 핸들링
        onError={handleError}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView received error status code: ', nativeEvent.statusCode);
          handleError();
        }}
        // 자바스크립트 활성화
        javaScriptEnabled={true}
        // DOM 스토리지 활성화 (로그인 세션 유지 등)
        domStorageEnabled={true}
        // 캐시 활성화
        cacheEnabled={true}
        // 로딩 중 표시할 컴포넌트 (커스텀 처리하므로 startInLoadingState 제거 가능하나 유지)
        startInLoadingState={true}
        renderLoading={() => (
           isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : null
        )}
        // 뷰포트 확대/축소 비활성화 (모바일 전용 웹앱인 경우)
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 상태바 배경색과 일치시키는 것이 좋음
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
