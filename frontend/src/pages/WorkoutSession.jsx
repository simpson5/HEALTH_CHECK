import { useState, useEffect, useRef } from 'react';
import { fetchData, saveExercise } from '../lib/api';
import { Card } from '../components/ui/Card';
import { TabBar } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Plus, X, Check, Dumbbell, Footprints, Timer } from 'lucide-react';

export function WorkoutSession() {
  const [DATA, setDATA] = useState(null);
  const [view, setView] = useState('select');
  const [session, setSession] = useState({ startTime: null, date: null, exercises: [] });
  const [sessionTab, setSessionTab] = useState('machine');
  const [currentExId, setCurrentExId] = useState(null);
  const [sets, setSets] = useState([]);
  const [cardioValues, setCardioValues] = useState({});
  const [elapsed, setElapsed] = useState('00:00');
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  // 초기화
  useEffect(() => {
    (async () => {
      const data = await fetchData();
      setDATA(data);

      const params = new URLSearchParams(window.location.search);
      const editDate = params.get('edit');
      const editTime = params.get('start');

      if (editDate && editTime) {
        const rec = (data.exercise_records || []).find(r => r.date === editDate && r.start_time === editTime);
        if (rec) {
          setSession({ startTime: new Date(editDate + 'T' + editTime).toISOString(), date: editDate, exercises: rec.exercises || [], editMode: true, originalStartTime: editTime });
          return;
        }
      }

      const saved = localStorage.getItem('workout_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toISOString().slice(0, 10)) {
          setSession(parsed);
          return;
        }
        localStorage.removeItem('workout_session');
      }

      setSession(s => ({ ...s, startTime: new Date().toISOString(), date: new Date().toISOString().slice(0, 10) }));
    })();
  }, []);

  // 타이머
  useEffect(() => {
    if (!session.startTime) return;
    timerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - new Date(session.startTime)) / 1000);
      setElapsed(`${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [session.startTime]);

  // 세션 저장
  useEffect(() => {
    if (session.date) localStorage.setItem('workout_session', JSON.stringify(session));
  }, [session]);

  if (!DATA) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const lib = DATA.exercise_library || [];
  const groups = { machine: [], bodyweight: [], cardio: [] };
  lib.forEach(ex => { const g = ex.group || (ex.type === 'cardio' ? 'cardio' : 'machine'); if (groups[g]) groups[g].push(ex); });

  const getLastRecord = (exId) => {
    for (const r of [...(DATA.exercise_records || [])].reverse()) {
      const ex = (r.exercises || []).find(e => e.id === exId);
      if (ex) return ex;
    }
    return null;
  };

  const doneCount = session.exercises.length;
  let totalVol = 0, totalCal = 0;
  session.exercises.forEach(e => {
    if (e.sets) totalVol += e.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.kg || 0) * (s.reps || 0), 0);
    totalCal += (e.calories_burned || 0);
  });

  // 근력 열기
  const openStrength = (exId) => {
    setCurrentExId(exId);
    const ex = lib.find(e => e.id === exId);
    const existing = session.exercises.find(s => s.id === exId);
    const prev = getLastRecord(exId);
    const defaults = (DATA.profile.exercise.daily_routine || {}).morning || {};
    const machineDefaults = defaults.machine_defaults || {};

    if (existing) {
      setSets(existing.sets.map(s => ({ ...s })));
    } else if (prev && prev.sets) {
      setSets(prev.sets.map(s => ({ kg: s.kg, reps: s.reps, completed: false })));
    } else if (machineDefaults[exId]) {
      const def = machineDefaults[exId];
      setSets(Array.from({ length: def.sets || 3 }, () => ({ kg: def.kg || '', reps: def.reps || '', completed: false })));
    } else {
      setSets([{ kg: '', reps: '', completed: false }, { kg: '', reps: '', completed: false }, { kg: '', reps: '', completed: false }]);
    }
    setView('strength');
  };

  const saveStrength = () => {
    const ex = lib.find(e => e.id === currentExId);
    const volume = sets.filter(s => s.completed).reduce((sum, s) => sum + (s.kg || 0) * (s.reps || 0), 0);
    const record = { id: currentExId, name: ex.name, type: 'strength', target: ex.target, sets, volume_kg: volume };
    setSession(s => {
      const idx = s.exercises.findIndex(e => e.id === currentExId);
      const exs = [...s.exercises];
      if (idx >= 0) exs[idx] = record; else exs.push(record);
      return { ...s, exercises: exs };
    });
    setView('select');
  };

  // 유산소 열기
  const openCardio = (exId) => {
    setCurrentExId(exId);
    const existing = session.exercises.find(s => s.id === exId);
    const prev = getLastRecord(exId);
    const src = existing || prev || {};
    setCardioValues({ duration_min: src.duration_min || '', incline_pct: src.incline_pct || '', speed_kmh: src.speed_kmh || '', level: src.level || '' });
    setView('cardio');
  };

  const saveCardio = () => {
    const ex = lib.find(e => e.id === currentExId);
    const isStairmill = currentExId === 'stairmill';
    const min = parseInt(cardioValues.duration_min) || 0;
    const cal = Math.round(min * (isStairmill ? 12 : 8));
    const record = isStairmill
      ? { id: currentExId, name: ex.name, type: 'cardio', duration_min: min, level: parseInt(cardioValues.level) || 0, calories_burned: cal }
      : { id: currentExId, name: ex.name, type: 'cardio', duration_min: min, incline_pct: parseFloat(cardioValues.incline_pct) || 0, speed_kmh: parseFloat(cardioValues.speed_kmh) || 0, calories_burned: cal };
    setSession(s => {
      const idx = s.exercises.findIndex(e => e.id === currentExId);
      const exs = [...s.exercises];
      if (idx >= 0) exs[idx] = record; else exs.push(record);
      return { ...s, exercises: exs };
    });
    setView('select');
  };

  const deleteExercise = () => {
    setSession(s => ({ ...s, exercises: s.exercises.filter(e => e.id !== currentExId) }));
    setView('select');
  };

  // 완료
  const finishWorkout = () => {
    if (session.exercises.length === 0) { alert('기록된 운동이 없습니다.'); return; }
    const dur = Math.floor((Date.now() - new Date(session.startTime)) / 60000);
    setSession(s => ({ ...s, end_time: new Date().toTimeString().slice(0, 5), total_duration_min: dur, total_volume_kg: totalVol, total_calories_burned: totalCal }));
    setView('done');
  };

  const handleSave = async () => {
    const payload = {
      date: session.date,
      start_time: session.editMode ? session.originalStartTime : new Date(session.startTime).toTimeString().slice(0, 5),
      end_time: session.end_time,
      exercises: session.exercises,
      total_duration_min: session.total_duration_min,
      total_volume_kg: session.total_volume_kg,
      total_calories_burned: session.total_calories_burned,
      memo: '',
    };
    const res = await saveExercise(payload);
    if (res.ok) {
      localStorage.removeItem('workout_session');
      setSaved(true);
    }
  };

  const currentEx = currentExId ? lib.find(e => e.id === currentExId) : null;
  const isRepsOnly = currentEx?.input_type === 'reps_only';
  const isStairmill = currentExId === 'stairmill';

  // ===== 운동 선택 =====
  if (view === 'select') return (
    <div className="min-h-screen bg-bg pb-4">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
        <button onClick={() => window.location.href = '/'} className="text-accent"><ArrowLeft size={20} /></button>
        <div className="flex-1 text-base font-bold">{session.editMode ? '운동 기록 수정' : '운동 기록'}</div>
        <div className="font-display text-xl text-accent">{elapsed}</div>
      </div>
      <div className="px-4 pt-4 space-y-3">
        <div className="flex justify-around bg-bg-card border border-white/[0.06] rounded-2xl p-3 text-center">
          <div><div className="font-display text-xl text-accent">{doneCount}</div><div className="text-[10px] text-muted">완료</div></div>
          <div><div className="font-display text-xl text-accent">{totalVol.toLocaleString()}</div><div className="text-[10px] text-muted">볼륨(kg)</div></div>
          <div><div className="font-display text-xl text-accent">{totalCal}</div><div className="text-[10px] text-muted">kcal</div></div>
        </div>
        <TabBar
          tabs={[{ id: 'machine', label: '머신' }, { id: 'bodyweight', label: '맨몸' }, { id: 'cardio', label: '유산소' }]}
          active={sessionTab} onChange={setSessionTab}
        />
        {(() => {
          const currentList = groups[sessionTab] || [];
          const favorites = currentList.filter(ex => ex.is_favorite);
          const bodypartLabels = { push: '상체 밀기', pull: '상체 당기기', legs: '하체', core: '코어', posterior: '후면사슬', cardio: '유산소' };
          const bodypartGroups = {};
          currentList.forEach(ex => {
            const bp = ex.bodypart || 'etc';
            if (!bodypartGroups[bp]) bodypartGroups[bp] = [];
            bodypartGroups[bp].push(ex);
          });

          const renderCard = (ex) => {
            const done = session.exercises.find(s => s.id === ex.id);
            const prev = getLastRecord(ex.id);
            let hint = '';
            if (done?.sets) hint = done.sets.filter(s => s.completed).length + '세트 완료';
            else if (done?.duration_min) hint = done.duration_min + '분 완료';
            else if (prev?.sets) { const ls = prev.sets[prev.sets.length - 1]; hint = ls.kg + 'kg × ' + ls.reps + '회'; }
            else if (prev?.duration_min) hint = prev.duration_min + '분';
            return (
              <div
                key={ex.id}
                onClick={() => ex.type === 'cardio' ? openCardio(ex.id) : openStrength(ex.id)}
                className={'bg-bg-card border rounded-2xl p-3.5 cursor-pointer active:scale-[0.97] transition-transform relative overflow-hidden '
                  + (done ? 'border-success/40' : 'border-white/[0.06]')}
              >
                {done && <div className="absolute top-2 right-2.5 text-success text-sm font-black">✓</div>}
                <div className="text-xl mb-1.5">{ex.type === 'cardio' ? '🏃' : '🏋️'}</div>
                <div className="text-xs font-bold leading-tight">{ex.name}</div>
                <div className="text-[10px] text-muted mt-1">{ex.target.join(', ')}</div>
                {hint && <div className={'text-[10px] mt-1.5 font-bold ' + (done ? 'text-success' : 'text-accent')}>{hint}</div>}
              </div>
            );
          };

          return (
            <>
              {favorites.length > 0 && (
                <>
                  <div className="text-[10px] text-warning tracking-[1px] uppercase mb-1">⭐ 즐겨찾기</div>
                  <div className="grid grid-cols-2 gap-2 mb-2">{favorites.map(renderCard)}</div>
                </>
              )}
              {Object.entries(bodypartGroups).map(([bp, exercises]) => (
                <div key={bp}>
                  <div className="text-[10px] text-dim tracking-[1px] uppercase mt-2 mb-1">{bodypartLabels[bp] || bp}</div>
                  <div className="grid grid-cols-2 gap-2">{exercises.map(renderCard)}</div>
                </div>
              ))}
            </>
          );
        })()}
        <button onClick={finishWorkout} className="w-full py-4 bg-success text-black font-black rounded-2xl text-sm active:scale-[0.97] transition-transform">
          운동 완료
        </button>
      </div>
    </div>
  );

  // ===== 세트 기록 =====
  if (view === 'strength') return (
    <div className="min-h-screen bg-bg pb-4">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
        <button onClick={() => { saveStrength(); }} className="text-accent"><ArrowLeft size={20} /></button>
        <div className="flex-1 text-base font-bold">{currentEx?.name}</div>
      </div>
      <div className="text-center py-4 border-b border-white/[0.06]">
        <div className="text-lg font-black">{currentEx?.name}</div>
        <div className="text-xs text-muted mt-1">{currentEx?.target.join(', ')}</div>
      </div>
      <div className="px-4 pt-4">
        <div className={`grid ${isRepsOnly ? 'grid-cols-[40px_1fr_50px_32px]' : 'grid-cols-[40px_1fr_1fr_50px_32px]'} gap-2 text-[11px] text-muted text-center mb-2`}>
          <div>세트</div>
          {!isRepsOnly && <div>KG</div>}
          <div>회</div>
          <div>완료</div>
          <div></div>
        </div>
        {sets.map((s, i) => (
          <div key={i} className={`grid ${isRepsOnly ? 'grid-cols-[40px_1fr_50px_32px]' : 'grid-cols-[40px_1fr_1fr_50px_32px]'} gap-2 mb-2 items-center`}>
            <div className="text-center font-bold text-sm text-muted">{i + 1}</div>
            {!isRepsOnly && (
              <input type="number" inputMode="numeric" value={s.kg || ''} placeholder="kg"
                className="bg-bg-elevated border border-white/[0.06] rounded-xl px-2 py-3 text-center text-base font-bold text-text w-full focus:border-accent outline-none"
                onChange={e => { const ns = [...sets]; ns[i] = { ...ns[i], kg: parseFloat(e.target.value) || 0 }; setSets(ns); }}
              />
            )}
            <input type="number" inputMode="numeric" value={s.reps || ''} placeholder="회"
              className="bg-bg-elevated border border-white/[0.06] rounded-xl px-2 py-3 text-center text-base font-bold text-text w-full focus:border-accent outline-none"
              onChange={e => { const ns = [...sets]; ns[i] = { ...ns[i], reps: parseInt(e.target.value) || 0 }; setSets(ns); }}
            />
            <button
              onClick={() => { const ns = [...sets]; ns[i] = { ...ns[i], completed: !ns[i].completed }; setSets(ns); }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all border-2
                ${s.completed ? 'bg-success border-success text-black' : 'bg-bg-elevated border-white/[0.06] text-muted'}`}
            >
              {s.completed ? '✓' : ''}
            </button>
            <button
              onClick={() => { if (sets.length <= 1) return; setSets(sets.filter((_, j) => j !== i)); }}
              className="w-7 h-7 rounded-full border border-white/[0.06] flex items-center justify-center text-danger text-sm opacity-50 active:opacity-100"
            >×</button>
          </div>
        ))}
        <button onClick={() => setSets([...sets, { kg: sets[sets.length - 1]?.kg || '', reps: sets[sets.length - 1]?.reps || '', completed: false }])}
          className="w-full py-3 bg-bg-elevated border border-dashed border-white/[0.06] rounded-xl text-muted text-sm mt-1 active:bg-bg-card">
          + 세트 추가
        </button>
        <div className="flex gap-2.5 mt-4">
          <button onClick={() => { saveStrength(); }} className="flex-1 py-3.5 bg-bg-elevated border border-white/[0.1] rounded-xl text-sm font-bold">← 목록</button>
          <button onClick={deleteExercise} className="py-3.5 px-5 bg-danger rounded-xl text-white text-sm font-bold">삭제</button>
        </div>
      </div>
    </div>
  );

  // ===== 유산소 =====
  if (view === 'cardio') return (
    <div className="min-h-screen bg-bg pb-4">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
        <button onClick={() => setView('select')} className="text-accent"><ArrowLeft size={20} /></button>
        <div className="flex-1 text-base font-bold">{currentEx?.name}</div>
      </div>
      <div className="px-4 pt-6 space-y-5">
        <div>
          <div className="text-xs text-muted mb-1.5">시간</div>
          <input type="number" inputMode="numeric" placeholder={isStairmill ? '15' : '30'} value={cardioValues.duration_min || ''}
            onChange={e => setCardioValues(v => ({ ...v, duration_min: e.target.value }))}
            className="w-full bg-bg-elevated border border-white/[0.06] rounded-xl px-4 py-3.5 text-center text-xl font-bold text-text focus:border-accent outline-none"
          />
          <div className="text-xs text-muted text-center mt-1">분</div>
        </div>
        {isStairmill ? (
          <div>
            <div className="text-xs text-muted mb-1.5">레벨</div>
            <input type="number" inputMode="numeric" placeholder="5" value={cardioValues.level || ''}
              onChange={e => setCardioValues(v => ({ ...v, level: e.target.value }))}
              className="w-full bg-bg-elevated border border-white/[0.06] rounded-xl px-4 py-3.5 text-center text-xl font-bold text-text focus:border-accent outline-none"
            />
            <div className="text-xs text-muted text-center mt-1">단계</div>
          </div>
        ) : (
          <>
            <div>
              <div className="text-xs text-muted mb-1.5">경사</div>
              <input type="number" inputMode="decimal" placeholder="12" value={cardioValues.incline_pct || ''}
                onChange={e => setCardioValues(v => ({ ...v, incline_pct: e.target.value }))}
                className="w-full bg-bg-elevated border border-white/[0.06] rounded-xl px-4 py-3.5 text-center text-xl font-bold text-text focus:border-accent outline-none"
              />
              <div className="text-xs text-muted text-center mt-1">%</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1.5">속도</div>
              <input type="number" inputMode="decimal" step="0.1" placeholder="5.5" value={cardioValues.speed_kmh || ''}
                onChange={e => setCardioValues(v => ({ ...v, speed_kmh: e.target.value }))}
                className="w-full bg-bg-elevated border border-white/[0.06] rounded-xl px-4 py-3.5 text-center text-xl font-bold text-text focus:border-accent outline-none"
              />
              <div className="text-xs text-muted text-center mt-1">km/h</div>
            </div>
          </>
        )}
        <div className="flex gap-2.5">
          <button onClick={() => setView('select')} className="flex-1 py-3.5 bg-bg-elevated border border-white/[0.1] rounded-xl text-sm font-bold">← 목록</button>
          <button onClick={saveCardio} className="flex-1 py-3.5 bg-accent text-black rounded-xl text-sm font-bold">완료</button>
        </div>
      </div>
    </div>
  );

  // ===== 완료 =====
  if (view === 'done') return (
    <div className="min-h-screen bg-bg pb-4">
      <div className="text-center pt-10 pb-6">
        <div className="text-5xl mb-3">💪</div>
        <div className="text-2xl font-black">운동 완료!</div>
        <div className="text-sm text-muted mt-1">{session.total_duration_min}분 소요 · {session.exercises.length}종 수행</div>
      </div>
      <div className="px-4 space-y-3">
        <div className="bg-bg-elevated border border-accent/15 rounded-2xl p-4 text-center">
          <div className="text-[11px] text-muted mb-1">총 볼륨</div>
          <div className="font-display text-3xl text-accent">{totalVol.toLocaleString()}<span className="text-sm font-sans text-muted ml-1">kg</span></div>
        </div>
        <div className="bg-bg-elevated border border-warning/15 rounded-2xl p-4 text-center">
          <div className="text-[11px] text-muted mb-1">추정 칼로리</div>
          <div className="font-display text-3xl text-warning">~{totalCal}<span className="text-sm font-sans text-muted ml-1">kcal</span></div>
        </div>
        {session.exercises.map((e, i) => (
          <Card key={i}>
            <div className="text-sm font-bold">{e.type === 'cardio' ? '🏃' : '🏋️'} {e.name}</div>
            <div className="text-xs text-muted mt-1">
              {e.type === 'cardio'
                ? `${e.duration_min}분${e.incline_pct ? ` · 경사${e.incline_pct}%` : ''}${e.level ? ` · 레벨${e.level}` : ''} · ~${e.calories_burned}kcal`
                : e.sets ? `${e.sets.filter(s => s.completed).map(s => s.kg + 'kg×' + s.reps).join(' / ')} · 볼륨 ${(e.volume_kg || 0).toLocaleString()}kg` : ''
              }
            </div>
          </Card>
        ))}
        <button
          onClick={saved ? () => window.location.href = '/' : handleSave}
          className={`w-full py-4 rounded-2xl text-sm font-black active:scale-[0.97] transition-transform
            ${saved ? 'bg-accent text-black' : 'bg-success text-black'}`}
        >
          {saved ? '✓ 저장 완료! (홈으로)' : '저장하기'}
        </button>
      </div>
    </div>
  );

  return null;
}
