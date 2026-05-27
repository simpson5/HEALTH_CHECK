import { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import Icon from '../design/Icon';
import { TapBtn, Toast } from '../design/primitives';
import { getToday } from '../lib/utils';
import {
  uploadPhoto, saveInbody, parseInbodyCsv,
  requestInbodyAiParse, pollJob,
} from '../lib/api';

// 필수 / 체성분(선택) / 대사(선택) — design_handoff §5 InBodyScreen
const REQUIRED = { key: 'weight_kg', label: '체중', unit: 'kg', required: true };
const COMP_FIELDS = [
  { key: 'muscle_kg', label: '골격근',    unit: 'kg' },
  { key: 'fat_kg',    label: '체지방량',  unit: 'kg' },
  { key: 'fat_pct',   label: '체지방률',  unit: '%' },
  { key: 'bmi',       label: 'BMI',       unit: '' },
];
const META_FIELDS = [
  { key: 'bmr_kcal',           label: '기초대사량',    unit: 'kcal', integer: true },
  { key: 'visceral_fat_level', label: '내장지방',      unit: 'Lv',   integer: true },
  { key: 'inbody_score',       label: '인바디 점수',   unit: '점',   integer: true },
];
const ALL_OPTIONAL = [...COMP_FIELDS, ...META_FIELDS];

export function InbodyNew() {
  const nav = useNavigate();
  const { data, refresh } = useData();
  const [method, setMethod] = useState('manual');   // 'ai' | 'csv' | 'manual'
  const [date, setDate] = useState(getToday());
  const [form, setForm] = useState({});
  const [memo, setMemo] = useState('');
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [expanded, setExpanded] = useState(false);
  const csvRef = useRef(null);
  const photoRef = useRef(null);

  const lastMeasured = useMemo(() => {
    const rec = (data?.inbody_records || []).slice().reverse().find(r => r.date < date);
    if (!rec) return null;
    const days = Math.round((new Date(date) - new Date(rec.date)) / 86400000);
    return { date: rec.date, days };
  }, [data, date]);

  function showToast(m) {
    setToast(m);
    setTimeout(() => setToast(''), 1800);
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function applyParsed(parsed) {
    const next = {};
    for (const { key } of [REQUIRED, ...ALL_OPTIONAL]) {
      if (parsed[key] != null && parsed[key] !== '') next[key] = String(parsed[key]);
    }
    setForm(next);
    if (parsed.date) setDate(parsed.date);
    // 자동 입력되면 모든 필드 펼치기
    setExpanded(true);
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
      for (const { key, integer } of [REQUIRED, ...ALL_OPTIONAL]) {
        const raw = form[key];
        if (raw == null || raw === '') { payload[key] = null; continue; }
        const n = integer ? parseInt(raw, 10) : parseFloat(raw);
        payload[key] = isNaN(n) ? null : n;
      }
      const mStart = data?.profile?.medication_start;
      if (mStart) {
        const diff = Math.round((new Date(date) - new Date(mStart)) / 86400000) + 1;
        payload.day_since_start = diff;
      }
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

  const canSave = !!form.weight_kg && !busy;

  return (
    <div className="fixed inset-0 bg-bg flex flex-col">
      {/* Top bar */}
      <div className="h-12 px-3 flex items-center justify-between shrink-0 border-b border-line">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="w-9 h-9 rounded-full bg-transparent border-none text-text-mid cursor-pointer flex items-center justify-center"
          aria-label="뒤로"
        >
          <Icon.chev s={18} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="text-[15px] font-semibold tracking-[-0.2px]">인바디 기록</div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Method picker — 3 cards, moved up per §5 */}
        <div className="px-5 pt-4 pb-3">
          <div className="text-[11px] text-text-mid mb-2.5">입력 방법</div>
          <div className="grid grid-cols-3 gap-2">
            <MethodCard
              active={method === 'ai'}
              icon="📷"
              title="사진 AI"
              sub="자동 인식"
              onClick={() => { setMethod('ai'); photoRef.current?.click(); }}
            />
            <MethodCard
              active={method === 'csv'}
              icon="📄"
              title="CSV"
              sub="기기 파일"
              onClick={() => { setMethod('csv'); csvRef.current?.click(); }}
            />
            <MethodCard
              active={method === 'manual'}
              icon="✎"
              title="수동"
              sub="직접 입력"
              onClick={() => setMethod('manual')}
            />
          </div>
          <input ref={csvRef}   type="file" accept=".csv"  onChange={handleCsvPick} className="hidden" />
          <input ref={photoRef} type="file" accept="image/*" onChange={handleAiPick}  className="hidden" />
          {photo && (
            <div className="mt-2 text-[10px] text-text-dim font-mono truncate">{photo.split('/').pop()}</div>
          )}
        </div>

        {/* Date */}
        <div className="px-5 pb-3">
          <div className="text-[11px] text-text-mid mb-1.5">측정일</div>
          <div className="flex items-center justify-between bg-surface border border-line rounded-[12px] px-3.5 py-3">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-transparent text-[14px] font-mono text-text outline-none border-none flex-1 min-w-0"
            />
            <span className="text-text-mid text-[14px]">📅</span>
          </div>
          {lastMeasured && (
            <div className="mt-1.5 text-[10px] text-text-faint font-mono">
              지난 측정 {lastMeasured.date} · {lastMeasured.days}일 전
            </div>
          )}
        </div>

        {/* Required — 체중 */}
        <div className="px-5 pb-1.5 flex justify-between items-baseline">
          <div className="text-[11px] text-text-mid font-semibold">필수</div>
          <div className="text-[10px] text-text-faint">최소 체중만 있으면 OK</div>
        </div>
        <div className="mx-5 mb-4 px-4 bg-surface border border-amber-line rounded-[12px]">
          <InputRow
            field={REQUIRED}
            value={form[REQUIRED.key]}
            onChange={v => setField(REQUIRED.key, v)}
            focus
            last
          />
        </div>

        {/* 체성분 (선택) */}
        <div className="px-5 pb-1.5 flex justify-between items-baseline">
          <div className="text-[11px] text-text-mid font-semibold">체성분 (선택)</div>
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="text-[11px] text-amber font-medium bg-transparent border-none cursor-pointer p-0"
          >
            {expanded ? '접기 ▴' : '전체 입력 ▾'}
          </button>
        </div>
        {expanded && (
          <div className="mx-5 mb-4 px-4 bg-surface border border-line rounded-[12px]">
            {COMP_FIELDS.map((f, i) => (
              <InputRow
                key={f.key}
                field={f}
                value={form[f.key]}
                onChange={v => setField(f.key, v)}
                last={i === COMP_FIELDS.length - 1}
              />
            ))}
          </div>
        )}

        {/* 대사 (선택) */}
        {expanded && (
          <>
            <div className="px-5 pb-1.5 text-[11px] text-text-mid font-semibold">대사 (선택)</div>
            <div className="mx-5 mb-4 px-4 bg-surface border border-line rounded-[12px]">
              {META_FIELDS.map((f, i) => (
                <InputRow
                  key={f.key}
                  field={f}
                  value={form[f.key]}
                  onChange={v => setField(f.key, v)}
                  last={i === META_FIELDS.length - 1}
                />
              ))}
            </div>
          </>
        )}

        {/* Memo */}
        <div className="px-5 pb-1.5 text-[11px] text-text-mid font-semibold">메모</div>
        <div className="mx-5 mb-4">
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="예: 3주차 측정 · 운동 직후"
            rows={2}
            className="w-full bg-surface border border-line rounded-[12px] px-3.5 py-2.5 text-text text-[13px] outline-none resize-none placeholder:text-text-faint"
          />
        </div>

        {/* Save */}
        <div className="px-5 pt-2">
          <button
            type="button"
            disabled={!canSave}
            onClick={save}
            className="w-full py-4 rounded-[12px] bg-amber text-[#1a1208] font-bold text-[15px] border-none cursor-pointer active:scale-[.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? '저장 중...' : '저장'}
          </button>
          <div className="mt-2.5 text-[10px] text-text-faint text-center">
            입력 안 한 항목은 자동으로 비워둡니다
          </div>
        </div>
      </div>

      <Toast text={toast} />
    </div>
  );
}

function MethodCard({ icon, title, sub, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-3 rounded-[12px] text-center border cursor-pointer transition-colors active:scale-[.98] ${
        active
          ? 'bg-amber-soft border-amber-line'
          : 'bg-surface border-line hover:border-line-strong'
      }`}
    >
      <div className="text-[18px] mb-1.5 leading-none">{icon}</div>
      <div className={`text-[11px] font-semibold ${active ? 'text-amber' : 'text-text'}`}>{title}</div>
      <div className="text-[9px] text-text-dim mt-0.5">{sub}</div>
    </button>
  );
}

// design_handoff §3 Form input pattern
function InputRow({ field, value, onChange, focus, last }) {
  const { label, unit, required, integer } = field;
  const hasValue = value != null && value !== '';
  return (
    <div className={`flex items-center gap-3 py-3.5 ${last ? '' : 'border-b border-line'}`}>
      <label className={`w-[78px] text-[13px] ${required ? 'text-text font-semibold' : 'text-text-mid font-medium'}`}>
        {label}{required && <span className="text-amber ml-1">*</span>}
      </label>
      <input
        type="number"
        inputMode="decimal"
        step={integer ? '1' : 'any'}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
        className={`flex-1 bg-transparent text-[16px] font-mono outline-none border-b pb-0.5 min-w-0 ${
          hasValue ? 'text-text border-line' : 'text-text-faint border-transparent'
        } ${focus ? '!border-amber !text-text' : ''} placeholder:text-text-faint`}
      />
      <span className="w-[32px] text-[11px] text-text-dim text-right font-mono">{unit}</span>
    </div>
  );
}
