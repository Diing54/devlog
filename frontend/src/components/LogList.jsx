export default function LogList({ logs, onDelete }) {
  if (logs.length === 0) {
    return (
      <div className="empty-state">
        <p>No entries yet.</p>
        <p className="empty-hint">Start documenting your DevOps work above.</p>
      </div>
    );
  }

  return (
    <ul className="log-list">
      {logs.map((log) => (
        <li key={log.id} className="log-entry">
          <div className="log-entry-top">
            <h3 className="log-title">{log.title}</h3>
            <button
              className="btn-delete"
              onClick={() => onDelete(log.id)}
              aria-label="Delete log entry"
            >
              ×
            </button>
          </div>

          {log.description && (
            <p className="log-description">{log.description}</p>
          )}

          {log.tags && log.tags.length > 0 && (
            <div className="tags">
              {log.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <time className="log-time" dateTime={log.created_at}>
            {new Date(log.created_at).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  );
}
