import React from 'react';
import { ChevronDown } from 'lucide-react';

const NexusSelect = ({ label, value, onChange, options }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:4 }}>{label}</span>
    <div style={{ position:'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} className="nexus-select">
        <option value="" disabled>—</option>
        {options.map((opt, i) => { const v = typeof opt==='object'?opt.value:opt; const l = typeof opt==='object'?opt.label:opt; return <option key={i} value={v}>{l}</option>; })}
      </select>
      <ChevronDown size={14} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',pointerEvents:'none' }} />
    </div>
  </div>
);


export default NexusSelect;
