// Shared UI primitives — icons, chips, chart bits
const S = window.SH;

// ── Icons (thin stroke, 20px default) ────────────────────────
const Icon = {
  home:    (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>,
  meal:    (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3v8a3 3 0 003 3v7M7 3v8M10 3v8M17 3c-2 0-3 2-3 5s1 5 3 5v7"/></svg>,
  scale:   (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 9l4 4 4-6"/></svg>,
  dumbbell:(p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9v6M5 6v12M9 8v8M15 8v8M19 6v12M22 9v6M9 12h6"/></svg>,
  pencil:  (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L20 8l-4-4L4 16v4z"/></svg>,
  calendar:(p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  book:    (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5zM8 7h6M8 11h6"/></svg>,
  gear:    (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  plus:    (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  chev:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={p.dir==='left' ? "M15 6l-6 6 6 6" : p.dir==='down' ? "M6 9l6 6 6-6" : p.dir==='up' ? "M6 15l6-6 6 6" : "M9 6l6 6-6 6"}/></svg>,
  arrow:   (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={p.dir==='up' ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M19 12l-7 7-7-7"}/></svg>,
  check:   (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4L19 6"/></svg>,
  camera:  (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></svg>,
  send:    (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>,
  flame:   (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s4 5 4 9a4 4 0 01-8 0c0-1 .5-2 1-2-1 2 0 4 1 4 1-2-1-4 2-11z"/></svg>,
  pill:    (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="8" rx="4" transform="rotate(-20 12 12)"/><path d="M9 6l6 12" transform="rotate(-20 12 12)"/></svg>,
  play:    (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8V4z"/></svg>,
  pause:   (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  star:    (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill={p.fill || 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7L2 9.5 9 9z"/></svg>,
  search:  (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>,
  close:   (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  sun:     (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  moon:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>,
  bolt:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>,
  timer:   (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>,
};

// ── Macro chip ───────────────────────────────────────────────
function Chip({ label, value, color, tone = 'soft' }) {
  const bg = tone === 'solid' ? color : `${color}22`;
  const fg = tone === 'solid' ? '#0E0F12' : color;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 4,
      padding: '3px 8px', borderRadius: 999,
      background: bg, color: fg,
      fontSize: 11, fontWeight: 500, letterSpacing: -0.1,
      fontFamily: S.fontMono,
    }}>
      {label && <span style={{ opacity: .7 }}>{label}</span>}
      <span style={{ fontWeight: 600 }}>{value}</span>
    </span>
  );
}

// ── Ring progress ────────────────────────────────────────────
function Ring({ size = 80, stroke = 7, pct = 0.5, color = S.accent, track = 'rgba(255,255,255,0.08)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.7,.3,1)' }}/>
      </svg>
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Bar segment ──────────────────────────────────────────────
function Bar({ pct, color = S.accent, height = 4, track = 'rgba(255,255,255,0.06)' }) {
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, pct * 100))}%`, height: '100%',
        background: color, borderRadius: 999,
        transition: 'width .6s cubic-bezier(.2,.7,.3,1)',
      }} />
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────
function Card({ children, style = {}, onClick, pad = 16 }) {
  return (
    <div onClick={onClick} style={{
      background: S.bgElev2, borderRadius: S.radius.lg,
      padding: pad, border: `1px solid ${S.line}`,
      ...style,
    }}>{children}</div>
  );
}

// ── Section label ────────────────────────────────────────────
function SectionLabel({ children, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      margin: '20px 20px 10px',
      fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase',
      fontFamily: S.fontMono, color: S.textDim, fontWeight: 500,
    }}>
      <span>{children}</span>
      {right && <span style={{ color: S.textMid, letterSpacing: 0 }}>{right}</span>}
    </div>
  );
}

// ── Tap button ───────────────────────────────────────────────
function TapBtn({ children, onClick, variant = 'ghost', style = {}, full }) {
  const variants = {
    ghost:   { background: 'transparent', color: S.text, border: `1px solid ${S.lineStrong}` },
    solid:   { background: S.text, color: S.bg, border: 'none' },
    accent:  { background: S.accent, color: '#171309', border: 'none' },
    soft:    { background: 'rgba(255,255,255,0.06)', color: S.text, border: 'none' },
    dangerous: { background: 'transparent', color: S.down, border: `1px solid rgba(232,124,92,0.35)` },
  };
  return (
    <button onClick={onClick} style={{
      height: 44, padding: '0 18px', borderRadius: 12,
      fontFamily: S.fontSans, fontSize: 14, fontWeight: 500,
      cursor: 'pointer', width: full ? '100%' : 'auto',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'transform .1s, filter .15s',
      ...variants[variant], ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(.98)'}
    onMouseUp={e => e.currentTarget.style.transform = ''}
    onMouseLeave={e => e.currentTarget.style.transform = ''}>
      {children}
    </button>
  );
}

Object.assign(window, { Icon, Chip, Ring, Bar, Card, SectionLabel, TapBtn });
