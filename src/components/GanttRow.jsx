import { TaskBar } from './TaskBar';
import { isToday, isWeekend, toISO, parseDate, diffDays } from '../utils/dates';

export function GanttRow({ row, tasks, days, colWidth, rowHeight, viewStart, onUpdateTask, onClickTask, onDeleteTask, onDoubleClickCell }) {
  return (
    <div style={{ display:'flex', position:'relative', height:rowHeight, borderBottom:'1px solid #1e2130' }}>
      {/* Day columns (background stripes) */}
      {days.map((d, i) => (
        <div
          key={i}
          onDoubleClick={() => onDoubleClickCell(row.id, toISO(d))}
          style={{
            width: colWidth, minWidth: colWidth, height:'100%',
            borderRight: '1px solid #1e2130',
            background: isToday(d) ? 'rgba(74,144,217,0.05)' : isWeekend(d) ? 'rgba(0,0,0,0.12)' : 'transparent',
            flexShrink: 0,
          }}
        />
      ))}

      {/* Task bars (absolutely positioned) */}
      {tasks.map(task => (
        <TaskBar
          key={task.id}
          task={task}
          colWidth={colWidth}
          rowHeight={rowHeight}
          viewStart={viewStart}
          onUpdate={onUpdateTask}
          onClick={(e) => { e.stopPropagation(); onClickTask(task, e); }}
          onContextMenu={(e) => { e.preventDefault(); onDeleteTask(task.id); }}
        />
      ))}
    </div>
  );
}
