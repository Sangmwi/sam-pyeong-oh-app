# 🔧 ADB 빠른 설치 및 USB 연결 확인

## 문제: ADB가 설치되지 않음

## 해결 방법

### 방법 1: 관리자 권한으로 Chocolatey 설치 (권장)

1. **PowerShell을 관리자 권한으로 실행**
   - Windows 키 → "PowerShell" 검색
   - "관리자 권한으로 실행" 선택

2. **ADB 설치**
   ```powershell
   choco install adb -y
   ```

3. **설치 확인**
   ```powershell
   adb version
   ```

4. **USB 연결 확인**
   ```powershell
   adb devices
   ```

---

### 방법 2: Platform Tools 직접 다운로드 (빠름)

1. **다운로드**
   - [Android Platform Tools 다운로드](https://developer.android.com/tools/releases/platform-tools)
   - Windows용 ZIP 파일 다운로드

2. **압축 해제**
   - 원하는 폴더에 압축 해제 (예: `C:\platform-tools`)

3. **사용 방법**
   ```powershell
   # 전체 경로로 실행
   C:\platform-tools\adb.exe devices
   
   # 또는 해당 폴더로 이동
   cd C:\platform-tools
   .\adb.exe devices
   ```

4. **APK 설치**
   ```powershell
   C:\platform-tools\adb.exe install C:\spo\sam-pyeong-oh-app\android\app\build\outputs\apk\debug\app-debug.apk
   ```

---

### 방법 3: Android Studio 설치

Android Studio를 설치하면 ADB가 자동으로 포함됩니다.

**ADB 경로:**
```
C:\Users\[사용자명]\AppData\Local\Android\Sdk\platform-tools\adb.exe
```

---

## USB 연결 확인

### 1. 핸드폰 설정

1. **개발자 옵션 활성화**
   - 설정 → 휴대전화 정보 (또는 디바이스 정보)
   - "빌드 번호"를 7번 연속으로 탭
   - "개발자가 되었습니다!" 메시지 확인

2. **USB 디버깅 활성화**
   - 설정 → 개발자 옵션
   - "USB 디버깅" 켜기
   - 경고 메시지에서 "확인" 선택

3. **USB 연결**
   - USB 케이블로 핸드폰과 PC 연결
   - 핸드폰에서 "USB 디버깅 허용" 팝업이 나타나면 **"허용"** 선택
   - "이 컴퓨터에서 항상 허용" 체크 (선택사항)

### 2. 연결 확인

```powershell
adb devices
```

**정상 연결 시:**
```
List of devices attached
ABC123XYZ    device
```

**연결 안 됨:**
```
List of devices attached
(비어있음)
```

---

## APK 설치

USB 연결이 확인되면:

```powershell
adb install C:\spo\sam-pyeong-oh-app\android\app\build\outputs\apk\debug\app-debug.apk
```

또는 프로젝트 폴더에서:
```powershell
cd C:\spo\sam-pyeong-oh-app
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 문제 해결

### "unauthorized" 오류
- 핸드폰에서 "USB 디버깅 허용" 팝업 확인
- "허용" 선택

### "device not found" 오류
- USB 케이블 확인
- USB 디버깅이 활성화되어 있는지 확인
- 다른 USB 포트 시도

### "waiting for device" 오류
- 핸드폰 잠금 해제
- USB 연결 모드를 "파일 전송" 또는 "MTP"로 설정


