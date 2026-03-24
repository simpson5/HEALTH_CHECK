import { useState } from 'react';
import { DataProvider } from './hooks/useData.jsx';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Diet } from './pages/Diet';
import { Weight } from './pages/Weight';
import { Exercise } from './pages/Exercise';
import { Calendar } from './pages/Calendar';
import { History } from './pages/History';

const pages = { home: Home, diet: Diet, weight: Weight, exercise: Exercise, calendar: Calendar, history: History };

export default function App() {
  const [tab, setTab] = useState('home');
  const Page = pages[tab] || Home;

  return (
    <DataProvider>
      <Layout activeTab={tab} onTabChange={setTab}>
        <Page />
      </Layout>
    </DataProvider>
  );
}
