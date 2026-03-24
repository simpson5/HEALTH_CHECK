import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

export function Layout({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen pb-16 relative">
      {/* Ambient orbs */}
      <div className="ambient-orb orb-cyan" />
      <div className="ambient-orb orb-purple" />

      <TopNav active={activeTab} onChange={onTabChange} />
      <main className="relative z-10 px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
