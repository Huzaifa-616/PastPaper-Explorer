import React, { useState, useEffect, useMemo } from 'react';
import { Activity, ArrowLeft, ArrowRight, Beaker, ChevronRight, Compass, Moon, Search, Sun, Terminal, X, Zap } from 'lucide-react';
import { SUBJECTS, subjectName } from '../config/constants';
import { SYLLABUS_STRUCTURE } from '../config/syllabus';

const FullTopicalsPage = ({ initialSubject, topicalDb, onBackToHub, toggleTheme, dark, onSelectQuestion }) => {
  const [subjectCode, setSubjectCode] = useState(initialSubject || '');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQ, setSearchQ] = useState('');

  const brandColors = {
    '9618': { hex: 'var(--teal)', name: 'Computer Science', icon: <Terminal size={16}/> },
    '9702': { hex: 'var(--amber)', name: 'Physics', icon: <Zap size={16}/> },
    '9701': { hex: 'var(--rose)', name: 'Chemistry', icon: <Beaker size={16}/> },
    '9709': { hex: 'var(--accent)', name: 'Mathematics', icon: <Activity size={16}/> }
  };

  const currentBrand = brandColors[subjectCode] || { hex: 'var(--text)', name: 'Topicals' };
  const subjName = subjectCode ? subjectName(subjectCode) : null;
  const db = topicalDb && subjectCode ? topicalDb[subjectCode] : null;
  const syllabus = subjectCode ? SYLLABUS_STRUCTURE[subjectCode] : null;
  const papers = syllabus ? Object.keys(syllabus).sort() : [];

  useEffect(() => {
    if (syllabus) { setSelectedPaper(Object.keys(syllabus).sort()[0]); setSelectedTopic(null); }
  }, [subjectCode]);

  useEffect(() => { setSelectedTopic(null); setSearchQ(''); }, [selectedPaper]);

  const getQs = (pNum, topic) => db?.[pNum]?.topics?.[topic] || [];

  const paperInfo = selectedPaper && syllabus ? syllabus[selectedPaper] : null;
  const topics = paperInfo ? paperInfo.topics : [];
  const questions = selectedPaper && selectedTopic ? getQs(selectedPaper, selectedTopic) : [];
  const filteredQuestions = searchQ.trim()
    ? questions.filter(q => q.season_year.toLowerCase().includes(searchQ.toLowerCase()))
    : questions;

  const maxQ = useMemo(() => {
    if (!selectedPaper || !db || !syllabus) return 1;
    const ts = syllabus[selectedPaper]?.topics || [];
    return Math.max(1, ...ts.map(t => getQs(selectedPaper, t).length));
  }, [selectedPaper, db]);

  const totalQ = useMemo(() => {
    if (!db) return 0;
    let c = 0;
    Object.values(db).forEach(p => Object.values(p.topics || {}).forEach(qs => c += qs.length));
    return c;
  }, [db]);

  const totalTopics = syllabus ? Object.values(syllabus).reduce((acc, p) => acc + p.topics.length, 0) : 0;

  const PAPER_COLORS = {
    '1': { hex: '#2dd4bf', bg: 'rgba(45,212,191,0.08)' },
    '2': { hex: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
    '3': { hex: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
    '4': { hex: '#fb7185', bg: 'rgba(251,113,133,0.08)' },
  };
  const pColor = (pNum) => PAPER_COLORS[pNum] || PAPER_COLORS['1'];
  const ac = selectedPaper ? pColor(selectedPaper) : pColor('1');

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', background:'var(--bg)' }}>
      
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'60vh', background:`radial-gradient(ellipse at top, ${currentBrand.hex} 0%, transparent 60%)`, opacity: dark ? 0.08 : 0.05, pointerEvents:'none', zIndex: 0, transition:'background 0.5s ease' }}/>
      <div className="bg-grid" />

      <header className="full-lib-header" style={{ padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10, position:'relative', borderBottom:'1px solid var(--line2)', background:'var(--bg2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button className="icon-btn" onClick={onBackToHub} title="Back to Hub"><ArrowLeft size={16}/></button>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Compass size={18} color="var(--bg)" strokeWidth={2.5}/>
            </div>
            <div>
              <h1 style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text)' }}>Topical Database</h1>
              <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', color:'var(--text3)', textTransform:'uppercase' }}>Expanded View</p>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="icon-btn" onClick={toggleTheme}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
        </div>
      </header>

      <main className="full-lib-main" style={{ flex:1, display:'flex', flexDirection:'column', padding:'32px 40px', zIndex:10, position:'relative', maxWidth: 1400, margin: '0 auto', width: '100%', overflow:'hidden' }}>
        
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20, flexWrap:'wrap', gap: 16, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
             <button onClick={()=>setSubjectCode('')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:600, color: !subjectCode ? 'var(--text)' : 'var(--text3)', transition:'color 0.2s' }}>All Subjects</button>
             {subjectCode && <ChevronRight size={16} color="var(--text3)"/>}
             {subjectCode && (
               <span style={{ fontSize:16, fontWeight:600, color: currentBrand.hex, display:'flex', alignItems:'center', gap:6 }}>
                 {brandColors[subjectCode]?.name || subjName}
               </span>
             )}
          </div>
          
          {subjectCode && syllabus && (
            <div style={{ display:'flex', gap: 10 }}>
              {totalQ > 0 && [{ label:'Questions', val:totalQ }, { label:'Topics', val:totalTopics }].map((s, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'var(--surface2)', border:'1px solid var(--line2)', borderRadius:8, fontSize:12 }}>
                  <span style={{ fontWeight:800, color:i===0?ac.hex:'var(--text)' }}>{s.val}</span>
                  <span style={{ color:'var(--text3)', fontWeight:500 }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!subjectCode ? (
           <div className="full-lib-grid" style={{ overflowY:'auto', paddingBottom:40 }}>
             {SUBJECTS.filter(s => ['9618', '9702', '9701'].includes(s.code)).map((s, i) => (
               <button key={i} className="glass-panel" onClick={() => setSubjectCode(s.code)}
                  style={{ padding:24, borderRadius:20, cursor:'pointer', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'flex-start', border:'1px solid var(--line2)', background:'var(--surface2)', textAlign:'left' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
                  <Compass size={32} color="var(--text2)" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{s.name}</h3>
                  <p style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>Code {s.code}</p>
               </button>
             ))}
           </div>
        ) : !syllabus ? (
           <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
             <Compass size={56} style={{ opacity:0.15 }}/>
             <p style={{ fontSize:16, color:'var(--text)', fontWeight:700 }}>Coming Soon</p>
             <p style={{ fontSize:14, color:'var(--text2)' }}>Topical mapping for {subjName} is not yet available.</p>
           </div>
        ) : (
          <div className="topicals-content glass-panel" style={{ borderRadius:20, border:'1px solid var(--line2)', overflow:'hidden', display:'flex', flex:1 }}>
            
            {/* Paper Selector */}
            <div className={`topicals-papers custom-sb ${selectedTopic ? 'mobile-hidden' : ''}`}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:8, marginBottom:6 }}>Papers</p>
              {papers.map(pNum => {
                const pc = pColor(pNum);
                const pData = syllabus[pNum];
                const isActive = selectedPaper === pNum;
                const pQCount = pData.topics.reduce((a, t) => a + getQs(pNum, t).length, 0);
                return (
                  <button key={pNum} onClick={() => setSelectedPaper(pNum)}
                    style={{ textAlign:'left', padding:'14px', borderRadius:12, border:`1px solid ${isActive ? pc.hex+'60' : 'var(--line2)'}`, background:isActive ? pc.bg : 'transparent', cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface2)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:pc.hex, flexShrink:0 }}/>
                      <span style={{ fontSize:13, fontWeight:700, color:isActive ? pc.hex : 'var(--text)' }}>Paper {pNum}</span>
                    </div>
                    <p style={{ fontSize:11, color:'var(--text3)', lineHeight:1.4, paddingLeft:16, marginBottom:6 }}>{pData.title}</p>
                    <div style={{ display:'flex', gap:5, paddingLeft:16, flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:6, background:'var(--surface2)', color:'var(--text3)' }}>{pData.topics.length} topics</span>
                      {pQCount > 0 && <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:6, background:pc.bg, color:pc.hex }}>{pQCount} Qs</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Topics Grid */}
            <div className={`topicals-grid ${selectedTopic ? 'mobile-hidden' : ''}`}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--line2)', background:'var(--bg2)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {paperInfo && <div style={{ width:4, height:22, borderRadius:2, background:ac.hex, flexShrink:0 }}/>}
                  <span style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{paperInfo?.title || 'Select a Paper'}</span>
                  {topics.length > 0 && <span style={{ fontSize:12, color:'var(--text3)', background:'var(--surface2)', padding:'3px 8px', borderRadius:6 }}>{topics.length} topics</span>}
                </div>
                {selectedTopic && (
                  <button onClick={() => setSelectedTopic(null)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid var(--line2)', background:'var(--surface2)', color:'var(--text2)', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                    <X size={12}/> Clear
                  </button>
                )}
              </div>
              <div className="custom-sb" style={{ flex:1, overflowY:'auto', padding:'20px' }}>
                {topics.length === 0 ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text3)', fontSize:14 }}>Select a paper to view its topics</div>
                ) : (
                  <div className="topicals-grid-inner">
                    {topics.map(topic => {
                      const qCount = getQs(selectedPaper, topic).length;
                      const barPct = maxQ > 0 ? (qCount / maxQ) * 100 : 0;
                      const isSel = selectedTopic === topic;
                      return (
                        <button key={topic} onClick={() => setSelectedTopic(isSel ? null : topic)}
                          style={{ textAlign:'left', padding:'18px', borderRadius:14, border:`1px solid ${isSel ? ac.hex+'70' : 'var(--line2)'}`, background:isSel ? ac.bg : 'var(--bg2)', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}
                          onMouseEnter={e => { if (!isSel) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--line2)'; } }}
                          onMouseLeave={e => { if (!isSel) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                          {isSel && <div style={{ position:'absolute', top:0, right:0, width:'60%', height:'100%', background:`radial-gradient(ellipse at top right, ${ac.hex}20, transparent 70%)`, pointerEvents:'none' }}/>}
                          <div style={{ fontSize:13, fontWeight:700, color:isSel ? ac.hex : 'var(--text)', marginBottom:12, lineHeight:1.4 }}>{topic}</div>
                          <div style={{ height:4, borderRadius:4, background:'var(--surface3)', marginBottom:10, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${barPct}%`, background:isSel ? ac.hex : 'var(--line2)', borderRadius:4, transition:'width 0.5s ease' }}/>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:12, fontWeight:700, color:qCount > 0 ? (isSel ? ac.hex : 'var(--text2)') : 'var(--text3)' }}>
                              {qCount > 0 ? `${qCount} question${qCount !== 1 ? 's' : ''}` : 'No data yet'}
                            </span>
                            {isSel && <ArrowRight size={13} color={ac.hex}/>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Questions Detail Panel */}
            {selectedTopic && (
              <div className="topicals-questions">
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--line2)', flexShrink:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:'var(--text)', lineHeight:1.4, flex:1, paddingRight:8 }}>{selectedTopic}</span>
                    <button className="icon-btn" style={{ width:28, height:28, flexShrink:0 }} onClick={() => setSelectedTopic(null)}><X size={14}/></button>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:questions.length > 5 ? 12 : 0 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:ac.hex }}/>
                    <span style={{ fontSize:11, color:ac.hex, fontWeight:700 }}>{questions.length} paper{questions.length !== 1 ? 's' : ''} available</span>
                  </div>
                  {questions.length > 5 && (
                    <div style={{ position:'relative' }}>
                      <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Filter by season / year…"
                        style={{ width:'100%', padding:'8px 12px 8px 32px', borderRadius:8, border:'1px solid var(--line2)', background:'var(--surface2)', color:'var(--text)', fontSize:12, outline:'none', fontFamily:'Outfit, sans-serif', transition:'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = ac.hex}
                        onBlur={e => e.target.style.borderColor = 'var(--line2)'}/>
                      <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', pointerEvents:'none' }}/>
                    </div>
                  )}
                </div>
                <div className="custom-sb" style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                  {filteredQuestions.length === 0 ? (
                    <p style={{ textAlign:'center', color:'var(--text3)', fontSize:13, padding:'24px 0' }}>
                      {questions.length === 0 ? 'No questions indexed yet.' : 'No results.'}
                    </p>
                  ) : (
                    filteredQuestions.map((item, idx) => {
                      const sCode = item.season_year[0];
                      const yrSuffix = item.season_year.slice(1);
                      const sName = { m:'March', s:'Summer', w:'Winter' }[sCode] || sCode.toUpperCase();
                      return (
                        <button key={idx} onClick={() => onSelectQuestion(item.paper_id, item.page_number)}
                          style={{ textAlign:'left', padding:'12px 14px', borderRadius:12, border:'1px solid var(--line2)', background:'var(--bg)', cursor:'pointer', transition:'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = ac.hex+'80'; e.currentTarget.style.background = ac.bg; e.currentTarget.style.transform = 'translateX(3px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                              <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6, background:ac.bg, color:ac.hex }}>{sName} 20{yrSuffix}</span>
                              <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', padding:'3px 7px', borderRadius:6, background:'var(--surface2)' }}>Var {item.variant}</span>
                            </div>
                            <span style={{ fontSize:10, fontWeight:700, color:'var(--text3)' }}>pg {item.page_number}</span>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:12, color:'var(--text2)', fontWeight:500 }}>Q {item.questions?.join(', ')}</span>
                            <ArrowRight size={12} color="var(--text3)"/>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};


export default FullTopicalsPage;
