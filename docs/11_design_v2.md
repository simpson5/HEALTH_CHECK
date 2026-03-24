# 디자인 개선 계획서 v2 (React + Tailwind 기반)

> 작성일: 2026-03-24
> 기반: 2026 UI 트렌드 조사 + 현재 화면 분석
> 기술: React + Tailwind CSS

---

## 1. 현재 화면 분석

### 문제점

| 문제 | 상세 |
|------|------|
| **배경이 전부 같은 톤** | bg (#0a0a0f) → card (#12121a) 차이가 미미. 계층 구분 안 됨 |
| **카드에 깊이감 없음** | border만 있고 shadow/blur 없음. 평면적 |
| **색상 활용 단조** | accent(시안) 과다 사용. 나머지 색상 존재감 없음 |
| **그라데이션 없음** | 모든 요소가 단색. 버튼, 프로그레스바 모두 밋밋 |
| **폰트 위계 불명확** | 제목/본문/캡션 크기 차이가 작음 |
| **여백 불규칙** | 카드 간격, 섹션 간격 기준 없음 |
| **애니메이션 없음** | 페이지 전환, 카드 등장 효과 없음 |
| **상단 탭 밋밋** | 텍스트 + 가는 밑줄만 |
| **입력 필드 기본형** | 포커스 효과, 글로우 없음 |

---

## 2. 2026 UI 트렌드 적용 포인트

### 2-1. Dark Glassmorphism

> 2026년 가장 주목받는 트렌드. 반투명 유리 효과 + 다크 배경.

```css
/* 글래스 카드 */
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 20px;
```

적용 대상:
- 주요 카드 (체중, 단백질, 미션)
- 상단/하단 네비게이션
- 모달/오버레이

### 2-2. Ambient Gradients

> 배경에 은은한 컬러 오브(orb)를 배치하여 깊이감 부여

```css
/* 배경 그라데이션 오브 */
.ambient-orb {
  position: fixed;
  width: 300px; height: 300px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
}
/* 시안 오브 (좌상단) */
.orb-cyan { background: #00e5ff; top: -100px; left: -100px; }
/* 퍼플 오브 (우하단) */
.orb-purple { background: #b47fff; bottom: -100px; right: -100px; }
```

### 2-3. Gradient Accents

> 단색 → 그라데이션으로 전환. 버튼, 프로그레스바, 포인트 텍스트

```
Primary: #00e5ff → #00ff88 (시안→민트)
Warm: #ff8c00 → #ffcc00 (주황→노랑)
Danger: #ff4466 → #ff8c00 (빨강→주황)
Info: #b47fff → #00e5ff (보라→시안)
```

### 2-4. 타이포그래피 위계 강화

| 용도 | 현재 | 변경 |
|------|------|------|
| 대형 숫자 (체중) | 36px Bebas | **48px Inter/Geist (가변폰트)** |
| 중형 숫자 | 24px | **32px** |
| 섹션 제목 | 11px uppercase | **13px semibold** |
| 카드 제목 | 11px muted | **12px medium** |
| 본문 | 12~13px | **13px** 통일 |
| 캡션 | 10~11px 혼재 | **11px** 통일 |

### 2-5. Micro-interactions

| 요소 | 효과 |
|------|------|
| 카드 등장 | fade-in + 약간 위로 슬라이드 (stagger) |
| 탭 전환 | 콘텐츠 fade 전환 |
| 프로그레스 바 | 로드 시 0→값으로 애니메이션 |
| 숫자 | 카운트업 애니메이션 |
| 버튼 hover | glow 효과 강화 |
| 체크마크 | scale + bounce |

---

## 3. 새로운 색상 팔레트

### 배경 계층

```
Level 0 (메인 배경):  #06060b   ← 더 어둡게
Level 1 (카드):       rgba(255,255,255,0.03) + blur  ← 글래스
Level 2 (강조 카드):   rgba(255,255,255,0.06) + blur  ← 더 밝은 글래스
Level 3 (입력 필드):   rgba(255,255,255,0.08)
```

### 액센트 (그라데이션)

```
Primary:  linear-gradient(135deg, #00e5ff, #00ff88)   시안→민트
Secondary: linear-gradient(135deg, #b47fff, #00e5ff)   보라→시안
Warm:     linear-gradient(135deg, #ff8c00, #ffcc00)   주황→노랑
Danger:   linear-gradient(135deg, #ff4466, #ff8c00)   빨강→주황
```

### 텍스트

```
Primary:   #f0f0ff  (밝은 화이트, 약간 블루 틴트)
Secondary: #7a7a9e  (중간 회색, 블루 틴트)
Muted:     #4a4a6a  (어두운 회색)
```

### 보더

```
기본:     rgba(255, 255, 255, 0.06)
호버:     rgba(255, 255, 255, 0.12)
강조:     rgba(0, 229, 255, 0.2)
```

---

## 4. 컴포넌트 재설계

### 4-1. Card (글래스 카드)

```jsx
// 기본 글래스 카드
<div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]
  rounded-2xl p-5 shadow-lg shadow-black/20">

// 강조 글래스 카드 (체중, 핵심 정보)
<div className="bg-white/[0.06] backdrop-blur-xl border border-accent/20
  rounded-2xl p-5 shadow-lg shadow-accent/10">
```

### 4-2. ProgressBar

```jsx
// 그라데이션 + 글로우
<div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
  <div className="h-full rounded-full bg-gradient-to-r from-accent to-success
    shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all duration-700" />
</div>
```

### 4-3. Button (Primary)

```jsx
<button className="bg-gradient-to-r from-accent to-success text-black
  font-black rounded-2xl px-6 py-4 shadow-lg shadow-accent/25
  hover:shadow-accent/40 active:scale-[0.97] transition-all">
```

### 4-4. TopNav

```jsx
// 글래스 네비 + 그라데이션 인디케이터
<nav className="sticky top-0 z-50 bg-[#06060b]/70 backdrop-blur-2xl
  border-b border-white/[0.06]">
  {/* 활성 탭 밑에 그라데이션 도트 */}
  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-accent to-success
    mx-auto mt-1" />
</nav>
```

### 4-5. 숫자 디스플레이

```jsx
// 큰 숫자에 그라데이션 텍스트
<span className="font-display text-5xl bg-gradient-to-r from-accent to-success
  bg-clip-text text-transparent">
  109.0
</span>
```

---

## 5. 페이지별 개선

### 5-1. 홈 탭

- 배경에 ambient orb 2개 (시안 좌상단, 보라 우하단)
- 체중: 그라데이션 텍스트 + 글래스 카드
- 목표 프로그레스: 글로우 효과
- 미션: 2x2 그리드 + 체크 애니메이션
- 식단/운동: 컴팩트 카드

### 5-2. 식단 탭

- 단백질 링: 그라데이션 스트로크
- 끼니 카드: 좌측 그라데이션 바 (아침=금, 점심=주황, 저녁=보라)
- 사진: 둥근 모서리 + 그림자

### 5-3. 체중 탭

- 차트: 배경 그라데이션 + 글로우 라인
- 인바디 카드: 글래스 + 그라데이션 보더

### 5-4. 운동 탭

- 운동 시작 버튼: 큰 그라데이션 + 펄스 애니메이션
- 주간 현황: 원형 프로그레스 고려
- 카드 그리드: hover glow

### 5-5. 달력 탭

- 달성률: 더 진한 배경색 (구분 명확하게)
- 오늘: 글로우 링
- 이벤트 도트: 더 크게

### 5-6. 기록 탭

- 리포트 카드: 점수별 좌측 그라데이션 바 (A=민트, B=시안, C=주황, D=빨강)

---

## 6. Tailwind 설정 변경

### index.css

```css
@import "tailwindcss";

@theme {
  /* 배경 */
  --color-bg: #06060b;
  --color-bg-glass: rgba(255, 255, 255, 0.03);
  --color-bg-glass-bright: rgba(255, 255, 255, 0.06);
  --color-bg-input: rgba(255, 255, 255, 0.08);

  /* 액센트 */
  --color-accent: #00e5ff;
  --color-success: #00ff88;
  --color-warning: #ffaa00;
  --color-danger: #ff4466;
  --color-info: #b47fff;

  /* 텍스트 */
  --color-text: #f0f0ff;
  --color-muted: #7a7a9e;
  --color-dim: #4a4a6a;

  /* 보더 */
  --color-border: rgba(255, 255, 255, 0.06);
  --color-border-hover: rgba(255, 255, 255, 0.12);
}
```

### 커스텀 유틸리티

```css
/* 글래스 카드 */
.glass { @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl; }
.glass-bright { @apply bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl; }

/* 그라데이션 텍스트 */
.gradient-text { @apply bg-gradient-to-r from-accent to-success bg-clip-text text-transparent; }

/* 글로우 */
.glow-accent { box-shadow: 0 0 20px rgba(0, 229, 255, 0.15); }
.glow-success { box-shadow: 0 0 20px rgba(0, 255, 136, 0.15); }
```

---

## 7. 폰트 변경 검토

### 현재
- 숫자: Bebas Neue (좁은 대문자체, 올드한 느낌)
- 본문: Noto Sans KR

### 변경안

| 용도 | 현재 | 제안 | 이유 |
|------|------|------|------|
| 숫자 | Bebas Neue | **Inter** 또는 **Geist** | 모던, 가변폰트, 숫자가 선명 |
| 본문 | Noto Sans KR | **Pretendard** | 한국어 최적화, 모던, 무료 |

둘 다 무료이고 CDN/self-host 가능합니다.

---

## 8. 구현 순서

| # | 작업 | 범위 | 예상 |
|---|------|------|------|
| 1 | 색상/폰트/CSS 변수 업데이트 | index.css | 15분 |
| 2 | Card 컴포넌트 글래스 적용 | Card.jsx | 10분 |
| 3 | ProgressBar 글로우 적용 | ProgressBar.jsx | 10분 |
| 4 | TopNav + BottomNav 글래스 | Layout | 15분 |
| 5 | 홈 탭 ambient orb + 레이아웃 | Home.jsx | 30분 |
| 6 | 홈 숫자 그라데이션 텍스트 | Home.jsx | 10분 |
| 7 | 식단 탭 카드 개선 | Diet.jsx | 20분 |
| 8 | 체중 탭 차트 + 인바디 | Weight.jsx | 20분 |
| 9 | 운동 탭 버튼 + 카드 | Exercise.jsx | 20분 |
| 10 | 달력 탭 색상 강화 | Calendar.jsx | 15분 |
| 11 | 기록 탭 리포트 카드 | History.jsx | 15분 |
| 12 | 운동 세션 페이지 | WorkoutSession.jsx | 20분 |
| 13 | 가이드 + 음식관리 | Guide/Foods.jsx | 15분 |
| 14 | 애니메이션 추가 | 전체 | 20분 |

총 약 4시간.

---

## 참고 자료

- [Dark Glassmorphism 2026 트렌드](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)
- [2026 UI 디자인 트렌드 가이드](https://midrocket.com/en/guides/ui-design-trends-2026/)
- [2026 모바일 앱 디자인 트렌드](https://uxpilot.ai/blogs/mobile-app-design-trends)
- [다크모드 UI 인스피레이션 60+](https://muz.li/inspiration/dark-mode/)
- [Tailwind CSS 다크 테마](https://tailwindcss.com/docs/dark-mode)
