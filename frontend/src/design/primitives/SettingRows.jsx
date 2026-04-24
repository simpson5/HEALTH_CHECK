import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { TapBtn } from './TapBtn';

function RowBase({ onClick, last, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3.5 bg-transparent border-none cursor-pointer text-left ${
        last ? '' : 'border-b border-line'
      }`}
    >
      {children}
    </button>
  );
}

// === NumberSettingRow — 편집 모달 방식 ===
export function NumberSettingRow({ label, value, unit, onSave, last, placeholder }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');

  useEffect(() => {
    if (open) setVal(value != null ? String(value) : '');
  }, [open, value]);

  async function handleSave() {
    const n = Number(val);
    if (!val || isNaN(n)) return;
    await onSave(n);
    setOpen(false);
  }

  const valueLabel = value != null ? `${value} ${unit}` : '—';

  return (
    <>
      <RowBase onClick={() => setOpen(true)} last={last}>
        <span className="flex-1 text-[13px] text-text tracking-[-0.2px]">{label}</span>
        <span className="text-[12px] text-text-mid font-mono mr-2">{valueLabel}</span>
        <Icon.chev s={14} />
      </RowBase>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-bg-elev-2 border border-line rounded-[20px] p-5 w-full max-w-[320px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-[11px] text-text-dim font-mono tracking-[0.6px] uppercase mb-1">{label}</div>
            <div className="flex items-baseline gap-2 border-b border-line pb-3">
              <input
                type="number"
                inputMode="decimal"
                value={val}
                onChange={e => setVal(e.target.value)}
                placeholder={placeholder || '0'}
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-text text-[28px] font-light tracking-[-0.5px] min-w-0"
              />
              <span className="text-text-dim font-mono text-[14px]">{unit}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <TapBtn full variant="ghost" onClick={() => setOpen(false)}>취소</TapBtn>
              <TapBtn full variant="accent" disabled={!val || isNaN(Number(val))} onClick={handleSave}>저장</TapBtn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// === ToggleSettingRow — 즉시 토글 ===
export function ToggleSettingRow({ label, checked, onChange, last }) {
  return (
    <RowBase onClick={() => onChange(!checked)} last={last}>
      <span className="flex-1 text-[13px] text-text tracking-[-0.2px]">{label}</span>
      <span
        className={`w-11 h-6 rounded-full relative transition-colors ${
          checked ? 'bg-accent' : 'bg-white/[.08]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </RowBase>
  );
}

// === MenuSettingRow — 하단 액션 시트 ===
export function MenuSettingRow({ label, valueLabel, options, onSelect, last }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <RowBase onClick={() => setOpen(true)} last={last}>
        <span className="flex-1 text-[13px] text-text tracking-[-0.2px]">{label}</span>
        <span className="text-[12px] text-text-mid font-mono mr-2">{valueLabel}</span>
        <Icon.chev s={14} />
      </RowBase>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full bg-bg-elev-2 border-t border-line rounded-t-2xl p-4 pb-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-[11px] text-text-dim font-mono tracking-[0.6px] uppercase mb-3 px-1">{label}</div>
            <div className="flex flex-col gap-2">
              {options.map(opt => (
                <TapBtn
                  key={opt.value}
                  full
                  variant="soft"
                  onClick={() => { setOpen(false); onSelect(opt.value); }}
                >
                  {opt.label}
                </TapBtn>
              ))}
              <div className="h-1" />
              <TapBtn full variant="ghost" onClick={() => setOpen(false)}>취소</TapBtn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
