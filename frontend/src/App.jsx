import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { DataProvider } from './hooks/useData.jsx';
import { MobileShell } from './layout/MobileShell';
import { Home } from './screens/Home';
import { Meal } from './screens/Meal';
import { Weight } from './screens/Weight';
import { Workout } from './screens/Workout';
import { Record } from './screens/Record';
import { Session } from './screens/Session';
import { Calendar } from './screens/Calendar';
import { Guide } from './screens/Guide';
import { Settings } from './screens/Settings';

function HomeRouter() {
  const [params] = useSearchParams();
  const tab = params.get('tab') || 'home';
  switch (tab) {
    case 'diet':     return <Meal />;
    case 'weight':   return <Weight />;
    case 'exercise': return <Workout />;
    case 'record':   return <Record />;
    default:         return <Home />;
  }
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MobileShell />}>
            <Route path="/" element={<HomeRouter />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/session" element={<Session />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
