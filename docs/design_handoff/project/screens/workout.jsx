// Workout screen + session flow
const S = window.SH;

function WorkoutScreen({ onStartSession }) {
  const [cat, setCat] = React.useState('머신');
  const [filter, setFilter] = React.useState('즐겨찾기');

  const weekly = { done: 3, goal: 4 };
  const lastRest = 17;

  const exerciseCats = ['머신', '맨몸', '유산소'];
  const filters = ['즐겨찾기', '상체 밀기', '상체 당기기', '하체', '코어'];

  const exercises = [
    { name: '머신 체스트 프레스', muscle: '가슴 · 어깨', last: '30kg × 12 × 3세트', fav: true },
    { name: '랫 풀다운',           muscle: '등 · 이두',   last: '35kg × 10 × 3세트', fav: true },
    { name: '머신 숄더 프레스',     muscle: '어깨 · 삼두', last: '30kg × 10 × 3세트', fav: true },
    { name: '레그 익스텐션',        muscle: '대퇴사두',    last: '25kg × 12 × 3세트', fav: true },
    { name: '레그 컬',              muscle: '햄스트링',    last: '20kg × 10 × 3세트', fav: true },
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Weekly ring */}
      <div style={{ padding: '12px 20px 0' }}>
        <Card pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Ring size={78} stroke={7} pct={weekly.done/weekly.goal} color={S.accent}>
              <div style={{ textAlign: 'center', fontFamily: S.fontSans }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: S.text, letterSpacing: -0.5 }}>{weekly.done}<span style={{ fontSize: 11, color: S.textDim, fontWeight: 400 }}>/{weekly.goal}</span></div>
              </div>
            </Ring>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.6, textTransform: 'uppercase' }}>이번 주</div>
              <div style={{ fontSize: 17, color: S.text, fontFamily: S.fontSans, fontWeight: 500, marginTop: 3, letterSpacing: -0.3 }}>1회 남음</div>
              <div style={{ fontSize: 11, color: S.down, fontFamily: S.fontMono, marginTop: 4 }}>
                {lastRest}일째 쉬는 중 · 오늘 해봐요
              </div>
            </div>
          </div>

          {/* week dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${S.line}` }}>
            {['월','화','수','목','금','토','일'].map((d, i) => {
              const states = ['done','done','rest','done','rest','today','future'];
              const st = states[i];
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: st === 'done' ? S.accent
                              : st === 'today' ? 'transparent'
                              : st === 'rest' ? 'rgba(255,255,255,0.04)'
                              : 'transparent',
                    border: st === 'today' ? `1.5px dashed ${S.accent}` : 'none',
                    color: st === 'done' ? '#171309' : S.textDim,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {st === 'done' && <Icon.check s={14}/>}
                    {st === 'today' && <span style={{ fontSize: 11, color: S.accent, fontFamily: S.fontMono }}>TODAY</span>}
                  </div>
                  <span style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono }}>{d}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Start session CTA */}
      <div style={{ margin: '14px 20px 0' }}>
        <button onClick={onStartSession} style={{
          width: '100%', height: 64, borderRadius: 18, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${S.accent} 0%, #F5C574 100%)`,
          color: '#171309', fontFamily: S.fontSans, fontSize: 17, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: `0 8px 24px ${S.accent}40`, letterSpacing: -0.4,
        }}>
          <Icon.play s={20}/>운동 시작
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10, fontFamily: S.fontMono, fontSize: 11, color: S.textDim }}>
          <span>오늘 · 2026-04-23</span>
          <span>·</span>
          <span>예상 45분</span>
        </div>
      </div>

      {/* Exercise catalog */}
      <SectionLabel>운동 가이드</SectionLabel>
      <div style={{ padding: '0 20px', display: 'flex', gap: 6 }}>
        {exerciseCats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: cat === c ? S.bgElev3 : 'transparent',
            color: cat === c ? S.text : S.textDim,
            fontSize: 12, fontFamily: S.fontSans, fontWeight: 500,
            border: cat === c ? 'none' : `1px solid ${S.line}`,
          }}>{c}</button>
        ))}
      </div>

      <div style={{ padding: '10px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: filter === f ? S.accentSoft : 'transparent',
            color: filter === f ? S.accent : S.textDim,
            fontSize: 11, fontFamily: S.fontSans, fontWeight: 500, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            {filter === f && <Icon.star s={11} fill={S.accent}/>}
            {f}
          </button>
        ))}
      </div>

      <div style={{ margin: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {exercises.map(ex => (
          <Card key={ex.name} pad={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: S.textMid,
              }}>
                <Icon.dumbbell s={18}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 14, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.2 }}>{ex.name}</span>
                  {ex.fav && <Icon.star s={11} fill={S.accent}/>}
                </div>
                <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontSans, marginTop: 2 }}>{ex.muscle}</div>
                <div style={{ fontSize: 11, color: S.accent, fontFamily: S.fontMono, marginTop: 4 }}>{ex.last}</div>
              </div>
              <button style={{
                width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', color: S.textMid,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.plus s={16}/>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Session in progress ──────────────────────────────────────
function SessionScreen({ onEnd }) {
  const [sec, setSec] = React.useState(842); // 14:02
  const [sets, setSets] = React.useState([
    { name: '머신 체스트 프레스', target: '30kg × 12', done: [true, true, false], weight: 30, reps: 12 },
    { name: '랫 풀다운',          target: '35kg × 10', done: [false, false, false], weight: 35, reps: 10 },
    { name: '머신 숄더 프레스',    target: '30kg × 10', done: [false, false, false], weight: 30, reps: 10 },
  ]);
  React.useEffect(() => {
    const t = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(sec/60)).padStart(2, '0');
  const ss = String(sec%60).padStart(2, '0');
  const totalDone = sets.flatMap(s => s.done).filter(Boolean).length;
  const totalAll = sets.flatMap(s => s.done).length;

  const toggleSet = (ei, si) => {
    setSets(prev => prev.map((e, i) => i === ei ? {
      ...e, done: e.done.map((d, j) => j === si ? !d : d)
    } : e));
  };

  return (
    <div style={{ paddingBottom: 120, position: 'relative' }}>
      {/* Top bar */}
      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onEnd} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: S.textMid, fontFamily: S.fontSans, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Icon.chev dir="left" s={16}/>종료
        </button>
        <div style={{ fontFamily: S.fontMono, fontSize: 11, color: S.textDim, letterSpacing: 0.5 }}>
          LIVE · <span style={{ color: S.accent }}>●</span>
        </div>
      </div>

      {/* Timer */}
      <div style={{ textAlign: 'center', padding: '20px 20px 8px' }}>
        <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          운동 시간
        </div>
        <div style={{ fontSize: 68, fontWeight: 200, fontFamily: S.fontSans, color: S.text, letterSpacing: -3, lineHeight: 1, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
          {mm}<span style={{ color: S.accent }}>:</span>{ss}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ margin: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { k: '완료', v: `${totalDone}`, u: `/${totalAll}` },
          { k: '총 볼륨', v: '1,080', u: 'kg' },
          { k: '소모', v: '184', u: 'kcal' },
        ].map(s => (
          <div key={s.k} style={{ background: S.bgElev, borderRadius: 14, padding: '12px 10px', textAlign: 'center', border: `1px solid ${S.line}` }}>
            <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.k}</div>
            <div style={{ fontSize: 22, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.6, marginTop: 4 }}>
              {s.v}<span style={{ fontSize: 10, color: S.textDim, fontWeight: 400 }}>{s.u}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>오늘의 루틴</SectionLabel>
      <div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sets.map((ex, ei) => (
          <Card key={ei} pad={0}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.2 }}>{ex.name}</div>
                <div style={{ fontSize: 11, color: S.textMid, fontFamily: S.fontMono, marginTop: 2 }}>{ex.target}</div>
              </div>
              <span style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>
                {ex.done.filter(Boolean).length}/{ex.done.length}
              </span>
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ex.done.map((d, si) => (
                <div key={si} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                }}>
                  <span style={{ width: 28, fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>#{si+1}</span>
                  <span style={{ flex: 1, fontSize: 13, color: d ? S.textMid : S.text, fontFamily: S.fontMono, textDecoration: d ? 'line-through' : 'none', textDecorationColor: 'rgba(255,255,255,0.15)' }}>
                    {ex.weight}kg × {ex.reps}
                  </span>
                  <button onClick={() => toggleSet(ei, si)} style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: `1.5px solid ${d ? S.accent : S.lineStrong}`,
                    background: d ? S.accent : 'transparent',
                    color: '#171309', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                    {d && <Icon.check s={16}/>}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { WorkoutScreen, SessionScreen });
