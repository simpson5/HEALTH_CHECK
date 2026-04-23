// Mobile app shell — combines all screens with tab routing
const S = window.SH;

function MobileApp({ initialTab = 'home', initialTop = '홈' }) {
  const [tab, setTab] = React.useState(initialTab);
  const [topTab, setTopTab] = React.useState(initialTop);
  const [inSession, setInSession] = React.useState(false);

  // Sync top tab with bottom tab
  const handleBottom = (t) => {
    setTab(t);
    if (t === 'home')  setTopTab('홈');
    if (t === 'cal')   setTopTab('체중');
    if (t === 'log')   setTopTab('기록');
    if (t === 'guide') setTopTab('가이드');
    if (t === 'set')   setTopTab('설정');
    setInSession(false);
  };

  const handleTop = (t) => {
    setTopTab(t);
    if (t === '홈')  setTab('home');
    if (t === '식단') setTab('home'); // stays on home bottom tab
    if (t === '체중') setTab('cal');
    if (t === '운동') setTab('log');
    if (t === '기록') setTab('log');
  };

  // Determine active screen
  let screen;
  if (inSession) screen = <SessionScreen onEnd={() => setInSession(false)}/>;
  else if (tab === 'home' && topTab === '홈')   screen = <HomeScreen/>;
  else if (tab === 'home' && topTab === '식단') screen = <MealScreen/>;
  else if (tab === 'home' && topTab === '체중') screen = <WeightScreen/>;
  else if (tab === 'home' && topTab === '운동') screen = <WorkoutScreen onStartSession={() => setInSession(true)}/>;
  else if (tab === 'home' && topTab === '기록') screen = <RecordScreen/>;
  else if (tab === 'cal')   screen = <WeightScreen/>;
  else if (tab === 'log')   screen = <RecordScreen/>;
  else if (tab === 'guide') screen = <GuideScreen/>;
  else if (tab === 'set')   screen = <SettingsScreen/>;

  const showTopTabs = tab === 'home' && !inSession;
  const showBrand = !inSession;

  return (
    <div style={{
      width: '100%', height: '100%', background: S.bg, color: S.text,
      fontFamily: S.fontSans, position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Status bar spacer */}
      <div style={{ height: 54, flexShrink: 0 }}/>

      {/* Brand header */}
      {showBrand && (
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 7, background: S.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#171309', fontFamily: S.fontMono, fontWeight: 700, fontSize: 12,
            }}>S</div>
            <span style={{ fontSize: 13, color: S.text, fontFamily: S.fontSans, fontWeight: 500, letterSpacing: -0.2 }}>Simpson Health</span>
          </div>
          <button style={{
            width: 32, height: 32, borderRadius: 999, background: S.bgElev2, border: `1px solid ${S.line}`,
            color: S.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon.search s={15}/>
          </button>
        </div>
      )}

      {/* Top tabs */}
      {showTopTabs && <TopTabs cur={topTab} onTab={handleTop}/>}

      {/* Screen content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        key={`${tab}-${topTab}-${inSession}`}>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } }`}</style>
        <div style={{ animation: 'fadeUp .28s cubic-bezier(.2,.7,.3,1)' }}>
          {screen}
        </div>
      </div>

      {/* Tab bar */}
      {!inSession && <TabBar cur={tab === 'home' ? 'home' : tab} onTab={handleBottom}/>}
    </div>
  );
}

Object.assign(window, { MobileApp });
