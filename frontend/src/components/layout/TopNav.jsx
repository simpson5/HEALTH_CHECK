const tabs = [
  { id: 'home', label: '홈' },
  { id: 'diet', label: '식단' },
  { id: 'weight', label: '체중' },
  { id: 'exercise', label: '운동' },
  { id: 'record', label: '✏️ 기록' },
];

export function TopNav({ active, onChange }) {
  return (
    <nav className="sticky top-0 z-50 bg-[#06060b]/70 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="flex overflow-x-auto no-scrollbar px-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-shrink-0 px-4 py-3.5 text-[13px] font-medium transition-all duration-200
              ${active === tab.id ? 'text-text' : 'text-dim hover:text-muted'}`}
          >
            {tab.label}
            {active === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-gradient-to-r from-accent to-success shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
