import { useState, useEffect, useCallback } from 'react';
import LogForm from './components/LogForm';
import LogList from './components/LogList';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import { getLogs, createLog, deleteLog } from './api';
import { useDebounce } from './hooks/useDebounce';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const debouncedSearch = useDebounce(searchInput, 400);

  const fetchLogs = useCallback(async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const result = await getLogs(query);
      setLogs(result.data);
      setSource(result.source);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(debouncedSearch);
  }, [debouncedSearch, fetchLogs]);

  const handleCreate = async (logData) => {
    await createLog(logData);
    await fetchLogs(debouncedSearch);
  };

  const handleDelete = async (id) => {
    await deleteLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleClear = () => setSearchInput('');

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div>
            <h1>DevLog<span className="cursor">_</span></h1>
            <p>Personal DevOps Activity Tracker</p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="main">
        <LogForm onSubmit={handleCreate} />

        <div className="log-section">
          <div className="log-section-header">
            <h2>Activity Log</h2>
            {source && !searchInput && (
              <span className={`source-badge ${source}`}>
                {source === 'cache' ? '⚡ cached' : '🗄 live'}
              </span>
            )}
          </div>

          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onClear={handleClear}
            resultCount={logs.length}
            isSearching={loading && !!searchInput}
          />

          {loading && !searchInput && <p className="state-msg">Loading...</p>}
          {error && <p className="state-msg error">Error: {error}</p>}
          {!loading && !error && (
            <LogList logs={logs} onDelete={handleDelete} searchTerm={debouncedSearch} />
          )}
        </div>
      </main>
    </div>
  );
}
