import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';

import { COLORS, WEBVIEW_THEME } from '@/lib/theme';

/**
 * WebView renderLoading용 로딩 인디케이터
 * SplashScreen과 동일한 디자인이지만 독립적인 컴포넌트
 * (hooks 순서 문제 방지를 위해 분리)
 */

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = 120;
const DELAYED_TEXT_MS = 1000;

// 라이트 모드 기본값 사용 (WebView 로딩 중에는 시스템 테마 감지가 불안정할 수 있음)
const theme = WEBVIEW_THEME.light;

export const LoadingIndicator = () => {
  const [showDelayedText, setShowDelayedText] = useState(false);
  const logoOpacity = useRef(new Animated.Value(0.7)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [logoOpacity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDelayedText(true);
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, DELAYED_TEXT_MS);

    return () => clearTimeout(timer);
  }, [textOpacity]);

  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Background decorations */}
        <View style={[styles.decoration, styles.decorationTopRight, { backgroundColor: COLORS.primaryLight }]} />
        <View style={[styles.decoration, styles.decorationBottomLeft, { backgroundColor: COLORS.primaryMedium }]} />
        <View style={[styles.decoration, styles.decorationCenter, { backgroundColor: COLORS.primarySubtle }]} />

        {/* Logo with pulse */}
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand name */}
        <Text style={[styles.brandName, { color: theme.text }]}>
          루티너스
        </Text>

        {/* Delayed loading text */}
        {showDelayedText && (
          <Animated.Text style={[styles.loadingText, { color: theme.textMuted, opacity: textOpacity }]}>
            잠시만 기다려주세요...
          </Animated.Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decoration: {
    position: 'absolute',
    borderRadius: 9999,
  },
  decorationTopRight: {
    top: -80,
    right: -80,
    width: 200,
    height: 200,
  },
  decorationBottomLeft: {
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
  },
  decorationCenter: {
    top: height / 2 - 120,
    left: width / 2 - 120,
    width: 240,
    height: 240,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingText: {
    position: 'absolute',
    bottom: 100,
    fontSize: 14,
  },
});
