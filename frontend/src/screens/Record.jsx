import { useRef, useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, Chip, TapBtn, SectionLabel, Toast, WeightQuickInput } from '../design/primitives';
import Icon from '../design/Icon';
import { getToday, daysSince } from '../lib/utils';
import { uploadPhoto } from '../lib/api';

export function Record() {
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

  async function pollJob(jobId) {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const res = await fetch('/api/ai/jobs/' + jobId);
      const job = await res.json();
      if (job.status === 'done') {
        refresh();
        return true;
      }
      if (job.status === 'failed') return false;
    }
    return false;
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
      const ok = await pollJob(d.job_id);
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
      const ok = await pollJob(d.job_id);
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
                capture="environment"
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
                  background: mealText.trim() || photo ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)',
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
        <Card pad={14} onClick={() => showToast('준비 중')}>
          <div className="text-accent mb-2.5"><Icon.meal s={18} /></div>
          <div className="text-[13px] text-text font-medium tracking-[-0.2px]">건강 상담</div>
          <div className="text-[11px] text-text-dim font-mono mt-0.5">AI에게 질문</div>
        </Card>
      </div>

      <Toast text={toast} />
    </div>
  );
}
