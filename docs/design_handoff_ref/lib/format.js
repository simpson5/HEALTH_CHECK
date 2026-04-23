// Simpson Health — 디자인 전용 포맷 유틸
// 실제 적용 시 frontend/src/lib/utils.js 에 병합

/** 현재 시각 기반 인사말 */
export function getGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5)  return '편안한 밤';
  if (h < 11) return '좋은 아침';
  if (h < 17) return '오후';
  return '저녁';
}

/** 체중 델타 라벨 — `▼ 0.9` / `▲ 0.5` / `— 0.0` */
export function fmtKgDelta(delta) {
  if (delta == null || isNaN(delta)) return '— 0.0';
  const abs = Math.abs(delta);
  if (delta < -0.049) return `▼ ${abs.toFixed(1)}`;
  if (delta >  0.049) return `▲ ${abs.toFixed(1)}`;
  return `— ${abs.toFixed(1)}`;
}

/** 델타 색상 결정 (체중: 감소=up / 근육: 증가=up 식으로 반대일 수 있음) */
export function deltaColor(delta, goodIsDecrease = true) {
  if (delta == null || Math.abs(delta) < 0.05) return 'var(--color-text-mid)';
  const isDecrease = delta < 0;
  const good = goodIsDecrease ? isDecrease : !isDecrease;
  return good ? 'var(--color-up)' : 'var(--color-down)';
}

/** 끼니별 아이콘 key 매핑 */
export const MEAL_ICON_KEY = {
  아침: 'sun',
  점심: 'flame',
  저녁: 'moon',
  간식: 'meal',
  보충제: 'pill',
  음료: 'pill',
};

/** 해당 끼니 첫 기록의 time, 없으면 '미기록' */
export function getMealTime(dietRecords, mealType, date) {
  const first = (dietRecords || []).find(r => r.date === date && r.meal_type === mealType);
  return first ? first.time : '미기록';
}

/** 시간 역순 최근 N개 이벤트 타임라인 생성
 *  - 식단/운동/체중/투약 합쳐서 오늘자만 */
export function buildTodayTimeline(data, today, limit = 4) {
  const events = [];
  (data.diet_records || []).filter(r => r.date === today).forEach(r => {
    events.push({ time: r.time || '--:--', tag: '식단', title: r.food_name, meta: `P${r.protein_g}g · ${r.calories_kcal}kcal` });
  });
  (data.exercise_records || []).filter(r => r.date === today).forEach(r => {
    const first = (r.exercises || [])[0];
    events.push({ time: r.start_time || '--:--', tag: '운동', title: first ? first.name : '운동 세션', meta: `${r.total_duration_min || 0}분 · ${r.total_calories_burned || 0}kcal` });
  });
  (data.weight_records || []).filter(r => r.date === today).forEach(r => {
    events.push({ time: '09:00', tag: '체중', title: `${r.weight_kg}kg`, meta: '오늘 측정', accent: true });
  });
  (data.medication_records || []).filter(r => r.date === today).forEach(r => {
    events.push({ time: '08:30', tag: '투약', title: `마운자로 ${r.dose}`, meta: r.change_reason || '주 1회' });
  });
  events.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
  return events.slice(0, limit);
}
