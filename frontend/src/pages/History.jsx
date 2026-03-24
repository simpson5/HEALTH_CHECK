import { useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { TabBar } from '../components/ui/Tabs';
import { DateNav } from '../components/ui/DateNav';
import { Badge } from '../components/ui/Badge';
import { getWeekRange, getDow, fmtDate, daysSince } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

const histTabs = [
  { id: 'daily', label: '일일' },
  { id: 'weekly', label: '주간분석' },
  { id: 'medication', label: '투약' },
  { id: 'drug', label: '약물농도' },
];

export function History() {
  const { data, loading } = useData();
  const [weekOffset, setWeekOffset] = useState(0);
  const [tab, setTab] = useState('daily');
  const [openReport, setOpenReport] = useState(null);

  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const week = getWeekRange(weekOffset);
  const isThisWeek = week.start <= new Date().toISOString().slice(0, 10) && new Date().toISOString().slice(0, 10) <= week.end;

  const moveWeek = (dir) => {
    if (weekOffset + dir > 0) return;
    setWeekOffset(weekOffset + dir);
  };

  // 일일 리포트
  const weekDailies = (data.daily_reports || [])
    .filter(r => r.date >= week.start && r.date <= week.end)
    .reverse();

  // 주간 분석
  const weekAnalysis = (data.weekly_analysis || [])
    .filter(w => (w.week_start >= week.start && w.week_start <= week.end) || (w.week_end >= week.start && w.week_end <= week.end));

  // 투약
  const weekMeds = (data.medication_records || [])
    .filter(r => r.date >= week.start && r.date <= week.end);

  // 약물 농도 차트
  const drugData = (() => {
    const meds = data.medication_records || [];
    if (meds.length === 0) return [];
    const halfLife = 5;
    const decayPerDay = Math.pow(0.5, 1 / halfLife);
    const startDate = new Date(data.profile.medication_start);
    const today = new Date();
    const totalDays = Math.floor((today - startDate) / 86400000) + 1;
    const doseMap = {};
    meds.forEach(m => { doseMap[m.date] = parseFloat(m.dose); });
    let conc = 0;
    const result = [];
    for (let d = 0; d < totalDays + 14; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().slice(0, 10);
      conc *= decayPerDay;
      if (doseMap[dateStr]) conc += doseMap[dateStr];
      result.push({ date: fmtDate(dateStr), conc: parseFloat(conc.toFixed(2)), isToday: d === totalDays - 1 });
    }
    return result;
  })();

  const scoreColor = (s) => {
    if (s === 'A') return 'text-success';
    if (s === 'B') return 'text-accent';
    if (s === 'C') return 'text-warning';
    return 'text-danger';
  };

  const weekLabel = `${week.start.slice(5).replace('-', '/')} ~ ${week.end.slice(5).replace('-', '/')}${isThisWeek ? ' (이번 주)' : ''}`;

  return (
    <div className="space-y-3">
      <DateNav label={weekLabel} onPrev={() => moveWeek(-1)} onNext={() => moveWeek(1)} />
      <TabBar tabs={histTabs} active={tab} onChange={setTab} />

      {tab === 'daily' && (
        weekDailies.length === 0 ? (
          <div className="text-center text-muted text-sm py-6">이 주 리포트 없음</div>
        ) : (
          weekDailies.map(r => {
            const isOpen = openReport === r.date;
            return (
              <Card key={r.date} onClick={() => setOpenReport(isOpen ? null : r.date)} className={'!p-0 overflow-hidden border-l-4 ' + (r.score==='A'?'border-l-success':r.score==='B'?'border-l-accent':r.score==='C'?'border-l-warning':'border-l-danger')}>
                <div className="flex items-center px-4 py-3 gap-2">
                  <div className="text-xs font-bold min-w-[75px]">{r.date.slice(5)} ({getDow(r.date)})</div>
                  <div className="flex gap-1 flex-1 flex-wrap">
                    <Badge color="warning">{r.diet_summary.total_calories}kcal</Badge>
                    <Badge color="accent">P{r.diet_summary.total_protein}g</Badge>
                  </div>
                  <div className={`text-sm font-black ${scoreColor(r.score)}`}>{r.score}</div>
                  {isOpen ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/[0.04]">
                    <div className="text-xs text-muted mt-3 mb-2 leading-relaxed">{r.analysis}</div>
                    {(r.highlights || []).map((h, i) => (
                      <div key={i} className="text-[11px] py-0.5">{h}</div>
                    ))}
                    <div className="text-[11px] text-accent mt-2 pt-2 border-t border-white/[0.04]">💡 {r.tomorrow_advice}</div>
                  </div>
                )}
              </Card>
            );
          })
        )
      )}

      {tab === 'weekly' && (
        weekAnalysis.length === 0 ? (
          <div className="text-center text-muted text-sm py-6">이 주 분석 없음</div>
        ) : (
          weekAnalysis.map((w, i) => (
            <Card key={i}>
              <CardTitle>{w.week_start} ~ {w.week_end}</CardTitle>
              <div className="text-xs mb-2">
                체중 {w.weight_change_kg > 0 ? '+' : ''}{w.weight_change_kg}kg
                {w.muscle_change_kg !== null && ` · 근육 ${w.muscle_change_kg > 0 ? '+' : ''}${w.muscle_change_kg}kg`}
                {w.fat_change_kg !== null && ` · 지방 ${w.fat_change_kg > 0 ? '+' : ''}${w.fat_change_kg}kg`}
              </div>
              <div className="text-xs text-muted mb-2">{w.analysis}</div>
              {(w.recommendations || []).map((r, ri) => (
                <div key={ri} className="text-[11px] text-muted/80 py-0.5">· {r}</div>
              ))}
            </Card>
          ))
        )
      )}

      {tab === 'medication' && (
        weekMeds.length === 0 ? (
          <div className="text-center text-muted text-sm py-6">이 주 투약 기록 없음</div>
        ) : (
          weekMeds.map((r, i) => (
            <Card key={i}>
              <div className="text-sm font-bold">💊 {r.date} — {r.dose}</div>
              <div className="text-[11px] text-muted mt-1">{r.change_reason}{r.side_effects ? ` · 부작용: ${r.side_effects}` : ''}</div>
            </Card>
          ))
        )
      )}

      {tab === 'drug' && drugData.length > 0 && (
        <Card>
          <div className="text-xs font-bold mb-1">💊 티르제파타이드 잔류량 예측</div>
          <div className="text-[10px] text-muted mb-3">반감기 5일 기준 · 매주 투약 시 누적</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drugData}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={v => v + 'mg'} />
                <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid #22223a', borderRadius: 8 }} formatter={v => [v + 'mg', '잔류량']} />
                <Line type="monotone" dataKey="conc" stroke="#00e5ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
