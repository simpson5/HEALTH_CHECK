// Weight / body-composition screen
const S = window.SH;

// Sample weight data — descending trend
const WEIGHT_DATA = (() => {
  const pts = [];
  const start = 113.1, end = 105.0;
  const days = 44;
  for (let i = 0; i <= days; i++) {
    const t = i / days;
    const ease = 1 - Math.pow(1 - t, 1.4);
    const noise = Math.sin(i * 1.3) * 0.35 + (Math.random() - 0.5) * 0.15;
    pts.push({ d: i, w: +(start + (end - start) * ease + noise).toFixed(2) });
  }
  return pts;
})();

function WeightScreen() {
  const [range, setRange] = React.useState('1M');
  const [metric, setMetric] = React.useState('weight');

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Hero number */}
      <div style={{ padding: '8px 20px 20px' }}>
        <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 1, textTransform: 'uppercase' }}>
          현재 체중
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 72, fontWeight: 300, fontFamily: S.fontSans, color: S.text, letterSpacing: -3, lineHeight: 1 }}>
            105<span style={{ fontSize: 36, color: S.textMid }}>.0</span>
          </span>
          <span style={{ fontSize: 18, color: S.textMid, marginLeft: 4 }}>kg</span>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, fontFamily: S.fontMono, fontSize: 12 }}>
          <span style={{ color: S.up, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon.arrow dir="down" s={11}/>8.1kg <span style={{ color: S.textDim, marginLeft: 2 }}>시작 대비</span>
          </span>
          <span style={{ color: S.textMid }}>▼ 0.18kg/일 평균</span>
        </div>
      </div>

      {/* Range tabs */}
      <div style={{ margin: '0 20px', display: 'flex', gap: 6, padding: 4, background: S.bgElev, borderRadius: 12 }}>
        {['1W','1M','3M','6M','전체'].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            flex: 1, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer',
            background: range === r ? S.bgElev3 : 'transparent',
            color: range === r ? S.text : S.textDim,
            fontSize: 12, fontFamily: S.fontSans, fontWeight: 500,
            transition: 'all .15s',
          }}>{r}</button>
        ))}
      </div>

      {/* Chart card */}
      <div style={{ margin: '14px 20px 0' }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <WeightChart data={WEIGHT_DATA}/>
          <div style={{ padding: '14px 18px', borderTop: `1px solid ${S.line}`, display: 'flex', justifyContent: 'space-between', fontFamily: S.fontMono, fontSize: 11, color: S.textDim }}>
            <span>113.1 <span style={{ opacity: .5 }}>시작</span></span>
            <span style={{ color: S.accent }}>105.0 <span style={{ opacity: .6 }}>현재</span></span>
            <span>80.0 <span style={{ opacity: .5 }}>목표</span></span>
          </div>
        </Card>
      </div>

      {/* Metric switcher */}
      <SectionLabel>체성분</SectionLabel>
      <div style={{ margin: '0 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MetricCard label="체지방률" value="45.1" unit="%" delta="-0.6" good/>
        <MetricCard label="골격근" value="33.6" unit="kg" delta="+0.2" good/>
        <MetricCard label="BMI" value="36.8" unit="" delta="-0.2" good/>
        <MetricCard label="기초대사" value="1647" unit="kcal" delta="+7"/>
      </div>

      {/* Body composition stacked bars */}
      <div style={{ margin: '16px 20px 0' }}>
        <Card pad={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: S.textMid, fontFamily: S.fontSans }}>근육 vs 지방 · 최근 4회</span>
            <span style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>인바디</span>
          </div>
          <BodyCompChart/>
        </Card>
      </div>

      {/* Last inbody summary */}
      <SectionLabel right={<span>4월 1일 측정</span>}>최근 인바디</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={0}>
          {[
            ['골격근', '33.6 kg', '▲ 0.2kg', S.up],
            ['체지방', '48.6 kg', '▼ 0.9kg', S.up],
            ['체수분', '44.2 kg', '▲ 0.3kg', S.up],
            ['단백질', '12.1 kg', '▲ 0.1kg', S.up],
            ['무기질',  '4.2 kg', '— 0.0kg', S.textMid],
          ].map(([k,v,d,c], i, a) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '14px 16px',
              borderBottom: i === a.length - 1 ? 'none' : `1px solid ${S.line}`,
            }}>
              <span style={{ fontSize: 14, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.2 }}>{k}</span>
              <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                <span style={{ fontFamily: S.fontMono, fontSize: 14, color: S.text, fontWeight: 500 }}>{v}</span>
                <span style={{ fontFamily: S.fontMono, fontSize: 11, color: c, width: 64, textAlign: 'right' }}>{d}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function WeightChart({ data }) {
  const W = 400, H = 180, pad = { l: 12, r: 12, t: 20, b: 14 };
  const min = 102, max = 114;
  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r));
  const ys = data.map(d => pad.t + (1 - (d.w - min) / (max - min)) * (H - pad.t - pad.b));
  const path = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + ys[i].toFixed(1)).join(' ');
  const area = path + ` L${xs[xs.length-1]} ${H - pad.b} L${xs[0]} ${H - pad.b} Z`;

  // target line at 80kg (would be off chart, use trend extension)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={S.accent} stopOpacity="0.28"/>
          <stop offset="100%" stopColor={S.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[108, 105, 102].map(v => {
        const y = pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4"/>
            <text x={W - pad.r - 2} y={y - 3} fill={S.textFaint} fontSize="9" fontFamily={S.fontMono} textAnchor="end">{v}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#wg)"/>
      <path d={path} fill="none" stroke={S.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* dots at weekly positions */}
      {xs.map((x, i) => i % 7 === 0 ? (
        <circle key={i} cx={x} cy={ys[i]} r="2" fill={S.bg} stroke={S.accent} strokeWidth="1.5"/>
      ) : null)}
      {/* current */}
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4" fill={S.accent}/>
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="8" fill={S.accent} opacity="0.2"/>
    </svg>
  );
}

function MetricCard({ label, value, unit, delta, good }) {
  const deltaColor = delta.startsWith('-') ? (good ? S.up : S.down)
                  : delta.startsWith('+') ? (good ? S.up : S.up)
                  : S.textDim;
  return (
    <Card pad={14}>
      <div style={{ fontSize: 10, color: S.textDim, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: S.fontMono }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 500, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.8 }}>{value}</span>
        <span style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: deltaColor, fontFamily: S.fontMono, marginTop: 2 }}>{delta}</div>
    </Card>
  );
}

function BodyCompChart() {
  const data = [
    { date: '3/11', muscle: 33.2, fat: 49.8 },
    { date: '3/18', muscle: 33.3, fat: 49.4 },
    { date: '3/25', muscle: 33.4, fat: 49.1 },
    { date: '4/01', muscle: 33.6, fat: 48.6 },
  ];
  const max = 85;
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 100 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
            <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
              <div style={{ height: `${d.muscle/max*100}%`, background: S.accent, borderRadius: '3px 3px 0 0' }}/>
              <div style={{ height: `${d.fat/max*100}%`, background: 'rgba(255,255,255,0.15)', borderRadius: '3px 3px 0 0' }}/>
            </div>
            <span style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono }}>{d.date}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontFamily: S.fontSans, fontSize: 11 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: S.textMid }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: S.accent }}/>골격근
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: S.textMid }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }}/>체지방
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { WeightScreen });
