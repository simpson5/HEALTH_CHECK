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
  return new Date().toISOString().slice(0, 10);
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
