import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { StatusLine } from '../layout/StatusLine';
import { Card, Ring, Bar, SectionLabel } from '../design/primitives';
import Icon from '../design/Icon';
import { getGreeting, buildTodayTimeline, getToday } from '../lib/utils';

export function Home() {
  const nav = useNavigate();
  const { data, loading } = useData();
  if (loading || !data) return <LoadingScreen />;

  const today = getToday();
  const profile = data.profile || {};
  const weightRecs = data.weight_records || [];
  const dietRecs = data.diet_records || [];
  const exerciseRecs = data.exercise_records || [];

  const latest = weightRecs[weightRecs.length - 1];
  const cur = latest ? latest.weight_kg : null;
  const start = profile.start_weight_kg;
  const goal = profile.goal_weight_kg;

  // Previous day delta (find the record from the day before `latest.date`)
  let prevDelta = null;
  if (latest) {
    const latestDate = new Date(latest.date);
    latestDate.setDate(latestDate.getDate() - 1);
    const prevDateStr = latestDate.toISOString().slice(0, 10);
    const prev = weightRecs.find(r => r.date === prevDateStr);
    if (prev) prevDelta = +(cur - prev.weight_kg).toFixed(1);
  }

  const pct = (cur != null && start && goal && start !== goal)
    ? Math.max(0, Math.min(1, (start - cur) / (start - goal)))
    : 0;
  const totalLost = cur != null && start ? (start - cur) : 0;
  const remainKg = cur != null && goal != null ? (cur - goal) : 0;
  const dDay = remainKg > 0 ? Math.round(remainKg / 0.9 * 7) : 0;

  // 반등 경고: 최근 14일 최저점 대비 현재가 +0.5kg 이상이면 표시
  const rebound = (() => {
    if (cur == null || weightRecs.length < 2) return null;
    const latestDate = new Date(latest.date);
    const cutoff = new Date(latestDate); cutoff.setDate(cutoff.getDate() - 14);
    const window = weightRecs.filter(r => new Date(r.date) >= cutoff);
    if (window.length < 2) return null;
    let lo = window[0];
    for (const r of window) if (r.weight_kg < lo.weight_kg) lo = r;
    const gain = +(cur - lo.weight_kg).toFixed(1);
    if (gain < 0.5) return null;   // 의미 있는 반등만
    const days = Math.max(1, Math.round((latestDate - new Date(lo.date)) / 86400000));
    return { gain, days, lowKg: lo.weight_kg };
  })();

  // Today macros
  const todayDiet = dietRecs.filter(r => r.date === today);
  const tPro = todayDiet.reduce((a, x) => a + (x.protein_g || 0), 0);
  const tCarb = todayDiet.reduce((a, x) => a + (x.carbs_g || 0), 0);
  const tFat = todayDiet.reduce((a, x) => a + (x.fat_g || 0), 0);
  const tCal = todayDiet.reduce((a, x) => a + (x.calories_kcal || 0), 0);
  const mealCount = new Set(todayDiet.map(r => r.meal_type)).size;

  const proGoal = profile.daily_targets?.protein_g || 110;
  const calGoal = profile.daily_targets?.calories_kcal || 1500;

  // Today checklist
  const todayExRecs = exerciseRecs.filter(r => r.date === today);
  const amDone = todayExRecs.some(r => (r.start_time || '') < '12:00');
  const pmDone = todayExRecs.some(r => (r.start_time || '') >= '17:00');
  const proOk = tPro >= proGoal;
  const calOk = tCal > 0 && tCal <= calGoal;

  const routine = profile.exercise?.daily_routine || {};
  const amName = routine.morning?.name || routine.morning?.description || '오전 운동';
  const amSub = routine.morning?.detail || routine.morning?.description || '운동 세션';
  const pmName = routine.evening?.name || routine.evening?.description || '저녁 운동';
  const pmSub = routine.evening?.detail || routine.evening?.description || '운동 세션';

  const todos = [
    { id: 'am', label: amName, sub: amSub, done: amDone },
    { id: 'pm', label: pmName, sub: pmSub, done: pmDone },
    {
      id: 'pr', label: `단백질 ${proGoal}g`,
      sub: `${Math.round(tPro)}g · ${Math.max(0, Math.round(proGoal - tPro))}g 남음`,
      done: proOk,
      progress: Math.min(1, tPro / proGoal),
    },
    { id: 'kc', label: `칼로리 ${calGoal} 이하`, sub: `${Math.round(tCal)} kcal`, done: calOk },
  ];
  const doneCount = todos.filter(t => t.done).length;

  // Timeline
  const events = buildTodayTimeline(data, today, 4);

  const now = new Date();
  const dateLabel = now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

  // ETA: 다이어트 시작 이후 전체 평균 페이스로 80kg 도달 예측
  // 단기(14일) 변동은 노이즈 많아서 사용 안 함 — 실제 체감 페이스와 맞춰줌
  const eta = (() => {
    if (start == null || cur == null || remainKg <= 0) return null;
    const startDateStr = profile.medication_start || weightRecs[0]?.date;
    if (!startDateStr) return null;

    const startDate = new Date(startDateStr);
    const latestDate = new Date(latest?.date || now);
    const daysElapsed = Math.max(1, Math.round((latestDate - startDate) / 86400000));
    const drop = start - cur;
    if (drop <= 0) return null;

    const pace = drop / daysElapsed;          // kg/day, 전체 평균
    const etaDays = Math.round(remainKg / pace);
    const etaDate = new Date(latestDate);
    etaDate.setDate(etaDate.getDate() + etaDays);
    const daysFromNow = Math.max(1, Math.round((etaDate - new Date(now.toISOString().slice(0, 10))) / 86400000));

    // 추세: 최근 14일 페이스 vs 전체 평균 → 가속/감속/유지
    let trend = null;
    const cutoff = new Date(latestDate); cutoff.setDate(cutoff.getDate() - 14);
    const recent = weightRecs.filter(r => new Date(r.date) >= cutoff);
    if (recent.length >= 2) {
      const rFirst = recent[0];
      const rDays = Math.max(1, Math.round((latestDate - new Date(rFirst.date)) / 86400000));
      const recentPace = (rFirst.weight_kg - cur) / rDays;
      if (recentPace > pace * 1.15) trend = 'up';        // 최근 더 빠름
      else if (recentPace < pace * 0.85) trend = 'down';  // 최근 느려짐/반등
    }

    const sameYear = etaDate.getFullYear() === now.getFullYear();
    const yearPrefix = sameYear ? '' : `${etaDate.getFullYear()}년 `;
    return {
      label: `${yearPrefix}${etaDate.getMonth() + 1}월 ${etaDate.getDate()}일경`,
      daysFromNow,
      paceLabel: `${pace.toFixed(2)}kg/일`,
      daysElapsed,
      trend,
    };
  })();

  return (
    <div className="pb-[100px]">
      {/* Greeting header — design_handoff §5 HomeScreen */}
      <div className="px-5 pt-4 pb-2">
        <div className="text-[12px] text-text-dim font-medium">
          {dateLabel}
        </div>
        <div className="text-[22px] font-bold text-text mt-1.5 tracking-[-0.4px]">
          {getGreeting(now)}이에요, <span className="text-amber">{profile.name || ''}</span>님
        </div>
      </div>

      <StatusLine data={data} />

      {/* 단식 진행 중 라이브 배지 */}
      <FastingBadge records={data.fasting_records || []} onClick={() => nav('/?tab=record')} />

      {/* Hero — weight progress (sage progress, amber 강조는 현재값만) */}
      <div className="mx-5 mt-[18px]">
        <Card pad={20} className="bg-surface">
          <div className="flex items-baseline justify-between">
            <div className="text-[12px] text-text-mid font-medium">현재 체중</div>
            <div className="text-[11px] text-text-faint font-mono">D-{dDay > 0 ? dDay : '—'}</div>
          </div>

          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[44px] font-bold text-text tracking-[-2px] leading-none">
              {cur != null ? cur.toFixed(1) : '--'}
            </span>
            <span className="text-[14px] text-text-mid font-medium">kg</span>
            <span className="flex-1" />
            <div className="text-right">
              <div className="text-[11px] text-sage font-semibold inline-flex items-center gap-1">
                <span>▼</span> {totalLost.toFixed(1)}kg 누적
              </div>
              {prevDelta != null && (
                <div className="text-[10px] text-text-dim mt-0.5">
                  어제보다 {prevDelta < 0 ? '▼' : prevDelta > 0 ? '▲' : ''} {Math.abs(prevDelta).toFixed(1)}kg
                </div>
              )}
            </div>
          </div>

          {/* 반등 경고 — 최근 최저점 대비 증가 (정직한 신호) */}
          {rebound && (
            <div className="mt-3 px-3 py-2 rounded-[8px] bg-coral-soft flex items-center gap-2">
              <span className="text-coral text-[12px]">▲</span>
              <span className="text-[11px] text-text leading-snug">
                최근 {rebound.days}일 <b className="text-coral">+{rebound.gain.toFixed(1)}kg</b>
                <span className="text-text-mid"> · 최저 {rebound.lowKg.toFixed(1)}kg에서 반등</span>
              </span>
            </div>
          )}

          {/* progress bar — sage */}
          <div className="mt-[18px]">
            <div className="relative h-2 rounded-full bg-surface-3 overflow-visible">
              <div
                className="absolute left-0 top-0 bottom-0 rounded-full"
                style={{
                  width: `${pct * 100}%`,
                  background: 'linear-gradient(90deg, var(--color-sage), #B0CD8A)',
                  transition: 'width .8s',
                }}
              />
              <div
                className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-sage"
                style={{
                  left: `${pct * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 3px var(--color-bg), 0 0 0 4px var(--color-sage)',
                }}
              />
            </div>
            <div className="flex justify-between mt-2 font-mono text-[10px] text-text-dim">
              <span>{start ?? '--'} 시작</span>
              <span className="text-sage font-semibold">
                {Math.round(pct * 100)}% 달성 · {remainKg.toFixed(1)}kg 남음
              </span>
              <span>{goal ?? '--'} 목표</span>
            </div>
          </div>

          {/* 도달 예상 chip — 전체 평균 페이스 기반 선형 추정 (실제 AI 아님) */}
          {eta && (
            <div className="mt-4 px-3 py-2.5 rounded-[8px] bg-amber-soft flex gap-2.5 items-start">
              <div className="text-amber font-bold text-[10px] mt-0.5 shrink-0 font-mono">예상</div>
              <div className="text-[12px] text-text leading-relaxed flex-1">
                평균 <span className="font-mono text-amber font-semibold">{eta.paceLabel}</span> 페이스로
                <b className="text-amber"> {eta.label}</b> {goal}kg 도달
                <span className="text-text-mid"> (D-{eta.daysFromNow})</span>
                {eta.trend === 'up' && <span className="text-sage font-semibold"> · 최근 가속 ▲</span>}
                {eta.trend === 'down' && <span className="text-coral font-semibold"> · 최근 둔화 ▼</span>}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Today checklist */}
      <SectionLabel right={<span>{doneCount}/{todos.length} 완료</span>}>오늘</SectionLabel>
      <div className="mx-5">
        <Card pad={0}>
          {todos.map((t, i) => (
            <TodoRow key={t.id} item={t} last={i === todos.length - 1} />
          ))}
        </Card>
      </div>

      {/* Macros summary */}
      <SectionLabel right={<span>오늘 · {mealCount}끼</span>}>영양</SectionLabel>
      <div className="mx-5">
        <Card pad={18}>
          <div className="flex gap-[18px] items-center">
            <Ring size={92} stroke={8} pct={tPro / proGoal} color="var(--color-protein)">
              <div className="text-center">
                <div className="text-[22px] font-medium text-text tracking-[-0.5px]">
                  {Math.round(tPro)}<span className="text-[11px] text-text-dim font-normal">g</span>
                </div>
                <div className="text-[9px] text-text-dim font-mono tracking-[0.5px] uppercase">단백질</div>
              </div>
            </Ring>
            <div className="flex-1 flex flex-col gap-3.5">
              <MacroRow label="탄수화물" value={tCarb} target={profile.daily_targets.carbs_g} color="var(--color-carb)" unit="g" />
              <MacroRow label="지방" value={tFat} target={profile.daily_targets.fat_g} color="var(--color-fat)" unit="g" />
              <MacroRow label="칼로리" value={tCal} target={calGoal} color="var(--color-accent)" unit="kcal" />
            </div>
          </div>
        </Card>
      </div>

      {/* AI shortcuts */}
      <SectionLabel>AI 기능</SectionLabel>
      <div className="mx-5 grid grid-cols-2 gap-2.5">
        <Card pad={14} onClick={() => nav('/coach')}>
          <div className="text-accent mb-2.5"><Icon.meal s={18} /></div>
          <div className="text-[13px] text-text font-medium tracking-[-0.2px]">건강 상담</div>
          <div className="text-[11px] text-text-dim font-mono mt-0.5">AI에게 질문</div>
        </Card>
        <Card pad={14} onClick={() => nav('/weekly-report')}>
          <div className="text-accent mb-2.5"><Icon.book s={18} /></div>
          <div className="text-[13px] text-text font-medium tracking-[-0.2px]">주간 리포트</div>
          <div className="text-[11px] text-text-dim font-mono mt-0.5">종합 분석</div>
        </Card>
      </div>

      {/* Today timeline */}
      <SectionLabel
        right={
          <button
            type="button"
            onClick={() => nav('/?tab=record')}
            className="text-accent bg-transparent border-none cursor-pointer text-[11px] font-mono"
          >
            모두 보기 →
          </button>
        }
      >
        오늘 기록
      </SectionLabel>
      <div className="mx-5">
        {events.length === 0 ? (
          <Card className="text-center text-text-dim text-[12px]" pad={18}>
            아직 오늘 기록이 없습니다
          </Card>
        ) : (
          <div className="relative pl-[18px]">
            <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-line-strong" />
            {events.map((ev, i) => (
              <TimelineItem key={i} ev={ev} last={i === events.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TodoRow({ item, last }) {
  const { label, sub, done, progress } = item;
  return (
    <div className={`flex items-center gap-3.5 px-4 py-3.5 ${last ? '' : 'border-b border-line'}`}>
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all"
        style={{
          background: done ? 'var(--color-sage)' : 'transparent',
          border: `1.6px solid ${done ? 'var(--color-sage)' : 'var(--color-border-hi)'}`,
          color: done ? '#0E0B07' : 'transparent',
        }}
      >
        {done && <Icon.check s={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] font-medium tracking-[-0.2px] ${done ? 'text-text-mid line-through decoration-white/20' : 'text-text'}`}
        >
          {label}
        </div>
        <div className="text-[11px] text-text-mid mt-0.5 font-mono">{sub}</div>
        {progress != null && (
          <div className="mt-1.5">
            <Bar pct={progress} color="var(--color-amber)" height={3} />
          </div>
        )}
      </div>
    </div>
  );
}

function FastingBadge({ records, onClick }) {
  const active = records.find(r => !r.end_at);
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, [active]);
  if (!active) return null;

  const elapsedMin = Math.max(0, Math.floor((Date.now() - new Date(active.start_at).getTime()) / 60_000));
  const hh = Math.floor(elapsedMin / 60);
  const mm = String(elapsedMin % 60).padStart(2, '0');
  const goal = active.goal_hours || null;
  const goalMin = goal ? goal * 60 : null;
  const pct = goalMin ? Math.min(1, elapsedMin / goalMin) : null;
  const reached = goalMin != null && elapsedMin >= goalMin;

  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-5 mt-2 w-[calc(100%-40px)] px-3.5 py-2.5 rounded-[12px] bg-amber-soft border border-amber-line flex items-center gap-3 cursor-pointer active:scale-[.99] transition-transform text-left"
    >
      <span className="text-[16px]">⏳</span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-text">
          단식 <b className="font-mono text-amber">{hh}:{mm}</b> 진행 중
          {goal && <span className="text-text-mid"> · 목표 {goal}h</span>}
        </div>
        {goalMin != null && (
          <div className="mt-1.5 h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: reached ? 'var(--color-sage)' : 'var(--color-amber)' }} />
          </div>
        )}
      </div>
      {reached
        ? <span className="text-[10px] text-sage font-bold shrink-0">목표 달성</span>
        : <Icon.chev s={14} className="text-text-faint shrink-0" />}
    </button>
  );
}

function MacroRow({ label, value, target, color, unit }) {
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  return (
    <div>
      <div className="flex justify-between mb-[5px] text-[12px]">
        <span className="text-text-mid tracking-[-0.2px]">{label}</span>
        <span className="text-text font-mono text-[11px]">
          <span className="font-semibold">{Math.round(value)}</span>
          <span className="text-text-dim"> / {target}{unit}</span>
        </span>
      </div>
      <Bar pct={pct} color={color} height={3} />
    </div>
  );
}

function TimelineItem({ ev, last }) {
  const { time, tag, title, meta, accent } = ev;
  return (
    <div className={`relative ${last ? '' : 'pb-[18px]'}`}>
      <div
        className={`absolute -left-[18px] top-1 w-[11px] h-[11px] rounded-full ${accent ? 'bg-accent' : 'bg-bg-elev-3'}`}
        style={{
          border: '2px solid var(--color-bg)',
          boxShadow: accent ? '0 0 0 3px rgba(245,165,36,0.13)' : 'none',
        }}
      />
      <div className="flex gap-2.5 items-baseline">
        <span className="font-mono text-[10px] text-text-dim tracking-[0.4px] w-9">{time}</span>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-mono tracking-[0.3px] ${accent ? 'bg-accent-soft text-accent' : 'text-text-mid'}`}
          style={accent ? undefined : { background: 'var(--color-surface-3)' }}
        >
          {tag}
        </span>
      </div>
      <div className="ml-[46px] mt-[3px] text-[13px] text-text tracking-[-0.3px]">{title}</div>
      <div className="ml-[46px] mt-0.5 text-[11px] text-text-dim font-mono">{meta}</div>
    </div>
  );
}
