// ============================================================
// Simpson Health — Icon set (25개)
//
// 원본: docs/design_handoff/project/primitives.jsx:5~31
// 사용처 예: <Icon.home s={20} />, <Icon.chev dir="left" s={16} />
// 색은 currentColor — 부모에서 `text-accent` 같은 Tailwind 유틸로 제어
// ============================================================
import React from 'react';

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 1.6,
  viewBox: '0 0 24 24',
};

const Svg = ({ s = 20, children, sw, vb, ...rest }) => (
  <svg
    width={s}
    height={s}
    viewBox={vb || base.viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={sw ?? base.strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

const Icon = {
  home:     (p) => <Svg {...p}><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></Svg>,
  meal:     (p) => <Svg {...p}><path d="M4 3v8a3 3 0 003 3v7M7 3v8M10 3v8M17 3c-2 0-3 2-3 5s1 5 3 5v7"/></Svg>,
  scale:    (p) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 9l4 4 4-6"/></Svg>,
  dumbbell: (p) => <Svg {...p}><path d="M2 9v6M5 6v12M9 8v8M15 8v8M19 6v12M22 9v6M9 12h6"/></Svg>,
  pencil:   (p) => <Svg {...p}><path d="M4 20h4L20 8l-4-4L4 16v4z"/></Svg>,
  calendar: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Svg>,
  book:     (p) => <Svg {...p}><path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2V5zM8 7h6M8 11h6"/></Svg>,
  gear:     (p) => <Svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></Svg>,

  plus:     (p) => <Svg sw={2} {...p}><path d="M12 5v14M5 12h14"/></Svg>,
  chev:     (p) => <Svg s={p.s ?? 16} sw={2}><path d={p.dir === 'left' ? 'M15 6l-6 6 6 6' : p.dir === 'down' ? 'M6 9l6 6 6-6' : p.dir === 'up' ? 'M6 15l6-6 6 6' : 'M9 6l6 6-6 6'}/></Svg>,
  arrow:    (p) => <Svg s={p.s ?? 16} sw={1.8}><path d={p.dir === 'up' ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M19 12l-7 7-7-7'}/></Svg>,
  check:    (p) => <Svg s={p.s ?? 16} sw={2.4}><path d="M5 12l4 4L19 6"/></Svg>,

  camera:   (p) => <Svg {...p}><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/></Svg>,
  send:     (p) => <Svg s={p.s ?? 18} sw={1.8}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></Svg>,
  flame:    (p) => <Svg s={p.s ?? 16}><path d="M12 2s4 5 4 9a4 4 0 01-8 0c0-1 .5-2 1-2-1 2 0 4 1 4 1-2-1-4 2-11z"/></Svg>,
  pill:     (p) => <Svg s={p.s ?? 18}><rect x="2" y="8" width="20" height="8" rx="4" transform="rotate(-20 12 12)"/><path d="M9 6l6 12" transform="rotate(-20 12 12)"/></Svg>,

  play:     (p) => <svg width={p.s ?? 18} height={p.s ?? 18} viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8V4z"/></svg>,
  pause:    (p) => <svg width={p.s ?? 18} height={p.s ?? 18} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  star:     (p) => <svg width={p.s ?? 14} height={p.s ?? 14} viewBox="0 0 24 24" fill={p.fill || 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7L2 9.5 9 9z"/></svg>,

  search:   (p) => <Svg s={p.s ?? 18}><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></Svg>,
  close:    (p) => <Svg s={p.s ?? 18} sw={1.8}><path d="M6 6l12 12M18 6L6 18"/></Svg>,
  sun:      (p) => <Svg s={p.s ?? 16}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Svg>,
  moon:     (p) => <Svg s={p.s ?? 16}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></Svg>,
  bolt:     (p) => <svg width={p.s ?? 16} height={p.s ?? 16} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>,
  timer:    (p) => <Svg s={p.s ?? 16}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></Svg>,
};

export default Icon;
