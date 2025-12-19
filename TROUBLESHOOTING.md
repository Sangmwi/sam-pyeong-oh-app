# 🔧 Expo 번들링 문제 해결 가이드

## 문제: 번들링에서 멈춤

### 원인
- Metro 번들러 캐시 문제
- 이전 프로세스가 완전히 종료되지 않음
- 포트 충돌
- 네트워크 연결 문제

---

## 해결 방법

### 방법 1: 캐시 클리어 후 재시작 (가장 효과적)

```bash
# 1. Metro 번들러 중지 (Ctrl+C)

# 2. 캐시 클리어
npx expo start --clear

# 또는 더 강력한 클리어
npm start -- --reset-cache
```

### 방법 2: 완전 초기화

```bash
# 1. 모든 프로세스 종료
# 터미널에서 Ctrl+C로 중지

# 2. Watchman 캐시 클리어 (있다면)
watchman watch-del-all

# 3. Metro 캐시 클리어
rm -rf $TMPDIR/metro-*  # macOS/Linux
rm -rf %TEMP%\metro-*    # Windows

# 4. node_modules 캐시 클리어
rm -rf node_modules/.cache

# 5. 재시작
npm start -- --reset-cache
```

### 방법 3: 포트 강제 해제 후 재시작

```powershell
# Windows에서 포트 사용 중인 프로세스 종료
netstat -ano | findstr :8081
taskkill /PID [PID번호] /F

# 그 다음 재시작
npm start -- --reset-cache
```

### 방법 4: 네트워크 연결 확인

```bash
# 같은 Wi-Fi 네트워크에 연결되어 있는지 확인
# 핸드폰과 PC가 같은 네트워크여야 함

# IP 주소 확인
ipconfig  # Windows
ifconfig  # macOS/Linux

# 핸드폰에서 수동으로 연결
# Expo Go 앱에서 "Enter URL manually" 선택
# http://[PC의IP주소]:8081 입력
```

---

## 빠른 해결 (권장)

```bash
# 1. 현재 프로세스 중지 (Ctrl+C)

# 2. 캐시 클리어하며 재시작
npx expo start --clear

# 3. 여전히 안 되면
npm start -- --reset-cache
```

