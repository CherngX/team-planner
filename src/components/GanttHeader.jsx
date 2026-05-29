import { isToday, isWeekend, getDayLabel, formatMonth } from '../utils/dates';

export function GanttHeader({ days, colWidth }) {
  // Group days by month for the top label row
  const months = [];
  days.forEach((d, i) => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!months.length || months[months.length - 1].key !== key) {
      months.push({ key, label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), start: i, count: 1 });
    } else {
      months[months.length - 1].count++;
    }
  });

  return (
    <div style={{ position:'sticky', top:0, zIndex:10, background:'#13151f', borderBottom:'1px solid #2a2f45' }}>
      {/* Month row */}
      <div style={{ display:'flex', height:24, borderBottom:'1px solid #2a2f45' }}>
        {months.map(m => (
          <div key={m.key} style={{
            width: m.count * colWidth, minWidth: m.count * colWidth,
            display:'flex', alignItems:'center', paddingLeft:8,
            fontSize:11, color:'#778', borderRight:'1px solid #2a2f45',
            overflow:'hidden', whiteSpace:'nowrap',
          }}>
            {m.label}
          </div>
        ))}
      </div>
      {/* Day row */}
      <div style={{ display:'flex', height:32 }}>
        {days.map((d, i) => {
          const today = isToday(d);
          const weekend = isWeekend(d);
          return (
            <div key={i} style={{
              width: colWidth, minWidth: colWidth,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, borderRight:'1px solid #1e2130',
              color: today ? '#4A90D9' : weekend ? '#445' : '#778',
              background: today ? 'rgba(74,144,217,0.08)' : 'transparent',
              fontWeight: today ? 700 : 400,
            }}>
              {getDayLabel(d)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
