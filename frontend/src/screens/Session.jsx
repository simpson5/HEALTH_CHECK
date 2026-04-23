import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, SectionLabel } from '../design/primitives';
import Icon from '../design/Icon';
import { getToday } from '../lib/utils';
import { lastSetDefaults } from '../lib/exerciseMaps';

export function Session() {
  const { data, loading, refresh } = useData();
  const nav = useNavigate();

  const [plan, setPlan] = useState(() => {
    try {
      const raw = sessionStorage.getItem('session:plan');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [sec, setSec] = useState(() => {
    const startAt = Number(sessionStorage.getItem('session:startAt') || Date.now());
    sessionStorage.setItem('session:startAt', String(startAt));
    return Math.max(0, Math.floor((Date.now() - startAt) / 1000));
  });

  // Fallback plan if sessionStorage was empty
  useEffect(() => {
    if (plan.length === 0 && data) {
      const fallback = (data.exercise_library || [])
        .filter(e => e.is_favorite && e.group === 'machine')
        .slice(0, 3)
        .map(e => {
          const d = lastSetDefaults(data.exercise_records, e.id);
          return {
            id: e.id,
            name: e.name,
            weight: d.kg,
            reps: d.reps,
            done: [false, false, false],
            target: `${d.kg}kg × ${d.reps}`,
          };
        });
      if (fallback.length > 0) setPlan(fallback);
    }
  }, [data, plan.length]);

  useEffect(() => {
    if (plan.length > 0) {
      sessionStorage.setItem('session:plan', JSON.stringify(plan));
    }
  }, [plan]);

  useEffect(() => {
    const t = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading || !data) return <LoadingScreen />;

  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');

  const totalDone = plan.reduce((a, p) => a + p.done.filter(Boolean).length, 0);
  const totalAll = plan.reduce((a, p) => a + p.done.length, 0);
  const totalVolume = plan.reduce(
    (a, p) => a + p.done.filter(Boolean).length * p.weight * p.reps,
    0
  );
  const totalCalories = plan.reduce(
    (a, p) => a + p.done.filter(Boolean).length * 12,
    0
  );

  function toggleSet(ei, si) {
    setPlan(prev => prev.map((p, i) =>
      i === ei ? { ...p, done: p.done.map((d, j) => (j === si ? !d : d)) } : p
    ));
  }

  async function handleEnd() {
    const startTime = sessionStorage.getItem('session:startTime') || '';
    const endTime = new Date().toTimeString().slice(0, 5);
    const exercises = plan.map(p => ({
      id: p.id,
      name: p.name,
      type: 'strength',
      sets: p.done.map((d, i) => ({ kg: p.weight, reps: p.reps })).filter((_, i) => p.done[i]),
    }));
    try {
      await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: getToday(),
          start_time: startTime,
          end_time: endTime,
          total_duration_min: Math.round(sec / 60),
          total_volume_kg: totalVolume,
          total_calories_burned: totalCalories,
          exercises,
          memo: '',
        }),
      });
    } catch {}
    ['session:plan', 'session:startAt', 'session:startTime'].forEach(k => sessionStorage.removeItem(k));
    refresh();
    nav('/?tab=exercise');
  }

  return (
    <div className="w-full min-h-screen bg-bg text-text font-sans pb-[120px] relative overflow-hidden animate-fade-up">
      {/* Top bar */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={handleEnd}
          className="bg-transparent border-none cursor-pointer text-text-mid text-[13px] inline-flex items-center gap-1"
        >
          <Icon.chev dir="left" s={16} />종료
        </button>
        <div className="font-mono text-[11px] text-text-dim tracking-[0.5px]">
          LIVE · <span className="text-accent">●</span>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center px-5 pt-5 pb-2">
        <div className="text-[11px] text-text-dim font-mono tracking-[1.2px] uppercase">운동 시간</div>
        <div className="text-[68px] font-extralight text-text tracking-[-3px] leading-none mt-1.5 tnum">
          {mm}<span className="text-accent">:</span>{ss}
        </div>
      </div>

      {/* Quick stats */}
      <div className="mx-5 mt-3 grid grid-cols-3 gap-2.5">
        {[
          { k: '완료', v: String(totalDone), u: `/${totalAll}` },
          { k: '총 볼륨', v: totalVolume.toLocaleString(), u: 'kg' },
          { k: '소모', v: String(totalCalories), u: 'kcal' },
        ].map(s => (
          <div
            key={s.k}
            className="bg-bg-elev rounded-[14px] px-2.5 py-3 text-center"
            style={{ border: '1px solid var(--color-line)' }}
          >
            <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase">{s.k}</div>
            <div className="text-[22px] text-text font-medium tracking-[-0.6px] mt-1">
              {s.v}<span className="text-[10px] text-text-dim font-normal">{s.u}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>오늘의 루틴</SectionLabel>
      <div className="mx-5 flex flex-col gap-2.5">
        {plan.length === 0 ? (
          <Card className="text-center text-text-dim text-[12px]" pad={18}>
            세션 데이터가 없습니다. 운동 화면에서 시작해주세요.
          </Card>
        ) : (
          plan.map((ex, ei) => (
            <Card key={ei} pad={0}>
              <div className="px-4 py-3.5 border-b border-line flex items-center gap-2.5">
                <div className="flex-1">
                  <div className="text-[14px] text-text font-medium tracking-[-0.2px]">{ex.name}</div>
                  <div className="text-[11px] text-text-mid font-mono mt-0.5">{ex.target}</div>
                </div>
                <span className="text-[11px] text-text-dim font-mono">
                  {ex.done.filter(Boolean).length}/{ex.done.length}
                </span>
              </div>
              <div className="px-4 py-2.5 flex flex-col gap-1.5">
                {ex.done.map((d, si) => (
                  <div key={si} className="flex items-center gap-2.5 py-2">
                    <span className="w-7 text-[11px] text-text-dim font-mono">#{si + 1}</span>
                    <span
                      className={`flex-1 text-[13px] font-mono ${d ? 'text-text-mid line-through decoration-white/15' : 'text-text'}`}
                    >
                      {ex.weight}kg × {ex.reps}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSet(ei, si)}
                      className="w-7 h-7 rounded-lg cursor-pointer flex items-center justify-center transition-all"
                      style={{
                        border: `1.5px solid ${d ? 'var(--color-accent)' : 'var(--color-line-strong)'}`,
                        background: d ? 'var(--color-accent)' : 'transparent',
                        color: '#171309',
                      }}
                    >
                      {d && <Icon.check s={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
