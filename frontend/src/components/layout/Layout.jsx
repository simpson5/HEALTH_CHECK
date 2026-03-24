import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

export function Layout({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen pb-16">
      <TopNav active={activeTab} onChange={onTabChange} />
      <main className="px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
