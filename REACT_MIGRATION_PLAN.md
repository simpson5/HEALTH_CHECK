# React + Tailwind 마이그레이션 계획서

> 작성일: 2026-03-24
> 목적: 깡 HTML → React + Tailwind + shadcn/ui 전환
> 예상 기간: 2~3일

---

## 1. 현재 구조 (AS-IS)

```
static/
├── index.html           (1000줄+, CSS+HTML+JS 인라인)
├── workout-session.html  (500줄+)
├── guide.html           (400줄+)
├── foods.html           (300줄+)
└── workout.html         (450줄+)

server.py                (FastAPI, 정적 파일 서빙)
simpson_data.json        (데이터)
```

### 문제점
- CSS 5곳 중복
- JS 전역변수 난립
- 컴포넌트 재사용 불가
- 디자인 수정 시 5파일 동시 수정 필요
- 새 기능 추가할수록 유지보수 어려움

---

## 2. 목표 구조 (TO-BE)

```
health_check/
├── frontend/                  # React 앱
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.jsx           # 진입점
│       ├── App.jsx            # 라우팅 + 레이아웃
│       ├── index.css          # Tailwind 임포트 + 커스텀
│       ├── lib/
│       │   ├── api.js         # API 호출 함수들
│       │   ├── utils.js       # 유틸 (날짜, 포맷 등)
│       │   └── constants.js   # 색상, 설정값
│       ├── hooks/
│       │   ├── useData.js     # simpson_data.json fetch + 캐시
│       │   └── useAchievement.js  # 달성률 계산
│       ├── components/
│       │   ├── ui/            # 공통 UI (shadcn 기반)
│       │   │   ├── Card.jsx
│       │   │   ├── Button.jsx
│       │   │   ├── ProgressBar.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Tabs.jsx
│       │   │   └── DateNav.jsx
│       │   ├── layout/
│       │   │   ├── TopNav.jsx      # 상단 탭
│       │   │   ├── BottomNav.jsx   # 하단 네비
│       │   │   └── Layout.jsx      # 공통 레이아웃
│       │   ├── charts/
│       │   │   ├── WeightChart.jsx
│       │   │   ├── BodyCompChart.jsx
│       │   │   ├── ProteinRing.jsx
│       │   │   └── DrugChart.jsx
│       │   └── shared/
│       │       ├── MealCard.jsx
│       │       ├── ExerciseCard.jsx
│       │       ├── MissionChecklist.jsx
│       │       └── PhotoUpload.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Diet.jsx
│           ├── Weight.jsx
│           ├── Exercise.jsx
│           ├── Calendar.jsx
│           ├── History.jsx
│           ├── WorkoutSession.jsx
│           ├── Guide.jsx
│           └── Foods.jsx
├── server.py              # FastAPI (변경 없음)
├── simpson_data.json      # 데이터 (변경 없음)
├── photos/                # 사진 (변경 없음)
└── uploads/               # 업로드 (변경 없음)
```

---

## 3. 기술 스택

| 영역 | 선택 | 버전 | 이유 |
|------|------|------|------|
| 빌드 | Vite | 6.x | 가장 빠른 빌드, HMR |
| 프레임워크 | React | 19.x | 생태계 최대 |
| 라우팅 | React Router | 7.x | SPA 페이지 전환 |
| 스타일 | Tailwind CSS | 4.x | 유틸리티 우선, 빠른 개발 |
| UI 컴포넌트 | shadcn/ui | 최신 | 커스텀 가능한 세련된 컴포넌트 |
| 차트 | Recharts | 2.x | React 네이티브, 커스텀 쉬움 |
| 아이콘 | Lucide React | 최신 | 깔끔한 선형 아이콘 |
| 상태 관리 | React Context + useState | 내장 | 별도 라이브러리 불필요 (규모 작음) |
| HTTP | fetch (내장) | - | axios 불필요 |

---

## 4. 서버 연동

### 현재 FastAPI 구조 유지

```
server.py 변경사항:
- 기존 API 엔드포인트 전부 유지
- static/ 대신 frontend/dist/ 서빙으로 변경
- 개발 시: Vite dev server(5173) + FastAPI(18000) 프록시
- 배포 시: vite build → dist/ → FastAPI가 서빙
```

### API 엔드포인트 (변경 없음)

```
GET  /api/data              → 전체 데이터
POST /api/photo             → 사진/파일 업로드
POST /api/exercise          → 운동 기록 저장
DELETE /api/exercise         → 운동 기록 삭제
GET  /api/foods             → 음식 목록
POST /api/foods             → 음식 추가/수정
DELETE /api/foods/:id       → 음식 삭제
```

### Vite 프록시 설정 (개발용)

```js
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:18000',
      '/photos': 'http://localhost:18000',
    }
  }
}
```

---

## 5. 디자인 시스템 (Tailwind 커스텀)

### tailwind.config.js

```js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0a0a0f', card: '#12121a', elevated: '#1e1e2a' },
        accent: '#00e5ff',
        success: '#00ff88',
        warning: '#ffaa00',
        danger: '#ff4466',
        info: '#b47fff',
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
      },
    }
  }
}
```

### 공통 클래스 패턴

```
카드:        bg-card border border-white/5 rounded-card p-4
강조카드:    bg-elevated border border-accent/15 rounded-card p-4
버튼:        bg-gradient-to-r from-accent to-success rounded-xl px-6 py-3 font-bold
탭(활성):    bg-accent/10 border border-accent/20 rounded-full px-4 py-2
프로그레스:  bg-white/5 rounded-full overflow-hidden
```

---

## 6. 마이그레이션 단계

### Phase 1: 프로젝트 초기화 (30분)

```bash
cd /Users/simpson/Desktop/SIMPSON/health_check
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom recharts lucide-react
npx shadcn@latest init
```

- [ ] Vite + React 프로젝트 생성
- [ ] Tailwind CSS 설정
- [ ] shadcn/ui 초기화
- [ ] Vite 프록시 설정 (API 연결)
- [ ] 폰트 (Noto Sans KR, Bebas Neue) 설정
- [ ] 다크 테마 기본 설정

### Phase 2: 공통 컴포넌트 (2시간)

- [ ] Layout.jsx (상단탭 + 하단네비 + 콘텐츠)
- [ ] TopNav.jsx (탭 네비게이션)
- [ ] BottomNav.jsx (하단 네비)
- [ ] Card.jsx (기본/강조/액션 카드)
- [ ] ProgressBar.jsx (그라데이션 + glow)
- [ ] DateNav.jsx (◀▶ 날짜 이동)
- [ ] Badge.jsx (태그/칩)
- [ ] Button.jsx (primary/secondary/danger)
- [ ] api.js (API 호출 함수)
- [ ] useData.js (데이터 fetch 훅)

### Phase 3: 홈 탭 (1시간)

- [ ] 체중 카드 (큰 숫자 + 변화량)
- [ ] 목표 프로그레스 바
- [ ] 미션 체크리스트 (2×2 그리드)
- [ ] 단백질 프로그레스 바
- [ ] 오늘 식단 요약
- [ ] 최근 운동 카드

### Phase 4: 식단 탭 (1시간)

- [ ] 날짜 네비게이션
- [ ] 단백질 링 (Recharts 도넛)
- [ ] 영양소 칩
- [ ] 끼니별 카드 (좌측 색상 바)
- [ ] 사진 표시 + 확대

### Phase 5: 체중 탭 (1시간)

- [ ] 체중 차트 (Recharts)
- [ ] 체성분 차트 탭 (체지방률/근육vs지방/BMI/기초대사)
- [ ] 인바디 선택형 카드

### Phase 6: 운동 탭 (1시간)

- [ ] 주간 현황 (원형 프로그레스)
- [ ] 운동 시작 버튼 (그라데이션)
- [ ] 날짜별 기록
- [ ] 카테고리별 가이드

### Phase 7: 운동 세션 페이지 (1.5시간)

- [ ] 2열 카드 그리드
- [ ] 세트 기록 (KG/회/완료)
- [ ] 유산소 기록 (트레드밀/스텝밀)
- [ ] 완료 요약 화면
- [ ] localStorage 세션

### Phase 8: 달력 탭 (1시간)

- [ ] 월별 달력 그리드
- [ ] 달성률 배경색
- [ ] 이벤트 도트
- [ ] 날짜 선택 → 이벤트 표시
- [ ] 다가오는 일정

### Phase 9: 기록 탭 (1시간)

- [ ] 주간 네비게이션
- [ ] 서브 탭 (일일/주간분석/투약/약물농도)
- [ ] 리포트 카드 (접기/펼치기)
- [ ] 약물 농도 차트

### Phase 10: 기타 페이지 (1시간)

- [ ] 가이드 페이지 (하루일과/식단/운동/식품도감/로드맵)
- [ ] 음식 관리 페이지

### Phase 11: 빌드 + 배포 (30분)

- [ ] `vite build` → dist/ 생성
- [ ] server.py에서 dist/ 서빙하도록 수정
- [ ] Cloudflare Tunnel 테스트
- [ ] 기존 static/ → archive/로 이동

---

## 7. 마이그레이션 원칙

1. **API 변경 없음** — 서버 코드 안 건드림
2. **데이터 변경 없음** — simpson_data.json 구조 유지
3. **기능 동일** — 기존 기능 100% 유지
4. **점진적 전환** — Phase별로 테스트 후 다음 단계
5. **기존 파일 보존** — static/은 archive/로 백업

---

## 8. 위험 요소

| 위험 | 대응 |
|------|------|
| 빌드 환경 문제 | Node.js/npm 버전 확인 필요 |
| 기능 누락 | Phase별 체크리스트로 검증 |
| 성능 저하 | Vite 최적화 + 코드 분할 |
| 모바일 호환 | Tailwind responsive 유틸리티 |
| 개발 서버 포트 충돌 | Vite 5173, FastAPI 18000 분리 |

---

## 9. 완료 기준

- [ ] 기존 모든 기능 정상 동작
- [ ] 모바일 Safari/Chrome 정상 표시
- [ ] 디자인 전면 개선 (DESIGN_PLAN.md 반영)
- [ ] 5개 HTML → 1개 React 앱으로 통합
- [ ] CSS 중복 제거
- [ ] health.simpson-space.com 접속 정상
