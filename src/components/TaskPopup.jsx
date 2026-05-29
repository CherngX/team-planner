import { useState, useEffect, useRef } from 'react';

const COLORS = ['#4A90D9','#7B68EE','#50C878','#FF6B6B','#FFB347','#40E0D0','#DDA0DD','#F08080'];

export function TaskPopup({ task, position, onSave, onClose, onDelete }) {
  const [title, setTitle]     = useState(task.title || '');
  const [start, setStart]     = useState(task.start_date || '');
  const [end, setEnd]         = useState(task.end_date || '');
  const [color, setColor]     = useState(task.color || '#4A90D9');
  const [type, setType]       = useState(task.task_type || 'task');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const save = () => {
    if (!title.trim() || !start || !end) return;
    onSave({ ...task, title: title.trim(), start_date: start, end_date: end, color, task_type: type });
  };

  const style = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320) + 'px',
    top: Math.min(position.y, window.innerHeight - 320) + 'px',
    zIndex: 1000,
    background: '#1e2130',
    border: '1px solid #3a3f55',
    borderRadius: '10px',
    padding: '16px',
    width: '300px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  };

  return (
    <div ref={ref} style={style} onMouseDown={e => e.stopPropagation()}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ color:'#aab', fontSize:12, textTransform:'uppercase', letterSpacing:1 }}>
          {task.id ? 'Edit Task' : 'New Task'}
        </span>
        <button onClick={onClose} style={btnStyle('#333','#aaa')}>✕</button>
      </div>

      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && save()}
        placeholder="Task title…"
        style={inputStyle}
      />

      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>Start</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex:1 }}>
          <label style={labelStyle}>End</label>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom:10 }}>
        <label style={labelStyle}>Type</label>
        <div style={{ display:'flex', gap:8 }}>
          {['task','leave'].map(t => (
            <button key={t} onClick={() => { setType(t); if(t==='leave') setColor('#FF6B35'); }}
              style={btnStyle(type===t ? '#4A90D9' : '#2a2f45', '#fff', type===t)}>
              {t === 'task' ? 'Task' : 'Leave'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>Color</label>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width:24, height:24, borderRadius:'50%', background:c, border:color===c ? '2px solid #fff' : '2px solid transparent',
              cursor:'pointer', padding:0,
            }} />
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={save} style={{ ...btnStyle('#4A90D9','#fff',true), flex:1 }}>Save</button>
        {task.id && (
          <button onClick={() => onDelete(task.id)} style={btnStyle('#c0392b','#fff',true)}>Delete</button>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width:'100%', background:'#2a2f45', border:'1px solid #3a3f55', borderRadius:6,
  color:'#e0e4f0', padding:'7px 10px', fontSize:13, marginBottom:10, boxSizing:'border-box',
};
const labelStyle = { display:'block', color:'#778', fontSize:11, marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 };
const btnStyle = (bg, color, filled) => ({
  background: filled ? bg : 'transparent', color, border: `1px solid ${bg}`,
  borderRadius:6, padding:'6px 14px', cursor:'pointer', fontSize:13,
});
