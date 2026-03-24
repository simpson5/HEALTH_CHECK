import { useState, useEffect, createContext, useContext } from 'react';
import { fetchData } from '../lib/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const d = await fetchData();
    setData(d);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <DataContext.Provider value={{ data, loading, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
