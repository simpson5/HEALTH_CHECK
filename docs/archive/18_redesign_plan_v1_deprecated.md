# Simpson Health — 전면 리디자인 구현 계획서

> **작성일**: 2026-04-23
> **작성자**: Claude (Opus 4.7) — 건강관리자 세션
> **대상 구현자**: 이 문서만 보고 작업 수행
> **목표**: 기존 프론트엔드를 Claude Design 핸드오프 기반 디자인으로 **완전 교체**

---

## 0. 최상위 원칙 (절대 어기지 말 것)

1. **통째 교체**. 기존 `frontend/src/components/**` + `frontend/src/pages/**` + `frontend/src/index.css` 는 전량 폐기 후 재작성. 재활용은 `hooks/useData.jsx`, `lib/api.js`, `lib/utils.js` 뿐.
2. **Tailwind 4 중심**. 디자인 원본은 inline `style={{...}}` 스타일이지만, 구현은 **Tailwind 유틸 + 토큰 기반 CSS 변수**로 100% 변환. 오직 아래 3가지 경우에만 inline style 허용:
   - 동적 퍼센트 (예: `width: ${pct*100}%`)
   - SVG 전용 속성 (stroke-dasharray 등)
   - 런타임 계산 좌표 (차트 점 위치 등)
3. **디자인 시안 충실 재현**. 색/크기/패딩/간격/라운드를 디자인 원본(`docs/design_handoff/project/`)에서 **한 픽셀도 벗어나지 말 것**. 애매하면 원본을 다시 읽어라. 창의력 발휘 금지.
4. **모바일 먼저 Phase 1 → 데스크탑 Phase 2**. 모바일 9개 화면이 완전히 끝나고 `npm run build`/수동 검증까지 통과한 다음에만 Phase 2 착수.
5. **절대 임의로 기능 추가/변경 금지**. 디자인에 없는 버튼·섹션·페이지를 넣지 말 것. 디자인에 있는 것은 전부 구현할 것.
6. **데이터 연결은 단순화**. 디자인 원본의 목업 데이터 자리는 `useData()` 훅의 실제 값으로 치환. 수치 포맷만 맞추고 추가 로직 금지.
7. **작업 중간에 막히면 문서 끝 "Q&A / 미해결 의사결정"에 추가하고 구현자는 사용자에게 질문**. 추측으로 진행 금지.

---

## 1. 사전 준비

### 1.1 작업 전 읽어야 할 파일 (순서 엄수)

| # | 경로 | 읽는 이유 |
|---|---|---|
| 1 | `docs/18_redesign_plan.md` (이 문서) | 전체 흐름 |
| 2 | `docs/design_handoff/README.md` | 핸드오프 원칙 |
| 3 | `docs/design_handoff/chats/chat1.md` | 디자인 의도 |
| 4 | `docs/design_handoff/project/tokens.js` | 디자인 토큰 |
| 5 | `docs/design_handoff/project/primitives.jsx` | UI 프리미티브 전체 스펙 |
| 6 | `docs/design_handoff/project/chrome.jsx` | 네비게이션/상태줄 |
| 7 | `docs/design_handoff/project/mobile-app.jsx` | 앱 셸 구조 |
| 8 | `docs/design_handoff/project/screens/*.jsx` | 각 화면 구현 원본 |
| 9 | `docs/design_handoff/project/Simpson Health.html` | 전역 셋업 (폰트, 스크롤바) |
| 10 | `docs/screenshots/*.png` | 기존 화면(비교용, 그대로 복원 아님) |

### 1.2 작업 브랜치

```bash
cd /Users/simpson/Desktop/SIMPSON/health_check
git checkout -b redesign/v2
```

### 1.3 의존성 점검 (이미 설치됨, 변경 없음)

`frontend/package.json` 그대로 사용:
- react 19.2, react-dom 19.2, react-router-dom 7.x *(라우팅은 기존 방식 유지)*
- tailwindcss 4.2, @tailwindcss/vite 4.2
- lucide-react, recharts *(→ **제거 예정**. 디자인은 자체 SVG 아이콘 + 자체 차트 사용)*
- vite 8

제거 단계에서 실제 `npm uninstall lucide-react recharts` 실행.

### 1.4 폰트 설치 (`frontend/index.html` 교체)

기존 `<link>` 3개 (Inter / Noto Sans KR / Pretendard 동적) **전부 삭제**하고 아래로 **정확히** 교체:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet">
```

`<title>`은 `Simpson Health` 유지. `<meta viewport>`도 유지.

---

## 2. 디렉토리 구조 (Before / After)

### 기존 (삭제 대상 ✂️)

```
frontend/src/
├── App.jsx                                   ✂️ 재작성
├── index.css                                 ✂️ 재작성
├── main.jsx                                  ✓ 유지
├── components/
│   ├── layout/{Layout,TopNav,BottomNav}.jsx  ✂️ 삭제
│   └── ui/{Badge,Card,DateNav,ProgressBar,Tabs}.jsx  ✂️ 삭제
├── pages/
│   ├── AI.jsx, History.jsx                   ✂️ 삭제 (미사용)
│   └── {Home,Diet,Weight,Exercise,Record,Calendar,WorkoutSession,Guide,Foods,Settings}.jsx  ✂️ 재작성
├── hooks/useData.jsx                         ✓ 유지
└── lib/{api,utils}.js                        ✓ 유지 (필요시 함수 추가)
```

### 목표

```
frontend/src/
├── App.jsx                                   ← 라우팅 재작성
├── index.css                                 ← Tailwind @theme 전면 재정의
├── main.jsx                                  ← 유지
├── design/                                   ★ 새 폴더
│   ├── tokens.css                            ← @theme 토큰 (index.css에서 import)
│   ├── Icon.jsx                              ← 자체 SVG 아이콘 세트
│   └── primitives/
│       ├── Card.jsx
│       ├── Ring.jsx
│       ├── Bar.jsx
│       ├── Chip.jsx
│       ├── TapBtn.jsx
│       ├── SectionLabel.jsx
│       └── index.js                          ← barrel
├── layout/                                   ★ 새 폴더
│   ├── MobileShell.jsx                       ← 모바일 앱 껍데기 (상태바/브랜드/탭/화면)
│   ├── TopTabs.jsx
│   ├── TabBar.jsx
│   └── StatusLine.jsx
├── screens/                                  ★ 새 폴더 (pages/ 대체)
│   ├── Home.jsx
│   ├── Meal.jsx                              (기존 Diet)
│   ├── Weight.jsx
│   ├── Workout.jsx                           (기존 Exercise)
│   ├── Record.jsx
│   ├── Session.jsx                           (기존 WorkoutSession)
│   ├── Calendar.jsx
│   ├── Guide.jsx
│   └── Settings.jsx
├── hooks/useData.jsx                         ← 유지
└── lib/{api,utils}.js                        ← 유지 (+ 필요시 함수 추가)
```

> ⚠️ `pages/Foods.jsx` → 제거. 디자인에 "음식 도감"은 **Guide 화면 내부 탭**으로 흡수됨 (`docs/design_handoff/project/screens/record.jsx:208`의 pills 중 "식품도감"). 현재 `/foods` 라우트도 폐기.

> ⚠️ **하단 탭 4개 체제** (Q&A 15.1 Q1): 원본의 `log` 탭 제거. 기록 입력 화면은 오직 상단 탭 `/?tab=record`로만 접근. `TabBar.jsx`는 `home/cal/guide/set` 4개만 렌더.

---

## 3. 디자인 토큰 → Tailwind 4 `@theme` 변환

**파일**: `frontend/src/index.css` (전면 재작성)

```css
@import "tailwindcss";

@theme {
  /* ── Surfaces ───────────────────────────────────────── */
  --color-bg:          #0E0F12;
  --color-bg-elev:     #151619;
  --color-bg-elev-2:   #1C1D21;
  --color-bg-elev-3:   #24262B;

  --color-line:        rgba(255,255,255,0.07);
  --color-line-strong: rgba(255,255,255,0.14);

  /* ── Text ──────────────────────────────────────────── */
  --color-text:        #EDEDEE;
  --color-text-mid:    rgba(237,237,238,0.68);
  --color-text-dim:    rgba(237,237,238,0.42);
  --color-text-faint:  rgba(237,237,238,0.22);

  /* ── Accent (warm amber, oklch ≈ 0.78 0.14 65) ─────── */
  --color-accent:       #F5A524;
  --color-accent-soft:  rgba(245,165,36,0.14);
  --color-accent-line:  rgba(245,165,36,0.35);
  --color-accent-on:    #171309;   /* 엑센트 배경 위 텍스트 */

  /* ── Semantic ──────────────────────────────────────── */
  --color-up:           #6FCF8E;
  --color-down:         #E87C5C;
  --color-info:         #7EA8FF;
  --color-warn:         #F5A524;

  /* ── Macros ────────────────────────────────────────── */
  --color-protein:      #C9A96E;
  --color-carb:         #8FB8E0;
  --color-fat:          #D68FA5;

  /* ── Type ──────────────────────────────────────────── */
  --font-sans:  'Geist', 'Pretendard', -apple-system, 'SF Pro Text', system-ui, sans-serif;
  --font-mono:  'Geist Mono', 'JetBrains Mono', ui-monospace, Menlo, monospace;
  --font-serif: 'Instrument Serif', 'Noto Serif KR', Georgia, serif;

  /* ── Radius ────────────────────────────────────────── */
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;

  /* ── 모션 ─────────────────────────────────────────── */
  --ease-out: cubic-bezier(.2,.7,.3,1);
}

/* 전역 리셋 */
html, body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
::selection { background: rgba(245,165,36,0.3); }

/* 스크롤바 */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16); }
.nosb::-webkit-scrollbar { display: none; }
.nosb { scrollbar-width: none; }

/* tabular-nums 타이머용 유틸 */
.tnum { font-variant-numeric: tabular-nums; }

/* 애니메이션 */
@keyframes fade-up { from { opacity: 0; transform: translateY(6px); } }
@keyframes spin     { to { transform: rotate(360deg); } }
@keyframes toast-in { from { opacity: 0; transform: translate(-50%, 10px); } }

.animate-fade-up { animation: fade-up .28s var(--ease-out); }
.animate-spin    { animation: spin .8s linear infinite; }
.animate-toast   { animation: toast-in .24s var(--ease-out); }

#root { min-height: 100vh; }
```

### 3.1 Tailwind 유틸 매핑 표 (필수 암기)

디자인 원본의 `S.*` → Tailwind 변환:

| 원본 토큰 | Tailwind 클래스 (자주 쓰는 조합) |
|---|---|
| `S.bg` | `bg-bg` |
| `S.bgElev` | `bg-bg-elev` |
| `S.bgElev2` | `bg-bg-elev-2` |
| `S.bgElev3` | `bg-bg-elev-3` |
| `S.line` | `border-line` or `bg-line` |
| `S.lineStrong` | `border-line-strong` |
| `S.text` | `text-text` |
| `S.textMid` | `text-text-mid` |
| `S.textDim` | `text-text-dim` |
| `S.textFaint` | `text-text-faint` |
| `S.accent` | `text-accent` / `bg-accent` |
| `S.accentSoft` | `bg-accent-soft` |
| `S.accentLine` | `border-accent-line` |
| `S.up/down/info/warn` | `text-up` / `text-down` / `text-info` / `text-warn` |
| `S.protein/carb/fat` | `text-protein` / `text-carb` / `text-fat` |
| `S.fontSans` | `font-sans` (기본) |
| `S.fontMono` | `font-mono` |
| `S.fontSerif` | `font-serif` |
| `S.radius.sm/md/lg/xl` | `rounded-sm` = `rounded-[10px]`, `rounded-md` = `rounded-[14px]` 등. 아래 주의 참조 |

> ⚠️ **Radius 주의**: Tailwind 기본 `rounded-sm/md/lg/xl`은 다른 값이다. `@theme`에서 `--radius-*`를 덮어썼으므로 `rounded-sm`이 10px로 동작함 (Tailwind 4). 확신 없으면 `rounded-[10px]` 같은 arbitrary value 사용.

### 3.2 inline-only 규칙 (위반 시 반려)

아래에 해당할 때만 `style={{...}}` 허용:

1. **동적 수치**:
   - `style={{ width: `${pct*100}%` }}`  (progress bar, ring offset)
   - `style={{ strokeDashoffset: c*(1-pct) }}`
2. **런타임 계산 SVG 좌표**:
   - `<circle cx={xs[i]} cy={ys[i]} />`
3. **그라디언트**:
   - 크기가 디자인 원본에 정확히 명시된 경우. 예: Home Hero의 `linear-gradient(165deg, bg-elev-2, bg-elev)`.
   - 이건 CSS 변수 사용: `style={{ background: 'linear-gradient(165deg, var(--color-bg-elev-2), var(--color-bg-elev))' }}`

그 외 색/패딩/폰트는 **무조건 Tailwind 유틸**. 예외 발견 시 `Q&A` 섹션에 추가 후 질문.

---

## 4. Icon 세트 (`frontend/src/design/Icon.jsx`)

**원본**: `docs/design_handoff/project/primitives.jsx` 5~31행의 `Icon` 객체 전체.

**작업 지시**:
1. 원본 그대로 복사 (22개 아이콘 전부: home, meal, scale, dumbbell, pencil, calendar, book, gear, plus, chev, arrow, check, camera, send, flame, pill, play, pause, star, search, close, sun, moon, bolt, timer = 총 **25개**).
2. 각 아이콘을 named export로 분리. 사용처에서 `import { Home, Meal } from '@/design/Icon'` 형태로 import 가능하게. 또는 `import Icon from '@/design/Icon'` 후 `<Icon.home s={20}/>` 형식 유지.
3. **권장**: 원본 그대로 `Icon` 객체 방식 유지가 빠름. 네임스페이스 깨지지 않음.
4. props: `s` (size, default 20), `dir` (chev/arrow 방향), `fill` (star만). 전부 원본과 동일.
5. `stroke="currentColor"` 유지 — 색상은 사용처에서 `text-accent` 등으로 제어.

**수락 기준**:
- Import 경로: `import Icon from './design/Icon'`
- 모든 아이콘 `s={숫자}` props로 크기 변경 가능
- `<Icon.chev dir="left" s={16}/>`, `<Icon.star fill="#F5A524" s={11}/>` 동작

---

## 5. Primitives (6개)

각 파일 위치: `frontend/src/design/primitives/*.jsx`. 디자인 원본은 `docs/design_handoff/project/primitives.jsx`.

> 변환 원칙: 원본 inline style → Tailwind 클래스. props 이름/동작은 **원본 그대로 유지**.

### 5.1 `Card.jsx` (원본 primitives.jsx:86~94)

**Props**: `children`, `style`, `onClick`, `pad` (기본 16).

**구현**:
```jsx
export function Card({ children, className = '', onClick, pad = 16, style }) {
  return (
    <div onClick={onClick} className={`bg-bg-elev-2 border border-line rounded-lg ${className}`}
      style={{ padding: pad, ...style }}>
      {children}
    </div>
  );
}
```

- `pad`는 inline 유지 (동적). `style` prop은 유지 (gradient 같은 경우 덮어쓰기용).
- `rounded-lg` = 20px (토큰).

### 5.2 `Ring.jsx` (원본 primitives.jsx:52~70)

링 차트. SVG 기반. **내부 로직 그대로 포팅**, 외부 래퍼 div의 position/size만 inline.

**Props**: `size=80`, `stroke=7`, `pct=0.5`, `color=var(--color-accent)`, `track='rgba(255,255,255,0.08)'`, `children`.

**구현 포인트**:
- 원본 그대로 옮기되, color는 기본값을 CSS 변수로: `color = 'var(--color-accent)'`
- `transform: rotate(-90deg)` 유지.
- `transition: 'stroke-dashoffset .6s var(--ease-out)'` 유지 (strokeDashoffset 애니메이션).
- children 위치: `absolute inset-0 flex items-center justify-center`.

### 5.3 `Bar.jsx` (원본 primitives.jsx:73~83)

프로그레스 바.

**Props**: `pct`, `color=var(--color-accent)`, `height=4`, `track='rgba(255,255,255,0.06)'`.

**구현**: 외부 div는 Tailwind (`rounded-full overflow-hidden`), 내부 채우기 div는 `width`를 inline (동적).

### 5.4 `Chip.jsx` (원본 primitives.jsx:34~49)

매크로 칩 (P36g, C16g 등).

**Props**: `label`, `value`, `color`, `tone='soft'` (`'soft' | 'solid'`).

**변환**: 원본의 폰트 모노/사이즈/패딩은 Tailwind로 (`font-mono text-[11px] px-2 py-[3px] rounded-full inline-flex items-baseline gap-1`). 색상은 동적이므로 inline style로 background/color만.

```jsx
export function Chip({ label, value, color, tone = 'soft' }) {
  const bg = tone === 'solid' ? color : `${color}22`;
  const fg = tone === 'solid' ? 'var(--color-accent-on)' : color;
  return (
    <span className="inline-flex items-baseline gap-1 px-2 py-[3px] rounded-full font-mono text-[11px] font-medium tracking-[-0.1px]"
      style={{ background: bg, color: fg }}>
      {label && <span className="opacity-70">{label}</span>}
      <span className="font-semibold">{value}</span>
    </span>
  );
}
```

### 5.5 `TapBtn.jsx` (원본 primitives.jsx:112~135)

버튼. 5가지 variant: `ghost`, `solid`, `accent`, `soft`, `dangerous`.

**Props**: `children`, `onClick`, `variant='ghost'`, `className=''`, `full=false`, `disabled=false`.

**변환**:
- 베이스: `h-11 px-[18px] rounded-xl font-sans text-sm font-medium cursor-pointer inline-flex items-center justify-center gap-2 transition-[transform,filter]`
- `full` → `w-full`
- variant별 클래스 (색만 매핑):
  - `ghost`: `bg-transparent text-text border border-line-strong`
  - `solid`: `bg-text text-bg border-none` *(역색상)*
  - `accent`: `bg-accent text-accent-on border-none`
  - `soft`: `bg-white/[0.06] text-text border-none`
  - `dangerous`: `bg-transparent text-down border border-down/35`
- `active:scale-[.98]` 로 마우스다운 효과 (원본은 onMouseDown/Up 조작).
- `rounded-xl` = 28px 아님 주의. 원본은 `borderRadius: 12`. → `rounded-[12px]` 또는 `@theme`에 `--radius-btn: 12px` 추가하고 `rounded-[--radius-btn]`.

### 5.6 `SectionLabel.jsx` (원본 primitives.jsx:97~109)

섹션 제목 (작은 대문자 영문 + 오른쪽 메타).

**Props**: `children`, `right` (ReactNode, 옵션).

**구현**:
```jsx
export function SectionLabel({ children, right }) {
  return (
    <div className="flex items-baseline justify-between mx-5 mt-5 mb-2.5 text-[11px] tracking-[1.2px] uppercase font-mono text-text-dim font-medium">
      <span>{children}</span>
      {right && <span className="text-text-mid tracking-normal">{right}</span>}
    </div>
  );
}
```

### 5.7 barrel index

`frontend/src/design/primitives/index.js`:
```js
export { Card } from './Card';
export { Ring } from './Ring';
export { Bar } from './Bar';
export { Chip } from './Chip';
export { TapBtn } from './TapBtn';
export { SectionLabel } from './SectionLabel';
```

---

## 6. Layout & 네비게이션 (4개)

### 6.1 `frontend/src/layout/MobileShell.jsx`

디자인 원본: `docs/design_handoff/project/mobile-app.jsx` 전체.

**역할**: 앱 셸. 상단 브랜드 로고 + 검색 버튼, TopTabs, 화면 영역, TabBar를 조립.

**주요 차이점 (원본 → 구현)**:
- 원본은 `inSession` 로컬 state로 SessionScreen을 직접 렌더. **구현은 react-router 라우팅 사용** (아래 9장 참조). SessionScreen 전환은 `/session` 경로로 처리.
- 원본의 iOS 상태바 spacer 54px는 **삭제** (실제 웹앱이므로 불필요).
- `topTab`/`tab` 동기화 로직은 현재 `App.jsx`의 탭 state 구조를 따르되, **URL 기반**으로 통합 (아래).

**라우팅 결정 규칙**:
- `/` = home + `topTab='홈'`
- `/?tab=diet` = home + `topTab='식단'` → MealScreen
- `/?tab=weight` = home + `topTab='체중'` → WeightScreen
- `/?tab=exercise` = home + `topTab='운동'` → WorkoutScreen
- `/?tab=record` = home + `topTab='기록'` → RecordScreen
- `/calendar` = CalendarScreen (bottom `cal`)
- `/guide` = GuideScreen (bottom `guide`)
- `/settings` = SettingsScreen (bottom `set`)
- `/session` = SessionScreen (탭바 숨김)

**구조**:
```jsx
export function MobileShell({ children, tab, topTab, showTopTabs, hideChrome }) {
  return (
    <div className="w-full min-h-screen bg-bg text-text font-sans flex flex-col relative">
      {!hideChrome && <BrandHeader/>}
      {showTopTabs && <TopTabs cur={topTab}/>}
      <main className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-up"
        key={`${tab}-${topTab}`}>
        {children}
      </main>
      {!hideChrome && <TabBar cur={tab}/>}
    </div>
  );
}

function BrandHeader() {
  return (
    <div className="px-5 h-12 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-[22px] h-[22px] rounded-[7px] bg-accent text-accent-on font-mono font-bold text-xs flex items-center justify-center">S</div>
        <span className="text-[13px] font-medium tracking-[-0.2px]">Simpson Health</span>
      </div>
      {/* 검색 버튼 — Phase 1은 빈 버튼 (Q&A 15.3 Q3). onClick 없음. */}
      <button className="w-8 h-8 rounded-full bg-bg-elev-2 border border-line text-text-mid flex items-center justify-center cursor-default"
        aria-label="검색 (미구현)" type="button">
        <Icon.search s={15}/>
      </button>
    </div>
  );
}
```

### 6.2 `frontend/src/layout/TopTabs.jsx`

원본: `docs/design_handoff/project/chrome.jsx:43~70`.

**역할**: 홈 화면 안의 상단 5탭 (홈/식단/체중/운동/기록). URL `?tab=`를 업데이트.

**구현**:
```jsx
const TABS = [
  { key: 'home',     label: '홈' },
  { key: 'diet',     label: '식단' },
  { key: 'weight',   label: '체중' },
  { key: 'exercise', label: '운동' },
  { key: 'record',   label: '기록' },
];

export function TopTabs({ cur, onTab }) {
  return (
    <div className="px-5 pt-3.5 pb-2.5 flex gap-5 items-center">
      {TABS.map(t => {
        const active = cur === t.key;
        return (
          <button key={t.key} onClick={() => onTab(t.key)}
            className={`relative bg-transparent border-none p-0 cursor-pointer text-[15px] tracking-[-0.3px] transition-colors ${active ? 'text-text font-semibold' : 'text-text-dim font-normal'}`}>
            {t.label}
            {active && <span className="absolute left-0 right-0 -bottom-2 h-0.5 bg-accent rounded-sm"/>}
          </button>
        );
      })}
    </div>
  );
}
```

**Prop**: `cur` (현재 탭 key), `onTab(key)` 콜백. 콜백에서 `setSearchParams({ tab: key })` 사용.

### 6.3 `frontend/src/layout/TabBar.jsx`

원본: `docs/design_handoff/project/chrome.jsx:5~40` (5탭 버전).

**⚠️ 변경**: 원본은 5탭(`home/cal/log/guide/set`)이지만 **상단 `기록` 탭과 중복되므로 하단 `log` 제거**. 사용자 결정 (Q&A 15.3 Q1).

**역할**: 하단 **4탭** (대시보드/달력/가이드/설정).

**매핑**:
| 하단탭 키 | 라벨 | 아이콘 | 경로 |
|---|---|---|---|
| `home` | 대시보드 | `Icon.home` | `/` (또는 `/?tab=home`) |
| `cal` | 달력 | `Icon.calendar` | `/calendar` |
| `guide` | 가이드 | `Icon.book` | `/guide` |
| `set` | 설정 | `Icon.gear` | `/settings` |

**주의**:
- 기록 입력 화면(`Record`)은 **상단 탭 `/?tab=record`로만 접근**.
- 4탭 간격은 원본의 `justify-around` 유지. 탭 폭이 조금 넓어지는 건 의도된 결과.

**Tailwind 변환 포인트**:
- 컨테이너: `absolute left-0 right-0 bottom-0 h-[88px] pb-[22px] pt-2.5 flex items-center justify-around z-10`
- 배경 그라디언트는 inline (토큰 값 사용):
  ```jsx
  style={{ background: 'linear-gradient(180deg, rgba(14,15,18,0) 0%, rgba(14,15,18,0.88) 35%, #0E0F12 65%)' }}
  ```
- 버튼: `flex-1 h-14 bg-transparent border-none cursor-pointer flex flex-col items-center gap-1`
- 활성: `text-accent`, 비활성: `text-text-dim`
- 라벨: `text-[10px] font-sans tracking-[-0.1px]` + 활성시 `font-semibold`.

### 6.4 `frontend/src/layout/StatusLine.jsx`

원본: `docs/design_handoff/project/chrome.jsx:73~88`.

**역할**: 홈 히어로 위에 한 줄. `D+45 · 마운자로 5mg` | `● 연속 9일`.

**데이터 연결**:
- `D+N`: `daysSince(profile.medication_start)` — 이미 `lib/utils.js`에 있음.
- `마운자로 Xmg`: `data.medication_records[마지막].dose` 또는 `profile.medication` + 마지막 dose.
- `연속 N일`: `getStreak(data)` — `lib/utils.js`에 있음.

**구현**:
```jsx
export function StatusLine({ data }) {
  if (!data) return null;
  const dSince = daysSince(data.profile.medication_start);
  const lastDose = (data.medication_records.slice(-1)[0] || {}).dose || '';
  const streak = getStreak(data);
  return (
    <div className="flex items-center justify-between px-5 pt-1 font-mono text-[11px] text-text-dim tracking-[0.3px]">
      <span>D+{dSince} · 마운자로 {lastDose}</span>
      <span className="text-up inline-flex items-center gap-[3px]">
        <span className="w-[5px] h-[5px] rounded-full bg-up"/>
        연속 {streak}일
      </span>
    </div>
  );
}
```

---

## 7. 화면 (9개) — 이것이 작업량의 70%

### 공통 규칙

1. 각 화면 파일은 `frontend/src/screens/{Name}.jsx` 한 파일.
2. 상단에서 `useData()`로 데이터 로드. `if (loading || !data) return <LoadingScreen/>` 처리 (아래 9.5 참조).
3. 목업 데이터 자리에 **실제 데이터**를 넣되, 디자인의 **값/포맷/레이아웃**은 그대로.
4. 하나의 화면에 포함된 내부 sub-컴포넌트(예: `TodoRow`, `MacroRow`)는 같은 파일에 local function으로 유지.

### 7.1 Home (`screens/Home.jsx`)

**원본**: `docs/design_handoff/project/screens/home.jsx`

**섹션 구성** (위→아래):
1. **Greeting Header** (원본 26~33행)
   - 날짜: `new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })`
   - 인사말: 시간대별 (`편안한 밤`/`좋은 아침`/`오후`/`저녁`)
   - 이름: `data.profile.name` (기본 `'Simpson'`, 원본은 `이현우`임에 유의 — **`data.profile.name`로 덮어쓰기**)

2. **StatusLine** (6.4 컴포넌트)

3. **Hero Card — 체중 진행률** (원본 38~119행)
   - 좌측 블록:
     - `"현재 체중"` 라벨
     - 현재 kg — `data.weight_records.slice(-1)[0].weight_kg`
     - 전일 대비: `cur - prev.weight_kg` (둘째로 최근 기록이 아니라 **전일 날짜**에 한정할 것. `lib/utils.js`에 있는 로직 참조)
     - `▼ N.Nkg 전일` / `총 ▼ N.Nkg` 두 메타
   - 우측 블록:
     - `"목표까지"` 라벨
     - `(cur - goal).toFixed(0)kg` — `data.profile.goal_weight_kg`
     - 예상 `D-N일` — 원본 공식 `Math.round((cur - goal) / 0.9 * 7)` 그대로
   - 데코 원형 SVG 3개 (r=100/70/40) — 그대로
   - 프로그레스 바 + 마일스톤 3개(25/50/75%) + 현재 지표 점 + 하단 라벨 3분할

   **변환 주의**: Hero 그라디언트 배경(`linear-gradient(165deg, bg-elev-2 0%, bg-elev 100%)`)은 inline 허용. 나머지 색/폰트/스페이싱은 Tailwind.

4. **Today Checklist** (원본 121~129행, TodoRow는 171~205행)
   - 4개 항목 고정:
     1. 오전 운동 — `todayEx.find(운동 type in ['cardio', 'strength'])` 존재 여부
     2. 저녁 운동 — 저녁 시간대(17:00+) 운동 존재 여부
     3. 단백질 110g — `tPro` vs `proTarget` (진행률 바 함께)
     4. 칼로리 1500 이하 — `tCal <= 1500`
   - `doneCount` 우측 라벨에 표시 (`SectionLabel right={<span>{doneCount}/{todos.length} 완료</span>}`)

5. **Macros Summary** (원본 131~149행)
   - Ring(단백질 pct) + 우측 3개 MacroRow (탄수/지방/칼로리)
   - 목표치: `profile.daily_targets.protein_g`(110) / carb(180) / fat(60) / kcal(1500)  *(daily_targets에 carb/fat 없으면 하드코딩 180/60)*

6. **Recent Activity Timeline** (원본 151~166행, TimelineItem 223~247행)
   - 오늘 기록만 시간 역순 최근 4개:
     - `diet_records` → 식단 태그
     - `exercise_records` → 운동 태그
     - `weight_records` → 체중 태그 (accent)
     - `medication_records` → 투약 태그
   - time(`HH:MM`), tag(라벨), title, meta
   - 오른쪽 "모두 보기 →" 버튼 → 실제 기능은 Phase 1 범위 외 (`onClick`은 일단 `navigate('/?tab=record')`).

**Tailwind 변환 샘플** (Greeting Header):
```jsx
<div className="px-5 pt-3 pb-1">
  <div className="font-mono text-[12px] tracking-[0.5px] uppercase text-text-dim">
    {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
  </div>
  <div className="text-[22px] font-medium tracking-[-0.6px] mt-1">
    {greet}이에요, <span className="text-accent">{data.profile.name}</span>님
  </div>
</div>
```

### 7.2 Meal (`screens/Meal.jsx`)

**원본**: `docs/design_handoff/project/screens/meal.jsx`

**섹션**:
1. **DateStrip** (원본 87~117행) — 7일 스트립 (오늘 기준 -3 ~ +3)
   - 날짜 선택 상태는 로컬 state + URL 동기화 없음 (디자인에도 없음)
   - 선택된 날짜는 `bg-accent text-accent-on`, 나머지는 `text-text-mid`
   - 오늘 표시 점

2. **Daily Macros Hero** (원본 30~72행)
   - Ring (단백질 pct) + 우측 섭취/목표/부족량
   - 하단 3분할: 단백질/탄수/지방 목표 대비
   - 데이터: 선택 날짜의 `diet_records` reduce

3. **Meals** (4개: 아침/점심/저녁/보충제) — MealCard (원본 119~172행)
   - 아이콘: 아침=sun, 점심=flame, 저녁=moon, 보충제=pill
   - 시간: 해당 끼니 첫 기록의 `time`, 없으면 `미기록`
   - 내부 items: 끼니별 `diet_records`
   - 빈 카드: 점선 테두리 + `+ {끼니} 기록하기`

4. **Quick Add Button** (원본 77~82행) — 하단 `+ 음식 추가 · AI 분석` → `navigate('/?tab=record')`

**데이터 필드 매핑**:
- `it.t` = `food_name`
- `it.sub` = `quantity`
- `it.kc` = `calories_kcal`
- `it.p/c/f` = `protein_g/carbs_g/fat_g`
- `it.tag` = `category` (`meal`/`supplement` 등)

### 7.3 Weight (`screens/Weight.jsx`)

**원본**: `docs/design_handoff/project/screens/weight.jsx`

**섹션**:
1. **Hero Number** (원본 24~41행)
   - 72px 체중 숫자 + 18px `kg`
   - 시작 대비 감량 / 일평균 감량

2. **Range Tabs** (1W/1M/3M/6M/전체) — 원본 44~54행. `bg-bg-elev` 컨테이너 + 선택시 `bg-bg-elev-3`.

3. **WeightChart** (원본 117~155행) — SVG 에어리어 차트
   - **그대로 포팅** (path/area 계산 로직 포함). 색은 CSS 변수로:
     - `stroke={cssVar('--color-accent')}` → `stroke="var(--color-accent)"`
     - `fill="url(#wg)"` + gradient 정의 그대로
   - **실제 데이터 주입**: `data.weight_records.map(r => ({ d: dayIndex, w: r.weight_kg }))`
   - Range에 따라 slice:
     - `1W`: 최근 7개
     - `1M`: 최근 30
     - `3M`: 90
     - `6M`: 180
     - `전체`: 전부

4. **체성분 Metric Grid** (원본 70~75행) — 2열 그리드
   - 체지방률/골격근/BMI/기초대사 — `inbody_records.slice(-1)[0]`
   - delta: 직전 inbody 대비 (`lib/utils.js`에 없으면 로컬 계산)

5. **Body Comp Chart** (원본 78~86행, BodyCompChart 175~206행)
   - 최근 4회 `inbody_records`에서 muscle/fat 누적 막대 차트

6. **최근 인바디 리스트** (원본 89~112행)
   - 5개 수치: 골격근/체지방/체수분/단백질/무기질
   - delta 포맷: `▲/▼/— N.Nkg`

### 7.4 Workout (`screens/Workout.jsx`)

**원본**: `docs/design_handoff/project/screens/workout.jsx:4~150` (SessionScreen은 별도)

**섹션**:
1. **Weekly Ring Card** (원본 24~68행)
   - Ring: 이번주 `done/goal` (goal=4 고정, `profile.weekly_workout_goal` 있으면 사용)
   - `17일째 쉬는 중` = 마지막 운동 이후 일수 (실데이터로 계산)
   - 하단 7일 도트 (done/rest/today/future)
     - `states`: 월~일 중 `exercise_records` 있는 날 = done, 오늘 = today, 나머지 = future/rest
     - `done` = `bg-accent text-accent-on`, `today` = `border-1.5 border-dashed border-accent`, `rest` = `bg-white/[0.04]`

2. **Start Session CTA** (원본 71~86행)
   - 64px 높이 그라디언트 버튼 (`linear-gradient(135deg, #F5A524, #F5C574)`)
   - 그림자 `0 8px 24px var(--color-accent)/40`
   - onClick → `navigate('/session')`

3. **Exercise Catalog** (원본 89~147행)
   - 카테고리 pills: 머신/맨몸/유산소 — `bg-bg-elev-3` 활성
   - 필터 pills: 즐겨찾기/상체 밀기/상체 당기기/하체/코어 — accent-soft 활성 + 별 아이콘
   - 운동 카드 리스트: `data.exercise_library.filter(e => e.category === cat)`
     - 40px 왼쪽 dumbbell 아이콘 박스
     - 이름 + 별(fav)
     - muscle (근육군)
     - **최근 기록**: `exercise_records`에서 해당 운동의 마지막 세트 `"30kg × 12회 × 3세트"`
     - 우측 `+` 버튼 (즐겨찾기 토글) → `toggleFavoriteExercise(id)` API 호출

**주의**: 필터(즐겨찾기/상체밀기/등)는 실제 분류 로직이 `exercise_library`에 없을 수 있음. 디자인 충실성 우선이면 목업 필터로 유지하고 Q&A에 질문 추가.

### 7.5 Record (`screens/Record.jsx`)

**원본**: `docs/design_handoff/project/screens/record.jsx:4~158`

**섹션**:
1. **Daily Summary Strip** (원본 24~28행) — 3개 칩: P 108/110g / 786 kcal / D+45

2. **체중 입력** (원본 31~52행)
   - 아이콘 박스 + input (숫자) + `kg` + 저장 버튼
   - 입력 시 `▼ N.Nkg 전일 대비` 표시
   - 저장 → `POST /api/weight { date, weight_kg, memo }`

3. **투약** (원본 55~75행)
   - 아이콘 + 라벨(마운자로) + 다음증량 안내 + select (2.5/5/7.5/10mg) + 투약 버튼
   - 저장 → `POST /api/medication { date, dose }`

4. **식단 기록 (AI 분석)** (원본 78~144행)
   - textarea + 카메라 버튼 + `분석` 버튼 (accent)
   - 분석 중 스피너
   - 하단 "최근 기록" 가로 스크롤 퀵픽 5개 (`frequent_foods.slice(-5)` 또는 `top_5_by_usage`)
   - 카메라 버튼: 숨긴 `<input type="file" accept="image/*">` 트리거 → `uploadPhoto(file)` → 경로를 state에 저장
   - 분석 버튼: `POST /api/ai/diet-draft { photo, memo: mealText }` → 폴링 → 완료시 토스트 + textarea 초기화

5. **바로가기** (원본 147~151행) — 2x1 그리드: `일일 리포트`, `건강 상담`
   - `일일 리포트` → `POST /api/ai/daily-report { date: today }` → 폴링 → 결과 모달 (Phase 1은 토스트로 대체, 모달은 Phase 1 범위 외)
   - `건강 상담` → Phase 1은 placeholder 클릭시 `coming soon` 토스트

6. **Toast** (원본 170~183행) — 바닥에서 튀어오르는 토스트. 위치 `bottom-[110px]`, translate-x `-50%`.

### 7.6 Guide (`screens/Guide.jsx`)

**원본**: `docs/design_handoff/project/screens/record.jsx:187~272`

**⚠️ Phase 1 범위**: **5개 탭 전부 구현** (Q&A 15.3 Q2). 각 탭 콘텐츠 아래 기술.

**공통 상단**:
1. **Hero**: `SIMPSON HEALTH PLAN` 라벨 + 28px 제목 "운동 & 식단 가이드" + 서브 텍스트(`"현재체중kg · 근손실 방지 · 마운자로 복용 중"` — 실데이터) + 2개 칩(목표 `profile.goal_weight_kg`kg / 단백질 `daily_targets.protein_g`g/일)

2. **Tab Pills (5개)**: 하루일과 / 식단 / 운동 / 식품도감 / 로드맵
   - 선택된 탭: `bg-accent-soft text-accent border border-accent-line`
   - 비선택: `bg-transparent text-text-dim border border-line`
   - 상태 관리: `useState('하루일과')` 로컬 state

**탭별 콘텐츠**:

#### 탭 1: 하루일과 (기본)
원본 record.jsx:219~248 그대로. 실데이터 소스:
- `data.profile.exercise.daily_routine.morning.description` → 오전 머신 6종
- `data.profile.exercise.cardio` → 오전 경사 트레드밀 문구
- `data.profile.exercise.daily_routine.evening` → 저녁 운동 (있으면)

없으면 디자인 원본 하드코딩 그대로. 아이콘 색:
- 오전(머신): accent
- 오전(유산소): info
- 저녁(케틀벨): protein

#### 탭 2: 식단
원본 record.jsx:251~268 그대로. 실데이터 소스:
- `data.profile.meal_plan` 있으면 그 값
- 없으면 하드코딩 그대로
- 각 행: `[끼니, 음식, 단백질]` 3열 grid

추가: 섹션 하단에 **하루 총 칼로리/단백질 목표** 칩 2개. `Chip value="1500 kcal"`, `Chip value="110g"`.

#### 탭 3: 운동
새 섹션 (디자인 원본에는 `하루일과` 탭만 있지만 이 탭을 위한 콘텐츠는 `data.profile.exercise.strength` 리스트가 있음).

**구조**:
- `SectionLabel`: 주요 운동
- `Card pad={0}` 안에 `data.profile.exercise.strength.map` → 운동명 리스트 (each: 운동명 + 오른쪽 `Icon.chev`)
- `SectionLabel`: 유산소
- `Card`: `profile.exercise.cardio` 한 줄

#### 탭 4: 식품도감
- `SectionLabel`: `자주 먹는 음식` (우측: `{data.frequent_foods.length}개`)
- `data.frequent_foods.map` → 카드 리스트, 각 행:
  - 음식명 + quantity (서브)
  - 우측 매크로 칩 3개 (P/C/F)
  - 우측 끝 kcal
- 기존 `Foods.jsx` 화면의 UI 요소를 **이 탭 안에 흡수**.

#### 탭 5: 로드맵
Calendar 화면의 "다가오는 마일스톤" 4개 카드와 동일 구조:
- 5/01 ~ 8/01 월별 체중 목표
- 선형 감량 계산: `goal_kg_at_month(N) = start - (start - goal) * (N / totalMonths)`
- 간단히 **디자인 원본 값 하드코딩 허용** (5/1=104, 6/1=100, 7/1=97, 8/1=94)

**주의**:
- 달력 화면의 마일스톤과 중복되지만, 사용자 의도는 **Guide 탭 안에서 로드맵 전용 뷰**. 달력의 마일스톤은 유지하되 이 탭은 **더 상세한 주차별 체크포인트**(매주 목표) 형태로 확장 검토. → 일단 Phase 1은 똑같이 월별 4개 카드만. 차별화는 Q&A 추가.

### 7.7 Calendar (`screens/Calendar.jsx`)

**원본**: `docs/design_handoff/project/screens/calendar-settings.jsx:4~126`

**섹션**:
1. **Mode Toggle**: 월간/주간 (주간은 Phase 1 범위 외, UI만 표시)

2. **Month Header**: 좌/우 chevron + 2026 / 4월

3. **Calendar Grid**:
   - 7x5 그리드, 요일 헤더(일/월/화/수/목/금/토)
   - 일요일 빨강(`text-down`), 토요일 파랑(`text-info`)
   - 각 셀: 날짜 숫자 + 하단 도트 (체중/운동/식단)
     - 체중(S) = accent dot
     - 운동(W) = info dot
     - 식단(M) = protein dot
   - 오늘 셀: `bg-accent-soft border border-accent-line`
   - 실데이터: 해당 월의 `weight_records` / `exercise_records` / `diet_records` 날짜 수집

4. **Legend**: 3개 점 + 라벨

5. **다가오는 마일스톤** (4개 카드)
   - `5/01 ~ 8/01` 고정. `kg`는 목표치 계산 (`start - (diff/total)*monthsElapsed`). 구현 단순성을 위해 **디자인대로 하드코딩 허용** (Q&A에 추가).

### 7.8 Settings (`screens/Settings.jsx`)

**원본**: `docs/design_handoff/project/screens/calendar-settings.jsx:135~233`

**섹션**:
1. **Header**: `계정` 라벨 + `설정` 타이틀

2. **Profile Card**: 56x56 그라디언트 아바타(`linear-gradient(135deg, accent, protein)`) — 이니셜 표시 (이름 첫 글자, `Instrument Serif`)
   - 이름: `data.profile.name`
   - 이메일/D+45: 이메일은 일단 하드코딩(`simpson301599@gmail.com` — 유저 메일 메모리 있음 참고) + `D+N`

3. **AI 연결 카드**:
   - 상태 도트 (up) + `인증됨 · Claude Haiku 4.5` + `ACTIVE`
   - 3분할 KPI: DB 기록 / 사진 / AI 작업 횟수
   - 데이터:
     - DB 기록 수: `data.diet_records.length + data.weight_records.length + ...` 전부 합산 (또는 `/api/settings` 응답에 있으면 사용)
     - 사진 수: `GET /api/photos` 응답 길이
     - AI 작업 횟수: `/api/ai/jobs` 전체 카운트

4. **환경설정 리스트** (6개 행): 목표 체중 / 일일 단백질 / 일일 칼로리 / 알림 / 단위 / 데이터 내보내기
   - 값은 `profile.daily_targets` / `profile.goal_weight_kg` 연동
   - 각 행 클릭 → Phase 1 범위 외 (토스트 "준비 중")

5. **최근 AI 작업** (4개 행):
   - `GET /api/ai/jobs?limit=4` (없으면 `/api/ai/jobs`에서 slice)
   - time / type 라벨(식단 분석/건강 상담 등 한글 매핑) / 완료 / 서브텍스트
   - 기존 Settings.jsx 구현의 "AI 작업 이력 상세 보기" 탭 펼침 기능은 **이번 리디자인에서 제거**.

### 7.9 Session (`screens/Session.jsx`)

**원본**: `docs/design_handoff/project/screens/workout.jsx:152~257`

**⚠️ 운동 목록 소스**: Workout 화면에서 **현재 필터로 표시되는 기본 운동 목록**을 가져옴 (Q&A 15.3 Q4). 전달 방식 아래 참조.

**섹션**:
1. **Top Bar**: 좌측 `← 종료` 버튼 + 우측 `LIVE ●` 표식

2. **Timer**: 68px 숫자 `MM:SS`. 초마다 +1. colon은 accent.
   - `font-variant-numeric: tabular-nums` (위에 `.tnum` 유틸 정의)
   - 시작 시각은 `sessionStorage.getItem('session:startAt')` 있으면 그 값부터 재개, 없으면 `Date.now()` 저장

3. **Quick Stats**: 3열 그리드 (완료 / 총 볼륨 / 소모)
   - 완료: `체크된 세트 수 / 전체 세트 수`
   - 총 볼륨: `Σ weight × reps (체크된 세트만)`
   - 소모: 대략 계산 `체크된 세트 수 × 12kcal` (또는 profile에 산식 있으면 그것)

4. **오늘의 루틴 (카드들)**:
   - 각 운동: `{ name, target: '30kg × 12', done: [false,false,false], weight: 30, reps: 12 }`
   - 세트 체크박스 토글
   - 각 운동당 기본 3세트

5. **종료**: `← 종료` 클릭 시
   ```
   POST /api/exercise {
     date: getToday(),
     start_time: savedStartHHMM,
     end_time: nowHHMM,
     total_duration_min: Math.round(sec/60),
     total_volume_kg: <계산>,
     total_calories_burned: <계산>,
     exercises: sets.map(s => ({ id, name, sets: s.done.map((_, i) => ({ weight: s.weight, reps: s.reps, done: s.done[i] })) })),
     memo: ''
   }
   ```
   저장 성공 후 `sessionStorage.removeItem('session:*')` → `nav('/?tab=exercise')`

### 7.9.1 Workout → Session 운동 목록 전달

**방식**: `sessionStorage` (가장 단순, 라우팅 시 state 유지).

**Workout 화면에서 "운동 시작" 버튼 클릭 시**:
```jsx
const handleStartSession = () => {
  const visibleExercises = filteredExerciseList; // 현재 cat/filter 적용된 목록 (최대 상위 5개)
  const sessionPlan = visibleExercises.slice(0, 5).map(e => ({
    id: e.id,
    name: e.name,
    weight: e.defaultWeight || 30,
    reps: e.defaultReps || 10,
    done: [false, false, false],  // 기본 3세트
    target: `${e.defaultWeight || 30}kg × ${e.defaultReps || 10}`,
  }));
  sessionStorage.setItem('session:exercises', JSON.stringify(sessionPlan));
  sessionStorage.setItem('session:startAt', String(Date.now()));
  sessionStorage.setItem('session:startHHMM', new Date().toTimeString().slice(0,5));
  nav('/session');
};
```

**Session 화면 초기화**:
```jsx
const [sets, setSets] = useState(() => {
  const raw = sessionStorage.getItem('session:exercises');
  if (raw) return JSON.parse(raw);
  // 폴백: exercise_library의 즐겨찾기 상위 3개
  return (data.exercise_library || []).filter(e => e.favorite).slice(0, 3).map(e => ({
    id: e.id, name: e.name, weight: 30, reps: 10, done: [false,false,false], target: '30kg × 10',
  }));
});
```

**체크 변경 시 sessionStorage 동기화** (새로고침 대비):
```jsx
useEffect(() => { sessionStorage.setItem('session:exercises', JSON.stringify(sets)); }, [sets]);
```

**exercise_library 필드 점검 필요**:
- `defaultWeight` / `defaultReps` 필드 존재 여부 확인
- 없으면 운동별 마지막 `exercise_records`에서 weight/reps 추출 (이게 더 자연스러움, 원본 Workout 화면 `"최근: 30kg × 12회 × 3세트"` 이 값 그대로 사용)

---

## 8. 공통 헬퍼

### 8.1 LoadingScreen (`frontend/src/screens/_Loading.jsx`)

데이터 로딩 중 렌더. 심플:
```jsx
export function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center text-text-dim font-mono text-xs">
      로딩 중...
    </div>
  );
}
```

### 8.2 Toast 전역 관리 — 선택 (`frontend/src/design/useToast.js`)

Record 외에도 Settings/Session에서 사용하므로 훅으로:
```js
export function useToast() {
  const [text, setText] = useState('');
  const show = (t, ms = 1800) => { setText(t); setTimeout(() => setText(''), ms); };
  return { text, show };
}
```

Toast 컴포넌트는 `frontend/src/design/Toast.jsx`로 분리 (원본 record.jsx:170~183 포팅).

### 8.3 유틸 함수 추가 (`lib/utils.js`에 추가)

이미 존재하는 것: `daysSince`, `getToday`, `getDow`, `getWeekRange`, `getDayAchievement`, `getStreak`, `fmtDate`, `fmtDateFull`.

추가 필요:
- `getGreeting(hour)`: `h<5?'편안한 밤':h<11?'좋은 아침':h<17?'오후':'저녁'`
- `formatKgDelta(delta)`: `delta<0 ? '▼ '+abs(delta).toFixed(1) : '▲ '+delta.toFixed(1)`
- `getMealTime(diet_records, meal_type, date)`: 해당 끼니 첫 기록 time 반환, 없으면 `'미기록'`

---

## 9. 라우팅 (`frontend/src/App.jsx` 재작성)

**기존 App.jsx 전부 삭제 후 재작성**:

```jsx
import { useEffect, useState } from 'react';
import { DataProvider, useData } from './hooks/useData';
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
import { LoadingScreen } from './screens/_Loading';

const TOP_SCREENS = { home: Home, diet: Meal, weight: Weight, exercise: Workout, record: Record };

export default function App() {
  const [path, setPath] = useState(window.location.pathname + window.location.search);
  useEffect(() => {
    const h = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  }, []);

  const nav = (p) => { window.history.pushState({}, '', p); setPath(p); };

  return (
    <DataProvider>
      <Router path={path} nav={nav}/>
    </DataProvider>
  );
}

function Router({ path, nav }) {
  const { data, loading } = useData();
  if (loading) return <LoadingScreen/>;

  // 세션
  if (path.startsWith('/session')) {
    return <MobileShell hideChrome tab="" topTab="" showTopTabs={false}>
      <Session nav={nav}/>
    </MobileShell>;
  }

  // 하단 탭별
  if (path.startsWith('/calendar')) {
    return <MobileShell tab="cal" showTopTabs={false} nav={nav}><Calendar/></MobileShell>;
  }
  if (path.startsWith('/guide')) {
    return <MobileShell tab="guide" showTopTabs={false} nav={nav}><Guide/></MobileShell>;
  }
  if (path.startsWith('/settings')) {
    return <MobileShell tab="set" showTopTabs={false} nav={nav}><Settings/></MobileShell>;
  }

  // 홈 경로 — 상단 탭으로 분기
  const params = new URLSearchParams(path.split('?')[1] || '');
  const topKey = params.get('tab') || 'home';
  // 하단 탭은 항상 'home' (상단 기록 탭도 여기에 속함 — 하단 탭 중복 제거됨, Q&A 15.3 Q1)
  const bottomKey = 'home';
  const Screen = TOP_SCREENS[topKey] || Home;

  return (
    <MobileShell tab={bottomKey} topTab={topKey} showTopTabs={true} nav={nav}>
      <Screen nav={nav}/>
    </MobileShell>
  );
}
```

- `nav` prop을 화면들에 내려서 페이지 전환 시 사용.
- 기존 `App.jsx`의 라우팅 로직(URL startsWith 체크)은 그대로 유지하되 컴포넌트 이름만 변경.

**중요**: `useData`는 `MobileShell`보다 **더 아래** 레벨에서 호출. `MobileShell` 자체는 data 없이 렌더 가능해야 함. `StatusLine`에서만 data 필요.

**재확인**: TabBar의 `onClick`은 `nav('/')`, `nav('/calendar')` 등 호출. TopTabs의 `onClick`은 `nav('/?tab=diet')` 등.

---

## 10. 데이터 연결 매핑 표

디자인 원본의 하드코딩 데이터 → 실데이터 치환. **이 표를 화면 구현 시 참조**.

| 화면 | 디자인 원본 위치 | 디자인 값 | 실데이터 경로 |
|---|---|---|---|
| Home | home.jsx:11 | `start=113.1, cur=105.0, goal=80` | `profile.start_weight_kg`, `weight_records[-1].weight_kg`, `profile.goal_weight_kg` |
| Home | home.jsx:13 | `-0.9 vs yesterday` | 최신과 **전일 날짜** 체중 차 |
| Home | home.jsx:15~20 | 4개 todo 하드코딩 | `exercise_records.today`, `diet_records.today`, `daily_targets.protein_g/kcal` |
| Home | home.jsx:31 | `이현우` | `profile.name` (현재 `Simpson`) |
| Home | home.jsx:82 | `D-N일` | `(cur-goal)/0.9 * 7` |
| Home | home.jsx:144~145 | 매크로 목표 180/60/1500 | `daily_targets.*`, 없으면 180/60/1500 |
| Home | home.jsx:161~164 | 타임라인 4개 | `diet/exercise/weight/medication_records` 오늘자 시간역순 4개 |
| Meal | meal.jsx:5 | `'2026-04-23'` | `useState(getToday())` |
| Meal | meal.jsx:7~17 | 끼니별 목업 items | `diet_records.filter(r => r.date===sel && r.meal_type==='아침')` 등 |
| Weight | weight.jsx:30~33 | `105.0` | `weight_records[-1].weight_kg` |
| Weight | weight.jsx:5~16 | 44일 곡선 | 실제 `weight_records` 맵핑 |
| Weight | weight.jsx:71~74 | 체지방률 45.1 등 | `inbody_records[-1]` 필드들 |
| Weight | weight.jsx:93~97 | 5개 수치 | `inbody_records[-1]` |
| Workout | workout.jsx:8 | `weekly = { done: 3, goal: 4 }` | 이번주 `exercise_records` 날짜 수 / 4 |
| Workout | workout.jsx:9 | `lastRest = 17` | `today - last exercise_records.date`일수 |
| Workout | workout.jsx:14~20 | 5개 운동 | `exercise_library` filtered by cat/filter |
| Workout | workout.jsx:44 | 7일 도트 states | 이번주 `exercise_records` 날짜별 존재 |
| Record | record.jsx:25~27 | `108/110g`, `786kcal`, `D+45` | `diet_records.today` 합산 + `daysSince` |
| Record | record.jsx:124~129 | 5개 퀵픽 | `frequent_foods.slice(-5)` (또는 사용량 top 5) |
| Guide | record.jsx:220~226 | 3개 스케줄 | `profile.exercise.daily_routine.*` |
| Guide | record.jsx:253~257 | 3끼 식단 | `profile.meal_plan`(있으면) or 하드코딩 |
| Calendar | calendar-settings.jsx:7~13 | 4월 weeks | 현재 월 계산 |
| Calendar | calendar-settings.jsx:15~20 | marks 하드코딩 | 해당 월 records 날짜 수집 |
| Calendar | calendar-settings.jsx:100~103 | 4개 마일스톤 | **하드코딩 유지 허용** |
| Settings | calendar-settings.jsx:154~155 | 이현우 / hwlee@gmail.com | `profile.name`, 이메일 하드코딩 |
| Settings | calendar-settings.jsx:173 | DB 기록 35건, 사진 19개, AI 127 | `/api/settings` 응답 또는 각 records.length 합산 |
| Settings | calendar-settings.jsx:187~193 | 환경설정 6행 | `profile.goal_weight_kg`, `daily_targets.*` |
| Settings | calendar-settings.jsx:212~215 | 4개 AI 작업 | `/api/ai/jobs` 최근 4개 |
| Session | workout.jsx:155~159 | 3개 운동 | 하드코딩 허용 (Phase 1 범위 축소) |

---

## 11. 기존 파일 정리 (명시적 삭제 목록)

아래는 Phase 1 작업 완료 후 삭제해야 할 파일들.

```bash
rm -rf frontend/src/components
rm -rf frontend/src/pages
rm frontend/src/index.css  # 이미 재작성된 새 버전으로 덮어씀
```

`App.jsx`는 덮어쓰기. `main.jsx` / `hooks/useData.jsx` / `lib/api.js` / `lib/utils.js`는 유지 (utils.js만 위 8.3 함수 추가).

**의존성 정리**:
```bash
cd frontend && npm uninstall lucide-react recharts
```

`package.json`에서 `"lucide-react": "^1.0.1"`, `"recharts": "^3.8.0"` 삭제 확인.

---

## 12. 검증 체크리스트 (Phase 1 완료 기준)

아래 **전부 통과**해야 Phase 2 진행.

### 12.1 빌드/실행
- [ ] `cd frontend && npm run build` 에러 없이 성공
- [ ] `npm run dev` 기동 후 `http://localhost:18000` 접속 (vite는 포트 변경 있을 수 있음; dist 빌드 후 FastAPI 서빙 확인)
- [ ] 모바일 뷰(390x844)에서 9개 화면 모두 렌더 — 빈 화면 없음

### 12.2 시각 검증 (매우 중요)
- [ ] 모든 배경이 `#0E0F12` 오프블랙. 기존의 형광 민트/시안이 **단 하나도 보이지 않음**
- [ ] 엑센트는 **단 하나의 앰버 `#F5A524`** 만 쓰임
- [ ] 체중 숫자는 Geist 300(얇음) 72px, 기본 카피는 Pretendard 400/500
- [ ] 모노 숫자(P108g, D+45, 13:14 등)는 전부 Geist Mono
- [ ] 카드 라운드 20px, 버튼 라운드 12px
- [ ] 상단 5탭 하단 5탭 네비 정상 동작 + 현재 탭 underline(상) / accent(하)

### 12.3 기능 검증
- [ ] 홈의 체중/단백질/칼로리 수치가 실제 DB와 일치
- [ ] 식단 화면 날짜 스트립 전환 시 해당 일 끼니 카드 변함
- [ ] 체중 차트 range 탭별 데이터 개수 변함
- [ ] 운동 화면 "운동 시작" → `/session`으로 이동 + 타이머 동작
- [ ] 기록 화면 체중 입력 저장 → `POST /api/weight` 호출 확인 + 토스트
- [ ] 기록 화면 식단 분석 버튼 → `POST /api/ai/diet-draft` → 폴링 → 완료 토스트
- [ ] 달력 도트가 해당 월 실데이터 반영
- [ ] 설정의 D+N / DB 기록 수치 정확

### 12.4 비시각 검증
- [ ] `lucide-react`/`recharts` import가 소스에 남아있지 않음 (`grep -rn "lucide\|recharts" frontend/src` 무결)
- [ ] inline `style={{...}}` 사용 지점이 9.2의 허용 케이스에 한정 (동적 값/SVG/그라디언트)
- [ ] `docs/design_handoff/` 참조를 빼고 소스가 자립 — 핸드오프 폴더를 지워도 앱이 작동
- [ ] 콘솔 에러 0개

### 12.5 스크린샷 비교
- [ ] `docs/screenshots/*.png` (기존) — 참고만, **복원 대상 아님**
- [ ] 새 구현 기동 후 Playwright로 10개 화면 재캡처해서 `docs/screenshots_v2/`에 저장 (아래 명령 참고)

```bash
python3 /tmp/capture_screens.py  # 경로는 실제 워킹 스크립트로
mv docs/screenshots_v2.tmp docs/screenshots_v2
```

---

## 13. Phase 2 — 데스크탑 (후속)

### 13.1 범위

**원본**: `docs/design_handoff/project/desktop-app.jsx` (315행).

**가용 레이아웃** (원본 참조):
- 좌측 사이드바 (로고/네비 5개)
- 상단 헤더 (날짜 + 검색)
- 메인: KPI 카드 4개 (row) + 차트 그리드 2열 + 기록 테이블
- 우측 "오늘 요약" 위젯

### 13.2 반응형 전략

- Tailwind 브레이크포인트 `lg` (1024px) 기준으로 전환.
- 모바일: `MobileShell` 유지.
- 데스크탑: 새 `DesktopShell` + 동일 화면 컴포넌트 재사용 (레이아웃만 다르게)
  - `HomeScreen`은 "데스크탑 대시보드"로 확장 (KPI 4개 + 차트 + 테이블)
  - 기타 화면은 사이드바 안 Flex 레이아웃으로 래핑

### 13.3 Phase 2 체크리스트 (작성 예정)

Phase 1 완료 후 이 섹션을 별도 문서(`docs/19_redesign_plan_desktop.md`)로 확장할 것.

---

## 14. 스타일 변환 치트시트 (구현 중 자주 참조)

### 14.1 가장 자주 나오는 inline → Tailwind

| inline style | Tailwind |
|---|---|
| `color: S.text` | `text-text` |
| `color: S.textMid` | `text-text-mid` |
| `color: S.textDim` | `text-text-dim` |
| `background: S.bgElev2` | `bg-bg-elev-2` |
| `border: '1px solid ' + S.line` | `border border-line` |
| `borderRadius: 20` / `radius.lg` | `rounded-lg` (20px with our theme) |
| `borderRadius: 999` | `rounded-full` |
| `fontFamily: S.fontMono` | `font-mono` |
| `fontFamily: S.fontSerif` | `font-serif` |
| `fontSize: 11` | `text-[11px]` |
| `fontWeight: 500` | `font-medium` |
| `fontWeight: 600` | `font-semibold` |
| `fontWeight: 300` | `font-light` |
| `letterSpacing: -0.3` | `tracking-[-0.3px]` |
| `letterSpacing: 1.2` | `tracking-[1.2px]` |
| `textTransform: 'uppercase'` | `uppercase` |
| `padding: '14px 16px'` | `py-3.5 px-4` (14=3.5*4, 16=4*4) 혹은 `p-[14px_16px]` |
| `display: 'flex', alignItems: 'center', gap: 10` | `flex items-center gap-2.5` |
| `display: 'grid', gridTemplateColumns: '1fr 1fr'` | `grid grid-cols-2` |
| `gridTemplateColumns: 'repeat(7, 1fr)'` | `grid grid-cols-7` |
| `position: absolute; inset: 0` | `absolute inset-0` |
| `transition: 'all .15s'` | `transition-all duration-150` |

### 14.2 임의값 (Tailwind에 없는 수치)

Tailwind 4는 `[숫자px]` arbitrary value 완전 지원.
- `w-[390px] h-[844px]` → iPhone viewport
- `h-[44px] px-[18px]` → 버튼
- `text-[64px]` → 히어로 숫자

### 14.3 동적 색 (칩/링 등)

칩 배경은 `color + '22'` (hex opacity) 형식. Tailwind는 불가 → inline style 허용.

```jsx
<span style={{ background: `${color}22`, color: color }}>
```

### 14.4 그라디언트

빌드 타임에 고정 가능한 그라디언트는 Tailwind arbitrary:
```html
<div className="bg-[linear-gradient(135deg,var(--color-accent),#F5C574)]" />
```

런타임 계산 그라디언트는 inline style.

---

## 15. Q&A / 의사결정

구현자가 작업 중 새 판단 필요 시 **사용자에게 질문 후 이 섹션에 기록**. 임의 결정 금지.

### 15.1 착수 전 결정 완료 (2026-04-23 사용자 확인)

이미 결정된 사항이므로 구현자는 이에 따라 진행.

| # | 질문 | 사용자 답변 | 반영 위치 |
|---|---|---|---|
| Q1 | 상단/하단 `기록` 탭 중복? | **제거. 하단 `log` 탭 삭제 → 4탭 체제** | §6.3, §9 |
| Q2 | Guide 5개 탭 Phase 1 구현 범위? | **전부 구현 (구현자 판단 위임)** | §7.6 |
| Q3 | 검색 버튼 동작? | **빈 버튼 (noop)** | §6.1 BrandHeader |
| Q4 | Session 운동 목록? | **Workout 화면의 현재 기본 목록 전달** | §7.9, §7.9.1 |
| Q5 | 이메일 하드코딩 OK? | **OK. `simpson301599@gmail.com`** | §7.8 |

### 15.2 구현 중 발견될 것 (이 섹션에 추가해 가며 진행)

구현자가 새 의문이 생기면 아래에 `Q6, Q7...` 형식으로 추가하고 사용자에게 질문. 답변 받으면 이 표에 결정 기록. 임의 진행 금지.

_(비워 두고 구현자가 추가)_

### 15.3 이미 알려진 불확실성 (진행 중 판단)

- **운동 화면 필터**: `exercise_library`에 `즐겨찾기/상체밀기/상체당기기/하체/코어` 분류 필드가 있는지 미확인. 없으면 `exercise_library[].muscle_groups` 같은 필드 추론 필요. 구현 시 확인하고 없으면 Q&A 추가 후 질문.
- **Guide 로드맵 vs Calendar 마일스톤 차별화**: Phase 1은 동일 콘텐츠 반복. Phase 2에서 재설계 여부 결정.
- **exercise_library의 defaultWeight/defaultReps 필드**: 없을 가능성 높음 → `exercise_records` 기반 추론 폴백 사용.

---

## 16. 작업 순서 (권장)

아래 순서로 **단계별 커밋**. 각 단계 끝에 `npm run build` 성공 확인.

1. **브랜치 생성 + 디자인 핸드오프 복사** (이미 완료: `docs/design_handoff/`)
2. **폰트 교체** (`frontend/index.html`)
3. **토큰 + 글로벌 CSS** (`frontend/src/index.css` 전면 재작성)
4. **Icon + Primitives** (`design/Icon.jsx`, `design/primitives/*.jsx`)
5. **Layout 셸** (`layout/MobileShell.jsx`, `TopTabs.jsx`, `TabBar.jsx`, `StatusLine.jsx`)
6. **_Loading + Toast + useToast** 공통 헬퍼
7. **Home 화면** (제일 어려움, 다른 화면들의 패턴 확립)
8. **Meal / Weight / Workout** (중간)
9. **Record / Guide / Calendar / Settings** (나머지 탭/경로)
10. **Session** (Phase 1 범위 축소 버전)
11. **App.jsx 라우팅 재작성**
12. **기존 components/pages 전량 삭제** + `npm uninstall lucide-react recharts`
13. **검증 체크리스트 12장 전부 통과**
14. **스크린샷 재캡처** → `docs/screenshots_v2/`
15. **커밋 + PR** `redesign/v2` 브랜치

---

## 17. 참고 리소스

- 디자인 핸드오프 전체: `docs/design_handoff/`
- 원본 스크린샷 (리디자인 전): `docs/screenshots/01_home.png` ~ `10_workout_session.png`
- 기존 토큰 (삭제 대상): `frontend/src/index.css` (현재)
- 데이터 shape 예시: `simpson_data.json` 및 `/api/data` 응답
- 서버 엔드포인트 전체: `server.py:22~326` (24개 엔드포인트, `grep '@app\.' server.py`)

---

## 18. 완료 조건

이 문서의 12장 체크리스트 **전부 ✅** + 사용자 승인 한 번 → Phase 1 완료 선언 → Phase 2 착수.

> ⚠️ **절대 금지**: 디자인 원본에 없는 섹션/버튼/페이지를 구현자 임의 판단으로 추가하지 말 것. "이게 있으면 좋겠다"는 Q&A에 추가해서 사용자 결정 대기.

— 끝 —
