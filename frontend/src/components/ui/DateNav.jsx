import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DateNav({ label, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-3">
      <button
        onClick={onPrev}
        className="w-9 h-9 rounded-full bg-bg-card border border-white/[0.06] flex items-center justify-center text-accent hover:bg-bg-elevated transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="text-sm font-bold min-w-[140px] text-center">{label}</div>
      <button
        onClick={onNext}
        className="w-9 h-9 rounded-full bg-bg-card border border-white/[0.06] flex items-center justify-center text-accent hover:bg-bg-elevated transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
