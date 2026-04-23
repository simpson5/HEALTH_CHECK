// Simpson Health — TapBtn
// 원본: docs/design_handoff/project/primitives.jsx:112~135
//
// 5가지 variant:
//   ghost     — 투명 배경, 얇은 테두리
//   solid     — 텍스트 컬러 배경 (역색상 CTA)
//   accent    — 앰버 CTA
//   soft      — 연한 화이트 배경
//   dangerous — 투명 + 위험색 테두리
//
// 원본은 onMouseDown/Up 으로 scale 조작 → Tailwind `active:scale-[.98]`로 대체
// radius: 12px (디자인 원본이 버튼만 borderRadius: 12 — 카드 20과 다름)
import React from 'react';

const variants = {
  ghost:     'bg-transparent text-text border border-line-strong',
  solid:     'bg-text text-bg border-none',
  accent:    'bg-accent text-accent-on border-none',
  soft:      'bg-white/[0.06] text-text border-none',
  dangerous: 'bg-transparent text-down border border-down/35',
};

export function TapBtn({
  children,
  onClick,
  variant = 'ghost',
  className = '',
  full = false,
  disabled = false,
  type = 'button',
}) {
  const v = variants[variant] || variants.ghost;
  const width = full ? 'w-full' : 'w-auto';
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        h-11 px-[18px] rounded-[12px]
        font-sans text-sm font-medium
        inline-flex items-center justify-center gap-2
        transition-[transform,filter] duration-100
        active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${v} ${width} ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </button>
  );
}
