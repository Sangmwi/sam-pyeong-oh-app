import React, { useCallback, useState, RefObject } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import type { WebView } from 'react-native-webview';
import { WebViewBridge, type ImagePickerSource, type ImagePickerResult } from '@/lib/webview';
import ActionSheet, { ActionSheetOption } from '@/components/ui/ActionSheet';
import { useComponentTheme } from '@/lib/theme';

// ============================================================================
// Types
// ============================================================================

type ImagePickerRequest = {
  requestId: string;
  source: ImagePickerSource;
};

type SourceSelection = 'camera' | 'gallery' | 'cancel';

// ============================================================================
// Hook
// ============================================================================

/**
 * 웹뷰에서 이미지 피커 요청을 처리하는 훅
 */
export const useImagePicker = (webViewRef: RefObject<WebView | null>) => {
  const theme = useComponentTheme();

  // ActionSheet 상태
  const [sheetVisible, setSheetVisible] = useState(false);
  const [resolveRef, setResolveRef] = useState<((value: SourceSelection) => void) | null>(null);

  /**
   * 결과를 웹뷰에 전송 (WebViewBridge 사용 - app-command 이벤트)
   */
  const sendResult = useCallback(
    (requestId: string, result: ImagePickerResult) => {
      WebViewBridge.sendImagePickerResult(webViewRef, requestId, result);
    },
    [webViewRef]
  );

  /**
   * 카메라 권한 요청
   */
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }, []);

  /**
   * 갤러리 권한 요청
   */
  const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }, []);

  /**
   * 카메라로 촬영
   */
  const launchCamera = useCallback(async (): Promise<ImagePickerResult> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return { success: false, error: '카메라 권한이 필요합니다.' };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
      exif: false,
    });

    if (result.canceled) {
      return { success: false, cancelled: true };
    }

    const asset = result.assets[0];
    return {
      success: true,
      base64: asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : undefined,
      uri: asset.uri,
      mimeType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  }, [requestCameraPermission]);

  /**
   * 갤러리에서 선택
   */
  const launchGallery = useCallback(async (): Promise<ImagePickerResult> => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      return { success: false, error: '갤러리 접근 권한이 필요합니다.' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
      exif: false,
    });

    if (result.canceled) {
      return { success: false, cancelled: true };
    }

    const asset = result.assets[0];
    return {
      success: true,
      base64: asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : undefined,
      uri: asset.uri,
      mimeType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  }, [requestGalleryPermission]);

  /**
   * 소스 선택 ActionSheet 표시
   */
  const showSourcePicker = useCallback((): Promise<SourceSelection> => {
    return new Promise((resolve) => {
      setResolveRef(() => resolve);
      setSheetVisible(true);
    });
  }, []);

  /**
   * ActionSheet 선택 핸들러
   * 주의: onPress가 먼저 호출되고 onClose가 나중에 호출됨
   * resolveRef가 null이면 이미 처리된 것이므로 무시
   */
  const handleSelect = useCallback((source: SourceSelection) => {
    if (!resolveRef) return;
    setSheetVisible(false);
    resolveRef(source);
    setResolveRef(null);
  }, [resolveRef]);

  /**
   * 이미지 피커 요청 처리
   */
  const handleImagePickerRequest = useCallback(
    async (request: ImagePickerRequest) => {
      const { requestId, source } = request;

      try {
        let result: ImagePickerResult;

        if (source === 'camera') {
          result = await launchCamera();
        } else if (source === 'gallery') {
          result = await launchGallery();
        } else {
          // 'both' - 커스텀 ActionSheet로 사용자에게 선택하게 함
          const selectedSource = await showSourcePicker();

          if (selectedSource === 'cancel') {
            sendResult(requestId, { success: false, cancelled: true });
            return;
          }

          result = selectedSource === 'camera'
            ? await launchCamera()
            : await launchGallery();
        }

        sendResult(requestId, result);
      } catch (error) {
        sendResult(requestId, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [launchCamera, launchGallery, showSourcePicker, sendResult]
  );

  /**
   * ActionSheet 옵션
   */
  const sheetOptions: ActionSheetOption[] = [
    {
      label: '카메라로 촬영',
      icon: React.createElement(Camera, { size: 22, color: theme.text }),
      onPress: () => handleSelect('camera'),
    },
    {
      label: '앨범에서 선택',
      icon: React.createElement(ImageIcon, { size: 22, color: theme.text }),
      onPress: () => handleSelect('gallery'),
    },
  ];

  /**
   * 렌더링할 ActionSheet 컴포넌트
   */
  const ImagePickerSheet = React.createElement(ActionSheet, {
    visible: sheetVisible,
    onClose: () => handleSelect('cancel'),
    title: '사진 선택',
    message: '사진을 어떻게 가져올까요?',
    options: sheetOptions,
    cancelText: '취소',
  });

  return {
    handleImagePickerRequest,
    ImagePickerSheet,
  };
};
