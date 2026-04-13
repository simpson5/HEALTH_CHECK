# 미니 PC 서버 + AI 자동화 종합 계획서

> 작성일: 2026-04-13
> 목적: 맥북 의존 탈피 → 미니 PC 24시간 서버 + 웹에서 AI 자동 처리

---

## 1. 전체 구조

```
[Simpson 폰] → 인터넷 → [Cloudflare Tunnel] → [미니 PC (집)]
                                                  ├── FastAPI 서버
                                                  ├── SQLite DB
                                                  ├── React 프론트엔드
                                                  └── Claude Code CLI (AI 엔진)

흐름:
  폰 → 사진/텍스트 입력 → [🤖 보내기]
    → 서버 → claude -p "프롬프트" 실행
      → Claude Code가 분석 + DB 저장
        → 결과를 웹에 표시
```

---

## 2. 해결하는 문제

| 문제 | 현재 | 해결 |
|------|------|------|
| 맥북 들고다녀야 함 | 맥북이 서버 | **미니 PC 24시간 상시 가동** |
| AI 분석은 수동 | 사진 올리고 → 클로드한테 말해야 함 | **웹 버튼 하나로 자동** |
| 리포트 수동 작성 | 매번 요청해야 함 | **버튼 누르면 자동 생성** |
| 식단 등록 귀찮음 | 사진+텍스트 → 클로드 대화 | **사진+한줄 → 자동 등록** |
| 어디서든 접속 | Cloudflare Tunnel | **그대로 유지** |

---

## 3. 시스템 구성

### 3-1. 미니 PC 설치 항목

```
필수:
  - Python 3.11+
  - Node.js 23+
  - FastAPI + uvicorn
  - Claude Code CLI (npm install -g @anthropic-ai/claude-code)
  - Cloudflare Tunnel (cloudflared)
  - SQLite (Python 내장)
  - Git

선택:
  - tmux (리모트 보험)
```

### 3-2. 인증

| 항목 | 방법 |
|------|------|
| Cloudflare | ~/.cloudflared/ 인증서 복사 |
| Claude Code | **OAuth 토큰** (웹에서 설정 가능) |
| 웹 접속 | PIN 인증 (추후) |

### 3-3. 폴더 구조

```
health_check/
├── server.py              # FastAPI 서버
├── database.py            # DB 관리
├── ai_engine.py           # Claude CLI 래퍼 (신규)
├── data/
│   ├── health.db          # SQLite DB
│   ├── config.json        # 설정 (토큰 등, 신규)
│   └── backup/            # 일일 백업
├── photos/
├── uploads/
├── frontend/
│   ├── src/               # React 소스
│   └── dist/              # 빌드
└── .claude/
    └── commands/
        └── health.md      # /health 스킬
```

---

## 4. AI 엔진 (ai_engine.py)

### 4-1. Claude CLI 래퍼

```python
# ai_engine.py
import subprocess
import json
import os
import asyncio
from pathlib import Path

CONFIG_PATH = "data/config.json"

def get_token():
    """설정 파일에서 토큰 읽기"""
    if Path(CONFIG_PATH).exists():
        config = json.loads(Path(CONFIG_PATH).read_text())
        return config.get("claude_oauth_token")
    return None

async def run_claude(prompt, timeout=120):
    """Claude Code CLI 비대화형 실행"""
    token = get_token()
    env = os.environ.copy()
    if token:
        env["CLAUDE_CODE_OAUTH_TOKEN"] = token
    
    proc = await asyncio.create_subprocess_exec(
        "claude", "-p", prompt,
        "--output-format", "json",
        cwd=str(Path(__file__).parent),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=env,
    )
    stdout, stderr = await proc.communicate()
    
    return {
        "ok": proc.returncode == 0,
        "output": stdout.decode(),
        "error": stderr.decode() if proc.returncode != 0 else None,
    }
```

### 4-2. 작업 큐 (동시 실행 방지)

```python
import asyncio

_queue = asyncio.Queue()
_processing = False

async def enqueue_task(prompt):
    """작업을 큐에 추가하고 결과 대기"""
    future = asyncio.get_event_loop().create_future()
    await _queue.put((prompt, future))
    if not _processing:
        asyncio.create_task(process_queue())
    return await future

async def process_queue():
    """큐에서 하나씩 처리"""
    global _processing
    _processing = True
    while not _queue.empty():
        prompt, future = await _queue.get()
        result = await run_claude(prompt)
        future.set_result(result)
    _processing = False
```

---

## 5. 서버 API 추가

### 5-1. AI 처리 API

```python
# server.py에 추가

@app.post("/api/ai/process")
async def ai_process(request: Request):
    """범용 AI 처리 — 텍스트/사진 분석"""
    body = await request.json()
    prompt = body.get("prompt", "")
    photo = body.get("photo")  # 사진 경로 (있으면)
    
    # 프롬프트 구성
    full_prompt = ""
    if photo:
        full_prompt += f"사진 {photo} 를 분석해줘. "
    full_prompt += prompt
    
    result = await enqueue_task(full_prompt)
    return JSONResponse(result)

@app.post("/api/ai/daily-report")
async def ai_daily_report():
    """오늘 일일 리포트 자동 생성"""
    result = await enqueue_task(
        "오늘 일일 리포트 작성해줘. DB에서 오늘 식단/운동/체중 데이터 확인하고 리포트 생성 후 DB에 저장해."
    )
    return JSONResponse(result)

@app.post("/api/ai/analyze-photo")
async def ai_analyze_photo(request: Request):
    """사진 분석 → 식단 자동 등록"""
    body = await request.json()
    photo = body["photo"]
    memo = body.get("memo", "")
    
    prompt = f"사진 {photo} 확인해서 식단 등록해줘. {memo}"
    result = await enqueue_task(prompt)
    return JSONResponse(result)

@app.post("/api/ai/analyze-csv")
async def ai_analyze_csv(request: Request):
    """인바디 CSV 자동 파싱 → 등록"""
    body = await request.json()
    csv_path = body["path"]
    
    prompt = f"인바디 CSV 파일 {csv_path} 분석해서 인바디 기록 등록해줘."
    result = await enqueue_task(prompt)
    return JSONResponse(result)
```

### 5-2. 설정 API (토큰 관리)

```python
@app.get("/api/settings")
def get_settings():
    """설정 조회 (토큰은 마스킹)"""
    config = json.loads(Path(CONFIG_PATH).read_text()) if Path(CONFIG_PATH).exists() else {}
    token = config.get("claude_oauth_token", "")
    return {
        "has_token": bool(token),
        "token_preview": token[:10] + "..." if len(token) > 10 else "",
    }

@app.post("/api/settings/token")
async def set_token(request: Request):
    """OAuth 토큰 저장"""
    body = await request.json()
    config = json.loads(Path(CONFIG_PATH).read_text()) if Path(CONFIG_PATH).exists() else {}
    config["claude_oauth_token"] = body["token"]
    Path(CONFIG_PATH).write_text(json.dumps(config, indent=2))
    return JSONResponse({"ok": True})
```

---

## 6. 웹 UI 추가

### 6-1. AI 채팅/명령 패널

```
┌─────────────────────────────────┐
│  🤖 AI 건강관리                   │
│                                  │
│  [📷 사진]  [📄 파일]             │
│                                  │
│  [점심 김치찌개 반인분_________]   │
│                                  │
│  [🤖 보내기]                      │
│                                  │
│  ── AI 응답 ──                   │
│  ✅ 점심 등록 완료                │
│  김치찌개 0.5인분                 │
│  325kcal · P10g · C44g           │
│                                  │
│  오늘 단백질: 34g / 110g         │
│  ⚠️ 저녁에 단백질 챙기세요        │
│                                  │
│  ── 빠른 명령 ──                 │
│  [📊 일일리포트]  [📋 주간리포트]  │
│  [🔍 현황]       [💊 투약기록]    │
└─────────────────────────────────┘
```

### 6-2. 설정 페이지

```
┌─────────────────────────────────┐
│  ⚙️ 설정                         │
│                                  │
│  Claude 인증                     │
│  OAuth 토큰:                     │
│  [________________________________] │
│  상태: ✅ 인증됨                  │
│  [저장]                          │
│                                  │
│  서버 정보                       │
│  DB: 156건 · 사진: 15개          │
│  마지막 백업: 2026-04-13 03:00   │
└─────────────────────────────────┘
```

### 6-3. 하단 네비 변경

```
현재: [📊 대시보드] [📖 가이드] [🍽️ 음식관리]
변경: [📊 대시보드] [🤖 AI] [📖 가이드] [⚙️ 설정]
```

---

## 7. 구현 순서

### Phase 1: 미니 PC 기본 이전 (1시간)
- [ ] 프로젝트 복사 (rsync)
- [ ] Python/Node/cloudflared 설치
- [ ] 서버 실행 확인
- [ ] Cloudflare 터널 연결
- [ ] health.simpson-space.com 접속 확인

### Phase 2: Claude Code CLI 설정 (30분)
- [ ] Claude Code CLI 설치 (`npm install -g @anthropic-ai/claude-code`)
- [ ] OAuth 토큰 발급 (`claude setup-token`)
- [ ] `claude -p "테스트"` 동작 확인
- [ ] CLAUDE.md, /health 스킬 동작 확인

### Phase 3: AI 엔진 구현 (1시간)
- [ ] ai_engine.py 작성 (CLI 래퍼 + 큐)
- [ ] server.py에 AI API 추가
- [ ] 설정 API (토큰 관리)
- [ ] API 테스트

### Phase 4: 웹 UI (1.5시간)
- [ ] AI 채팅 페이지 (React)
- [ ] 사진 + 텍스트 입력 → AI 처리
- [ ] 빠른 명령 버튼 (리포트, 현황 등)
- [ ] 설정 페이지 (토큰 입력)
- [ ] 하단 네비 변경

### Phase 5: 자동화 + 안정화 (30분)
- [ ] launchd 서버/터널/백업 자동 시작
- [ ] 슬립 방지 설정
- [ ] 에러 핸들링 (타임아웃, 인증 실패 등)
- [ ] 맥북 서버 중지

---

## 8. 완성 후 사용 흐름

### 식단 등록
```
폰 → 사진 찍기 → "점심 김치찌개" 입력 → [🤖 보내기]
→ AI가 사진 분석 + 영양소 추정 + DB 저장
→ "✅ 등록 완료. P10g. 오늘 총 34g/110g"
```

### 일일 리포트
```
폰 → [📊 일일리포트] 버튼
→ AI가 오늘 데이터 종합 → 리포트 작성 + DB 저장
→ 리포트 표시
```

### 건강 상담
```
폰 → "근육통 있는데 운동해도 돼?" 입력 → [🤖 보내기]
→ AI가 답변 표시
```

### 인바디 등록
```
폰 → CSV 업로드 → [🤖 보내기]
→ AI가 CSV 파싱 + 분석 + DB 저장
→ "✅ 인바디 등록. 체지방 -0.9kg"
```

---

## 9. 비용

| 항목 | 비용 |
|------|------|
| 미니 PC | 이미 보유 |
| 전기세 | 월 ~2,000원 (맥미니 기준) |
| Claude Code 구독 | 기존 Max 플랜 (변경 없음) |
| Cloudflare | 무료 |
| 도메인 | 연 ~$10 (기존) |
| **추가 비용** | **월 ~2,000원 (전기세만)** |

---

## 10. 롤백

문제 발생 시 맥북에서 다시 서버 시작:
```bash
cd /Users/simpson/Desktop/SIMPSON/health_check
python3 -m uvicorn server:app --host 0.0.0.0 --port 18000 &
cloudflared tunnel run health &
```
