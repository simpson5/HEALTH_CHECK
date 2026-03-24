export function Card({ children, className = '', elevated = false, onClick }) {
  const base = elevated
    ? 'bg-bg-elevated border border-accent/15'
    : 'bg-bg-card border border-white/[0.06]';
  return (
    <div
      className={`${base} rounded-2xl p-4 mb-3 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return <div className={`text-[11px] tracking-[1px] text-muted mb-1.5 ${className}`}>{children}</div>;
}
