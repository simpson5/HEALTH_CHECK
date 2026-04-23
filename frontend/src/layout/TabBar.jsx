// Simpson Health — TabBar (하단 4탭)
// 원본: docs/design_handoff/project/chrome.jsx:5~40 (원본은 5탭이지만 log 제거 — Q&A Q1)
//
// 4탭: 대시보드 / 달력 / 가이드 / 설정
// 기록 화면은 상단 `?tab=record`로만 접근 (중복 제거).
//
// 활성 판정: useLocation().pathname 으로 각 탭 경로 startsWith 매칭.
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../design/Icon';

const TABS = [
  { key: 'home',  label: '대시보드', to: '/',         match: (p) => p === '/',             render: (s) => <Icon.home s={s}/> },
  { key: 'cal',   label: '달력',     to: '/calendar', match: (p) => p.startsWith('/calendar'), render: (s) => <Icon.calendar s={s}/> },
  { key: 'guide', label: '가이드',   to: '/guide',    match: (p) => p.startsWith('/guide'),    render: (s) => <Icon.book s={s}/> },
  { key: 'set',   label: '설정',     to: '/settings', match: (p) => p.startsWith('/settings'), render: (s) => <Icon.gear s={s}/> },
];

export function TabBar() {
  const loc = useLocation();
  const nav = useNavigate();
  return (
    <div
      className="absolute left-0 right-0 bottom-0 h-[88px] pt-2.5 pb-[22px] flex items-center justify-around z-10"
      style={{ background: 'linear-gradient(180deg, rgba(14,15,18,0) 0%, rgba(14,15,18,0.88) 35%, #0E0F12 65%)' }}
    >
      {TABS.map(t => {
        const active = t.match(loc.pathname);
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => nav(t.to)}
            className={`flex-1 h-14 bg-transparent border-none cursor-pointer flex flex-col items-center gap-1 transition-colors ${active ? 'text-accent' : 'text-text-dim'}`}
          >
            {t.render(22)}
            <span className={`text-[10px] font-sans tracking-[-0.1px] ${active ? 'font-semibold' : 'font-normal'}`}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
