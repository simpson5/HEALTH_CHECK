// Simpson Health — Ring progress
// 원본: docs/design_handoff/project/primitives.jsx:52~70
//
// Props:
//   size     — 지름(px). 기본 80
//   stroke   — 두께(px). 기본 7
//   pct      — 0~1
//   color    — 스트로크 색. 기본 var(--color-accent)
//   track    — 배경 트랙 색. 기본 반투명 화이트
//   children — 중앙 내용
//
// inline style 허용 범위:
//   - width/height, rotate(-90), strokeDashoffset (전부 동적 수치)
import React from 'react';

export function Ring({
  size = 80,
  stroke = 7,
  pct = 0.5,
  color = 'var(--color-accent)',
  track = 'rgba(255,255,255,0.08)',
  children,
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, pct));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset .6s var(--ease-out)' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
