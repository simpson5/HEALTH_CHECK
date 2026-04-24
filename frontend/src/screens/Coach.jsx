import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../design/Icon';
import { TapBtn } from '../design/primitives';
import { requestCoach, pollJob } from '../lib/api';

export function Coach() {
  const nav = useNavigate();
  const loc = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  // Optional: auto-send initial question passed via nav state
  useEffect(() => {
    if (initRef.current) return;
    const q = loc.state?.initialQuestion;
    if (q) {
      initRef.current = true;
      setTimeout(() => send(q), 80);
    }
  }, [loc.state]);

  async function send(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || pending) return;
    setMessages(m => [...m, { role: 'user', text }]);
    if (!textOverride) setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
    setPending(true);
    try {
      const r = await requestCoach(text);
      if (!r.ok) {
        setMessages(m => [...m, { role: 'ai', text: r.error || 'AI 요청 실패', error: true, retryText: text }]);
        return;
      }
      const { ok, job, error } = await pollJob(r.job_id);
      if (ok) {
        const msg = job?.output?.message || job?.output?.raw || '(응답 없음)';
        setMessages(m => [...m, { role: 'ai', text: msg }]);
      } else {
        setMessages(m => [...m, { role: 'ai', text: error || '응답 지연', error: true, retryText: text }]);
      }
    } finally {
      setPending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function onInputChange(e) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }

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
        <div className="text-[14px] text-text font-medium tracking-[-0.2px]">건강 상담</div>
        <div className="w-9" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && !pending && (
          <div className="text-center text-text-dim text-[12px] py-10">
            마운자로, 단백질, 운동, 인바디 무엇이든 질문해보세요.
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} onRetry={send} />
        ))}
        {pending && (
          <div className="flex">
            <div className="bg-bg-elev-2 text-text rounded-2xl px-4 py-2.5 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line px-3 py-2.5 flex gap-2 items-end shrink-0">
        <textarea
          ref={taRef}
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="질문을 입력..."
          rows={1}
          className="flex-1 bg-bg-elev-2 border border-line rounded-[14px] px-3 py-2 text-[14px] text-text outline-none resize-none min-h-10 max-h-32 leading-[1.4]"
        />
        <TapBtn variant="accent" onClick={() => send()} disabled={!input.trim() || pending}>
          <Icon.send s={14} />
        </TapBtn>
      </div>
    </div>
  );
}

function Bubble({ msg, onRetry }) {
  const isUser = msg.role === 'user';
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-accent text-accent-on rounded-2xl px-4 py-2.5 max-w-[80%] text-[14px] leading-[1.45] whitespace-pre-wrap break-words">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-1 max-w-[88%]">
      <div className={`rounded-2xl px-4 py-2.5 text-[14px] leading-[1.45] whitespace-pre-wrap break-words ${msg.error ? 'bg-down/10 text-down border border-down/30' : 'bg-bg-elev-2 text-text'}`}>
        {msg.text}
      </div>
      {msg.error && msg.retryText && (
        <button
          type="button"
          onClick={() => onRetry(msg.retryText)}
          className="text-[11px] text-accent bg-transparent border-none cursor-pointer font-mono"
        >
          다시 시도 ↻
        </button>
      )}
    </div>
  );
}
