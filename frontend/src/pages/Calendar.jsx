import { useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { Card } from '../components/ui/Card';
import { DateNav } from '../components/ui/DateNav';
import { getDayAchievement, getDow } from '../lib/utils';

const dotColors = {
  medication: 'bg-info', inbody: 'bg-accent', hospital: 'bg-danger',
  diet: 'bg-success', exercise: 'bg-warning', goal: 'bg-yellow-400',
};

export function Calendar() {
  const { data, loading } = useData();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const today = new Date().toISOString().slice(0, 10);

  // 이벤트 수집
  const events = {};
  const addEvent = (date, type, label) => {
    if (!events[date]) events[date] = [];
    events[date].push({ type, label });
  };
  (data.schedule || []).forEach(s => addEvent(s.date, s.type, s.label));
  (data.medication_records || []).forEach(r => addEvent(r.date, 'medication', '💊 ' + r.dose + ' (' + r.change_reason + ')'));
  (data.inbody_records || []).forEach(r => addEvent(r.date, 'inbody', '📋 인바디 ' + r.weight_kg + 'kg'));
  const dietDates = new Set((data.diet_records || []).filter(r => r.calories_kcal > 0).map(r => r.date));
  dietDates.forEach(d => addEvent(d, 'diet', '🍽️ 식단'));
  const exDates = new Set((data.exercise_records || []).map(r => r.date));
  exDates.forEach(d => addEvent(d, 'exercise', '💪 운동'));

  // 달력
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay();
  const dows = ['일', '월', '화', '수', '목', '금', '토'];

  const moveMonth = (dir) => {
    let m = month + dir, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setYear(y); setMonth(m);
  };

  // 선택 날짜 이벤트
  const selectedEvents = selectedDate ? [
    ...(events[selectedDate] || []),
    ...(() => {
      const wr = (data.weight_records || []).find(r => r.date === selectedDate);
      return wr ? [{ type: 'weight', label: '⚖️ 체중: ' + wr.weight_kg + 'kg' }] : [];
    })(),
  ] : [];

  // 다가오는 일정
  const upcoming = Object.entries(events)
    .filter(([date]) => date >= today)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <DateNav
        label={`${year}년 ${month + 1}월`}
        onPrev={() => moveMonth(-1)}
        onNext={() => moveMonth(1)}
      />

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {dows.map((d, i) => (
          <div key={d} className={`text-center text-[10px] py-1.5 ${i === 0 ? 'text-danger' : 'text-muted'}`}>{d}</div>
        ))}
        {Array.from({ length: startDow }).map((_, i) => <div key={'e' + i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dow = (startDow + i) % 7;
          const dayEvents = events[dateStr] || [];
          const types = [...new Set(dayEvents.map(e => e.type))];

          // 달성률 배경
          let achBg = '';
          if (dateStr < today) {
            const ach = getDayAchievement(data, dateStr);
            if (ach.done > 0 && ach.total > 0) {
              if (ach.done === ach.total) achBg = 'bg-success/15';
              else if (ach.done >= ach.total / 2) achBg = 'bg-warning/10';
              else achBg = 'bg-danger/[0.08]';
            }
          }

          return (
            <div
              key={d}
              onClick={() => setSelectedDate(dateStr)}
              className={`text-center py-1.5 rounded-lg text-xs cursor-pointer min-h-[40px] transition-colors
                ${isToday ? 'bg-accent/15 text-accent font-bold' : ''}
                ${isSelected ? 'ring-1 ring-accent' : ''}
                ${dow === 0 ? 'text-danger' : ''}
                ${achBg}`}
            >
              {d}
              {types.length > 0 && (
                <div className="flex gap-0.5 justify-center mt-0.5">
                  {types.slice(0, 3).map((t, ti) => (
                    <div key={ti} className={`w-1.5 h-1.5 rounded-full ${dotColors[t] || 'bg-muted'}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 선택 날짜 이벤트 */}
      {selectedDate && (
        <Card>
          <div className="text-xs font-bold mb-2">{selectedDate} ({getDow(selectedDate)})</div>
          {selectedEvents.length === 0 ? (
            <div className="text-xs text-muted">일정 없음</div>
          ) : (
            selectedEvents.map((e, i) => (
              <div key={i} className="text-xs py-1">{e.label}</div>
            ))
          )}
        </Card>
      )}

      {/* 다가오는 일정 */}
      <div className="text-[11px] tracking-[2px] text-muted uppercase mt-4 mb-2">다가오는 일정</div>
      {upcoming.length === 0 ? (
        <div className="text-center text-muted text-sm py-4">예정된 일정 없음</div>
      ) : (
        upcoming.map(([date, evts]) =>
          evts.map((e, i) => (
            <Card key={date + i}>
              <div className="text-[11px] text-muted">{date} ({getDow(date)})</div>
              <div className="text-xs mt-0.5">{e.label}</div>
            </Card>
          ))
        )
      )}
    </div>
  );
}
