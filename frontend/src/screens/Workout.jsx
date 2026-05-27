import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, Ring, SectionLabel } from '../design/primitives';
import Icon from '../design/Icon';
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet';
import { getToday, daysSince, getWeekRange } from '../lib/utils';
import {
  GROUP_LABEL,
  BODYPART_LABEL,
  filterExercises,
  lastExerciseLog,
  lastSetDefaults,
} from '../lib/exerciseMaps';

const CATEGORIES = ['machine', 'bodyweight', 'cardio'];
const FILTERS = ['favorite', 'push', 'pull', 'legs', 'core'];
const DOWS = ['월', '화', '수', '목', '금', '토', '일'];

export function Workout() {
  const { data, loading, refresh } = useData();
  const nav = useNavigate();
  const [cat, setCat] = useState('machine');
  const [filter, setFilter] = useState('favorite');
  const [detailEx, setDetailEx] = useState(null);

  if (loading || !data) return <LoadingScreen />;

  const profile = data.profile || {};
  const exerciseRecs = data.exercise_records || [];
  const library = data.exercise_library || [];

  // Weekly progress (Mon-Sun of this week)
  const { start: weekStart, end: weekEnd } = getWeekRange(0);
  const weekDatesDone = new Set(
    exerciseRecs
      .filter(r => r.date >= weekStart && r.date <= weekEnd)
      .map(r => r.date)
  );
  const weekDone = weekDatesDone.size;
  const weekGoal = profile.weekly_targets?.exercise_count || 4;

  const today = getToday();
  const lastExDate = exerciseRecs.length > 0
    ? exerciseRecs[exerciseRecs.length - 1].date
    : profile.medication_start;
  const restDays = lastExDate ? Math.max(0, daysSince(lastExDate) - 1) : 0;

  // Week dots (Mon..Sun)
  const weekDots = DOWS.map((dow, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const done = weekDatesDone.has(dateStr);
    const isToday = dateStr === today;
    const isFuture = dateStr > today;
    let state = 'rest';
    if (done) state = 'done';
    else if (isToday) state = 'today';
    else if (isFuture) state = 'future';
    return { dow, state };
  });

  const filteredList = filterExercises(library, { group: cat, bodypart: filter });

  async function toggleFav(ex) {
    await fetch(`/api/exercise-library/${ex.id}/favorite`, { method: 'PUT' });
    refresh();
  }

  function handleStart() {
    const plan = filteredList.slice(0, 5).map(e => {
      const d = lastSetDefaults(exerciseRecs, e.id);
      return {
        id: e.id,
        name: e.name,
        weight: d.kg,
        reps: d.reps,
        done: [false, false, false],
        target: `${d.kg}kg × ${d.reps}`,
      };
    });
    sessionStorage.setItem('session:plan', JSON.stringify(plan));
    sessionStorage.setItem('session:startAt', String(Date.now()));
    sessionStorage.setItem('session:startTime', new Date().toTimeString().slice(0, 5));
    nav('/session');
  }

  const remain = Math.max(0, weekGoal - weekDone);

  // ETA from session median (L8) — needs at least 3 records, else fallback
  const recentDurations = exerciseRecs
    .slice(-5)
    .map(r => r.total_duration_min)
    .filter(v => typeof v === 'number' && v > 0)
    .sort((a, b) => a - b);
  const etaMin = recentDurations.length >= 3
    ? Math.round(recentDurations[Math.floor(recentDurations.length / 2)])
    : null;

  return (
    <div className="pb-[100px]">
      {/* Weekly ring — 진행/긍정은 sage. 죄책감 카피 금지 */}
      <div className="px-5 pt-3">
        <Card pad={18}>
          <div className="flex items-center gap-[18px]">
            <Ring size={78} stroke={7} pct={weekDone / weekGoal} color="var(--color-sage)">
              <div className="text-center">
                <div className="text-[20px] font-medium text-text tracking-[-0.5px]">
                  {weekDone}<span className="text-[11px] text-text-dim font-normal">/{weekGoal}</span>
                </div>
              </div>
            </Ring>
            <div className="flex-1">
              <div className="text-[11px] text-text-mid font-medium">이번 주</div>
              <div className="text-[17px] text-text font-semibold mt-0.5 tracking-[-0.3px]">
                {remain > 0 ? `${weekGoal}회 도전 중` : '이번 주 목표 달성'}
              </div>
              <div className="text-[11px] mt-1.5 leading-relaxed text-text-mid">
                {restDays === 0
                  ? <span className="text-sage font-semibold">오늘 운동 완료</span>
                  : <>마지막 운동 <b className="text-text">{restDays}일 전</b> · 가볍게 시작해볼까요?</>
                }
              </div>
            </div>
          </div>

          {/* week dots */}
          <div className="flex gap-1.5 mt-4 pt-3.5 border-t border-line">
            {weekDots.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      d.state === 'done'
                        ? 'var(--color-sage)'
                        : d.state === 'today'
                          ? 'var(--color-amber-soft)'
                          : d.state === 'rest'
                            ? 'rgba(255,240,220,0.04)'
                            : 'transparent',
                    border: d.state === 'today' ? '1.5px dashed var(--color-amber)' : 'none',
                    color: d.state === 'done' ? '#0E0B07' : d.state === 'today' ? 'var(--color-amber)' : 'var(--color-text-dim)',
                  }}
                >
                  {d.state === 'done' && <Icon.check s={14} />}
                  {d.state === 'today' && (
                    <span className="text-[9px] font-mono font-bold">TODAY</span>
                  )}
                </div>
                <span className={`text-[10px] font-mono ${d.state === 'today' ? 'text-amber font-semibold' : 'text-text-dim'}`}>{d.dow}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Start session CTA — calm, not glowing */}
      <div className="mx-5 mt-3.5">
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-4 rounded-[14px] bg-amber text-[#1a1208] border-none cursor-pointer text-[15px] font-bold inline-flex items-center justify-center gap-2.5 tracking-[-0.2px] active:scale-[.98] transition-transform"
        >
          <Icon.play s={16} />오늘 운동 시작
        </button>
        <div className="flex justify-center gap-2.5 mt-2 text-[11px] text-text-mid">
          <span>오늘</span>
          <span className="text-text-faint">·</span>
          <span className="font-mono">{today}</span>
          <span className="text-text-faint">·</span>
          <span>{etaMin ? `예상 ${etaMin}분` : '예상 30분'}</span>
        </div>
      </div>

      {/* Exercise catalog */}
      <SectionLabel>운동 가이드</SectionLabel>
      <div className="px-5 flex gap-1.5">
        {CATEGORIES.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`px-3.5 py-[7px] rounded-full cursor-pointer text-[12px] font-medium ${
              cat === c
                ? 'bg-bg-elev-3 text-text border-none'
                : 'bg-transparent text-text-dim border border-line'
            }`}
          >
            {GROUP_LABEL[c] || c}
          </button>
        ))}
      </div>

      <div className="px-5 pt-2.5 flex gap-1.5 overflow-x-auto nosb">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full border-none cursor-pointer text-[11px] font-medium shrink-0 inline-flex items-center gap-1 ${
              filter === f ? 'text-accent' : 'bg-transparent text-text-dim'
            }`}
            style={filter === f ? { background: 'var(--color-accent-soft)' } : undefined}
          >
            {f === 'favorite' && filter === f && <Icon.star s={11} fill="currentColor" />}
            {f === 'favorite' ? '즐겨찾기' : BODYPART_LABEL[f] || f}
          </button>
        ))}
      </div>

      <div className="mx-5 mt-3 flex flex-col gap-2">
        {filteredList.length === 0 ? (
          <Card className="text-center text-text-dim text-[12px]" pad={16}>해당하는 운동이 없습니다</Card>
        ) : (
          filteredList.map(ex => (
            <Card key={ex.id} pad={14} onClick={() => setDetailEx(ex)}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-text-mid"
                  style={{ background: 'var(--color-surface-3)' }}
                >
                  <Icon.dumbbell s={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] text-text font-medium tracking-[-0.2px]">{ex.name}</span>
                    {ex.is_favorite && <Icon.star s={11} fill="var(--color-accent)" className="text-accent" />}
                  </div>
                  <div className="text-[11px] text-text-dim mt-0.5">{(ex.target || []).join(', ')}</div>
                  {lastExerciseLog(exerciseRecs, ex.id) && (
                    <div className="text-[11px] text-accent font-mono mt-1">{lastExerciseLog(exerciseRecs, ex.id)}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleFav(ex); }}
                  aria-label="즐겨찾기 토글"
                  className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center text-text-mid"
                  style={{ background: 'var(--color-surface-3)' }}
                >
                  {ex.is_favorite ? <Icon.star s={14} fill="var(--color-accent)" /> : <Icon.plus s={16} />}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <ExerciseDetailSheet
        exercise={detailEx}
        records={exerciseRecs}
        onClose={() => setDetailEx(null)}
      />
    </div>
  );
}
