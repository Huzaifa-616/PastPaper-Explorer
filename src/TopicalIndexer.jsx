import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';

export default function TopicalIndexer({ syllabusDb }) {
  const [paperId, setPaperId] = useState('9618_s23_qp_12.pdf');
  const [qNum, setQNum] = useState('');
  const [pageNum, setPageNum] = useState('');
  const [activeSubject, setActiveSubject] = useState('9618');
  const [activePaper, setActivePaper] = useState('1');
  
  // This holds the perfectly formatted JSON as you click
  const [database, setDatabase] = useState({});
  const [copied, setCopied] = useState(false);

  const topics = syllabusDb[activeSubject]?.[activePaper]?.topics || [];

  const handleLogQuestion = (topic) => {
    if (!qNum || !pageNum || !paperId) return alert('Fill in Q#, Page#, and Paper ID');

    // Parse the paper ID to automatically get season, year, variant
    const parts = paperId.replace('.pdf', '').split('_');
    const seasonYear = parts[1]; // e.g., 's23'
    const variant = parts[3][1]; // e.g., '2'

    setDatabase(prev => {
      const db = { ...prev };
      if (!db[topic]) db[topic] = [];
      
      // Check if this paper already exists in this topic to append the question
      const existingEntry = db[topic].find(e => e.paper_id === paperId && e.page_number === parseInt(pageNum));
      
      if (existingEntry) {
        existingEntry.questions.push(qNum);
      } else {
        db[topic].push({
          paper_id: paperId,
          season_year: seasonYear,
          variant: variant,
          questions: [qNum],
          page_number: parseInt(pageNum)
        });
      }
      return db;
    });

    // Reset Q# for the next rapid-fire entry
    setQNum('');
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(database, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* LEFT: The PDF Viewer */}
      <div style={{ flex: 1, borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', background: '#1e293b', display: 'flex', gap: '12px' }}>
          <input 
            value={paperId} 
            onChange={(e) => setPaperId(e.target.value)}
            placeholder="Paper ID (e.g. 9618_s23_qp_12.pdf)"
            style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
          />
        </div>
        <iframe 
          src={`/pdf-viewer/web/viewer.html?file=/papers/${paperId}`} 
          style={{ width: '100%', height: '100%', border: 'none' }} 
        />
      </div>

      {/* RIGHT: Rapid Triage Controls */}
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Rapid Indexer</h2>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
             <label style={{ fontSize: '12px', color: '#94a3b8' }}>Question Num</label>
             <input type="text" value={qNum} onChange={e => setQNum(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px', fontSize: '16px' }} />
          </div>
          <div style={{ flex: 1 }}>
             <label style={{ fontSize: '12px', color: '#94a3b8' }}>PDF Page Num</label>
             <input type="number" value={pageNum} onChange={e => setPageNum(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px', fontSize: '16px' }} />
          </div>
        </div>

        <h3 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Tap Topic to Log</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '32px' }}>
          {topics.map(topic => (
            <button 
              key={topic}
              onClick={() => handleLogQuestion(topic)}
              style={{ textAlign: 'left', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#334155'}
              onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* The Output Area */}
        <div style={{ marginTop: 'auto', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #334155', background: '#0f172a' }}>
            <span style={{ fontSize: '12px', fontWeight: '700' }}>Generated JSON</span>
            <button onClick={copyJSON} style={{ background: 'none', border: 'none', color: '#2dd4bf', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}>
              {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied!' : 'Copy Data'}
            </button>
          </div>
          <pre style={{ padding: '16px', fontSize: '11px', color: '#94a3b8', maxHeight: '200px', overflowY: 'auto', margin: 0 }}>
            {JSON.stringify(database, null, 2) === '{}' ? '// Start logging to build DB' : JSON.stringify(database, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
}