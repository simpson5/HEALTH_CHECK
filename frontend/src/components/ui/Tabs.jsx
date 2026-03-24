export function TabBar({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex gap-1.5 overflow-x-auto no-scrollbar mb-3 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border
            ${active === tab.id
              ? 'bg-accent/10 border-accent/20 text-accent'
              : 'bg-transparent border-transparent text-muted hover:text-text'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
