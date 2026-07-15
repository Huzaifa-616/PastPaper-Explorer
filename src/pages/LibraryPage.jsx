import React, { useState, useMemo } from 'react';
import { Activity, ArrowLeft, Beaker, ChevronRight, ExternalLink, FileText, Folder, Library, Moon, Sun, Terminal, Zap } from 'lucide-react';
import { libraryUrl } from '../config/assets';

const FullLibraryPage = ({ initialSubject, libraryDb, onBackToHub, toggleTheme, dark }) => {
  const [subjectCode, setSubjectCode] = useState(initialSubject || '');
  const [currentPath, setCurrentPath] = useState([]);

  const brandColors = {
    '9618': { hex: 'var(--teal)', name: 'Computer Science', icon: <Terminal size={16}/> },
    '9702': { hex: 'var(--amber)', name: 'Physics', icon: <Zap size={16}/> },
    '9701': { hex: 'var(--rose)', name: 'Chemistry', icon: <Beaker size={16}/> },
    '9700': { hex: 'var(--green)', name: 'Biology', icon: <Activity size={16}/> },
    '9709': { hex: 'var(--accent)', name: 'Mathematics', icon: <Activity size={16}/> },
    '9231': { hex: 'var(--accent)', name: 'Further Mathematics', icon: <Activity size={16}/> },
  };

  const currentBrand = brandColors[subjectCode] || { hex: 'var(--text)', name: 'Library' };

  const rootFolder = useMemo(() => libraryDb?.find(f => f.name === subjectCode) || null, [libraryDb, subjectCode]);

  const currentItems = useMemo(() => {
    if (!subjectCode) {
      // Always show ALL supported subjects. Merge real library folders with
      // placeholders for subjects that have no files yet, so the grid is
      // complete and consistent (never silently missing a subject).
      const existing = new Map((libraryDb || []).map(f => [f.name, f]));
      return Object.keys(brandColors).map(code =>
        existing.get(code) || { name: code, type: 'folder', children: [], _empty: true }
      );
    }
    let current = rootFolder?.children || [];
    for (let step of currentPath) {
      const found = current.find(c => c.name === step && c.type === 'folder');
      if (found) current = found.children || [];
      else break;
    }
    return current;
  }, [libraryDb, subjectCode, rootFolder, currentPath]);

  const navigateTo = (idx) => {
     if (idx === -1) { setSubjectCode(''); setCurrentPath([]); }
     else if (idx === 0) { setCurrentPath([]); }
     else { setCurrentPath(prev => prev.slice(0, idx)); }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', background:'var(--bg)' }}>
      
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'60vh', background:`radial-gradient(ellipse at top, ${currentBrand.hex} 0%, transparent 60%)`, opacity: dark ? 0.08 : 0.05, pointerEvents:'none', zIndex: 0, transition:'background 0.5s ease' }}/>
      <div className="bg-grid" />

      <header className="full-lib-header" style={{ padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10, position:'relative', borderBottom:'1px solid var(--line2)', background:'var(--bg2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button className="icon-btn" onClick={onBackToHub} title="Back to Hub"><ArrowLeft size={16}/></button>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Library size={18} color="var(--bg)" strokeWidth={2.5}/>
            </div>
            <div>
              <h1 style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text)' }}>Resource Library</h1>
              <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', color:'var(--text3)', textTransform:'uppercase' }}>Expanded View</p>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="icon-btn" onClick={toggleTheme}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
        </div>
      </header>

      <main className="full-lib-main" style={{ flex:1, display:'flex', flexDirection:'column', padding:'32px 40px', zIndex:10, position:'relative', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 32, flexWrap:'wrap' }}>
           <button onClick={()=>navigateTo(-1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:600, color: !subjectCode ? 'var(--text)' : 'var(--text3)', transition:'color 0.2s' }}>All Subjects</button>
           {subjectCode && <ChevronRight size={16} color="var(--text3)"/>}
           {subjectCode && (
             <button onClick={()=>navigateTo(0)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:600, color: currentPath.length === 0 ? currentBrand.hex : 'var(--text3)', transition:'color 0.2s', display:'flex', alignItems:'center', gap:6 }}>
               {brandColors[subjectCode]?.name || subjectCode}
             </button>
           )}
           {currentPath.map((step, idx) => (
             <React.Fragment key={idx}>
               <ChevronRight size={16} color="var(--text3)"/>
               <button onClick={()=>navigateTo(idx+1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:600, color: idx === currentPath.length - 1 ? 'var(--text)' : 'var(--text3)', transition:'color 0.2s' }}>
                 {step}
               </button>
             </React.Fragment>
           ))}
        </div>

        {currentItems.length === 0 ? (
           <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--text3)', opacity:0.6 }}>
             <Folder size={64} style={{ marginBottom: 16 }} />
             <p style={{ fontSize: 16, fontWeight: 600 }}>This folder is empty.</p>
           </div>
        ) : (
          <div className="full-lib-grid">
            {currentItems.map((item, i) => {
              if (item.type === 'folder') {
                 return (
                   <button key={i} className="glass-panel" onClick={() => { if(!subjectCode) { setSubjectCode(item.name); setCurrentPath([]); } else { setCurrentPath(prev => [...prev, item.name]); } }}
                      style={{ padding:24, borderRadius:20, cursor:'pointer', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'flex-start', border:'1px solid var(--line2)', background:'var(--surface2)', textAlign:'left' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = currentBrand.hex; e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
                      <Folder size={32} color={item._empty ? 'var(--text3)' : (brandColors[item.name]?.hex || currentBrand.hex)} style={{ marginBottom: 16 }} />
                      <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{brandColors[item.name]?.name || item.name}</h3>
                      <p style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>{item._empty ? 'Coming soon' : `${item.children?.length || 0} items`}</p>
                   </button>
                 )
              } else {
                 return (
                    <a key={i} href={libraryUrl(item.path)} target="_blank" rel="noopener noreferrer" className="glass-panel"                      
                      style={{ padding:24, borderRadius:20, cursor:'pointer', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'flex-start', border:'1px solid var(--line2)', background:'var(--surface2)', textDecoration:'none' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
                      <FileText size={32} color="var(--rose)" style={{ marginBottom: 16 }} />
                      <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:8, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.name}</h3>
                      <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
                        <span style={{ fontSize:11, color:'var(--text3)', background:'var(--surface3)', padding:'4px 8px', borderRadius:6, fontWeight:600 }}>{item.size}</span>
                        <ExternalLink size={14} color="var(--text3)"/>
                      </div>
                   </a>
                 )
              }
            })}
          </div>
        )}
      </main>
    </div>
  );
};


export default FullLibraryPage;
