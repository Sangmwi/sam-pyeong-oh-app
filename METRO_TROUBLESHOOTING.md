# 🔧 Metro Bundler 연결 문제 해결

## 문제: `npm run android:clean` 실행 시 흰화면

### 증상
- `npx expo start --localhost` → ✅ 정상 작동
- `npm run android:clean` → ❌ bundled 100%에서 흰화면

### 원인
`expo run:android`는 Metro Bundler를 네트워크 인터페이스에 바인딩하려고 시도하지만, Android 앱이 Metro Bundler에 연결하지 못하는 경우가 발생합니다.

---

## 해결 방법

### 방법 1: package.json 스크립트 수정 (권장) ✅

이미 적용되어 있습니다:
```json
{
  "scripts": {
    "android": "expo run:android -- --localhost",
    "android:clean": "expo prebuild --clean --platform android && expo run:android -- --localhost"
  }
}
```

이제 `npm run android:clean`을 실행하면 자동으로 `--localhost` 플래그가 적용됩니다.

---

### 방법 2: 두 단계로 실행

**터미널 1**: Metro Bundler 시작
```bash
npx expo start --localhost
```

**터미널 2**: Android 빌드 및 실행
```bash
npm run android
# 또는
npx expo run:android
```

---

### 방법 3: 실제 기기 사용 시 (Wi-Fi 연결)

실제 Android 기기를 사용하는 경우, 같은 Wi-Fi 네트워크에 연결되어 있어야 합니다.

1. **PC의 IP 주소 확인**
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. **Metro Bundler를 네트워크에 바인딩**
   ```bash
   npx expo start --host tunnel
   # 또는
   npx expo start --host [PC의IP주소]
   ```

3. **Android 앱에서 수동 연결**
   - Expo Dev Client 앱에서 "Enter URL manually" 선택
   - `http://[PC의IP주소]:8081` 입력

---

## 추가 문제 해결

### 문제: 여전히 연결되지 않음

1. **포트 확인**
   ```bash
   # Windows
   netstat -ano | findstr :8081
   
   # macOS/Linux
   lsof -i :8081
   ```

2. **캐시 클리어 후 재시작**
   ```bash
   npx expo start --clear --localhost
   ```

3. **방화벽 확인**
   - Windows 방화벽에서 Node.js 허용 확인
   - 포트 8081 허용 확인

### 문제: Android 에뮬레이터 사용 시

Android 에뮬레이터는 `localhost`를 `10.0.2.2`로 변환해야 합니다.

- ✅ `expo start --localhost` 사용 시 자동 처리됨
- ✅ `lib/webview/constants.ts`에서 자동 변환됨

---

## 빠른 해결 (권장)

```bash
# 방법 1: 수정된 스크립트 사용
npm run android:clean

# 방법 2: 두 단계 실행
# 터미널 1
npx expo start --localhost

# 터미널 2
npx expo run:android
```

---

## 참고

- `--localhost` 플래그는 Metro Bundler를 `127.0.0.1`에만 바인딩합니다
- Android 에뮬레이터는 `localhost`를 `10.0.2.2`로 자동 변환합니다
- 실제 기기 사용 시에는 Wi-Fi 연결이 필요합니다


