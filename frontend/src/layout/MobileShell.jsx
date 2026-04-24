// Simpson Health — MobileShell
// 원본: docs/design_handoff/project/mobile-app.jsx
//
// 앱 껍데기 (상태바 스페이서는 웹앱이므로 제거). 브랜드 헤더 + (옵션) TopTabs + main + TabBar.
// react-router-dom 7.x 사용 가정 — 현재 route를 읽어 상단/하단 탭 상태 결정.
//
// 렌더 조건:
//   - 홈 경로(`/`)      : 브랜드 + TopTabs + TabBar
//   - 하위 경로         : 브랜드 + TabBar (TopTabs 숨김)
//   - /session          : 브랜드/탭 전부 숨김 (세션 몰입)
import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { TopTabs } from './TopTabs';
import { TabBar } from './TabBar';
import Icon from '../design/Icon';
import { SearchModal } from '../components/SearchModal';

const IMMERSIVE_PREFIXES = ['/session', '/coach', '/inbody', '/weekly-report', '/ai-jobs'];

export function MobileShell() {
  const loc = useLocation();
  const path = loc.pathname;
  const immersive = IMMERSIVE_PREFIXES.some(p => path.startsWith(p));
  const showTopTabs = path === '/';
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-bg text-text font-sans flex flex-col relative overflow-hidden">
      {!immersive && <BrandHeader onSearchClick={() => setSearchOpen(true)} />}
      {showTopTabs && <TopTabs />}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-up"
        key={loc.key}
      >
        <Outlet />
      </main>
      {!immersive && <TabBar />}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function BrandHeader({ onSearchClick }) {
  return (
    <div className="px-5 h-12 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-[22px] h-[22px] rounded-[7px] bg-accent text-accent-on font-mono font-bold text-xs flex items-center justify-center">S</div>
        <span className="text-[13px] font-medium tracking-[-0.2px]">Simpson Health</span>
      </div>
      <button
        type="button"
        aria-label="식단 검색"
        onClick={onSearchClick}
        className="w-8 h-8 rounded-full bg-bg-elev-2 border border-line text-text-mid flex items-center justify-center cursor-pointer"
      >
        <Icon.search s={15}/>
      </button>
    </div>
  );
}
