import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder, Library, X, FileType2, Presentation, Table2, Image, FileArchive, Video, Music, Code2, BookOpen, Globe, File } from 'lucide-react';
import { subjectName } from '../config/constants';

// Icon + colour per file kind (the indexer now tags every file).
const KIND_ICON = {
  pdf:     { icon: FileText,    color: 'var(--rose)' },
  doc:     { icon: FileType2,   color: 'var(--accent)' },
  slides:  { icon: Presentation,color: 'var(--amber)' },
  sheet:   { icon: Table2,      color: 'var(--green)' },
  image:   { icon: Image,       color: 'var(--violet, #a78bfa)' },
  archive: { icon: FileArchive, color: 'var(--text2)' },
  video:   { icon: Video,       color: 'var(--rose)' },
  audio:   { icon: Music,       color: 'var(--teal)' },
  code:    { icon: Code2,       color: 'var(--teal)' },
  book:    { icon: BookOpen,    color: 'var(--amber)' },
  text:    { icon: FileText,    color: 'var(--text2)' },
  web:     { icon: Globe,       color: 'var(--accent)' },
  file:    { icon: File,        color: 'var(--text3)' },
};
import { libraryUrl } from '../config/assets';

const LibrarySidebar = ({ subjectCode, libraryDb, onClose }) => {
  const subjName = subjectCode ? subjectName(subjectCode) : null;
  const [expanded, setExpanded] = useState({});

  const targetFolder = useMemo(() => {
    if (!subjectCode) return { children: libraryDb }; 
    return libraryDb?.find(f => f.name === subjectCode) || null;
  }, [libraryDb, subjectCode]);

  const toggleFolder = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes, currentPath = '') => {
    if (!nodes) return null;
    return nodes.map((node) => {
      const nodePath = `${currentPath}/${node.name}`;
      if (node.type === 'folder') {
        const isExp = expanded[nodePath];
        return (
          <div key={nodePath} style={{ marginBottom: 4 }}>
            <button onClick={() => toggleFolder(nodePath)}
              style={{ display:'flex', alignItems:'center', width:'100%', padding:'10px 12px', background: isExp ? 'var(--surface2)' : 'transparent', border:'none', borderRadius:8, color:'var(--text)', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { if(!isExp) e.currentTarget.style.background = 'var(--surface2)'; }}
              onMouseLeave={e => { if(!isExp) e.currentTarget.style.background = 'transparent'; }}>
              {isExp ? <ChevronDown size={16} style={{ marginRight:8, color:'var(--text3)' }}/> : <ChevronRight size={16} style={{ marginRight:8, color:'var(--text3)' }}/>}
              <Folder size={16} style={{ marginRight:8, color:'var(--accent)' }}/>
              <span style={{ fontSize:13, fontWeight:600 }}>{node.name}</span>
            </button>
            {isExp && (
              <div style={{ paddingLeft: 12, marginTop: 4, borderLeft:'1px solid var(--line2)', marginLeft: 18 }}>
                {renderTree(node.children, nodePath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div key={nodePath} style={{ marginBottom: 4 }}>
            <a href={libraryUrl(node.path)} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'10px 12px', background:'var(--surface)', border:'1px solid var(--line2)', borderRadius:8, color:'var(--text2)', cursor:'pointer', transition:'all 0.2s', textDecoration:'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text3)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text2)'; }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, overflow:'hidden' }}>
                <FileText size={14} style={{ flexShrink:0, color:'var(--rose)' }}/>
                <span style={{ fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:500 }}>{node.name}</span>
              </div>
              <span style={{ fontSize:10, color:'var(--text3)', flexShrink:0, marginLeft:8, background:'var(--surface2)', padding:'2px 6px', borderRadius:4 }}>{node.size}</span>
            </a>
          </div>
        );
      }
    });
  };

  return (
    <div className="library-sidebar">
      <div style={{ padding:'20px 24px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Library size={18} color="var(--text)"/>
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>Library Explorer</div>
              <div style={{ fontSize:12,color:'var(--text3)' }}>{subjectCode ? subjName : 'All Subjects'}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16}/></button>
        </div>
      </div>

      <div className="custom-sb" style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column' }}>
        {!targetFolder || targetFolder.children?.length === 0 ? (
           <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text3)' }}>
            <Folder size={48} style={{ opacity:0.2,marginBottom:16 }}/>
            <p style={{ fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)' }}>Folder Empty</p>
            <p style={{ fontSize:13,lineHeight:1.6 }}>No files indexed for this subject yet. Add PDFs to <span style={{fontFamily:'monospace'}}>/public/library/</span> and run the Python script.</p>
          </div>
        ) : (
          renderTree(targetFolder.children, subjectCode || 'root')
        )}
      </div>
    </div>
  );
};


export default LibrarySidebar;
