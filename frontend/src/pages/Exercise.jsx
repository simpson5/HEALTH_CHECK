import { useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { Card, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { TabBar } from '../components/ui/Tabs';
import { DateNav } from '../components/ui/DateNav';
import { Badge } from '../components/ui/Badge';
import { fmtDateFull, getToday } from '../lib/utils';
import { deleteExercise } from '../lib/api';
import { Flame, Dumbbell, Footprints } from 'lucide-react';

export function Exercise() {
  const { data, loading, refresh } = useData();
  const [exDate, setExDate] = useState(getToday());
  const [guideTab, setGuideTab] = useState('machine');

  if (loading || !data) return <div className="text-center text-muted py-10">로딩 중...</div>;

  const allEx = data.exercise_records || [];
  const recs = allEx.filter(r => r.date === exDate);

  // 주간 현황
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const mondayStr = monday.toISOString().slice(0, 10);
  const weekTarget = (data.profile.weekly_targets || {}).exercise_count || 4;
  const weekExDates = new Set(allEx.filter(r => r.date >= mondayStr).map(r => r.date));
  const weekCount = weekExDates.size;

  // 연속 쉰 일수
  let restDays = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (allEx.find(r => r.date === d.toISOString().slice(0, 10))) break;
    restDays++;
  }

  // 가이드 그룹
  const lib = data.exercise_library || [];
  const groups = { machine: [], bodyweight: [], cardio: [] };
  lib.forEach(ex => {
    const g = ex.group || (ex.type === 'cardio' ? 'cardio' : 'machine');
    if (groups[g]) groups[g].push(ex);
  });

  const getLastRecord = (exId) => {
    for (const r of [...allEx].reverse()) {
      const ex = (r.exercises || []).find(e => e.id === exId);
      if (ex) return ex;
    }
    return null;
  };

  const moveDate = (dir) => {
    const d = new Date(exDate);
    d.setDate(d.getDate() + dir);
    if (d.toISOString().slice(0, 10) > getToday()) return;
    setExDate(d.toISOString().slice(0, 10));
  };

  const handleDelete = async (date, startTime) => {
    if (!confirm('이 운동 기록을 삭제할까요?')) return;
    await deleteExercise(date, startTime);
    refresh();
  };

  const restColor = restDays >= 3 ? 'text-danger' : restDays >= 1 ? 'text-warning' : 'text-success';

  return (
    <div className="space-y-3">
      {/* 주간 현황 */}
      <Card>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="!mb-0">이번 주 운동</CardTitle>
          <div className={`flex items-center gap-1 text-xs font-bold ${restColor}`}>
            {restDays === 0 ? '오늘 운동함' : `${restDays}일째 쉬는 중`}
          </div>
        </div>
        <div className="flex justify-between items-center mb-1.5">
          <div className={`text-sm font-bold ${weekCount >= weekTarget ? 'text-success' : ''}`}>
            {weekCount} / {weekTarget}회
          </div>
          <div className="text-[11px] text-muted">{Math.round(weekCount / weekTarget * 100)}%</div>
        </div>
        <ProgressBar value={weekCount} max={weekTarget} color={weekCount >= weekTarget ? 'success' : weekCount > 0 ? 'warning' : 'danger'} />
      </Card>

      {/* 운동 시작 */}
      <a
        href="/workout-session"
        className="block text-center py-4 bg-gradient-to-r from-accent to-success text-black text-base font-black rounded-2xl no-underline shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] active:scale-[0.97] transition-all animate-pulse-glow"
      >
        ▶ 운동 시작
      </a>

      {/* 날짜별 기록 */}
      <DateNav label={fmtDateFull(exDate)} onPrev={() => moveDate(-1)} onNext={() => moveDate(1)} />

      {recs.length === 0 ? (
        <div className="text-center text-muted text-sm py-4">이 날 운동 기록 없음</div>
      ) : (
        recs.map((rec, ri) => (
          <div key={ri}>
            {rec.exercises.map((e, ei) => (
              <Card key={ei}>
                <div className="flex items-center gap-2 mb-1">
                  {e.type === 'cardio' ? <Footprints size={14} className="text-warning" /> : <Dumbbell size={14} className="text-accent" />}
                  <span className="text-xs font-bold">{e.name}</span>
                </div>
                {e.type === 'cardio' ? (
                  <div className="text-[11px] text-muted">{e.duration_min || '?'}분 · 경사{e.incline_pct || '?'}% · {e.speed_kmh || '?'}km/h · ~{e.calories_burned || '?'}kcal</div>
                ) : e.sets ? (
                  <>
                    <div className="text-[11px] text-muted">{e.sets.filter(s => s.completed).map(s => `${s.kg}kg×${s.reps}`).join(' / ')}</div>
                    <div className="text-[11px] text-accent mt-0.5">볼륨 {e.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.kg || 0) * (s.reps || 0), 0).toLocaleString()}kg</div>
                  </>
                ) : null}
              </Card>
            ))}
            {(rec.total_volume_kg || rec.total_calories_burned) && (
              <div className="text-center text-xs mb-2">
                <Badge color="accent">볼륨 {(rec.total_volume_kg || 0).toLocaleString()}kg</Badge>
                <Badge color="warning" className="ml-1">~{rec.total_calories_burned || 0}kcal</Badge>
                <Badge color="muted" className="ml-1">{rec.total_duration_min || '?'}분</Badge>
              </div>
            )}
            <div className="flex justify-center gap-4 mb-3">
              <a href={`/workout-session.html?edit=${rec.date}&start=${rec.start_time}`} className="text-xs text-accent">✏️ 수정</a>
              <button onClick={() => handleDelete(rec.date, rec.start_time)} className="text-xs text-danger">🗑️ 삭제</button>
            </div>
          </div>
        ))
      )}

      {/* 운동 가이드 */}
      <div className="text-[11px] tracking-[2px] text-muted uppercase mt-4 mb-2">운동 가이드</div>
      <TabBar
        tabs={[
          { id: 'machine', label: `머신` },
          { id: 'bodyweight', label: `맨몸` },
          { id: 'cardio', label: `유산소` },
        ]}
        active={guideTab}
        onChange={setGuideTab}
      />
      <div className="space-y-2">
        {(() => {
          const currentList = groups[guideTab] || [];
          const favorites = currentList.filter(ex => ex.is_favorite);
          const bodypartLabels = { push: '상체 밀기 (가슴/어깨/삼두)', pull: '상체 당기기 (등/이두)', legs: '하체', core: '코어', posterior: '후면사슬', cardio: '유산소' };
          const bodypartGroups = {};
          currentList.forEach(ex => {
            const bp = ex.bodypart || 'etc';
            if (!bodypartGroups[bp]) bodypartGroups[bp] = [];
            bodypartGroups[bp].push(ex);
          });

          const renderExCard = (ex) => {
            const prev = getLastRecord(ex.id);
            let prevText = '';
            if (prev && prev.sets) {
              const ls = prev.sets[prev.sets.length - 1];
              prevText = ls.kg + 'kg × ' + ls.reps + '회 × ' + prev.sets.length + '세트';
            } else if (prev && prev.duration_min) {
              prevText = prev.duration_min + '분';
            }
            return (
              <Card key={ex.id}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{ex.type === 'cardio' ? '🏃' : '🏋️'}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{ex.name} {ex.is_favorite ? '⭐' : ''}</div>
                    <div className="text-[11px] text-muted">{ex.target.join(', ')}</div>
                    {prevText && <div className="text-[11px] text-accent mt-0.5">최근: {prevText}</div>}
                  </div>
                </div>
              </Card>
            );
          };

          return (
            <>
              {favorites.length > 0 && (
                <>
                  <div className="text-[10px] text-warning tracking-[1px] uppercase mt-1 mb-1">⭐ 즐겨찾기</div>
                  {favorites.map(renderExCard)}
                </>
              )}
              {Object.entries(bodypartGroups).map(([bp, exercises]) => (
                <div key={bp}>
                  <div className="text-[10px] text-dim tracking-[1px] uppercase mt-3 mb-1">{bodypartLabels[bp] || bp}</div>
                  {exercises.map(renderExCard)}
                </div>
              ))}
            </>
          );
        })()}
      </div>
    </div>
  );
}
