import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../design/Icon';
import { Card, TapBtn, SectionLabel, Toast } from '../design/primitives';
import { getWeekRange } from '../lib/utils';
import { requestWeeklyReport, pollJob } from '../lib/api';

export function WeeklyReport() {
  const nav = useNavigate();
  const [offset, setOffset] = useState(0); // 0 = 이번 주, -1 = 지난 주
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [toast, setToast] = useState('');

  const range = getWeekRange(offset);

  function showToast(m) {
    setToast(m);
    setTimeout(() => setToast(''), 1800);
  }

  async function generate() {
    setLoading(true);
    setReport(null);
    try {
      const r = await requestWeeklyReport(range.start, range.end);
      if (!r.ok) return showToast(r.error || '요청 실패');
      const { ok, job, error } = await pollJob(r.job_id, { maxMs: 180_000 });
      if (!ok) return showToast(error || '생성 실패');
      const payload = job?.output?.payload || job?.output || {};
      setReport(payload);
    } finally {
      setLoading(false);
    }
  }

  const TABS = [
    { key: 0, label: '이번 주' },
    { key: -1, label: '지난 주' },
  ];

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
        <div className="text-[14px] text-text font-medium tracking-[-0.2px]">주간 AI 리포트</div>
        <div className="w-9" />
      </div>

      <div className="px-4 pt-3 shrink-0">
        <div className="flex gap-1 p-1 bg-bg-elev rounded-[12px]">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setOffset(t.key); setReport(null); }}
              className={`flex-1 h-8 rounded-[9px] border-none cursor-pointer text-[12px] font-medium ${
                offset === t.key ? 'bg-bg-elev-3 text-text' : 'bg-transparent text-text-dim'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="text-[11px] text-text-dim font-mono tracking-[0.3px] text-center">
          {range.start} ~ {range.end}
        </div>

        {!report && (
          <>
            {/* 미리보기 카드 — design_handoff §3 Empty state 패턴 */}
            <Card pad={20}>
              <div className="text-[12px] text-text-mid mb-2">
                {offset === 0 ? '아직 이번 주 리포트가 없어요' : '아직 지난 주 리포트가 없어요'}
              </div>
              <div className="text-[14px] text-text leading-relaxed mb-3.5">
                지금 만들면 이런 내용을 볼 수 있어요:
              </div>
              <ul className="space-y-2 text-[12px] text-text-mid">
                {[
                  '이번 주 평균 체중 · 변화량',
                  '식단 단백질 달성률 · 부족 끼니',
                  '운동 횟수 · 강도 · 휴식 패턴',
                  '인바디 변화 (근육·체지방)',
                  'AI 추천 다음 주 액션',
                ].map(t => (
                  <li key={t} className="flex gap-2.5 items-start">
                    <span className="text-sage mt-0.5">·</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={generate}
                  disabled={loading}
                  className="w-full py-3.5 rounded-[12px] bg-amber text-[#1a1208] font-bold text-[14px] border-none cursor-pointer disabled:opacity-50 active:scale-[.98] transition-transform"
                >
                  {loading ? '생성 중... (최대 3분)' : '지금 생성'}
                </button>
              </div>
            </Card>
            {loading && (
              <div className="text-center text-text-dim text-[11px] font-mono mt-4 inline-flex items-center justify-center gap-2 w-full animate-pulse-soft">
                <span className="text-amber">AI</span>
                체중·식단·운동·인바디 데이터를 분석 중...
              </div>
            )}
          </>
        )}

        {report && (
          <>
            <Section title="한줄 요약">{report.summary}</Section>
            <Section title="체중 변화">{report.weight_trend}</Section>
            <Section title="식단 분석">{report.diet_analysis}</Section>
            <Section title="운동 분석">{report.exercise_analysis}</Section>
            {Array.isArray(report.highlights) && report.highlights.length > 0 && (
              <Card pad={16}>
                <div className="text-[10px] text-text-dim font-mono tracking-[0.5px] uppercase mb-2">잘한 점</div>
                <ul className="space-y-1.5">
                  {report.highlights.map((h, i) => (
                    <li key={i} className="text-[13px] text-text tracking-[-0.2px] flex gap-2">
                      <span className="text-accent">·</span><span>{h}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            <Section title="다음 주 조언" accent>{report.advice}</Section>

            <div className="pt-2">
              <TapBtn full variant="soft" onClick={generate} disabled={loading}>
                {loading ? '재생성 중...' : '다시 생성'}
              </TapBtn>
            </div>
          </>
        )}
      </div>

      <Toast text={toast} />
    </div>
  );
}

function Section({ title, children, accent }) {
  if (!children) return null;
  return (
    <Card pad={16}>
      <div className={`text-[10px] font-mono tracking-[0.5px] uppercase mb-2 ${accent ? 'text-accent' : 'text-text-dim'}`}>
        {title}
      </div>
      <div className="text-[13px] text-text tracking-[-0.2px] leading-[1.55] whitespace-pre-wrap">
        {children}
      </div>
    </Card>
  );
}
