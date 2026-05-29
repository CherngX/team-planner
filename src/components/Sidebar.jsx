import { useState, useRef } from 'react';

const COLORS = ['#4A90D9','#7B68EE','#50C878','#FF6B6B','#FFB347','#40E0D0','#DDA0DD'];

export function Sidebar({ rows, onAdd, onUpdate, onDelete, onReorder, rowHeight }) {
  const [newName, setNewName]   = useState('');
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState('');
  const [addColor, setAddColor] = useState('#4A90D9');
  const dragIdx = useRef(null);
  const dragOver = useRef(null);

  const handleAdd = () => {
    const n = newName.trim();
    if (!n) return;
    onAdd(n, addColor);
    setNewName('');
  };

  const startEdit = (row) => { setEditId(row.id); setEditName(row.name); };
  const commitEdit = (row) => {
    const n = editName.trim();
    if (n && n !== row.name) onUpdate({ id: row.id, name: n });
    setEditId(null);
  };

  const onDragStart = (i) => { dragIdx.current = i; };
  const onDragEnter = (i) => { dragOver.current = i; };
  const onDragEnd   = () => {
    if (dragIdx.current === null || dragOver.current === null || dragIdx.current === dragOver.current) {
      dragIdx.current = dragOver.current = null;
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(dragOver.current, 0, moved);
    dragIdx.current = dragOver.current = null;
    onReorder(next);
  };

  return (
    <div style={sidebarStyle}>
      <div style={{ padding:'10px 0 6px 12px', color:'#778', fontSize:11, textTransform:'uppercase', letterSpacing:1 }}>
        Team / Projects
      </div>
      {rows.map((row, i) => (
        <div key={row.id}
          draggable
          onDragStart={() => onDragStart(i)}
          onDragEnter={() => onDragEnter(i)}
          onDragEnd={onDragEnd}
          onDragOver={e => e.preventDefault()}
          style={{ ...rowItemStyle, height: rowHeight }}
        >
          <span style={{ width:10, height:10, borderRadius:'50%', background:row.color, flexShrink:0 }} />
          {editId === row.id ? (
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={() => commitEdit(row)}
              onKeyDown={e => { if(e.key==='Enter') commitEdit(row); if(e.key==='Escape') setEditId(null); }}
              style={editInputStyle}
            />
          ) : (
            <span
              style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer', fontSize:13 }}
              onDoubleClick={() => startEdit(row)}
              title={row.name}
            >{row.name}</span>
          )}
          <button onClick={() => onDelete(row.id)} style={deleteBtnStyle} title="Delete row">×</button>
        </div>
      ))}
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 10px', borderTop:'1px solid #2a2f45' }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add person…"
          style={addInputStyle}
        />
        <ColorPicker value={addColor} onChange={setAddColor} />
        <button onClick={handleAdd} style={addBtnStyle} title="Add row">+</button>
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width:20, height:20, borderRadius:'50%', background:value, border:'2px solid #444', cursor:'pointer', padding:0 }} />
      {open && (
        <div style={{ position:'absolute', bottom:'100%', left:0, background:'#1e2130', border:'1px solid #3a3f55',
          borderRadius:8, padding:8, display:'flex', flexWrap:'wrap', gap:6, width:120, zIndex:200 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => { onChange(c); setOpen(false); }}
              style={{ width:20, height:20, borderRadius:'50%', background:c,
                border:value===c?'2px solid #fff':'2px solid transparent', cursor:'pointer', padding:0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

const sidebarStyle = {
  width: 180, minWidth:180, background:'#13151f', borderRight:'1px solid #2a2f45',
  display:'flex', flexDirection:'column', userSelect:'none',
};
const rowItemStyle = {
  display:'flex', alignItems:'center', gap:8, padding:'0 10px',
  borderBottom:'1px solid #1e2130', cursor:'grab',
};
const editInputStyle = {
  flex:1, background:'transparent', border:'none', borderBottom:'1px solid #4A90D9',
  color:'#e0e4f0', fontSize:13, outline:'none', padding:'2px 0',
};
const addInputStyle = {
  flex:1, background:'#1e2130', border:'1px solid #2a2f45', borderRadius:5,
  color:'#e0e4f0', fontSize:12, padding:'4px 8px', outline:'none',
};
const addBtnStyle = {
  background:'#4A90D9', color:'#fff', border:'none', borderRadius:5,
  width:24, height:24, cursor:'pointer', fontSize:16, lineHeight:1, padding:0,
};
const deleteBtnStyle = {
  background:'transparent', border:'none', color:'#445', cursor:'pointer',
  fontSize:16, padding:'0 2px', opacity:0.5,
};
