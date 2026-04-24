import { useEffect, useState } from 'react';
import { TapBtn } from './TapBtn';
import { updateProfile } from '../../lib/api';

export function ProfileEditModal({ open, profile, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [startW, setStartW] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) {
      setName(profile?.name || '');
      setStartW(profile?.start_weight_kg != null ? String(profile.start_weight_kg) : '');
      setErr('');
    }
  }, [open, profile]);

  if (!open) return null;

  const nameOk = name.trim().length > 0;
  const startWStr = startW.trim();
  const startWNum = startWStr ? Number(startWStr) : null;
  const startWOk = startWStr === '' || (!isNaN(startWNum) && startWNum >= 30 && startWNum <= 300);
  const canSave = nameOk && startWOk;

  async function save() {
    const patch = { name: name.trim() };
    if (startWStr !== '') patch.start_weight_kg = startWNum;
    const r = await updateProfile(patch);
    if (!r.ok) { setErr(r.error || '저장 실패'); return; }
    onSaved?.();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
      onClick={onClose}
    >
      <div
        className="bg-bg-elev-2 border border-line rounded-[20px] p-5 w-full max-w-[320px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-[11px] text-text-dim font-mono tracking-[0.6px] uppercase mb-4">프로필 편집</div>

        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase mb-1">이름</div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              autoFocus
              className="w-full bg-bg-elev-3 border border-line rounded-[10px] px-3 py-2 text-text text-[14px] outline-none"
            />
          </div>
          <div>
            <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase mb-1">
              시작 체중 <span className="text-text-dim lowercase tracking-normal normal-case">(선택 · 30~300)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={startW}
                onChange={e => setStartW(e.target.value)}
                placeholder="예: 113"
                className="flex-1 bg-bg-elev-3 border border-line rounded-[10px] px-3 py-2 text-text text-[14px] outline-none min-w-0"
              />
              <span className="text-text-dim font-mono text-[12px]">kg</span>
            </div>
          </div>
        </div>

        {err && <div className="text-down text-[11px] font-mono mt-3">{err}</div>}

        <div className="flex gap-2 mt-5">
          <TapBtn full variant="ghost" onClick={onClose}>취소</TapBtn>
          <TapBtn full variant="accent" disabled={!canSave} onClick={save}>저장</TapBtn>
        </div>
      </div>
    </div>
  );
}
