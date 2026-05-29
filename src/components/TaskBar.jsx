import { useRef, useCallback } from 'react';
import { parseDate, diffDays, addDays, toISO } from '../utils/dates';

export function TaskBar({ task, colWidth, rowHeight, onUpdate, onClick, onContextMenu, viewStart }) {
  const startD  = parseDate(task.start_date);
  const endD    = parseDate(task.end_date);
  const left    = diffDays(viewStart, startD) * colWidth;
  const width   = Math.max((diffDays(startD, endD) + 1) * colWidth, colWidth);
  const isLeave = task.task_type === 'leave';

  const dragging   = useRef(null);
  const taskRef    = useRef({ start: task.start_date, end: task.end_date });

  const onMouseDownBar = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const startX = e.clientX;
    const origStart = parseDate(task.start_date);
    const origEnd   = parseDate(task.end_date);
    const dur = diffDays(origStart, origEnd);

    const onMove = (me) => {
      const dx = Math.round((me.clientX - startX) / colWidth);
      if (dx === 0) return;
      const newStart = addDays(origStart, dx);
      const newEnd   = addDays(origEnd,   dx);
      onUpdate({ id: task.id, start_date: toISO(newStart), end_date: toISO(newEnd) });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [task, colWidth, onUpdate]);

  const onMouseDownResize = useCallback((e) => {
    e.stopPropagation();
    const startX   = e.clientX;
    const origEnd  = parseDate(task.end_date);

    const onMove = (me) => {
      const dx = Math.round((me.clientX - startX) / colWidth);
      if (dx === 0) return;
      const newEnd = addDays(origEnd, dx);
      if (newEnd < parseDate(task.start_date)) return;
      onUpdate({ id: task.id, end_date: toISO(newEnd) });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [task, colWidth, onUpdate]);

  const barColor = isLeave ? '#FF6B35' : (task.color || '#4A90D9');

  return (
    <div
      onMouseDown={onMouseDownBar}
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{
        position: 'absolute',
        left,
        width: width - 4,
        height: rowHeight - 12,
        top: 6,
        background: barColor,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 20,
        cursor: 'grab',
        userSelect: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        opacity: isLeave ? 0.88 : 1,
        border: isLeave ? '1px solid rgba(255,255,255,0.15)' : 'none',
        minWidth: 0,
      }}
    >
      <span style={{
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        pointerEvents: 'none',
      }}>
        {task.title}
      </span>

      {/* Resize handle */}
      <div
        onMouseDown={onMouseDownResize}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 10,
          height: '100%',
          cursor: 'ew-resize',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '0 6px 6px 0',
        }}
      />
    </div>
  );
}
