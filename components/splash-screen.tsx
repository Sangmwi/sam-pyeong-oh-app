import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

import { useTheme, COLORS } from '@/lib/theme';

// ============================================================================
// Constants
// ============================================================================

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = 120;
const DELAYED_TEXT_MS = 1000;

// ============================================================================
// Component
// ============================================================================

export function SplashScreen() {
  const theme = useTheme();
  const [showDelayedText, setShowDelayedText] = useState(false);

  // Animations
  const logoOpacity = useRef(new Animated.Value(0.7)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Logo pulse animation
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

  // Delayed text fade-in
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
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Background decorations (blur effect simulated with large border radius)
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

  // Logo
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },

  // Text
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
