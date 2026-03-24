import { useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { TabBar } from '../components/ui/Tabs';
import { DateNav } from '../components/ui/DateNav';
import { Badge } from '../components/ui/Badge';
import { getDayAchievement, getDow, getToday, fmtDate } from '../lib/utils';

const eventPriority = ['hospital', 'medication', 'inbody', 'goal'];
const eventIcons = { hospital: '🏥', medication: '💊', inbody: '📋', goal: '🎯' };

function getMissionEmoji(ach) {
  if (!ach || ach.total === 0) return '';
  const ratio = ach.done / ach.total;
  if (ratio >= 1) return '🔥';
  if (ratio >= 0.75) return '✅';
  if (ratio >= 0.5) return '🟡';
  if (ach.done > 0) return '🔴';
  return '';
}

function getGoalStatus(data, dateStr) {
  const today = getToday();
  const schedule = (data.schedule || []).find(s => s.date === dateStr && s.type === 'goal');
  if (!schedule) return null;

  // 목표 체중 파싱
  const match = schedule.label.match(/(\d+\.?\d*)kg/);
  if (!match) return { icon: '🎯', label: schedule.label };
  const targetKg = parseFloat(match[1]);

  if (dateStr > today) return { icon: '🎯', label: schedule.label };

  // 해당 월 마지막 체중
  const monthWeights = (data.weight_records || []).filter(r => r.date <= dateStr).reverse();
  if (monthWeights.length > 0 && monthWeights[0].weight_kg <= targetKg) {
    return { icon: '⭐', label: schedule.label + ' — 달성!' };
  }
  return { icon: '🎯', label: schedule.label, missed: dateStr < today };
}

export function Calendar() {
  const { data, loading } = useData();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('monthly');
  const [weekOffset, setWeekOffset] = useState(0);

  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const today = getToday();
  const dows = ['일', '월', '화', '수', '목', '금', '토'];

  // 이벤트 수집 (스케줄 + 투약 + 인바디만, 식단/운동 제외)
  const events = {};
  const addEvent = (date, type, label) => {
    if (!events[date]) events[date] = [];
    events[date].push({ type, label });
  };
  (data.schedule || []).forEach(s => addEvent(s.date, s.type, s.label));
  (data.medication_records || []).forEach(r => addEvent(r.date, 'medication', '💊 ' + r.dose + ' (' + (r.change_reason || '') + ')'));
  (data.inbody_records || []).forEach(r => addEvent(r.date, 'inbody', '📋 인바디 ' + r.weight_kg + 'kg'));

  // 우선순위 이벤트 아이콘
  const getTopEvent = (dateStr) => {
    const evts = events[dateStr] || [];
    for (const type of eventPriority) {
      const found = evts.find(e => e.type === type);
      if (found) return eventIcons[type];
    }
    return '';
  };

  const moveMonth = (dir) => {
    let m = month + dir, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setYear(y); setMonth(m);
  };

  // 주간 범위 계산
  const getWeekDates = (offset) => {
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  };

  // 날짜 상세 정보
  const getDateDetail = (dateStr) => {
    const ach = getDayAchievement(data, dateStr);
    const meals = (data.diet_records || []).filter(r => r.date === dateStr && r.calories_kcal > 0);
    const exRecs = (data.exercise_records || []).filter(r => r.date === dateStr);
    const weight = (data.weight_records || []).find(r => r.date === dateStr);
    const dayEvents = events[dateStr] || [];
    return { ach, meals, exRecs, weight, dayEvents };
  };

  // === 월간 보기 ===
  const renderMonthly = () => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDow = firstDay.getDay();

    return (
      <div className="grid grid-cols-7 gap-1">
        {dows.map((d, i) => (
          <div key={d} className={'text-center text-[10px] py-2 font-medium ' + (i === 0 ? 'text-danger' : 'text-dim')}>{d}</div>
        ))}
        {Array.from({ length: startDow }).map((_, i) => <div key={'e' + i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dow = (startDow + i) % 7;
          const isPast = dateStr < today;

          const ach = isPast || dateStr === today ? getDayAchievement(data, dateStr) : null;
          const missionEmoji = ach ? getMissionEmoji(ach) : '';
          const topEvent = getTopEvent(dateStr);
          const goalStatus = getGoalStatus(data, dateStr);

          return (
            <div
              key={d}
              onClick={() => setSelectedDate(dateStr)}
              className={'flex flex-col items-center py-1 rounded-xl text-xs cursor-pointer min-h-[52px] transition-all '
                + (isToday ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30 ' : '')
                + (isSelected && !isToday ? 'ring-1 ring-white/20 ' : '')
                + (dow === 0 ? 'text-danger ' : '')}
            >
              <span className={isToday ? 'text-accent' : ''}>{d}</span>
              {goalStatus ? (
                <span className="text-[11px] leading-none mt-0.5">{goalStatus.icon}</span>
              ) : missionEmoji ? (
                <span className="text-[11px] leading-none mt-0.5">{missionEmoji}</span>
              ) : null}
              {topEvent && !goalStatus && (
                <span className="text-[9px] leading-none mt-0.5">{topEvent}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // === 주간 보기 ===
  const renderWeekly = () => {
    const weekDates = getWeekDates(weekOffset);
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];

    // 주간 통계
    let weekPro = 0, weekCal = 0, weekProDays = 0, weekExCount = 0;
    let weekStartWeight = null, weekEndWeight = null;
    weekDates.forEach(d => {
      const meals = (data.diet_records || []).filter(r => r.date === d);
      let dayPro = 0, dayCal = 0;
      meals.forEach(m => { dayPro += m.protein_g; dayCal += m.calories_kcal; });
      if (dayCal > 0) { weekPro += dayPro; weekCal += dayCal; weekProDays++; }
      if ((data.exercise_records || []).find(r => r.date === d)) weekExCount++;
      const w = (data.weight_records || []).find(r => r.date === d);
      if (w) { if (!weekStartWeight) weekStartWeight = w.weight_kg; weekEndWeight = w.weight_kg; }
    });
    const avgPro = weekProDays > 0 ? Math.round(weekPro / weekProDays) : 0;
    const avgCal = weekProDays > 0 ? Math.round(weekCal / weekProDays) : 0;
    const weightChange = weekStartWeight && weekEndWeight ? (weekEndWeight - weekStartWeight).toFixed(1) : null;

    return (
      <div className="space-y-3">
        {/* 주간 날짜 가로 */}
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((d, i) => {
            const isToday = d === today;
            const isSelected = d === selectedDate;
            const dayNum = new Date(d).getDate();
            const ach = d <= today ? getDayAchievement(data, d) : null;
            const missionEmoji = ach ? getMissionEmoji(ach) : '';
            const topEvent = getTopEvent(d);

            return (
              <div
                key={d}
                onClick={() => setSelectedDate(d)}
                className={'flex flex-col items-center py-2 rounded-xl cursor-pointer transition-all '
                  + (isToday ? 'bg-accent/15 ring-1 ring-accent/30 ' : '')
                  + (isSelected && !isToday ? 'ring-1 ring-white/20 bg-white/[0.03] ' : '')}
              >
                <span className="text-[10px] text-dim">{dows[i]}</span>
                <span className={'text-sm font-bold mt-0.5 ' + (isToday ? 'text-accent' : '')}>{dayNum}</span>
                {missionEmoji && <span className="text-[13px] mt-0.5">{missionEmoji}</span>}
                {topEvent && <span className="text-[10px] mt-0.5">{topEvent}</span>}
              </div>
            );
          })}
        </div>

        {/* 주간 요약 */}
        <Card>
          <CardTitle>이번 주 요약</CardTitle>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>운동: <span className="text-accent font-bold">{weekExCount}회</span> / 4회</div>
            <div>평균 단백질: <span className="text-accent font-bold">{avgPro}g</span></div>
            <div>평균 칼로리: <span className="text-warning font-bold">{avgCal}kcal</span></div>
            {weightChange && <div>체중: <span className={'font-bold ' + (parseFloat(weightChange) <= 0 ? 'text-success' : 'text-danger')}>{weightChange > 0 ? '+' : ''}{weightChange}kg</span></div>}
          </div>
        </Card>

        {/* 주간 날짜별 상세 */}
        {weekDates.filter(d => d <= today).reverse().map(d => {
          const detail = getDateDetail(d);
          if (detail.meals.length === 0 && detail.exRecs.length === 0 && !detail.weight) return null;
          const emoji = getMissionEmoji(detail.ach);
          return (
            <Card key={d} onClick={() => setSelectedDate(d)}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{emoji}</span>
                <span className="text-xs font-bold">{d.slice(5)} ({getDow(d)})</span>
                {detail.weight && <Badge color="muted">{detail.weight.weight_kg}kg</Badge>}
              </div>
              {detail.meals.length > 0 && (
                <div className="text-[11px] text-muted">
                  {detail.meals.map(m => m.meal_type + ': ' + m.food_name).join(' · ')}
                </div>
              )}
              {detail.exRecs.length > 0 && (
                <div className="text-[11px] text-accent mt-0.5">
                  💪 {detail.exRecs[0].exercises.map(e => e.name).join(', ')}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  // === 날짜 상세 ===
  const renderDetail = () => {
    if (!selectedDate) return null;
    const detail = getDateDetail(selectedDate);
    const emoji = getMissionEmoji(detail.ach);

    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{emoji || '📅'}</span>
          <div>
            <div className="text-sm font-bold">{selectedDate} ({getDow(selectedDate)})</div>
            {detail.ach && detail.ach.total > 0 && (
              <div className="text-[11px] text-muted">{detail.ach.done}/{detail.ach.total} 달성</div>
            )}
          </div>
        </div>

        {/* 미션 */}
        {detail.ach && detail.ach.items.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-dim tracking-[1px] uppercase mb-1.5">미션</div>
            {detail.ach.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                <span>{item.ok ? '✅' : '⬜'}</span>
                <span className={item.ok ? 'text-text' : 'text-muted'}>{item.name}</span>
                {item.val && <span className="text-muted ml-auto text-[10px]">{item.val}</span>}
              </div>
            ))}
          </div>
        )}

        {/* 일정 */}
        {detail.dayEvents.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-dim tracking-[1px] uppercase mb-1.5">일정</div>
            {detail.dayEvents.map((e, i) => (
              <div key={i} className="text-xs py-0.5">{e.label}</div>
            ))}
          </div>
        )}

        {/* 식단 */}
        {detail.meals.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-dim tracking-[1px] uppercase mb-1.5">식단</div>
            {detail.meals.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                <span className="text-muted">{m.meal_type}</span>
                <span className="flex-1">{m.food_name}</span>
                <Badge color="accent">P{m.protein_g}g</Badge>
              </div>
            ))}
          </div>
        )}

        {/* 운동 */}
        {detail.exRecs.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-dim tracking-[1px] uppercase mb-1.5">운동</div>
            {detail.exRecs.map((r, i) => (
              <div key={i} className="text-xs py-0.5">
                {r.exercises.map(e => e.name).join(', ')}
                {r.total_calories_burned > 0 && <span className="text-muted ml-2">~{r.total_calories_burned}kcal</span>}
              </div>
            ))}
          </div>
        )}

        {/* 체중 */}
        {detail.weight && (
          <div>
            <div className="text-[10px] text-dim tracking-[1px] uppercase mb-1.5">체중</div>
            <div className="text-xs">⚖️ {detail.weight.weight_kg}kg</div>
          </div>
        )}
      </Card>
    );
  };

  // 다가오는 일정 (스케줄만, 식단/운동 제외)
  const upcoming = Object.entries(events)
    .filter(([date]) => date >= today)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([date, evts]) => evts.filter(e => ['medication', 'inbody', 'hospital', 'goal'].includes(e.type)).map(e => ({ date, ...e })))
    .slice(0, 5);

  const weekDates = getWeekDates(weekOffset);
  const weekLabel = weekDates[0].slice(5).replace('-', '/') + ' ~ ' + weekDates[6].slice(5).replace('-', '/');

  return (
    <div className="space-y-3">
      {/* 월간/주간 전환 */}
      <div className="flex gap-2 mb-1">
        <button
          onClick={() => setViewMode('monthly')}
          className={'px-4 py-2 rounded-full text-xs font-medium transition-all border '
            + (viewMode === 'monthly' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-transparent border-transparent text-muted')}
        >월간</button>
        <button
          onClick={() => setViewMode('weekly')}
          className={'px-4 py-2 rounded-full text-xs font-medium transition-all border '
            + (viewMode === 'weekly' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-transparent border-transparent text-muted')}
        >주간</button>
      </div>

      {viewMode === 'monthly' ? (
        <>
          <DateNav label={year + '년 ' + (month + 1) + '월'} onPrev={() => moveMonth(-1)} onNext={() => moveMonth(1)} />
          {renderMonthly()}
        </>
      ) : (
        <>
          <DateNav label={weekLabel} onPrev={() => setWeekOffset(w => w - 1)} onNext={() => setWeekOffset(w => Math.min(w + 1, 0))} />
          {renderWeekly()}
        </>
      )}

      {/* 날짜 상세 */}
      {viewMode === 'monthly' && renderDetail()}

      {/* 다가오는 일정 */}
      <div className="text-[11px] tracking-[2px] text-muted uppercase mt-4 mb-2">다가오는 일정</div>
      {upcoming.length === 0 ? (
        <div className="text-center text-muted text-sm py-4">예정된 일정 없음</div>
      ) : (
        upcoming.map((e, i) => (
          <Card key={i}>
            <div className="text-[11px] text-muted">{e.date} ({getDow(e.date)})</div>
            <div className="text-xs mt-0.5">{e.label}</div>
          </Card>
        ))
      )}
    </div>
  );
}
