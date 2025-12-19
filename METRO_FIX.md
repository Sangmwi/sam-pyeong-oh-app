# 🔧 Metro Bundler 갑자기 안 되는 문제 해결

## 증상
- 원래는 `npm run android:clean`이 정상 작동했음
- 갑자기 bundled 100%에서 흰화면 발생
- `npx expo start --localhost`는 정상 작동

## 가능한 원인

### 1. 이전 Metro Bundler 프로세스가 완전히 종료되지 않음
여러 Node.js 프로세스가 실행 중일 수 있습니다.

**해결:**
```bash
# 모든 Node.js 프로세스 종료 (주의: 다른 프로젝트도 종료됨)
taskkill /F /IM node.exe

# 또는 특정 포트 사용 프로세스만 종료
netstat -ano | findstr :8081
taskkill /PID [PID번호] /F
```

### 2. 포트 8081 충돌
포트가 TIME_WAIT 상태로 남아있을 수 있습니다.

**해결:**
```bash
# 포트 확인
netstat -ano | findstr :8081

# 사용 중인 프로세스 종료
taskkill /PID [PID번호] /F

# 잠시 대기 후 재시작
npm run android:clean
```

### 3. Metro 캐시 문제
캐시가 손상되었을 수 있습니다.

**해결:**
```bash
# 캐시 클리어 후 재시작
npx expo start --clear

# 또는 더 강력한 클리어
npm start -- --reset-cache
```

### 4. 네트워크 설정 변경
Wi-Fi 네트워크나 IP 주소가 변경되었을 수 있습니다.

**해결:**
```bash
# 현재 IP 확인
ipconfig

# localhost로 강제 실행
npx expo start --localhost
```

---

## 빠른 해결 방법 (순서대로 시도)

### 방법 1: 프로세스 정리 후 재시작
```bash
# 1. 모든 Node.js 프로세스 종료
taskkill /F /IM node.exe

# 2. 잠시 대기 (5초)

# 3. 캐시 클리어하며 재시작
npm run android:clean
```

### 방법 2: 캐시 클리어
```bash
# 1. Metro 캐시 클리어
npx expo start --clear

# 2. Ctrl+C로 중지

# 3. 다시 실행
npm run android:clean
```

### 방법 3: 두 단계로 실행
```bash
# 터미널 1: Metro Bundler 시작
npx expo start --localhost

# 터미널 2: Android 빌드
npx expo run:android
```

### 방법 4: 완전 초기화
```bash
# 1. 모든 프로세스 종료
taskkill /F /IM node.exe

# 2. Metro 캐시 삭제
rmdir /s /q %TEMP%\metro-*

# 3. node_modules 캐시 삭제
rmdir /s /q node_modules\.cache

# 4. 재시작
npm run android:clean
```

---

## 원인별 체크리스트

- [ ] 이전 Metro Bundler 프로세스가 실행 중인가?
- [ ] 포트 8081이 사용 중인가?
- [ ] Wi-Fi 네트워크가 변경되었는가?
- [ ] IP 주소가 변경되었는가?
- [ ] 방화벽 설정이 변경되었는가?

---

## 권장 해결 순서

1. **프로세스 정리**: `taskkill /F /IM node.exe`
2. **캐시 클리어**: `npx expo start --clear` (Ctrl+C로 중지)
3. **재시작**: `npm run android:clean`
4. **여전히 안 되면**: 두 단계로 실행 (위 방법 3)

---

## 예방 방법

1. Metro Bundler 종료 시 `Ctrl+C`로 정상 종료
2. 프로세스가 완전히 종료될 때까지 대기
3. 여러 터미널에서 동시에 실행하지 않기
4. 정기적으로 캐시 클리어


