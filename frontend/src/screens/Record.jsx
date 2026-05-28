import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, Chip, TapBtn, SectionLabel, Toast, WeightQuickInput } from '../design/primitives';
import Icon from '../design/Icon';
import { getToday, daysSince } from '../lib/utils';
import { uploadPhoto, pollJob, startFasting, endFasting } from '../lib/api';

export function Record() {
  const nav = useNavigate();
  const { data, loading, refresh } = useData();
  const [dose, setDose] = useState('5mg');
  const [mealText, setMealText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  if (loading || !data) return <LoadingScreen />;

  const profile = data.profile || {};
  const dietRecs = data.diet_records || [];
  const today = getToday();
  const todayDiet = dietRecs.filter(r => r.date === today);
  const tPro = Math.round(todayDiet.reduce((a, x) => a + (x.protein_g || 0), 0));
  const tCal = Math.round(todayDiet.reduce((a, x) => a + (x.calories_kcal || 0), 0));
  const proGoal = profile.daily_targets?.protein_g || 110;
  const dPlus = profile.medication_start ? daysSince(profile.medication_start) : 0;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }

  async function saveMedication() {
    const res = await fetch('/api/medication', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, dose }),
    });
    if (res.ok) {
      refresh();
      showToast('투약 저장됨');
    }
  }

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const result = await uploadPhoto(file);
    if (result.ok) {
      setPhoto(result.path);
      showToast('사진 업로드됨');
    }
  }

  async function analyzeMeal() {
    if (!mealText.trim() && !photo) return;
    setAnalyzing(true);
    try {
      // quick match first (text only)
      if (mealText.trim() && !photo) {
        const qr = await fetch('/api/ai/quick-diet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: mealText }),
        });
        const quick = await qr.json();
        if (quick.ok && quick.matched && quick.auto_saved) {
          refresh();
          setMealText('');
          showToast(quick.message || '매칭 저장됨');
          return;
        }
      }
      const r = await fetch('/api/ai/diet-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo, memo: mealText }),
      });
      const d = await r.json();
      if (!d.ok) {
        showToast('AI 분석 실패');
        return;
      }
      const { ok } = await pollJob(d.job_id);
      if (ok) refresh();
      setMealText('');
      setPhoto(null);
      showToast(ok ? 'AI 분석 완료' : 'AI 분석 타임아웃');
    } finally {
      setAnalyzing(false);
    }
  }

  async function quickPick(food) {
    const r = await fetch('/api/ai/quick-diet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: food.name }),
    });
    const res = await r.json();
    if (res.ok && res.auto_saved) {
      refresh();
      showToast(`${food.name} 기록됨`);
    } else {
      showToast('매칭 실패');
    }
  }

  async function runDailyReport() {
    showToast('일일 리포트 생성 중...');
    const r = await fetch('/api/ai/daily-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today }),
    });
    const d = await r.json();
    if (d.ok) {
      const { ok } = await pollJob(d.job_id);
      if (ok) refresh();
      showToast(ok ? '일일 리포트 완료' : '일일 리포트 실패');
    } else {
      showToast('일일 리포트 실패');
    }
  }

  return (
    <div className="pb-[100px]">
      {/* Daily summary strip */}
      <div className="px-5 pt-2.5 flex gap-2">
        <Chip label="P" value={`${tPro} / ${proGoal}g`} color="var(--color-protein)" />
        <Chip label="" value={`${tCal} kcal`} color="var(--color-accent)" />
        <Chip label="D+" value={String(dPlus)} color="var(--color-text-mid)" />
      </div>

      {/* Weight input */}
      <SectionLabel>체중 입력</SectionLabel>
      <div className="mx-5">
        <WeightQuickInput onSaved={() => { refresh(); showToast('체중 저장됨'); }} />
      </div>

      {/* Fasting */}
      <FastingSection
        records={data.fasting_records || []}
        latestWeight={(data.weight_records || []).slice(-1)[0]?.weight_kg}
        onChange={(msg) => { refresh(); if (msg) showToast(msg); }}
      />

      {/* Inbody */}
      <SectionLabel right={<span className="text-text-dim">CSV · 사진 · 수동</span>}>인바디 기록</SectionLabel>
      <div className="mx-5">
        <Card pad={16} onClick={() => nav('/inbody/new')}>
          <div className="flex gap-2.5 items-center">
            <div className="w-9 h-9 rounded-[10px] bg-bg-elev-3 flex items-center justify-center text-accent">
              <Icon.scale s={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-text tracking-[-0.2px]">인바디 기록하기</div>
              <div className="text-[11px] text-text-dim font-mono mt-0.5">CSV 파일 또는 사진(AI 자동 인식)</div>
            </div>
            <Icon.chev s={14} />
          </div>
        </Card>
      </div>

      {/* Medication */}
      <SectionLabel right={<span>주 1회 · 금요일</span>}>투약</SectionLabel>
      <div className="mx-5">
        <Card pad={16}>
          <div className="flex gap-2.5 items-center">
            <div className="w-9 h-9 rounded-[10px] bg-bg-elev-3 flex items-center justify-center text-text-mid">
              <Icon.pill s={18} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-text tracking-[-0.2px]">마운자로</div>
              <div className="text-[11px] text-text-dim font-mono">GLP-1 주사</div>
            </div>
            <select
              value={dose}
              onChange={e => setDose(e.target.value)}
              className="bg-bg-elev-3 border border-line text-text px-3 py-2 rounded-[10px] font-mono text-[13px]"
            >
              {['2.5mg', '5mg', '7.5mg', '10mg'].map(d => <option key={d}>{d}</option>)}
            </select>
            <TapBtn variant="soft" onClick={saveMedication}>투약</TapBtn>
          </div>
        </Card>
      </div>

      {/* Meal AI input */}
      <SectionLabel right={<span className="text-accent">AI 분석</span>}>식단 기록</SectionLabel>
      <div className="mx-5">
        <Card pad={16}>
          <div
            className="rounded-[14px] p-3 transition-colors"
            style={{
              background: 'var(--color-bg-elev)',
              border: `1px solid ${analyzing ? 'var(--color-accent-line)' : 'var(--color-line)'}`,
            }}
          >
            <textarea
              value={mealText}
              onChange={e => setMealText(e.target.value)}
              placeholder="점심 김치찌개 반인분 + 공깃밥 2/3..."
              className="w-full min-h-[50px] bg-transparent border-none outline-none text-text text-[14px] resize-none tracking-[-0.2px] leading-[1.5]"
            />
            <div className="flex gap-2 items-center mt-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickPhoto}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-[9px] bg-transparent text-text-mid cursor-pointer flex items-center justify-center"
                style={{ border: '1px solid var(--color-line)' }}
              >
                <Icon.camera s={16} />
              </button>
              {photo && <span className="text-[10px] text-text-dim font-mono truncate max-w-[120px]">{photo.split('/').pop()}</span>}
              <div className="flex-1" />
              <button
                type="button"
                onClick={analyzeMeal}
                disabled={(!mealText.trim() && !photo) || analyzing}
                className="h-8 px-3.5 rounded-[9px] border-none text-[12px] font-semibold cursor-pointer inline-flex items-center gap-1.5 disabled:cursor-default"
                style={{
                  background: mealText.trim() || photo ? 'var(--color-amber)' : 'var(--color-surface-3)',
                  color: mealText.trim() || photo ? '#171309' : 'var(--color-text-dim)',
                }}
              >
                {analyzing ? (
                  <>
                    <span
                      className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent inline-block animate-spin"
                    />
                    분석 중
                  </>
                ) : (
                  <>분석 <Icon.send s={14} /></>
                )}
              </button>
            </div>
          </div>

          {/* Quick picks */}
          <div className="mt-3">
            <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase mb-2">자주 먹는 음식</div>
            <div className="flex gap-1.5 overflow-x-auto nosb pb-0.5">
              {(data.frequent_foods || []).slice(0, 5).map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => quickPick(f)}
                  className="shrink-0 px-3 py-[7px] rounded-[9px] bg-bg-elev-3 cursor-pointer text-text text-[12px] inline-flex flex-col items-start gap-0.5"
                  style={{ border: '1px solid var(--color-line)' }}
                >
                  <span className="tracking-[-0.2px]">{f.name}</span>
                  <span className="text-[9px] text-protein font-mono">P{Math.round(f.protein_g || 0)}g</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Shortcuts */}
      <SectionLabel>바로가기</SectionLabel>
      <div className="mx-5 grid grid-cols-2 gap-2.5">
        <Card pad={14} onClick={runDailyReport}>
          <div className="text-accent mb-2.5"><Icon.book s={18} /></div>
          <div className="text-[13px] text-text font-medium tracking-[-0.2px]">일일 리포트</div>
          <div className="text-[11px] text-text-dim font-mono mt-0.5">오늘 요약</div>
        </Card>
        <Card pad={14} onClick={() => nav('/coach')}>
          <div className="text-accent mb-2.5"><Icon.meal s={18} /></div>
          <div className="text-[13px] text-text font-medium tracking-[-0.2px]">건강 상담</div>
          <div className="text-[11px] text-text-dim font-mono mt-0.5">AI에게 질문</div>
        </Card>
      </div>

      <Toast text={toast} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 단식 (Fasting) 섹션 — Record 화면 내장
// ────────────────────────────────────────────────────────────
function FastingSection({ records, latestWeight, onChange }) {
  const active = records.find(r => !r.end_at);
  const history = records.filter(r => r.end_at).slice(0, 3);
  const [startWeight, setStartWeight] = useState('');
  const [endWeight, setEndWeight] = useState('');
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);

  // latestWeight 자동 채우기 (사용자 미입력 시)
  const startWeightAuto = startWeight !== '' ? startWeight : (latestWeight != null ? String(latestWeight) : '');
  const endWeightAuto = endWeight !== '' ? endWeight : (latestWeight != null ? String(latestWeight) : '');

  async function handleStart() {
    setBusy(true);
    try {
      const r = await startFasting({
        start_weight_kg: startWeightAuto ? parseFloat(startWeightAuto) : null,
        memo: memo || null,
      });
      if (!r.ok) { onChange(r.error || '시작 실패'); return; }
      setStartWeight(''); setMemo('');
      onChange('단식 시작');
    } finally { setBusy(false); }
  }

  async function handleEnd() {
    setBusy(true);
    try {
      const r = await endFasting({
        end_weight_kg: endWeightAuto ? parseFloat(endWeightAuto) : null,
        memo: memo || null,
      });
      if (!r.ok) { onChange(r.error || '종료 실패'); return; }
      setEndWeight(''); setMemo('');
      onChange('단식 종료');
    } finally { setBusy(false); }
  }

  return (
    <>
      <SectionLabel right={active ? <span className="text-sage">진행 중</span> : null}>
        단식
      </SectionLabel>
      <div className="mx-5">
        {active ? (
          <ActiveFastingCard
            row={active}
            endWeight={endWeightAuto}
            onEndWeightChange={setEndWeight}
            memo={memo}
            onMemoChange={setMemo}
            onEnd={handleEnd}
            busy={busy}
          />
        ) : (
          <IdleFastingCard
            startWeight={startWeightAuto}
            onStartWeightChange={setStartWeight}
            memo={memo}
            onMemoChange={setMemo}
            onStart={handleStart}
            busy={busy}
          />
        )}

        {history.length > 0 && (
          <div className="mt-2.5">
            <Card pad={0}>
              {history.map((h, i, a) => (
                <FastHistoryRow key={h.id} row={h} last={i === a.length - 1} />
              ))}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

function ActiveFastingCard({ row, endWeight, onEndWeightChange, memo, onMemoChange, onEnd, busy }) {
  // 1분마다 tick — 라이브 카운터
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const elapsedMin = Math.max(0, Math.floor((Date.now() - new Date(row.start_at).getTime()) / 60_000));
  const hh = Math.floor(elapsedMin / 60);
  const mm = elapsedMin % 60;

  return (
    <Card pad={16} className="!border-amber-line">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber font-semibold text-[12px]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
          단식 진행 중
        </div>
        <div className="text-[10px] text-text-faint font-mono">
          시작 {fmtFastTime(row.start_at)}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[36px] font-bold tracking-[-1.5px] leading-none font-mono">{hh}</span>
        <span className="text-[13px] text-text-mid">시간</span>
        <span className="text-[36px] font-bold tracking-[-1.5px] leading-none font-mono ml-2">{mm}</span>
        <span className="text-[13px] text-text-mid">분</span>
      </div>
      {row.start_weight_kg != null && (
        <div className="mt-1.5 text-[11px] text-text-mid font-mono">
          시작 체중 {row.start_weight_kg.toFixed(1)}kg
        </div>
      )}

      <div className="mt-4 flex items-center gap-2.5">
        <span className="text-[12px] text-text-mid w-[68px]">종료 체중</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={endWeight}
          onChange={(e) => onEndWeightChange(e.target.value)}
          placeholder="—"
          className="flex-1 bg-surface-3 border border-line rounded-[10px] px-3 py-2 text-text text-[14px] font-mono outline-none placeholder:text-text-faint min-w-0"
        />
        <span className="text-[11px] text-text-dim font-mono">kg</span>
      </div>
      <input
        type="text"
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="메모 (선택)"
        className="w-full mt-2 bg-transparent border-b border-line text-[12px] text-text outline-none py-1.5 placeholder:text-text-faint"
      />
      <button
        type="button"
        onClick={onEnd}
        disabled={busy}
        className="w-full mt-4 py-3 rounded-[12px] bg-amber text-[#1a1208] font-bold text-[14px] border-none cursor-pointer active:scale-[.98] transition-transform disabled:opacity-50"
      >
        {busy ? '저장 중...' : '단식 종료'}
      </button>
    </Card>
  );
}

function IdleFastingCard({ startWeight, onStartWeightChange, memo, onMemoChange, onStart, busy }) {
  return (
    <Card pad={16}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-[10px] bg-surface-3 flex items-center justify-center text-amber">
          <span className="text-[16px]">⏳</span>
        </div>
        <div className="flex-1">
          <div className="text-[13px] text-text font-semibold tracking-[-0.2px]">단식 시작</div>
          <div className="text-[11px] text-text-mid mt-0.5">시작 시각이 지금으로 기록됩니다</div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2.5">
        <span className="text-[12px] text-text-mid w-[68px]">시작 체중</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={startWeight}
          onChange={(e) => onStartWeightChange(e.target.value)}
          placeholder="—"
          className="flex-1 bg-surface-3 border border-line rounded-[10px] px-3 py-2 text-text text-[14px] font-mono outline-none placeholder:text-text-faint min-w-0"
        />
        <span className="text-[11px] text-text-dim font-mono">kg</span>
      </div>
      <input
        type="text"
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="메모 (예: 16시간 IF)"
        className="w-full mt-2 bg-transparent border-b border-line text-[12px] text-text outline-none py-1.5 placeholder:text-text-faint"
      />
      <button
        type="button"
        onClick={onStart}
        disabled={busy}
        className="w-full mt-4 py-3 rounded-[12px] bg-amber text-[#1a1208] font-bold text-[14px] border-none cursor-pointer active:scale-[.98] transition-transform disabled:opacity-50"
      >
        {busy ? '시작 중...' : '단식 시작'}
      </button>
    </Card>
  );
}

function FastHistoryRow({ row, last }) {
  const hh = row.duration_min != null ? Math.floor(row.duration_min / 60) : null;
  const mm = row.duration_min != null ? row.duration_min % 60 : null;
  const durLabel = hh != null ? (hh > 0 ? `${hh}시간${mm > 0 ? ` ${mm}분` : ''}` : `${mm}분`) : '—';
  const wc = row.weight_change_kg;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${last ? '' : 'border-b border-line'}`}>
      <span className="w-1 h-5 rounded-full shrink-0 bg-sage" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-text font-mono">{fmtFastDate(row.start_at)}</div>
        <div className="text-[10px] text-text-mid font-mono mt-0.5 truncate">
          {fmtFastClock(row.start_at)} → {row.end_at ? fmtFastClock(row.end_at) : '—'}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[12px] text-text font-mono font-semibold">{durLabel}</div>
        {wc != null && (
          <div className={`text-[10px] font-mono mt-0.5 ${wc < 0 ? 'text-sage' : wc > 0 ? 'text-coral' : 'text-text-dim'}`}>
            {wc < 0 ? '▼' : wc > 0 ? '▲' : ''} {Math.abs(wc).toFixed(1)}kg
          </div>
        )}
      </div>
    </div>
  );
}

function fmtFastTime(iso) {
  // "2026-05-28T22:00:00" → "05/28 22:00"
  if (!iso) return '—';
  return `${fmtFastDate(iso)} ${fmtFastClock(iso)}`;
}
function fmtFastDate(iso) {
  if (!iso || iso.length < 10) return '—';
  return `${iso.slice(5, 7)}/${iso.slice(8, 10)}`;
}
function fmtFastClock(iso) {
  if (!iso || iso.length < 16) return '—';
  return iso.slice(11, 16);
}
