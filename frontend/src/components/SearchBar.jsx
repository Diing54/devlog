export default function SearchBar({ value, onChange, onClear, resultCount, isSearching }) {
  return (
    <div className="search-wrapper">
      <div className="search-input-row">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          className="input search-input"
          placeholder="Search logs by title, description, or tag..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search logs"
        />
        {value && (
          <button className="search-clear" onClick={onClear} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      {value && (
        <p className="search-meta">
          {isSearching
            ? 'Searching...'
            : `${resultCount} result${resultCount !== 1 ? 's' : ''} for "${value}"`}
        </p>
      )}
    </div>
  );
}
