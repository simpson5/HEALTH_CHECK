// Simpson Health — Section label
// 원본: docs/design_handoff/project/primitives.jsx:97~109
//
// 작은 대문자 모노 라벨 + 오른쪽 메타. 섹션 제목 역할.
import React from 'react';

export function SectionLabel({ children, right }) {
  return (
    <div className="flex items-baseline justify-between mx-5 mt-5 mb-2.5 text-[11px] tracking-[1.2px] uppercase font-mono text-text-dim font-medium">
      <span>{children}</span>
      {right && <span className="text-text-mid tracking-normal">{right}</span>}
    </div>
  );
}
