# 미니 PC 서버 + AI 자동화 종합 계획서 v2 (확정)

> 작성일: 2026-04-13 (v2 확정)
> 목적: 미니 PC 24시간 서버 + 웹에서 AI 자동 처리
> 원칙: **기능 수보다 첫 실행 경험의 단순함**

---

## 1. 설계 원칙 (확정)

| 원칙 | 결정 | 이유 |
|------|------|------|
| 저장 방식 | **초안→확인→저장** | 건강 데이터 신뢰성. frequent_foods 매칭만 자동 |
| 보안 | **Cloudflare Access** | 외부 접속 열리면 PIN만으로 부족 |
| AI 실행 | **claude -p** | 구독 포함, 도입 쉬움. 추후 교체 가능 구조 유지 |
| 대기 UI | **상태 표시** | queued/running/done/failed. 스트리밍 아님 |
| 백업 | **DB + 사진 + 설정 전체** | DB만 백업하면 불완전 |
| 첫 실행 | **소스 받기 → 웹 토큰 입력 → 바로 사용** | CLI 노출 최소화 |
| CSV 파싱 | **코드 파서** | AI보다 정확+빠름. AI는 해석만 |
| API 구조 | **목적형** | 범용 ai/process 대신 diet-draft, daily-report, coach |
| AI 응답 | **JSON 강제** | mode + payload + message 구조 |
| 작업 로그 | **ai_jobs 테이블** | 장애 복구 + 프롬프트 품질 개선 |

---

## 2. 전체 구조

```
[폰] → Cloudflare Access 인증 → Cloudflare Tunnel → [미니 PC]
                                                       ├── FastAPI 서버 (:18000)
                                                       ├── SQLite DB
                                                       ├── React 프론트엔드
                                                       └── claude -p (AI 엔진)
```

---

## 3. 첫 실행 흐름 (사용자 관점)

```
1. 미니 PC에 소스 클론
   $ git clone ... && cd health_check

2. 의존성 설치
   $ pip install -r requirements.txt && cd frontend && npm install && npx vite build

3. 서버 시작
   $ python3 -m uvicorn server:app --host 0.0.0.0 --port 18000

4. 웹 접속 → 설정 페이지
   - OAuth 토큰 붙여넣기 → [저장]
   - Cloudflare Tunnel 토큰 입력 (또는 CLI 1회 설정)

5. 바로 사용 시작
```

CLI 설치/인증/명령어를 사용자에게 노출하지 않음. 웹에서 전부 처리.

---

## 4. AI 엔진 (ai_engine.py)

### 4-1. CLI 래퍼

```python
async def run_claude(prompt, timeout=120):
    """claude -p 실행. 토큰은 환경변수 우선, 없으면 config에서."""
    token = os.environ.get("CLAUDE_CODE_OAUTH_TOKEN") or get_config_token()
    env = os.environ.copy()
    if token:
        env["CLAUDE_CODE_OAUTH_TOKEN"] = token

    proc = await asyncio.create_subprocess_exec(
        "claude", "-p", prompt, "--output-format", "json",
        cwd=PROJECT_ROOT, env=env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    return {"ok": proc.returncode == 0, "output": stdout.decode(), "error": stderr.decode()}
```

### 4-2. 작업 큐 (DB 기반)

메모리 큐 대신 **ai_jobs 테이블**에 상태 저장.

```sql
CREATE TABLE ai_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,           -- diet_draft, daily_report, coach
    status TEXT DEFAULT 'queued', -- queued / running / done / failed
    input_json TEXT,              -- 입력 (프롬프트, 사진 경로 등)
    output_json TEXT,             -- AI 응답 (JSON)
    error TEXT,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

작업 흐름:
```
1. 웹에서 요청 → ai_jobs에 queued로 INSERT → job_id 반환
2. 백그라운드 워커가 큐 처리 (한 번에 하나)
3. 상태: queued → running → done/failed
4. 웹에서 job_id로 폴링 → 상태+결과 확인
```

---

## 5. API 설계 (목적형)

### 5-1. 식단 초안 생성

```
POST /api/ai/diet-draft
Body: { "photo": "photos/xxx.jpg", "memo": "점심 김치찌개" }

→ AI가 분석 → JSON 초안 생성 (DB 저장 안 함)

Response:
{
    "job_id": 42,
    "status": "done",
    "mode": "diet_draft",
    "message": "점심 기록 초안을 만들었습니다.",
    "payload": {
        "date": "2026-04-13",
        "meal_type": "점심",
        "food_name": "김치찌개",
        "quantity": "0.5인분",
        "protein_g": 10,
        "calories_kcal": 325
    }
}

→ 사용자가 확인 → [저장] 버튼 → POST /api/diet (기존 API)
```

### 5-2. 일일 리포트 자동 생성

```
POST /api/ai/daily-report
Body: { "date": "2026-04-13" }

→ AI가 DB에서 데이터 종합 → 리포트 초안 생성

Response:
{
    "job_id": 43,
    "status": "done",
    "mode": "daily_report",
    "message": "4/13 일일 리포트입니다.",
    "payload": {
        "date": "2026-04-13",
        "score": "A",
        "analysis": "단백질 121g 달성...",
        "highlights": ["✅ ...", "✅ ..."],
        ...
    }
}

→ 사용자가 확인 → [저장] → POST /api/report/daily
```

### 5-3. 건강 상담

```
POST /api/ai/coach
Body: { "question": "근육통 있는데 운동해도 돼?" }

→ AI가 답변 (DB 저장 없음, 대화만)

Response:
{
    "job_id": 44,
    "status": "done",
    "mode": "coach",
    "message": "근육통이 심하면 해당 부위는 쉬는 게 좋습니다..."
}
```

### 5-4. frequent_foods 자동 매칭 (예외: 즉시 저장)

```
POST /api/ai/quick-diet
Body: { "text": "쉐이크 먹었어" }

→ frequent_foods에서 매칭 검색
→ 매칭되면 바로 DB 저장 (AI 안 거침)

Response:
{
    "mode": "quick_diet",
    "auto_saved": true,
    "message": "닥터유 프로 쉐이크 등록 완료 (P24g)"
}
```

### 5-5. 작업 상태 조회

```
GET /api/ai/jobs/:id

Response:
{
    "id": 42,
    "status": "running",  -- queued / running / done / failed
    "type": "diet_draft",
    "created_at": "..."
}
```

### 5-6. 설정

```
GET  /api/settings          -- 설정 조회 (토큰 마스킹)
POST /api/settings/token    -- 토큰 저장
GET  /api/settings/status   -- AI 엔진 상태 (인증됨/안됨, 최근 작업 등)
```

---

## 6. 웹 UI

### 6-1. AI 패널 (핵심 화면)

```
┌─────────────────────────────────┐
│  🤖 AI 건강관리                   │
│                                  │
│  [📷 사진]  [📄 파일]             │
│  [점심 김치찌개 반인분_________]   │
│  [🤖 보내기]                      │
│                                  │
│  ── 처리 상태 ──                  │
│  ⏳ 분석 중... (10초)             │  ← queued/running
│                                  │
│  ── AI 초안 ──                   │
│  점심: 김치찌개 0.5인분            │
│  325kcal · P10g · C44g           │
│  [✅ 저장] [✏️ 수정] [❌ 취소]     │  ← 확인 후 저장
│                                  │
│  ── 빠른 명령 ──                 │
│  [📊 일일리포트]  [📋 주간리포트]  │
│  [💬 상담]                       │
│                                  │
│  ── 빠른 등록 ──                 │
│  [쉐이크] [닭가슴살] [훈제란]      │  ← frequent_foods 즉시 등록
└─────────────────────────────────┘
```

### 6-2. 설정 페이지

```
┌─────────────────────────────────┐
│  ⚙️ 설정                         │
│                                  │
│  ── Claude 인증 ──               │
│  OAuth 토큰: [______________]    │
│  상태: ✅ 인증됨                  │
│  [저장]                          │
│                                  │
│  ── 서버 상태 ──                 │
│  DB: 200건 · 사진: 20개          │
│  최근 AI 작업: 3분 전 (성공)      │
│  마지막 백업: 오늘 03:00          │
│                                  │
│  ── 최근 AI 작업 로그 ──         │
│  #44 coach     done   2분 전     │
│  #43 report    done   1시간 전   │
│  #42 diet_draft done  2시간 전   │
└─────────────────────────────────┘
```

### 6-3. 하단 네비

```
[📊 대시보드] [🤖 AI] [📖 가이드] [⚙️ 설정]
```

---

## 7. 보안

| 계층 | 방법 |
|------|------|
| 외부 접속 | **Cloudflare Access** (이메일 인증 or OTP) |
| 토큰 저장 | **환경변수 우선**, config.json은 예비 (gitignore) |
| API 보호 | Cloudflare Access 뒤에 있으므로 추가 인증 불필요 |
| config.json | .gitignore에 포함, 권한 600 |

---

## 8. 백업 (전체)

```bash
#!/bin/bash
# backup_full.sh
BACKUP_DIR="data/backup"
DATE=$(date +%Y%m%d)
mkdir -p "$BACKUP_DIR"

# DB + 사진 + 설정 전체 압축
tar -czf "$BACKUP_DIR/health_${DATE}.tar.gz" \
    data/health.db \
    photos/ \
    uploads/ \
    data/config.json \
    2>/dev/null

# 30일 이상 삭제
find "$BACKUP_DIR" -name "health_*.tar.gz" -mtime +30 -delete

# 주간 백업은 4주 보관
if [ $(date +%u) -eq 1 ]; then
    cp "$BACKUP_DIR/health_${DATE}.tar.gz" "$BACKUP_DIR/weekly_${DATE}.tar.gz"
fi
find "$BACKUP_DIR" -name "weekly_*.tar.gz" -mtime +28 -delete
```

---

## 9. CSV 파싱 (코드 기반)

인바디 CSV는 AI 대신 Python 파서로 직접 처리:

```python
# csv_parser.py
def parse_inbody_csv(filepath):
    """인바디 CSV → dict 변환. AI 불필요."""
    import csv
    with open(filepath) as f:
        reader = csv.DictReader(f)
        row = next(reader)
    return {
        "date": parse_date(row["날짜"]),
        "weight_kg": float(row["체중(kg)"]),
        "muscle_kg": float(row["골격근량(kg)"]),
        "fat_kg": float(row["체지방량(kg)"]),
        "fat_pct": float(row["체지방률(%)"]),
        "bmi": float(row["BMI(kg/m²)"]),
        "bmr_kcal": int(row["기초대사량(kcal)"]),
        "visceral_fat_level": int(row["내장지방레벨(Level)"]),
        "inbody_score": float(row["인바디점수"]),
    }
```

CSV 업로드 → 코드 파서 → 결과 표시 → [저장] 확인. AI는 변화 해석만 담당.

---

## 10. 구현 일정

### 실제 코딩 시간 기준

| # | 작업 | 시간 |
|---|------|------|
| 1 | ai_jobs 테이블 + ai_engine.py | 40분 |
| 2 | 목적형 API 3개 (diet-draft, daily-report, coach) | 40분 |
| 3 | quick-diet (frequent_foods 즉시 매칭) | 20분 |
| 4 | CSV 파서 | 15분 |
| 5 | 설정 API (토큰 관리) | 15분 |
| 6 | 웹 AI 패널 (React) | 1.5시간 |
| 7 | 웹 설정 페이지 | 30분 |
| 8 | Cloudflare Access 설정 | 20분 |
| 9 | 백업 스크립트 (전체) | 10분 |
| **합계** | | **약 4시간** |

### 우선순위 (붙이는 순서)

```
1차: daily-report (가치 크고 실패해도 안전)
2차: diet-draft + 사진 분석 (핵심 기능)
3차: quick-diet (편의 기능)
4차: coach (대화형)
```

---

## 11. 미니 PC 이전 (별도)

docs/13_macmini_migration.md 참조. 이전 후 위 기능 붙이기.

---

## 12. 성공 기준

| 기준 | 측정 |
|------|------|
| 첫 실행 5분 이내 | 소스 클론 → 서버 시작 → 웹 토큰 설정 → 사용 |
| 식단 등록 30초 이내 | 사진+한줄 → AI 초안 → 확인 → 저장 |
| 일일 리포트 1탭 | 버튼 누르면 자동 생성 |
| AI 실패 시 수동 가능 | AI 없어도 기존 수동 등록 그대로 동작 |
