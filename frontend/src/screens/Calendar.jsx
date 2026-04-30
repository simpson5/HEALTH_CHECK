import { useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, SectionLabel } from '../design/primitives';
import Icon from '../design/Icon';
import { getToday } from '../lib/utils';
import { computeMilestones } from '../lib/roadmap';

const DOWS = ['일', '월', '화', '수', '목', '금', '토'];
const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];

export function Calendar() {
  const { data, loading } = useData();
  const todayStr = getToday();
  const today = new Date(todayStr);
  const [mode, setMode] = useState('월간');
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selDate, setSelDate] = useState(null);
  const [weekStart, setWeekStart] = useState(() => {
    // Monday of this week
    const d = new Date(todayStr);
    const dow = d.getDay();
    const diff = (dow + 6) % 7;
    d.setDate(d.getDate() - diff);
    return d.toISOString().slice(0, 10);
  });

  if (loading || !data) return <LoadingScreen />;

  const weightSet = new Set((data.weight_records || []).map(r => r.date));
  const exerciseSet = new Set((data.exercise_records || []).map(r => r.date));
  const dietSet = new Set((data.diet_records || []).map(r => r.date));

  // Build month grid
  const firstDow = new Date(ym.y, ym.m, 1).getDay();
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const grid = [];
  let week = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }

  function moveMonth(offset) {
    setYm(prev => {
      let m = prev.m + offset;
      let y = prev.y;
      if (m < 0) { m = 11; y -= 1; }
      else if (m > 11) { m = 0; y += 1; }
      return { y, m };
    });
  }

  function moveWeek(offset) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset * 7);
    setWeekStart(d.toISOString().slice(0, 10));
  }

  function dateStrOf(d) {
    return `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function daySummary(ds) {
    const weight = (data.weight_records || []).find(r => r.date === ds);
    const diets = (data.diet_records || []).filter(r => r.date === ds);
    const exes = (data.exercise_records || []).filter(r => r.date === ds);
    const meds = (data.medication_records || []).filter(r => r.date === ds);
    const inbody = (data.inbody_records || []).find(r => r.date === ds);
    const totalPro = diets.reduce((a, x) => a + (x.protein_g || 0), 0);
    const totalKc = diets.reduce((a, x) => a + (x.calories_kcal || 0), 0);
    return { weight, diets, exes, meds, inbody, totalPro, totalKc };
  }

  const milestones = computeMilestones(data);

  return (
    <div className="pb-[100px]">
      {/* Mode toggle */}
      <div className="px-5 pt-2">
        <div className="inline-flex gap-1 p-1 bg-bg-elev rounded-[10px]">
          {['월간', '주간'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-[7px] border-none cursor-pointer text-[12px] font-medium ${
                mode === m ? 'bg-bg-elev-3 text-text' : 'bg-transparent text-text-dim'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Header (month or week) */}
      {mode === '월간' ? (
        <div className="px-5 pt-[18px] pb-2.5 flex items-center justify-center gap-[18px]">
          <button type="button" onClick={() => moveMonth(-1)} className="bg-transparent border-none text-text-mid cursor-pointer" aria-label="이전 달">
            <Icon.chev dir="left" s={18} />
          </button>
          <div className="text-center">
            <div className="text-[11px] text-text-dim font-mono tracking-[1px]">{ym.y}</div>
            <div className="text-[22px] text-text font-medium tracking-[-0.5px] mt-0.5">{ym.m + 1}월</div>
          </div>
          <button type="button" onClick={() => moveMonth(1)} className="bg-transparent border-none text-text-mid cursor-pointer" aria-label="다음 달">
            <Icon.chev dir="right" s={18} />
          </button>
        </div>
      ) : (
        <div className="px-5 pt-[18px] pb-2.5 flex items-center justify-center gap-[18px]">
          <button type="button" onClick={() => moveWeek(-1)} className="bg-transparent border-none text-text-mid cursor-pointer" aria-label="이전 주">
            <Icon.chev dir="left" s={18} />
          </button>
          <div className="text-center">
            <div className="text-[11px] text-text-dim font-mono tracking-[1px]">{weekStart.slice(0, 4)}</div>
            <div className="text-[18px] text-text font-medium tracking-[-0.3px] mt-0.5">
              {(() => {
                const s = new Date(weekStart);
                const e = new Date(s); e.setDate(s.getDate() + 6);
                return `${s.getMonth() + 1}/${s.getDate()} ~ ${e.getMonth() + 1}/${e.getDate()}`;
              })()}
            </div>
          </div>
          <button type="button" onClick={() => moveWeek(1)} className="bg-transparent border-none text-text-mid cursor-pointer" aria-label="다음 주">
            <Icon.chev dir="right" s={18} />
          </button>
        </div>
      )}

      {/* Grid (월간) or WeekRow (주간) */}
      {mode === '월간' ? (
        <div className="mx-5">
          <Card pad={12}>
            <div className="grid grid-cols-7 gap-0.5">
              {DOWS.map((d, i) => (
                <div
                  key={d}
                  className={`text-center text-[10px] font-mono tracking-[0.5px] pt-1 pb-2 ${
                    i === 0 ? 'text-down' : i === 6 ? 'text-info' : 'text-text-dim'
                  }`}
                >
                  {d}
                </div>
              ))}
              {grid.flat().map((d, i) => {
                if (d === null) return <div key={i} />;
                const ds = dateStrOf(d);
                const isToday = ds === todayStr;
                const isSel = ds === selDate;
                const dow = i % 7;
                const hasWeight = weightSet.has(ds);
                const hasExercise = exerciseSet.has(ds);
                const hasDiet = dietSet.has(ds);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelDate(ds)}
                    className="flex flex-col items-center gap-1 py-1.5 rounded-[10px] border-none cursor-pointer"
                    style={{
                      aspectRatio: '1',
                      background: isSel ? 'var(--color-accent)' : isToday ? 'var(--color-accent-soft)' : 'transparent',
                      border: isToday && !isSel ? '1px solid var(--color-accent-line)' : '1px solid transparent',
                    }}
                  >
                    <span
                      className={`text-[13px] ${
                        isSel ? 'text-accent-on font-semibold'
                          : isToday ? 'text-accent font-semibold'
                          : dow === 0 ? 'text-down'
                          : dow === 6 ? 'text-info'
                          : 'text-text'
                      }`}
                    >
                      {d}
                    </span>
                    <div className="flex gap-0.5">
                      {hasWeight && <span className={`w-1 h-1 rounded-full ${isSel ? 'bg-accent-on' : 'bg-accent'}`} />}
                      {hasExercise && <span className={`w-1 h-1 rounded-full ${isSel ? 'bg-accent-on' : 'bg-info'}`} />}
                      {hasDiet && <span className={`w-1 h-1 rounded-full ${isSel ? 'bg-accent-on' : 'bg-protein'}`} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 justify-center mt-3 pt-2.5 border-t border-line text-[10px]">
              <Legend color="var(--color-accent)" label="체중" />
              <Legend color="var(--color-info)" label="운동" />
              <Legend color="var(--color-protein)" label="식단" />
            </div>
          </Card>
        </div>
      ) : (
        <WeekView
          weekStart={weekStart}
          selDate={selDate}
          onSelect={setSelDate}
          data={data}
          todayStr={todayStr}
        />
      )}

      {/* Selected day summary */}
      {selDate && (
        <>
          <SectionLabel right={<button type="button" onClick={() => setSelDate(null)} className="text-text-dim bg-transparent border-none cursor-pointer text-[11px] font-mono">닫기 ✕</button>}>
            {(() => {
              const d = new Date(selDate);
              return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW_KR[d.getDay()]}) 기록`;
            })()}
          </SectionLabel>
          <div className="mx-5">
            <DaySummary s={daySummary(selDate)} />
          </div>
        </>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <>
          <SectionLabel>다가오는 마일스톤</SectionLabel>
          <div className="mx-5 flex flex-col gap-2">
            {milestones.map(m => (
              <Card key={m.date} pad={14}>
                <div className="flex items-center gap-3.5">
                  <div className="text-center min-w-[52px]">
                    <div className="text-[18px] text-text font-medium tracking-[-0.4px]">{m.date}</div>
                    <div className="text-[10px] text-text-dim font-mono">{m.dow}요일</div>
                  </div>
                  <div className="w-px h-8 bg-line" />
                  <div className="flex-1">
                    <div className="text-[12px] text-text-mid tracking-[-0.2px]">{m.label}</div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-[17px] text-text font-medium tracking-[-0.3px]">{m.kg}</span>
                      <span className="text-[11px] text-up font-mono">{m.delta}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-text-dim font-mono tracking-[0.3px]">D-{m.days}</div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WeekView({ weekStart, selDate, onSelect, data, todayStr }) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  const weightSet = new Set((data.weight_records || []).map(r => r.date));
  const exerciseSet = new Set((data.exercise_records || []).map(r => r.date));
  const dietSet = new Set((data.diet_records || []).map(r => r.date));

  return (
    <div className="mx-5">
      <Card pad={0}>
        {days.map((ds, i) => {
          const d = new Date(ds);
          const dow = DOW_KR[d.getDay()];
          const isToday = ds === todayStr;
          const isSel = ds === selDate;
          const diets = (data.diet_records || []).filter(r => r.date === ds);
          const exes = (data.exercise_records || []).filter(r => r.date === ds);
          const weight = (data.weight_records || []).find(r => r.date === ds);
          const totalPro = diets.reduce((a, x) => a + (x.protein_g || 0), 0);
          const totalKc = diets.reduce((a, x) => a + (x.calories_kcal || 0), 0);
          return (
            <button
              key={ds}
              type="button"
              onClick={() => onSelect(ds)}
              className={`w-full flex items-center gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left ${i === days.length - 1 ? '' : 'border-b border-line'}`}
              style={isSel ? { background: 'var(--color-accent-soft)' } : undefined}
            >
              <div className="w-12 flex flex-col items-center">
                <div className={`text-[10px] font-mono tracking-[0.3px] ${d.getDay() === 0 ? 'text-down' : d.getDay() === 6 ? 'text-info' : 'text-text-dim'}`}>
                  {dow}
                </div>
                <div className={`text-[16px] font-medium tracking-[-0.3px] ${isToday ? 'text-accent' : 'text-text'}`}>
                  {d.getDate()}
                </div>
              </div>
              <div className="flex-1 min-w-0 flex gap-0.5">
                {weightSet.has(ds) && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                {exerciseSet.has(ds) && <span className="w-1.5 h-1.5 rounded-full bg-info" />}
                {dietSet.has(ds) && <span className="w-1.5 h-1.5 rounded-full bg-protein" />}
              </div>
              <div className="text-right text-[11px] font-mono text-text-dim">
                {weight && <div>{weight.weight_kg}kg</div>}
                {diets.length > 0 && <div>P{Math.round(totalPro)}g · {Math.round(totalKc)}kcal</div>}
                {exes.length > 0 && <div className="text-info">운동 {exes.length}회</div>}
                {!weight && diets.length === 0 && exes.length === 0 && <div className="opacity-50">—</div>}
              </div>
            </button>
          );
        })}
      </Card>
    </div>
  );
}

function DaySummary({ s }) {
  const { weight, diets, exes, meds, inbody, totalPro, totalKc } = s;
  const nothing = !weight && diets.length === 0 && exes.length === 0 && !inbody && meds.length === 0;
  if (nothing) {
    return (
      <Card className="text-center text-text-dim text-[12px]" pad={18}>기록 없음</Card>
    );
  }
  return (
    <Card pad={0}>
      {weight && (
        <Row label="체중" value={`${weight.weight_kg}kg`} color="var(--color-accent)" />
      )}
      {inbody && (
        <Row
          label="인바디"
          value={`${inbody.weight_kg}kg · 근 ${inbody.muscle_kg}kg · 지 ${inbody.fat_pct}%`}
          color="var(--color-accent)"
        />
      )}
      {diets.length > 0 && (
        <Row
          label={`식단 ${diets.length}건`}
          value={`P${Math.round(totalPro)}g · ${Math.round(totalKc)}kcal`}
          color="var(--color-protein)"
        />
      )}
      {exes.length > 0 && (
        <Row
          label={`운동 ${exes.length}회`}
          value={exes.map(e => {
            const first = (e.exercises || [])[0];
            return `${e.total_duration_min || 0}분` + (first ? ` · ${first.name}` : '');
          }).join(' / ')}
          color="var(--color-info)"
        />
      )}
      {meds.length > 0 && (
        <Row label="투약" value={meds.map(m => m.dose).join(', ')} color="var(--color-text-mid)" last />
      )}
    </Card>
  );
}

function Row({ label, value, color, last }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${last ? '' : 'border-b border-line'}`}>
      <span className="w-1 h-5 rounded-full shrink-0" style={{ background: color }} />
      <span className="w-16 text-[11px] text-text-dim font-mono">{label}</span>
      <span className="flex-1 text-[13px] text-text tracking-[-0.2px] truncate">{value}</span>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-text-dim">
      <span className="w-[5px] h-[5px] rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
