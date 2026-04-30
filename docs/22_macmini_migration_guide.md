# 맥미니 운영 환경 이전 가이드

> **목적**: 현재 맥북에서 돌아가는 Simpson Health Check 서버를 집 맥미니로 이전.
> **결과**: 외부(폰)에서 `https://health.your-domain.com`으로 접속 가능 + 맥미니 24시간 운영.
> **소요 시간**: 약 30~50분 (Cloudflare 도메인 보유 가정).

---

## 0. 사전 준비 (맥북에서)

### 0-1. 데이터 + 인증 파일 백업

이 4개를 맥미니로 옮겨야 합니다:

| 항목 | 경로 | 크기 | 비고 |
|---|---|---|---|
| DB | `data/health.db` | 수십 KB | 모든 기록 (체중/식단/운동/인바디/AI 작업) |
| 사진 | `photos/` | 수~수십 MB | 식단/인바디 사진 |
| CSV 업로드 | `uploads/` | 수 KB | 인바디 CSV 백업 |
| Claude OAuth 토큰 | `data/config.json` | 1KB | (있으면) AI 인증 |

### 0-2. AGENTS.md 규약 확인 (보호 폴더)

`AGENTS.md`에 명시된 보호 대상:
> Treat `data/`, `photos/`, `uploads/`, and `simpson_data.json` as user data.

**이 4개 폴더/파일은 git에 커밋하지 않고 별도로 옮깁니다** (사진은 `.gitignore` 처리).

### 0-3. 백업 묶음 생성 (맥북에서)

```bash
cd /Users/simpson/Desktop/SIMPSON/health_check
tar czf ~/Desktop/health_data_backup.tgz \
    data/ photos/ uploads/ simpson_data.json 2>/dev/null
ls -lh ~/Desktop/health_data_backup.tgz
```

USB로 옮기거나 AirDrop으로 맥미니 전송.

---

## 1. 맥미니 기본 환경 세팅

### 1-1. 슬립 방지 (필수)

24시간 서버라 슬립 들어가면 외부 접속 끊깁니다.

```bash
# 슬립 끄기 (전원 연결 시)
sudo pmset -c sleep 0 displaysleep 30 disksleep 0
sudo pmset -c womp 1   # Wake on LAN

# 확인
pmset -g custom
# AC Power 쪽 sleep 0 / disksleep 0 이면 OK
```

### 1-2. 자동 로그인 (선택, 재부팅 자동복구용)

`시스템 설정 → 사용자 및 그룹 → 자동으로 로그인` 켜기. (보안상 꺼두고 LaunchDaemon으로 가는 게 깔끔하지만, 개인 서버면 자동 로그인이 편함)

### 1-3. 도구 설치

```bash
# Homebrew (없으면)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 필수 패키지
brew install python@3.11 node git cloudflared
```

### 1-4. Claude Code CLI 설치

서버 안의 AI 기능(식단 분석/주간 리포트/인바디 사진 파싱/건강 상담)이 `claude -p` 명령어로 동작합니다.

```bash
# Anthropic 공식 설치
curl -fsSL https://claude.ai/install.sh | bash

# 경로 확인
which claude
# 보통: /Users/<사용자>/.claude/local/claude
```

> ⚠️ `ai_engine.py:103`에 Claude CLI 경로가 **하드코딩 (`/Users/simpson/.claude/local/claude`)** 되어 있습니다. 맥미니 사용자명이 다르면 수정 필요. (§5 환경 변수화 권장 항목 참조)

### 1-5. Claude 로그인

```bash
claude login
# 브라우저로 가서 OAuth 인증
```

---

## 2. 코드 가져오기

```bash
mkdir -p ~/Servers
cd ~/Servers
git clone https://github.com/simpson5/HEALTH_CHECK.git health_check
cd health_check
```

> 저장소 이름이 다르면 수정. 기본 브랜치 `main`.

---

## 3. 데이터 복원 (맥북에서 받은 백업)

```bash
cd ~/Servers/health_check
# AirDrop/USB로 받은 ~/Desktop/health_data_backup.tgz 풀기
tar xzf ~/Desktop/health_data_backup.tgz

# 확인
ls data/health.db photos/ uploads/
```

`data/config.json`(Claude OAuth 토큰)이 있으면 같이 복원됩니다.

---

## 4. 의존성 설치 + 빌드 + 실행

```bash
chmod +x start.sh stop.sh
./start.sh
```

`start.sh`가 자동으로:
1. Python 패키지(fastapi, uvicorn) 설치 확인
2. 프론트엔드 첫 빌드 (`npm install` + `vite build`)
3. DB 스키마 idempotent 마이그레이션 (`init_db()`)
4. 서버 시작 (포트 18000)
5. Cloudflare Tunnel 시작 (config 있으면)

기동 후:
```bash
curl http://localhost:18000/api/data | head -c 200
```

JSON이 나오면 OK.

---

## 5. Cloudflare Tunnel 설정 (외부 접속 핵심)

### 사전 조건

- Cloudflare에 등록된 도메인 1개 (예: `simpson-space.com`)
- 도메인이 Cloudflare nameserver를 사용 중

### 5-1. cloudflared 인증

```bash
cloudflared tunnel login
```
브라우저가 열림 → 도메인 선택 → Authorize.
`~/.cloudflared/cert.pem` 파일이 생성됩니다.

### 5-2. 터널 생성

```bash
cloudflared tunnel create health
```
출력 예시:
```
Created tunnel health with id 9a7b3c2e-...-abc123
Wrote credentials file: /Users/simpson/.cloudflared/9a7b3c2e-...json
```

이 **터널 ID**(`9a7b3c2e-...-abc123`)를 메모.

### 5-3. DNS 라우팅

```bash
cloudflared tunnel route dns health health.simpson-space.com
```

`health.simpson-space.com`은 본인 도메인 기준으로 변경. Cloudflare 대시보드에서 CNAME 자동 생성됩니다.

### 5-4. config.yml 작성

```bash
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: 9a7b3c2e-...-abc123
credentials-file: /Users/<USER>/.cloudflared/9a7b3c2e-...-abc123.json

ingress:
  - hostname: health.simpson-space.com
    service: http://localhost:18000
  - service: http_status:404
EOF
```

`<USER>` 자리에 맥미니 사용자명, 터널 ID와 호스트명 본인 값으로.

### 5-5. 동작 확인

```bash
# 임시 실행
cloudflared tunnel run health

# 다른 터미널에서
curl https://health.simpson-space.com/api/data | head -c 200
```

JSON 보이면 성공.

---

## 6. 24시간 자동 실행 (LaunchAgent)

`./start.sh`는 셸 의존이라 로그아웃 시 같이 죽을 수 있습니다. **LaunchAgent**로 등록하면 부팅 + 로그인 시 자동 실행.

### 6-1. plist 작성

```bash
mkdir -p ~/Library/LaunchAgents
cat > ~/Library/LaunchAgents/com.simpson.health.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.simpson.health</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-lc</string>
        <string>cd /Users/<USER>/Servers/health_check &amp;&amp; ./start.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/simpson-health.out</string>
    <key>StandardErrorPath</key>
    <string>/tmp/simpson-health.err</string>
</dict>
</plist>
EOF

# <USER> 치환
sed -i '' "s/<USER>/$USER/g" ~/Library/LaunchAgents/com.simpson.health.plist
```

### 6-2. 등록

```bash
launchctl load ~/Library/LaunchAgents/com.simpson.health.plist
launchctl list | grep simpson
# com.simpson.health 가 보이면 OK
```

### 6-3. 종료/재시작

```bash
# 잠시 끄기
launchctl unload ~/Library/LaunchAgents/com.simpson.health.plist

# 다시 켜기
launchctl load ~/Library/LaunchAgents/com.simpson.health.plist

# 로그
tail -f /tmp/simpson-health.out
```

### 6-4. 부팅 후 자동 실행 확인

맥미니 재부팅 → 로그인 후 1분 이내에 `https://health.simpson-space.com` 접속되면 성공.

---

## 7. 모바일 홈 화면 추가 (PWA처럼)

iPhone Safari에서:
1. `https://health.simpson-space.com` 접속
2. 공유 → 홈 화면에 추가
3. 이름 `건강관리` 정도로 저장

---

## 8. 백업 (자동)

`backup_db.sh`가 이미 있습니다 — `data/backup/`에 DB 사본 생성.

cron 또는 LaunchAgent로 일 1회 자동 실행 권장:

```bash
# crontab -e
0 4 * * * cd ~/Servers/health_check && ./backup_db.sh
```

---

## 9. 트러블슈팅

| 증상 | 확인 / 해결 |
|---|---|
| 외부 접속 안 됨 | (a) 맥미니 로컬 `curl http://localhost:18000` 200 OK인지 (b) `cloudflared tunnel info health` 상태 (c) DNS 전파 시간(최대 5분) |
| AI 기능 작동 안 함 | `which claude` + `claude -p "test"` 직접 실행 → 토큰 만료면 `claude login` 다시 |
| `claude` 경로가 다르다 | `ai_engine.py:103` 하드코딩된 `/Users/simpson/.claude/local/claude` 수정 (§5 권장 개선) |
| 맥미니 슬립으로 죽음 | `pmset -g custom`에서 sleep 0 확인. caffeinate 백업: `caffeinate -dimsu &` |
| Cloudflare 502 | 백엔드 죽음. `tail /tmp/health-server.log` 또는 `launchctl list \| grep simpson` 상태 확인 |
| 빌드 실패 | `cd frontend && rm -rf node_modules dist && npm install && npx vite build` |
| 포트 18000 충돌 | `lsof -iTCP:18000 -sTCP:LISTEN` → 기존 프로세스 죽이기 |
| 외부 IP 노출되나? | Cloudflare Tunnel은 Cloudflare 엣지를 통해 inbound 연결을 받음 — 맥미니의 공인 IP/포트 개방 불필요. 라우터 포트포워딩 X |

---

## 10. 권장 후속 작업 (해도 되고 안 해도 됨)

1. **`ai_engine.py`의 Claude 경로 환경변수화**
   ```python
   CLAUDE_BIN = os.environ.get("CLAUDE_BIN", os.path.expanduser("~/.claude/local/claude"))
   ```
   `start.sh`에서 `export CLAUDE_BIN=...` 으로 주입. 사용자명 다른 PC에서 코드 수정 없이 동작.

2. **Cloudflare Access**: 토큰 또는 IP 화이트리스트로 외부 접속에 인증 추가.
3. **프록시 백업 도메인**: cf 장애 시 Tailscale로 폴백.
4. **CI**: GitHub Actions에서 `frontend npm run build` PR 검증.

---

## 11. 빠른 점검 명령어 모음

```bash
# 서버 상태
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:18000/         # 로컬
curl -s -o /dev/null -w "%{http_code}\n" https://health.simpson-space.com/  # 외부

# 프로세스
ps aux | grep -E "uvicorn|cloudflared" | grep -v grep

# 로그
tail -f /tmp/health-server.log
tail -f /tmp/health-tunnel.log
tail -f /tmp/simpson-health.out   # LaunchAgent stdout

# 재기동
./stop.sh && ./start.sh

# DB 확인
sqlite3 data/health.db "SELECT date, weight_kg FROM weight_records ORDER BY date DESC LIMIT 5;"
```

— 끝 —
