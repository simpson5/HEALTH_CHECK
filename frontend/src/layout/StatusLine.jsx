// Simpson Health — StatusLine
// 원본: docs/design_handoff/project/chrome.jsx:73~88
//
// 홈 히어로 위에 한 줄. `D+N · 마운자로 Xmg` | `● 연속 N일`
// Props: data (useData() 응답)
import React from 'react';
import { daysSince, getStreak } from '../lib/utils'; /* 경로는 실제 적용 시 조정 */

export function StatusLine({ data }) {
  if (!data) return null;
  const dSince = daysSince(data.profile.medication_start);
  const lastDose = (data.medication_records.slice(-1)[0] || {}).dose || '';
  const streak = getStreak(data);
  return (
    <div className="flex items-center justify-between px-5 pt-1 font-mono text-[11px] text-text-dim tracking-[0.3px]">
      <span>D+{dSince} · 마운자로 {lastDose}</span>
      <span className="text-up inline-flex items-center gap-[3px]">
        <span className="w-[5px] h-[5px] rounded-full bg-up"/>
        연속 {streak}일
      </span>
    </div>
  );
}
