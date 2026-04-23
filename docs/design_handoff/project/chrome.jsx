// Simpson Health — Mobile screens
const S = window.SH;

// ── Bottom tab bar ───────────────────────────────────────────
function TabBar({ cur, onTab }) {
  const tabs = [
    { id: 'home', label: '대시보드', icon: Icon.home },
    { id: 'cal',  label: '달력',    icon: Icon.calendar },
    { id: 'log',  label: '기록',    icon: Icon.pencil },
    { id: 'guide',label: '가이드',  icon: Icon.book },
    { id: 'set',  label: '설정',    icon: Icon.gear },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 88,
      paddingBottom: 22, paddingTop: 10,
      background: 'linear-gradient(180deg, rgba(14,15,18,0) 0%, rgba(14,15,18,0.88) 35%, #0E0F12 65%)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 10,
    }}>
      {tabs.map(t => {
        const active = cur === t.id;
        const Ic = t.icon;
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            flex: 1, height: 56, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: active ? S.accent : S.textDim,
            transition: 'color .2s',
          }}>
            <Ic s={22}/>
            <span style={{ fontSize: 10, fontFamily: S.fontSans, fontWeight: active ? 600 : 400, letterSpacing: -0.1 }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Secondary top bar (scroll-tabs: 홈/식단/체중/운동/기록) ──
function TopTabs({ cur, onTab }) {
  const tabs = ['홈','식단','체중','운동','기록'];
  return (
    <div style={{
      padding: '14px 20px 10px',
      display: 'flex', gap: 20, alignItems: 'center',
      fontFamily: S.fontSans,
    }}>
      {tabs.map(t => {
        const active = cur === t;
        return (
          <button key={t} onClick={() => onTab(t)} style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 15, fontWeight: active ? 600 : 400,
            color: active ? S.text : S.textDim, letterSpacing: -0.3,
            position: 'relative',
          }}>
            {t}
            {active && <div style={{
              position: 'absolute', left: 0, right: 0, bottom: -8, height: 2,
              background: S.accent, borderRadius: 2,
            }}/>}
          </button>
        );
      })}
    </div>
  );
}

// ── Status line (streak, date) ───────────────────────────────
function StatusLine() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 20px 0',
      fontFamily: S.fontMono, fontSize: 11, color: S.textDim,
      letterSpacing: 0.3,
    }}>
      <span>D+45 · 마운자로 5mg</span>
      <span style={{ color: S.up, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: S.up, display: 'inline-block' }}/>
        연속 9일
      </span>
    </div>
  );
}

Object.assign(window, { TabBar, TopTabs, StatusLine });
