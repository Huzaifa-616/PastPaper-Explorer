import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Compass, X } from 'lucide-react';
import { subjectName } from '../config/constants';
import { SYLLABUS_STRUCTURE } from '../config/syllabus';

const TopicalsSidebar = ({ subjectCode, topicalDb, onClose, onSelectQuestion }) => {
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const subjName = subjectCode ? subjectName(subjectCode) : null;
  const db = topicalDb && subjectCode ? topicalDb[subjectCode] : null;
  const syllabus = subjectCode ? SYLLABUS_STRUCTURE[subjectCode] : null;

  return (
    <div className="topicals-sidebar">
      <div style={{ padding:'20px 24px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Compass size={18} color="var(--text)"/>
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>Topical Extraction</div>
              <div style={{ fontSize:12,color:'var(--text3)' }}>{subjName || 'No Subject Selected'}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16}/></button>
        </div>
      </div>

      <div className="custom-sb" style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
        {!subjectCode ? (
          <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text3)' }}>
            <Compass size={48} style={{ opacity:0.2,marginBottom:16 }}/>
            <p style={{ fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)' }}>Select a Subject</p>
            <p style={{ fontSize:13,lineHeight:1.6 }}>Please select a subject from the top navigation to view topical questions.</p>
          </div>
        ) : !syllabus ? (
           <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text3)' }}>
            <Compass size={48} style={{ opacity:0.2,marginBottom:16 }}/>
            <p style={{ fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)' }}>Coming Soon</p>
            <p style={{ fontSize:13,lineHeight:1.6 }}>Topical mapping is currently available for Computer Science (9618), Physics (9702), and Chemistry (9701).</p>
          </div>
        ) : (
          Object.keys(syllabus).sort().map(pNum => {
            const paperData = syllabus[pNum];
            return (
            <div key={pNum} style={{ background:'var(--surface)',border:'1px solid var(--line2)',borderRadius:14,overflow:'hidden',flexShrink:0 }}>
              <button 
                onClick={() => { setExpandedPaper(expandedPaper === pNum ? null : pNum); setExpandedTopic(null); }}
                style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px',background:'var(--surface2)',border:'none',color:'var(--text)',cursor:'pointer' }}>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:15, fontWeight:700 }}>Paper {pNum}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{paperData.title}</div>
                </div>
                {expandedPaper === pNum ? <ChevronUp size={18} color="var(--text3)"/> : <ChevronDown size={18} color="var(--text3)"/>}
              </button>
              
              {expandedPaper === pNum && (
                <div style={{ padding:'12px',display:'flex',flexDirection:'column',gap:8 }}>
                  {paperData.topics.map(topic => {
                    const questions = db?.[pNum]?.topics?.[topic] || [];
                    return (
                    <div key={topic} style={{ background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:10,overflow:'hidden' }}>
                      <button onClick={() => setExpandedTopic(expandedTopic === topic ? null : topic)}
                        style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',background:'transparent',border:'none',color:'var(--text)',fontWeight:600,fontSize:13,cursor:'pointer' }}>
                        <span style={{ textAlign:'left', paddingRight:12, lineHeight:1.3 }}>{topic}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                           <span style={{ fontSize:11, background:'var(--surface3)', padding:'4px 8px', borderRadius:100, color:'var(--text2)' }}>
                             {questions.length}
                           </span>
                           {expandedTopic === topic ? <ChevronUp size={16} color="var(--text3)"/> : <ChevronDown size={16} color="var(--text3)"/>}
                        </div>
                      </button>
                      
                      {expandedTopic === topic && (
                        <div style={{ padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:8 }}>
                          {questions.length === 0 ? (
                            <p style={{ fontSize:12, color:'var(--text3)', textAlign:'center', padding:'12px 0' }}>No questions indexed yet.</p>
                          ) : (
                            questions.map((item, idx) => (
                              <button key={idx} onClick={() => onSelectQuestion(item.paper_id, item.page_number)}
                                style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',background:'var(--surface)',border:'1px solid var(--line2)',borderRadius:8,cursor:'pointer', transition:'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text3)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line2)'}>
                                <div style={{ textAlign:'left' }}>
                                  <div style={{ fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:4 }}>{item.season_year.toUpperCase()} · Var {item.variant}</div>
                                  <div style={{ fontSize:11,color:'var(--text2)' }}>Question {item.questions.join(', ')}</div>
                                </div>
                                <div style={{ fontSize:11,fontWeight:600,color:'var(--text3)',background:'var(--surface2)',padding:'6px 10px',borderRadius:6 }}>Pg {item.page_number}</div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          )})
        )}
      </div>
    </div>
  );
};


export default TopicalsSidebar;
