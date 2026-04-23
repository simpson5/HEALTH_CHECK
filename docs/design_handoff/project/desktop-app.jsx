// Desktop dashboard — wide layout with sidebar + grid
const S = window.SH;

function DesktopApp() {
  return (
    <div style={{
      width: '100%', height: '100%', background: S.bg, color: S.text,
      fontFamily: S.fontSans, display: 'flex', overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, borderRight: `1px solid ${S.line}`, padding: '22px 16px',
        display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px 18px' }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, background: S.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#171309', fontFamily: S.fontMono, fontWeight: 700, fontSize: 14,
          }}>S</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2 }}>Simpson</div>
            <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.5, marginTop: 1 }}>HEALTH · D+45</div>
          </div>
        </div>

        {[
          ['대시보드', Icon.home, true],
          ['식단', Icon.meal, false],
          ['체중 & 체성분', Icon.scale, false],
          ['운동', Icon.dumbbell, false],
          ['기록', Icon.pencil, false],
          ['달력', Icon.calendar, false],
          ['가이드', Icon.book, false],
        ].map(([l, Ic, a]) => (
          <div key={l} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
            background: a ? S.bgElev2 : 'transparent',
            color: a ? S.text : S.textMid, cursor: 'pointer',
            fontSize: 13, fontFamily: S.fontSans, letterSpacing: -0.2,
            border: a ? `1px solid ${S.line}` : '1px solid transparent',
          }}>
            <Ic s={16}/>
            <span>{l}</span>
            {a && <div style={{ flex: 1, textAlign: 'right', fontSize: 9, color: S.accent, fontFamily: S.fontMono }}>●</div>}
          </div>
        ))}

        <div style={{ marginTop: 20, padding: '0 10px 8px', fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          목표
        </div>
        <div style={{ padding: '10px 12px', background: S.bgElev, borderRadius: 10, border: `1px solid ${S.line}` }}>
          <div style={{ fontSize: 11, color: S.textMid, fontFamily: S.fontSans }}>목표 체중</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.4 }}>80</span>
            <span style={{ fontSize: 11, color: S.textDim }}>kg</span>
            <span style={{ fontSize: 10, color: S.accent, fontFamily: S.fontMono, marginLeft: 'auto' }}>24%</span>
          </div>
          <div style={{ marginTop: 8 }}><Bar pct={0.24} color={S.accent} height={3}/></div>
        </div>

        <div style={{ marginTop: 'auto', padding: '10px 10px 0', display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${S.line}` }}>
          <div style={{
            width: 28, height: 28, borderRadius: 999,
            background: `linear-gradient(135deg, ${S.accent}, ${S.protein})`,
            color: '#171309', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, fontFamily: S.fontSerif,
          }}>이</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: S.text, letterSpacing: -0.2 }}>이현우</div>
            <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono }}>Pro · AI 활성</div>
          </div>
          <Icon.gear s={15}/>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '22px 28px 40px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.6, margin: '3px 0 0' }}>
              좋은 아침이에요, <span style={{ color: S.accent }}>이현우</span>님
            </h1>
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px',
            background: S.bgElev, borderRadius: 10, border: `1px solid ${S.line}`,
            color: S.textMid,
          }}>
            <Icon.search s={14}/>
            <span style={{ fontSize: 12, fontFamily: S.fontSans }}>운동, 음식, 기록 검색</span>
            <span style={{ marginLeft: 20, fontSize: 10, color: S.textDim, fontFamily: S.fontMono, padding: '2px 6px', background: S.bgElev3, borderRadius: 4 }}>⌘K</span>
          </div>
          <TapBtn variant="accent" style={{ height: 36 }}><Icon.plus s={14}/>기록 추가</TapBtn>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
          <KPI label="현재 체중" value="105.0" unit="kg" delta="▼ 0.9kg 어제" good/>
          <KPI label="단백질" value="108" unit="/ 110 g" delta="▲ 98%" good/>
          <KPI label="칼로리" value="786" unit="kcal" delta="▼ 1500 이하" good/>
          <KPI label="연속 기록" value="9" unit="일" delta="최장 12일" accent/>
        </div>

        {/* Big chart + side panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 18 }}>
          <Card pad={20}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <h2 style={{ fontSize: 14, fontWeight: 500, margin: 0, letterSpacing: -0.2 }}>체중 변화</h2>
              <span style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>113.1 → 105.0 → 80kg</span>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', gap: 4, padding: 3, background: S.bg, borderRadius: 8 }}>
                {['1W','1M','3M','전체'].map((r, i) => (
                  <button key={r} style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: i === 1 ? S.bgElev3 : 'transparent',
                    color: i === 1 ? S.text : S.textDim,
                    fontSize: 11, fontFamily: S.fontSans,
                  }}>{r}</button>
                ))}
              </div>
            </div>
            <WeightChartD data={WEIGHT_DATA}/>
          </Card>

          <Card pad={20}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 500, margin: 0, letterSpacing: -0.2 }}>오늘</h2>
              <span style={{ fontSize: 11, color: S.accent, fontFamily: S.fontMono }}>2/4 완료</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['오전 운동 · 머신 6종', true],
                ['저녁 운동 · 케틀벨', false],
                ['단백질 110g', false, '108g'],
                ['칼로리 1500 이하', true, '786'],
              ].map(([l, d, v], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    border: `1.5px solid ${d ? S.accent : S.lineStrong}`,
                    background: d ? S.accent : 'transparent',
                    color: '#171309',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{d && <Icon.check s={12}/>}</div>
                  <span style={{ flex: 1, fontSize: 12, color: d ? S.textMid : S.text, letterSpacing: -0.2, textDecoration: d ? 'line-through' : 'none', textDecorationColor: 'rgba(255,255,255,0.15)' }}>{l}</span>
                  {v && <span style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono }}>{v}</span>}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${S.line}` }}>
              <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>다음 세션</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: S.accentSoft, color: S.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.dumbbell s={15}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, letterSpacing: -0.2 }}>케틀벨 스윙 인터벌</div>
                  <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono }}>저녁 · 16kg · 10R · 20분</div>
                </div>
                <TapBtn variant="soft" style={{ height: 28, fontSize: 11, padding: '0 10px' }}>시작</TapBtn>
              </div>
            </div>
          </Card>
        </div>

        {/* Macros + body comp */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
          <Card pad={18}>
            <h2 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 14px', letterSpacing: -0.2 }}>오늘 영양</h2>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Ring size={72} stroke={7} pct={108/110} color={S.protein}>
                <div style={{ fontSize: 16, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.3 }}>108<span style={{ fontSize: 9, color: S.textDim }}>g</span></div>
              </Ring>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <MacroRow label="단백질" value={108} target={110} color={S.protein} unit="g"/>
                <MacroRow label="탄수" value={49.5} target={180} color={S.carb} unit="g"/>
                <MacroRow label="지방" value={24.3} target={60} color={S.fat} unit="g"/>
              </div>
            </div>
          </Card>

          <Card pad={18}>
            <h2 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 14px', letterSpacing: -0.2 }}>체성분 변화</h2>
            <BodyCompChart/>
          </Card>

          <Card pad={18}>
            <h2 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 14px', letterSpacing: -0.2 }}>이번 주 활동</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Ring size={72} stroke={7} pct={3/4} color={S.accent}>
                <div style={{ fontSize: 16, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.3 }}>3<span style={{ fontSize: 9, color: S.textDim }}>/4</span></div>
              </Ring>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['월','화','수','목','금','토','일'].map((d, i) => {
                  const states = ['done','done','rest','done','rest','today','future'];
                  const st = states[i];
                  return (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 14, fontSize: 10, color: S.textDim, fontFamily: S.fontMono }}>{d}</span>
                      <div style={{ flex: 1, height: 8, background: S.bg, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: st === 'done' ? '100%' : st === 'today' ? '0%' : '0%',
                          height: '100%',
                          background: st === 'done' ? S.accent : 'transparent',
                        }}/>
                      </div>
                      <span style={{ width: 30, fontSize: 9, color: S.textDim, fontFamily: S.fontMono, textAlign: 'right' }}>
                        {st === 'done' ? '45분' : st === 'today' ? 'TODAY' : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent activity table */}
        <Card pad={0}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'baseline', gap: 10, borderBottom: `1px solid ${S.line}` }}>
            <h2 style={{ fontSize: 14, fontWeight: 500, margin: 0, letterSpacing: -0.2 }}>최근 기록</h2>
            <span style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>최근 24시간 · 12건</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: S.fontSans }}>
            <thead>
              <tr style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                <th style={{ textAlign: 'left', padding: '10px 20px', fontWeight: 400 }}>시각</th>
                <th style={{ textAlign: 'left', padding: '10px 0', fontWeight: 400 }}>유형</th>
                <th style={{ textAlign: 'left', padding: '10px 0', fontWeight: 400 }}>항목</th>
                <th style={{ textAlign: 'right', padding: '10px 0', fontWeight: 400 }}>수치</th>
                <th style={{ textAlign: 'right', padding: '10px 20px', fontWeight: 400 }}>메모</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['13:15', '식단', '닥터유 쉐이크 + 매일두유', '262 kcal', 'P36g C16.5g F8.1g', S.protein],
                ['11:40', '운동', '머신 체스트 프레스', '30kg × 36회', '3세트 · 2분 휴식', S.info],
                ['09:02', '체중', '105.0 kg', '▼ 0.9kg', '어제 대비', S.accent],
                ['08:30', '투약', '마운자로 5mg', '주 1회', '다음 주 증량', S.fat],
                ['08:10', '식단', '고구마 1개', '128 kcal', 'P2.3g C30g', S.protein],
              ].map((row, i, a) => (
                <tr key={i} style={{ fontSize: 12, borderBottom: i === a.length - 1 ? 'none' : `1px solid ${S.line}` }}>
                  <td style={{ padding: '13px 20px', color: S.textDim, fontFamily: S.fontMono }}>{row[0]}</td>
                  <td style={{ padding: '13px 0' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 6, background: `${row[5]}1a`, color: row[5], fontSize: 10, fontFamily: S.fontMono, letterSpacing: 0.3 }}>{row[1]}</span>
                  </td>
                  <td style={{ padding: '13px 0', color: S.text, letterSpacing: -0.2 }}>{row[2]}</td>
                  <td style={{ padding: '13px 0', color: S.text, fontFamily: S.fontMono, textAlign: 'right' }}>{row[3]}</td>
                  <td style={{ padding: '13px 20px', color: S.textDim, fontFamily: S.fontMono, fontSize: 11, textAlign: 'right' }}>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}

function KPI({ label, value, unit, delta, good, accent }) {
  return (
    <Card pad={16}>
      <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 500, color: accent ? S.accent : S.text, fontFamily: S.fontSans, letterSpacing: -0.8 }}>{value}</span>
        <span style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: good ? S.up : S.textMid, fontFamily: S.fontMono, marginTop: 4 }}>{delta}</div>
    </Card>
  );
}

function WeightChartD({ data }) {
  const W = 700, H = 220, pad = { l: 20, r: 20, t: 20, b: 20 };
  const min = 102, max = 114;
  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r));
  const ys = data.map(d => pad.t + (1 - (d.w - min) / (max - min)) * (H - pad.t - pad.b));
  const path = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + ys[i].toFixed(1)).join(' ');
  const area = path + ` L${xs[xs.length-1]} ${H - pad.b} L${xs[0]} ${H - pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
      <defs>
        <linearGradient id="wgd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={S.accent} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={S.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[112, 108, 104].map(v => {
        const y = pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4"/>
            <text x={pad.l + 2} y={y - 3} fill={S.textFaint} fontSize="10" fontFamily={S.fontMono}>{v}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#wgd)"/>
      <path d={path} fill="none" stroke={S.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x, i) => i % 7 === 0 ? (
        <circle key={i} cx={x} cy={ys[i]} r="2.5" fill={S.bg} stroke={S.accent} strokeWidth="1.5"/>
      ) : null)}
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="5" fill={S.accent}/>
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="10" fill={S.accent} opacity="0.2"/>
    </svg>
  );
}

Object.assign(window, { DesktopApp });
