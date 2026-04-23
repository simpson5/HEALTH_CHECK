# 🚚 Redesign v2 — Implementer Handoff

> **이 파일부터 읽으세요.** 30초 오리엔테이션 + 파일 위치 + 시작 방법.

## 1. 배경

Simpson Health 프론트엔드를 **전면 리디자인**. 디자인은 Claude Design으로 만든 다크/앰버 테마. 현재 프론트(`frontend/src/`)를 통째 교체.

## 2. 이 작업에 필요한 자료 — 4개

| 파일/폴더 | 역할 |
|---|---|
| **`docs/18_redesign_plan.md`** | **주 계획서.** 이거 먼저 끝까지 읽으세요. 1019줄. |
| `docs/design_handoff_ref/` | 컴파일 검증된 **레퍼런스 코드**. 그대로 복사해서 쓰는 jsx/css. 진입점은 그 안의 `README.md`. |
| `docs/design_handoff/` | 디자인 **원본** 번들 (Claude Design export). 픽셀/레이아웃의 최종 진리. 계획서 §8에서 파일 라인까지 가리킴. |
| `docs/scripts/capture_screens.py` | Phase 1 끝에 스크린샷 재캡처용 Playwright 스크립트. |

## 3. 건드리지 말 것

- `CLAUDE.md` (프로젝트 정책)
- `simpson_data.json`, `database.py`, `server.py`, `ai_engine.py` — 백엔드/데이터
- `photos/`, `uploads/`, `data/` — 사용자 데이터
- `docs/archive/` — 과거 문서
- `docs/design_handoff/` — 디자인 원본 (읽기만)
- `docs/design_handoff_ref/` 폴더 내 파일을 직접 수정하면 **그 변경이 계획과 어긋나면 안 됨**. 수정 필요하면 계획서 업데이트 먼저 하거나 Q&A 추가.

## 4. 유지할 코드 (재활용)

- `frontend/src/main.jsx`
- `frontend/src/hooks/useData.jsx`
- `frontend/src/lib/api.js`, `frontend/src/lib/utils.js` (후자에 함수 추가 허용)

## 5. 시작 방법

```bash
# 1) 브랜치 확인
git branch --show-current    # redesign/handoff-v2 가 아니면 checkout

# 2) 계획서 읽기
open docs/18_redesign_plan.md
#    또는 터미널: less docs/18_redesign_plan.md

# 3) 새 작업 브랜치 생성 (handoff 브랜치에서 분기)
git checkout -b redesign/v2-impl
```

그 다음 계획서의 **§12 작업 순서** 20단계를 번호대로. 각 단계 끝에 `cd frontend && npm run build` 성공 확인 후 단독 커밋.

## 6. 결정 상태 (계획서 §2와 동일 — 요약)

**확정 (L1~L8)**: 하단 4탭 · Guide 5탭 · 검색버튼 무동작 · Session은 Workout에서 전달 · 이메일 하드코딩 · react-router-dom@7 · 로컬 폰트 번들 · 전면 교체.

**열린 질문 (Q6~Q10)**: Foods/AI/History 처분 · 데스크탑 반응형 · Home D-N일 공식 — 각각 **기본값 있음**, 진행하면서 필요 시 사용자(프로젝트 소유자)에게 질문.

## 7. 막혔을 때

1. 계획서 §2.2 Open Questions 표에 `Q11, Q12...` 형식으로 추가
2. 작업 중지, 사용자에게 질문
3. 답변 받은 후 §2.1 Locked 섹션으로 승격 후 재개
4. 추측으로 진행 금지

## 8. 완료 기준

계획서 §11 검증 체크리스트 (빌드/기능/시각/비시각/스크린샷) **전부 통과** 후 사용자 최종 승인.

Phase 1 = 모바일 9개 화면. Phase 2 = 데스크탑 (별도 문서 예정).

---

## 한 줄 요약

**`docs/18_redesign_plan.md` → §12 순서대로 → 단계별 커밋 → §11로 검증.**

막히면 쉬어라. 추측하지 말고.
