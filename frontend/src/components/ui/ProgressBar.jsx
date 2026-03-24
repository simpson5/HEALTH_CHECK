export function ProgressBar({ value, max, color = 'accent', className = '' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    accent: 'from-accent to-success',
    warning: 'from-warning to-yellow-300',
    danger: 'from-danger to-warning',
    success: 'from-success to-accent',
  };
  const gradient = colors[color] || colors.accent;

  return (
    <div className={`h-2 bg-white/[0.05] rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
