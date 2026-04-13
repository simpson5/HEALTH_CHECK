import { useState, useEffect } from 'react';
import { DataProvider } from './hooks/useData.jsx';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Diet } from './pages/Diet';
import { Weight } from './pages/Weight';
import { Exercise } from './pages/Exercise';
import { Record } from './pages/Record';
import { Calendar } from './pages/Calendar';
import { WorkoutSession } from './pages/WorkoutSession';
import { Guide } from './pages/Guide';
import { Foods } from './pages/Foods';
import { Settings } from './pages/Settings';

const tabPages = { home: Home, diet: Diet, weight: Weight, exercise: Exercise, record: Record };

export default function App() {
  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'home';
  });
  const [route, setRoute] = useState(window.location.pathname + window.location.search);

  useEffect(() => {
    const handlePop = () => setRoute(window.location.pathname + window.location.search);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // 별도 페이지 라우팅
  if (route.startsWith('/workout-session')) return <DataProvider><WorkoutSession /></DataProvider>;
  if (route.startsWith('/guide')) return <DataProvider><Layout activeTab="" onTabChange={setTab}><Guide /></Layout></DataProvider>;
  if (route.startsWith('/foods')) return <DataProvider><Layout activeTab="" onTabChange={setTab}><Foods /></Layout></DataProvider>;
  if (route.startsWith('/settings')) return <DataProvider><Layout activeTab="" onTabChange={setTab}><Settings /></Layout></DataProvider>;
  if (route.startsWith('/calendar')) return <DataProvider><Layout activeTab="" onTabChange={setTab}><Calendar /></Layout></DataProvider>;

  const Page = tabPages[tab] || Home;

  return (
    <DataProvider>
      <Layout activeTab={tab} onTabChange={setTab}>
        <Page />
      </Layout>
    </DataProvider>
  );
}
