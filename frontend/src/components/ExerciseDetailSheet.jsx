import { useEffect } from 'react';
import Icon from '../design/Icon';
import { Card } from '../design/primitives';

/** Extract per-session history for a given exercise id.
 *  Session sets are stored as {kg, reps} (Session.jsx:89, exerciseMaps.js:47).
 *  Cardio sessions (duration_min/calories_burned, no sets) are excluded. */
export function extractHistory(records, exerciseId) {
  const hist = [];
  for (const rec of records || []) {
    const exList = rec.exercises || [];
    for (const ex of exList) {
      if (ex.id !== exerciseId) continue;
      const sets = Array.isArray(ex.sets) ? ex.sets : null;
      if (!sets || sets.length === 0) continue;
      const maxKg = Math.max(0, ...sets.map(s => Number(s.kg) || 0));
      hist.push({
        date: rec.date,
        setsLabel: sets.map(s => `${s.kg ?? '?'}×${s.reps ?? '?'}`).join(' / '),
        maxKg,
      });
    }
  }
  return hist.slice(-10).reverse();
}

export function ExerciseDetailSheet({ exercise, records, onClose }) {
  useEffect(() => {
    if (!exercise) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [exercise, onClose]);

  useEffect(() => {
    if (!exercise) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [exercise]);

  if (!exercise) return null;

  const history = extractHistory(records, exercise.id);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full bg-bg-elev-2 border-t border-line rounded-t-2xl max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[15px] text-text font-medium tracking-[-0.3px]">{exercise.name}</div>
            <div className="text-[11px] text-text-dim font-mono mt-1 truncate">
              {(exercise.target || []).join(', ') || '—'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer text-text-dim text-[14px] flex items-center justify-center shrink-0"
            aria-label="닫기"
          >✕</button>
        </div>

        {/* Chart */}
        <div className="px-4">
          <Card pad={14}>
            <div className="flex justify-between mb-2">
              <span className="text-[11px] text-text-mid">최대 무게 추이</span>
              <span className="text-[10px] text-text-dim font-mono">{history.length}회</span>
            </div>
            <WeightTrendChart history={history} />
          </Card>
        </div>

        {/* History list */}
        <div className="px-4 pt-3 pb-2">
          <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase mb-2">최근 기록</div>
          {history.length === 0 ? (
            <Card className="text-center text-text-dim text-[12px]" pad={16}>기록 없음</Card>
          ) : (
            <Card pad={0}>
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 ${i === history.length - 1 ? '' : 'border-b border-line'}`}
                >
                  <span className="w-14 text-[10px] text-text-dim font-mono tracking-[0.3px]">
                    {h.date.slice(5)}
                  </span>
                  <span className="flex-1 text-[12px] text-text font-mono tracking-[-0.2px] truncate">
                    {h.setsLabel}
                  </span>
                  <span className="text-[11px] text-accent font-mono font-medium">
                    {h.maxKg}kg
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div className="h-3" />
      </div>
    </div>
  );
}

function WeightTrendChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <div className="h-[90px] flex items-center justify-center text-text-dim text-[11px] font-mono">
        {history.length === 0 ? '기록 없음' : '기록 부족'}
      </div>
    );
  }
  // Render oldest → newest for x-axis
  const data = [...history].reverse();
  const W = 400, H = 90;
  const pad = { l: 24, r: 8, t: 8, b: 16 };
  const kgs = data.map(d => d.maxKg);
  let min = Math.min(...kgs), max = Math.max(...kgs);
  const span = max - min || Math.max(1, max * 0.1);
  min -= span * 0.15;
  max += span * 0.15;

  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r));
  const ys = data.map(d => pad.t + (1 - (d.maxKg - min) / (max - min)) * (H - pad.t - pad.b));
  const path = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + ys[i].toFixed(1)).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: H }}>
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r="2.5" fill="var(--color-accent)" />
          {(i === 0 || i === data.length - 1) && (
            <text x={xs[i]} y={H - 4} textAnchor={i === 0 ? 'start' : 'end'} fontSize="9" fill="var(--color-text-dim)" fontFamily="monospace">
              {d.date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
