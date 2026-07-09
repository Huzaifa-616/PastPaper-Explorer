import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Database } from 'lucide-react';
import { SUBJECTS, YEARS, SEASONS, PAPERS, VARIANTS } from '../config/constants';

const TopicalIndexer = ({ syllabusDb, onClose }) => {
  // --- Security State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Indexer State ---
  const [subj, setSubj] = useState('9618');
  const [yr, setYr] = useState('2023');
  const [ssn, setSsn] = useState('s');
  const [ppr, setPpr] = useState('1');
  const [varnt, setVarnt] = useState('2');
  const [docType, setDocType] = useState('qp'); 

  const [qNum, setQNum] = useState('');
  const [pageNum, setPageNum] = useState('');

  const [database, setDatabase] = useState({});
  const [copied, setCopied] = useState(false);

  // Mathematically compute the exact file name
  const seasonYear = `${ssn}${yr.slice(2)}`;
  const viewPaperId = `${subj}_${seasonYear}_${docType}_${ppr}${varnt}.pdf`; 
  const logPaperId = `${subj}_${seasonYear}_qp_${ppr}${varnt}.pdf`;          

  const topics = syllabusDb[subj]?.[ppr]?.topics || [];

  const handleLogin = (e) => {
    e.preventDefault();
    // 🔒 CHANGE YOUR ADMIN CREDENTIALS HERE:
    if (username === 'admin' && password === 'nexus2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Access denied.');
    }
  };

  const handleLogQuestion = (topic) => {
    if (!qNum || !pageNum) return alert('Fill in Q# and PDF Page#');

    setDatabase(prev => {
      const db = { ...prev };
      if (!db[topic]) db[topic] = [];
      const existingEntry = db[topic].find(e => e.paper_id === logPaperId && e.page_number === parseInt(pageNum));
      if (existingEntry) {
         if(!existingEntry.questions.includes(qNum)) existingEntry.questions.push(qNum);
      } else {
        db[topic].push({
          paper_id: logPaperId, season_year: seasonYear, variant: varnt, questions: [qNum], page_number: parseInt(pageNum)
        });
      }
      return db;
    });
    setQNum('');
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(database, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectStyle = { padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px', outline: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#05050A', color: '#f8fafc', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: '#0a0a14', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1', display:'flex', alignItems:'center', justifyContent:'center', color:'#6366f1' }}>
              <Database size={28}/>
            </div>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', marginBottom: '2px' }}>Admin Login</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '16px' }}>Restricted access for dataset indexing.</p>

          {loginError && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '500', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{loginError}</div>}

          <input autoFocus placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '14px 16px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: '14px', fontFamily: 'Outfit, sans-serif' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '14px 16px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: '14px', fontFamily: 'Outfit, sans-serif' }} />

          <button type="submit" style={{ padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background='#4f46e5'} onMouseLeave={e => e.target.style.background='#6366f1'}>Authorize Access</button>
          <button type="button" onClick={onClose} style={{ padding: '14px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.color='#f8fafc'; e.target.style.borderColor='#94a3b8'; }} onMouseLeave={e => { e.target.style.color='#94a3b8'; e.target.style.borderColor='#334155'; }}>Cancel & Return</button>
        </form>
      </div>
    );
  }

  // --- MAIN INDEXER WORKSPACE ---
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#05050A', color: '#f8fafc', fontFamily: 'Outfit, sans-serif', overflow: 'hidden' }}>
      
      {/* LEFT PANEL: PDF Viewer */}
      <div style={{ flex: 1, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="custom-sb" style={{ padding: '16px', background: '#0a0a14', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #1e293b', overflowX: 'auto', flexShrink: 0 }}>
           <button onClick={onClose} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'1px solid #334155',cursor:'pointer',background:'#1e293b',color:'#fff',fontSize:13,fontWeight:600, marginRight: '10px', flexShrink: 0 }}>
             <ArrowLeft size={16}/> Exit
           </button>
           <select value={subj} onChange={e => setSubj(e.target.value)} style={selectStyle}>{SUBJECTS.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}</select>
           <select value={yr} onChange={e => setYr(e.target.value)} style={selectStyle}>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
           <select value={ssn} onChange={e => setSsn(e.target.value)} style={selectStyle}>{SEASONS.map(s => <option key={s.code} value={s.code}>{s.code.toUpperCase()}</option>)}</select>
           <select value={ppr} onChange={e => setPpr(e.target.value)} style={selectStyle}>{PAPERS.map(p => <option key={p} value={p}>P{p}</option>)}</select>
           <select value={varnt} onChange={e => setVarnt(e.target.value)} style={selectStyle}>{VARIANTS.map(v => <option key={v} value={v}>V{v}</option>)}</select>
           <select value={docType} onChange={e => setDocType(e.target.value)} style={{...selectStyle, border: '1px solid #6366f1', marginLeft: 'auto', flexShrink: 0}}>
             <option value="qp">Question Paper (QP)</option>
             <option value="ms">Mark Scheme (MS)</option>
           </select>
        </div>
        <iframe src={`/pdf-viewer/web/viewer.html?file=/papers/${viewPaperId}`} style={{ width: '100%', height: '100%', border: 'none', background: '#e5e7eb' }} title="Indexer" />
      </div>

      {/* RIGHT PANEL: Rapid Indexer Engine */}
      <div style={{ width: '420px', display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a14' }}>
        
        {/* Top Section (Fixed Header & Inputs) */}
        <div style={{ padding: '24px 24px 16px 24px', flexShrink: 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 24 }}>
             <div style={{ width:40,height:40,borderRadius:12,background:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff' }}>
               <Database size={20}/>
             </div>
             <div>
               <h2 style={{ fontSize: '20px', fontWeight: '700', lineHeight:1.2 }}>Rapid Indexer</h2>
               <p style={{ fontSize: '12px', color: '#94a3b8' }}>Target: {logPaperId}</p>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
               <label style={{ fontSize: '12px', color: '#94a3b8', display:'block', marginBottom:4 }}>Question Num</label>
               <input type="text" value={qNum} onChange={e => setQNum(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #6366f1', color: '#fff', borderRadius: '8px', fontSize: '16px', outline:'none' }} placeholder="e.g. 1a" />
            </div>
            <div style={{ flex: 1 }}>
               <label style={{ fontSize: '12px', color: '#94a3b8', display:'block', marginBottom:4 }}>PDF Page Num</label>
               <input type="number" value={pageNum} onChange={e => setPageNum(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #6366f1', color: '#fff', borderRadius: '8px', fontSize: '16px', outline:'none' }} placeholder="e.g. 2" />
            </div>
          </div>
        </div>

        {/* Scrollable Main Area (Topics + JSON Box) */}
        <div className="custom-sb" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Topics Grid */}
          <div style={{ padding: '0 24px 24px 24px' }}>
            <h3 style={{ fontSize: '12px', color: '#94a3b8', margin: '16px 0 12px 0', textTransform: 'uppercase', letterSpacing:'0.05em' }}>Tap Topic to Log Question</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {topics.length === 0 ? (
                <div style={{ padding: '16px', background: '#1e293b', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>No topics mapped for P{ppr} yet.</div>
              ) : topics.map(topic => (
                <button key={topic} onClick={() => handleLogQuestion(topic)}
                  style={{ textAlign: 'left', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', fontSize:13, fontWeight:500 }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.borderColor = '#6366f1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#334155'; }}>
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* JSON Output (Pushed to bottom, scrolls naturally into view) */}
          <div style={{ padding: '0 24px 24px 24px', marginTop: 'auto' }}>
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', display:'flex', flexDirection:'column', minHeight:'220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 16px', borderBottom: '1px solid #334155', background: '#0a0a14', flexShrink:0 }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color:'#f8fafc' }}>Generated JSON</span>
                <button onClick={copyJSON} style={{ background: copied?'#10b981':'#6366f1', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', padding:'6px 12px', borderRadius:6, transition:'all 0.2s' }}>
                  {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied!' : 'Copy Data'}
                </button>
              </div>
              <pre style={{ padding: '16px', fontSize: '11px', color: '#cbd5e1', margin: 0, flex:1, whiteSpace:'pre-wrap' }}>
                {Object.keys(database).length === 0 ? '// Output will appear here...\n// Ready to log.' : JSON.stringify(database, null, 2)}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


export default TopicalIndexer;
