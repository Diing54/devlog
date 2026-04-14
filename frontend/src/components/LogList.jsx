// Wraps matched text in a <mark> element for CSS highlighting
function highlight(text, term) {
  if (!term || !text) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="highlight">{part}</mark> : part
  );
}

export default function LogList({ logs, onDelete, searchTerm = '' }) {
  if (logs.length === 0) {
    return (
      <div className="empty-state">
        {searchTerm ? (
          <>
            <p>No results for "{searchTerm}"</p>
            <p className="empty-hint">Try a different keyword or clear the search.</p>
          </>
        ) : (
          <>
            <p>No entries yet.</p>
            <p className="empty-hint">Start documenting your DevOps work above.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className="log-list">
      {logs.map((log) => (
        <li key={log.id} className="log-entry">
          <div className="log-entry-top">
            <h3 className="log-title">{highlight(log.title, searchTerm)}</h3>
            <button
              className="btn-delete"
              onClick={() => onDelete(log.id)}
              aria-label="Delete log entry"
            >
              ×
            </button>
          </div>

          {log.description && (
            <p className="log-description">{highlight(log.description, searchTerm)}</p>
          )}

          {log.tags && log.tags.length > 0 && (
            <div className="tags">
              {log.tags.map((tag) => (
                <span key={tag} className={`tag${searchTerm && tag.toLowerCase().includes(searchTerm.toLowerCase()) ? ' tag-match' : ''}`}>
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
