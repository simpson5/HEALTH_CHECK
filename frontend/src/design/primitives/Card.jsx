// Simpson Health — Card
// 원본: docs/design_handoff/project/primitives.jsx:86~94
//
// Props:
//   pad       — 내부 패딩(px). 기본 16. 0이면 무패딩 (리스트 카드용).
//   className — 추가 Tailwind 클래스 (배경/테두리 덮어쓰기)
//   style     — 동적 스타일 (그라디언트 배경 등). 일반 색상 지정에 사용 금지
//   onClick   — 클릭 핸들러 (있으면 커서 포인터)
//
// Tailwind 토큰: bg-bg-elev-2, border-line, rounded-lg (= 20px)
import React from 'react';

export function Card({ children, className = '', onClick, pad = 16, style }) {
  return (
    <div
      onClick={onClick}
      className={`bg-bg-elev-2 border border-line rounded-lg ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ padding: pad, ...(style || {}) }}
    >
      {children}
    </div>
  );
}
