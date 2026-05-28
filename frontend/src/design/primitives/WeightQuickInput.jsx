import { useEffect, useState } from 'react';
import { Card } from './Card';
import { getToday } from '../../lib/utils';

const STEP = 0.1;

export function WeightQuickInput({ defaultValue, onSaved }) {
  // 디폴트: 최신 체중 (소수 첫째자리). 없으면 빈 문자열.
  const [weight, setWeight] = useState(() =>
    defaultValue != null ? Number(defaultValue).toFixed(1) : ''
  );
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  // defaultValue가 바뀌면(다른 화면 갔다오거나 데이터 새로고침) 입력 갱신 — 단 사용자가 편집 중이면 보존
  useEffect(() => {
    if (!touched && defaultValue != null) setWeight(Number(defaultValue).toFixed(1));
  }, [defaultValue, touched]);

  function setVal(v) { setTouched(true); setWeight(v); }

  function adjust(delta) {
    const cur = parseFloat(weight);
    const base = isNaN(cur) ? (defaultValue != null ? Number(defaultValue) : 0) : cur;
    setVal((Math.round((base + delta) * 10) / 10).toFixed(1));
  }

  async function save() {
    const n = parseFloat(weight);
    if (!n || isNaN(n)) return;
    setSaving(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: getToday(), weight_kg: n, memo: '' }),
      });
      if (res.ok) {
        setTouched(false);   // 저장 후 다음 defaultValue 동기화 허용
        onSaved?.();
      }
    } finally {
      setSaving(false);
    }
  }

  const hasValue = weight !== '' && !isNaN(parseFloat(weight));

  return (
    <Card pad={12}>
      {/* Row 1: stepper + 큰 숫자 (좁은 화면에서도 안 잘리게) */}
      <div className="flex items-center gap-2">
        <StepButton dir="-" onClick={() => adjust(-STEP)} />
        <div className="flex-1 min-w-0 flex items-baseline justify-center gap-1">
          <input
            value={weight}
            onChange={e => setVal(e.target.value)}
            onFocus={() => setTouched(true)}
            placeholder="—"
            inputMode="decimal"
            type="text"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-text text-[26px] font-bold tracking-[-0.8px] font-mono text-right placeholder:text-text-faint"
          />
          <span className="text-text-mid font-mono text-[12px] shrink-0">kg</span>
        </div>
        <StepButton dir="+" onClick={() => adjust(STEP)} />
      </div>

      {/* Row 2: 저장 버튼 (full width — 폭 어떤 폰이든 안 잘림) */}
      <button
        type="button"
        onClick={save}
        disabled={saving || !hasValue}
        className="w-full mt-2.5 py-2.5 rounded-[10px] bg-amber text-[#1a1208] font-bold text-[13px] border-none cursor-pointer active:scale-[.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? '저장 중...' : '저장'}
      </button>
    </Card>
  );
}

function StepButton({ dir, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === '+' ? '0.1kg 증가' : '0.1kg 감소'}
      className="w-10 h-10 rounded-full bg-surface-3 border border-line text-text font-bold text-[18px] cursor-pointer flex items-center justify-center active:scale-[.92] transition-transform shrink-0 leading-none"
    >
      {dir === '+' ? '+' : '−'}
    </button>
  );
}
