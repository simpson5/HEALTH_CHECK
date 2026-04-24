import { useState } from 'react';
import { Card } from './Card';
import { TapBtn } from './TapBtn';
import Icon from '../Icon';
import { getToday } from '../../lib/utils';

export function WeightQuickInput({ onSaved }) {
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

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
        setWeight('');
        onSaved?.();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card pad={16}>
      <div className="flex gap-2.5 items-center">
        <div className="w-9 h-9 rounded-[10px] bg-bg-elev-3 flex items-center justify-center text-text-mid">
          <Icon.scale s={18} />
        </div>
        <input
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="105.0"
          inputMode="decimal"
          className="flex-1 bg-transparent border-none outline-none text-text text-[22px] font-normal tracking-[-0.5px] min-w-0"
        />
        <span className="text-text-dim font-mono text-[13px]">kg</span>
        <TapBtn variant="accent" onClick={save} disabled={saving || !weight}>저장</TapBtn>
      </div>
    </Card>
  );
}
