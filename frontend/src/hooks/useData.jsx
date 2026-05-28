import { useState, useEffect, createContext, useContext } from 'react';
import { fetchData } from '../lib/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const refresh = async () => {
    setRetrying(true);
    try {
      const d = await fetchData();
      setData(d);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  // 데이터를 한 번도 못 받았는데 연결 실패 → 전체 화면 에러 (개별 화면 수정 불필요)
  if (error && !data) {
    return <ConnectionError onRetry={refresh} retrying={retrying} />;
  }

  return (
    <DataContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

function ConnectionError({ onRetry, retrying }) {
  return (
    <div className="fixed inset-0 bg-bg text-text flex flex-col items-center justify-center px-8 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-2 border border-line flex items-center justify-center text-[24px] mb-4">
        🔌
      </div>
      <div className="text-[16px] font-bold tracking-[-0.3px]">서버에 연결할 수 없어요</div>
      <div className="text-[13px] text-text-mid mt-2 leading-relaxed max-w-[280px]">
        서버가 꺼져 있거나 네트워크가 불안정합니다.
        잠시 후 다시 시도해주세요.
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-6 px-6 py-3 rounded-[12px] bg-amber text-[#1a1208] font-bold text-[14px] border-none cursor-pointer active:scale-[.98] transition-transform disabled:opacity-50"
      >
        {retrying ? '연결 중...' : '다시 시도'}
      </button>
    </div>
  );
}

export function useData() {
  return useContext(DataContext);
}
