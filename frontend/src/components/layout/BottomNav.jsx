import { BarChart3, BookOpen, Settings, Camera, FolderUp } from 'lucide-react';
import { uploadPhoto } from '../../lib/api';
import { useState, useRef } from 'react';

const links = [
  { href: '/', icon: BarChart3, label: '대시보드' },
  { href: '/guide', icon: BookOpen, label: '가이드' },
  { href: '/settings', icon: Settings, label: '설정' },
];

export function BottomNav() {
  const [toast, setToast] = useState('');
  const camRef = useRef(null);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    let count = 0;
    for (const file of files) {
      const res = await uploadPhoto(file);
      if (res.ok) count++;
    }
    const icon = count > 1 ? '📁' : (files[0].type.startsWith('image') ? '📷' : '📄');
    setToast(`${icon} ${count}개 업로드 완료`);
    setTimeout(() => setToast(''), 2500);
    e.target.value = '';
  };

  return (
    <>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-success text-black px-4 py-2 rounded-lg text-xs font-bold z-[200] animate-pulse">
          {toast}
        </div>
      )}

      {/* 카메라 + 파일 버튼 */}
      <button
        onClick={() => fileRef.current?.click()}
        className="fixed bottom-[130px] right-4 w-12 h-12 rounded-full bg-info border-none text-white text-lg flex items-center justify-center z-[101] shadow-lg shadow-info/30 active:scale-90 transition-transform"
      >
        <FolderUp size={20} />
      </button>
      <button
        onClick={() => camRef.current?.click()}
        className="fixed bottom-[72px] right-4 w-12 h-12 rounded-full bg-accent border-none text-black text-lg flex items-center justify-center z-[101] shadow-lg shadow-accent/30 active:scale-90 transition-transform"
      >
        <Camera size={20} />
      </button>
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
      <input ref={fileRef} type="file" accept="image/*,.csv,.txt,.xlsx" multiple className="hidden" onChange={handleUpload} />

      {/* 하단 네비 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#06060b]/70 backdrop-blur-2xl border-t border-white/[0.06] z-[100] pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {links.map(link => {
            const Icon = link.icon;
            const isActive = window.location.pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center py-2.5 text-[10px] transition-colors
                  ${isActive ? 'text-accent' : 'text-muted'}`}
              >
                <Icon size={18} className="mb-0.5" />
                {link.label}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
