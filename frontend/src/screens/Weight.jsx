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
      {/* Hero number */}
      <div className="px-5 pt-2 pb-5">
        <div className="text-[11px] text-text-dim font-mono tracking-[1px] uppercase">
          현재 체중
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-[72px] font-light text-text tracking-[-3px] leading-none">
            {curInt}<span className="text-[36px] text-text-mid">{curDec}</span>
          </span>
          <span className="text-[18px] text-text-mid ml-1">kg</span>
        </div>
        <div className="flex gap-3.5 mt-2.5 font-mono text-[12px]">
          <span className="text-up inline-flex items-center gap-1">
            <Icon.arrow dir="down" s={11} />
            {totalLost.toFixed(1)}kg <span className="text-text-dim ml-0.5">시작 대비</span>
          </span>
          <span className="text-text-mid">▼ {Math.abs(avgPerDay).toFixed(2)}kg/일 평균</span>
        </div>
      </div>

      {/* Range tabs */}
      <div className="mx-5 flex gap-1.5 p-1 bg-bg-elev rounded-[12px]">
        {RANGES.map(r => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={`flex-1 h-8 rounded-[9px] border-none cursor-pointer text-[12px] font-medium transition-all ${
              range === r.key ? 'bg-bg-elev-3 text-text' : 'bg-transparent text-text-dim'
            }`}
          >
            {r.key}
          </button>
        ))}
      </div>

      {/* Chart card */}
      <div className="mx-5 mt-3.5">
        <Card pad={0} className="overflow-hidden">
          <WeightChart data={rangeData} range={range} goal={goal} />
          <div className="px-[18px] py-3.5 border-t border-line flex justify-between font-mono text-[11px] text-text-dim">
            <span>{start.toFixed(1)} <span className="opacity-50">시작</span></span>
            <span className="text-accent">{cur.toFixed(1)} <span className="opacity-60">현재</span></span>
            <span>{goal.toFixed(1)} <span className="opacity-50">목표</span></span>
          </div>
        </Card>
      </div>

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
        {/* fat_pct line (red-ish / down color) */}
        <path d={fatPath} fill="none" stroke="var(--color-down)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* muscle line (accent) */}
        <path d={musPath} fill="none" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {recs.map((r, i) => (
          <g key={i}>
            {r.fat_pct != null && <circle cx={xs[i]} cy={fatY(r.fat_pct)} r="2.5" fill="var(--color-down)" />}
            {r.muscle_kg != null && <circle cx={xs[i]} cy={musY(r.muscle_kg)} r="2.5" fill="var(--color-accent)" />}
          </g>
        ))}
        {/* x-axis labels */}
        {recs.map((r, i) => (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--color-text-dim)" fontFamily="monospace">
            {fmtDate(r.date)}
          </text>
        ))}
      </svg>
      <div className="flex gap-3.5 mt-1.5 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-text-mid">
          <span className="w-2 h-2 rounded-full bg-down" />체지방률 %
        </span>
        <span className="inline-flex items-center gap-1.5 text-text-mid">
          <span className="w-2 h-2 rounded-full bg-accent" />골격근 kg
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
      <div className="flex items-center justify-center h-[180px] text-text-dim text-[11px] font-mono">
        데이터 부족
      </div>
    );
  }
  const W = 400, H = 180;
  const pad = { l: 12, r: 12, t: 20, b: 14 };
  const weights = data.map(r => r.weight_kg);
  let min = Math.min(...weights);
  let max = Math.max(...weights);
  if (range === '전체' && goal) {
    min = Math.min(min, goal);
    max = Math.max(max, goal);
  }
  // padding range
  const span = max - min || 1;
  min -= span * 0.1;
  max += span * 0.1;

  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r));
  const ys = data.map(r => pad.t + (1 - (r.weight_kg - min) / (max - min)) * (H - pad.t - pad.b));
  const path = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + ys[i].toFixed(1)).join(' ');
  const area = path + ` L${xs[xs.length - 1]} ${H - pad.b} L${xs[0]} ${H - pad.b} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: H }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#wg)" />
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (i % 7 === 0 ? (
        <circle key={i} cx={x} cy={ys[i]} r="2" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="1.5" />
      ) : null))}
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="4" fill="var(--color-accent)" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="8" fill="var(--color-accent)" opacity="0.2" />
    </svg>
  );
}

function MetricCard({ label, value, unit, delta, good }) {
  const colorClass = delta && delta.startsWith('▼') ? (good ? 'text-up' : 'text-down')
    : delta && delta.startsWith('▲') ? 'text-up'
    : 'text-text-dim';
  return (
    <Card pad={14}>
      <div className="text-[10px] text-text-dim tracking-[0.6px] uppercase font-mono">{label}</div>
      <div className="flex items-baseline gap-[3px] mt-1.5">
        <span className="text-[26px] font-medium text-text tracking-[-0.8px]">{value}</span>
        <span className="text-[11px] text-text-dim font-mono">{unit}</span>
      </div>
      <div className={`text-[11px] font-mono mt-0.5 ${colorClass}`}>{delta}</div>
    </Card>
  );
}

function BodyCompChart({ recs }) {
  if (!recs || recs.length === 0) {
    return <div className="text-text-dim text-[11px] font-mono text-center py-4">인바디 데이터 없음</div>;
  }
  const max = 85;
  return (
    <div>
      <div className="flex gap-2.5 items-end h-[100px]">
        {recs.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
            <div className="flex-1 w-full flex flex-col justify-end gap-0.5">
              <div
                className="bg-accent rounded-t-[3px]"
                style={{ height: `${((d.muscle_kg || 0) / max) * 100}%` }}
              />
              <div
                className="rounded-t-[3px]"
                style={{ height: `${((d.fat_kg || 0) / max) * 100}%`, background: 'rgba(255,255,255,0.15)' }}
              />
            </div>
            <span className="text-[10px] text-text-dim font-mono">{fmtDate(d.date)}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3.5 mt-2.5 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-text-mid">
          <span className="w-2 h-2 rounded-[2px] bg-accent" />골격근
        </span>
        <span className="inline-flex items-center gap-1.5 text-text-mid">
          <span className="w-2 h-2 rounded-[2px]" style={{ background: 'rgba(255,255,255,0.15)' }} />체지방
        </span>
      </div>
    </div>
  );
}
