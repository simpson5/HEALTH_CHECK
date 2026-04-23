import { useEffect, useState } from 'react';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import { Card, SectionLabel, Toast } from '../design/primitives';
import Icon from '../design/Icon';
import { daysSince } from '../lib/utils';

const JOB_TYPE_LABEL = {
  diet_draft: '식단 분석',
  daily_report: '일일 리포트',
  coach: '건강 상담',
  quick_diet: '빠른 기록',
};
const JOB_STATUS_LABEL = {
  done: '완료',
  failed: '실패',
  running: '진행중',
  queued: '대기',
};

export function Settings() {
  const { data, loading } = useData();
  const [settings, setSettings] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [toast, setToast] = useState('');
  const [openJob, setOpenJob] = useState(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});
    fetch('/api/ai/jobs').then(r => r.json()).then(d => setJobs(Array.isArray(d) ? d : d.jobs || [])).catch(() => {});
  }, []);

  if (loading || !data) return <LoadingScreen />;

  const profile = data.profile || {};
  const dPlus = profile.medication_start ? daysSince(profile.medication_start) : 0;
  const proGoal = profile.daily_targets?.protein_g || 110;
  const calGoal = profile.daily_targets?.calories_kcal || 1500;
  const goal = profile.goal_weight_kg || 80;
  const initial = (profile.name || 'S').charAt(0);

  const aiConfigured = settings?.ai_configured;
  const dbRecords = settings?.db_records ?? '--';
  const photoCount = settings?.photo_count ?? '--';
  const jobsCount = settings?.recent_jobs?.length ?? jobs.length;

  function showToast(m) {
    setToast(m);
    setTimeout(() => setToast(''), 1600);
  }

  return (
    <div className="pb-[100px]">
      <div className="px-5 pt-3">
        <div className="text-[11px] text-text-dim font-mono tracking-[1px] uppercase">계정</div>
        <div className="text-[22px] text-text font-medium mt-1 tracking-[-0.5px]">설정</div>
      </div>

      {/* Profile */}
      <div className="mx-5 mt-[18px]">
        <Card pad={16}>
          <div className="flex gap-3.5 items-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-[22px] font-serif font-medium"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-protein))',
                color: '#171309',
              }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] text-text font-medium tracking-[-0.3px]">{profile.name || 'Simpson'}</div>
              <div className="text-[11px] text-text-dim font-mono mt-0.5 truncate">
                simpson301599@gmail.com · D+{dPlus}
              </div>
            </div>
            <Icon.chev s={16} />
          </div>
        </Card>
      </div>

      {/* AI connection */}
      <SectionLabel>AI 연결</SectionLabel>
      <div className="mx-5">
        <Card pad={14}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span
              className={`w-2 h-2 rounded-full ${aiConfigured ? 'bg-up' : 'bg-down'}`}
              style={aiConfigured ? { boxShadow: '0 0 8px var(--color-up)' } : undefined}
            />
            <span className="text-[13px] text-text tracking-[-0.2px]">
              {aiConfigured ? '인증됨 · Claude Haiku 4.5' : '미인증'}
            </span>
            <div className="flex-1" />
            <span className={`text-[10px] font-mono tracking-[0.5px] ${aiConfigured ? 'text-up' : 'text-text-dim'}`}>
              {aiConfigured ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-line">
            {[
              ['식단 기록', dbRecords],
              ['사진', photoCount],
              ['AI 작업', jobsCount],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] text-text-dim font-mono tracking-[0.4px] uppercase">{k}</div>
                <div className="text-[16px] text-text font-medium mt-0.5 tracking-[-0.3px]">{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Preferences */}
      <SectionLabel>환경설정</SectionLabel>
      <div className="mx-5">
        <Card pad={0}>
          {[
            ['목표 체중', `${goal} kg`],
            ['일일 단백질', `${proGoal} g`],
            ['일일 칼로리', `${calGoal} kcal`],
            ['알림', '켜짐'],
            ['단위', '메트릭'],
            ['데이터 내보내기', 'CSV · JSON'],
          ].map(([k, v], i, a) => (
            <button
              type="button"
              key={k}
              onClick={() => showToast('준비 중')}
              className={`w-full flex items-center px-4 py-3.5 bg-transparent border-none cursor-pointer text-left ${
                i === a.length - 1 ? '' : 'border-b border-line'
              }`}
            >
              <span className="flex-1 text-[13px] text-text tracking-[-0.2px]">{k}</span>
              <span className="text-[12px] text-text-mid font-mono mr-2">{v}</span>
              <Icon.chev s={14} />
            </button>
          ))}
        </Card>
      </div>

      {/* Recent AI jobs */}
      <SectionLabel right={<span className="text-accent">전체 →</span>}>최근 AI 작업</SectionLabel>
      <div className="mx-5">
        <Card pad={0}>
          {jobs.length === 0 ? (
            <div className="px-4 py-6 text-center text-text-dim text-[12px]">최근 AI 작업 없음</div>
          ) : (
            jobs.slice(0, 4).map((j, i, a) => {
              const time = (j.started_at || j.created_at)?.slice(11, 16) || '--:--';
              const label = JOB_TYPE_LABEL[j.type] || j.type;
              const statusLabel = JOB_STATUS_LABEL[j.status] || j.status;
              const statusClass =
                j.status === 'done'
                  ? 'text-up'
                  : j.status === 'failed'
                    ? 'text-down'
                    : 'text-text-dim';
              const sub = (j.output_json && (() => {
                try { return JSON.parse(j.output_json).message; } catch { return null; }
              })()) || (j.input_json && (() => {
                try { return JSON.parse(j.input_json).memo; } catch { return null; }
              })()) || '';
              const isOpen = openJob === j.id;
              return (
                <div
                  key={j.id}
                  className={`${i === a.length - 1 ? '' : 'border-b border-line'}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenJob(isOpen ? null : j.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left"
                  >
                    <span className="w-10 text-[10px] text-text-dim font-mono tracking-[0.3px]">{time}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-text tracking-[-0.2px]">{label}</div>
                      {sub && <div className="text-[10px] text-text-dim font-mono mt-0.5 truncate">{sub}</div>}
                    </div>
                    <span className={`text-[10px] font-mono tracking-[0.3px] ${statusClass}`}>{statusLabel}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 text-[11px] text-text-mid font-mono whitespace-pre-wrap break-words">
                      {j.error ? (
                        <span className="text-down">{j.error}</span>
                      ) : (
                        j.output_json || j.input_json || '(데이터 없음)'
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </Card>
      </div>

      <Toast text={toast} />
    </div>
  );
}
