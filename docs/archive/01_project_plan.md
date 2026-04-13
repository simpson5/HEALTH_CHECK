# Simpson Health Check - 프로젝트 기획서 v2

> 작성일: 2026-03-18 (v2 수정)
> 목적: 마운자로 투약 중 체중/식단/몸상태 관리 자동화 시스템

---

## 1. 핵심 컨셉

```
[Simpson] → 클로드한테 말/사진 전달 → [Claude Code가 JSON + 사진 관리]
                                              ↓
[폰 브라우저] ← 대시보드 조회 (보기만) ← [FastAPI 서버 (Mac)]
```

### 원칙
- **모바일 = 보기만** (입력 폼 없음)
- **데이터 입력 = 클로드가 처리** (너가 말하면 내가 JSON 편집 + 사진 저장)
- **최소 구조** (FastAPI 파일 1개 + 정적 HTML + JSON)

---

## 2. 현재 상태

| 파일 | 역할 | 상태 |
|------|------|------|
| `simpson_data.json` | 인바디 + 식단 데이터 원본 | 클로드가 관리 |
| `simpson_dashboard.html` | 대시보드 (차트 5탭 + 식단탭) | 데이터 하드코딩 → 동적 전환 필요 |
| `workout_guide.html` | 머신 운동 5종 가이드 | 완성, 변경 불필요 |
| `simpson_status.md` | 현황 정리 문서 | 클로드가 관리 |

### 문제점
1. 대시보드 데이터가 HTML에 하드코딩 → JSON에서 읽도록 전환 필요
2. 서버 없음 → 외부 접속 불가
3. 사진 관리 없음

---

## 3. 시스템 구조

```
health_check/
├── server.py                # FastAPI 서버 (파일 1개, 최소 구성)
├── simpson_data.json        # 데이터 원본 (클로드가 편집)
├── simpson_status.md        # 현황 문서 (클로드가 편집)
├── static/
│   ├── index.html           # 메인 대시보드 (JSON fetch로 동적)
│   ├── workout.html         # 운동 가이드 (기존 이관)
│   └── css/                 # 스타일 (필요시)
├── photos/                  # 식단/인바디 사진 저장
│   ├── 2026-03-18_점심.jpg
│   ├── 2026-03-18_인바디.jpg
│   └── ...
├── PROJECT_PLAN.md          # 이 문서
└── MAC_SERVER_SETUP.md      # Mac 서버 세팅 가이드
```

---

## 4. 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| **서버** | Python FastAPI (최소) | `server.py` 1개, 정적 파일 서빙 + JSON API |
| **데이터** | JSON 파일 유지 | DB 불필요, 클로드가 직접 편집 |
| **프론트** | HTML + Chart.js | 기존 대시보드 UI 재활용 |
| **사진** | `photos/` 폴더 | 클로드가 저장, 웹에서 `<img>` 표시 |
| **외부 접속** | Cloudflare Tunnel (무료) | HTTPS 자동, 도메인 불필요 |

---

## 5. 데이터 흐름

### 식단 기록
```
1. Simpson: "점심 김치찌개 반인분 먹었어" (사진 첨부)
2. Claude: simpson_data.json에 식단 추가
3. Claude: 사진 → photos/2026-03-18_점심.jpg 저장
4. 폰 새로고침 → 대시보드에 반영
```

### 인바디 기록
```
1. Simpson: 인바디 사진 첨부 "오늘 인바디"
2. Claude: 사진에서 수치 읽어서 simpson_data.json 업데이트
3. Claude: 사진 → photos/2026-03-18_인바디.jpg 저장
4. 대시보드 자동 반영
```

### 사진 관리
```
simpson_data.json 내 식단 기록:
{
  "food_name": "김치찌개 0.5인분",
  "photo": "photos/2026-03-18_점심.jpg",  ← 경로 저장
  ...
}

대시보드 HTML:
<img src="/photos/2026-03-18_점심.jpg">  ← 서버가 서빙
```

---

## 6. 화면 구성 (모바일, 보기 전용)

### 메인 대시보드 (`/`)
- 기존 대시보드 UI 그대로 (다크 테마, 카드형, Chart.js)
- 데이터를 `simpson_data.json`에서 fetch → 자동 갱신
- 탭: `개요` | `그래프` | `식단` | `기록` | `예측`

### 식단 탭 변경점
- 각 끼니 카드에 **사진 표시** 추가
- 사진 탭하면 확대

### 하단 네비게이션
- `대시보드` | `운동가이드`
- (입력 폼 없음 — 클로드가 처리)

---

## 7. server.py 설계 (최소)

```python
# 전체 ~20줄
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import json

app = FastAPI()

# JSON 데이터 API
@app.get("/api/data")
def get_data():
    with open("simpson_data.json") as f:
        return json.load(f)

# 정적 파일 (HTML, CSS, JS, 사진)
app.mount("/photos", StaticFiles(directory="photos"), name="photos")
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

실행:
```bash
pip install fastapi uvicorn
uvicorn server:app --host 0.0.0.0 --port 8000
```

---

## 8. 외부 접속

### 같은 와이파이 (집 안)
```
폰 브라우저 → http://맥북IP:8000
```
맥북 IP 확인: `시스템 설정 → Wi-Fi → 세부사항 → IP 주소`

### 외부 (밖에서)
Cloudflare Tunnel 사용:
```bash
# 1회 설치
brew install cloudflared

# 간편 실행 (도메인 없이, 임시 URL 발급)
cloudflared tunnel --url http://localhost:8000
# → https://xxx-xxx-xxx.trycloudflare.com 출력됨
# → 이 URL을 폰에서 접속
```

### 고정 URL 원하면 (추후)
```bash
cloudflared tunnel login              # Cloudflare 계정 연동
cloudflared tunnel create simpson     # 터널 생성
cloudflared tunnel route dns simpson health.내도메인.com
cloudflared tunnel run simpson        # 실행
```

---

## 9. 구현 순서

### Phase 1: 서버 + 동적 대시보드 (지금 바로)
- [ ] `server.py` 생성 (FastAPI 최소)
- [ ] `photos/` 폴더 생성
- [ ] 기존 대시보드 → JSON fetch 동적 버전으로 전환 (`static/index.html`)
- [ ] `workout.html` → `static/` 이관
- [ ] 로컬 테스트 (`localhost:8000`)

### Phase 2: 사진 연동
- [ ] 식단 사진 저장 구조 확립
- [ ] 대시보드 식단 탭에 사진 표시
- [ ] 인바디 사진 저장 + 기록 탭에 표시

### Phase 3: 외부 접속
- [ ] Cloudflare Tunnel 설정
- [ ] 폰에서 접속 테스트
- [ ] (선택) 간단 PIN 인증

### Phase 4: 편의 기능 (추후)
- [ ] 주간 리포트 자동 생성
- [ ] 인바디 변화 자동 분석
- [ ] 서버 자동 시작 (launchd)

---

## 10. 클로드 작업 매뉴얼

Simpson이 말하면 클로드가 하는 일:

| Simpson 요청 | Claude 작업 |
|-------------|-------------|
| "점심 OOO 먹었어" (+ 사진) | JSON 식단 추가 + 사진 저장 |
| "인바디 찍었어" (+ 사진) | 사진에서 수치 읽기 → JSON 업데이트 + 사진 저장 |
| "대시보드 업데이트해줘" | JSON 수정 후 대시보드 자동 반영 (서버 재시작 불필요) |
| "현황 정리해줘" | `simpson_status.md` 업데이트 |
| "이번 주 어땠어?" | 데이터 분석 + 피드백 |

---

## 11. 현재 데이터 현황

| 항목 | 값 |
|------|------|
| 투약 | 마운자로 2.5mg (D+9) |
| 시작 체중 | 113.1kg (3/11) |
| 현재 체중 | 108.7kg (3/18) |
| 목표 체중 | 80kg |
| 1주 변화 | 체중 -4.4kg, 골격근 -2.2kg, 체지방 -0.8kg |
| 핵심 이슈 | 근손실 > 지방감소 → 단백질 110g/일 필수 |
| 운동 | 경사 트레드밀 + 머신 5종 |

---

## 결론

> **최소 구조**: `server.py` 1개 + `JSON` + `HTML` + `photos/`
> **모바일 = 보기만**, **입력 = 클로드가 처리**
> **외부 접속 = Cloudflare Tunnel (무료)**
> 복잡한 거 없다. 바로 만들자.
