const BASE = '/planner/api';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, opts);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  getRows: () => req('/rows.php'),
  createRow: (data) => req('/rows.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateRow: (data) => req('/rows.php', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteRow: (id) => req(`/rows.php?id=${id}`, { method: 'DELETE' }),
  reorderRows: (rows) => req('/rows.php', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: rows[0]?.id, rows }) }),

  getTasks: (from, to) => req(`/tasks.php?from=${from}&to=${to}`),
  createTask: (data) => req('/tasks.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateTask: (data) => req('/tasks.php', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteTask: (id) => req(`/tasks.php?id=${id}`, { method: 'DELETE' }),

  sync: (since) => req(`/sync.php?since=${since}`),
};
