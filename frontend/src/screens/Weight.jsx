import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, SectionLabel } from '../design/primitives';
import Icon from '../design/Icon';
import { fmtDate } from '../lib/utils';

const RANGES = [
  { key: '1W', days: 7 },
  { key: '1M', days: 30 },
  { key: '3M', days: 90 },
  { key: '6M', days: 180 },
  { key: '전체', days: 0 },
];

export function Weight() {
  const nav = useNavigate();
  const { data, loading } = useData();
  const [range, setRange] = useState('1M');
  if (loading || !data) return <LoadingScreen />;

  const profile = data.profile || {};
  const weightRecs = data.weight_records || [];
  const inbodyRecs = data.inbody_records || [];

  const latest = weightRecs[weightRecs.length - 1];
  const cur = latest ? latest.weight_kg : 0;
  const start = profile.start_weight_kg || 0;
  const goal = profile.goal_weight_kg || 0;
  const totalLost = start - cur;

  // Days since medication_start (used for avg lost per day)
  const startDate = profile.medication_start || (weightRecs[0]?.date);
  let daysElapsed = 1;
  if (startDate) {
    daysElapsed = Math.max(
      1,
      Math.round((new Date() - new Date(startDate)) / 86400000)
    );
  }
  const avgPerDay = daysElapsed > 0 ? totalLost / daysElapsed : 0;

  // Split int + decimal for hero number
  const curInt = Math.floor(cur);
  const curDec = (cur - curInt).toFixed(1).slice(1);

  // Filter range
  const rangeObj = RANGES.find(r => r.key === range) || RANGES[1];
  const rangeData = rangeObj.days === 0 ? weightRecs : weightRecs.slice(-rangeObj.days);

  // Inbody latest
  const lastInbody = inbodyRecs[inbodyRecs.length - 1];
  const lastInbodyDateLabel = lastInbody
    ? `${new Date(lastInbody.date).getMonth() + 1}월 ${new Date(lastInbody.date).getDate()}일 측정`
    : '측정 없음';

  return (
    <div className="pb-[100px]">
      {/* Hero number — design_handoff §5 WeightScreen */}
      <div className="px-5 pt-4 pb-2">
        <div className="text-[12px] text-text-mid font-medium">현재 체중</div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-[48px] font-bold text-text tracking-[-2px] leading-none">
            {cur.toFixed(1)}
          </span>
          <span className="text-[16px] text-text-mid font-medium ml-1">kg</span>
        </div>
        <div className="flex gap-3.5 mt-2.5 text-[11px] text-text-mid">
          <span className="inline-flex items-center gap-1">
            <span className="text-sage font-bold">▼ {totalLost.toFixed(1)}kg</span> 시작 대비
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="text-sage font-bold">▼ {Math.abs(avgPerDay).toFixed(2)}kg</span> /일 평균
          </span>
        </div>
      </div>

      {/* Range tabs — pill group */}
      <div className="mx-5 mt-3.5 flex gap-0.5 p-1 bg-surface-2 rounded-full">
        {RANGES.map(r => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={`flex-1 py-1.5 rounded-full border-none cursor-pointer text-[12px] transition-colors ${
              range === r.key ? 'bg-surface-3 text-text font-semibold' : 'bg-transparent text-text-mid font-medium'
            }`}
          >
            {r.key}
          </button>
        ))}
      </div>

      {/* Chart card */}
      <div className="mx-5 mt-3.5">
        <Card pad={18}>
          <WeightChart data={rangeData} range={range} goal={goal} />
          <div className="mt-3.5 flex justify-between font-mono text-[10px] text-text-dim">
            <span>{start.toFixed(1)} 시작</span>
            <span className="text-amber font-bold">{cur.toFixed(1)} 현재</span>
            <span>{goal.toFixed(1)} 목표</span>
          </div>
        </Card>
      </div>

      {/* AI insight chip — handoff §5 */}
      {inbodyRecs.length >= 2 && (
        <div className="mx-5 mt-3 px-3.5 py-3 rounded-[12px] bg-amber-soft border border-amber-line flex gap-3 items-start">
          <div className="text-amber font-bold text-[10px] mt-0.5 shrink-0 font-mono">분석</div>
          <div className="text-[12px] leading-relaxed text-text flex-1">
            {(() => {
              const muscleDelta = (() => {
                const recent = inbodyRecs.slice(-2);
                if (recent.length < 2) return 0;
                return (recent[1].muscle_kg ?? 0) - (recent[0].muscle_kg ?? 0);
              })();
              if (muscleDelta < -0.5) {
                return <><b className="text-coral">근손실 {Math.abs(muscleDelta).toFixed(1)}kg</b> 감지 — 단백질 110g 이상 유지하세요.</>;
              }
              if (avgPerDay > 0.05) {
                return <>현재 <b className="text-amber">월 {(avgPerDay * 30).toFixed(1)}kg</b> 감량 페이스. 무리하지 않게 유지해보세요.</>;
              }
              return <>최근 페이스 <b className="text-amber">안정적</b>. 단백질·운동 루틴을 그대로 이어가세요.</>;
            })()}
          </div>
        </div>
      )}

      {/* Metric switcher */}
      <SectionLabel>체성분</SectionLabel>
      <div className="mx-5 grid grid-cols-2 gap-2.5">
        <MetricCard
          label="체지방률"
          value={lastInbody?.fat_pct?.toFixed(1) ?? '--'}
          unit="%"
          delta={lastInbody ? deltaFmt(lastInbody.fat_change_kg, true) : '—'}
          good
        />
        <MetricCard
          label="골격근"
          value={lastInbody?.muscle_kg?.toFixed(1) ?? '--'}
          unit="kg"
          delta={lastInbody ? deltaFmt(lastInbody.muscle_change_kg, false) : '—'}
          good
        />
        <MetricCard
          label="BMI"
          value={lastInbody?.bmi?.toFixed(1) ?? '--'}
          unit=""
          delta={lastInbody ? deltaFmt(lastInbody.weight_change_kg, true) : '—'}
          good
        />
        <MetricCard
          label="기초대사"
          value={lastInbody?.bmr_kcal?.toFixed(0) ?? '--'}
          unit="kcal"
          delta="—"
        />
      </div>

      {/* Body composition stacked bars */}
      <div className="mx-5 mt-4">
        <Card pad={18}>
          <div className="flex justify-between mb-3.5">
            <span className="text-[12px] text-text-mid">근육 vs 지방 · 최근 {Math.min(inbodyRecs.length, 6)}회</span>
            <span className="text-[11px] text-text-dim font-mono">인바디</span>
          </div>
          <BodyCompChart recs={inbodyRecs.slice(-6)} />
        </Card>
      </div>

      {/* Inbody trend lines */}
      {inbodyRecs.length >= 2 && (
        <div className="mx-5 mt-2.5">
          <Card pad={18}>
            <div className="flex justify-between mb-3.5">
              <span className="text-[12px] text-text-mid">체지방률 · 골격근 추이</span>
              <span className="text-[11px] text-text-dim font-mono">{inbodyRecs.length}회</span>
            </div>
            <InbodyTrendChart recs={inbodyRecs} />
          </Card>
        </div>
      )}

      {/* Last inbody summary */}
      <SectionLabel
        right={
          lastInbody ? (
            <button
              type="button"
              onClick={() =>
                nav('/coach', {
                  state: {
                    initialQuestion:
                      `최근 인바디 결과를 해석해주세요. 체중 ${lastInbody.weight_kg}kg, 골격근 ${lastInbody.muscle_kg}kg, 체지방 ${lastInbody.fat_kg}kg, 체지방률 ${lastInbody.fat_pct}%, BMI ${lastInbody.bmi}, 인바디 점수 ${lastInbody.inbody_score}. 좋은 점과 개선점을 알려주세요.`,
                  },
                })
              }
              className="text-accent bg-transparent border-none cursor-pointer text-[11px] font-mono"
            >
              AI 해석 →
            </button>
          ) : <span>{lastInbodyDateLabel}</span>
        }
      >
        최근 인바디 {lastInbody && <span className="text-text-dim ml-1">· {lastInbodyDateLabel}</span>}
      </SectionLabel>
      <div className="mx-5">
        <Card pad={0}>
          {lastInbody
            ? [
                ['체중', `${lastInbody.weight_kg?.toFixed(1) ?? '--'} kg`, deltaFmt(lastInbody.weight_change_kg, true)],
                ['골격근', `${lastInbody.muscle_kg?.toFixed(1) ?? '--'} kg`, deltaFmt(lastInbody.muscle_change_kg, false)],
                ['체지방', `${lastInbody.fat_kg?.toFixed(1) ?? '--'} kg`, deltaFmt(lastInbody.fat_change_kg, true)],
                ['체지방률', `${lastInbody.fat_pct?.toFixed(1) ?? '--'} %`, '—'],
                ['BMI', `${lastInbody.bmi?.toFixed(1) ?? '--'}`, '—'],
                ['기초대사량', `${lastInbody.bmr_kcal ?? '--'} kcal`, '—'],
                ['내장지방', `레벨 ${lastInbody.visceral_fat_level ?? '--'}`, '—'],
                ['인바디 점수', `${lastInbody.inbody_score ?? '--'} 점`, '—'],
              ].map(([k, v, d], i, a) => (
                <div
                  key={k}
                  className={`flex justify-between items-baseline px-4 py-3.5 ${i === a.length - 1 ? '' : 'border-b border-line'}`}
                >
                  <span className="text-[14px] text-text tracking-[-0.2px]">{k}</span>
                  <div className="flex gap-3.5 items-baseline">
                    <span className="font-mono text-[14px] text-text font-medium">{v}</span>
                    <span className={`font-mono text-[11px] w-16 text-right ${deltaColorClass(d)}`}>{d}</span>
                  </div>
                </div>
              ))
            : <div className="px-4 py-6 text-center text-text-dim text-[12px]">인바디 기록 없음</div>}
        </Card>
      </div>

      {/* Full inbody history */}
      {inbodyRecs.length > 0 && (
        <>
          <SectionLabel right={<span>{inbodyRecs.length}회 측정</span>}>인바디 이력</SectionLabel>
          <div className="mx-5">
            <Card pad={0}>
              {[...inbodyRecs].reverse().map((r, i, a) => (
                <div
                  key={r.date}
                  className={`flex items-center gap-3 px-4 py-3 ${i === a.length - 1 ? '' : 'border-b border-line'}`}
                >
                  <div className="w-12 text-[11px] text-text-dim font-mono tracking-[0.3px]">
                    {String(new Date(r.date).getMonth() + 1).padStart(2, '0')}/{String(new Date(r.date).getDate()).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div>
                      <div className="text-text-dim">체중</div>
                      <div className="text-text">{r.weight_kg?.toFixed(1) ?? '--'}<span className="text-text-dim">kg</span></div>
                    </div>
                    <div>
                      <div className="text-text-dim">골격근</div>
                      <div className="text-text">{r.muscle_kg?.toFixed(1) ?? '--'}<span className="text-text-dim">kg</span></div>
                    </div>
                    <div>
                      <div className="text-text-dim">체지방률</div>
                      <div className="text-text">{r.fat_pct?.toFixed(1) ?? '--'}<span className="text-text-dim">%</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function deltaColorClass(d) {
  if (!d || d === '—' || d.startsWith('— ')) return 'text-text-dim';
  if (d.startsWith('▼')) return 'text-up';
  if (d.startsWith('▲')) return 'text-up';
  return 'text-text-mid';
}

function InbodyTrendChart({ recs }) {
  const W = 400, H = 120;
  const pad = { l: 36, r: 12, t: 12, b: 18 };

  const fatPcts = recs.map(r => r.fat_pct ?? null);
  const muscles = recs.map(r => r.muscle_kg ?? null);
  const validFat = fatPcts.filter(v => v != null);
  const validMus = muscles.filter(v => v != null);

  if (validFat.length < 2 && validMus.length < 2) {
    return <div className="h-[120px] flex items-center justify-center text-text-dim text-[11px] font-mono">데이터 부족</div>;
  }

  // Two separate y-axes: fat_pct (0~60), muscle_kg (auto-scaled)
  const fMin = 0, fMax = Math.max(60, Math.ceil(Math.max(...validFat) + 2));
  const mMin = Math.floor(Math.min(...validMus) - 2);
  const mMax = Math.ceil(Math.max(...validMus) + 2);

  const n = recs.length;
  const xs = recs.map((_, i) => pad.l + (i / (n - 1 || 1)) * (W - pad.l - pad.r));

  const fatY = v => pad.t + (1 - (v - fMin) / (fMax - fMin)) * (H - pad.t - pad.b);
  const musY = v => pad.t + (1 - (v - mMin) / (mMax - mMin || 1)) * (H - pad.t - pad.b);

  const fatPath = recs.map((r, i) => r.fat_pct == null ? '' : `${xs[i].toFixed(1)} ${fatY(r.fat_pct).toFixed(1)}`).filter(Boolean).map((p, i) => (i === 0 ? 'M' : 'L') + p).join(' ');
  const musPath = recs.map((r, i) => r.muscle_kg == null ? '' : `${xs[i].toFixed(1)} ${musY(r.muscle_kg).toFixed(1)}`).filter(Boolean).map((p, i) => (i === 0 ? 'M' : 'L') + p).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: H }}>
        {/* fat_pct line — slate (보조 데이터) */}
        <path d={fatPath} fill="none" stroke="var(--color-slate)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* muscle line — amber (주 시리즈) */}
        <path d={musPath} fill="none" stroke="var(--color-amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {recs.map((r, i) => (
          <g key={i}>
            {r.fat_pct != null && <circle cx={xs[i]} cy={fatY(r.fat_pct)} r="2.5" fill="var(--color-slate)" />}
            {r.muscle_kg != null && <circle cx={xs[i]} cy={musY(r.muscle_kg)} r="2.5" fill="var(--color-amber)" />}
          </g>
        ))}
        {recs.map((r, i) => (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--color-text-dim)" fontFamily="monospace">
            {fmtDate(r.date)}
          </text>
        ))}
      </svg>
      <div className="flex gap-3.5 mt-1.5 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-text-mid">
          <span className="w-2 h-2 rounded-full bg-amber" />골격근 kg
        </span>
        <span className="inline-flex items-center gap-1.5 text-text-mid">
          <span className="w-2 h-2 rounded-full bg-slate" />체지방률 %
        </span>
      </div>
    </div>
  );
}

function deltaFmt(delta, goodIsDecrease = true) {
  if (delta == null) return '—';
  const n = Number(delta);
  if (Math.abs(n) < 0.05) return '— 0.0';
  const sign = n < 0 ? '▼' : '▲';
  return `${sign} ${Math.abs(n).toFixed(1)}kg`;
}

function WeightChart({ data, range, goal }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-[140px] text-text-dim text-[11px] font-mono">
        데이터 부족
      </div>
    );
  }
  const W = 400, H = 160;
  const pad = { l: 12, r: 12, t: 14, b: 18 };
  const weights = data.map(r => r.weight_kg);
  let min = Math.min(...weights);
  let max = Math.max(...weights);
  // goal line(80kg) 항상 시각 영역에 포함 — design_handoff §6 19_weight_range
  if (goal) {
    min = Math.min(min, goal);
    max = Math.max(max, weights[0]);
  }
  const span = max - min || 1;
  min -= span * 0.08;
  max += span * 0.08;

  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r));
  const ys = data.map(r => pad.t + (1 - (r.weight_kg - min) / (max - min)) * (H - pad.t - pad.b));
  const goalY = goal ? pad.t + (1 - (goal - min) / (max - min)) * (H - pad.t - pad.b) : null;
  const path = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + ys[i].toFixed(1)).join(' ');
  const area = path + ` L${xs[xs.length - 1]} ${H - pad.b} L${xs[0]} ${H - pad.b} Z`;

  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: H }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-amber)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--color-amber)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* 목표 80kg 점선 (sage) — 항상 표시 */}
      {goalY != null && (
        <>
          <line x1={pad.l} y1={goalY} x2={W - pad.r} y2={goalY} stroke="var(--color-sage)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <text x={W - pad.r} y={goalY - 4} fontSize="9" fill="var(--color-sage)" textAnchor="end" fontFamily="monospace">목표 {goal}</text>
        </>
      )}
      <path d={area} fill="url(#wg)" />
      <path d={path} fill="none" stroke="var(--color-amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* dim dots (마지막 제외) */}
      {xs.map((x, i) => i === xs.length - 1 ? null : (
        <circle key={i} cx={x} cy={ys[i]} r="1.6" fill="var(--color-amber-dim)" opacity={i % Math.max(1, Math.floor(xs.length / 8)) === 0 ? 0.7 : 0} />
      ))}
      {/* 마지막 포인트 — amber 큰 점 + bg 테두리 */}
      <circle cx={lastX} cy={lastY} r="4" fill="var(--color-amber)" stroke="var(--color-bg)" strokeWidth="2" />
    </svg>
  );
}

function MetricCard({ label, value, unit, delta, good }) {
  const isDecrease = delta && delta.startsWith('▼');
  const isIncrease = delta && delta.startsWith('▲');
  // good=true(체지방·BMI): 감소가 좋음 / good=false(골격근): 증가가 좋음
  const goodChange = good ? isDecrease : isIncrease;
  const colorClass = goodChange ? 'text-sage' : (isDecrease || isIncrease ? 'text-coral' : 'text-text-dim');
  return (
    <Card pad={14}>
      <div className="text-[11px] text-text-mid font-medium">{label}</div>
      <div className="flex items-baseline gap-1 mt-1.5">
        <span className="text-[22px] font-bold text-text tracking-[-0.6px]">{value}</span>
        <span className="text-[11px] text-text-mid font-medium">{unit}</span>
      </div>
      <div className={`text-[11px] font-semibold mt-1.5 font-mono ${colorClass}`}>{delta}</div>
    </Card>
  );
}

function BodyCompChart({ recs }) {
  if (!recs || recs.length === 0) {
    return <div className="text-text-dim text-[11px] font-mono text-center py-4">인바디 데이터 없음</div>;
  }
  // design_handoff §5: 골격근 amber + 체지방 slate
  const max = 85;
  return (
    <div>
      <div className="flex gap-2 items-end h-[110px]">
        {recs.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
            <div className="flex-1 w-full flex flex-col justify-end gap-0.5">
              <div
                className="bg-amber rounded-t-[3px]"
                style={{ height: `${((d.muscle_kg || 0) / max) * 100}%` }}
              />
              <div
                className="bg-slate"
                style={{ height: `${((d.fat_kg || 0) / max) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-text-dim font-mono">{fmtDate(d.date)}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3.5 mt-3 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-text-mid">
          <span className="w-2 h-2 rounded-[2px] bg-amber" />골격근
        </span>
        <span className="inline-flex items-center gap-1.5 text-text-mid">
          <span className="w-2 h-2 rounded-[2px] bg-slate" />체지방
        </span>
      </div>
    </div>
  );
}
