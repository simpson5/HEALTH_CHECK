export function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / 86400000) + 1;
}

export function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

export function fmtDateFull(d) {
  const dt = new Date(d);
  const today = new Date().toISOString().slice(0, 10);
  const label = d === today ? ' (오늘)' : '';
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}${label}`;
}

export function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDow(dateStr) {
  return ['일', '월', '화', '수', '목', '금', '토'][new Date(dateStr).getDay()];
}

export function getWeekRange(offset = 0) {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: mon.toISOString().slice(0, 10),
    end: sun.toISOString().slice(0, 10),
  };
}

export function getDayAchievement(data, dateStr) {
  const dow = new Date(dateStr).getDay();
  const isWeekend = dow === 0 || dow === 6;

  const meals = (data.diet_records || []).filter(r => r.date === dateStr);
  let totalPro = 0, totalCal = 0;
  meals.forEach(m => { totalPro += m.protein_g || 0; totalCal += m.calories_kcal || 0; });
  const proOk = totalPro >= 110;
  const calOk = totalCal > 0 && totalCal <= 1500;

  const exRecs = (data.exercise_records || []).filter(r => r.date === dateStr);
  let morningEx = false, eveningEx = false;
  exRecs.forEach(r => {
    const h = parseInt((r.start_time || '12').split(':')[0]);
    if (h < 14) morningEx = true;
    else eveningEx = true;
  });

  if (isWeekend) {
    const total = 2;
    const done = (proOk ? 1 : 0) + (calOk ? 1 : 0);
    return { total, done, items: [
      { name: '단백질 110g', ok: proOk, val: totalPro + 'g' },
      { name: '칼로리 1500이하', ok: calOk, val: totalCal > 0 ? totalCal + 'kcal' : '미기록' },
    ]};
  } else {
    const total = 4;
    const done = (morningEx ? 1 : 0) + (eveningEx ? 1 : 0) + (proOk ? 1 : 0) + (calOk ? 1 : 0);
    return { total, done, items: [
      { name: '오전 운동', ok: morningEx },
      { name: '저녁 운동', ok: eveningEx },
      { name: '단백질 110g', ok: proOk, val: totalPro + 'g' },
      { name: '칼로리 1500이하', ok: calOk, val: totalCal > 0 ? totalCal + 'kcal' : '미기록' },
    ]};
  }
}

export function getStreak(data) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const ach = getDayAchievement(data, ds);
    if (ach.done === ach.total && ach.total > 0) streak++;
    else break;
  }
  return streak;
}

// ── 디자인 v2 — 화면 포맷 헬퍼 (docs/design_handoff_ref/lib/format.js 병합)

export function getGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5)  return '편안한 밤';
  if (h < 11) return '좋은 아침';
  if (h < 17) return '오후';
  return '저녁';
}

export function fmtKgDelta(delta) {
  if (delta == null || isNaN(delta)) return '— 0.0';
  const abs = Math.abs(delta);
  if (delta < -0.049) return `▼ ${abs.toFixed(1)}`;
  if (delta >  0.049) return `▲ ${abs.toFixed(1)}`;
  return `— ${abs.toFixed(1)}`;
}

export function deltaColor(delta, goodIsDecrease = true) {
  if (delta == null || Math.abs(delta) < 0.05) return 'var(--color-text-mid)';
  const isDecrease = delta < 0;
  const good = goodIsDecrease ? isDecrease : !isDecrease;
  return good ? 'var(--color-up)' : 'var(--color-down)';
}

export const MEAL_ICON_KEY = {
  아침: 'sun',
  점심: 'flame',
  저녁: 'moon',
  간식: 'meal',
  보충제: 'pill',
  음료: 'pill',
};

export function getMealTime(dietRecords, mealType, date) {
  const first = (dietRecords || []).find(r => r.date === date && r.meal_type === mealType);
  return first ? first.time : '미기록';
}

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
