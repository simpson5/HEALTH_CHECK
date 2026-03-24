const colorMap = {
  accent: 'bg-accent/10 text-accent border-accent/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  muted: 'bg-white/[0.04] text-muted border-white/[0.06]',
};

export function Badge({ children, color = 'muted', className = '' }) {
  return (
    <span className={`inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full border ${colorMap[color] || colorMap.muted} ${className}`}>
      {children}
    </span>
  );
}
