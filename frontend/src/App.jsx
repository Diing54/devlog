import { useState, useEffect, useCallback } from 'react';
import LogForm from './components/LogForm';
import LogList from './components/LogList';
import { getLogs, createLog, deleteLog } from './api';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getLogs();
      setLogs(result.data);
      setSource(result.source);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleCreate = async (logData) => {
    await createLog(logData);
    await fetchLogs();
  };

  const handleDelete = async (id) => {
    await deleteLog(id);
    // Optimistic update: remove from state immediately
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1>DevLog<span className="cursor">_</span></h1>
          <p>Personal DevOps Activity Tracker</p>
        </div>
      </header>

      <main className="main">
        <LogForm onSubmit={handleCreate} />

        <div className="log-section">
          <div className="log-section-header">
            <h2>Activity Log</h2>
            {source && (
              <span className={`source-badge ${source}`}>
                {source === 'cache' ? '⚡ cached' : '🗄 live'}
              </span>
            )}
          </div>

          {loading && <p className="state-msg">Loading...</p>}
          {error && <p className="state-msg error">Error: {error}</p>}
          {!loading && !error && (
            <LogList logs={logs} onDelete={handleDelete} />
          )}
        </div>
      </main>
    </div>
  );
}
