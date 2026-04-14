# Simpson Health Check

개인 건강관리 웹앱 — 체중/식단/운동/인바디/투약 기록 + AI 자동 분석

## 기술 스택

- **백엔드**: Python FastAPI + SQLite
- **프론트엔드**: React + Tailwind CSS + Recharts
- **AI**: Claude Code CLI (`claude -p`)
- **외부 접속**: Cloudflare Tunnel
- **빌드**: Vite

---

## 빠른 시작

```bash
git clone <repo-url>
cd health_check
./start.sh
```

브라우저에서 `http://localhost:18000` 접속.

---

## 설치 가이드 (첫 실행)

### 1. 필수 소프트웨어 설치

```bash
# macOS (Homebrew)
brew install python@3.11 node

# pip 패키지 (start.sh가 자동 설치하지만, 수동 시)
pip3 install fastapi uvicorn
```

### 2. 소스 받기

```bash
git clone <repo-url>
cd health_check
```

### 3. 실행

```bash
chmod +x start.sh stop.sh
./start.sh
```

start.sh가 자동으로:
- Python 패키지 확인/설치
- 프론트엔드 빌드 (최초 1회)
- DB 초기화 (최초 1회)
- 서버 시작 (포트 18000)
- Cloudflare Tunnel 시작 (설정 있으면)

### 4. 종료

```bash
./stop.sh
```

---

## 외부 접속 설정 (선택)

외부(폰 등)에서 접속하려면 Cloudflare Tunnel 설정 필요.

### 4-1. Cloudflare 설치

```bash
brew install cloudflared
```

### 4-2. 인증 (1회)

```bash
cloudflared tunnel login
# → 브라우저에서 도메인 선택
```

### 4-3. 터널 생성 (1회)

```bash
cloudflared tunnel create health
cloudflared tunnel route dns health health.your-domain.com
```

### 4-4. config.yml 작성

```bash
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: <터널ID>
credentials-file: ~/.cloudflared/<터널ID>.json

ingress:
  - hostname: health.your-domain.com
    service: http://localhost:18000
  - service: http_status:404
EOF
```

### 4-5. 실행

```bash
./start.sh
# → 자동으로 터널 시작됨
```

---

## 기존 데이터 이전 (선택)

다른 PC에서 데이터를 가져오려면:

```bash
# 기존 PC에서
scp data/health.db new-pc:~/health_check/data/
scp -r photos/ new-pc:~/health_check/photos/
scp -r uploads/ new-pc:~/health_check/uploads/
```

또는 USB로 복사:
- `data/health.db` — DB
- `photos/` — 식단/인바디 사진
- `uploads/` — CSV 등 업로드 파일

---

## AI 설정 (선택)

웹에서 AI 기능(식단 분석, 리포트 자동 생성 등)을 사용하려면:

### 방법 A: 기존 Claude Code 로그인 사용

```bash
# 터미널에서 로그인 (1회)
claude login
# → 이후 start.sh 실행 시 자동 인증
```

### 방법 B: OAuth 토큰

```bash
# 토큰 발급
claude setup-token
# → 토큰 복사
```

웹 설정 페이지(`/settings`)에서 토큰 붙여넣기.

### 방법 C: API 키

웹 설정 페이지에서 Anthropic API 키 입력. (종량제 과금)

---

## 폴더 구조

```
health_check/
├── start.sh              # 실행 스크립트
├── stop.sh               # 종료 스크립트
├── server.py             # FastAPI 서버
├── database.py           # DB 관리
├── ai_engine.py          # AI 엔진 (claude -p 래퍼)
├── csv_parser.py         # 인바디 CSV 파서
├── backup_db.sh          # 백업 스크립트
├── data/
│   ├── health.db         # SQLite DB
│   ├── config.json       # 설정 (토큰 등, gitignore)
│   └── backup/           # 자동 백업
├── photos/               # 식단/인바디 사진
├── uploads/              # CSV 등 업로드
├── frontend/
│   ├── src/              # React 소스
│   └── dist/             # 빌드 결과 (서버가 서빙)
├── .claude/
│   └── commands/
│       └── health.md     # /health 스킬
└── docs/                 # 기획/설계 문서
```

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 홈 | 오늘 체중/미션/단백질/식단 요약 |
| 식단 | 날짜별 식단 조회 + 사진 |
| 체중 | 체중 그래프 + 인바디 상세 |
| 운동 | 운동 시작/기록 + 부위별 가이드 |
| 기록 | 체중/식단/투약 직접 입력 + AI 보조 |
| 달력 | 월간/주간 미션 달성 + 일정 |
| 건강팁 | 운동/식단 가이드 + 로드맵 |
| 설정 | AI 토큰 + 서버 상태 + 작업 로그 |
