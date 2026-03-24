export function Card({ children, className = '', elevated = false, onClick }) {
  return (
    <div
      className={`${elevated ? 'glass-bright glow-accent' : 'glass'} p-5 mb-3
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return <div className={`text-[11px] tracking-[1.5px] text-muted uppercase mb-2 ${className}`}>{children}</div>;
}
