// Home dashboard screen
const S = window.SH;

function HomeScreen({ onNav }) {
  const [greet, setGreet] = React.useState('');
  React.useEffect(() => {
    const h = new Date().getHours();
    setGreet(h < 5 ? '편안한 밤' : h < 11 ? '좋은 아침' : h < 17 ? '오후' : '저녁');
  }, []);

  const start = 113.1, cur = 105.0, goal = 80;
  const pct = (start - cur) / (start - goal);
  const delta = +(cur - 105.9).toFixed(1); // -0.9 vs yesterday

  const todos = [
    { id: 'am', label: '오전 운동', sub: '머신 6종 · 30분', done: true },
    { id: 'pm', label: '저녁 운동', sub: '케틀벨 스윙 10R', done: false },
    { id: 'pr', label: '단백질 110g', sub: '108g · 2g 남음', done: false, progress: 108/110 },
    { id: 'kc', label: '칼로리 1500 이하', sub: '786 kcal', done: true },
  ];
  const doneCount = todos.filter(t => t.done).length;

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Greeting header */}
      <div style={{ padding: '12px 20px 4px', fontFamily: S.fontSans }}>
        <div style={{ fontSize: 12, color: S.textDim, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: S.fontMono }}>
          {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
        <div style={{ fontSize: 22, color: S.text, fontWeight: 500, marginTop: 4, letterSpacing: -0.6 }}>
          {greet}이에요, <span style={{ color: S.accent }}>이현우</span>님
        </div>
      </div>

      <StatusLine/>

      {/* Hero — weight progress */}
      <div style={{ margin: '18px 20px 0' }}>
        <Card pad={20} style={{
          background: `linear-gradient(165deg, ${S.bgElev2} 0%, ${S.bgElev} 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative arc */}
          <svg width="240" height="240" viewBox="0 0 240 240" style={{
            position: 'absolute', right: -80, top: -80, opacity: .14,
          }}>
            <circle cx="120" cy="120" r="100" fill="none" stroke={S.accent} strokeWidth="1"/>
            <circle cx="120" cy="120" r="70" fill="none" stroke={S.accent} strokeWidth="1"/>
            <circle cx="120" cy="120" r="40" fill="none" stroke={S.accent} strokeWidth="1"/>
          </svg>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 11, color: S.textDim, letterSpacing: 1, textTransform: 'uppercase', fontFamily: S.fontMono }}>
                현재 체중
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 64, fontWeight: 300, fontFamily: S.fontSans, color: S.text, letterSpacing: -2.5, lineHeight: 1 }}>
                  {cur.toFixed(1)}
                </span>
                <span style={{ fontSize: 18, color: S.textMid, fontWeight: 400 }}>kg</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, fontFamily: S.fontMono, fontSize: 12 }}>
                <span style={{ color: S.up, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon.arrow dir="down" s={11}/>{Math.abs(delta)}kg 전일
                </span>
                <span style={{ color: S.textDim }}>/</span>
                <span style={{ color: S.textMid }}>
                  총 ▼{(start - cur).toFixed(1)}kg
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right', position: 'relative' }}>
              <div style={{ fontSize: 11, color: S.textDim, letterSpacing: 1, textTransform: 'uppercase', fontFamily: S.fontMono }}>
                목표까지
              </div>
              <div style={{ fontSize: 28, fontWeight: 400, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.8, marginTop: 6 }}>
                {(cur - goal).toFixed(0)}<span style={{ fontSize: 14, color: S.textDim, fontWeight: 400 }}>kg</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: S.textMid, fontFamily: S.fontMono }}>
                예상 D-{Math.round((cur - goal) / 0.9 * 7)}일
              </div>
            </div>
          </div>

          {/* progress bar w/ milestones */}
          <div style={{ marginTop: 22 }}>
            <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${pct*100}%`, background: `linear-gradient(90deg, ${S.accent}, #F5C574)`,
                borderRadius: 999, transition: 'width .8s',
              }}/>
              {/* milestone markers */}
              {[0.25, 0.5, 0.75].map(m => (
                <div key={m} style={{
                  position: 'absolute', left: `${m*100}%`, top: -3, bottom: -3, width: 1,
                  background: 'rgba(255,255,255,0.2)',
                }}/>
              ))}
              {/* current indicator */}
              <div style={{
                position: 'absolute', left: `${pct*100}%`, top: '50%', transform: 'translate(-50%, -50%)',
                width: 14, height: 14, borderRadius: 999,
                background: S.accent, boxShadow: `0 0 0 3px ${S.bg}, 0 0 12px ${S.accent}88`,
              }}/>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 10,
              fontFamily: S.fontMono, fontSize: 10, color: S.textDim, letterSpacing: 0.2,
            }}>
              <span>{start}<span style={{ opacity: .6 }}>kg</span> 시작</span>
              <span style={{ color: S.accent, fontWeight: 600 }}>{Math.round(pct*100)}% 달성</span>
              <span>{goal}<span style={{ opacity: .6 }}>kg</span> 목표</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Today checklist */}
      <SectionLabel right={<span>{doneCount}/{todos.length} 완료</span>}>오늘</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={0}>
          {todos.map((t, i) => (
            <TodoRow key={t.id} item={t} last={i === todos.length - 1}/>
          ))}
        </Card>
      </div>

      {/* Macros summary */}
      <SectionLabel right={<span>오늘 · 3끼</span>}>영양</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={18}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Ring size={92} stroke={8} pct={108/110} color={S.protein}>
              <div style={{ textAlign: 'center', fontFamily: S.fontSans }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: S.text, letterSpacing: -0.5 }}>108<span style={{ fontSize: 11, color: S.textDim, fontWeight: 400 }}>g</span></div>
                <div style={{ fontSize: 9, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.5, textTransform: 'uppercase' }}>단백질</div>
              </div>
            </Ring>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <MacroRow label="탄수화물" value={49.5} target={180} color={S.carb} unit="g"/>
              <MacroRow label="지방" value={24.3} target={60} color={S.fat} unit="g"/>
              <MacroRow label="칼로리" value={786} target={1500} color={S.accent} unit="kcal"/>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent activity timeline */}
      <SectionLabel right={<a style={{ color: S.accent, textDecoration: 'none', fontSize: 11 }}>모두 보기 →</a>}>
        오늘 기록
      </SectionLabel>
      <div style={{ margin: '0 20px 0' }}>
        <div style={{ position: 'relative', paddingLeft: 18 }}>
          <div style={{
            position: 'absolute', left: 5, top: 6, bottom: 6, width: 1,
            background: S.lineStrong,
          }}/>
          <TimelineItem time="13:15" tag="식단" title="단백질 쉐이크 + 매일두유" meta="P36g · 262kcal"/>
          <TimelineItem time="11:40" tag="운동" title="머신 체스트 프레스" meta="30kg × 12 × 3세트"/>
          <TimelineItem time="09:02" tag="체중" title="105.0kg" meta="▼0.9kg 어제 대비" accent/>
          <TimelineItem time="08:30" tag="투약" title="마운자로 5mg" meta="주 1회" last/>
        </div>
      </div>
    </div>
  );
}

function TodoRow({ item, last }) {
  const { label, sub, done, progress } = item;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${S.line}`,
    }}>
      {/* checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
        border: `1.5px solid ${done ? S.accent : S.lineStrong}`,
        background: done ? S.accent : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .2s',
        color: '#171309',
      }}>
        {done && <Icon.check s={14}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: done ? S.textMid : S.text,
          textDecoration: done ? 'line-through' : 'none',
          textDecorationColor: 'rgba(255,255,255,0.2)',
          fontFamily: S.fontSans, letterSpacing: -0.3,
        }}>{label}</div>
        <div style={{ fontSize: 11, color: S.textDim, marginTop: 2, fontFamily: S.fontMono }}>{sub}</div>
        {progress != null && (
          <div style={{ marginTop: 6, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${progress*100}%`, height: '100%', background: S.accent }}/>
          </div>
        )}
      </div>
    </div>
  );
}

function MacroRow({ label, value, target, color, unit }) {
  const pct = Math.min(1, value / target);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontFamily: S.fontSans, fontSize: 12 }}>
        <span style={{ color: S.textMid, letterSpacing: -0.2 }}>{label}</span>
        <span style={{ color: S.text, fontFamily: S.fontMono, fontSize: 11 }}>
          <span style={{ fontWeight: 600 }}>{value}</span>
          <span style={{ color: S.textDim }}> / {target}{unit}</span>
        </span>
      </div>
      <Bar pct={pct} color={color} height={3}/>
    </div>
  );
}

function TimelineItem({ time, tag, title, meta, accent, last }) {
  return (
    <div style={{
      position: 'relative', paddingBottom: last ? 0 : 18,
    }}>
      <div style={{
        position: 'absolute', left: -18, top: 4,
        width: 11, height: 11, borderRadius: 999,
        background: accent ? S.accent : S.bgElev3,
        border: `2px solid ${S.bg}`,
        boxShadow: accent ? `0 0 0 3px ${S.accent}22` : 'none',
      }}/>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <span style={{ fontFamily: S.fontMono, fontSize: 10, color: S.textDim, letterSpacing: 0.4, width: 36 }}>{time}</span>
        <span style={{
          fontSize: 9, padding: '2px 6px', borderRadius: 4,
          background: accent ? S.accentSoft : 'rgba(255,255,255,0.06)',
          color: accent ? S.accent : S.textMid, fontFamily: S.fontMono, letterSpacing: 0.3,
        }}>{tag}</span>
      </div>
      <div style={{ marginLeft: 46, marginTop: 3, fontSize: 13, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.3 }}>{title}</div>
      <div style={{ marginLeft: 46, marginTop: 2, fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>{meta}</div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
