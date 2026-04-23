# design_handoff_ref — 레퍼런스 구현 (컴파일 검증된 참조 코드)

> **이건 계획서의 부록이지 앱 구현이 아님.**
> 구현자는 이 폴더의 파일을 **복사 또는 모방**해서 `frontend/src/` 하위에 배치.

## 왜 외부 파일로 분리했나

계획서 본문에 JSX/CSS 코드 블록을 그대로 박으면:
- 타입/문법 검증이 안 된다
- 계획서가 거대해진다
- 리뷰가 코드 리뷰가 돼버린다

이 폴더는 **컴파일 가능한 참조물**. 변경해도 앱에는 영향 없음.

## 폴더 구조

```
design_handoff_ref/
├── README.md            ← 이 파일
├── index.css            ← Tailwind 4 @theme 토큰 전체 (실 적용: frontend/src/index.css)
├── Icon.jsx             ← 25개 SVG 아이콘 (실 적용: frontend/src/design/Icon.jsx)
├── primitives/
│   ├── Card.jsx
│   ├── Ring.jsx
│   ├── Bar.jsx
│   ├── Chip.jsx
│   ├── TapBtn.jsx
│   ├── SectionLabel.jsx
│   ├── Toast.jsx
│   └── index.js          ← barrel
│                          (실 적용: frontend/src/design/primitives/*)
├── layout/
│   ├── MobileShell.jsx   ← react-router-dom 7.x 기반 셸
│   ├── TopTabs.jsx       ← 홈 내부 5탭 (홈/식단/체중/운동/기록)
│   ├── TabBar.jsx        ← 하단 4탭 (대시보드/달력/가이드/설정)
│   └── StatusLine.jsx    ← D+N / 연속 N일
│                          (실 적용: frontend/src/layout/*)
└── lib/
    ├── format.js          ← getGreeting/fmtKgDelta/buildTodayTimeline 등
    └── exerciseMaps.js    ← group/bodypart 영↔한 매핑 + 필터 헬퍼
                            (실 적용: frontend/src/lib/ 에 병합)
```

## 실 적용 시 경로 매핑

| ref 경로 | 실 적용 경로 |
|---|---|
| `index.css` | `frontend/src/index.css` (통째 교체) |
| `Icon.jsx` | `frontend/src/design/Icon.jsx` |
| `primitives/*` | `frontend/src/design/primitives/*` |
| `layout/*` | `frontend/src/layout/*` |
| `lib/format.js` | `frontend/src/lib/utils.js` 에 **추가** (기존 함수 유지) |
| `lib/exerciseMaps.js` | `frontend/src/lib/exerciseMaps.js` (신규) |

## import 경로 규약

실 적용 시 **상대경로 사용**. 예:
```jsx
import Icon from '../design/Icon';
import { Card, Ring } from '../design/primitives';
import { MobileShell } from '../layout/MobileShell';
import { getGreeting } from '../lib/utils';
```

별칭(`@/`)은 vite.config.js에 설정 안 돼 있으므로 쓰지 말 것. 필요하면 알고 설정 후 쓸 것.

## 의존성

- `react@19`, `react-dom@19` — 이미 설치됨
- `react-router-dom@7` — 이미 설치됨 (package.json에 존재, 실 사용은 이 리디자인에서 처음)
- `lucide-react`, `recharts` — **제거 예정**. 레퍼런스는 이 두 패키지 안 씀.

## 레퍼런스의 한계

이 폴더는 **프리미티브 + 셸 + 유틸**까지만 포함. 9개 화면 컴포넌트는 계획서 §8에 스펙 표로 기술했고, 구현자가 스펙 + 레퍼런스 조합으로 작성.

구현자가 화면 한 개를 만든 후 이 폴더에 **추가**하는 것은 허용 (패턴 축적용). 계획서 수정은 사용자 승인 후.
