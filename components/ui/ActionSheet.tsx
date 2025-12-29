import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useComponentTheme } from '@/lib/theme';

// ============================================================================
// Types
// ============================================================================

export interface ActionSheetOption {
  /** 옵션 라벨 */
  label: string;
  /** 옵션 아이콘 (선택) */
  icon?: React.ReactNode;
  /** 클릭 핸들러 */
  onPress: () => void;
  /** 스타일 변형: default, primary, destructive */
  variant?: 'default' | 'primary' | 'destructive';
  /** 비활성화 여부 */
  disabled?: boolean;
}

export interface ActionSheetProps {
  /** 표시 여부 */
  visible: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 제목 (선택) */
  title?: string;
  /** 설명 (선택) */
  message?: string;
  /** 옵션 목록 */
  options: ActionSheetOption[];
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 취소 버튼 표시 여부 */
  showCancel?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION_DURATION = 250;

// ============================================================================
// Component
// ============================================================================

export default function ActionSheet({
  visible,
  onClose,
  title,
  message,
  options,
  cancelText = '취소',
  showCancel = true,
}: ActionSheetProps) {
  const theme = useComponentTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 열기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 닫기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleOptionPress = (option: ActionSheetOption) => {
    if (option.disabled) return;
    // 콜백을 먼저 실행하고 닫기 (Promise 기반 사용 시 onClose보다 onPress가 먼저 실행되어야 함)
    option.onPress();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getOptionTextColor = (variant: ActionSheetOption['variant']) => {
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'destructive':
        return theme.destructive;
      default:
        return theme.text;
    }
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
      <TouchableWithoutFeedback onPress={handleCancel}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* 드래그 핸들 */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* 헤더 (제목/설명) */}
              {(title || message) && (
                <View style={styles.header}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  {message && <Text style={styles.message}>{message}</Text>}
                </View>
              )}

              {/* 옵션 목록 */}
              <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      option.disabled && styles.optionDisabled,
                      index < options.length - 1 && styles.optionBorder,
                    ]}
                    onPress={() => handleOptionPress(option)}
                    disabled={option.disabled}
                    activeOpacity={0.7}
                  >
                    {option.icon && (
                      <View style={styles.optionIcon}>{option.icon}</View>
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        { color: getOptionTextColor(option.variant) },
                        option.disabled && styles.optionTextDisabled,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 취소 버튼 */}
              {showCancel && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
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
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Safe area
      overflow: 'hidden',
    },
    handleContainer: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.textMuted,
      borderRadius: 2,
      opacity: 0.3,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      alignItems: 'center',
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      marginTop: 4,
    },
    optionsContainer: {
      marginHorizontal: 12,
      backgroundColor: theme.isDark ? theme.muted : theme.background,
      borderRadius: 14,
      overflow: 'hidden',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    optionBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    optionDisabled: {
      opacity: 0.4,
    },
    optionIcon: {
      marginRight: 12,
    },
    optionText: {
      fontSize: 18,
      fontWeight: '500',
    },
    optionTextDisabled: {
      color: theme.textMuted,
    },
    cancelButton: {
      marginTop: 8,
      marginHorizontal: 12,
      backgroundColor: theme.isDark ? theme.muted : theme.background,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.primary,
    },
  });
