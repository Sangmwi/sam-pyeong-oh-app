# 🚀 빠른 설치 가이드

## 현재 상황
- ✅ APK 파일 준비 완료 (120.19 MB)
- ❌ ADB 미설치 (USB 설치를 원하면 설치 필요)

---

## 방법 1: 파일 전송 (가장 간단) ⭐ 권장

### 단계별 가이드

#### 1. APK 파일 위치
```
C:\spo\sam-pyeong-oh-app\android\app\build\outputs\apk\debug\app-debug.apk
```

#### 2. 파일을 핸드폰으로 전송

**A. USB 케이블 사용**
1. USB 케이블로 핸드폰 연결
2. 핸드폰에서 "파일 전송" 또는 "MTP" 모드 선택
3. PC 파일 탐색기에서:
   - "내 PC" → 핸드폰 이름 → 내부 저장소
   - `app-debug.apk` 파일을 **다운로드** 폴더로 복사

**B. 클라우드 사용 (Google Drive, OneDrive 등)**
1. 웹 브라우저에서 클라우드 서비스 접속
2. APK 파일 업로드
3. 핸드폰에서 클라우드 앱 실행
4. APK 파일 다운로드

**C. 이메일 사용**
1. 자신의 이메일로 APK 파일 첨부하여 전송
2. 핸드폰에서 이메일 앱 열기
3. 첨부 파일 다운로드

**D. 무선 전송 앱 (ShareIt, Send Anywhere 등)**
1. PC와 핸드폰에 같은 앱 설치
2. PC에서 APK 파일 선택 → 전송
3. 핸드폰에서 수신

#### 3. 핸드폰에서 설치

**Android 8.0 이상:**
1. 파일 관리자 앱 열기 (Google Files, 내 파일 등)
2. 다운로드 폴더로 이동
3. `app-debug.apk` 파일 탭
4. "이 출처에서 설치 허용" 팝업이 나타나면:
   - "설정" 버튼 클릭
   - "이 출처에서 설치 허용" 토글 ON
   - 뒤로 가기 → 다시 APK 파일 탭
5. "설치" 버튼 클릭
6. 설치 완료 후 "열기" 또는 "완료"

**Android 7.0 이하:**
1. 파일 관리자에서 APK 파일 찾기
2. 파일 탭
3. "알 수 없는 출처" 허용 (설정에서 미리 활성화 가능)
4. 설치 진행

---

## 방법 2: USB + ADB (개발자용)

### ADB 설치 방법

#### 옵션 1: Chocolatey로 설치 (가장 빠름)
```powershell
# Chocolatey가 없다면 먼저 설치
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# ADB 설치
choco install adb
```

#### 옵션 2: 수동 설치
1. [Android Platform Tools 다운로드](https://developer.android.com/tools/releases/platform-tools)
2. 압축 해제 (예: `C:\platform-tools`)
3. 환경 변수 PATH에 추가

#### 옵션 3: Android Studio 설치
- Android Studio 설치 시 자동 포함

### ADB 설치 후 설치 명령어
```powershell
cd C:\spo\sam-pyeong-oh-app
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 추천 순서

1. **파일 전송 방법** (가장 간단, ADB 불필요)
2. **USB + ADB 방법** (개발 중 자주 설치할 때 유용)

---

## 문제 해결

### "알 수 없는 출처" 설정이 안 보일 때
- **Android 8.0+**: 각 앱별로 허용 필요
  - 파일 관리자 앱 → 설정 → 추가 설정 → 이 앱에서 설치 허용
- **Android 7.0 이하**: 설정 → 보안 → 알 수 없는 출처

### 설치 실패 시
1. 기존 앱이 있다면 먼저 제거
2. 저장 공간 확인
3. APK 파일이 손상되지 않았는지 확인

