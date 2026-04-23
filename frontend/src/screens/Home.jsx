import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { StatusLine } from '../layout/StatusLine';
import { Card, Ring, Bar, SectionLabel } from '../design/primitives';
import Icon from '../design/Icon';
import { getGreeting, buildTodayTimeline, getToday } from '../lib/utils';

export function Home() {
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

  const todos = [
    { id: 'am', label: '오전 운동', sub: '머신 6종 · 30분', done: amDone },
    { id: 'pm', label: '저녁 운동', sub: '케틀벨 · 10R', done: pmDone },
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

  return (
    <div className="pb-[100px]">
      {/* Greeting header */}
      <div className="px-5 pt-3 pb-1">
        <div className="text-[12px] text-text-dim tracking-[0.5px] uppercase font-mono">
          {dateLabel}
        </div>
        <div className="text-[22px] font-medium text-text mt-1 tracking-[-0.6px]">
          {getGreeting(now)}이에요, <span className="text-accent">{profile.name || ''}</span>님
        </div>
      </div>

      <StatusLine data={data} />

      {/* Hero — weight progress */}
      <div className="mx-5 mt-[18px]">
        <Card
          pad={20}
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(165deg, var(--color-bg-elev-2) 0%, var(--color-bg-elev) 100%)' }}
        >
          {/* decorative arcs */}
          <svg width="240" height="240" viewBox="0 0 240 240" className="absolute -right-20 -top-20 opacity-[0.14]">
            <circle cx="120" cy="120" r="100" fill="none" stroke="var(--color-accent)" strokeWidth="1" />
            <circle cx="120" cy="120" r="70" fill="none" stroke="var(--color-accent)" strokeWidth="1" />
            <circle cx="120" cy="120" r="40" fill="none" stroke="var(--color-accent)" strokeWidth="1" />
          </svg>

          <div className="flex items-start justify-between relative">
            <div>
              <div className="text-[11px] text-text-dim tracking-[1px] uppercase font-mono">
                현재 체중
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-[64px] font-light text-text tracking-[-2.5px] leading-none">
                  {cur != null ? cur.toFixed(1) : '--'}
                </span>
                <span className="text-[18px] text-text-mid font-normal">kg</span>
              </div>
              <div className="flex gap-2.5 mt-2.5 font-mono text-[12px]">
                {prevDelta != null && (
                  <>
                    <span
                      className={`inline-flex items-center gap-1 ${prevDelta < 0 ? 'text-up' : prevDelta > 0 ? 'text-down' : 'text-text-mid'}`}
                    >
                      <Icon.arrow dir={prevDelta < 0 ? 'down' : 'up'} s={11} />
                      {Math.abs(prevDelta).toFixed(1)}kg 전일
                    </span>
                    <span className="text-text-dim">/</span>
                  </>
                )}
                <span className="text-text-mid">
                  총 ▼{totalLost.toFixed(1)}kg
                </span>
              </div>
            </div>

            <div className="text-right relative">
              <div className="text-[11px] text-text-dim tracking-[1px] uppercase font-mono">
                목표까지
              </div>
              <div className="text-[28px] font-normal text-text tracking-[-0.8px] mt-1.5">
                {remainKg.toFixed(0)}<span className="text-[14px] text-text-dim font-normal">kg</span>
              </div>
              <div className="mt-2 text-[11px] text-text-mid font-mono">
                예상 D-{dDay}일
              </div>
            </div>
          </div>

          {/* progress bar w/ milestones */}
          <div className="mt-[22px]">
            <div className="relative h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="absolute left-0 top-0 bottom-0 rounded-full"
                style={{
                  width: `${pct * 100}%`,
                  background: 'linear-gradient(90deg, var(--color-accent), #F5C574)',
                  transition: 'width .8s',
                }}
              />
              {[0.25, 0.5, 0.75].map(m => (
                <div
                  key={m}
                  className="absolute -top-[3px] -bottom-[3px] w-px"
                  style={{ left: `${m * 100}%`, background: 'rgba(255,255,255,0.2)' }}
                />
              ))}
              <div
                className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-accent"
                style={{
                  left: `${pct * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 3px var(--color-bg), 0 0 12px rgba(245,165,36,0.53)',
                }}
              />
            </div>
            <div className="flex justify-between mt-2.5 font-mono text-[10px] text-text-dim tracking-[0.2px]">
              <span>{start ?? '--'}<span className="opacity-60">kg</span> 시작</span>
              <span className="text-accent font-semibold">{Math.round(pct * 100)}% 달성</span>
              <span>{goal ?? '--'}<span className="opacity-60">kg</span> 목표</span>
            </div>
          </div>
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
              <MacroRow label="탄수화물" value={tCarb} target={180} color="var(--color-carb)" unit="g" />
              <MacroRow label="지방" value={tFat} target={60} color="var(--color-fat)" unit="g" />
              <MacroRow label="칼로리" value={tCal} target={calGoal} color="var(--color-accent)" unit="kcal" />
            </div>
          </div>
        </Card>
      </div>

      {/* Today timeline */}
      <SectionLabel right={<span className="text-accent text-[11px]">모두 보기 →</span>}>
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
        className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center shrink-0 transition-all ${done ? 'bg-accent' : ''}`}
        style={{
          border: `1.5px solid ${done ? 'var(--color-accent)' : 'var(--color-line-strong)'}`,
          color: '#171309',
        }}
      >
        {done && <Icon.check s={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-[14px] font-medium tracking-[-0.3px] ${done ? 'text-text-mid line-through decoration-white/20' : 'text-text'}`}
        >
          {label}
        </div>
        <div className="text-[11px] text-text-dim mt-0.5 font-mono">{sub}</div>
        {progress != null && (
          <div className="mt-1.5">
            <Bar pct={progress} color="var(--color-accent)" height={2} />
          </div>
        )}
      </div>
    </div>
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
          style={accent ? undefined : { background: 'rgba(255,255,255,0.06)' }}
        >
          {tag}
        </span>
      </div>
      <div className="ml-[46px] mt-[3px] text-[13px] text-text tracking-[-0.3px]">{title}</div>
      <div className="ml-[46px] mt-0.5 text-[11px] text-text-dim font-mono">{meta}</div>
    </div>
  );
}
