import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData.jsx';
import { LoadingScreen } from './_Loading';
import {
  Card, SectionLabel, Toast,
  NumberSettingRow, ToggleSettingRow, MenuSettingRow,
} from '../design/primitives';
import Icon from '../design/Icon';
import { daysSince, getToday } from '../lib/utils';
import { updateProfile, fetchAiJobs } from '../lib/api';

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
  const nav = useNavigate();
  const { data, loading, refresh } = useData();
  const [settings, setSettings] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [toast, setToast] = useState('');
  const [openJob, setOpenJob] = useState(null);
  const [notify, setNotify] = useState(() => {
    try { return localStorage.getItem('sh:notify') !== '0'; }
    catch { return true; }
  });

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});
    fetchAiJobs().then(d => setJobs(Array.isArray(d) ? d : d.jobs || [])).catch(() => {});
  }, []);

  async function saveProfile(patch, successMsg) {
    const r = await updateProfile(patch);
    if (r.ok) {
      refresh();
      showToast(successMsg || '저장됨');
    } else {
      showToast(r.error || '저장 실패');
    }
  }

  function toggleNotify(next) {
    try { localStorage.setItem('sh:notify', next ? '1' : '0'); }
    catch { /* Safari private mode fallback: keep memory state only */ }
    setNotify(next);
    showToast(next ? '알림 켜짐' : '알림 꺼짐');
  }

  async function handleExport(format) {
    try {
      const data = await fetch('/api/data').then(r => r.json());
      const filename = `simpson_health_${getToday()}.${format}`;
      let blob;
      if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      } else {
        blob = new Blob([dietToCsv(data.diet_records || [])], { type: 'text/csv;charset=utf-8' });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      showToast(`${filename} 다운로드`);
    } catch {
      showToast('내보내기 실패');
    }
  }

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
          <NumberSettingRow
            label="목표 체중"
            value={goal}
            unit="kg"
            onSave={v => saveProfile({ goal_weight_kg: v }, '목표 체중 저장')}
          />
          <NumberSettingRow
            label="일일 단백질"
            value={proGoal}
            unit="g"
            onSave={v => saveProfile({ daily_protein_target: Math.round(v) }, '단백질 목표 저장')}
          />
          <NumberSettingRow
            label="일일 칼로리"
            value={calGoal}
            unit="kcal"
            onSave={v => saveProfile({ daily_calorie_target: Math.round(v) }, '칼로리 목표 저장')}
          />
          <ToggleSettingRow label="알림" checked={notify} onChange={toggleNotify} />
          <MenuSettingRow
            label="데이터 내보내기"
            valueLabel="CSV · JSON"
            options={[
              { label: 'CSV (식단 기록)', value: 'csv' },
              { label: 'JSON (전체 데이터)', value: 'json' },
            ]}
            onSelect={handleExport}
            last
          />
        </Card>
      </div>

      {/* Recent AI jobs */}
      <SectionLabel
        right={
          <button
            type="button"
            onClick={() => nav('/ai-jobs')}
            className="text-accent bg-transparent border-none cursor-pointer text-[11px] font-mono"
          >
            전체 →
          </button>
        }
      >
        최근 AI 작업
      </SectionLabel>
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
              const sub = j.output?.message || j.input?.memo || j.input?.question || '';
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
                      ) : j.output ? (
                        JSON.stringify(j.output, null, 2)
                      ) : j.input ? (
                        JSON.stringify(j.input, null, 2)
                      ) : (
                        '(데이터 없음)'
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

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function dietToCsv(records) {
  const headers = ['날짜', '시간', '끼니', '음식', '분량', '칼로리', '단백질(g)', '탄수(g)', '지방(g)', '메모'];
  const keys = ['date', 'time', 'meal_type', 'food_name', 'quantity', 'calories_kcal', 'protein_g', 'carbs_g', 'fat_g', 'memo'];
  const lines = [headers.join(',')];
  for (const r of records) lines.push(keys.map(k => csvEscape(r[k])).join(','));
  return '﻿' + lines.join('\r\n');
}
