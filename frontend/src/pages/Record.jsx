import { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TabBar } from '../components/ui/Tabs';
import { ProgressBar } from '../components/ui/ProgressBar';
import { uploadPhoto } from '../lib/api';
import { getToday, getDow, getWeekRange } from '../lib/utils';
import { Scale, Pill, Camera, Send, FileText, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function Record() {
  const { data, loading, refresh } = useData();
  const [subTab, setSubTab] = useState('input');
  const [weightVal, setWeightVal] = useState('');
  const [medDose, setMedDose] = useState('5mg');
  const [dietText, setDietText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [toast, setToast] = useState('');
  const [histWeek, setHistWeek] = useState(0);
  const [openReport, setOpenReport] = useState(null);
  const fileRef = useRef(null);

  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const today = getToday();
  const proTarget = (data.profile.daily_targets || {}).protein_g || 110;
  const todayMeals = (data.diet_records || []).filter(r => r.date === today);
  let tPro = 0, tCal = 0;
  todayMeals.forEach(m => { tPro += m.protein_g; tCal += m.calories_kcal; });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // === 체중 저장 ===
  const saveWeight = async () => {
    if (!weightVal) return;
    await fetch('/api/weight', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, weight_kg: parseFloat(weightVal), memo: '' }),
    });
    showToast('체중 ' + weightVal + 'kg 저장');
    setWeightVal('');
    refresh();
  };

  // === 투약 저장 ===
  const saveMed = async () => {
    await fetch('/api/medication', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, dose: medDose, change_reason: '정기 투약', memo: '' }),
    });
    showToast('투약 ' + medDose + ' 저장');
    refresh();
  };

  // === 사진 선택 ===
  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const res = await uploadPhoto(file);
    if (res.ok) setPhoto(res.path);
    e.target.value = '';
  };

  // === 빠른 등록 ===
  const quickRegister = async (foodName) => {
    const res = await fetch('/api/ai/quick-diet', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: foodName }),
    });
    const r = await res.json();
    if (r.ok && r.auto_saved) { showToast(r.message); refresh(); }
    else { showToast('매칭 실패'); }
  };

  // === AI 처리 ===
  const pollJob = async (jobId) => {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const res = await fetch('/api/ai/jobs/' + jobId);
      const job = await res.json();
      setAiStatus(job.status);
      if (job.status === 'done') { setAiResult(job.output); refresh(); return; }
      if (job.status === 'failed') { setAiResult({ mode: 'error', message: job.error || '처리 실패' }); return; }
    }
    setAiStatus('failed');
  };

  const sendDiet = async () => {
    if (!dietText && !photo) return;
    setAiStatus('queued'); setAiResult(null);

    // 빠른 매칭 시도
    if (dietText && !photo) {
      const qr = await fetch('/api/ai/quick-diet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: dietText }),
      });
      const q = await qr.json();
      if (q.matched && q.auto_saved) {
        setAiStatus('done'); setAiResult({ mode: 'quick_diet', message: q.message });
        setDietText(''); refresh(); return;
      }
    }

    // AI 분석
    const res = await fetch('/api/ai/diet-draft', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo, memo: dietText }),
    });
    const d = await res.json();
    if (!d.ok) { setAiStatus('failed'); setAiResult({ mode: 'error', message: d.error }); return; }
    setAiStatus('running');
    await pollJob(d.job_id);
    setDietText(''); setPhoto(null); setPhotoPreview(null);
  };

  const saveDraft = async () => {
    if (!aiResult?.payload) return;
    const p = aiResult.payload;
    await fetch('/api/diet', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: p.date || today, time: new Date().toTimeString().slice(0, 5),
        category: 'meal', meal_type: p.meal_type || '식사', food_name: p.food_name,
        quantity: p.quantity, calories_kcal: p.calories_kcal || 0,
        protein_g: p.protein_g || 0, carbs_g: p.carbs_g || 0, fat_g: p.fat_g || 0,
        photo: photo, memo: 'AI 초안 확인 후 저장',
      }),
    });
    setAiResult({ ...aiResult, saved: true, message: '저장 완료' });
    showToast('식단 저장 완료');
    refresh();
  };

  const sendReport = async () => {
    setAiStatus('queued'); setAiResult(null);
    const res = await fetch('/api/ai/daily-report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today }),
    });
    const d = await res.json();
    if (!d.ok) { setAiStatus('failed'); setAiResult({ mode: 'error', message: d.error }); return; }
    setAiStatus('running'); await pollJob(d.job_id);
  };

  const sendCoach = async () => {
    if (!dietText) return;
    setAiStatus('queued'); setAiResult(null);
    const res = await fetch('/api/ai/coach', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: dietText }),
    });
    const d = await res.json();
    if (!d.ok) { setAiStatus('failed'); return; }
    setAiStatus('running'); await pollJob(d.job_id);
    setDietText('');
  };

  // === 리포트 이력 ===
  const week = getWeekRange(histWeek);
  const weekDailies = (data.daily_reports || []).filter(r => r.date >= week.start && r.date <= week.end).reverse();
  const scoreColor = (s) => s === 'A' ? 'text-success' : s === 'B' ? 'text-accent' : s === 'C' ? 'text-warning' : 'text-danger';

  const quickFoods = (data.frequent_foods || []).slice(0, 6);
  const statusLabel = { queued: '⏳ 대기...', running: '🔄 분석 중...', done: '✅ 완료', failed: '❌ 실패' };

  const subTabs = [
    { id: 'input', label: '✏️ 입력' },
    { id: 'report', label: '📊 리포트' },
  ];

  return (
    <div className="space-y-3">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-success text-black px-4 py-2 rounded-lg text-xs font-bold z-[200]">
          {toast}
        </div>
      )}

      {/* 오늘 현황 바 */}
      <div className="flex gap-2 text-xs">
        <Badge color={tPro >= proTarget ? 'success' : 'warning'}>P {tPro}g / {proTarget}g</Badge>
        <Badge color={tCal <= 1500 ? 'accent' : 'danger'}>{tCal}kcal</Badge>
      </div>

      <TabBar tabs={subTabs} active={subTab} onChange={setSubTab} />

      {subTab === 'input' && (
        <div className="space-y-3">
          {/* 체중 입력 */}
          <Card>
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-accent shrink-0" />
              <input type="number" inputMode="decimal" step="0.1" value={weightVal}
                onChange={e => setWeightVal(e.target.value)} placeholder="체중 (kg)"
                onKeyDown={e => e.key === 'Enter' && saveWeight()}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-dim focus:border-accent/30 outline-none" />
              <button onClick={saveWeight}
                className="px-4 py-2.5 bg-accent text-black rounded-xl text-xs font-bold shrink-0">저장</button>
            </div>
          </Card>

          {/* 투약 입력 */}
          <Card>
            <div className="flex items-center gap-2">
              <Pill size={16} className="text-info shrink-0" />
              <select value={medDose} onChange={e => setMedDose(e.target.value)}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text focus:border-accent/30 outline-none">
                <option value="2.5mg">2.5mg</option>
                <option value="5mg">5mg</option>
                <option value="7.5mg">7.5mg</option>
                <option value="10mg">10mg</option>
              </select>
              <button onClick={saveMed}
                className="px-4 py-2.5 bg-info text-black rounded-xl text-xs font-bold shrink-0">투약</button>
            </div>
          </Card>

          {/* 식단 등록 */}
          <Card elevated>
            <CardTitle>식단 등록</CardTitle>

            {photoPreview && (
              <img src={photoPreview} className="w-full rounded-xl mb-3 max-h-32 object-cover" />
            )}

            <div className="flex gap-2 mb-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-muted">
                <Camera size={14} /> 사진
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            <div className="flex gap-2 mb-3">
              <input value={dietText} onChange={e => setDietText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendDiet()}
                placeholder="점심 김치찌개 반인분..."
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-dim focus:border-accent/30 outline-none" />
              <button onClick={sendDiet}
                className="px-4 py-2.5 bg-gradient-to-r from-accent to-success text-black rounded-xl font-bold text-xs shrink-0">
                <Send size={14} />
              </button>
            </div>

            {/* 빠른 등록 */}
            {quickFoods.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {quickFoods.map(f => (
                  <button key={f.id} onClick={() => quickRegister(f.name)}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] active:scale-95 transition-transform">
                    <div className="font-bold whitespace-nowrap">{f.name.length > 8 ? f.name.slice(0, 8) + '..' : f.name}</div>
                    <div className="text-accent">P{f.protein_g}g</div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* AI 상태 + 결과 */}
          {aiStatus && (
            <Card>
              <div className="text-xs text-muted mb-2">{statusLabel[aiStatus]}</div>
              {aiResult && (
                <div className="space-y-2">
                  <div className="text-sm">{aiResult.message}</div>
                  {aiResult.mode === 'diet_draft' && aiResult.payload && !aiResult.saved && (
                    <div>
                      <div className="glass-bright rounded-xl p-3 mb-2">
                        <div className="text-sm font-bold">{aiResult.payload.food_name}</div>
                        <div className="text-xs text-muted">{aiResult.payload.quantity}</div>
                        <div className="flex gap-1.5 mt-1.5">
                          <Badge color="warning">🔥{aiResult.payload.calories_kcal}</Badge>
                          <Badge color="accent">P{aiResult.payload.protein_g}g</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveDraft} className="flex-1 py-2 bg-success text-black rounded-xl text-xs font-bold">✅ 저장</button>
                        <button onClick={() => { setAiStatus(null); setAiResult(null); }}
                          className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-xs text-muted">취소</button>
                      </div>
                    </div>
                  )}
                  {aiResult.mode === 'coach' && (
                    <div className="text-xs text-muted leading-relaxed">{aiResult.message}</div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* AI 보조 */}
          <div className="flex gap-2">
            <button onClick={sendReport}
              className="flex-1 glass rounded-xl p-3 text-left active:scale-[0.97] transition-transform">
              <FileText size={14} className="text-accent mb-1" />
              <div className="text-[11px] font-bold">일일 리포트</div>
            </button>
            <button onClick={sendCoach}
              className="flex-1 glass rounded-xl p-3 text-left active:scale-[0.97] transition-transform">
              <MessageCircle size={14} className="text-info mb-1" />
              <div className="text-[11px] font-bold">건강 상담</div>
            </button>
          </div>
        </div>
      )}

      {subTab === 'report' && (
        <div className="space-y-3">
          {/* 주간 네비 */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <button onClick={() => setHistWeek(h => h - 1)} className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-accent text-sm">◀</button>
            <div className="text-xs font-bold">{week.start.slice(5).replace('-', '/')} ~ {week.end.slice(5).replace('-', '/')}</div>
            <button onClick={() => setHistWeek(h => Math.min(h + 1, 0))} className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-accent text-sm">▶</button>
          </div>

          {weekDailies.length === 0 ? (
            <div className="text-center text-muted text-sm py-6">이 주 리포트 없음</div>
          ) : (
            weekDailies.map(r => {
              const isOpen = openReport === r.date;
              return (
                <Card key={r.date} onClick={() => setOpenReport(isOpen ? null : r.date)}
                  className={'!p-0 overflow-hidden border-l-4 ' + (r.score === 'A' ? 'border-l-success' : r.score === 'B' ? 'border-l-accent' : r.score === 'C' ? 'border-l-warning' : 'border-l-danger')}>
                  <div className="flex items-center px-4 py-3 gap-2">
                    <div className="text-xs font-bold min-w-[70px]">{r.date.slice(5)} ({getDow(r.date)})</div>
                    <div className="flex gap-1 flex-1 flex-wrap">
                      <Badge color="warning">{r.diet_summary?.total_calories || 0}kcal</Badge>
                      <Badge color="accent">P{r.diet_summary?.total_protein || 0}g</Badge>
                    </div>
                    <div className={'text-sm font-black ' + scoreColor(r.score)}>{r.score}</div>
                    {isOpen ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-white/[0.04]">
                      <div className="text-xs text-muted mt-3 mb-2 leading-relaxed">{r.analysis}</div>
                      {(r.highlights || []).map((h, i) => <div key={i} className="text-[11px] py-0.5">{h}</div>)}
                      <div className="text-[11px] text-accent mt-2 pt-2 border-t border-white/[0.04]">💡 {r.tomorrow_advice}</div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
