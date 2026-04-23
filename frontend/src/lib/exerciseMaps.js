// Simpson Health — 운동 라이브러리 영문→한글 라벨 매핑
// 실제 DB 확인 결과 (2026-04-23):
//   exercise_library.group      : 'machine' | 'bodyweight' | 'cardio'
//   exercise_library.bodypart   : 'push' | 'pull' | 'legs' | 'core' | 'posterior' | 'cardio'
//   exercise_library.type       : 'strength' | 'cardio'
//   exercise_library.is_favorite: 0 | 1
//   exercise_library.target     : ['가슴','어깨'] 같은 한글 근육군 배열
//
// 디자인 원본 라벨:
//   카테고리 pills: 머신 / 맨몸 / 유산소
//   필터 pills:    즐겨찾기 / 상체 밀기 / 상체 당기기 / 하체 / 코어

export const GROUP_LABEL = {
  machine:    '머신',
  bodyweight: '맨몸',
  cardio:     '유산소',
};

export const BODYPART_LABEL = {
  push:      '상체 밀기',
  pull:      '상체 당기기',
  legs:      '하체',
  core:      '코어',
  posterior: '후면사슬',
  cardio:    '유산소',
};

/** 운동 리스트 필터링
 *  params: { group: 'machine'|..., bodypart: 'push'|... | 'favorite', favOnly: bool }
 *  favorite 선택 시 is_favorite=1만, 아니면 bodypart 필터. */
export function filterExercises(list, { group, bodypart }) {
  let out = list || [];
  if (group) out = out.filter(e => e.group === group);
  if (bodypart === 'favorite') out = out.filter(e => e.is_favorite);
  else if (bodypart) out = out.filter(e => e.bodypart === bodypart);
  return out;
}

/** 해당 운동의 가장 최근 세트 기록 → "30kg × 12 × 3세트" 같은 문자열
 *  exerciseRecords: 전체 exercise_records */
export function lastExerciseLog(exerciseRecords, exId) {
  for (const s of [...(exerciseRecords || [])].reverse()) {
    const ex = (s.exercises || []).find(e => e.id === exId);
    if (!ex) continue;
    if (ex.sets && ex.sets.length) {
      const last = ex.sets[ex.sets.length - 1];
      return `${last.kg}kg × ${last.reps}회 × ${ex.sets.length}세트`;
    }
    if (ex.duration_min) return `${ex.duration_min}분`;
  }
  return '';
}

/** 해당 운동의 마지막 세트에서 kg/reps 추출 — Session 초기값용 */
export function lastSetDefaults(exerciseRecords, exId, fallback = { kg: 30, reps: 10 }) {
  for (const s of [...(exerciseRecords || [])].reverse()) {
    const ex = (s.exercises || []).find(e => e.id === exId);
    if (ex && ex.sets && ex.sets.length) {
      const last = ex.sets[ex.sets.length - 1];
      return { kg: last.kg, reps: last.reps };
    }
  }
  return fallback;
}
