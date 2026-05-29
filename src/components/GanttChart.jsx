import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { GanttHeader } from './GanttHeader';
import { GanttRow } from './GanttRow';
import { Sidebar } from './Sidebar';
import { TaskPopup } from './TaskPopup';
import { addDays, toISO, startOfWeek, parseDate } from '../utils/dates';

const ROW_HEIGHT = 52;
const COL_WIDTH_WEEK  = 52;
const COL_WIDTH_MONTH = 28;
const WEEK_DAYS  = 7;
const MONTH_DAYS = 30;

export function GanttChart({ rows, tasks, onAddRow, onUpdateRow, onDeleteRow, onReorderRows, onAddTask, onUpdateTask, onDeleteTask }) {
  const [view, setView]       = useState('week');   // 'week' | 'month'
  const [weekOffset, setWeekOffset] = useState(0);  // in weeks (week view) or 30-day blocks (month)
  const [popup, setPopup]     = useState(null);      // { task, position }
  const scrollRef = useRef(null);

  const colWidth = view === 'week' ? COL_WIDTH_WEEK : COL_WIDTH_MONTH;
  const numDays  = view === 'week' ? WEEK_DAYS : MONTH_DAYS;

  const viewStart = useMemo(() => {
    const base = startOfWeek(new Date());
    return addDays(base, weekOffset * (view === 'week' ? 7 : 30));
  }, [weekOffset, view]);

  const days = useMemo(() => {
    return Array.from({ length: numDays }, (_, i) => addDays(viewStart, i));
  }, [viewStart, numDays]);

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, []);

  const goToday = () => setWeekOffset(0);

  const handleDoubleClickCell = useCallback((rowId, dateStr) => {
    const endDate = toISO(addDays(parseDate(dateStr), 2));
    setPopup({
      task: { row_id: rowId, title: '', start_date: dateStr, end_date: endDate, color: '#4A90D9', task_type: 'task' },
      position: { x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 150 },
    });
  }, []);

  const handleClickTask = useCallback((task, e) => {
    setPopup({ task, position: { x: e.clientX, y: e.clientY } });
  }, []);

  const handlePopupSave = useCallback(async (data) => {
    setPopup(null);
    if (data.id) {
      await onUpdateTask(data);
    } else {
      await onAddTask(data);
    }
  }, [onUpdateTask, onAddTask]);

  const handleDeleteTask = useCallback(async (id) => {
    if (window.confirm('Delete this task?')) {
      await onDeleteTask(id);
    }
    setPopup(null);
  }, [onDeleteTask]);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#0f1117', color:'#e0e4f0', fontFamily:'system-ui,sans-serif' }}>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:'1px solid #2a2f45', background:'#13151f', flexShrink:0 }}>
        <span style={{ fontWeight:700, fontSize:16, color:'#e0e4f0', marginRight:8 }}>Team Planner</span>

        <button onClick={goToday} style={toolBtn}>Today</button>
        <button onClick={() => setWeekOffset(o => o - 1)} style={toolBtn}>‹ Prev</button>
        <button onClick={() => setWeekOffset(o => o + 1)} style={toolBtn}>Next ›</button>

        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          {['week','month'].map(v => (
            <button key={v} onClick={() => { setView(v); setWeekOffset(0); }}
              style={{ ...toolBtn, background: view===v ? '#4A90D9' : 'transparent', color: view===v ? '#fff' : '#aab' }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* Sidebar (fixed width, scrolls vertically with grid) */}
        <div style={{ flexShrink:0, overflowY:'auto', overflowX:'hidden' }}>
          <div style={{ height:57 }} /> {/* header placeholder */}
          <Sidebar
            rows={rows}
            rowHeight={ROW_HEIGHT}
            onAdd={onAddRow}
            onUpdate={onUpdateRow}
            onDelete={onDeleteRow}
            onReorder={onReorderRows}
          />
        </div>

        {/* Scrollable grid */}
        <div ref={scrollRef} style={{ flex:1, overflow:'auto' }}>
          <div style={{ width: numDays * colWidth, minWidth:'100%' }}>
            <GanttHeader days={days} colWidth={colWidth} />
            {rows.map(row => {
              const rowTasks = tasks.filter(t => t.row_id === row.id);
              return (
                <GanttRow
                  key={row.id}
                  row={row}
                  tasks={rowTasks}
                  days={days}
                  colWidth={colWidth}
                  rowHeight={ROW_HEIGHT}
                  viewStart={viewStart}
                  onUpdateTask={onUpdateTask}
                  onClickTask={handleClickTask}
                  onDeleteTask={handleDeleteTask}
                  onDoubleClickCell={handleDoubleClickCell}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Task popup */}
      {popup && (
        <TaskPopup
          task={popup.task}
          position={popup.position}
          onSave={handlePopupSave}
          onClose={() => setPopup(null)}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

const toolBtn = {
  background:'transparent', border:'1px solid #2a2f45', color:'#aab',
  borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:13,
};
