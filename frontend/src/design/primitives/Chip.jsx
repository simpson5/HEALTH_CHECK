// Simpson Health — Chip (매크로/상태 칩)
// 원본: docs/design_handoff/project/primitives.jsx:34~49
//
// Props:
//   label — 왼쪽 작은 텍스트 (예: 'P', 'C', 'F'). 생략 가능
//   value — 오른쪽 강조 텍스트
//   color — 색 (protein/carb/fat/accent 등). 동적이라 inline
//   tone  — 'soft' (색 22% 알파 배경) | 'solid' (색을 배경으로, 텍스트는 accent-on)
//
// inline style 허용: background/color (동적 색)
import React from 'react';

export function Chip({ label, value, color, tone = 'soft' }) {
  const bg = tone === 'solid' ? color : `${color}22`;
  const fg = tone === 'solid' ? 'var(--color-accent-on)' : color;
  return (
    <span
      className="inline-flex items-baseline gap-1 px-2 py-[3px] rounded-full font-mono text-[11px] font-medium tracking-[-0.1px]"
      style={{ background: bg, color: fg }}
    >
      {label && <span className="opacity-70">{label}</span>}
      <span className="font-semibold">{value}</span>
    </span>
  );
}
