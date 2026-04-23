// Simpson Health — Toast
// 원본: docs/design_handoff/project/screens/record.jsx:170~183
//
// 쓰임: 카드 저장/AI 완료 등 작은 알림. 바닥에서 위로 살짝 튀어오름.
// 위치는 MobileShell 내부 main 영역 끝단 (절대위치). 호출 쪽에서 훅으로 on/off.
import React from 'react';
import Icon from '../Icon';

export function Toast({ text }) {
  if (!text) return null;
  return (
    <div
      className="
        absolute bottom-[110px] left-1/2 -translate-x-1/2
        bg-text text-bg px-4 py-2.5 rounded-full
        text-[13px] font-sans font-medium tracking-[-0.2px]
        inline-flex items-center gap-2
        shadow-[0_8px_24px_rgba(0,0,0,0.4)]
        animate-toast z-50
      "
    >
      <Icon.check s={14}/>{text}
    </div>
  );
}
