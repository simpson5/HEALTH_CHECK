import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { daysSince, getToday, getDayAchievement, getStreak } from '../lib/utils';
import { Flame, Pill, TrendingDown, Dumbbell } from 'lucide-react';

export function Home() {
  const { data, loading } = useData();
  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const p = data.profile;
  const wr = data.weight_records || [];
  const latest = wr.length ? wr[wr.length - 1] : null;
  const prev = wr.length > 1 ? wr[wr.length - 2] : null;
  const wChange = latest && prev ? (latest.weight_kg - prev.weight_kg) : null;
  const diffDays = latest && prev ? Math.floor((new Date(latest.date) - new Date(prev.date)) / 86400000) : 0;
  const wChangeLabel = diffDays === 1 ? '전일' : diffDays + '일 전';
  const totalLoss = latest ? (p.start_weight_kg - latest.weight_kg) : 0;
  const totalGoal = p.start_weight_kg - p.goal_weight_kg;
  const pct = totalGoal > 0 ? ((totalLoss / totalGoal) * 100) : 0;
  const remaining = latest ? (latest.weight_kg - p.goal_weight_kg).toFixed(1) : '?';
  const days = daysSince(p.medication_start);
  const dose = (data.medication_records[data.medication_records.length - 1] || {}).dose || '';

  const today = getToday();
  const todayMeals = data.diet_records.filter(r => r.date === today);
  let tPro = 0, tCal = 0;
  todayMeals.forEach(m => { tPro += m.protein_g; tCal += m.calories_kcal; });
  const proTarget = (p.daily_targets || {}).protein_g || 110;

  const todayAch = getDayAchievement(data, today);
  const streak = getStreak(data);

  const exRecs = data.exercise_records || [];
  const todayEx = exRecs.filter(r => r.date === today);
  const todayExCount = todayEx.reduce((sum, r) => sum + (r.exercises || []).length, 0);

  return (
    <div className="space-y-3">
      {/* 체중 + 투약 */}
      <Card elevated className="animate-in">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-display text-5xl tracking-tight leading-none">
              <span className="gradient-text">{latest ? latest.weight_kg : '--'}</span>
              <span className="text-base font-sans text-muted ml-1">kg</span>
            </div>
            {wChange !== null && (
              <div className={'text-xs font-bold mt-1.5 ' + (wChange <= 0 ? 'text-success' : 'text-danger')}>
                {wChange < 0 ? '▼' : '▲'} {Math.abs(wChange).toFixed(1)}kg ({wChangeLabel})
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[11px] text-muted">
              <Pill size={12} className="text-info" /> D+{days} · {dose}
            </div>
            <div className="text-[11px] text-success mt-0.5">▼{totalLoss.toFixed(1)}kg 감량</div>
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar value={totalLoss} max={totalGoal} glow />
          <div className="flex justify-between text-[10px] text-dim mt-1">
            <span>{p.start_weight_kg}</span>
            <span className="text-accent">{pct.toFixed(0)}%</span>
            <span>{p.goal_weight_kg}kg</span>
          </div>
        </div>
      </Card>

      {/* 오늘 미션 + 단백질 — 한 카드로 */}
      <Card className="animate-in-delay-1">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">오늘</span>
            {streak > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] font-bold text-warning">
                <Flame size={12} /> {streak}일
              </div>
            )}
          </div>
          <div className="text-[11px] text-muted">{todayAch.done}/{todayAch.total} 달성</div>
        </div>

        {/* 미션 2x2 */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {todayAch.items.map((item, i) => (
            <div key={i} className={'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] '
              + (item.ok ? 'bg-success/10 text-success' : 'bg-white/[0.03] text-muted')}>
              <span className="text-[10px]">{item.ok ? '✓' : '○'}</span>
              <span className="flex-1">{item.name}</span>
              {item.val && <span className="text-[10px]">{item.val}</span>}
            </div>
          ))}
        </div>

        {/* 단백질 바 */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-muted">단백질</span>
          <span className={'text-xs font-bold ' + (tPro >= proTarget ? 'text-success' : tPro / proTarget > 0.5 ? 'text-warning' : 'text-danger')}>
            {tPro}g / {proTarget}g
          </span>
        </div>
        <ProgressBar value={tPro} max={proTarget} color={tPro >= proTarget ? 'success' : tPro / proTarget > 0.3 ? 'warning' : 'danger'} />
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-[11px] text-muted">칼로리</span>
          <span className="text-xs text-warning font-bold">{tCal}kcal</span>
        </div>
      </Card>

      {/* 오늘 요약 — 식단 + 운동 한 줄 */}
      <Card className="animate-in-delay-2">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="text-[10px] text-dim uppercase tracking-[1px] mb-1">식단</div>
            {todayMeals.filter(m => m.calories_kcal > 0).length === 0 ? (
              <div className="text-xs text-muted">미기록</div>
            ) : (
              todayMeals.filter(m => m.calories_kcal > 0).slice(0, 3).map((m, i) => (
                <div key={i} className="text-[11px] text-text truncate">{m.meal_type}: {m.food_name}</div>
              ))
            )}
          </div>
          <div className="w-px bg-white/[0.06]" />
          <div className="flex-1">
            <div className="text-[10px] text-dim uppercase tracking-[1px] mb-1">운동</div>
            {todayEx.length === 0 ? (
              <div className="text-xs text-muted">미기록</div>
            ) : (
              <div className="text-[11px] text-text">
                <Dumbbell size={11} className="inline text-accent mr-1" />
                {todayExCount}종 수행
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
