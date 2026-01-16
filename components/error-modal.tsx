/**
 * WebView 에러 모달
 *
 * Alert 대신 앱 스타일의 에러 모달을 표시합니다.
 * - 깔끔한 에러 UI
 * - 접기 방식으로 상세 로그 표시 (MVP/디버깅용)
 * - 재시도 / 닫기 버튼
 */

import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from 'react-native';
import { useComponentTheme } from '@/lib/theme';

// ============================================================================
// Types
// ============================================================================

export interface WebViewError {
  code?: number;
  description?: string;
  url?: string;
  type: 'connection' | 'http';
  statusCode?: number;
}

export interface ErrorModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 재시도 핸들러 */
  onRetry: () => void;
  /** 에러 정보 */
  error: WebViewError | null;
}

// ============================================================================
// Constants
// ============================================================================

const ANIMATION_DURATION = 200;

// ============================================================================
// Component
// ============================================================================

export function ErrorModal({
  visible,
  onClose,
  onRetry,
  error,
}: ErrorModalProps) {
  const theme = useComponentTheme();
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // 열기 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 닫기 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
      // 닫힐 때 상세 정보 접기
      setShowDetails(false);
    }
  }, [visible, fadeAnim, scaleAnim]);

  const getErrorMessage = () => {
    if (error?.type === 'http') {
      return '서버에서 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.';
    }
    return '서버에 연결할 수 없습니다.\n인터넷 연결을 확인해주세요.';
  };

  const getErrorTitle = () => {
    if (error?.type === 'http') {
      return '서버 오류';
    }
    return '연결 오류';
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              {/* 타이틀 */}
              <Text style={styles.title}>{getErrorTitle()}</Text>

              {/* 메시지 */}
              <Text style={styles.message}>{getErrorMessage()}</Text>

              {/* 상세 정보 토글 */}
              <TouchableOpacity
                style={styles.detailsToggle}
                onPress={() => setShowDetails(!showDetails)}
                activeOpacity={0.7}
              >
                <Text style={styles.detailsToggleText}>
                  {showDetails ? '▼' : '▶'} 오류 상세 정보
                </Text>
              </TouchableOpacity>

              {/* 상세 정보 */}
              {showDetails && error && (
                <View style={styles.detailsContainer}>
                  {error.code !== undefined && (
                    <Text style={styles.detailsText}>Code: {error.code}</Text>
                  )}
                  {error.statusCode !== undefined && (
                    <Text style={styles.detailsText}>HTTP: {error.statusCode}</Text>
                  )}
                  {error.description && (
                    <Text style={styles.detailsText}>{error.description}</Text>
                  )}
                  {error.url && (
                    <Text style={styles.detailsText} numberOfLines={2}>
                      URL: {error.url}
                    </Text>
                  )}
                </View>
              )}

              {/* 버튼 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={onRetry}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryButtonText}>재시도</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const createStyles = (theme: ReturnType<typeof useComponentTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    container: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 320,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
    },
    detailsToggle: {
      paddingVertical: 8,
      marginBottom: 8,
    },
    detailsToggleText: {
      fontSize: 13,
      color: theme.textMuted,
    },
    detailsContainer: {
      backgroundColor: theme.isDark ? theme.muted : theme.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    detailsText: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: theme.textMuted,
      marginBottom: 4,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    retryButton: {
      backgroundColor: theme.primary,
    },
    retryButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.primaryForeground,
    },
    closeButton: {
      backgroundColor: theme.isDark ? theme.muted : theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    closeButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
  });
