// Simpson Health — Section label
// 원본: docs/design_handoff/project/primitives.jsx:97~109
//
// 작은 대문자 모노 라벨 + 오른쪽 메타. 섹션 제목 역할.
import React from 'react';

export function SectionLabel({ children, right }) {
  return (
    <div className="flex items-baseline justify-between mx-5 mt-5 mb-2.5 text-[14px] font-semibold tracking-[-0.2px] text-text">
      <span>{children}</span>
      {right && <span className="text-[11px] text-text-mid font-medium tracking-normal">{right}</span>}
    </div>
  );
}
