export function ProgressBar({ value, max, color = 'accent', className = '', glow = false }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const gradients = {
    accent: 'from-accent to-success',
    warning: 'from-warning to-yellow-300',
    danger: 'from-danger to-warning',
    success: 'from-success to-accent',
  };
  const glows = {
    accent: 'shadow-[0_0_12px_rgba(0,229,255,0.4)]',
    warning: 'shadow-[0_0_12px_rgba(255,170,0,0.4)]',
    danger: 'shadow-[0_0_12px_rgba(255,68,102,0.4)]',
    success: 'shadow-[0_0_12px_rgba(0,255,136,0.4)]',
  };

  return (
    <div className={`h-2.5 bg-white/[0.05] rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradients[color] || gradients.accent}
          ${glow !== false ? glows[color] || '' : ''} transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
