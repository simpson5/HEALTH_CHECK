import { useState, useEffect } from 'react';
import { DataProvider } from './hooks/useData.jsx';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Diet } from './pages/Diet';
import { Weight } from './pages/Weight';
import { Exercise } from './pages/Exercise';
import { Calendar } from './pages/Calendar';
import { History } from './pages/History';
import { WorkoutSession } from './pages/WorkoutSession';
import { Guide } from './pages/Guide';
import { Foods } from './pages/Foods';

const tabPages = { home: Home, diet: Diet, weight: Weight, exercise: Exercise, calendar: Calendar, history: History };

export default function App() {
  const [tab, setTab] = useState('home');
  const [route, setRoute] = useState(window.location.pathname + window.location.search);

  useEffect(() => {
    const handlePop = () => setRoute(window.location.pathname + window.location.search);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  // 라우팅
  if (route.startsWith('/workout-session')) {
    return <DataProvider><WorkoutSession /></DataProvider>;
  }
  if (route.startsWith('/guide')) {
    return <DataProvider><Guide /></DataProvider>;
  }
  if (route.startsWith('/foods')) {
    return <DataProvider><Foods /></DataProvider>;
  }

  const Page = tabPages[tab] || Home;

  return (
    <DataProvider>
      <Layout activeTab={tab} onTabChange={setTab}>
        <Page />
      </Layout>
    </DataProvider>
  );
}
