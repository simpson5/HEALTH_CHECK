// Meal / diet screen
const S = window.SH;

function MealScreen() {
  const [date, setDate] = React.useState('2026-04-23');
  const meals = [
    { id: 'am', name: '아침', icon: Icon.sun, time: '08:00', items: [
      { t: '닥터유 프로 단백질 쉐이크 (초코)', sub: '190ml · 1회분', kc: 262, p: 36, c: 16.5, f: 8.1, tag: '보충제' },
      { t: '고구마 1개', sub: '150g', kc: 128, p: 2.3, c: 30, f: 0.1, tag: '탄수' },
    ]},
    { id: 'lunch', name: '점심', icon: Icon.flame, time: '13:20', items: [
      { t: '일반식 (고기 위주)', sub: '추정치', kc: 420, p: 28, c: 18, f: 24, tag: '외식' },
    ]},
    { id: 'dinner', name: '저녁', icon: Icon.moon, time: '미기록', items: [] },
    { id: 'snack', name: '보충제', icon: Icon.pill, time: '수시', items: [
      { t: '매일두유 고단백', sub: '190ml', kc: 90, p: 12, c: 6.5, f: 4.1, tag: '보충제' },
    ]},
  ];

  const total = meals.flatMap(m => m.items).reduce((a, x) => ({
    kc: a.kc + x.kc, p: a.p + x.p, c: a.c + x.c, f: a.f + x.f,
  }), { kc: 0, p: 0, c: 0, f: 0 });

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Date picker strip */}
      <DateStrip date={date} onChange={setDate}/>

      {/* Daily macros hero */}
      <div style={{ margin: '12px 20px 0' }}>
        <Card pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Ring size={94} stroke={8} pct={total.p/110} color={S.protein}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.5 }}>
                  {total.p}<span style={{ fontSize: 10, color: S.textDim, fontWeight: 400 }}>g</span>
                </div>
                <div style={{ fontSize: 9, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.4, textTransform: 'uppercase' }}>단백질</div>
              </div>
            </Ring>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                섭취 / 목표
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 400, color: S.text, fontFamily: S.fontSans, letterSpacing: -1 }}>{total.kc}</span>
                <span style={{ fontSize: 13, color: S.textDim }}>/ 1500 kcal</span>
              </div>
              <div style={{ fontSize: 11, color: S.accent, fontFamily: S.fontMono, marginTop: 4 }}>
                {total.p < 110 ? `▲ 단백질 ${(110-total.p).toFixed(1)}g 남음` : '✓ 단백질 목표 달성'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${S.line}` }}>
            {[
              ['단백질', total.p, 110, 'g', S.protein],
              ['탄수', total.c, 180, 'g', S.carb],
              ['지방', total.f, 60, 'g', S.fat],
            ].map(([l,v,t,u,c]) => (
              <div key={l} style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.3, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 3 }}>
                  <span style={{ fontSize: 17, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.3 }}>{v.toFixed(v % 1 ? 1 : 0)}</span>
                  <span style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono }}>/{t}{u}</span>
                </div>
                <Bar pct={v/t} color={c} height={2} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Meals */}
      {meals.map(m => <MealCard key={m.id} meal={m}/>)}

      {/* Quick add */}
      <div style={{ margin: '24px 20px 0' }}>
        <TapBtn full variant="ghost">
          <Icon.plus s={16}/>음식 추가 · AI 분석
        </TapBtn>
      </div>
    </div>
  );
}

function DateStrip({ date, onChange }) {
  const today = new Date('2026-04-23');
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    days.push(d);
  }
  const cur = new Date(date);
  return (
    <div style={{ display: 'flex', gap: 6, padding: '10px 20px 4px', justifyContent: 'space-between' }}>
      {days.map(d => {
        const sel = d.toDateString() === cur.toDateString();
        const isToday = d.toDateString() === today.toDateString();
        const dow = ['일','월','화','수','목','금','토'][d.getDay()];
        return (
          <button key={d.toISOString()} onClick={() => onChange(d.toISOString().slice(0,10))} style={{
            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: sel ? S.accent : 'transparent',
            color: sel ? '#171309' : S.textMid,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            fontFamily: S.fontSans, transition: 'all .15s',
          }}>
            <span style={{ fontSize: 10, letterSpacing: 0.5, fontFamily: S.fontMono, opacity: sel ? .8 : .6 }}>{dow}</span>
            <span style={{ fontSize: 17, fontWeight: sel ? 600 : 400, letterSpacing: -0.3 }}>{d.getDate()}</span>
            {isToday && !sel && <div style={{ width: 4, height: 4, borderRadius: 999, background: S.accent }}/>}
          </button>
        );
      })}
    </div>
  );
}

function MealCard({ meal }) {
  const totals = meal.items.reduce((a, x) => ({ kc: a.kc + x.kc, p: a.p + x.p }), { kc: 0, p: 0 });
  const MealIcon = meal.icon;
  const empty = meal.items.length === 0;
  return (
    <div style={{ margin: '18px 20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: empty ? 'transparent' : S.accentSoft,
          color: empty ? S.textDim : S.accent,
          border: empty ? `1px dashed ${S.lineStrong}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MealIcon s={15}/>
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.2 }}>{meal.name}</span>
        <span style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.3 }}>{meal.time}</span>
        <div style={{ flex: 1 }}/>
        {!empty && (
          <span style={{ fontSize: 11, color: S.textMid, fontFamily: S.fontMono }}>
            <span style={{ color: S.protein }}>P{totals.p}g</span> · {totals.kc}kcal
          </span>
        )}
      </div>
      <Card pad={0}>
        {empty ? (
          <div style={{ padding: '22px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: S.textDim }}>
            <Icon.plus s={14}/>
            <span style={{ fontSize: 12, fontFamily: S.fontSans }}>{meal.name} 기록하기</span>
          </div>
        ) : meal.items.map((it, i) => (
          <div key={i} style={{
            padding: '13px 16px',
            borderBottom: i === meal.items.length - 1 ? 'none' : `1px solid ${S.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.2, textWrap: 'pretty' }}>{it.t}</div>
                <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, marginTop: 2 }}>{it.sub}</div>
              </div>
              <span style={{ fontSize: 13, color: S.text, fontFamily: S.fontMono, fontWeight: 500 }}>{it.kc}<span style={{ fontSize: 9, color: S.textDim, fontWeight: 400 }}>kcal</span></span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <Chip label="P" value={`${it.p}g`} color={S.protein}/>
              <Chip label="C" value={`${it.c}g`} color={S.carb}/>
              <Chip label="F" value={`${it.f}g`} color={S.fat}/>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

Object.assign(window, { MealScreen });
