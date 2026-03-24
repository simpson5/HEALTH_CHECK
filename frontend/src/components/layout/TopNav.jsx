const tabs = [
  { id: 'home', label: '홈' },
  { id: 'diet', label: '식단' },
  { id: 'weight', label: '체중' },
  { id: 'exercise', label: '운동' },
  { id: 'calendar', label: '달력' },
  { id: 'history', label: '기록' },
];

export function TopNav({ active, onChange }) {
  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex overflow-x-auto no-scrollbar px-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-shrink-0 px-4 py-3.5 text-[13px] font-medium transition-colors
              ${active === tab.id ? 'text-accent' : 'text-muted hover:text-text'}`}
          >
            {tab.label}
            {active === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gradient-to-r from-accent to-success" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
