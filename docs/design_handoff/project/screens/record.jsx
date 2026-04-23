// Record input screen + Guide screen
const S = window.SH;

function RecordScreen() {
  const [weight, setWeight] = React.useState('');
  const [mealText, setMealText] = React.useState('');
  const [dose, setDose] = React.useState('5mg');
  const [analyzing, setAnalyzing] = React.useState(false);
  const [toast, setToast] = React.useState('');

  const save = (what) => {
    setToast(`${what} 저장됨`);
    setTimeout(() => setToast(''), 1800);
  };
  const analyze = () => {
    if (!mealText.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setToast('AI 분석 완료'); setTimeout(() => setToast(''), 1800); setMealText(''); }, 1400);
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Daily summary strip */}
      <div style={{ padding: '10px 20px 0', display: 'flex', gap: 8 }}>
        <Chip label="P" value="108 / 110g" color={S.protein}/>
        <Chip label="" value="786 kcal" color={S.accent}/>
        <Chip label="D+" value="45" color={S.textMid}/>
      </div>

      {/* Weight input */}
      <SectionLabel>체중 입력</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={16}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: S.bgElev3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.textMid }}>
              <Icon.scale s={18}/>
            </div>
            <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="105.0"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: S.text, fontSize: 22, fontFamily: S.fontSans, fontWeight: 400, letterSpacing: -0.5,
              }}/>
            <span style={{ color: S.textDim, fontFamily: S.fontMono, fontSize: 13 }}>kg</span>
            <TapBtn variant="accent" onClick={() => save('체중')}>저장</TapBtn>
          </div>
          {weight && (
            <div style={{ fontSize: 11, color: S.up, fontFamily: S.fontMono, marginTop: 8 }}>
              ▼ {(105.9 - parseFloat(weight || 0)).toFixed(1)}kg 전일 대비
            </div>
          )}
        </Card>
      </div>

      {/* Medication */}
      <SectionLabel right={<span>주 1회 · 금요일</span>}>투약</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={16}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: S.bgElev3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.textMid }}>
              <Icon.pill s={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.2 }}>마운자로</div>
              <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono }}>다음 주 증량 예정</div>
            </div>
            <select value={dose} onChange={e => setDose(e.target.value)} style={{
              background: S.bgElev3, border: `1px solid ${S.line}`, color: S.text,
              padding: '8px 12px', borderRadius: 10, fontFamily: S.fontMono, fontSize: 13,
            }}>
              {['2.5mg','5mg','7.5mg','10mg'].map(d => <option key={d}>{d}</option>)}
            </select>
            <TapBtn variant="soft" onClick={() => save('투약')}>투약</TapBtn>
          </div>
        </Card>
      </div>

      {/* Meal AI input */}
      <SectionLabel right={<span style={{ color: S.accent }}>AI 분석</span>}>식단 기록</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={16}>
          <div style={{
            background: S.bgElev, borderRadius: 14, padding: 12,
            border: `1px solid ${analyzing ? S.accentLine : S.line}`,
            transition: 'border-color .2s',
          }}>
            <textarea value={mealText} onChange={e => setMealText(e.target.value)}
              placeholder="점심 김치찌개 반인분 + 공깃밥 2/3..."
              style={{
                width: '100%', minHeight: 50, background: 'transparent', border: 'none', outline: 'none',
                color: S.text, fontSize: 14, fontFamily: S.fontSans, resize: 'none',
                letterSpacing: -0.2, lineHeight: 1.5,
              }}/>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <button style={{
                width: 32, height: 32, borderRadius: 9, border: `1px solid ${S.line}`,
                background: 'transparent', color: S.textMid, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.camera s={16}/>
              </button>
              <div style={{ flex: 1 }}/>
              <button onClick={analyze} disabled={!mealText.trim() || analyzing} style={{
                height: 32, padding: '0 14px', borderRadius: 9, border: 'none',
                background: mealText.trim() ? S.accent : 'rgba(255,255,255,0.08)',
                color: mealText.trim() ? '#171309' : S.textDim,
                fontSize: 12, fontFamily: S.fontSans, fontWeight: 600,
                cursor: mealText.trim() ? 'pointer' : 'default',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {analyzing ? (
                  <>
                    <span style={{ width: 10, height: 10, borderRadius: 999, border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/>
                    분석 중
                  </>
                ) : <>분석 <Icon.send s={14}/></>}
              </button>
            </div>
          </div>

          {/* Recent quick picks */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>최근 기록</div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {[
                ['닥터유 쉐이크', 'P36g'],
                ['매일두유', 'P12g'],
                ['닥터유 파우더', 'P24g'],
                ['훈제닭가슴살', 'P22g'],
                ['오트밀', 'P6g'],
              ].map(([n, p]) => (
                <button key={n} style={{
                  flexShrink: 0, padding: '7px 12px', borderRadius: 9,
                  background: S.bgElev3, border: `1px solid ${S.line}`, cursor: 'pointer',
                  color: S.text, fontFamily: S.fontSans, fontSize: 12,
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
                }}>
                  <span style={{ letterSpacing: -0.2 }}>{n}</span>
                  <span style={{ fontSize: 9, color: S.protein, fontFamily: S.fontMono }}>{p}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Shortcuts */}
      <SectionLabel>바로가기</SectionLabel>
      <div style={{ margin: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Shortcut icon={Icon.book} label="일일 리포트" sub="오늘 요약"/>
        <Shortcut icon={Icon.meal} label="건강 상담" sub="AI에게 질문"/>
      </div>

      {toast && <Toast text={toast}/>}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Shortcut({ icon: Ic, label, sub }) {
  return (
    <Card pad={14} style={{ cursor: 'pointer' }}>
      <div style={{ color: S.accent, marginBottom: 10 }}><Ic s={18}/></div>
      <div style={{ fontSize: 13, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.2 }}>{label}</div>
      <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, marginTop: 2 }}>{sub}</div>
    </Card>
  );
}

function Toast({ text }) {
  return (
    <div style={{
      position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)',
      background: S.text, color: S.bg, padding: '10px 16px', borderRadius: 999,
      fontSize: 13, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.2,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      animation: 'toastIn .24s cubic-bezier(.2,.7,.3,1)',
    }}>
      <Icon.check s={14}/>{text}
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translate(-50%, 10px); } }`}</style>
    </div>
  );
}

// ── Guide screen (calendar + plan) ───────────────────────────
function GuideScreen() {
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ fontSize: 11, color: S.accent, fontFamily: S.fontMono, letterSpacing: 1.4, textTransform: 'uppercase' }}>
          SIMPSON HEALTH PLAN
        </div>
        <div style={{ fontSize: 28, color: S.text, fontFamily: S.fontSans, fontWeight: 500, marginTop: 6, letterSpacing: -0.8, textWrap: 'pretty' }}>
          운동 & 식단 가이드
        </div>
        <div style={{ fontSize: 12, color: S.textMid, fontFamily: S.fontSans, marginTop: 6 }}>
          108.7kg · 근손실 방지 · 마운자로 복용 중
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <Chip label="목표" value="80kg" color={S.accent}/>
          <Chip label="단백질" value="110g/일" color={S.protein}/>
        </div>
      </div>

      {/* Tab pills */}
      <div style={{ padding: '18px 20px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {['하루일과', '식단', '운동', '식품도감', '로드맵'].map((t, i) => (
          <button key={t} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: i === 0 ? S.accentSoft : 'transparent',
            color: i === 0 ? S.accent : S.textDim,
            fontSize: 12, fontFamily: S.fontSans, fontWeight: 500,
            border: i === 0 ? `1px solid ${S.accentLine}` : `1px solid ${S.line}`,
          }}>{t}</button>
        ))}
      </div>

      <SectionLabel>하루 스케줄</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={0}>
          {[
            { t: '오전', icon: Icon.sun, label: '머신 6종', sub: '2세트 × 12~15회 · 30분', color: S.accent },
            { t: '오전', icon: Icon.dumbbell, label: '경사 트레드밀', sub: '경사 12% · 속도 5.5km/h · 30분+', color: S.info },
            { t: '저녁', icon: Icon.bolt, label: '케틀벨 스윙 인터벌', sub: '16kg · 30초 스윙/30초 휴식 × 10R', color: S.protein },
          ].map((x, i, a) => {
            const Ic = x.icon;
            return (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderBottom: i === a.length-1 ? 'none' : `1px solid ${S.line}`, alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${x.color}1a`, color: x.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Ic s={18}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 10, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.5, textTransform: 'uppercase' }}>{x.t}</span>
                  </div>
                  <div style={{ fontSize: 14, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.2, marginTop: 2 }}>{x.label}</div>
                  <div style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, marginTop: 2 }}>{x.sub}</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <SectionLabel right={<span style={{ color: S.protein }}>105~125g</span>}>하루 식단</SectionLabel>
      <div style={{ margin: '0 20px' }}>
        <Card pad={0}>
          {[
            ['아침', '닥터유PRO 드링크 40g + 고구마', '41g'],
            ['점심', '일반식 (고기 위주)', '20~30g'],
            ['저녁', '훈제닭가슴살 2개 + 야채', '44~54g'],
          ].map(([m, food, p], i, a) => (
            <div key={m} style={{
              display: 'grid', gridTemplateColumns: '50px 1fr auto', gap: 12, alignItems: 'center',
              padding: '14px 16px', borderBottom: i === a.length-1 ? 'none' : `1px solid ${S.line}`,
            }}>
              <span style={{ fontSize: 11, color: S.textDim, fontFamily: S.fontMono, letterSpacing: 0.5, textTransform: 'uppercase' }}>{m}</span>
              <span style={{ fontSize: 13, color: S.text, fontFamily: S.fontSans, letterSpacing: -0.2 }}>{food}</span>
              <span style={{ fontSize: 12, color: S.protein, fontFamily: S.fontMono, fontWeight: 500 }}>{p}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { RecordScreen, GuideScreen });
