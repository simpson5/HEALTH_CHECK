import { useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { TabBar } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { fmtDate } from '../lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const bodyTabs = [
  { id: 'fatpct', label: '체지방률' },
  { id: 'composition', label: '근육vs지방' },
  { id: 'bmi', label: 'BMI' },
  { id: 'bmr', label: '기초대사' },
];

export function Weight() {
  const { data, loading } = useData();
  const [bodyTab, setBodyTab] = useState('fatpct');
  const [selectedInbody, setSelectedInbody] = useState(null);

  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const p = data.profile;
  const wr = data.weight_records || [];
  const ir = data.inbody_records || [];
  const latest = wr.length ? wr[wr.length - 1] : null;
  const irDates = new Set(ir.map(r => r.date));

  // 체중 차트 데이터 + 7일 이동평균
  const weightData = wr.map((r, i) => {
    const slice = wr.slice(Math.max(0, i - 6), i + 1);
    const avg = slice.length >= 2 ? parseFloat((slice.reduce((s, x) => s + x.weight_kg, 0) / slice.length).toFixed(1)) : null;
    return {
      date: fmtDate(r.date),
      fullDate: r.date,
      weight: r.weight_kg,
      trend: avg,
      isInbody: irDates.has(r.date),
    };
  });

  // 선택된 인바디
  const showInbody = selectedInbody || (ir.length ? ir[ir.length - 1] : null);
  const showIdx = showInbody ? ir.indexOf(showInbody) : -1;
  const prevInbody = showIdx > 0 ? ir[showIdx - 1] : null;

  const changeColor = (val, good) => {
    if (val === null || val === undefined) return 'text-muted';
    if (good === 'down') return val < 0 ? 'text-success' : 'text-danger';
    if (good === 'up') return val > 0 ? 'text-success' : 'text-danger';
    return 'text-muted';
  };

  const changeText = (val) => {
    if (val === null || val === undefined) return '';
    return `${val < 0 ? '▼' : '▲'} ${Math.abs(val).toFixed(1)}`;
  };

  // 체성분 차트 데이터
  const irData = ir.map(r => ({ date: fmtDate(r.date), ...r }));

  return (
    <div className="space-y-3">
      {/* 현재 체중 */}
      <Card elevated>
        <CardTitle>현재 체중</CardTitle>
        <div className="font-display text-5xl tracking-tight leading-none">
          <span className="gradient-text">{latest ? latest.weight_kg : '--'}</span>
          <span className="text-base font-sans text-muted ml-1">kg</span>
        </div>
        <div className="text-[11px] text-muted mt-1">
          시작 {p.start_weight_kg}kg 대비 <span className="text-success font-bold">▼{latest ? (p.start_weight_kg - latest.weight_kg).toFixed(1) : '?'}kg</span>
        </div>
      </Card>

      {/* 체중 차트 */}
      <Card>
        <div className="text-xs font-bold mb-1">체중 변화</div>
        <div className="text-[10px] text-muted mb-3">
          시작 {p.start_weight_kg}kg → 현재 {latest ? latest.weight_kg : '?'}kg → 목표 {p.goal_weight_kg}kg
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} onClick={(e) => {
              if (e && e.activePayload) {
                const d = e.activePayload[0]?.payload;
                if (d?.isInbody) {
                  const found = ir.find(r => r.date === d.fullDate);
                  if (found) setSelectedInbody(found);
                }
              }
            }}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#555', fontSize: 10 }} tickFormatter={v => v + 'kg'} />
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #22223a', borderRadius: 8 }}
                labelStyle={{ color: '#888' }}
                formatter={(v, name, props) => {
                  const d = props.payload;
                  return [v + 'kg' + (d.isInbody ? ' 📋 인바디' : ''), '체중'];
                }}
              />
              <ReferenceLine y={p.goal_weight_kg} stroke="rgba(255,68,102,0.3)" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#00e5ff"
                strokeWidth={2}
                fill="rgba(0,229,255,0.06)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={props.key}
                      cx={cx} cy={cy}
                      r={payload.isInbody ? 6 : 4}
                      fill={payload.isInbody ? '#ffcc00' : '#00e5ff'}
                      stroke="none"
                    />
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls
                name="추세"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 체성분 차트 */}
      {ir.length >= 2 && (
        <>
          <div className="text-[11px] tracking-[2px] text-muted uppercase mt-4 mb-2">체성분 변화</div>
          <TabBar tabs={bodyTabs} active={bodyTab} onChange={setBodyTab} />

          <Card>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                {bodyTab === 'fatpct' ? (
                  <LineChart data={irData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={v => v + '%'} />
                    <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid #22223a', borderRadius: 8 }} />
                    <ReferenceLine y={25} stroke="rgba(0,255,136,0.3)" strokeDasharray="3 3" label={{ value: '목표 25%', fill: '#555', fontSize: 10 }} />
                    <Line type="monotone" dataKey="fat_pct" stroke="#ff8c00" strokeWidth={2} dot={{ r: 5, fill: '#ff8c00' }} name="체지방률(%)" />
                  </LineChart>
                ) : bodyTab === 'composition' ? (
                  <BarChart data={irData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={v => v + 'kg'} />
                    <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid #22223a', borderRadius: 8 }} />
                    <Bar dataKey="muscle_kg" fill="rgba(0,229,255,0.7)" radius={6} name="골격근(kg)" />
                    <Bar dataKey="fat_kg" fill="rgba(255,68,102,0.7)" radius={6} name="체지방(kg)" />
                  </BarChart>
                ) : bodyTab === 'bmi' ? (
                  <LineChart data={irData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid #22223a', borderRadius: 8 }} />
                    <ReferenceLine y={25} stroke="rgba(255,68,102,0.3)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="bmi" stroke="#b47fff" strokeWidth={2} dot={{ r: 5, fill: '#b47fff' }} name="BMI" />
                  </LineChart>
                ) : (
                  <LineChart data={irData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={v => v + 'kcal'} />
                    <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid #22223a', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="bmr_kcal" stroke="#00e5ff" strokeWidth={2} dot={{ r: 5, fill: '#00e5ff' }} name="기초대사량(kcal)" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      {/* 인바디 상세 */}
      {showInbody && (
        <>
          <div className="text-[11px] tracking-[2px] text-muted uppercase mt-4 mb-2">
            인바디 기록 <span className="text-accent normal-case tracking-normal">(차트에서 🟡 탭하면 전환)</span>
          </div>
          <Card elevated>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-bold">📋 {showInbody.date} (D+{showInbody.day_since_start})</div>
              <div className="font-display text-xl text-success">{showInbody.weight_kg}kg</div>
            </div>
            {showInbody.weight_change_kg !== null && (
              <div className="text-[11px] text-success mb-2">전 측정 대비 {showInbody.weight_change_kg}kg</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '골격근', val: showInbody.muscle_kg, unit: 'kg', change: showInbody.muscle_change_kg, good: 'up' },
                { label: '체지방', val: showInbody.fat_kg, unit: 'kg', change: showInbody.fat_change_kg, good: 'down' },
                { label: '체지방률', val: showInbody.fat_pct, unit: '%', change: prevInbody ? (showInbody.fat_pct - prevInbody.fat_pct).toFixed(1) : null, good: 'down' },
                { label: 'BMI', val: showInbody.bmi, unit: '', change: prevInbody ? (showInbody.bmi - prevInbody.bmi).toFixed(1) : null, good: 'down' },
                { label: '기초대사', val: showInbody.bmr_kcal, unit: 'kcal', change: prevInbody ? showInbody.bmr_kcal - prevInbody.bmr_kcal : null, good: 'up' },
                { label: '인바디점수', val: showInbody.inbody_score, unit: '점', change: prevInbody ? showInbody.inbody_score - prevInbody.inbody_score : null, good: 'up' },
              ].map((item, i) => (
                <div key={i} className="bg-bg-card rounded-xl p-3 border border-white/[0.04]">
                  <div className="text-[10px] text-muted tracking-[1px] mb-0.5">{item.label}</div>
                  <div className="font-display text-xl leading-none">{item.val}<span className="text-xs font-sans text-muted ml-0.5">{item.unit}</span></div>
                  {item.change !== null && (
                    <div className={`text-[11px] font-bold mt-1 ${changeColor(parseFloat(item.change), item.good)}`}>
                      {changeText(parseFloat(item.change))}{item.unit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
