import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import Icon from '../design/Icon';

export function SearchModal({ open, onClose }) {
  const nav = useNavigate();
  const { data } = useData();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setDebounced('');
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 150);
    return () => clearTimeout(id);
  }, [q]);

  const results = useMemo(() => {
    if (!open || !debounced.trim() || !data) return [];
    const needle = debounced.trim().toLowerCase();
    const records = data.diet_records || [];
    const matches = [];
    for (let i = records.length - 1; i >= 0 && matches.length < 50; i--) {
      const r = records[i];
      const hay = (r.food_name || '').toLowerCase();
      if (hay.includes(needle)) matches.push(r);
    }
    return matches;
  }, [debounced, data, open]);

  if (!open) return null;

  function pick(r) {
    onClose();
    nav(`/?tab=diet&date=${r.date}`);
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col" onClick={onClose}>
      <div
        className="bg-bg border-b border-line px-3 py-3 flex items-center gap-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-transparent border-none text-text cursor-pointer flex items-center justify-center"
          aria-label="닫기"
        >
          <Icon.chev s={18} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="식단 검색..."
          className="flex-1 bg-bg-elev-2 border border-line rounded-[10px] px-3 py-2 text-text text-[14px] outline-none"
        />
      </div>

      <div
        className="flex-1 overflow-y-auto bg-bg px-4 py-3"
        onClick={e => e.stopPropagation()}
      >
        {!debounced.trim() ? (
          <div className="text-center text-text-dim text-[12px] py-12">음식 이름으로 검색</div>
        ) : results.length === 0 ? (
          <div className="text-center text-text-dim text-[12px] py-12">결과 없음</div>
        ) : (
          <div className="space-y-0">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-transparent border-b border-line cursor-pointer text-left"
              >
                <span className="w-16 text-[10px] text-text-dim font-mono tracking-[0.3px]">
                  {r.date.slice(5)} {r.time || ''}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text tracking-[-0.2px] truncate">{r.food_name}</div>
                  <div className="text-[10px] text-text-dim font-mono mt-0.5 truncate">
                    {r.meal_type} · P{r.protein_g || 0}g · {r.calories_kcal || 0}kcal
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
