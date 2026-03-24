import { useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { DateNav } from '../components/ui/DateNav';
import { fmtDateFull, getToday } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const mealIcons = { 아침: '🌅', 점심: '☀️', 저녁: '🌙', 간식: '🍪', 음료: '☕', 보충제: '💊' };
const mealColors = { 아침: 'border-l-amber-400', 점심: 'border-l-orange-500', 저녁: 'border-l-violet-500', 간식: 'border-l-pink-500', 음료: 'border-l-cyan-400', 보충제: 'border-l-emerald-400' };
const mealOrder = ['아침', '점심', '저녁', '간식', '음료', '보충제'];

export function Diet() {
  const { data, loading } = useData();
  const [date, setDate] = useState(getToday());
  const [photoSrc, setPhotoSrc] = useState(null);

  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const target = (data.profile.daily_targets || {}).protein_g || 110;
  const meals = (data.diet_records || []).filter(r => r.date === date);
  let tCal = 0, tPro = 0, tCarb = 0, tFat = 0;
  meals.forEach(m => { tCal += m.calories_kcal; tPro += m.protein_g; tCarb += m.carbs_g; tFat += m.fat_g; });
  const proShort = target - tPro;

  const moveDate = (dir) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    if (d.toISOString().slice(0, 10) > getToday()) return;
    setDate(d.toISOString().slice(0, 10));
  };

  const ringData = [
    { value: tPro, color: '#00e5ff' },
    { value: Math.max(0, target - tPro), color: '#22223a' },
  ];

  return (
    <div className="space-y-3">
      <DateNav label={fmtDateFull(date)} onPrev={() => moveDate(-1)} onNext={() => moveDate(1)} />

      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ringData} dataKey="value" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none">
                  {ringData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <div className="font-display text-3xl text-accent leading-none">
              {tPro}<span className="text-sm font-sans text-muted ml-0.5">g</span>
            </div>
            <div className="text-[11px] text-muted mt-0.5">목표 {target}g</div>
            {proShort > 0
              ? <div className="text-[11px] text-danger font-bold mt-0.5">⚠️ {proShort.toFixed(0)}g 부족</div>
              : <div className="text-[11px] text-success font-bold mt-0.5">✅ 달성!</div>
            }
          </div>
        </div>
      </Card>

      <div className="flex gap-1.5 flex-wrap">
        <Badge color="warning">🔥 {tCal}kcal</Badge>
        <Badge color="accent">P {tPro}g</Badge>
        <Badge color="warning">C {tCarb}g</Badge>
        <Badge color="info">F {tFat}g</Badge>
      </div>

      {meals.length === 0 ? (
        <div className="text-center text-muted text-sm py-6">이 날 식단 기록 없음</div>
      ) : (
        mealOrder.map(type => {
          const typeMeals = meals.filter(m => m.meal_type === type);
          if (typeMeals.length === 0 && ['아침', '점심', '저녁'].includes(type)) {
            return (
              <Card key={type} className={`border-l-4 ${mealColors[type] || ''}`}>
                <div className="flex items-center gap-2">
                  <span>{mealIcons[type]}</span>
                  <span className="text-xs font-bold text-accent">{type}</span>
                </div>
                <div className="text-xs text-muted italic mt-1">미기록</div>
              </Card>
            );
          }
          return typeMeals.map((m, i) => (
            <Card key={`${type}-${i}`} className={`border-l-4 ${mealColors[type] || ''}`}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span>{mealIcons[type] || '🍽️'}</span>
                  <span className="text-xs font-bold text-accent">{type}</span>
                </div>
                <span className="text-[11px] text-muted">{m.time || ''}</span>
              </div>
              {m.photo && typeof m.photo === 'string' && (
                <img
                  src={`/${m.photo}`}
                  className="w-full rounded-lg mb-2 cursor-pointer"
                  onClick={() => setPhotoSrc(`/${m.photo}`)}
                />
              )}
              {m.calories_kcal === 0 && m.food_name.includes('굶') ? (
                <div className="text-xs text-muted italic">{m.food_name} {m.memo ? `(${m.memo})` : ''}</div>
              ) : (
                <>
                  <div className="text-sm font-bold mb-1.5">{m.food_name}{m.quantity ? ` (${m.quantity})` : ''}</div>
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge color="warning">🔥{m.calories_kcal}</Badge>
                    <Badge color="accent">P{m.protein_g}g</Badge>
                    <Badge color="warning">C{m.carbs_g}g</Badge>
                    <Badge color="info">F{m.fat_g}g</Badge>
                  </div>
                </>
              )}
            </Card>
          ));
        })
      )}

      {photoSrc && (
        <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center" onClick={() => setPhotoSrc(null)}>
          <img src={photoSrc} className="max-w-[95%] max-h-[90%] object-contain" />
        </div>
      )}
    </div>
  );
}
