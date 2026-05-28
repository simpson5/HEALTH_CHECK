// Local UI preferences (localStorage). 변경 시 sh:pref-change 이벤트 발행 →
// 다른 컴포넌트의 hook이 즉시 반응.
import { useEffect, useState } from 'react';

const PREFS = {
  medication:    { key: 'sh:medication',    defaultOn: true  },  // 마운자로 UI 표시
  notify:        { key: 'sh:notify',        defaultOn: true  },
};

function read(name) {
  const p = PREFS[name];
  if (!p) return true;
  try {
    const v = localStorage.getItem(p.key);
    if (v == null) return p.defaultOn;
    return v !== '0';
  } catch { return p.defaultOn; }
}

function write(name, on) {
  const p = PREFS[name];
  if (!p) return;
  try { localStorage.setItem(p.key, on ? '1' : '0'); } catch {}
  window.dispatchEvent(new CustomEvent('sh:pref-change', { detail: { name, on } }));
}

export function usePref(name) {
  const [v, setV] = useState(() => read(name));
  useEffect(() => {
    const onChange = () => setV(read(name));
    window.addEventListener('storage', onChange);
    window.addEventListener('sh:pref-change', onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('sh:pref-change', onChange);
    };
  }, [name]);
  return [v, (next) => write(name, next)];
}

export const getPref = read;
export const setPref = write;
