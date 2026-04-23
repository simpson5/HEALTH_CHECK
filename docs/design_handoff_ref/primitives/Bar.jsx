// Simpson Health — Linear progress bar
// 원본: docs/design_handoff/project/primitives.jsx:73~83
//
// Props:
//   pct    — 0~1
//   color  — 채우기 색 (기본 accent). 매크로 색(protein/carb/fat) 등을 넘길 수 있음
//   height — px. 기본 4
//   track  — 트랙 색 (기본 반투명)
//
// inline style 허용: height (동적), width (동적 %), color (동적)
import React from 'react';

export function Bar({ pct, color = 'var(--color-accent)', height = 4, track = 'rgba(255,255,255,0.06)' }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ height, background: track }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped * 100}%`,
          background: color,
          transition: 'width .6s var(--ease-out)',
        }}
      />
    </div>
  );
}
