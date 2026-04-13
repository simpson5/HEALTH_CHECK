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
    <div className="min-h-screen bg-bg pb-10">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
        <a href="/" className="text-accent"><ArrowLeft size={20} /></a>
        <div className="flex-1 text-base font-bold">설정</div>
      </div>

      <div className="px-4 pt-4 space-y-3">
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
            settings.recent_jobs.map(j => (
              <div key={j.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.03] last:border-0">
                <span className="text-muted">#{j.id}</span>
                <span className="flex-1">{j.type}</span>
                <span className={'font-bold ' + (j.status === 'done' ? 'text-success' : j.status === 'failed' ? 'text-danger' : 'text-muted')}>
                  {j.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted text-center py-3">작업 없음</div>
          )}
        </Card>
      </div>
    </div>
  );
}
