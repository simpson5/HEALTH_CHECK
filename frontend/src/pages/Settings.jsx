import { useState, useEffect } from 'react';
import { Card, CardTitle } from '../components/ui/Card';
import { ArrowLeft, Save, Check, AlertCircle } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState(null);
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      setSettings(s);
    });
  }, []);

  const handleSave = async () => {
    await fetch('/api/settings/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // 새로고침
    const s = await (await fetch('/api/settings')).json();
    setSettings(s);
    setToken('');
  };

  return (
    <div className="pb-10 animate-in">
      <div className="text-base font-bold mb-4">⚙️ 설정</div>
      <div className="space-y-3">
        {/* Claude 인증 */}
        <Card elevated>
          <CardTitle>Claude AI 인증</CardTitle>
          <div className="flex items-center gap-2 mb-3">
            {settings?.ai_configured ? (
              <><Check size={14} className="text-success" /><span className="text-xs text-success">인증됨</span>
                <span className="text-[10px] text-muted ml-1">{settings.token_preview}</span></>
            ) : (
              <><AlertCircle size={14} className="text-warning" /><span className="text-xs text-warning">미설정</span></>
            )}
          </div>
          <input
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="OAuth 토큰 붙여넣기..."
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-text placeholder:text-dim focus:border-accent/30 outline-none mb-2 font-mono"
          />
          <button onClick={handleSave}
            className={'w-full py-3 rounded-xl text-xs font-bold transition-all '
              + (saved ? 'bg-success text-black' : 'bg-accent text-black')}>
            {saved ? '✅ 저장 완료' : '저장'}
          </button>
          <div className="text-[10px] text-muted mt-2">
            토큰 발급: 터미널에서 <code className="bg-white/[0.05] px-1 rounded">claude setup-token</code> 실행
          </div>
        </Card>

        {/* 서버 상태 */}
        <Card>
          <CardTitle>서버 상태</CardTitle>
          {settings && (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">DB 기록</span>
                <span>{settings.db_records}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">사진</span>
                <span>{settings.photo_count}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">AI 엔진</span>
                <span className={settings.ai_configured ? 'text-success' : 'text-warning'}>
                  {settings.ai_configured ? '사용 가능' : '토큰 필요'}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* 최근 AI 작업 */}
        <Card>
          <CardTitle>최근 AI 작업</CardTitle>
          {settings?.recent_jobs?.length > 0 ? (
            settings.recent_jobs.map(j => {
              const typeLabels = { diet_draft: '🍽️ 식단 분석', daily_report: '📊 일일 리포트', coach: '💬 건강 상담' };
              const statusLabels = { done: '✅ 완료', failed: '❌ 실패', running: '🔄 진행 중', queued: '⏳ 대기' };
              const time = j.finished_at || j.created_at;
              const timeStr = time ? time.slice(11, 16) : '';
              return (
                <div key={j.id} className="flex items-center gap-2 text-xs py-2 border-b border-white/[0.03] last:border-0">
                  <span className="flex-1">{typeLabels[j.type] || j.type}</span>
                  <span className="text-[10px] text-dim">{timeStr}</span>
                  <span className={'text-[11px] font-bold ' + (j.status === 'done' ? 'text-success' : j.status === 'failed' ? 'text-danger' : 'text-muted')}>
                    {statusLabels[j.status] || j.status}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-muted text-center py-3">작업 없음</div>
          )}
        </Card>
      </div>
    </div>
  );
}
