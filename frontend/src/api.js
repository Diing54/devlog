// In Docker: nginx proxies /api → backend:3000
// In local dev: vite proxy forwards /api → localhost:3000
const BASE = '/api';

export async function getLogs() {
  const res = await fetch(`${BASE}/logs`);
  if (!res.ok) throw new Error(`GET /api/logs failed: ${res.status}`);
  return res.json(); // { source: 'cache'|'database', data: [...] }
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
