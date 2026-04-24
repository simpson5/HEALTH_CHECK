# Simpson Health — 전체 "준비 중" 제거 + 인바디 입력 + 체중 UX 수정

> **작성**: 2026-04-24 · **범위**: 19번 계획(placeholder 7곳) 흡수 + 인바디 UI 공백 + 체중 입력 UX 결함 + AI 기능 확장
> **전제**: `main` = 리디자인 v2 머지 상태 (`415e9eb`)
> **작업 브랜치**: `feat/complete-app`
> **계승**: `docs/19_complete_placeholders_plan.md` (이 문서가 대체함 — 19번은 Phase C로 흡수됨)

---

## §1. 왜 새로 쓰나

19번은 **7곳만** 다룸. 사용자 2026-04-24 피드백에서 실제 공백은 더 넓음:

| 구분 | 19번 포함 | 빠진 것 |
|---|---|---|
| "준비 중" 문자열 | 7곳 | P1 검색(MobileShell), P6 단위 → 추가 처리 |
| 인바디 관리 | ❌ | **입력 UI 전무** (DB 4/1 이후 3주 공백) |
| 체중 입력 | ❌ | Weight 탭에 입력칸 없음 (Record 탭 숨음 → "안 된다" 오인) |
| AI 기능 | 상담만 | 주간 분석·인바디 해석 없음 |

"전부"는 8곳 placeholder + 인바디 입력 + Weight UX + AI 확장.

---

## §2. 결정 레지스트리

### 2.1 확정 (Locked)

| # | 결정 | 근거 |
|---|---|---|
| L1 | **19번의 Locked L1~L10 전부 유지**. 본 문서는 확장만. | 19번 §2.1 |
| L2 | **체중 입력은 Weight 탭에도 배치** (Record 탭은 유지). 동일 컴포넌트 재사용 | Record 탭 숨김 = UX 결함 |
| L3 | **인바디 입력은 전용 화면** `/inbody/new`. Weight 탭 "인바디 기록하기" 버튼에서 진입 | 필드 10개 → 모달 협소 |
| L4 | **인바디 입력 방식 3가지 전부 지원**: 수동 폼 + CSV 업로드 + 사진 AI 파싱 | 실제 사용 맥락 — 기계/CSV/촬영 |
| L5 | **인바디 사진 AI 파싱은 신규 엔드포인트** `POST /api/ai/inbody-parse`. `ai_engine.py`에 `inbody_parse` job type 추가 | 식단과 분리 — 프롬프트/필드 다름 |
| L6 | **P1 검색 = 식단 기록만 검색** (모달). 운동/체중까지 확장은 과함. 단일 필드 `food_name` 대상 | 범위 폭발 방지, MVP |
| L7 | **P6 단위 행 = 제거**. 토글 구현 보류(Phase 3). 빈 "준비 중" 행 유지하지 않음 — 삭제 | 부분 적용 UX 결함 고정 |
| L8 | **주간 분석 AI 신규** — `POST /api/ai/weekly-report`. Home/Calendar에서 "주간 리포트" 액션 노출 | 사용자 요청: AI가 식단만이 아닌 주간 전체 분석 |
| L9 | **인바디 저장 시 AI 해석 자동 실행은 안 함**. 저장 완료 후 "AI 해석 보기" 버튼 노출 (수동 트리거) | 비용/지연 제어 |
| L10 | **머지/push 2단계 승인 게이트 유지** (19번 L10) | 기존 정책 |
| L11 | **Phase 단위 커밋**. Phase 완료 시 단독 커밋 + 사용자 확인 | 12단계 × 5Phase = 디버깅 가능성 확보 |

### 2.2 Open Questions

| # | 질문 | 기본값 |
|---|---|---|
| Q1 | 인바디 사진 AI 파싱 프롬프트 구조 — 구조화 출력 형식? | JSON schema 강제 (`weight_kg`, `muscle_kg`, `fat_kg`, `fat_pct`, `bmi`, `bmr_kcal`, `visceral_fat_level`, `inbody_score`). Claude tool use / JSON mode 활용 |
| Q2 | 주간 리포트 트리거 위치 | Home 하단 + Calendar 상단. 주 1회 월요일 자동은 하지 않음 (수동) |
| Q3 | 검색 모달 최대 결과 | 50건 (최근 순) |
| Q4 | 인바디 `day_since_start` 자동 계산 vs 입력 | 자동 (`medication_start` 기준 일수 계산) |
| Q5 | 인바디 변화량 (`*_change_kg`) 자동 계산 vs 입력 | 자동 (직전 레코드와의 차이) |
| Q6 | CSV 업로드 후 확인 단계? | 파싱 결과를 수동 폼에 채움 → 사용자 확인 → 저장 |

---

## §3. Phase 구조

| Phase | 이름 | 산출물 | 예상 |
|---|---|---|---|
| A | Weight 탭 체중 입력 | Weight.jsx에 입력 카드 추가 | 30분 |
| B | 인바디 입력 UI | `/inbody/new` 화면, 수동/CSV/AI 파싱 | 3h |
| C | 19번 전체 | Settings 6행 + Coach + AIJobsAll + PATCH /api/profile | 6~7h |
| D | AI 주간 분석 + 검색 + P1/P6 정리 | `/api/ai/weekly-report`, 검색 모달, 단위 행 제거 | 2~3h |
| E | 검증 + 스크린샷 + 머지 | §9 체크리스트, 캡처 갱신 | 1h |
| **합계** | | | **13~15h** |

분량 크니 **Phase 끝마다 커밋 + 사용자 확인**. Phase 중단·재개 가능하게 설계.

---

## §4. Phase A — Weight 탭 체중 입력 (30분)

### 4.1 설계
- Weight 화면 Hero number 아래에 **"오늘 체중 기록" 카드** 삽입
- Record 탭의 체중 입력 블록(Record.jsx:165~183) 동일 UX 재사용
- 신규 컴포넌트 `design/primitives/WeightQuickInput.jsx` 추출 → Weight + Record 양쪽에서 import

### 4.2 작업
1. `design/primitives/WeightQuickInput.jsx` 생성 — props: `onSaved()`
2. `screens/Record.jsx`의 체중 입력 블록을 `<WeightQuickInput onSaved={refresh}/>`로 교체
3. `screens/Weight.jsx` Hero 아래(range tabs 위)에 `<WeightQuickInput onSaved={refresh}/>` 삽입
4. 빌드 + 수동 확인 (Record/Weight 양쪽에서 입력 성공)

**커밋**: `feat(weight): quick input on weight tab + extract primitive`

---

## §5. Phase B — 인바디 입력 UI (3h)

### 5.1 라우팅
- 신규 라우트 `/inbody/new` (App.jsx 추가)
- MobileShell `inSession` 조건에 `/inbody` prefix 추가 (탭 숨김)
- Weight 탭 "최근 인바디" SectionLabel 우측에 **"+ 기록"** 버튼 추가 → `nav('/inbody/new')`

### 5.2 화면 구성 `screens/InbodyNew.jsx`

**상단 바**: ← 뒤로 · "인바디 기록"

**탭**: `수동 입력 / CSV 업로드 / 사진 AI`

#### (a) 수동 입력 폼
10개 필드 (`inbody_records` 스키마 기준):
- 측정일 (date, default = today)
- 체중 (weight_kg, 필수)
- 골격근 (muscle_kg)
- 체지방량 (fat_kg)
- 체지방률 (fat_pct)
- BMI
- 기초대사량 (bmr_kcal)
- 내장지방 레벨 (visceral_fat_level)
- 인바디 점수 (inbody_score)
- 메모 (memo, textarea)

입력 컴포넌트: `<NumberField label value onChange unit/>` (신규 프리미티브)

**자동 계산 필드** (서버 저장 시):
- `day_since_start` = `date - profile.medication_start` (일)
- `weight_change_kg` / `muscle_change_kg` / `fat_change_kg` = 직전 인바디 대비 차이

**위 자동 계산은 프론트 vs 백엔드 어디서 할지**: 프론트에서 계산 후 POST 본문에 포함. `data.inbody_records`는 이미 로드됨 → 직전 레코드 찾아 차이 계산.

#### (b) CSV 업로드 탭
1. `<input type="file" accept=".csv">` 선택
2. 업로드: `uploadPhoto(file)` (기존 `/api/photo` 재사용 — ext가 .csv면 `uploads/`에 저장)
3. 파싱: `POST /api/csv/inbody { path }` → `{ ok, data }`
4. 성공 시 파싱 결과를 수동 폼 필드에 채움 → 사용자 확인 → 저장

#### (c) 사진 AI 파싱 탭
1. `<input type="file" accept="image/*" capture="environment">` 선택
2. 업로드: `uploadPhoto(file)` → `photos/xxx.jpg`
3. `POST /api/ai/inbody-parse { photo: "photos/xxx.jpg" }` → `{ ok, job_id }`
4. `pollJob(job_id)` → 결과 JSON을 수동 폼 필드에 채움
5. 사용자 확인 후 저장

### 5.3 백엔드 변경

#### (a) `ai_engine.py` 인바디 파싱 job 타입 추가
- `JOB_TYPES` 에 `inbody_parse` 추가
- `_run_inbody_parse(input_data)` 함수 신설 — Claude에게 이미지 첨부 + JSON schema 강제
- 출력 필드: `weight_kg`, `muscle_kg`, `fat_kg`, `fat_pct`, `bmi`, `bmr_kcal`, `visceral_fat_level`, `inbody_score`

#### (b) `server.py` 신규 엔드포인트
```python
@app.post("/api/ai/inbody-parse")
async def ai_inbody_parse(request: Request):
    body = await request.json()
    from ai_engine import enqueue_job
    job_id = enqueue_job("inbody_parse", {"photo": body["photo"]})
    return JSONResponse({"ok": True, "job_id": job_id})
```

### 5.4 AI 해석 버튼
저장 성공 토스트 후, Weight 탭 "최근 인바디" 섹션 우측 상단에 **"AI 해석"** 버튼 추가 → `POST /api/ai/coach { question: "최근 인바디 결과 해석해줘: <json>" }` → Coach 화면으로 이동하며 자동 전송

**커밋 분리**:
- `feat(api): add inbody_parse ai job + endpoint`
- `feat(ui): inbody new screen with manual/csv/ai tabs`
- `feat(weight): add "+ 기록" button + ai interpret shortcut`

---

## §6. Phase C — 19번 계획 전체 (6~7h)

**전체 내용은 `docs/19_complete_placeholders_plan.md` 그대로 따른다** (§4~§7, L1~L10, 작업 순서 12단계).

변경점 2가지만:
1. **§9 Out of Scope의 P6(단위 토글) 행은 제거**가 아니라 **완전 삭제 (L7)**. Settings 환경설정 배열에서 `['단위', '메트릭']` 제거. 결과 5행(목표체중/단백질/칼로리/알림/내보내기)만 남음
2. **검증 체크리스트 7.3** 수정: `grep -rn "준비 중" frontend/src` = **0건** (P1도 §7 Phase D에서 처리하므로)

**커밋 메시지**: 19번 §6 표 그대로

---

## §7. Phase D — AI 주간 분석 + 검색 + 잔여 placeholder (2~3h)

### 7.1 주간 분석 AI

#### 백엔드
- `ai_engine.py`: `weekly_report` job type 추가
- 입력: `{ start_date, end_date }` (default = 지난 월~일)
- 데이터 수집: `weight_records`, `diet_records`, `exercise_sessions`, `inbody_records` 주간 범위 전부
- 출력 필드: `summary`, `weight_trend`, `diet_analysis`, `exercise_analysis`, `highlights`(배열), `advice`
- `server.py`: `POST /api/ai/weekly-report` 엔드포인트

#### 프론트
- 신규 화면 `screens/WeeklyReport.jsx` (`/weekly-report` 라우트)
- 지난 주 리포트 / 이번 주 리포트 탭
- "리포트 생성" 버튼 → `pollJob` → 결과 렌더
- **진입점 2곳**:
  - Home 하단 "주간 리포트 보기" 섹션 (이번 주/지난 주 가장 최근 리포트 링크)
  - Calendar 상단 "주간 AI 분석" 버튼

### 7.2 P1 검색 — 식단 기록 검색 모달

- `MobileShell.jsx:48` 검색 버튼 `onClick={() => setSearchOpen(true)}`
- 신규 컴포넌트 `components/SearchModal.jsx`
  - 상단 검색 input (autoFocus)
  - 아래 결과 리스트: `data.diet_records` 중 `food_name` 부분 일치 (대소문자 무시)
  - 최대 50건, 최근 순
  - 결과 행 클릭 시 Meal 탭으로 이동하며 해당 날짜 표시 (`nav('/?tab=meal&date=YYYY-MM-DD')`)
- 검색 모달은 클라이언트 필터만 — 서버 요청 추가 없음

### 7.3 Settings 환경설정에 남은 장식적 행 정리
Phase C 후 확인: `['단위', '메트릭']` 행 제거 완료 → 5행 유지

### 7.4 회귀 체크
- `grep -rn "준비 중" frontend/src` = **0건** 확인

**커밋 분리**:
- `feat(api): add weekly_report ai job + endpoint`
- `feat: add weekly report screen + home/calendar entry`
- `feat: add diet search modal + wire search button`
- `chore: remove leftover 단위 row`

---

## §8. Phase E — 검증 + 스크린샷 + 머지 (1h)

### 8.1 빌드 & 기동
- `cd frontend && npm run build` 성공
- FastAPI 기동 + `http://localhost:18000` 접속

### 8.2 기능 체크리스트

| # | 체크 | 통과 기준 |
|---|---|---|
| A1 | Weight 탭 체중 입력 | 입력 → 저장 → hero 수치 즉시 반영 |
| A2 | Record 탭 체중 입력 | 기존 동작 유지 (회귀) |
| B1 | 인바디 수동 입력 | 10필드 입력 → 저장 → Weight 탭 반영 + `day_since_start`/`*_change_kg` 자동 |
| B2 | 인바디 CSV 업로드 | 실제 인바디 CSV 파일 (samples/ 준비) → 파싱 → 폼 자동 채움 → 저장 |
| B3 | 인바디 사진 AI | 인바디 결과 사진 → AI 파싱 → 8필드 자동 채움 → 사용자 확인 → 저장 |
| B4 | AI 해석 버튼 | 클릭 → Coach 화면 이동 + 질문 자동 전송 + 답변 수신 |
| C | 19번 §7 전체 | 19번 7.2 표 그대로 (P2~P5, P7~P9) |
| D1 | 주간 리포트 | 이번 주 버튼 → 리포트 생성 → 5개 섹션 전부 노출 |
| D2 | 검색 모달 | 검색 버튼 → 모달 → "김치" 검색 → 결과 노출 → 클릭 시 Meal 이동 |
| D3 | 단위 행 | Settings에 `단위` 행 **없음** 확인 |

### 8.3 비시각
- [ ] `grep -rn "준비 중" frontend/src` = **0건**
- [ ] 신규 엔드포인트 3개 동작: `PATCH /api/profile`, `POST /api/ai/inbody-parse`, `POST /api/ai/weekly-report`
- [ ] `ai_engine.py`의 `JOB_TYPES`에 `inbody_parse`, `weekly_report` 포함
- [ ] `localStorage` 키는 `sh:notify` 1개만

### 8.4 회귀 (19번 §7.4 전부 + 추가)
- [ ] 홈/식단/체중/운동/기록 5탭 전환 정상
- [ ] Session 타이머/체크박스/종료 정상
- [ ] Record 식단 AI 분석 정상 (공통 pollJob 교체 후에도)
- [ ] Settings 프로필 카드 정상
- [ ] `/coach`, `/ai-jobs`, `/inbody/new`, `/weekly-report` 이동 시 하단 TabBar 숨김
- [ ] Weight 탭 차트/체성분/최근 인바디 정상 (새 입력 추가해도 기존 렌더 유지)

### 8.5 스크린샷
- `docs/scripts/capture_screens.py` 대상 URL에 `/coach`, `/ai-jobs`, `/inbody/new`, `/weekly-report`, 검색 모달 추가
- `docs/screenshots_v3/` 신규 저장 (v2 보존)

### 8.6 머지 게이트 (19번 L10 준수)
- (a) "merge OK" 응답 → `main` 머지
- (b) "push OK" 응답 → `origin/main` push
- 두 단계 **명시 승인 없이 진행 금지**

---

## §9. 범위 정리

### 9.1 포함 (하는 것)
- Weight 탭 체중 입력 (Phase A)
- 인바디 수동/CSV/AI 입력 + AI 해석 (Phase B)
- Settings 환경설정 5행 활성화 + Coach + AIJobsAll (Phase C = 19번)
- 주간 분석 AI + 식단 검색 (Phase D)
- 단위 행 완전 제거 (Phase D)

### 9.2 제외 (안 하는 것)
- **단위 토글 기능** — 제거만. 전수 적용은 Phase 3 별도 (kg↔lb 환산 로직 + 6개 화면 수정 필요)
- **운동/체중 기록 검색** — 식단만 MVP. 확장은 Phase 3
- **알림 Web Push 실제 발송** — 토글 UI + localStorage만
- **Coach 대화 저장** — 새로고침 시 소실
- **주간 리포트 자동 생성** — 수동 트리거만
- **Guide 화면 인터랙션** — 별도
- **달력 주간 뷰** — 별도

---

## §10. 리스크

| 리스크 | 대응 |
|---|---|
| 인바디 사진 AI 파싱 정확도 불안 | L5대로 JSON schema 강제 + 결과를 사용자 확인 후 저장 (자동 저장 금지) |
| 주간 리포트 Claude 입력 토큰 과다 (7일×식단 30건+) | 프롬프트에서 불필요 필드 제거. 식단은 합계만 + 인바디는 주 시작/끝 2건만 |
| CSV 업로드 파일 경로 주입 | `/api/photo` 통해서만 업로드 허용 → `path`는 서버가 반환한 값 그대로 사용. 클라 입력값 직접 받지 않음 |
| 인바디 자동 계산(`*_change_kg`) 틀림 | 첫 레코드는 `null`, 둘째부터 계산. 직전 찾을 때 `date` 기준 정렬 필수 |
| Phase B 3h 초과 가능성 (3탭 + AI) | 수동 폼 → CSV → AI 순서로 구현, 각 탭 완성 후 커밋. 시간 초과 시 AI 탭만 Phase 후속으로 |
| 19번 흡수 시 중복 작업 | 19번 `§6` 표를 그대로 Phase C 12단계로. 중복 계획서는 참조만 (재기술 금지) |
| 검색 모달 성능 (diet_records 수천 건) | 50건 cap + debounce 150ms |
| MobileShell `inSession` 조건 확장 (3개 경로) | `/session|/coach|/inbody|/weekly-report` startsWith로. 기존 `/session`만 있던 것 → 배열 매칭으로 통일 |

---

## §11. 작업 순서 (Phase 단위)

```
1. 브랜치 생성: git checkout -b feat/complete-app
2. Phase A (30분) → 커밋 1개 → 사용자 확인
3. Phase B (3h) → 커밋 3개 → 사용자 확인
4. Phase C (6~7h) — 19번 12단계 그대로 → 각 단계 커밋 → 마지막에 Phase 단위로 확인
5. Phase D (2~3h) → 커밋 4개 → 사용자 확인
6. Phase E (1h): 검증 + 스크린샷 → 커밋 1~2개
7. "브랜치 작업 완료. merge OK?" → 승인 후 main 머지
8. "push OK?" → 승인 후 origin/main push
```

단계 사이 사용자 확인 없이 진행 금지. Phase 전환 시 "Phase N 완료, 커밋: ... / Phase M 넘어갈까?" 형식.

---

## §12. 완료 조건

1. §8 체크리스트 전부 통과
2. `grep -rn "준비 중" frontend/src` = **0건**
3. 사용자 직접 다음 흐름 수동 테스트 + 승인:
   - Weight 탭에서 체중 입력 → 저장
   - 인바디 수동 입력 → 저장 → Weight 탭 반영
   - 인바디 CSV 업로드 (실제 파일) → 파싱 → 저장
   - 인바디 사진 AI → 파싱 → 저장
   - AI 해석 버튼 → Coach 답변 수신
   - Settings 5행 편집 (체중/단백질/칼로리/알림/내보내기)
   - 건강 상담 질문 → 답변 수신
   - AI 이력 화면 목록 + 상세
   - 주간 리포트 생성
   - 검색 모달 → 결과 클릭 → Meal 이동
4. L10 2단계 승인 게이트 (merge OK → push OK)

— 끝 —
