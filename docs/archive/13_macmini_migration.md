# 맥미니 서버 이전 계획서

> 작성일: 2026-03-25
> 목적: 맥북 → 맥미니로 건강관리 서버 이전
> 시점: 맥미니 도착 후

---

## 1. 현재 구성 (맥북)

```
맥북 (현재 서버)
├── /Users/simpson/Desktop/SIMPSON/health_check/
│   ├── server.py          (FastAPI, 포트 18000)
│   ├── database.py        (SQLite)
│   ├── data/health.db     (데이터)
│   ├── photos/            (식단/인바디 사진)
│   ├── uploads/           (CSV 등)
│   ├── frontend/dist/     (React 빌드)
│   └── backup_db.sh       (백업 스크립트)
├── Cloudflare Tunnel      (health.simpson-space.com)
├── Python 3.11 + FastAPI + uvicorn
└── Node.js 23 (프론트엔드 빌드용)
```

---

## 2. 이전할 항목

| 항목 | 크기 (추정) | 방법 |
|------|-----------|------|
| 프로젝트 폴더 전체 | ~500MB | rsync 또는 USB |
| data/health.db | ~1MB | 포함 |
| photos/ | ~100MB+ | 포함 |
| uploads/ | ~수 KB | 포함 |
| Cloudflare 인증 | ~/.cloudflared/ | 복사 |
| launchd plist | ~/Library/LaunchAgents/ | 새로 생성 |
| Python 환경 | - | 새로 설치 |
| Node.js | - | 새로 설치 |

---

## 3. 맥미니 초기 세팅

### 3-1. 기본 설치

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Python
brew install python@3.11
pip3 install fastapi uvicorn

# Node.js (프론트엔드 빌드용)
brew install node

# Cloudflare Tunnel
brew install cloudflared

# tmux (리모트 보험)
brew install tmux

# Git
brew install git
```

### 3-2. 슬립 방지

맥미니는 덮개 없으니 슬립만 방지하면 됩니다:

```bash
# 시스템 설정 → 에너지 → 디스플레이 끄기 후에도 자동으로 잠자기 방지 → 켜기
# 또는:
sudo pmset -c sleep 0 displaysleep 10
```

### 3-3. 고정 IP (로컬)

```bash
# 시스템 설정 → 네트워크 → Wi-Fi 또는 이더넷 → IP 수동 설정
# 공유기에서 DHCP 예약으로 고정 IP 할당 권장
```

---

## 4. 프로젝트 이전

### 4-1. 맥북에서 맥미니로 복사

**방법 A: 같은 네트워크 (추천)**

```bash
# 맥북에서 실행
rsync -avz --progress /Users/simpson/Desktop/SIMPSON/health_check/ \
  macmini유저@맥미니IP:/Users/macmini유저/Desktop/SIMPSON/health_check/
```

**방법 B: USB/외장하드**

```bash
# 맥북에서
cp -r /Users/simpson/Desktop/SIMPSON/health_check/ /Volumes/USB/health_check/

# 맥미니에서
cp -r /Volumes/USB/health_check/ ~/Desktop/SIMPSON/health_check/
```

### 4-2. Cloudflare 인증 복사

```bash
# 맥북에서
rsync -avz ~/.cloudflared/ macmini유저@맥미니IP:~/.cloudflared/
```

### 4-3. 의존성 설치

```bash
# 맥미니에서
cd ~/Desktop/SIMPSON/health_check
pip3 install fastapi uvicorn

# 프론트엔드 빌드 (필요 시)
cd frontend
npm install
npx vite build
```

---

## 5. 서버 실행 확인

```bash
# 서버 시작
cd ~/Desktop/SIMPSON/health_check
python3 -m uvicorn server:app --host 0.0.0.0 --port 18000

# 다른 터미널에서 확인
curl http://localhost:18000/api/data | head -100

# Cloudflare 터널 시작
cloudflared tunnel run health

# 외부 접속 확인
curl https://health.simpson-space.com
```

---

## 6. 자동 시작 설정 (launchd)

### 서버

```bash
cat > ~/Library/LaunchAgents/com.simpson.health-server.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.simpson.health-server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/python3</string>
        <string>-m</string>
        <string>uvicorn</string>
        <string>server:app</string>
        <string>--host</string>
        <string>0.0.0.0</string>
        <string>--port</string>
        <string>18000</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/USERNAME/Desktop/SIMPSON/health_check</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/health-server.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/health-server-err.log</string>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.simpson.health-server.plist
```

### 터널

```bash
cat > ~/Library/LaunchAgents/com.simpson.health-tunnel.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.simpson.health-tunnel</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>run</string>
        <string>health</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/health-tunnel.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/health-tunnel-err.log</string>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.simpson.health-tunnel.plist
```

### DB 백업 (매일 03시)

```bash
cat > ~/Library/LaunchAgents/com.simpson.health-backup.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.simpson.health-backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/USERNAME/Desktop/SIMPSON/health_check/backup_db.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>3</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.simpson.health-backup.plist
```

---

## 7. Cloudflare 터널 설정 변경

맥미니에서 터널이 실행되면, 기존 맥북 터널은 중지합니다.

```bash
# 맥북에서 (이전 완료 후)
launchctl unload ~/Library/LaunchAgents/com.simpson.health-tunnel.plist
launchctl unload ~/Library/LaunchAgents/com.simpson.health-server.plist
```

config.yml은 맥미니에서 그대로 사용 가능 (인증서만 복사하면 됨).

---

## 8. 체크리스트

### 이전 전
- [ ] 맥미니 초기 세팅 (Homebrew, Python, Node, cloudflared)
- [ ] 슬립 방지 설정
- [ ] 네트워크 고정 IP

### 이전 중
- [ ] 프로젝트 폴더 복사
- [ ] ~/.cloudflared/ 복사
- [ ] pip install fastapi uvicorn
- [ ] 프론트엔드 빌드 확인
- [ ] 서버 로컬 테스트 (localhost:18000)
- [ ] 터널 테스트 (health.simpson-space.com)

### 이전 후
- [ ] launchd 서버 자동 시작
- [ ] launchd 터널 자동 시작
- [ ] launchd DB 백업
- [ ] 맥북 서버/터널 중지
- [ ] 폰에서 외부 접속 확인
- [ ] 재부팅 테스트

---

## 9. 예상 소요 시간

| 단계 | 시간 |
|------|------|
| 맥미니 초기 세팅 | 30분 |
| 프로젝트 복사 | 10분 |
| 의존성 설치 | 10분 |
| 서버 + 터널 테스트 | 10분 |
| launchd 설정 | 10분 |
| 검증 | 10분 |
| **총** | **약 1시간 20분** |

---

## 10. 롤백 계획

문제 발생 시 맥북에서 다시 서버 시작하면 됩니다:

```bash
# 맥북에서
cd /Users/simpson/Desktop/SIMPSON/health_check
python3 -m uvicorn server:app --host 0.0.0.0 --port 18000 &
cloudflared tunnel run health &
```

맥북 프로젝트 폴더는 삭제하지 않고 유지합니다.
