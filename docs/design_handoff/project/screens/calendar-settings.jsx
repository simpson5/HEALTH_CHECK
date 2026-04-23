// Calendar + Settings screens
const S = window.SH;

function CalendarScreen() {
  const [mode, setMode] = React.useState('월간');
  const today = 23;
  const weeks = [
    [null,null,null,1,2,3,4],
    [5,6,7,8,9,10,11],
    [12,13,14,15,16,17,18],
    [19,20,21,22,23,24,25],
    [26,27,28,29,30,null,null],
  ];
  // Per-day marks: workout(W), weight(S), meal(M)
  const marks = {
    1: ['W'], 2: ['S'], 3: ['M','W'], 4: ['S'],
    6: ['S','W'], 9: ['W'], 10: ['M'], 11: ['S'],
    13: ['S','W','M'], 16: ['W'], 17: ['M'],
    20: ['S','W'], 22: ['M'], 23: ['S','W','M'],
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Mode toggle */}
      <div style={{ padding: '8px 20px 0', display: 'flex', gap: 4, background: 'transparent' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: S.bgElev, borderRadius: 10 }}>
          {['월간','주간'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: mode === m ? S.bgElev3 : 'transparent',
              color: mode === m ? S.text : S.textDim,
              fontSize: 12, fontFamily: S.fontSans, fontWeight: 500,
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* Month header */}
      <div style={{ padding: '18px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <button style={{ background: 'transparent', border: 'none', color: S.textMid, cursor: 'pointer' }}>
          <Icon.chev dir="left" s={18}/>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 1 }}>2026</div>
          <div style={{ fontSize: 22, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.5, marginTop: 2 }}>4월</div>
        </div>
        <button style={{ background: 'transparent', border: 'none', color: S.textMid, cursor: 'pointer' }}>
          <Icon.chev dir="right" s={18}/>
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ margin: '0 20px' }}>
        <Card pad={12}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontFamily: S.fontSans }}>
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} style={{
                textAlign: 'center', fontSize: 10, color: i === 0 ? S.down : i === 6 ? S.info : S.textDim,
                fontFamily: S.fontMono, letterSpacing: 0.5, padding: '4px 0 8px',
              }}>{d}</div>
            ))}
            {weeks.flat().map((d, i) => {
              if (d === null) return <div key={i}/>;
              const isToday = d === today;
              const m = marks[d] || [];
              const dow = i % 7;
              return (
                <div key={i} style={{
                  aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '6px 0', borderRadius: 10, position: 'relative',
                  background: isToday ? S.accentSoft : 'transparent',
                  border: isToday ? `1px solid ${S.accentLine}` : '1px solid transparent',
                }}>
                  <span style={{
                    fontSize: 13, fontFamily: S.fontSans,
                    color: isToday ? S.accent : dow === 0 ? S.down : dow === 6 ? S.info : S.text,
                    fontWeight: isToday ? 600 : 400,
                  }}>{d}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {m.includes('S') && <span style={{ width: 4, height: 4, borderRadius: 999, background: S.accent }}/>}
                    {m.includes('W') && <span style={{ width: 4, height: 4, borderRadius: 999, background: S.info }}/>}
                    {m.includes('M') && <span style={{ width: 4, height: 4, borderRadius: 999, background: S.protein }}/>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${S.line}`, fontFamily: S.fontSans, fontSize: 10 }}>
            <Legend c={S.accent} l="체중"/>
            <Legend c={S.info} l="운동"/>
            <Legend c={S.protein} l="식단"/>
          </div>
        </Card>
      </div>

      {/* Upcoming milestones */}
      <SectionLabel>다가오는 마일스톤</SectionLabel>
      <div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          ['5/01', '금', '5월 목표', '104kg', '-4kg', 8],
          ['6/01', '월', '6월 목표', '100kg', '-4kg', 39],
          ['7/01', '수', '7월 목표',  '97kg', '-3kg', 69],
          ['8/01', '토', '8월 목표',  '94kg', '-3kg', 100],
        ].map(([date, dow, label, kg, delta, days]) => (
          <Card key={date} pad={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'center', minWidth: 52 }}>
                <div style={{ fontSize: 18, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.4 }}>{date}</div>
                <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono }}>{dow}요일</div>
              </div>
              <div style={{ width: 1, height: 32, background: S.line }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: S.textMid, fontFamily: S.fontSans, letterSpacing: -0.2 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 17, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.3 }}>{kg}</span>
                  <span style={{ fontSize: 11, color: S.up, fontFamily: S.fontMono }}>{delta}</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.3 }}>D-{days}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Legend({ c, l }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: S.textDim }}>
    <span style={{ width: 5, height: 5, borderRadius: 999, background: c }}/>{l}
  </span>;
}

// ── Settings ─────────────────────────────────────────────────
function SettingsScreen() {
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 1, textTransform: 'uppercase' }}>계정</div>
        <div style={{ fontSize: 22, color: S.text, fontFamily: S.fontSans, fontWeight: 500, marginTop: 4, letterSpacing: -0.5 }}>설정</div>
      </div>

      {/* Profile card */}
      <div style={{ margin: '18px 20px 0' }}>
        <Card pad={16}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999,
              background: `linear-gradient(135deg, ${S.accent}, ${S.protein})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#171309', fontSize: 22, fontFamily: S.fontSerif, fontWeight: 500,
            }}>이</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.3 }}>이현우</div>
              <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, marginTop: 2 }}>hwlee@gmail.com · D+45</div>
            </div>
            <Icon.chev s={16}/>
          </div>
        </Card>
      </div>

      {/* AI status */}
      <SectionLabel>AI 연결</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: S.up, boxShadow: `0 0 8px ${S.up}` }}/>
            <span style={{ fontSize: 13, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.2 }}>인증됨 · Claude Haiku 4.5</span>
            <div style={{ flex: 1 }}/>
            <span style={{ fontSize: 10, color: S.up, fontFamily: S.fontMono, letterSpacing: 0.5 }}>ACTIVE</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 10, borderTop: `1px solid ${S.line}` }}>
            {[['DB 기록','35건'],['사진','19개'],['AI 작업','127회']].map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.4, textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 16, color: S.text, fontFamily: S.fontSans, fontWeight: 500, marginTop: 3, letterSpacing: -0.3 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Preferences list */}
      <SectionLabel>환경설정</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={0}>
          {[
            ['목표 체중', '80 kg'],
            ['일일 단백질', '110 g'],
            ['일일 칼로리', '1500 kcal'],
            ['알림', '켜짐'],
            ['단위', '메트릭'],
            ['데이터 내보내기', 'CSV · JSON'],
          ].map(([k,v], i, a) => (
            <div key={k} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px',
              borderBottom: i === a.length-1 ? 'none' : `1px solid ${S.line}`,
            }}>
              <span style={{ flex: 1, fontSize: 13, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.2 }}>{k}</span>
              <span style={{ fontSize: 12, color: S.textMid, fontFamily: S.fontMono, marginRight: 8 }}>{v}</span>
              <Icon.chev s={14}/>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent AI activity */}
      <SectionLabel right={<span style={{ color: S.accent }}>전체 →</span>}>최근 AI 작업</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={0}>
          {[
            ['13:15', '식단 분석', '완료', '닥터유 쉐이크 + 두유'],
            ['12:40', '건강 상담', '완료', '운동 강도 조절 질문'],
            ['11:02', '식단 분석', '완료', '점심 김치찌개'],
            ['09:30', '일일 리포트', '완료', '전일 요약 생성'],
          ].map(([t,k,s,sub], i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: i === a.length-1 ? 'none' : `1px solid ${S.line}`,
            }}>
              <span style={{ width: 40, fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.3 }}>{t}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.2 }}>{k}</div>
                <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, marginTop: 2 }}>{sub}</div>
              </div>
              <span style={{ fontSize: 10, color: S.up, fontFamily: S.fontMono, letterSpacing: 0.3 }}>{s}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { CalendarScreen, SettingsScreen });
