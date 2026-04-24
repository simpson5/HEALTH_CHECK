import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../design/Icon';
import { Card } from '../design/primitives';
import { fetchAiJobs } from '../lib/api';

const JOB_TYPE_LABEL = {
  diet_draft: '식단 분석',
  daily_report: '일일 리포트',
  coach: '건강 상담',
  quick_diet: '빠른 기록',
  inbody_parse: '인바디 파싱',
  weekly_report: '주간 리포트',
};
const JOB_STATUS_LABEL = {
  done: '완료',
  failed: '실패',
  running: '진행중',
  queued: '대기',
};

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'diet_draft', label: '식단' },
  { key: 'daily_report', label: '일일' },
  { key: 'coach', label: '상담' },
  { key: 'inbody_parse', label: '인바디' },
  { key: 'weekly_report', label: '주간' },
];

export function AIJobsAll() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetchAiJobs(100).then(d => setJobs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.type === filter);

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
        <div className="text-[14px] text-text font-medium tracking-[-0.2px]">AI 작업 이력</div>
        <div className="w-9" />
      </div>

      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto nosb">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`shrink-0 h-7 px-3 rounded-full border cursor-pointer text-[11px] font-mono tracking-[0.3px] ${
                filter === f.key
                  ? 'bg-accent text-accent-on border-accent'
                  : 'bg-transparent text-text-mid border-line'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {filtered.length === 0 ? (
          <div className="text-center text-text-dim text-[12px] py-12">작업 없음</div>
        ) : (
          <Card pad={0}>
            {filtered.map((j, i, a) => {
              const time = (j.started_at || j.created_at)?.slice(11, 16) || '--:--';
              const date = (j.created_at || '').slice(0, 10);
              const label = JOB_TYPE_LABEL[j.type] || j.type;
              const statusLabel = JOB_STATUS_LABEL[j.status] || j.status;
              const statusClass =
                j.status === 'done' ? 'text-up'
                : j.status === 'failed' ? 'text-down'
                : 'text-text-dim';
              const isOpen = openId === j.id;
              return (
                <div key={j.id} className={i === a.length - 1 ? '' : 'border-b border-line'}>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : j.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left"
                  >
                    <span className="w-14 text-[10px] text-text-dim font-mono tracking-[0.3px]">
                      {date.slice(5)} {time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-text tracking-[-0.2px]">{label}</div>
                      <div className="text-[10px] text-text-dim font-mono mt-0.5 truncate">
                        {j.output?.message || j.input?.memo || j.input?.question || '—'}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono tracking-[0.3px] ${statusClass}`}>{statusLabel}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 space-y-2">
                      {j.input && (
                        <DetailBlock title="입력" content={j.input} />
                      )}
                      {j.output && (
                        <DetailBlock title="출력" content={j.output} />
                      )}
                      {j.error && (
                        <DetailBlock title="에러" content={j.error} isError />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailBlock({ title, content, isError }) {
  const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  return (
    <div>
      <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase mb-1">{title}</div>
      <pre className={`text-[11px] font-mono whitespace-pre-wrap break-words ${isError ? 'text-down' : 'text-text-mid'}`}>
        {text}
      </pre>
    </div>
  );
}
