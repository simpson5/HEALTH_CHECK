# Simpson Health · 디자인 개선 핸드오프

> **대상 코드베이스:** `github.com/simpson5/HEALTH_CHECK`
> **대상 사이트:** `https://health.simpson-space.com/`
> **목표:** 전체 35개 화면에 일관된 디자인 시스템 적용 (위계 + 따뜻함)

---

## 0. 이 핸드오프의 본질

이 폴더의 HTML/JSX 파일은 **디자인 레퍼런스**입니다 — 그대로 복붙해서 쓰는 코드가 아니라, **"이런 모습/톤/위계를 만들어달라"는 시각적 명세**예요. 실제 작업은:

1. 기존 코드베이스(`HEALTH_CHECK`)의 컴포넌트 구조·라이브러리·관습을 **먼저 파악**할 것
2. 그 안에서 **이 핸드오프의 디자인 토큰과 원칙**을 적용
3. 5개 핵심 화면은 `reference/screens.jsx`에 픽셀 정확도로 구현되어 있으니 그대로 참조 가능
4. 나머지 30개 화면은 **동일 시스템 + 화면별 체크리스트(아래 §6)** 를 따라 작업

**Fidelity: High** — 컬러·타이포·간격은 정확한 값으로 사용. 5개 핵심 화면은 픽셀 단위로 재현 가능.

---

## 1. 핵심 진단 (8개 문제 → 해결)

| # | 문제 | 해결 | 심각도 |
|---|---|---|---|
| 1 | **앰버 한 가지 색에 모든 강조 집중** — 버튼·차트·강조 텍스트·진행률이 전부 amber | amber = 1차 액션 + 현재 값. **sage green** = 진행/긍정. **slate blue** = 보조 데이터 | 🔴 높음 |
| 2 | **"51일째 쉬는 중" 같은 죄책감 카피** | "마지막 운동 51일 전 · 가볍게 시작해볼까요?" 사실 + 부드러운 제안 | 🔴 높음 |
| 3 | **인바디 입력 9개의 "0"** — placeholder인지 실제 값인지 헷갈림 | placeholder는 `—`. 체중 1개만 필수, 나머지는 `전체 입력 ▾` 토글 | 🔴 높음 |
| 4 | **상단 5탭 + 하단 4탭 동시 존재** — "홈"과 "대시보드", "기록"과 "달력"이 헷갈림 | 상단 탭은 대시보드 내부 sub-tab으로만. 하단 nav가 1차 IA | 🟡 중간 |
| 5 | **빈 화면이 그냥 검은 공백** — 주간 리포트, AI 작업 이력 등 | "리포트 생성 시 이런 내용을 볼 수 있어요" 미리보기 카드 | 🟡 중간 |
| 6 | **모든 카드가 비슷해서 위계가 사라짐** | Hero(큰 데이터) · Section(그룹) · Inline(리스트) 3단계. 강조는 색이 아닌 크기·여백으로 | 🟡 중간 |
| 7 | **AI가 있는데 단순 수치만 노출** | 각 카드 옆에 변화량(`▼0.8kg`) + 일주일 1줄 AI 코멘트 항상 보이게 | 🔵 낮음 |
| 8 | **한글 자간 · 폰트 선택** | **Pretendard Variable** + 숫자는 **JetBrains Mono** | 🔵 낮음 |

---

## 2. 디자인 토큰 (정확한 값)

### Colors
```css
:root {
  /* Surfaces — 따뜻한 다크. 순흑(#000) 금지 */
  --bg:        #0E0B07;
  --surface:   #16120D;
  --surface-2: #1F1A14;
  --surface-3: #2A241C;
  --border:    rgba(255, 240, 220, 0.07);
  --border-hi: rgba(255, 240, 220, 0.14);

  /* Text — 4단계 위계 */
  --text:        #F5EAD8;                       /* primary */
  --text-mid:    rgba(245, 234, 216, 0.62);     /* secondary */
  --text-dim:    rgba(245, 234, 216, 0.40);     /* tertiary */
  --text-faint:  rgba(245, 234, 216, 0.22);     /* placeholder */

  /* Brand — 1차 액션 + 핵심 수치 전용 */
  --amber:       #F2A93C;
  --amber-hi:    #FFC267;   /* hover */
  --amber-dim:   #A36C1E;   /* press */
  --amber-soft:  rgba(242, 169, 60, 0.14);

  /* Signals — 의미 있는 색 */
  --sage:        #8FB46B;   /* 진행 · 긍정 · streak */
  --sage-soft:   rgba(143, 180, 107, 0.16);
  --slate:       #7C9FC4;   /* 보조 데이터 (체지방 등) */
  --slate-soft:  rgba(124, 159, 196, 0.16);
  --coral:       #D87A60;   /* 주의 · 매우 적게 사용 */
  --coral-soft:  rgba(216, 122, 96, 0.16);
}
```

### 색 사용 규칙 (중요)
- **amber** — 1차 CTA 버튼, 현재 값(103.0kg), AI 라벨, 즐겨찾기 ★
- **sage** — 진행 바, "▼ 10.0kg" 감량, streak "연속 12일", 좋아진 지표
- **slate** — 차트의 보조 시리즈(체지방), 부가 메타 데이터
- **coral** — 진짜 경고에만 (놓친 투약, 비정상 수치). **"오래 안 했어요"에 쓰지 말 것**
- **흰색·순회색** 안 씀 — 모두 따뜻한 톤(`#F5EAD8`)

### Typography
```css
font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
/* 숫자/날짜 */
font-family: 'JetBrains Mono', ui-monospace, monospace;
```

| Role | Size | Weight | Letter-spacing | 예시 |
|---|---|---|---|---|
| Display | 44~48 | 700 | -2px | `103.0` (체중) |
| Title | 22 | 700 | -0.4px | `오늘 할 일` |
| Heading | 15 | 600 | -0.2px | `Simpson Health` |
| Body | 13 | 500 | 0 | `머신 체스트 프레스` |
| Caption | 11 | 500 | 0 | `어제보다 0.4kg 감량` |
| Mono | 10~11 | 500 | 0 | `2026-05-27`, `30 / 110g` |

한글 line-height: **1.55 ~ 1.7** (넉넉히)

### Spacing & Radii
- Spacing scale: **4 · 8 · 12 · 14 · 16 · 18 · 20 · 24** px
- Page padding: **20px** horizontal
- Card padding: **14~18px**
- Radii: **8(r3) · 12(r4) · 16(r5) · 20(r6) · 24(r7)** + 999(pill)
- Touch targets: **44px** 최소

### Pretendard CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"/>
```

---

## 3. 공통 컴포넌트 패턴

### Buttons
```tsx
// 1차 액션 — amber 채워진
<button className="bg-amber text-[#1a1208] font-bold rounded-xl px-4 py-3">저장</button>

// 2차 — 테두리만
<button className="border border-border-hi text-text font-semibold rounded-xl px-4 py-3">취소</button>

// Ghost — 배경만 살짝
<button className="bg-surface-3 text-text-mid rounded-full px-4 py-2">필터</button>
```

### Card with hierarchy
```tsx
<div className="bg-surface border border-border rounded-2xl p-[18px]">
  <div className="text-text-mid text-xs">현재 체중</div>         {/* label */}
  <div className="flex items-baseline gap-1.5 mt-2">
    <div className="text-[44px] font-bold leading-none">103.0</div>{/* hero */}
    <div className="text-sm text-text-mid">kg</div>             {/* unit */}
  </div>
  <div className="text-sage text-xs font-semibold mt-1.5">▼ 0.4kg 어제보다</div>
</div>
```

### AI Insight chip (반복 사용 패턴 — 모든 화면에서 1개씩)
```tsx
<div className="bg-amber-soft rounded-lg px-3 py-2.5 flex gap-2.5">
  <span className="text-amber font-bold text-[11px]">AI</span>
  <span className="text-xs text-text leading-relaxed">
    이 페이스라면 <b className="text-amber">11월 중순</b>에 80kg 도달 예상이에요.
  </span>
</div>
```

### Progress (반드시 sage, amber 아님)
```tsx
<div className="h-2 bg-surface-3 rounded-full overflow-hidden">
  <div className="h-full bg-sage rounded-full" style={{width: '30%'}}/>
</div>
```

### Empty state
```tsx
// ❌ 그냥 검은 공백 + "리포트 생성" 버튼만
// ✅ 미리보기 카드 + 안내 + CTA
<div className="bg-surface border border-border rounded-2xl p-5">
  <div className="text-text-mid text-xs mb-2">아직 리포트가 없어요</div>
  <div className="text-sm leading-relaxed">
    매주 일요일 자동 생성됩니다. 지금 만들면 이런 내용을 볼 수 있어요:
  </div>
  <ul className="text-text-mid text-xs mt-3 space-y-1.5">
    <li>· 이번 주 평균 체중 및 변화</li>
    <li>· 운동 횟수 + 강도</li>
    <li>· AI 추천 다음 주 액션</li>
  </ul>
  <button className="bg-amber ...">지금 생성</button>
</div>
```

### Form input (인바디 패턴)
```tsx
<div className="flex items-center gap-3 py-3.5 border-b border-border">
  <label className="w-[78px] text-sm font-semibold">
    체중<span className="text-amber ml-1">*</span>
  </label>
  <input
    placeholder="—"
    className="flex-1 bg-transparent text-base font-mono border-b border-amber pb-0.5"
  />
  <span className="text-text-dim text-xs font-mono">kg</span>
</div>
```

---

## 4. IA · 네비게이션 결정사항

**현재**
- 상단 탭: `홈 / 식단 / 체중 / 운동 / 기록` (5개)
- 하단 nav: `대시보드 / 달력 / 가이드 / 설정` (4개)

**개선안**
- **하단 nav가 1차 IA** — `대시보드 / 달력 / 가이드 / 설정` 유지
- "홈"과 "대시보드"는 같은 페이지 — `홈` 라벨을 `대시보드`로 통합
- 상단 5탭은 **대시보드 내부의 sub-tab**으로만 존재
- "기록" 탭은 별도 1탭이 아니라, **각 위젯의 + 버튼**으로 기록할 수 있게 흡수 (선택)

---

## 5. 5개 핵심 화면 — 픽셀 참조 가능

`reference/screens.jsx`에 완성된 React 코드가 있습니다. 이걸 참조해서 코드베이스에 맞게 옮기세요.

| 화면 | 함수 | 핵심 변경 |
|---|---|---|
| 01 홈 | `HomeScreen()` | Greeting + streak / Hero 카드(큰 숫자 + sage 진행) + AI 1줄 / 오늘 할 일 통합 |
| 03 체중 | `WeightScreen()` | Hero 숫자 + 범위 탭 / 차트(목표 점선) / AI 인사이트 / 체성분 변화량 표시 / 골격근 amber + 체지방 slate |
| 04 운동 | `WorkoutScreen()` | "51일째 쉬는 중" 제거 / Ring 진행 + 부드러운 카피 / 주간 strip / amber pill CTA |
| 14 인바디 입력 | `InBodyScreen()` | 방법 선택 위로 / 체중 1개만 필수 / 체성분(선택) 토글 / placeholder "—" |
| 05 기록 | `RecordScreen()` | 그룹핑 명확화 / 체중·인바디·투약·식단 분리 / 투약 카드 5mg ▾ + 투약 버튼 |

---

## 6. 나머지 30개 화면 — 화면별 체크리스트

각 화면에 **반드시 적용해야 하는 변경점**을 명시합니다. 5개 핵심 화면의 토큰/컴포넌트를 그대로 재활용하세요.

### 메인 탭

#### 02 식단 (`02_meal.png`)
- [ ] 상단/하단 네비 통합 (IA 결정사항 적용)
- [ ] 칼로리/단백질/탄수화물/지방 4개 진행 막대 → sage(달성), amber(부족), coral(과다)
- [ ] "오늘 먹은 음식" 리스트: 시간 · 이름 · 칼로리 mono 폰트
- [ ] AI 인사이트 1줄 (예: "단백질 30g 부족, 저녁에 닭가슴살 1조각 추천")
- [ ] 빈 상태: "아침 미기록" placeholder + + 버튼

#### 06 캘린더 월간 (`06_calendar.png`)
- [ ] 각 날짜 셀: 체중 ▼ amber, 운동 점 sage, 투약 점 slate
- [ ] 오늘 셀: amber 테두리만 (배경 안 채움)
- [ ] 선택된 날짜: amber 채움 + text dark
- [ ] 월 헤더: 폰트 22, 좌우 화살표 ghost 버튼
- [ ] 하단 요약 카드: 이번 달 평균 / 운동 횟수 / 투약 횟수 (3개 stat)

#### 17 캘린더 주간 (`17_calendar_weekly.png`)
- [ ] 월간/주간 토글: pill 그룹 (surface-2 배경)
- [ ] 주간 표시: 7일 가로 strip, 각 날짜 아래 체중 mini-bar(sage)
- [ ] 시간축 또는 일별 요약 카드

#### 18 캘린더 일간 (`18_calendar_day_selected.png`)
- [ ] 선택일 헤더: 큰 숫자 + 요일
- [ ] 그 날의 모든 이벤트: 체중 / 식사 / 운동 / 투약 — 시간순 timeline
- [ ] 각 이벤트 아이콘 색: 의미별 (amber/sage/slate)

#### 07 가이드 (`07_guide.png`) + 13_guide_tab1~5
- [ ] 5개 탭 가로 스크롤 또는 segmented control
- [ ] 각 탭 콘텐츠는 카드형 콘텐츠 (Surface)
- [ ] **하루일과 (`13_guide_tab1`)**: 시간 timeline, 각 활동 아이콘 + 시간
- [ ] **식단 (`13_guide_tab2`)**: 추천 식단 카드 + 영양 정보
- [ ] **운동 (`13_guide_tab3`)**: 운동 가이드 리스트 (5번 화면 스타일 그대로)
- [ ] **식품도감 (`13_guide_tab4`)**: 식품 카드 그리드, 검색 바 amber-soft
- [ ] **로드맵 (`13_guide_tab5`)**: 단계별 진행, 현재 단계 amber, 완료 sage, 미완료 surface-3

#### 08 설정 (`08_settings.png`)
- [ ] 프로필 섹션 상단: 아바타 + 이름 + 편집 ghost 버튼
- [ ] 그룹별 list: 계정 / 알림 / 데이터 / 정보
- [ ] 각 list row: `padding 14px`, 우측 `›` text-dim
- [ ] 위험 액션 (로그아웃, 계정 삭제): coral 컬러로 분리

### 체중 관련

#### 19 체중 범위 변경 (`19_weight_range1_1W.png`, `19_weight_range2_3M.png`, `19_weight_range3_전체.png`)
- [ ] 5개 범위 pill 그룹 (`1W / 1M / 3M / 6M / 전체`) — 선택 시 surface-3
- [ ] 차트 datapoint 개수 자동 조정 (1W: 7개, 3M: 13개, 전체: 전부)
- [ ] 마지막 포인트는 항상 amber 큰 점 + bg 테두리
- [ ] 목표 80kg 점선(sage) 항상 표시

### 운동 관련

#### 20 운동 카테고리 (`20_workout_cat1_맨몸.png`, `20_workout_cat2_유산소.png`)
- [ ] 5개 화면(`WorkoutScreen`)과 동일 구조, 카테고리 chip 선택만 다름
- [ ] **맨몸**: 푸시업, 스쿼트 등. 무게 = "맨몸", 반복 × 세트만
- [ ] **유산소**: 트레드밀, 자전거 등. 무게 대신 거리/속도/시간

#### 28 운동 상세 sheet (`28_sheet_exercise_detail.png`)
- [ ] Bottom sheet 형태, 상단 핸들 바
- [ ] 운동명 hero / 즐겨찾기 ★ amber / 부위 chips
- [ ] 무게 · 반복 · 세트 stepper (- / 숫자 / +)
- [ ] 메모 textarea
- [ ] "기록하기" amber 큰 버튼 하단 고정

### 인바디 관련

#### 11 인바디 새 측정 (`11_inbody_new.png`)
- [ ] 14번 화면(`InBodyScreen`)과 거의 동일 — 방법 선택 진입점만 다름
- [ ] 빈 상태 일러스트 또는 placeholder 그래픽 추가
- [ ] "지난 측정 — 5/1, 26일 전" 안내

#### 15 인바디 CSV (`15_inbody_tab_csv.png`)
- [ ] 파일 업로드 영역: dashed border, surface-2
- [ ] 드래그 안내 텍스트 + "파일 선택" ghost 버튼
- [ ] 업로드 후 미리보기 테이블 (5행만, mono 폰트)
- [ ] "이대로 저장" amber 버튼

#### 16 인바디 사진 AI (`16_inbody_tab_ai.png`)
- [ ] 카메라 / 갤러리 선택 큰 카드 2개
- [ ] 업로드 후: 사진 + AI 추출 필드 미리보기 + "확인/수정" 흐름
- [ ] AI 인식 중: skeleton + "분석 중…" (amber pulse)
- [ ] 신뢰도 낮은 필드는 amber 강조 + 사용자 확인 요청

### AI 관련

#### 09 코치 (`09_coach.png`)
- [ ] 채팅 UI: AI 메시지 surface, 사용자 메시지 amber-soft
- [ ] 빈 상태: "안녕하세요, Simpson님" + 추천 질문 chip 4개
- [ ] 입력 바: 하단 고정, amber 전송 버튼
- [ ] 메시지 안의 데이터(체중·일자)는 inline chip

#### 10 AI 작업 이력 (`10_ai_jobs.png`)
- [ ] 각 작업: 카드 형태 (시간 · 유형 · 상태)
- [ ] 상태 chip: 완료(sage), 진행(amber pulse), 실패(coral)
- [ ] 빈 상태: 미리보기 카드 + 안내
- [ ] 시간 mono 폰트

#### 22 AI 작업 이력 필터 (`22_ai_jobs_filter_coach.png`)
- [ ] 상단 필터 chip row: 전체 / 코치 / 분석 / 리포트
- [ ] 필터 선택 시 active chip만 amber-soft
- [ ] 결과 없을 때: "이 필터로 작업이 없어요" + 필터 초기화 ghost 버튼

#### 12 주간 리포트 (`12_weekly_report.png`) + 21 주간 리포트 지난 회차 (`21_weekly_report_last.png`)
- [ ] **빈 상태**: 미리보기 카드 (현재 큰 결함)
- [ ] 리포트 상단: 주차 + 기간 (3/24 - 3/30)
- [ ] 섹션: 체중 요약 / 운동 / 영양 / AI 코멘트
- [ ] 각 섹션 카드 + 핵심 수치 + 변화량
- [ ] 지난 회차 리스트: 작은 카드 그리드, 최신순

### 모달 / 시트

#### 23 검색 모달 (`23_modal_search.png`)
- [ ] 상단 검색 바 amber-soft 포커스 링
- [ ] 최근 검색어 chip
- [ ] 결과: 카테고리별 그룹 (음식 / 운동 / 페이지)
- [ ] 결과 없음: "찾는 결과가 없어요" + 음식 추가 CTA

#### 24 프로필 편집 모달 (`24_modal_profile_edit.png`)
- [ ] 아바타 큰 원 + 편집 ghost 버튼
- [ ] 폼: 이름 / 생일 / 키 / 시작 체중 / 목표 체중
- [ ] 인바디 입력 row와 동일한 디자인 사용
- [ ] 하단 amber 저장 버튼

#### 25 숫자 편집 모달 (`25_modal_number_edit.png`)
- [ ] 큰 숫자 입력 (display 48px, mono)
- [ ] 단위 표시 (kg / cm)
- [ ] - / + stepper 또는 keypad
- [ ] 저장 / 취소

#### 26 식단 플랜 sheet (`26_sheet_meal_plan.png`)
- [ ] Bottom sheet
- [ ] 끼니별 그룹: 아침 / 점심 / 저녁 / 간식
- [ ] 각 음식 row: 이름 · g · 칼로리/단백질 mono
- [ ] AI 추천 식단 amber 카드

#### 27 데이터 내보내기 sheet (`27_sheet_export.png`)
- [ ] 옵션: 전체 / 기간 선택
- [ ] 포맷: CSV / JSON / PDF chip
- [ ] 포함 항목 체크박스 리스트
- [ ] "내보내기" amber 버튼 + 진행 상태 표시

---

## 7. 빠른 적용 순서 (추천)

| 단계 | 작업 | 예상 소요 | 임팩트 |
|---|---|---|---|
| **1** | 토큰만 교체 (colors.css 또는 tailwind config 업데이트) | 30분 | 즉시 톤 변화 |
| **2** | Pretendard CDN 추가 | 10분 | 한글 가독성↑ |
| **3** | 인바디 입력 9개 0 → 1개 필수로 개편 | 반나절 | 가장 큰 UX win |
| **4** | 운동 탭 "51일째" 카피 + 색 톤 변경 | 1시간 | 매일 보는 화면 |
| **5** | 홈 hero 카드 + 진행 sage로 | 1일 | 첫인상 |
| **6** | 체중 차트에 목표 점선 + AI 1줄 | 1일 | 데이터 의미↑ |
| **7** | 나머지 30개 화면 — §6 체크리스트 순회 | 1주 | 일관성 |

---

## 8. 절대 하지 말 것

- ❌ amber를 모든 강조에 사용 (현재 가장 큰 문제)
- ❌ 순흑(#000) 배경
- ❌ "쉬는 중", "놓쳤어요", "기록 없음" 같은 부정적/공허 카피
- ❌ 시스템 폰트 (한글 베이스라인 깨짐)
- ❌ 인바디처럼 폼 9개를 한 화면에 다 보이기
- ❌ Inter, Roboto — Pretendard 사용
- ❌ 무의미한 0 값 표시 (placeholder는 "—")

---

## 9. 폴더 구조

```
design_handoff/
├── README.md                          ← 이 파일
├── 00_design_proposal.html            ← 전체 제안 (캔버스로 보기)
└── reference/
    ├── tokens.jsx                     ← 모든 디자인 토큰 (T 객체)
    ├── screens.jsx                    ← 5개 핵심 화면 픽셀 정확 구현
    ├── app.jsx                        ← 진단/시스템/노트 카드 구현
    ├── design-canvas.jsx              ← 캔버스 컴포넌트 (참조 불필요)
    └── ios-frame.jsx                  ← 폰 프레임 (참조 불필요)
```

`00_design_proposal.html`을 브라우저로 열어서 **캔버스 우상단의 카드 hover → Focus 버튼**으로 각 화면 크게 보면서 작업하면 가장 좋습니다.

---

## 10. 질문이 생기면

화면 35개 중 §6에 명시 안 된 디테일이 나오면 **5개 핵심 화면의 패턴을 그대로 적용**하세요. 의심스러우면:
1. 같은 종류의 카드/입력이 5개 화면 중 어디에 있는지 찾기
2. 그 패턴 복사
3. 토큰만 §2 표 따라 사용

일관성 > 새로움. 이 핸드오프의 핵심은 **35개 화면이 한 앱처럼 느껴지게 하는 것**입니다.
