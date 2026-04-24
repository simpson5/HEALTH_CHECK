import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, Chip, SectionLabel, TapBtn } from '../design/primitives';
import Icon from '../design/Icon';

function computeProteinTotal(mealPlan) {
  let lo = 0, hi = 0, any = false;
  for (const r of mealPlan || []) {
    const m = (r.protein || '').match(/(\d+(?:\.\d+)?)\s*(?:~\s*(\d+(?:\.\d+)?))?/);
    if (!m) continue;
    any = true;
    const a = parseFloat(m[1]);
    const b = m[2] ? parseFloat(m[2]) : a;
    lo += a; hi += b;
  }
  if (!any) return null;
  return lo === hi ? `${Math.round(lo)}g` : `${Math.round(lo)}~${Math.round(hi)}g`;
}

const TABS = ['하루일과', '식단', '운동', '식품도감', '로드맵'];

export function Guide() {
  const { data, loading } = useData();
  const [tab, setTab] = useState('하루일과');

  if (loading || !data) return <LoadingScreen />;

  const profile = data.profile || {};
  const weightRecs = data.weight_records || [];
  const cur = weightRecs.length > 0 ? weightRecs[weightRecs.length - 1].weight_kg : 0;
  const goal = profile.goal_weight_kg || 80;
  const proGoal = profile.daily_targets?.protein_g || 110;

  return (
    <div className="pb-[100px]">
      {/* Hero */}
      <div className="px-5 pt-3">
        <div className="text-[11px] text-accent font-mono tracking-[1.4px] uppercase">
          SIMPSON HEALTH PLAN
        </div>
        <div className="text-[28px] text-text font-medium mt-1.5 tracking-[-0.8px]">
          운동 &amp; 식단 가이드
        </div>
        <div className="text-[12px] text-text-mid mt-1.5">
          {cur.toFixed(1)}kg · 근손실 방지 · 마운자로 복용 중
        </div>
        <div className="flex gap-1.5 mt-2.5">
          <Chip label="목표" value={`${goal}kg`} color="var(--color-accent)" />
          <Chip label="단백질" value={`${proGoal}g/일`} color="var(--color-protein)" />
        </div>
      </div>

      {/* Tab pills */}
      <div className="px-5 pt-[18px] flex gap-1.5 overflow-x-auto nosb">
        {TABS.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 px-3.5 py-[7px] rounded-full cursor-pointer text-[12px] font-medium ${
              tab === t ? 'text-accent' : 'bg-transparent text-text-dim'
            }`}
            style={{
              border: tab === t ? '1px solid var(--color-accent-line)' : '1px solid var(--color-line)',
              background: tab === t ? 'var(--color-accent-soft)' : 'transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '하루일과' && <TabDailyRoutine data={data} />}
      {tab === '식단' && <TabMeal data={data} />}
      {tab === '운동' && <TabExercise data={data} />}
      {tab === '식품도감' && <TabFoods data={data} />}
      {tab === '로드맵' && <TabRoadmap />}
    </div>
  );
}

function TabDailyRoutine({ data }) {
  const exercise = data.profile?.exercise || {};
  const morning = exercise.daily_routine?.morning;
  const cardio = exercise.cardio;
  const evening = exercise.daily_routine?.evening;

  const items = [];
  if (morning) {
    items.push({ t: '오전', iconKey: 'sun', label: morning.name || '머신 6종', sub: morning.detail || '2세트 × 12~15회 · 30분', color: 'var(--color-accent)' });
  } else {
    items.push({ t: '오전', iconKey: 'sun', label: '머신 6종', sub: '2세트 × 12~15회 · 30분', color: 'var(--color-accent)' });
  }
  if (cardio) {
    items.push({ t: '오전', iconKey: 'dumbbell', label: cardio.name || '경사 트레드밀', sub: cardio.detail || '경사 12% · 속도 5.5km/h · 30분+', color: 'var(--color-info)' });
  } else {
    items.push({ t: '오전', iconKey: 'dumbbell', label: '경사 트레드밀', sub: '경사 12% · 속도 5.5km/h · 30분+', color: 'var(--color-info)' });
  }
  if (evening) {
    items.push({ t: '저녁', iconKey: 'bolt', label: evening.name || '케틀벨 스윙 인터벌', sub: evening.detail || '16kg · 30초 스윙/30초 휴식 × 10R', color: 'var(--color-protein)' });
  } else {
    items.push({ t: '저녁', iconKey: 'bolt', label: '케틀벨 스윙 인터벌', sub: '16kg · 30초 스윙/30초 휴식 × 10R', color: 'var(--color-protein)' });
  }

  return (
    <>
      <SectionLabel>하루 스케줄</SectionLabel>
      <div className="mx-5">
        <Card pad={0}>
          {items.map((x, i) => {
            const Ic = Icon[x.iconKey] || Icon.sun;
            return (
              <div
                key={i}
                className={`flex gap-3.5 px-4 py-3.5 items-center ${i === items.length - 1 ? '' : 'border-b border-line'}`}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: `${x.color}1a`, color: x.color }}
                >
                  <Ic s={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase">{x.t}</div>
                  <div className="text-[14px] text-text font-medium tracking-[-0.2px] mt-0.5">{x.label}</div>
                  <div className="text-[11px] text-text-dim font-mono mt-0.5">{x.sub}</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </>
  );
}

function TabMeal({ data }) {
  const nav = useNavigate();
  const mealPlan = data.profile?.meal_plan || [];
  const proteinTotal = computeProteinTotal(mealPlan);

  if (mealPlan.length === 0) {
    return (
      <>
        <SectionLabel>하루 식단</SectionLabel>
        <div className="mx-5">
          <Card pad={18} className="text-center">
            <div className="text-[12px] text-text-dim">식단 플랜 미설정</div>
            <div className="mt-3">
              <TapBtn variant="soft" onClick={() => nav('/settings')}>설정에서 추가 →</TapBtn>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionLabel right={proteinTotal ? <span className="text-protein">{proteinTotal}</span> : null}>
        하루 식단
      </SectionLabel>
      <div className="mx-5">
        <Card pad={0}>
          {mealPlan.map((row, i, a) => (
            <div
              key={i}
              className={`grid gap-3 items-center px-4 py-3.5 ${i === a.length - 1 ? '' : 'border-b border-line'}`}
              style={{ gridTemplateColumns: '50px 1fr auto' }}
            >
              <span className="text-[11px] text-text-dim font-mono tracking-[0.5px] uppercase">{row.meal}</span>
              <span className="text-[13px] text-text tracking-[-0.2px]">{row.food}</span>
              <span className="text-[12px] text-protein font-mono font-medium">{row.protein}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function TabExercise({ data }) {
  const strength = data.profile?.exercise?.strength || [];
  const cardio = data.profile?.exercise?.cardio;

  return (
    <>
      <SectionLabel>주요 운동</SectionLabel>
      <div className="mx-5">
        <Card pad={0}>
          {strength.length === 0 ? (
            <div className="px-4 py-6 text-center text-text-dim text-[12px]">등록된 주요 운동 없음</div>
          ) : (
            strength.map((ex, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3.5 ${i === strength.length - 1 ? '' : 'border-b border-line'}`}
              >
                <div className="w-9 h-9 rounded-[9px] bg-bg-elev-3 flex items-center justify-center text-text-mid">
                  <Icon.dumbbell s={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text tracking-[-0.2px]">{ex.name || ex}</div>
                  {ex.detail && <div className="text-[11px] text-text-dim font-mono mt-0.5">{ex.detail}</div>}
                </div>
                <Icon.chev dir="right" s={14} />
              </div>
            ))
          )}
        </Card>
      </div>

      {cardio && (
        <>
          <SectionLabel>유산소</SectionLabel>
          <div className="mx-5">
            <Card pad={14}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[9px] bg-bg-elev-3 flex items-center justify-center text-info">
                  <Icon.flame s={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text tracking-[-0.2px]">{cardio.name || '유산소 세션'}</div>
                  {cardio.detail && <div className="text-[11px] text-text-dim font-mono mt-0.5">{cardio.detail}</div>}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

function TabFoods({ data }) {
  const foods = data.frequent_foods || [];
  return (
    <>
      <SectionLabel right={<span>{foods.length}개</span>}>자주 먹는 음식</SectionLabel>
      <div className="mx-5">
        <Card pad={0}>
          {foods.length === 0 ? (
            <div className="px-4 py-6 text-center text-text-dim text-[12px]">등록된 음식 없음</div>
          ) : (
            foods.map((f, i) => (
              <div
                key={f.id}
                className={`px-4 py-3.5 flex items-start gap-3 ${i === foods.length - 1 ? '' : 'border-b border-line'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text tracking-[-0.2px]">{f.name}</div>
                  {f.description && <div className="text-[11px] text-text-dim font-mono mt-0.5">{f.description}</div>}
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <span className="text-[12px] text-text font-mono font-medium">{Math.round(f.calories_kcal || 0)}kcal</span>
                  <div className="flex gap-1">
                    <Chip label="P" value={`${Math.round(f.protein_g || 0)}g`} color="var(--color-protein)" />
                    <Chip label="C" value={`${Math.round(f.carbs_g || 0)}g`} color="var(--color-carb)" />
                    <Chip label="F" value={`${Math.round(f.fat_g || 0)}g`} color="var(--color-fat)" />
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </>
  );
}

function TabRoadmap() {
  const { data } = useData();
  const DOW_KR = ['일', '월', '화', '수', '목', '금', '토'];
  const profile = data?.profile || {};
  const weightRecs = data?.weight_records || [];
  const cur = weightRecs.length > 0 ? weightRecs[weightRecs.length - 1].weight_kg : null;
  const goal = profile.goal_weight_kg;

  let milestones = [];
  if (cur != null && goal != null && cur > goal) {
    const today = new Date();
    const remain = cur - goal;
    const pace = Math.max(0.5, Math.min(4, remain / 4));
    let prev = cur;
    for (let i = 1; i <= 4; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const target = Math.max(goal, +(prev - pace).toFixed(1));
      const deltaKg = Math.abs(+(target - prev).toFixed(1));
      const days = Math.max(0, Math.round((d - today) / 86400000));
      milestones.push({
        date: `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')} (${DOW_KR[d.getDay()]})`,
        weight: `${target.toFixed(1)}kg`,
        delta: `▼ ${deltaKg.toFixed(1)}kg`,
        d: `D-${days}`,
      });
      prev = target;
      if (target <= goal) break;
    }
  }

  return (
    <>
      <SectionLabel>다가오는 마일스톤</SectionLabel>
      <div className="mx-5 flex flex-col gap-2.5">
        {milestones.map((m, i) => (
          <Card key={i} pad={14}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-accent-soft text-accent flex items-center justify-center">
                <Icon.calendar s={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-text-dim font-mono tracking-[0.4px]">{m.date}</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[18px] text-text font-medium tracking-[-0.5px]">{m.weight}</span>
                  <span className="text-[11px] text-up font-mono">{m.delta}</span>
                </div>
              </div>
              <span className="text-[11px] text-text-dim font-mono">{m.d}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
