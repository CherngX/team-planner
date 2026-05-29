import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';

export function useGanttData() {
  const [rows, setRows] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastSync = useRef(0);

  const load = useCallback(async () => {
    try {
      const [r, t] = await Promise.all([api.getRows(), api.getTasks('2020-01-01', '2030-12-31')]);
      setRows(r);
      setTasks(t);
      lastSync.current = Math.floor(Date.now() / 1000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll every 5s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const data = await api.sync(lastSync.current);
        lastSync.current = data.server_ts;
        setRows(data.rows);
        setTasks(prev => {
          const updated = new Map(prev.map(t => [t.id, t]));
          data.tasks.forEach(t => updated.set(t.id, t));
          return Array.from(updated.values());
        });
      } catch {/* silent */}
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Row operations
  const addRow = useCallback(async (name, color) => {
    const r = await api.createRow({ name, color });
    setRows(prev => [...prev, r]);
    return r;
  }, []);

  const updateRow = useCallback(async (data) => {
    await api.updateRow(data);
    setRows(prev => prev.map(r => r.id === data.id ? { ...r, ...data } : r));
  }, []);

  const deleteRow = useCallback(async (id) => {
    await api.deleteRow(id);
    setRows(prev => prev.filter(r => r.id !== id));
    setTasks(prev => prev.filter(t => t.row_id !== id));
  }, []);

  const reorderRows = useCallback(async (newRows) => {
    const withPositions = newRows.map((r, i) => ({ ...r, position: i }));
    setRows(withPositions);
    await api.reorderRows(withPositions);
  }, []);

  // Task operations
  const addTask = useCallback(async (data) => {
    const res = await api.createTask(data);
    const task = { ...data, id: res.id, updated_at: new Date().toISOString() };
    setTasks(prev => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback(async (data) => {
    await api.updateTask(data);
    setTasks(prev => prev.map(t => t.id === data.id ? { ...t, ...data } : t));
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { rows, tasks, loading, addRow, updateRow, deleteRow, reorderRows, addTask, updateTask, deleteTask };
}
