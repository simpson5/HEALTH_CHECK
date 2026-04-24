import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import Icon from '../design/Icon';
import { Card, TapBtn, SectionLabel, Toast } from '../design/primitives';
import { getToday } from '../lib/utils';
import {
  uploadPhoto, saveInbody, parseInbodyCsv,
  requestInbodyAiParse, pollJob,
} from '../lib/api';

const FIELDS = [
  { key: 'weight_kg',           label: '체중',          unit: 'kg',    required: true },
  { key: 'muscle_kg',           label: '골격근',        unit: 'kg' },
  { key: 'fat_kg',              label: '체지방량',      unit: 'kg' },
  { key: 'fat_pct',             label: '체지방률',      unit: '%' },
  { key: 'bmi',                 label: 'BMI',           unit: '' },
  { key: 'bmr_kcal',            label: '기초대사량',    unit: 'kcal', integer: true },
  { key: 'visceral_fat_level',  label: '내장지방 레벨', unit: 'Lv',   integer: true },
  { key: 'inbody_score',        label: '인바디 점수',   unit: '',     integer: true },
];

export function InbodyNew() {
  const nav = useNavigate();
  const { data, refresh } = useData();
  const [tab, setTab] = useState('manual');
  const [date, setDate] = useState(getToday());
  const [form, setForm] = useState({});
  const [memo, setMemo] = useState('');
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const csvRef = useRef(null);
  const photoRef = useRef(null);

  function showToast(m) {
    setToast(m);
    setTimeout(() => setToast(''), 1800);
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function applyParsed(parsed) {
    // Parsed from CSV or AI — spread matching keys
    const next = {};
    for (const { key } of FIELDS) {
      if (parsed[key] != null && parsed[key] !== '') next[key] = String(parsed[key]);
    }
    setForm(next);
    if (parsed.date) setDate(parsed.date);
    setTab('manual');
    showToast('폼에 자동 입력됨. 확인 후 저장하세요.');
  }

  async function handleCsvPick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const up = await uploadPhoto(file);
      if (!up.ok) return showToast('업로드 실패');
      const r = await parseInbodyCsv(up.path);
      if (!r.ok) return showToast(r.error || 'CSV 파싱 실패');
      applyParsed(r.data || {});
    } finally {
      setBusy(false);
    }
  }

  async function handleAiPick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const up = await uploadPhoto(file);
      if (!up.ok) return showToast('업로드 실패');
      setPhoto(up.path);
      showToast('AI 분석 시작... (최대 2분)');
      const r = await requestInbodyAiParse(up.path);
      if (!r.ok) return showToast(r.error || 'AI 요청 실패');
      const { ok, job, error } = await pollJob(r.job_id);
      if (!ok) return showToast(error || 'AI 분석 실패');
      const payload = job?.output?.payload || {};
      applyParsed(payload);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const wK = parseFloat(form.weight_kg);
    if (!wK || isNaN(wK)) return showToast('체중은 필수 입력');
    setBusy(true);
    try {
      const prev = (data?.inbody_records || []).slice().reverse().find(r => r.date < date);
      const payload = { date, memo, photo };
      for (const { key, integer } of FIELDS) {
        const raw = form[key];
        if (raw == null || raw === '') { payload[key] = null; continue; }
        const n = integer ? parseInt(raw, 10) : parseFloat(raw);
        payload[key] = isNaN(n) ? null : n;
      }
      // day_since_start
      const mStart = data?.profile?.medication_start;
      if (mStart) {
        const diff = Math.round((new Date(date) - new Date(mStart)) / 86400000) + 1;
        payload.day_since_start = diff;
      }
      // change deltas vs prev
      if (prev) {
        payload.weight_change_kg = payload.weight_kg != null ? +(payload.weight_kg - (prev.weight_kg || 0)).toFixed(2) : null;
        payload.muscle_change_kg = payload.muscle_kg != null ? +(payload.muscle_kg - (prev.muscle_kg || 0)).toFixed(2) : null;
        payload.fat_change_kg    = payload.fat_kg    != null ? +(payload.fat_kg    - (prev.fat_kg    || 0)).toFixed(2) : null;
      }
      const r = await saveInbody(payload);
      if (!r.ok) return showToast('저장 실패');
      await refresh();
      showToast('인바디 저장됨');
      setTimeout(() => nav('/?tab=weight'), 600);
    } finally {
      setBusy(false);
    }
  }

  const TABS = [
    { key: 'manual', label: '수동 입력' },
    { key: 'csv',    label: 'CSV 업로드' },
    { key: 'ai',     label: '사진 AI' },
  ];

  return (
    <div className="fixed inset-0 bg-bg flex flex-col">
      <div className="h-12 px-3 flex items-center justify-between shrink-0 border-b border-line">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="w-9 h-9 rounded-full bg-transparent border-none text-text cursor-pointer flex items-center justify-center"
          aria-label="뒤로"
        >
          <Icon.chev s={18} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="text-[14px] text-text font-medium tracking-[-0.2px]">인바디 기록</div>
        <div className="w-9" />
      </div>

      <div className="px-4 pt-3 shrink-0">
        <div className="flex gap-1 p-1 bg-bg-elev rounded-[12px]">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 h-8 rounded-[9px] border-none cursor-pointer text-[12px] font-medium ${
                tab === t.key ? 'bg-bg-elev-3 text-text' : 'bg-transparent text-text-dim'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {tab === 'csv' && (
          <Card pad={16}>
            <div className="text-[13px] text-text mb-1.5 tracking-[-0.2px]">인바디 기기 CSV 파일</div>
            <div className="text-[11px] text-text-dim font-mono mb-3">
              인바디 측정 결과 CSV 파일을 선택하면 수치를 자동으로 폼에 채웁니다.
            </div>
            <input
              ref={csvRef}
              type="file"
              accept=".csv"
              onChange={handleCsvPick}
              className="hidden"
            />
            <TapBtn full variant="soft" onClick={() => csvRef.current?.click()} disabled={busy}>
              {busy ? '처리 중...' : 'CSV 파일 선택'}
            </TapBtn>
          </Card>
        )}

        {tab === 'ai' && (
          <Card pad={16}>
            <div className="text-[13px] text-text mb-1.5 tracking-[-0.2px]">인바디 결과 사진</div>
            <div className="text-[11px] text-text-dim font-mono mb-3">
              인바디 결과지를 찍거나 업로드하면 AI가 수치를 읽어 폼을 채웁니다.
              AI 해석 결과는 수동으로 확인 후 저장하세요.
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              onChange={handleAiPick}
              className="hidden"
            />
            <TapBtn full variant="soft" onClick={() => photoRef.current?.click()} disabled={busy}>
              {busy ? '처리 중...' : '사진 선택 / 촬영'}
            </TapBtn>
            {photo && (
              <div className="text-[10px] text-text-dim font-mono mt-2 truncate">
                {photo.split('/').pop()}
              </div>
            )}
          </Card>
        )}

        {/* Manual form is always visible (CSV/AI 탭도 결과 확인/편집용으로 노출) */}
        <Card pad={16}>
          <div className="mb-3">
            <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase mb-1">측정일</div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-bg-elev-3 border border-line rounded-[10px] px-3 py-2 text-text text-[14px] font-mono outline-none"
            />
          </div>
          <div className="space-y-2.5">
            {FIELDS.map(f => (
              <div key={f.key} className="flex items-center gap-2">
                <span className="w-24 text-[12px] text-text-mid tracking-[-0.2px]">
                  {f.label}{f.required && <span className="text-down ml-0.5">*</span>}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-bg-elev-3 border border-line rounded-[10px] px-3 py-2 text-text text-[14px] font-mono outline-none min-w-0"
                />
                <span className="w-10 text-[11px] text-text-dim font-mono">{f.unit}</span>
              </div>
            ))}
            <div>
              <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase mb-1 mt-3">메모</div>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="예: 3주차 측정"
                rows={2}
                className="w-full bg-bg-elev-3 border border-line rounded-[10px] px-3 py-2 text-text text-[13px] outline-none resize-none"
              />
            </div>
          </div>
        </Card>

        <div className="pt-2">
          <TapBtn full variant="accent" onClick={save} disabled={busy || !form.weight_kg}>
            {busy ? '저장 중...' : '저장'}
          </TapBtn>
        </div>
      </div>

      <Toast text={toast} />
    </div>
  );
}
