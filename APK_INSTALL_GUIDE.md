# 📱 APK 핸드폰 설치 가이드

## 방법 1: USB 연결 (ADB 사용) 🔌

### 1단계: Android Debug Bridge (ADB) 설치 확인

**Windows에서 ADB 설치 방법:**

#### 옵션 A: Android SDK Platform Tools 설치 (권장)
1. [Android Platform Tools 다운로드](https://developer.android.com/tools/releases/platform-tools)
2. 압축 해제 후 원하는 폴더에 저장 (예: `C:\platform-tools`)
3. 환경 변수 PATH에 추가:
   - 시스템 속성 → 고급 → 환경 변수
   - Path 변수에 `C:\platform-tools` 추가

#### 옵션 B: Android Studio 설치 (개발자용)
- Android Studio를 설치하면 ADB가 자동으로 포함됩니다
- 경로: `C:\Users\[사용자명]\AppData\Local\Android\Sdk\platform-tools`

#### 옵션 C: Chocolatey 사용 (빠른 설치)
```powershell
choco install adb
```

### 2단계: ADB 설치 확인
```powershell
adb version
```
정상적으로 설치되었다면 버전 정보가 표시됩니다.

### 3단계: 핸드폰 USB 디버깅 활성화

1. **개발자 옵션 활성화**
   - 설정 → 휴대전화 정보 (또는 디바이스 정보)
   - "빌드 번호"를 7번 연속으로 탭
   - "개발자가 되었습니다!" 메시지 확인

2. **USB 디버깅 활성화**
   - 설정 → 개발자 옵션
   - "USB 디버깅" 켜기
   - 경고 메시지에서 "확인" 선택

3. **USB 연결 모드 설정**
   - USB로 연결 시 "파일 전송" 또는 "MTP" 모드 선택

### 4단계: USB로 핸드폰 연결

1. USB 케이블로 핸드폰과 PC 연결
2. 핸드폰에서 "USB 디버깅 허용" 팝업이 나타나면 **"허용"** 선택
3. "이 컴퓨터에서 항상 허용" 체크 (선택사항)

### 5단계: 연결 확인
```powershell
adb devices
```

정상적으로 연결되었다면 다음과 같이 표시됩니다:
```
List of devices attached
ABC123XYZ    device
```

만약 `unauthorized`로 표시되면:
- 핸드폰에서 USB 디버깅 허용 팝업 확인
- USB 케이블을 뽑았다가 다시 연결

### 6단계: APK 설치
```powershell
cd C:\spo\sam-pyeong-oh-app
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

**설치 성공 메시지:**
```
Performing Streamed Install
Success
```

**기존 앱이 있다면 덮어쓰기:**
```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 방법 2: 파일 전송 방법 📤

### 1단계: APK 파일 위치 확인
```
C:\spo\sam-pyeong-oh-app\android\app\build\outputs\apk\debug\app-debug.apk
```

### 2단계: APK 파일을 핸드폰으로 전송

#### 옵션 A: USB 파일 전송
1. USB 케이블로 핸드폰 연결
2. 핸드폰에서 "파일 전송" 모드 선택
3. PC에서 파일 탐색기 열기
4. APK 파일을 핸드폰의 다운로드 폴더나 원하는 위치로 복사

#### 옵션 B: 클라우드 서비스 (Google Drive, Dropbox 등)
1. APK 파일을 클라우드에 업로드
2. 핸드폰에서 클라우드 앱으로 다운로드

#### 옵션 C: 이메일
1. APK 파일을 자신의 이메일로 전송
2. 핸드폰에서 이메일 앱으로 다운로드

#### 옵션 D: 무선 전송 (ShareIt, Send Anywhere 등)
1. 무선 파일 전송 앱 사용
2. PC와 핸드폰에서 같은 앱 실행
3. 파일 전송

### 3단계: 핸드폰에서 설치

1. **파일 관리자 앱 열기**
   - 기본 파일 관리자 또는 Google Files 앱 사용

2. **APK 파일 찾기**
   - 다운로드 폴더 또는 전송한 위치로 이동
   - `app-debug.apk` 파일 찾기

3. **알 수 없는 출처 허용**
   - APK 파일을 탭하면 "알 수 없는 출처에서 설치" 경고 표시
   - "설정" 버튼 클릭
   - "이 출처에서 설치 허용" 토글 활성화
   - 뒤로 가기로 돌아와서 다시 APK 파일 탭

4. **설치 진행**
   - "설치" 버튼 클릭
   - 권한 요청 시 "허용" 선택
   - 설치 완료 후 "열기" 또는 "완료" 선택

---

## 문제 해결 🔧

### ADB가 디바이스를 인식하지 못할 때

1. **USB 드라이버 확인**
   - 제조사 USB 드라이버 설치 (Samsung, LG 등)
   - 또는 [Universal ADB Driver](https://adb.clockworkmod.com/) 설치

2. **USB 케이블 확인**
   - 데이터 전송이 가능한 케이블인지 확인 (충전 전용 케이블 X)
   - 다른 USB 포트 시도

3. **핸드폰 재부팅**
   - 핸드폰과 PC 모두 재부팅 후 다시 시도

### "알 수 없는 출처" 설정이 안 보일 때

**Android 8.0 이상:**
- 각 앱별로 허용해야 함
- 파일 관리자 앱의 "알 수 없는 출처" 설정 활성화

**설정 경로:**
- 설정 → 앱 → 특정 앱 → 추가 설정 → 이 앱에서 설치 허용

### 설치 실패 시

1. **기존 앱 제거 후 재설치**
   ```powershell
   adb uninstall com.anonymous.sampyeongohapp
   adb install android\app\build\outputs\apk\debug\app-debug.apk
   ```

2. **APK 파일 손상 확인**
   - 파일 크기 확인 (0바이트가 아닌지)
   - 다시 빌드 시도

3. **저장 공간 확인**
   - 핸드폰 저장 공간이 충분한지 확인

---

## 빠른 참조 명령어 📋

```powershell
# ADB 버전 확인
adb version

# 연결된 디바이스 확인
adb devices

# APK 설치
adb install android\app\build\outputs\apk\debug\app-debug.apk

# 기존 앱 덮어쓰기 설치
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# 앱 제거
adb uninstall com.anonymous.sampyeongohapp

# 로그 확인 (앱 실행 중)
adb logcat
```

---

## 추천 방법 ⭐

**개발/테스트 중:** USB 연결 (ADB) - 빠르고 편리  
**일회성 설치:** 파일 전송 - 간단하고 직관적

