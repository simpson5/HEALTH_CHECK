import { BarChart3, CalendarDays, BookOpen, Settings } from 'lucide-react';

const links = [
  { href: '/', icon: BarChart3, label: '대시보드' },
  { href: '/calendar', icon: CalendarDays, label: '달력' },
  { href: '/guide', icon: BookOpen, label: '건강팁' },
  { href: '/settings', icon: Settings, label: '설정' },
];

export function BottomNav() {
  return (
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
  );
}
