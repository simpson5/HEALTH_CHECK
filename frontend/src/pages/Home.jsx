import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { daysSince, getToday, getDayAchievement, getStreak } from '../lib/utils';
import { Flame, TrendingDown, Dumbbell, Pill } from 'lucide-react';

export function Home() {
  const { data, loading } = useData();
  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const p = data.profile;
  const wr = data.weight_records || [];
  const latest = wr.length ? wr[wr.length - 1] : null;
  const prev = wr.length > 1 ? wr[wr.length - 2] : null;
  const wChange = latest && prev ? (latest.weight_kg - prev.weight_kg) : null;
  const diffDays = latest && prev ? Math.floor((new Date(latest.date) - new Date(prev.date)) / 86400000) : 0;
  const wChangeLabel = diffDays === 1 ? '전일 대비' : `${diffDays}일 전 대비`;
  const totalLoss = latest ? (p.start_weight_kg - latest.weight_kg) : 0;
  const totalGoal = p.start_weight_kg - p.goal_weight_kg;
  const pct = totalGoal > 0 ? ((totalLoss / totalGoal) * 100) : 0;
  const remaining = latest ? (latest.weight_kg - p.goal_weight_kg).toFixed(1) : '?';
  const days = daysSince(p.medication_start);
  const dose = (data.medication_records[data.medication_records.length - 1] || {}).dose || '';

  // 오늘 식단
  const today = getToday();
  const todayMeals = data.diet_records.filter(r => r.date === today);
  let tPro = 0, tCal = 0;
  todayMeals.forEach(m => { tPro += m.protein_g; tCal += m.calories_kcal; });
  const proTarget = (p.daily_targets || {}).protein_g || 110;

  // 미션
  const todayAch = getDayAchievement(data, today);
  const streak = getStreak(data);

  // 최근 운동
  const exRecs = data.exercise_records || [];
  const lastEx = exRecs.length ? exRecs[exRecs.length - 1] : null;

  const mealIcons = { 아침: '🌅', 점심: '☀️', 저녁: '🌙', 간식: '🍪', 음료: '☕', 보충제: '💊' };

  return (
    <div className="space-y-3">
      {/* 체중 카드 */}
      <Card elevated>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>현재 체중</CardTitle>
            <div className="font-display text-4xl tracking-wide leading-none">
              {latest ? latest.weight_kg : '--'}
              <span className="text-sm font-sans text-muted ml-1">kg</span>
            </div>
            {wChange !== null && (
              <div className={`text-xs font-bold mt-1.5 ${wChange <= 0 ? 'text-success' : 'text-danger'}`}>
                {wChange < 0 ? '▼' : '▲'} {Math.abs(wChange).toFixed(1)}kg ({wChangeLabel})
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Pill size={14} className="text-info" />
              마운자로 D+{days}
            </div>
            <div className="text-[11px] text-muted mt-0.5">{dose}</div>
          </div>
        </div>
      </Card>

      {/* 목표 프로그레스 */}
      <div>
        <ProgressBar value={totalLoss} max={totalGoal} />
        <div className="flex justify-between text-[11px] text-muted mt-1.5">
          <span>{p.start_weight_kg}kg</span>
          <span className="text-accent">{pct.toFixed(1)}% 달성</span>
          <span>{p.goal_weight_kg}kg 목표</span>
        </div>
        <div className="flex justify-center gap-4 text-[11px] mt-1">
          <span className="text-success">▼{totalLoss.toFixed(1)}kg 감량</span>
          <span className="text-muted">{remaining}kg 남음</span>
        </div>
      </div>

      {/* 오늘 미션 */}
      <Card>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="!mb-0">오늘 미션</CardTitle>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-warning">
              <Flame size={14} /> {streak}일 연속
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {todayAch.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0
                ${item.ok ? 'bg-success text-black' : 'bg-white/[0.04] border border-white/[0.06] text-muted'}`}>
                {item.ok ? '✓' : ''}
              </div>
              <span className={item.ok ? 'text-success' : ''}>{item.name}</span>
              {item.val && <span className="text-muted ml-auto text-[10px]">{item.val}</span>}
            </div>
          ))}
        </div>
        <ProgressBar
          value={todayAch.done}
          max={todayAch.total}
          color={todayAch.done === todayAch.total ? 'success' : 'warning'}
        />
        <div className="text-center text-[10px] text-muted mt-1">{todayAch.done}/{todayAch.total} 달성</div>
      </Card>

      {/* 단백질 */}
      <Card>
        <div className="flex justify-between items-center mb-1.5">
          <CardTitle className="!mb-0">오늘 단백질</CardTitle>
          <div className={`text-sm font-bold ${tPro / proTarget < 0.3 ? 'text-danger' : tPro / proTarget < 0.7 ? 'text-warning' : 'text-success'}`}>
            {tPro}g / {proTarget}g
          </div>
        </div>
        <ProgressBar
          value={tPro}
          max={proTarget}
          color={tPro / proTarget < 0.3 ? 'danger' : tPro / proTarget < 0.7 ? 'warning' : 'success'}
        />
        <div className="text-[11px] text-muted mt-1.5">
          {tPro >= proTarget ? '✅ 목표 달성!' : `⚠️ ${(proTarget - tPro).toFixed(0)}g 부족 — 쉐이크 1잔 = +36g`} · {tCal}kcal
        </div>
      </Card>

      {/* 오늘 식단 */}
      <Card>
        <CardTitle>오늘 식단</CardTitle>
        {todayMeals.length === 0 ? (
          <div className="text-xs text-muted text-center py-2">미기록</div>
        ) : (
          <div className="space-y-1">
            {todayMeals.filter(m => m.calories_kcal > 0 || !m.food_name.includes('굶')).map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span>{mealIcons[m.meal_type] || '🍽️'}</span>
                <span className="flex-1">{m.food_name} {m.quantity ? `(${m.quantity})` : ''}</span>
                <Badge color="accent">P{m.protein_g}g</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 최근 운동 */}
      <Card>
        <CardTitle>최근 운동</CardTitle>
        {lastEx ? (
          <div>
            <div className="flex items-center gap-2 text-xs">
              <Dumbbell size={14} className="text-accent" />
              <span className="text-muted">{lastEx.date}</span>
              <span>{lastEx.exercises.map(e => e.name).join(', ')}</span>
            </div>
            {lastEx.total_calories_burned > 0 && (
              <div className="text-[11px] text-muted mt-1">~{lastEx.total_calories_burned}kcal 소모</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted text-center py-2">운동 기록 없음</div>
        )}
      </Card>
    </div>
  );
}
