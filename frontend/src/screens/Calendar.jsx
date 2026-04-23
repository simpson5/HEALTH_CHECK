import { useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, SectionLabel } from '../design/primitives';
import Icon from '../design/Icon';
import { getToday } from '../lib/utils';

const DOWS = ['일', '월', '화', '수', '목', '금', '토'];
const MILESTONES = [
  ['5/01', '금', '5월 목표', '104kg', '-4kg', 8],
  ['6/01', '월', '6월 목표', '100kg', '-4kg', 39],
  ['7/01', '수', '7월 목표', '97kg', '-3kg', 69],
  ['8/01', '토', '8월 목표', '94kg', '-3kg', 100],
];

export function Calendar() {
  const { data, loading } = useData();
  const todayStr = getToday();
  const today = new Date(todayStr);
  const [mode, setMode] = useState('월간');
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });

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

  function dateStrOf(d) {
    return `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

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

      {/* Month header */}
      <div className="px-5 pt-[18px] pb-2.5 flex items-center justify-center gap-[18px]">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          className="bg-transparent border-none text-text-mid cursor-pointer"
          aria-label="이전 달"
        >
          <Icon.chev dir="left" s={18} />
        </button>
        <div className="text-center">
          <div className="text-[11px] text-text-dim font-mono tracking-[1px]">{ym.y}</div>
          <div className="text-[22px] text-text font-medium tracking-[-0.5px] mt-0.5">{ym.m + 1}월</div>
        </div>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          className="bg-transparent border-none text-text-mid cursor-pointer"
          aria-label="다음 달"
        >
          <Icon.chev dir="right" s={18} />
        </button>
      </div>

      {/* Grid */}
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
              const dow = i % 7;
              const hasWeight = weightSet.has(ds);
              const hasExercise = exerciseSet.has(ds);
              const hasDiet = dietSet.has(ds);
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 py-1.5 rounded-[10px]"
                  style={{
                    aspectRatio: '1',
                    background: isToday ? 'var(--color-accent-soft)' : 'transparent',
                    border: isToday ? '1px solid var(--color-accent-line)' : '1px solid transparent',
                  }}
                >
                  <span
                    className={`text-[13px] ${
                      isToday
                        ? 'text-accent font-semibold'
                        : dow === 0
                          ? 'text-down'
                          : dow === 6
                            ? 'text-info'
                            : 'text-text'
                    }`}
                  >
                    {d}
                  </span>
                  <div className="flex gap-0.5">
                    {hasWeight && <span className="w-1 h-1 rounded-full bg-accent" />}
                    {hasExercise && <span className="w-1 h-1 rounded-full bg-info" />}
                    {hasDiet && <span className="w-1 h-1 rounded-full bg-protein" />}
                  </div>
                </div>
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

      {/* Milestones */}
      <SectionLabel>다가오는 마일스톤</SectionLabel>
      <div className="mx-5 flex flex-col gap-2">
        {MILESTONES.map(([date, dow, label, kg, delta, days]) => (
          <Card key={date} pad={14}>
            <div className="flex items-center gap-3.5">
              <div className="text-center min-w-[52px]">
                <div className="text-[18px] text-text font-medium tracking-[-0.4px]">{date}</div>
                <div className="text-[10px] text-text-dim font-mono">{dow}요일</div>
              </div>
              <div className="w-px h-8 bg-line" />
              <div className="flex-1">
                <div className="text-[12px] text-text-mid tracking-[-0.2px]">{label}</div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-[17px] text-text font-medium tracking-[-0.3px]">{kg}</span>
                  <span className="text-[11px] text-up font-mono">{delta}</span>
                </div>
              </div>
              <div className="text-[10px] text-text-dim font-mono tracking-[0.3px]">D-{days}</div>
            </div>
          </Card>
        ))}
      </div>
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
