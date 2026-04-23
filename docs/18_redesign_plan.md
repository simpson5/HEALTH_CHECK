# Simpson Health — 리디자인 구현 계획서 (v2)

> **작성**: 2026-04-23 · **상태**: 착수 가능
> **v1 아카이브**: `docs/archive/18_redesign_plan_v1_deprecated.md` (참고만 — 내용 무효)
> **레퍼런스 코드**: `docs/design_handoff_ref/` (컴파일 검증된 참조물, 복사 대상)
> **디자인 원본**: `docs/design_handoff/` (Claude Design 핸드오프 번들)

---

## §1. 이 문서의 위치와 읽는 법

**구현자의 자료는 3개 축**:
1. **이 계획서** — 무엇을/어디에/어떤 순서로 (이 파일)
2. **레퍼런스 코드** — 컴파일 검증된 jsx/css 실파일 (`docs/design_handoff_ref/`)
3. **디자인 원본** — 각 화면의 픽셀 진리 (`docs/design_handoff/project/`)

**읽는 순서**:
- §2 결정 레지스트리 → 확정/열린 의사결정 파악
- §3 현 상태 인벤토리 → 실제 코드베이스 확인
- §4 변환 규칙 → Tailwind 전환 기준
- §5 디렉토리 Before/After
- §6 레퍼런스 코드 활용법
- §7~8 화면별 스펙 (제일 두꺼움)
- §9 라우팅, §10 폰트, §11 검증, §12 작업 순서

**원칙**: 구현자가 판단할 수 없는 상황이 오면 §2의 Open Questions에 추가하고 사용자에게 질문. 임의 결정 금지. 단, 이 원칙이 "디자인 해석 여지"까지 막지는 않음 — 예를 들어 "정확히 13px vs 14px"처럼 시각적으로 구분 어려운 건 구현자 판단.

---

## §2. 결정 레지스트리

### 2.1 확정 (Locked — 변경 시 사용자 재승인 필요)

| # | 결정 | 위치 |
|---|---|---|
| L1 | **하단 탭 4개 체제** (대시보드/달력/가이드/설정). 원본의 `log` 제거. | §7.3, §9 |
| L2 | **Guide 상단 탭 5개 모두 구현** (하루일과/식단/운동/식품도감/로드맵) | §8.6 |
| L3 | **검색 버튼은 무동작 (visual only)** | `design_handoff_ref/layout/MobileShell.jsx` |
| L4 | **Session 운동 목록은 Workout 화면에서 전달**. sessionStorage 경유. | §8.9 |
| L5 | **이메일 하드코딩** (`simpson301599@gmail.com`) — Settings 프로필 카드 | §8.8 |
| L6 | **라우팅은 `react-router-dom@7` 사용** | §9 |
| L7 | **폰트는 로컬 번들** (CDN 금지) | §10 |
| L8 | **기존 `frontend/src/components/` `pages/` `index.css` 전량 재작성** | §5 |

### 2.2 Open Questions (Phase 1 착수 가능, 진행 중 결정)

| # | 질문 | 기본값 (Phase 1 동안) | 답 필요 시점 |
|---|---|---|---|
| Q6 | `frontend/src/pages/Foods.jsx` 현재 `/foods` 라우트 사용 중. 리디자인에서 **Guide의 식품도감 탭으로 흡수** vs **독립 유지**? | 흡수. Guide 탭 4로 리스트 표시. `/foods` 라우트 폐지. | 검증 체크리스트 §11 이전 |
| Q7 | `frontend/src/pages/AI.jsx` — App.jsx import 없음, 실행 경로 없음. 재활성 vs 폐기? | 폐기. 같은 기능(AI 식단 분석 / 코치 / 리포트)은 리디자인 **Record** + **Settings** 두 곳에 들어감. | 동상 |
| Q8 | `frontend/src/pages/History.jsx` — 동일 상태. 폐기 vs 복구? | 폐기. 일일 리포트/주간 분석 UI는 Phase 1 범위 외 (Home 타임라인/Calendar 마일스톤으로 축약). | 동상 |
| Q9 | `is_mobile: true` 설정 상태에서 데스크탑 브라우저로 접근 시 UX? | Phase 1은 모바일 뷰 고정 (max-width 430 컨테이너 중앙 정렬). Phase 2에서 반응형. | Phase 2 시작 전 |
| Q10 | Home 히어로 "예상 D-N일" 계산식 (`(cur-goal)/0.9*7`) 유지? 아니면 실제 추세(weight_records 평균감량) 반영? | 디자인 원본 그대로 유지 (계산식 동일). | Phase 1 완료 후 |

진행 중 추가되는 Q는 이 표에 append. 구현자는 해결 전에 기본값을 따라감.

---

## §3. 현 상태 인벤토리 (실측 — 2026-04-23 기준)

### 3.1 프로젝트 파일 트리

```
frontend/
├── index.html                    유지 (폰트 로드 부분만 교체, §10)
├── vite.config.js                유지
├── eslint.config.js              유지
├── package.json                  의존성 조정 (§10.2)
└── src/
    ├── main.jsx                  유지
    ├── App.jsx                   재작성 (§9)
    ├── index.css                 재작성 (레퍼런스 `design_handoff_ref/index.css`)
    ├── components/
    │   ├── layout/ {Layout,TopNav,BottomNav}.jsx   삭제
    │   └── ui/ {Badge,Card,DateNav,ProgressBar,Tabs}.jsx   삭제
    ├── pages/
    │   ├── Home, Diet, Weight, Exercise, Record,
    │   │   Calendar, Foods, Guide, Settings, WorkoutSession.jsx   전부 삭제
    │   ├── AI.jsx                삭제 (Q7 기본값 = 폐기)
    │   └── History.jsx           삭제 (Q8 기본값 = 폐기)
    ├── hooks/useData.jsx         유지
    └── lib/
        ├── api.js                유지 (신규 함수 추가 허용)
        └── utils.js              유지 + §6 format.js 함수 병합
```

### 3.2 DB 스키마 실측 (Verified via `PRAGMA table_info`)

**주의**: 과거 커밋과 `database.py:94~102`의 CREATE TABLE 문이 일치하지 않는다. ALTER TABLE이 런타임에 일어났을 가능성. **아래는 실 PRAGMA 결과로 확정**.

#### `exercise_library`
| 컬럼 | 타입 | 값 예 |
|---|---|---|
| `id` | TEXT (PK) | `chest_press`, `lat_pulldown` |
| `name` | TEXT | `머신 체스트 프레스` |
| `type` | TEXT | `strength` / `cardio` |
| `target_json` | TEXT | `["가슴","어깨"]` ← `db_to_json`에서 `target: []`으로 파싱됨 |
| `input_type` | TEXT | `weight_reps` |
| `exercise_group` | TEXT | `machine` / `bodyweight` / `cardio` ← **영문** |
| `sort_order` | INTEGER | 0 |
| `bodypart` | TEXT | `push` / `pull` / `legs` / `core` / `posterior` / `cardio` ← **영문** |
| `is_favorite` | BOOLEAN | 0 / 1 |

API 응답(`db_to_json`)에서 노출되는 필드명: `id, name, type, target, input_type, group, bodypart, is_favorite`.
→ **`group`** 으로 노출됨 (DB 컬럼 `exercise_group`에서 rename). `category` 필드는 **없음**.

#### `frequent_foods`
| 컬럼 | 값 예 |
|---|---|
| `id, name, description, calories_kcal, protein_g, carbs_g, fat_g, category, meal_type` | — |
| `category` 값 | `supplement`, `drink`, `snack`, `meal` |
| 총 행수 | 7건 |

#### `profile` (`db_to_json` 변환 후)
```js
profile: {
  name, goal_weight_kg, start_weight_kg, medication, medication_start,
  exercise: { /* exercise_config_json 디코드 */ },  // 구조는 simpson_data.json 참조
  daily_targets: { protein_g: 110, calories_kcal: 1500 },   // ← carbs/fat 없음
  weekly_targets: { exercise_count: 4 },
}
```
**carbs/fat 목표는 DB에 없음**. 매크로 바 목표치는 하드코딩 폴백 `180g / 60g`.

#### 기타 주요 테이블
- `weight_records` { date, weight_kg, photo, memo }
- `inbody_records` { date, day_since_start, weight_kg, muscle_kg, fat_kg, fat_pct, bmi, bmr_kcal, visceral_fat_level, inbody_score, weight_change_kg, muscle_change_kg, fat_change_kg, photo, memo }
- `diet_records` { date, time, category, meal_type, food_name, quantity, calories_kcal, protein_g, carbs_g, fat_g, photo, memo }
- `exercise_sessions` { date, start_time, end_time, total_duration_min, total_volume_kg, total_calories_burned, **exercises**(파싱됨, 각각 `{id, name, type, duration_min?, sets?:[{kg,reps}]}` 형태), memo }
- `medication_records` { date, dose, change_reason, side_effects, memo }
- `daily_reports` — Phase 1 범위 외 (Home 타임라인은 records 4종 합쳐서 생성)
- `weekly_analysis` — Phase 1 범위 외
- `ai_jobs` { id, type, status, input_json, output_json, error, started_at, finished_at, created_at } — Settings "최근 AI 작업"에서 사용

### 3.3 API 엔드포인트 실측 (`server.py`)

| 메서드 | 경로 | 응답 형태 / 목적 |
|---|---|---|
| GET  | `/api/data` | `db_to_json()` 전체. useData가 호출 |
| POST | `/api/photo` | multipart → `{ok, filename, path, type}` |
| POST | `/api/exercise` | 세션 저장 (date+start_time 유니크) |
| DELETE | `/api/exercise` | 세션 삭제 |
| GET  | `/api/foods` | frequent_foods 전량 |
| POST | `/api/foods` | upsert |
| DELETE | `/api/foods/{id}` | 삭제 |
| PUT  | `/api/exercise-library/{id}/favorite` | is_favorite 토글 |
| POST | `/api/diet` | 식단 레코드 INSERT |
| POST | `/api/weight` | weight_records upsert |
| POST | `/api/medication` | INSERT |
| POST | `/api/inbody` | upsert |
| POST | `/api/report/daily` | 리포트 저장 (Phase 1 쓰지 않음) |
| GET  | `/api/photos` | 사진 파일명/경로 목록 |
| POST | `/api/ai/diet-draft` | `{ok, job_id}` — 비동기 폴링 |
| POST | `/api/ai/daily-report` | 동 |
| POST | `/api/ai/coach` | 동 |
| POST | `/api/ai/quick-diet` | `{ok, matched, auto_saved, message}` — 동기 |
| GET  | `/api/ai/jobs/{id}` | 단일 잡 상태 |
| GET  | `/api/ai/jobs` | 최근 10개 |
| POST | `/api/csv/inbody` | 인바디 CSV 파싱 (Phase 1 범위 외) |
| GET  | `/api/settings` | `{has_token, token_preview, ai_configured, db_records, photo_count, recent_jobs}` — ⚠️ `db_records`는 **diet_records 카운트만** |
| POST | `/api/settings/token` | 토큰 저장 |

### 3.4 현재 `App.jsx` 라우팅 상태 (참고)

- 커스텀 pushState 기반 라우터
- 라우트: `/?tab={home,diet,weight,exercise,record}` + `/workout-session` + `/guide` + `/foods` + `/settings` + `/calendar`
- `AI.jsx` / `History.jsx`는 **import 및 라우팅에 연결 안 됨** (파일만 존재)

---

## §4. 변환 규칙 (단일 기준)

### 4.1 Tailwind vs inline style — 경계

**Tailwind 사용**: 색 · 폰트 · 크기 · 간격 · 라운드 · 레이아웃 · 상태(hover/active) — 전부.

**inline `style={{ }}` 허용 케이스 (이 3가지에 한정)**:
1. **동적 수치값**: `width`, `height`, `strokeDashoffset`, `transform`의 runtime 계산치. 예: `width: ${pct * 100}%`.
2. **런타임 계산 좌표 (SVG)**: `<circle cx={x} cy={y}>`.
3. **동적 색**: 카테고리별(매크로) 또는 prop 주입 색. 예: `Chip`의 `background: ${color}22`.

**위배 예시** (금지):
- `style={{ color: '#EDEDEE' }}` — `text-text` 로 대체
- `style={{ padding: '14px 16px' }}` — `py-3.5 px-4` 또는 `p-[14px_16px]` 로 대체
- `style={{ fontFamily: 'Geist Mono' }}` — `font-mono` 로 대체

레퍼런스 구현 `docs/design_handoff_ref/primitives/*.jsx` 의 inline 사용은 위 3가지 케이스에만 해당. 구현자도 같은 경계 유지.

### 4.2 색 사용 규칙 (모순 방지의 핵심)

3계층으로 분리:

| 계층 | 토큰 | 용도 | 금지 |
|---|---|---|---|
| **엑센트** | `accent` / `accent-soft` / `accent-line` | CTA, 활성 탭, 강조 메트릭(숫자/현재값), 체중 게이지 | 카테고리 구분·상태 표시에 쓰지 말 것 |
| **세만틱** | `up` / `down` / `info` / `warn` | 델타(감소/증가), 경고, 정보 태그, 상태 도트 | 엑센트 대체 금지 |
| **매크로** | `protein` / `carb` / `fat` | 영양소 카테고리 시각적 구분 전용 | 다른 카테고리(운동 등)에 전용하지 말 것 |

검증 체크리스트 §11의 "엑센트는 단 하나의 앰버만" 항목은 **엑센트 계층 내부** 규칙이지, 세만틱/매크로 색 사용을 금지하는 게 아님.

### 4.3 Radius 규칙

Tailwind 4 `@theme`로 `--radius-sm/md/lg/xl`을 10/14/20/28px로 재정의했음 (`docs/design_handoff_ref/index.css`).

**따라서 `rounded-sm` → 10px, `rounded-md` → 14px, `rounded-lg` → 20px, `rounded-xl` → 28px**. Tailwind 기본값과 다름에 유의.

**버튼 radius(12px)는 예외** — 토큰에 없으므로 `rounded-[12px]` arbitrary value 사용. `TapBtn` 레퍼런스가 이미 적용.

### 4.4 import 규칙 (단일 컨벤션)

- 상대경로만 사용. `@/` 별칭 금지.
- 프리미티브 import: `import { Card, Ring, Bar, Chip, TapBtn, SectionLabel, Toast } from '../design/primitives';`
- 아이콘 import: `import Icon from '../design/Icon';` (default export)
- 레이아웃/유틸도 상대경로. 구조는 `docs/design_handoff_ref/README.md` 참조.

### 4.5 상태/키 표현 규칙 (단일 컨벤션)

화면 구분 키는 **영문 소문자 단수** 고정:
- 상단 탭: `home, diet, weight, exercise, record`
- 하단 탭: `home, cal, guide, set`
- 운동 그룹: `machine, bodyweight, cardio` (DB 실값)
- 운동 부위: `push, pull, legs, core, posterior, cardio` (DB 실값) + 가상 `favorite`
- 한글 라벨은 **표시용** — 매핑은 `docs/design_handoff_ref/lib/exerciseMaps.js` 참조

라벨/키를 함수 인자로 섞어서 쓰지 말 것. 함수 시그니처는 key로 받고, 라벨은 render 시점에 매핑.

---

## §5. 목표 구조 (Before → After)

### 5.1 새 디렉토리 트리 (목표)

```
frontend/src/
├── main.jsx                      유지
├── App.jsx                       (§9) react-router-dom 7.x
├── index.css                     (레퍼런스 복사)
├── design/
│   ├── Icon.jsx                  (레퍼런스 복사)
│   └── primitives/
│       ├── Card, Ring, Bar, Chip, TapBtn, SectionLabel, Toast.jsx
│       └── index.js              (레퍼런스 복사)
├── layout/
│   ├── MobileShell.jsx           (레퍼런스 복사)
│   ├── TopTabs.jsx, TabBar.jsx, StatusLine.jsx
├── screens/
│   ├── Home.jsx                  (§8.1)
│   ├── Meal.jsx                  (§8.2)
│   ├── Weight.jsx                (§8.3)
│   ├── Workout.jsx               (§8.4)
│   ├── Record.jsx                (§8.5)
│   ├── Guide.jsx                 (§8.6)
│   ├── Calendar.jsx              (§8.7)
│   ├── Settings.jsx              (§8.8)
│   ├── Session.jsx               (§8.9)
│   └── _Loading.jsx              데이터 로딩 중 (§8.10)
├── hooks/
│   └── useData.jsx               유지
└── lib/
    ├── api.js                    유지 (+ §8.5/8.9 신규 함수)
    ├── utils.js                  기존 + format.js 함수 병합
    └── exerciseMaps.js           (레퍼런스 복사)
```

### 5.2 유지 / 교체 / 제거 표

| 분류 | 대상 |
|---|---|
| **유지** | `main.jsx`, `hooks/useData.jsx`, `lib/api.js`, `lib/utils.js`(함수 추가만) |
| **통째 재작성** | `App.jsx`, `index.css` |
| **신규 (레퍼런스 복사)** | `design/**`, `layout/**`, `lib/exerciseMaps.js` |
| **신규 (스펙 따라 작성)** | `screens/*.jsx` 전부 |
| **삭제** | `components/**`, `pages/**` (AI/History 포함, Q7/Q8 기본값) |

### 5.3 `package.json` 변경 (§10.2와 같이)

**제거**: `lucide-react`, `recharts`
**추가**: 폰트 관련 (§10 결정)

---

## §6. 레퍼런스 코드 활용법

### 6.1 복사 대상 (그대로 복사)

| ref 파일 | → 실 적용 경로 |
|---|---|
| `docs/design_handoff_ref/index.css` | `frontend/src/index.css` (통째 교체) |
| `docs/design_handoff_ref/Icon.jsx` | `frontend/src/design/Icon.jsx` |
| `docs/design_handoff_ref/primitives/*` | `frontend/src/design/primitives/*` |
| `docs/design_handoff_ref/layout/MobileShell.jsx` | `frontend/src/layout/MobileShell.jsx` |
| `docs/design_handoff_ref/layout/TopTabs.jsx` | `frontend/src/layout/TopTabs.jsx` |
| `docs/design_handoff_ref/layout/TabBar.jsx` | `frontend/src/layout/TabBar.jsx` |
| `docs/design_handoff_ref/layout/StatusLine.jsx` | `frontend/src/layout/StatusLine.jsx` |
| `docs/design_handoff_ref/lib/exerciseMaps.js` | `frontend/src/lib/exerciseMaps.js` |

### 6.2 병합 대상

`docs/design_handoff_ref/lib/format.js` 의 함수들 → `frontend/src/lib/utils.js` 에 **추가** (기존 함수 다 유지):
- `getGreeting`
- `fmtKgDelta`
- `deltaColor`
- `MEAL_ICON_KEY`
- `getMealTime`
- `buildTodayTimeline`

중복되는 함수 있으면 기존 것 우선.

### 6.3 레퍼런스에 없는 것 — 스펙으로 작성

9개 화면 (`screens/*.jsx`)은 레퍼런스에 없음. §8 스펙 + 디자인 원본 참조로 작성. 필요한 프리미티브/아이콘/유틸은 전부 레퍼런스에 있음.

---

## §7. 앱 셸

### 7.1 MobileShell

레퍼런스: `docs/design_handoff_ref/layout/MobileShell.jsx`

역할: 브랜드 헤더 + (조건부) TopTabs + `<Outlet/>` + TabBar.

렌더 분기 (경로 기반):
- `/` → 브랜드 + TopTabs + `<Outlet/>` + TabBar
- `/calendar` · `/guide` · `/settings` → 브랜드 + `<Outlet/>` + TabBar
- `/session` → `<Outlet/>` 만 (세션 몰입)

### 7.2 TopTabs (홈 내부 5탭)

레퍼런스: `docs/design_handoff_ref/layout/TopTabs.jsx`

- `useSearchParams()` 로 `?tab=` 읽기/쓰기
- `home` 이면 query 제거 (`/`만 남김), 그 외는 `?tab=key`
- 활성 탭 하단에 2px 앰버 underline

### 7.3 TabBar (하단 4탭)

레퍼런스: `docs/design_handoff_ref/layout/TabBar.jsx`

탭 매핑 (L1 확정):

| key | 라벨 | 경로 | 아이콘 |
|---|---|---|---|
| `home` | 대시보드 | `/` | `Icon.home` |
| `cal` | 달력 | `/calendar` | `Icon.calendar` |
| `guide` | 가이드 | `/guide` | `Icon.book` |
| `set` | 설정 | `/settings` | `Icon.gear` |

활성 판정: `pathname.startsWith(...)` (home은 정확히 `/`).

### 7.4 StatusLine

레퍼런스: `docs/design_handoff_ref/layout/StatusLine.jsx`

홈에서만 렌더. 데이터 의존 (`data.profile`, `data.medication_records`). 호출 위치는 `Home.jsx` 내부.

---

## §8. 화면별 스펙 (9개)

각 화면 설명 형식:
- **원본**: 디자인 파일 + 라인 범위
- **컴포지션**: 섹션 순서
- **데이터 바인딩**: 실제 DB 필드로
- **인터랙션**: onClick/상태
- **주의**: 흔한 실수

공통 시작부:
```jsx
import { useData } from '../hooks/useData';
import { LoadingScreen } from './_Loading';
export function Home() {          // 각 파일 export 명은 screens/<Name>.jsx 파일명과 동일
  const { data, loading, refresh } = useData();
  if (loading || !data) return <LoadingScreen/>;
  // ...
}
```

### 8.1 Home (`screens/Home.jsx`)

**원본**: `docs/design_handoff/project/screens/home.jsx` (전체)

**컴포지션** (위→아래):
1. Greeting header — 날짜 + `getGreeting(now)` + `이에요, {data.profile.name}님` (엑센트 컬러로 이름)
2. `<StatusLine data={data}/>`
3. Hero Card — 체중 진행률
4. `<SectionLabel right="{done}/{total} 완료">오늘</SectionLabel>` + 4-item checklist
5. `<SectionLabel right="오늘 · N끼">영양</SectionLabel>` + Ring + MacroRow x3
6. `<SectionLabel right={"모두 보기 →"}>오늘 기록</SectionLabel>` + 타임라인 4건

**데이터 바인딩**:
- `latest = weight_records[-1]`, `prev = weight_records[-2]` *(단, prev는 '전일' 날짜로 필터)*
- 현재 체중 `latest.weight_kg`, 전일 델타 `latest.weight_kg - prev.weight_kg` (존재 시)
- 시작/목표 `profile.start_weight_kg` / `profile.goal_weight_kg`
- pct `(start - cur) / (start - goal)`, clamped 0~1
- 예상 D-일 `Math.round((cur - goal) / 0.9 * 7)` (Q10 기본값: 디자인 원본 공식 유지)
- 오늘 매크로 합: `diet_records.filter(r => r.date === today).reduce(...)`
- 매크로 목표: `profile.daily_targets.protein_g` (= 110), 탄수/지방은 하드코딩 `180 / 60` (§3.2 참조)
- 타임라인: `buildTodayTimeline(data, today, 4)` 사용 (레퍼런스 `lib/format.js` 참조)

**체크리스트 4항목** (todos):
- `am` — 오전 운동 완료: `exercise_records.today.length > 0 && 첫 운동 start_time < "12:00"`
- `pm` — 저녁 운동 완료: `exercise_records.today.some(r => r.start_time >= "17:00")`
- `pr` — 단백질 110g: `tPro >= 110` (progress = `tPro / 110` clamp 1)
- `kc` — 칼로리 1500 이하: `tCal <= 1500`

**Hero Card 레이아웃 디테일** (원본 38~119행):
- `bg: linear-gradient(165deg, var(--color-bg-elev-2), var(--color-bg-elev))`  *(inline 그라디언트 — 동적 색 아니지만 그라디언트이므로 허용)*
- 우상단 데코 SVG 3개 (r=100/70/40, opacity 0.14) — 그대로 SVG 삽입
- 숫자: `text-[64px] font-light tracking-[-2.5px] leading-none`
- 프로그레스 바: 6px 높이, 25/50/75% 마일스톤 세로선, 현재 지표는 14x14 원형 도트 + box-shadow glow

**주의**:
- prev 없을 때 델타 부분 숨김
- 체중 기록 0건일 때 폴백: `"--"` 표시, 진행률 0

### 8.2 Meal (`screens/Meal.jsx`)

**원본**: `docs/design_handoff/project/screens/meal.jsx`

**컴포지션**:
1. `<DateStrip>` 7일 (`today-3 ~ today+3`). 선택 날짜는 로컬 state.
2. Daily Macros Hero (Ring + 총 섭취/목표 + 매크로 3분할)
3. 끼니 카드 4개 (`아침/점심/저녁/보충제`)
4. `<TapBtn full variant="ghost" onClick={() => nav('/?tab=record')}>+ 음식 추가 · AI 분석</TapBtn>`

**DateStrip 로직** (원본 87~117행):
- 버튼 flex-1, 선택은 `bg-accent text-accent-on`
- 오늘 아닌데 미래인 날짜: `opacity-40`
- 오늘은 점 표시 (선택 안 됐을 때만)

**데이터 바인딩**:
- `meals` = 끼니 4종 (`아침`, `점심`, `저녁`, `보충제`), 각각 `diet_records.filter(r => r.date === selDate && r.meal_type === '<끼니>')` 로 구성
- time: 해당 끼니 첫 레코드의 `time`, 없으면 `'미기록'` (레퍼런스 `getMealTime` 헬퍼 사용)
- 아이콘: `MEAL_ICON_KEY` 매핑 → `Icon.sun/flame/moon/pill`
- totals: `items.reduce((a, x) => ({kc: a.kc + x.calories_kcal, p: a.p + x.protein_g}), {kc:0, p:0})`
- 상단 Ring pct: `total.p / (daily_targets.protein_g || 110)`

**필드 매핑 (원본 `it.*` → DB)**:
- `it.t` ← `food_name`
- `it.sub` ← `quantity`
- `it.kc` ← `calories_kcal`
- `it.p / c / f` ← `protein_g / carbs_g / fat_g`
- `it.tag` ← `category`

**빈 카드 스타일** (원본 146~149): 점선 테두리 아이콘 박스 + "+ {끼니} 기록하기" 텍스트, 클릭 시 `nav('/?tab=record')`.

### 8.3 Weight (`screens/Weight.jsx`)

**원본**: `docs/design_handoff/project/screens/weight.jsx`

**컴포지션**:
1. Hero: 72px 체중 숫자 (`105.0` 분리 렌더: `105` 큰 숫자 + `.0` 작은 톤)
2. Range tabs (1W/1M/3M/6M/전체)
3. Chart card (SVG 에어리어) + 하단 요약 3분할
4. `<SectionLabel>체성분</SectionLabel>` + 2x2 MetricCard
5. 근육 vs 지방 4회 누적 막대
6. `<SectionLabel right={lastInbodyDateLabel}>최근 인바디</SectionLabel>` + 5행 표

**데이터 바인딩**:
- 현재 체중: `weight_records[-1].weight_kg`
- 시작 대비: `profile.start_weight_kg - current`, 색은 감량이면 `up`
- 일평균 감량: `(start - cur) / (days_elapsed)`
- Range별 데이터:
  - `1W`: `weight_records.slice(-7)`
  - `1M`: `slice(-30)`
  - `3M`: `slice(-90)`
  - `6M`: `slice(-180)`
  - `전체`: 전부
- Inbody: `inbody_records[-1]` 로 체지방률/골격근/BMI/기초대사 표시
- Delta: `inbody_records[-1].weight_change_kg / muscle_change_kg / fat_change_kg` 직접 사용 (DB에 이미 계산돼 있음)

**WeightChart 포팅** (원본 117~155행):
- SVG viewBox `0 0 400 180`, pad { l:12, r:12, t:20, b:14 }
- min/max: `1W`는 실측 min/max, `전체`는 목표(80) 포함한 범위
- 그라디언트 `#wg`: stop 0% `accent` opacity 0.28 → stop 100% opacity 0
- path stroke: `var(--color-accent)`, 두께 1.8
- 주간 포인트 dot (7일마다), 마지막 포인트는 큰 원 + glow

**BodyCompChart** (원본 175~206행): `inbody_records.slice(-4)` 으로 muscle/fat 누적 막대 (4개). muscle은 `accent`, fat는 `white/15`.

### 8.4 Workout (`screens/Workout.jsx`)

**원본**: `docs/design_handoff/project/screens/workout.jsx:4~150`

**컴포지션**:
1. Weekly ring card (Ring + `N회 남음` + `N일째 쉬는 중`) + 7일 도트
2. Start CTA (64px, 앰버 그라디언트)
3. Exercise catalog — 카테고리 pills (머신/맨몸/유산소) + 필터 pills (즐겨찾기/상체밀기/상체당기기/하체/코어) + 운동 카드 리스트

**데이터 바인딩**:
- Weekly done: `exercise_records` 에서 **이번 주**(월~일) 날짜로 distinct count
- goal: `profile.weekly_targets.exercise_count || 4`
- `N일째 쉬는 중`: `daysSince(last exercise date)` — 없으면 `daysSince(profile.medication_start)`
- 7일 도트 states:
  - `done`: 해당 요일에 `exercise_records` 있음
  - `today`: 오늘
  - `rest`: 지나간 요일 + 기록 없음
  - `future`: 미래

**카테고리/필터 pills** (레퍼런스 `exerciseMaps.js`):
- `cat` state: `machine` (기본) / `bodyweight` / `cardio` — 영문 key + `GROUP_LABEL` 라벨
- `filter` state: `favorite` (기본) / `push` / `pull` / `legs` / `core`
- 운동 리스트: `filterExercises(data.exercise_library, { group: cat, bodypart: filter })` (레퍼런스 헬퍼)

**운동 카드** (원본 117~147행):
- 40px 아이콘 박스 (dumbbell)
- 이름 + 즐겨찾기 별 (`is_favorite` 시)
- `muscle` 표시: `target.join(', ')` (예: `"가슴, 어깨"`)
- 최근 기록: `lastExerciseLog(data.exercise_records, ex.id)` (레퍼런스) — 있을 때만 노출
- 우측 + 버튼: `토글 즐겨찾기` (클릭 시 `PUT /api/exercise-library/{id}/favorite` → `refresh()`)
  - ⚠️ 원본 디자인은 `+` 아이콘이지만 기능은 즐겨찾기 토글. 의미 어긋남 — 기본값: **토글로 동작**, 시각은 원본 유지. 이후 재검토.

**Start Session 핸들러** (§8.9의 sessionStorage 전달):
```js
function handleStart() {
  const plan = filteredList.slice(0, 5).map(e => {
    const d = lastSetDefaults(data.exercise_records, e.id);
    return {
      id: e.id, name: e.name,
      weight: d.kg, reps: d.reps,
      done: [false, false, false],
      target: `${d.kg}kg × ${d.reps}`,
    };
  });
  sessionStorage.setItem('session:plan', JSON.stringify(plan));
  sessionStorage.setItem('session:startAt', String(Date.now()));
  sessionStorage.setItem('session:startTime', new Date().toTimeString().slice(0,5));
  nav('/session');
}
```

### 8.5 Record (`screens/Record.jsx`)

**원본**: `docs/design_handoff/project/screens/record.jsx:4~158`

**컴포지션**:
1. Daily summary strip (3개 Chip: P/110g / {kcal} / D+N)
2. `<SectionLabel>체중 입력</SectionLabel>` + 입력 카드
3. `<SectionLabel right="주 1회 · 금요일">투약</SectionLabel>` + 투약 카드
4. `<SectionLabel right={<span className="text-accent">AI 분석</span>}>식단 기록</SectionLabel>` + AI 분석 카드
5. `<SectionLabel>바로가기</SectionLabel>` + 2x1 Shortcut grid
6. `<Toast>` (오른쪽 아래가 아닌 바닥 중앙)

**체중 입력 저장**:
```js
await fetch('/api/weight', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ date: getToday(), weight_kg: Number(weight), memo: '' }),
});
refresh(); setToast('체중 저장됨');
```

**투약 저장**:
```js
await fetch('/api/medication', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ date: getToday(), dose }),
});
```

**AI 식단 분석** (원본 78~144):
- 카메라 버튼 → 숨긴 `<input type="file" accept="image/*" capture="environment">` 트리거
- 파일 선택 → `uploadPhoto(file)` (lib/api.js 기존 함수) → 경로 state 저장
- "분석" 버튼:
  ```js
  const r = await fetch('/api/ai/diet-draft', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ photo: photoPath, memo: mealText }),
  });
  const { job_id } = await r.json();
  await pollJob(job_id);
  ```
- `pollJob` — 2초 간격 60회 폴링. 기존 `pages/AI.jsx:21~35` 의 로직과 동일.
- 완료 시: 결과를 로컬 상태에 보관 + 토스트 "AI 분석 완료". 저장은 별도 "저장" 버튼 (ref 원본에 없지만 기존 Record.jsx 참조 — 구현 시 간단한 확인 버튼 하나 추가 허용, Q&A 추가).

**퀵픽 5개** (원본 121~141):
- `data.frequent_foods.slice(0, 5)` — 최신 5개 (DB에 usage_count 없음 → 선두 5개로 대체)
- 클릭 시 `/api/ai/quick-diet` 즉시 매칭 → `refresh()` + 토스트

**바로가기 2개**:
- `일일 리포트` → `POST /api/ai/daily-report { date: getToday() }` → 폴링 → 결과는 토스트로만 (Phase 1), 모달 UI 없음
- `건강 상담` → Phase 1은 토스트 "준비 중"

**Toast 위치**: `bottom-[110px] left-1/2 -translate-x-1/2` — 하단 탭바(88px) 위에 여유 두고. 레퍼런스 `Toast.jsx` 참조.

### 8.6 Guide (`screens/Guide.jsx`)

**원본**: `docs/design_handoff/project/screens/record.jsx:187~272` + 상단 탭 확장

**컴포지션 (공통 상단)**:
1. Hero: `SIMPSON HEALTH PLAN` 라벨 + 28px 제목 `운동 & 식단 가이드` + 서브 텍스트 (`{cur_kg}kg · 근손실 방지 · 마운자로 복용 중`) + Chip 2개 (목표 `profile.goal_weight_kg`kg / 단백질 `daily_targets.protein_g`g/일)
2. Tab pills 5개 (하루일과/식단/운동/식품도감/로드맵)

**탭 state**: `useState('하루일과')` 로컬.

**탭별 콘텐츠**:

#### 하루일과 (기본)
3개 카드 (원본 220~248):
- `data.profile.exercise.daily_routine.morning` → 오전 머신 6종
- `data.profile.exercise.cardio` → 오전 경사 트레드밀 (있으면)
- `data.profile.exercise.daily_routine.evening` → 저녁 (있으면)

해당 필드 없으면 디자인 원본 하드코딩 그대로 (예: 머신 6종/경사 트레드밀/케틀벨 스윙 인터벌).

#### 식단
원본 253~268 표. `data.profile.meal_plan` 있으면 사용, 없으면 하드코딩:
- 아침: `닥터유PRO 드링크 40g + 고구마` — 41g
- 점심: `일반식 (고기 위주)` — 20~30g
- 저녁: `훈제닭가슴살 2개 + 야채` — 44~54g

#### 운동
데이터 소스 `data.profile.exercise.strength` (배열):
- `<SectionLabel>주요 운동</SectionLabel>` + Card(pad=0) 안에 각 운동명 행 (우측 chev)
- `<SectionLabel>유산소</SectionLabel>` + Card 한 줄 (`data.profile.exercise.cardio`)

#### 식품도감 (Q6 기본값 = Foods 흡수)
- `<SectionLabel right="{data.frequent_foods.length}개">자주 먹는 음식</SectionLabel>`
- Card(pad=0) 안에 `data.frequent_foods.map` → 각 행:
  - 왼쪽: name + description (작은 글씨)
  - 오른쪽: `{calories_kcal}kcal` + Chip 3개 (P/C/F)

#### 로드맵
원본 Calendar의 마일스톤 4개 카드와 동일 구조:
- `5/01 (금)` — `104kg` `▼ 4kg` D-8
- `6/01 (월)` — `100kg` `▼ 4kg` D-39
- `7/01 (수)` — `97kg`  `▼ 3kg` D-69
- `8/01 (토)` — `94kg`  `▼ 3kg` D-100

(Phase 1은 하드코딩. Phase 2에서 선형 계산으로 치환.)

### 8.7 Calendar (`screens/Calendar.jsx`)

**원본**: `docs/design_handoff/project/screens/calendar-settings.jsx:4~126`

**컴포지션**:
1. Mode toggle (월간/주간) — **월간만 동작**, 주간은 UI만 (Phase 1).
2. Month header (`< 2026 / 4월 >`) — 좌/우 chevron으로 월 이동
3. Calendar grid (7x5~6, 요일 헤더 포함)
4. Legend 3개 (체중/운동/식단)
5. `<SectionLabel>다가오는 마일스톤</SectionLabel>` + 4개 카드 (Guide 로드맵과 동일 하드코딩)

**Grid 데이터**:
- 현재 월의 모든 날짜 → 요일 별 그리드
- 각 날짜의 도트:
  - 체중(S, `accent`): `weight_records.some(r => r.date === dateStr)`
  - 운동(W, `info`): `exercise_records.some(r => r.date === dateStr)`
  - 식단(M, `protein`): `diet_records.some(r => r.date === dateStr)`
- 오늘: `bg-accent-soft border border-accent-line` 박스
- 일요일: `text-down`, 토요일: `text-info`

### 8.8 Settings (`screens/Settings.jsx`)

**원본**: `docs/design_handoff/project/screens/calendar-settings.jsx:135~233`

**컴포지션**:
1. Header (`계정` 라벨 + `설정` 타이틀)
2. Profile card
3. AI 연결 카드
4. `<SectionLabel>환경설정</SectionLabel>` + 6행 리스트
5. `<SectionLabel right={<span className="text-accent">전체 →</span>}>최근 AI 작업</SectionLabel>` + 4행

**Profile card**:
- 56x56 원형 아바타 — 그라디언트 `linear-gradient(135deg, var(--color-accent), var(--color-protein))`. 첫 글자는 `profile.name.charAt(0)`, `font-serif`
- 이름: `profile.name`
- 이메일: `simpson301599@gmail.com` (L5 하드코딩)
- 보조: `D+{daysSince(medication_start)}`

**AI 연결 카드** (원본 165~180):
- 상단: 도트(`bg-up`, glow) + `인증됨 · Claude Haiku 4.5` 또는 `미인증` + `ACTIVE` 배지
- 3분할 KPI:
  - `식단 기록`: `/api/settings.db_records` (⚠️ `DB 기록`이 아닌 `식단 기록`으로 라벨 정정 — §3.3 참고)
  - `사진`: `/api/settings.photo_count`
  - `AI 작업`: `/api/settings.recent_jobs.length` 가 아니라 `/api/ai/jobs` 전체 카운트. 실데이터 계산 필요:
    - Phase 1: `/api/settings.recent_jobs.length`로 대체 (최대 5).
    - Q11 (열린 질문으로 추가): 실제 ai_jobs 총 카운트 API 필요.

**환경설정 6행**: 목표 체중 / 일일 단백질 / 일일 칼로리 / 알림 / 단위 / 데이터 내보내기
- 값: `profile.goal_weight_kg` / `daily_targets.protein_g` / `daily_targets.calories_kcal` / 알림(하드 `켜짐`) / 단위(하드 `메트릭`) / 내보내기(하드 `CSV · JSON`)
- 클릭 동작: Phase 1은 전부 토스트 `"준비 중"`

**최근 AI 작업 4행** (원본 210~228):
- `data_source`: `GET /api/ai/jobs` → slice(4)
- 각 행: `started_at` 시분(HH:MM), type 한글 매핑(`diet_draft`→`식단 분석`, `daily_report`→`일일 리포트`, `coach`→`건강 상담`), status 매핑(`done`→`완료`, `failed`→`실패`, 나머지→`진행중`), 서브텍스트(`output.message` 또는 `input.memo`)

### 8.9 Session (`screens/Session.jsx`)

**원본**: `docs/design_handoff/project/screens/workout.jsx:152~257`

**컴포지션**:
1. Top bar (← 종료 / LIVE ●)
2. Timer (68px tabular-nums)
3. Quick stats 3분할 (완료/총 볼륨/소모)
4. `<SectionLabel>오늘의 루틴</SectionLabel>` + 운동 카드들

**초기화** (L4, sessionStorage 경유):
```js
const [plan, setPlan] = useState(() => {
  try {
    const raw = sessionStorage.getItem('session:plan');
    if (raw) return JSON.parse(raw);
  } catch {}
  // 폴백: 즐겨찾기 machine 상위 3개
  return (data.exercise_library || [])
    .filter(e => e.is_favorite && e.group === 'machine')
    .slice(0, 3)
    .map(e => {
      const d = lastSetDefaults(data.exercise_records, e.id);
      return { id: e.id, name: e.name, weight: d.kg, reps: d.reps, done: [false,false,false], target: `${d.kg}kg × ${d.reps}` };
    });
});
// plan 변경 시 저장 (새로고침 대비)
useEffect(() => { sessionStorage.setItem('session:plan', JSON.stringify(plan)); }, [plan]);
```

**타이머**:
```js
const [sec, setSec] = useState(() => {
  const startAt = Number(sessionStorage.getItem('session:startAt') || Date.now());
  sessionStorage.setItem('session:startAt', String(startAt));
  return Math.floor((Date.now() - startAt) / 1000);
});
useEffect(() => {
  const t = setInterval(() => setSec(s => s + 1), 1000);
  return () => clearInterval(t);
}, []);
const mm = String(Math.floor(sec / 60)).padStart(2, '0');
const ss = String(sec % 60).padStart(2, '0');
```

**종료 플로우** (원본 없음, 구현자 작성):
```js
async function handleEnd() {
  const startTime = sessionStorage.getItem('session:startTime') || '';
  const endTime = new Date().toTimeString().slice(0,5);
  const exercises = plan.map(p => ({
    id: p.id, name: p.name, type: 'strength',
    sets: p.done.map((d, i) => ({ kg: p.weight, reps: p.reps })).filter((_, i) => p.done[i]),
  }));
  const total_volume_kg = plan.reduce((a, p) => a + p.done.filter(Boolean).length * p.weight * p.reps, 0);
  const total_calories_burned = plan.reduce((a, p) => a + p.done.filter(Boolean).length * 12, 0);  // 거친 추정
  await fetch('/api/exercise', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      date: getToday(), start_time: startTime, end_time: endTime,
      total_duration_min: Math.round(sec/60),
      total_volume_kg, total_calories_burned,
      exercises, memo: '',
    }),
  });
  ['session:plan','session:startAt','session:startTime'].forEach(k => sessionStorage.removeItem(k));
  refresh();
  nav('/?tab=exercise');
}
```
(와일드카드 삭제 불가 — 키를 명시적으로 열거. v1의 `'session:*'` 버그 정정.)

**세트 토글**:
```js
function toggleSet(ei, si) {
  setPlan(prev => prev.map((p, i) =>
    i === ei ? { ...p, done: p.done.map((d, j) => j === si ? !d : d) } : p
  ));
}
```

### 8.10 LoadingScreen (`screens/_Loading.jsx`)

심플:
```jsx
export function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center text-text-dim font-mono text-xs">
      로딩 중...
    </div>
  );
}
```

---

## §9. 라우팅 (`App.jsx` 재작성)

`react-router-dom@7` 사용 (L6 확정).

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './hooks/useData';
import { MobileShell } from './layout/MobileShell';
import { Home } from './screens/Home';
import { Meal } from './screens/Meal';
import { Weight } from './screens/Weight';
import { Workout } from './screens/Workout';
import { Record } from './screens/Record';
import { Session } from './screens/Session';
import { Calendar } from './screens/Calendar';
import { Guide } from './screens/Guide';
import { Settings } from './screens/Settings';

// 홈 라우트는 query `?tab=` 로 분기. 라우트 일급 컴포넌트가 판별.
function HomeRouter() {
  const tab = new URLSearchParams(window.location.search).get('tab') || 'home';
  switch (tab) {
    case 'diet':     return <Meal/>;
    case 'weight':   return <Weight/>;
    case 'exercise': return <Workout/>;
    case 'record':   return <Record/>;
    default:         return <Home/>;
  }
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MobileShell/>}>
            <Route path="/" element={<HomeRouter/>}/>
            <Route path="/calendar" element={<Calendar/>}/>
            <Route path="/guide" element={<Guide/>}/>
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/session" element={<Session/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
```

**포인트**:
- `HomeRouter`는 query 변화 시 리렌더 필요. `react-router-dom`의 `useSearchParams()` 훅 사용해서 query 구독:
  ```jsx
  import { useSearchParams } from 'react-router-dom';
  function HomeRouter() {
    const [params] = useSearchParams();
    const tab = params.get('tab') || 'home';
    // ...
  }
  ```
- `MobileShell`이 `<Outlet/>` 를 가지므로 위 `<Route element={<MobileShell/>}>`의 자식들이 그 위치에 렌더됨.

---

## §10. 폰트 로딩 (L7 — 로컬 번들)

### 10.1 설치

```bash
cd frontend
npm install geist pretendard @fontsource/instrument-serif
```

패키지 검증:
- `geist` (by Vercel) — Geist Sans + Geist Mono 포함. npm 공식.
- `pretendard` — 한글 웹폰트. npm 공식.
- `@fontsource/instrument-serif` — fontsource 공식. 만약 없으면 대안으로 `@fontsource/noto-serif-kr` 사용.

`npm install` 시 패키지 존재 여부 확인. 없으면 Q&A에 추가.

### 10.2 CSS에서 import

`frontend/src/index.css` 맨 위 (레퍼런스 `index.css` 에 아래 블록 추가):
```css
@import "tailwindcss";
@import "geist/dist/css/geist-sans.css";
@import "geist/dist/css/geist-mono.css";
@import "pretendard/dist/web/static/pretendard.css";
@import "@fontsource/instrument-serif/400.css";
/* ↓ 기존 @theme 블록 이하 ... */
```

각 패키지의 실제 CSS 경로는 설치 후 `node_modules/<pkg>/README.md` 확인 필요. 다르면 수정.

### 10.3 `index.html` 수정

**제거**: 현재 3개 `<link>` (Inter / Noto Sans KR / Pretendard 동적 CSS)
**추가**: 없음 (CSS import로 대체)

최종 `<head>` 안 `<link>` 블록은 **없어야 함** (폰트는 CSS 패키지에서 로드됨).

### 10.4 `package.json` 변경

- **제거**: `lucide-react`, `recharts`
- **추가**: `geist`, `pretendard`, `@fontsource/instrument-serif` (또는 폴백)

```bash
cd frontend
npm uninstall lucide-react recharts
npm install geist pretendard @fontsource/instrument-serif
```

---

## §11. 검증 계획 (재현성 보장)

### 11.1 빌드

```bash
cd frontend
npm run build
```
에러 0건 통과. 경고는 허용 (단, React 런타임 경고는 해결).

### 11.2 기동 (실제 배포 경로와 동일)

```bash
# 1) 빌드 산출물 생성
cd frontend && npm run build
# 2) FastAPI 기동 (dist 서빙 포함)
cd .. && python3 -m uvicorn server:app --host 0.0.0.0 --port 18000 --reload
# 3) 접속 확인
open http://localhost:18000/
```

Vite dev server는 리디자인 검증엔 쓰지 않음 (실 배포 경로와 어긋남).

### 11.3 기능 검증

| # | 체크 | 통과 기준 |
|---|---|---|
| F1 | 홈의 체중/단백질/칼로리 수치 | 실 DB 값과 일치 |
| F2 | 상단 탭 5개 전환 | URL `?tab=` 반영 + 화면 렌더 |
| F3 | 하단 탭 4개 전환 | 경로 변경 + 화면 렌더 |
| F4 | 식단 DateStrip 날짜 전환 | 해당일 끼니 카드 로드 |
| F5 | 체중 Range 탭 | 데이터 개수 달라짐 |
| F6 | 운동 "시작" → Session | Timer 동작, 세트 토글 |
| F7 | Session 종료 | `/api/exercise` POST 성공, exercise 탭 복귀 |
| F8 | 기록 체중 저장 | `/api/weight` 성공 + 토스트 |
| F9 | 기록 식단 AI 분석 | `/api/ai/diet-draft` 폴링 후 토스트 |
| F10 | 달력 도트 | 월별 records 반영 |
| F11 | Guide 5탭 전환 | 로컬 state 변경, 콘텐츠 렌더 |
| F12 | Settings AI 작업 리스트 | `/api/ai/jobs` 표시 |

### 11.4 시각 검증

| # | 체크 | 기준 |
|---|---|---|
| V1 | 배경 `#0E0F12` | 전 화면 |
| V2 | **엑센트** 컬러 | 단일 앰버 `#F5A524`. §4.2 참조. 매크로(단백질 C9A96E 등) · 세만틱(up/down/info)은 별도 계층으로 허용됨. |
| V3 | 라운드 | 카드=20px, 버튼=12px, 칩=full round |
| V4 | 폰트 | 본문 Pretendard/Geist, 숫자 Geist Mono, 감성(아바타 이니셜) Instrument Serif |
| V5 | 상단 탭 underline | 활성 탭에 2px 앰버 바 |
| V6 | 하단 탭 활성 | 앰버 컬러 + 볼드 |

### 11.5 비시각 검증

```bash
# lucide-react / recharts 잔재 없음
grep -rn "lucide\|recharts" frontend/src frontend/package.json  # 결과 0건

# package-lock 정리
cd frontend && npm ls lucide-react recharts  # "(empty)" 기대

# inline style 사용 케이스 점검 (허용 3가지만)
grep -n "style={{" frontend/src/screens/*.jsx  # 각 라인 §4.1 케이스 3종 중 하나임을 수동 확인
```

### 11.6 스크린샷 재캡처

```bash
# (전제) FastAPI 18000 기동 중
pip install playwright
playwright install chromium
python3 docs/scripts/capture_screens.py --out docs/screenshots_v2
```

9개 PNG 생성 (01_home ~ 09_session). 기존 `docs/screenshots/`와 나란히 비교.

---

## §12. 작업 순서

각 단계 끝에 `cd frontend && npm run build` 성공 확인 후 **단독 커밋**. 중간 커밋 누락 금지.

| # | 단계 | 예상 커밋 메시지 |
|---|---|---|
| 1 | 브랜치 생성 (`git checkout -b redesign/v2`) | — |
| 2 | 레퍼런스 복사: `index.css` | `style: replace index.css with design tokens` |
| 3 | 레퍼런스 복사: `design/Icon.jsx` + `primitives/*` | `feat: add design primitives and icon set` |
| 4 | 레퍼런스 복사: `layout/*` | `feat: add mobile shell and navigation layout` |
| 5 | 레퍼런스 복사: `lib/exerciseMaps.js` + `lib/format.js` → `lib/utils.js` 병합 | `feat: add format + exercise mapping helpers` |
| 6 | 폰트 설치 & 적용 (`npm uninstall lucide-react recharts && npm install geist pretendard @fontsource/instrument-serif` + CSS import + index.html 수정) | `chore: switch to local font bundles, drop cdn` |
| 7 | `App.jsx` + `react-router-dom` 라우팅 | `feat: redesign router with react-router-dom v7` |
| 8 | `screens/_Loading.jsx` | `feat: add loading screen` |
| 9 | `screens/Home.jsx` | `feat: redesign home screen` |
| 10 | `screens/Meal.jsx` | `feat: redesign meal screen` |
| 11 | `screens/Weight.jsx` | `feat: redesign weight screen` |
| 12 | `screens/Workout.jsx` | `feat: redesign workout screen` |
| 13 | `screens/Record.jsx` | `feat: redesign record screen` |
| 14 | `screens/Guide.jsx` (5탭) | `feat: redesign guide screen with 5 tabs` |
| 15 | `screens/Calendar.jsx` | `feat: redesign calendar screen` |
| 16 | `screens/Settings.jsx` | `feat: redesign settings screen` |
| 17 | `screens/Session.jsx` | `feat: redesign workout session screen` |
| 18 | 기존 파일 삭제 (`pages/**`, `components/**`) | `chore: remove legacy pages and components` |
| 19 | 검증 체크리스트 §11 전부 통과 | — |
| 20 | 스크린샷 재캡처 `docs/screenshots_v2/` | `docs: add v2 screenshots` |

---

## §13. Phase 2 (데스크탑) — 범위 예고

**Phase 1 완료 후 별도 문서**(`19_redesign_plan_desktop.md`)로 분리 예정.

**예상 범위**:
- `design_handoff/project/desktop-app.jsx` (315행) 포팅
- 좌측 사이드바 + 상단 헤더 + KPI row + 차트 2열 + 오늘 요약 위젯
- 브레이크포인트 `lg` (1024px) 기준 모바일/데스크탑 전환
- 화면 컴포넌트 재사용 + 데스크탑용 레이아웃 래퍼(`DesktopShell.jsx`) 추가

---

## §14. 변경 이력

- **v2** (2026-04-23) — v1 리뷰 25개 지적 반영. 코드 예시 외부화(레퍼런스 폴더). 현 상태 인벤토리 추가. 색/style/radius/import/키 규칙 단일 기준으로 통일. 라우팅 react-router-dom으로 확정. 폰트 로컬 번들로 확정. 캡처 스크립트 재현성 확보.
- **v1** (동일일자, 아카이브) — `docs/archive/18_redesign_plan_v1_deprecated.md`

— 끝 —
