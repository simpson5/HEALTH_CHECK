import { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { uploadPhoto } from '../lib/api';
import { Camera, FolderUp, Send, FileText, MessageCircle, Zap } from 'lucide-react';

export function AI() {
  const { data, refresh } = useData();
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [status, setStatus] = useState(null); // null, queued, running, done, failed
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch('/api/ai/jobs').then(r => r.json()).then(setJobs).catch(() => {});
  }, [status]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const res = await uploadPhoto(file);
    if (res.ok) setPhoto(res.path);
    e.target.value = '';
  };

  const pollJob = async (jobId) => {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const res = await fetch('/api/ai/jobs/' + jobId);
      const job = await res.json();
      setStatus(job.status);
      if (job.status === 'done') {
        setResult(job.output);
        refresh();
        return;
      }
      if (job.status === 'failed') {
        setResult({ mode: 'error', message: job.error || '처리 실패' });
        return;
      }
    }
    setStatus('failed');
    setResult({ mode: 'error', message: '타임아웃' });
  };

  const handleSend = async () => {
    if (!text && !photo) return;
    setStatus('queued');
    setResult(null);

    // 빠른 매칭 시도
    if (text && !photo) {
      const quickRes = await fetch('/api/ai/quick-diet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const quick = await quickRes.json();
      if (quick.matched && quick.auto_saved) {
        setStatus('done');
        setResult({ mode: 'quick_diet', message: quick.message });
        setText('');
        refresh();
        return;
      }
    }

    // AI diet-draft
    const res = await fetch('/api/ai/diet-draft', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo, memo: text }),
    });
    const data = await res.json();
    if (!data.ok) {
      setStatus('failed');
      setResult({ mode: 'error', message: data.error });
      return;
    }
    setStatus('running');
    await pollJob(data.job_id);
    setText('');
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleQuickCommand = async (type) => {
    setStatus('queued');
    setResult(null);
    const endpoint = type === 'report' ? '/api/ai/daily-report' : '/api/ai/coach';
    const body = type === 'report'
      ? { date: new Date().toISOString().slice(0, 10) }
      : { question: text || '오늘 현황 알려줘' };

    const res = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      setStatus('failed');
      setResult({ mode: 'error', message: data.error });
      return;
    }
    setStatus('running');
    await pollJob(data.job_id);
  };

  const handleSaveDraft = async () => {
    if (!result?.payload) return;
    const p = result.payload;
    const res = await fetch('/api/diet', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: p.date, time: new Date().toTimeString().slice(0, 5),
        category: 'meal', meal_type: p.meal_type, food_name: p.food_name,
        quantity: p.quantity, calories_kcal: p.calories_kcal || 0,
        protein_g: p.protein_g || 0, carbs_g: p.carbs_g || 0, fat_g: p.fat_g || 0,
        photo: photo, memo: 'AI 초안 확인 후 저장',
      }),
    });
    if ((await res.json()).ok) {
      setResult({ ...result, saved: true, message: '✅ 저장 완료!' });
      refresh();
    }
  };

  const quickFoods = (data?.frequent_foods || []).slice(0, 6);

  const statusLabel = { queued: '⏳ 대기 중...', running: '🔄 분석 중...', done: '✅ 완료', failed: '❌ 실패' };

  return (
    <div className="space-y-3">
      {/* 입력 */}
      <Card elevated>
        <CardTitle>🤖 AI 건강관리</CardTitle>

        {photoPreview && (
          <img src={photoPreview} className="w-full rounded-xl mb-3 max-h-40 object-cover" />
        )}

        <div className="flex gap-2 mb-3">
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-muted active:bg-white/[0.1]">
            <Camera size={14} /> 사진
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
        </div>

        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="점심 김치찌개 반인분..."
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text placeholder:text-dim focus:border-accent/30 outline-none"
          />
          <button onClick={handleSend}
            className="px-4 py-3 bg-gradient-to-r from-accent to-success text-black rounded-xl font-bold text-sm active:scale-95 transition-transform">
            <Send size={16} />
          </button>
        </div>
      </Card>

      {/* 상태 + 결과 */}
      {status && (
        <Card>
          <div className="text-xs text-muted mb-2">{statusLabel[status] || status}</div>

          {result && (
            <div className="space-y-2">
              <div className="text-sm">{result.message}</div>

              {/* diet_draft 초안 */}
              {result.mode === 'diet_draft' && result.payload && !result.saved && (
                <div className="mt-3">
                  <div className="glass-bright rounded-xl p-3 mb-2">
                    <div className="text-sm font-bold">{result.payload.food_name}</div>
                    <div className="text-xs text-muted">{result.payload.quantity}</div>
                    <div className="flex gap-1.5 mt-2">
                      <Badge color="warning">🔥{result.payload.calories_kcal}kcal</Badge>
                      <Badge color="accent">P{result.payload.protein_g}g</Badge>
                      <Badge color="warning">C{result.payload.carbs_g}g</Badge>
                      <Badge color="info">F{result.payload.fat_g}g</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveDraft}
                      className="flex-1 py-2.5 bg-success text-black rounded-xl text-xs font-bold">✅ 저장</button>
                    <button onClick={() => { setStatus(null); setResult(null); }}
                      className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-xs text-muted">❌ 취소</button>
                  </div>
                </div>
              )}

              {/* daily_report 초안 */}
              {result.mode === 'daily_report' && result.payload && (
                <div className="glass-bright rounded-xl p-3 mt-2">
                  <div className="text-sm font-bold">📊 {result.payload.date} — {result.payload.score}</div>
                  <div className="text-xs text-muted mt-1">{result.payload.analysis}</div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* 빠른 명령 */}
      <div className="text-[11px] tracking-[2px] text-muted uppercase mt-2 mb-1">빠른 명령</div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleQuickCommand('report')}
          className="glass rounded-xl p-3 text-left active:scale-[0.97] transition-transform">
          <FileText size={16} className="text-accent mb-1" />
          <div className="text-xs font-bold">일일 리포트</div>
          <div className="text-[10px] text-muted">오늘 데이터 자동 분석</div>
        </button>
        <button onClick={() => handleQuickCommand('coach')}
          className="glass rounded-xl p-3 text-left active:scale-[0.97] transition-transform">
          <MessageCircle size={16} className="text-info mb-1" />
          <div className="text-xs font-bold">건강 상담</div>
          <div className="text-[10px] text-muted">질문 입력 후 탭</div>
        </button>
      </div>

      {/* 빠른 등록 */}
      {quickFoods.length > 0 && (
        <>
          <div className="text-[11px] tracking-[2px] text-muted uppercase mt-2 mb-1">빠른 등록</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {quickFoods.map(f => (
              <button key={f.id}
                onClick={async () => {
                  const res = await fetch('/api/ai/quick-diet', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: f.name }),
                  });
                  const r = await res.json();
                  if (r.ok) { setStatus('done'); setResult({ mode: 'quick_diet', message: r.message }); refresh(); }
                }}
                className="flex-shrink-0 glass rounded-xl px-3 py-2 active:scale-95 transition-transform">
                <div className="text-xs font-bold whitespace-nowrap">{f.name.slice(0, 10)}</div>
                <div className="text-[10px] text-accent">P{f.protein_g}g</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 최근 작업 */}
      {jobs.length > 0 && (
        <>
          <div className="text-[11px] tracking-[2px] text-muted uppercase mt-2 mb-1">최근 AI 작업</div>
          {jobs.slice(0, 5).map(j => (
            <div key={j.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.03]">
              <span className="text-muted">#{j.id}</span>
              <span>{j.type}</span>
              <span className={'ml-auto font-bold ' + (j.status === 'done' ? 'text-success' : j.status === 'failed' ? 'text-danger' : 'text-muted')}>{j.status}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
