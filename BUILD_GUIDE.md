# 빌드 가이드

## 방법 1: 이미 빌드된 APK 사용 (가장 빠름) ⚡

이미 빌드된 APK 파일이 있습니다:
- 경로: `android/app/build/outputs/apk/debug/app-debug.apk`

### 핸드폰에 설치하는 방법:

1. **USB 연결 방법 (권장)**
   ```bash
   # Android Debug Bridge (ADB) 설치 필요
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

2. **파일 전송 방법**
   - APK 파일을 핸드폰으로 전송 (이메일, 클라우드 등)
   - 핸드폰에서 파일 관리자로 APK 파일 열기
   - "알 수 없는 출처" 설치 허용 필요

---

## 방법 2: 로컬 빌드 (개발용) 🔨

### Android 빌드
```bash
npm run android
# 또는
npx expo run:android
```

### 새로 빌드
```bash
npm run android:clean
```

---

## 방법 3: EAS Build (프로덕션용) ☁️

### 1. Expo 계정 로그인
```bash
eas login
```

### 2. 프로젝트 설정 (처음 한 번만)
```bash
eas build:configure
```

### 3. Android APK 빌드

**개발 빌드 (테스트용)**
```bash
eas build --platform android --profile development
```

**프리뷰 빌드 (내부 배포용)**
```bash
eas build --platform android --profile preview
```

**프로덕션 빌드 (배포용)**
```bash
eas build --platform android --profile production
```

### 4. 빌드 완료 후
- 빌드가 완료되면 QR 코드나 다운로드 링크가 제공됩니다
- 링크를 통해 APK를 다운로드하여 핸드폰에 설치할 수 있습니다

---

## EAS Build의 장점

✅ **클라우드 빌드**: 로컬 환경 설정 불필요  
✅ **서명 관리**: 자동 키스토어 관리  
✅ **다양한 빌드 프로필**: development, preview, production  
✅ **배포 통합**: App Store, Play Store 배포 지원  
✅ **빌드 히스토리**: 모든 빌드 기록 관리  

---

## 빠른 시작 (권장)

**가장 빠른 방법**: 이미 빌드된 APK 사용
```bash
# APK 파일 위치
android/app/build/outputs/apk/debug/app-debug.apk
```

**EAS Build 사용 (권장)**: 프로덕션 빌드가 필요할 때
```bash
eas login
eas build --platform android --profile preview
```

