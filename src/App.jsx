import { GanttChart } from './components/GanttChart';
import { useGanttData } from './hooks/useGanttData';

export default function App() {
  const {
    rows, tasks, loading,
    addRow, updateRow, deleteRow, reorderRows,
    addTask, updateTask, deleteTask,
  } = useGanttData();

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh',
        background:'#0f1117', color:'#778', fontFamily:'system-ui', fontSize:16 }}>
        Loading…
      </div>
    );
  }

  return (
    <GanttChart
      rows={rows}
      tasks={tasks}
      onAddRow={addRow}
      onUpdateRow={updateRow}
      onDeleteRow={deleteRow}
      onReorderRows={reorderRows}
      onAddTask={addTask}
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
    />
  );
}
