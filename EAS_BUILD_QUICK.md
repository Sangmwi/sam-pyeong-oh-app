# 🚀 EAS Build 빠른 가이드

## 1단계: EAS CLI 설치

```bash
npm install -g eas-cli
```

## 2단계: Expo 계정 로그인

```bash
eas login
```

Expo 계정이 없다면: https://expo.dev/signup

## 3단계: 프로젝트 설정 (처음 한 번만)

```bash
eas build:configure
```

이미 `eas.json` 파일이 있으므로 설정이 완료되어 있을 수 있습니다.

---

## 4단계: 빌드 실행

### 개발 빌드 (테스트용)
```bash
eas build --platform android --profile development
```

### 프리뷰 빌드 (내부 배포용)
```bash
eas build --platform android --profile preview
```

### 프로덕션 빌드 (배포용)
```bash
eas build --platform android --profile production
```

---

## 빌드 프로필별 환경변수

현재 `eas.json` 설정:

### development
- `EXPO_PUBLIC_WEBVIEW_URL`: `http://localhost:3000`
- 개발 클라이언트 포함

### preview
- `EXPO_PUBLIC_WEBVIEW_URL`: `https://staging.example.com`
- APK 빌드

### production
- `EXPO_PUBLIC_WEBVIEW_URL`: `https://app.example.com`
- APK 빌드

---

## 환경변수 변경 (EAS Secrets)

빌드 전에 환경변수를 변경하려면:

```bash
# 프로덕션 환경변수 설정
eas secret:create --scope project --name EXPO_PUBLIC_WEBVIEW_URL --value https://your-domain.com --type string

# 프리뷰 환경변수 설정
eas secret:create --scope project --name EXPO_PUBLIC_WEBVIEW_URL --value https://staging.your-domain.com --type string --profile preview
```

---

## 빌드 완료 후

1. 빌드가 완료되면 QR 코드나 다운로드 링크가 제공됩니다
2. 링크를 통해 APK를 다운로드
3. 핸드폰에 설치

---

## 빌드 상태 확인

```bash
# 현재 빌드 상태 확인
eas build:list

# 특정 빌드 상세 정보
eas build:view [BUILD_ID]
```

---

## 주의사항

⚠️ **development 프로필의 `localhost` URL**
- 개발 빌드는 `http://localhost:3000`을 사용합니다
- 실제 기기에서는 작동하지 않을 수 있습니다
- 실제 URL로 변경하려면 EAS Secrets 사용

✅ **권장: preview 또는 production 프로필 사용**
- 실제 도메인 URL 사용
- 테스트 및 배포에 적합

---

## 빠른 시작 (권장)

```bash
# 1. 로그인
eas login

# 2. 프리뷰 빌드 (실제 URL 사용)
eas build --platform android --profile preview

# 3. 빌드 완료 후 APK 다운로드 및 설치
```


