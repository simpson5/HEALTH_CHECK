import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, Ring, Bar, Chip, TapBtn } from '../design/primitives';
import Icon from '../design/Icon';
import { getToday, MEAL_ICON_KEY, getMealTime } from '../lib/utils';

const MEAL_TYPES = ['아침', '점심', '저녁', '보충제'];

export function Meal() {
  const { data, loading } = useData();
  const nav = useNavigate();
  const [selDate, setSelDate] = useState(getToday());

  if (loading || !data) return <LoadingScreen />;

  const dietRecs = data.diet_records || [];
  const profile = data.profile || {};
  const proGoal = profile.daily_targets?.protein_g || 110;
  const calGoal = profile.daily_targets?.calories_kcal || 1500;

  const meals = MEAL_TYPES.map(type => {
    const items = dietRecs.filter(r => r.date === selDate && r.meal_type === type);
    return {
      name: type,
      iconKey: MEAL_ICON_KEY[type] || 'meal',
      time: getMealTime(dietRecs, type, selDate),
      items,
    };
  });

  const total = meals.flatMap(m => m.items).reduce(
    (a, x) => ({
      kc: a.kc + (x.calories_kcal || 0),
      p: a.p + (x.protein_g || 0),
      c: a.c + (x.carbs_g || 0),
      f: a.f + (x.fat_g || 0),
    }),
    { kc: 0, p: 0, c: 0, f: 0 }
  );

  return (
    <div className="pb-[100px]">
      <DateStrip selDate={selDate} onChange={setSelDate} />

      {/* Daily macros hero */}
      <div className="mx-5 mt-3">
        <Card pad={18}>
          <div className="flex items-center gap-[18px]">
            <Ring size={94} stroke={8} pct={total.p / proGoal} color="var(--color-protein)">
              <div className="text-center">
                <div className="text-[22px] font-medium text-text tracking-[-0.5px]">
                  {Math.round(total.p)}<span className="text-[10px] text-text-dim font-normal">g</span>
                </div>
                <div className="text-[9px] text-text-dim font-mono tracking-[0.4px] uppercase">단백질</div>
              </div>
            </Ring>
            <div className="flex-1">
              <div className="text-[11px] text-text-dim font-mono tracking-[0.6px] uppercase">
                섭취 / 목표
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[32px] font-normal text-text tracking-[-1px]">{Math.round(total.kc)}</span>
                <span className="text-[13px] text-text-dim">/ {calGoal} kcal</span>
              </div>
              <div className="text-[11px] text-accent font-mono mt-1">
                {total.p < proGoal
                  ? `▲ 단백질 ${Math.max(0, (proGoal - total.p)).toFixed(1)}g 남음`
                  : '✓ 단백질 목표 달성'}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-4 pt-4 border-t border-line">
            {[
              ['단백질', total.p, proGoal, 'g', 'var(--color-protein)'],
              ['탄수', total.c, 180, 'g', 'var(--color-carb)'],
              ['지방', total.f, 60, 'g', 'var(--color-fat)'],
            ].map(([l, v, t, u, c]) => (
              <div key={l} className="flex-1">
                <div className="text-[10px] text-text-dim font-mono tracking-[0.3px] uppercase">{l}</div>
                <div className="flex items-baseline gap-[3px] mt-[3px]">
                  <span className="text-[17px] text-text font-medium tracking-[-0.3px]">
                    {v % 1 ? v.toFixed(1) : v.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-text-dim font-mono">/{t}{u}</span>
                </div>
                <Bar pct={v / t} color={c} height={2} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Meal cards */}
      {meals.map(m => <MealCard key={m.name} meal={m} onAdd={() => nav('/?tab=record')} />)}

      {/* Quick add */}
      <div className="mx-5 mt-6">
        <TapBtn full variant="ghost" onClick={() => nav('/?tab=record')}>
          <Icon.plus s={16} />음식 추가 · AI 분석
        </TapBtn>
      </div>
    </div>
  );
}

function DateStrip({ selDate, onChange }) {
  const today = getToday();
  const base = new Date();
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d);
  }
  return (
    <div className="flex gap-1.5 px-5 pt-2.5 pb-1 justify-between">
      {days.map(d => {
        const dateStr = d.toISOString().slice(0, 10);
        const sel = dateStr === selDate;
        const isToday = dateStr === today;
        const isFuture = dateStr > today;
        const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onChange(dateStr)}
            className={`flex-1 py-2.5 rounded-[12px] border-none cursor-pointer flex flex-col items-center gap-1 transition-all ${
              sel
                ? 'bg-accent text-accent-on'
                : isFuture
                  ? 'bg-transparent text-text-mid opacity-40'
                  : 'bg-transparent text-text-mid'
            }`}
          >
            <span className={`text-[10px] tracking-[0.5px] font-mono ${sel ? 'opacity-80' : 'opacity-60'}`}>{dow}</span>
            <span className={`text-[17px] tracking-[-0.3px] ${sel ? 'font-semibold' : 'font-normal'}`}>{d.getDate()}</span>
            {isToday && !sel && <div className="w-1 h-1 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

function MealCard({ meal, onAdd }) {
  const empty = meal.items.length === 0;
  const MealIcon = Icon[meal.iconKey] || Icon.meal;
  const totals = meal.items.reduce(
    (a, x) => ({ kc: a.kc + (x.calories_kcal || 0), p: a.p + (x.protein_g || 0) }),
    { kc: 0, p: 0 }
  );
  return (
    <div className="mx-5 mt-[18px]">
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={`w-7 h-7 rounded-[9px] flex items-center justify-center ${empty ? 'text-text-dim' : 'bg-accent-soft text-accent'}`}
          style={empty ? { border: '1px dashed var(--color-line-strong)' } : undefined}
        >
          <MealIcon s={15} />
        </div>
        <span className="text-[14px] font-medium text-text tracking-[-0.2px]">{meal.name}</span>
        <span className="text-[10px] text-text-dim font-mono tracking-[0.3px]">{meal.time}</span>
        <div className="flex-1" />
        {!empty && (
          <span className="text-[11px] text-text-mid font-mono">
            <span className="text-protein">P{Math.round(totals.p)}g</span> · {Math.round(totals.kc)}kcal
          </span>
        )}
      </div>
      <Card pad={0}>
        {empty ? (
          <button
            type="button"
            onClick={onAdd}
            className="w-full py-[22px] px-4 flex items-center justify-center gap-2 text-text-dim cursor-pointer bg-transparent border-none"
          >
            <Icon.plus s={14} />
            <span className="text-[12px]">{meal.name} 기록하기</span>
          </button>
        ) : (
          meal.items.map((it, i) => (
            <div
              key={i}
              className={`px-4 py-[13px] ${i === meal.items.length - 1 ? '' : 'border-b border-line'}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text tracking-[-0.2px]">{it.food_name}</div>
                  <div className="text-[10px] text-text-dim font-mono mt-0.5">{it.quantity || ''}</div>
                </div>
                <span className="text-[13px] text-text font-mono font-medium">
                  {Math.round(it.calories_kcal || 0)}<span className="text-[9px] text-text-dim font-normal">kcal</span>
                </span>
              </div>
              <div className="flex gap-1.5 mt-2">
                <Chip label="P" value={`${Math.round(it.protein_g || 0)}g`} color="var(--color-protein)" />
                <Chip label="C" value={`${Math.round(it.carbs_g || 0)}g`} color="var(--color-carb)" />
                <Chip label="F" value={`${Math.round(it.fat_g || 0)}g`} color="var(--color-fat)" />
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
