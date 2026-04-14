const BASE = '/api';

// q is optional — pass empty string or omit for all logs
export async function getLogs(q = '') {
  const url = q ? `${BASE}/logs?q=${encodeURIComponent(q)}` : `${BASE}/logs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export async function createLog({ title, description, tags }) {
  const res = await fetch(`${BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, tags }),
  });
  if (!res.ok) throw new Error(`POST /api/logs failed: ${res.status}`);
  return res.json();
}

export async function deleteLog(id) {
  const res = await fetch(`${BASE}/logs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE /api/logs/${id} failed: ${res.status}`);
}
