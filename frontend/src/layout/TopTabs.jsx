// Simpson Health — TopTabs (홈 내부 상단 5탭)
// 원본: docs/design_handoff/project/chrome.jsx:43~70
//
// 현재 라우트의 `?tab=` 쿼리스트링으로 활성 탭 결정.
// 클릭 시 `?tab=key` 로 pushState (react-router setSearchParams).
//
// 탭 key는 항상 영문: home / diet / weight / exercise / record
// 라벨은 별도 매핑 (한글/영문 분리).
import React from 'react';
import { useSearchParams } from 'react-router-dom';

const TABS = [
  { key: 'home',     label: '홈' },
  { key: 'diet',     label: '식단' },
  { key: 'weight',   label: '체중' },
  { key: 'exercise', label: '운동' },
  { key: 'record',   label: '기록' },
];

export function TopTabs() {
  const [params, setParams] = useSearchParams();
  const cur = params.get('tab') || 'home';
  const go = (key) => {
    if (key === 'home') setParams({}, { replace: false });
    else setParams({ tab: key }, { replace: false });
  };
  return (
    <div className="px-5 pt-3.5 pb-2.5 flex gap-5 items-center">
      {TABS.map(t => {
        const active = cur === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => go(t.key)}
            className={`relative bg-transparent border-none p-0 cursor-pointer text-[15px] tracking-[-0.3px] transition-colors ${active ? 'text-text font-semibold' : 'text-text-dim font-normal'}`}
          >
            {t.label}
            {active && <span className="absolute left-0 right-0 -bottom-2 h-0.5 bg-accent rounded-sm"/>}
          </button>
        );
      })}
    </div>
  );
}

export const TOP_TABS = TABS;  // 다른 모듈이 key 목록을 참조하고 싶을 때
