import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { TapBtn } from './TapBtn';
import { updateProfile } from '../../lib/api';

const MEALS = ['아침', '점심', '저녁', '간식', '보충제'];

export function MealPlanEditSheet({ open, mealPlan, onClose, onSaved }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setRows((mealPlan || []).map(r => ({
        meal: r.meal || '아침',
        food: r.food || '',
        protein: r.protein || '',
      })));
      setErr('');
    }
  }, [open, mealPlan]);

  // L20(b) ESC close
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // L20(c) body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  function updateRow(i, key, v) {
    setRows(rs => rs.map((r, ri) => (ri === i ? { ...r, [key]: v } : r)));
  }
  function removeRow(i) {
    setRows(rs => rs.filter((_, ri) => ri !== i));
  }
  function addRow() {
    if (rows.length >= 10) return;
    setRows(rs => [...rs, { meal: '아침', food: '', protein: '' }]);
  }

  const incomplete = rows.some(r => !r.meal || !r.food.trim() || !r.protein.trim());
  const canSave = !saving && !incomplete;

  async function save() {
    setSaving(true);
    setErr('');
    try {
      const cleaned = rows.map(r => ({
        meal: r.meal,
        food: r.food.trim(),
        protein: r.protein.trim(),
      }));
      const r = await updateProfile({ meal_plan: cleaned });
      if (!r.ok) { setErr(r.error || '저장 실패'); return; }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full bg-bg-elev-2 border-t border-line rounded-t-2xl max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="text-[13px] text-text font-medium tracking-[-0.2px]">식단 플랜</div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer text-text-dim flex items-center justify-center"
            aria-label="닫기"
          >✕</button>
        </div>
        <div className="text-[11px] text-text-dim font-mono px-4 pb-3">
          끼니별 음식과 단백질을 기록하세요. 최대 10행, 각 필드 1~60자.
        </div>

        <div className="px-3 space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <select
                value={r.meal}
                onChange={e => updateRow(i, 'meal', e.target.value)}
                className="bg-bg-elev-3 border border-line text-text rounded-[10px] px-2 py-2 font-mono text-[12px] outline-none"
              >
                {MEALS.map(m => <option key={m}>{m}</option>)}
              </select>
              <input
                type="text"
                value={r.food}
                onChange={e => updateRow(i, 'food', e.target.value)}
                maxLength={60}
                placeholder="음식"
                className="flex-1 min-w-0 bg-bg-elev-3 border border-line rounded-[10px] px-2.5 py-2 text-text text-[13px] outline-none"
              />
              <input
                type="text"
                value={r.protein}
                onChange={e => updateRow(i, 'protein', e.target.value)}
                maxLength={60}
                placeholder="41g"
                className="w-[80px] bg-bg-elev-3 border border-line rounded-[10px] px-2.5 py-2 text-text text-[13px] outline-none"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="행 삭제"
                className="w-8 h-8 rounded-[10px] bg-transparent border-none cursor-pointer text-text-dim text-[14px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="text-center text-text-dim text-[12px] py-6">행 없음 — 아래 추가</div>
          )}

          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= 10}
            className="w-full h-10 rounded-[10px] border border-dashed border-line-strong text-text-mid text-[12px] bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 mt-1"
          >
            <Icon.plus s={13} />
            {rows.length >= 10 ? '최대 10행 도달' : '행 추가'}
          </button>
        </div>

        {err && <div className="px-4 pt-3 text-down text-[11px] font-mono">{err}</div>}

        <div className="px-3 py-3 flex gap-2 mt-2">
          <TapBtn full variant="ghost" onClick={onClose}>취소</TapBtn>
          <TapBtn full variant="accent" disabled={!canSave} onClick={save}>
            {saving ? '저장 중...' : '저장'}
          </TapBtn>
        </div>
      </div>
    </div>
  );
}
