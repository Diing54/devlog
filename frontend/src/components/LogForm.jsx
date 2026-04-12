import { useState } from 'react';

export default function LogForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setSubmitError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        // Turn "docker, nginx, ci-cd" into ["docker", "nginx", "ci-cd"]
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setTitle('');
      setDescription('');
      setTags('');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="log-form" onSubmit={handleSubmit}>
      <h2>New Entry</h2>

      <input
        type="text"
        className="input"
        placeholder="What did you build? e.g. Set up nginx reverse proxy"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="input textarea"
        placeholder="Notes, links, lessons learned... (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <input
        type="text"
        className="input"
        placeholder="Tags: docker, kubernetes, ci-cd (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      {submitError && <p className="form-error">{submitError}</p>}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Saving...' : '+ Log It'}
      </button>
    </form>
  );
}
