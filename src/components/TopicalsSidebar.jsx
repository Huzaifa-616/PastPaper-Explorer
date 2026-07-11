import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Compass, X, ExternalLink, Flag, Check } from 'lucide-react';
import { subjectName } from '../config/constants';
import { SYLLABUS_STRUCTURE } from '../config/syllabus';
import { sliceUrl } from '../config/assets';
import { sendFlag } from '../utils/flags';

// Session-local "wrong topic?" flags, persisted so a student's own reports
// survive a refresh. A later phase can POST these for your review.
const FLAG_KEY = 'nexusTopicFlags';
const loadFlags = () => { try { return JSON.parse(localStorage.getItem(FLAG_KEY)) || {}; } catch { return {}; } };
const saveFlag = (id) => { const f = loadFlags(); f[id] = Date.now(); try { localStorage.setItem(FLAG_KEY, JSON.stringify(f)); } catch { /* ignore */ } };

// A single question rendered as its actual sliced image — the hero of the card.
const QuestionCard = ({ item, topic, onOpen }) => {
  const flagId = `${item.paper_id}-${item.question}`;
  const [flagged, setFlagged] = useState(() => !!loadFlags()[flagId]);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const lowConfidence = (item.score ?? 0) <= 1;

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--line2)', borderRadius:12, overflow:'hidden', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderBottom:'1px solid var(--line2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>Q{item.question}</span>
          <span style={{ fontSize:11, color:'var(--text2)' }}>{item.season_year.toUpperCase()} · V{item.variant}</span>
          {lowConfidence && (
            <span title="Lower-confidence match" style={{ fontSize:10, color:'var(--text3)', border:'1px solid var(--line2)', borderRadius:100, padding:'1px 7px' }}>unverified</span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button title={flagged ? 'Reported — thank you' : 'Wrong topic? Let us know'}
            onClick={() => { if (!flagged) { saveFlag(flagId); setFlagged(true); sendFlag(item.paper_id, item.question, topic || ''); } }}
            className="icon-btn" style={{ width:28, height:28, color: flagged ? 'var(--teal)' : 'var(--text3)' }}>
            {flagged ? <Check size={13} /> : <Flag size={13} />}
          </button>
          <button title="Open in full paper" onClick={() => onOpen(item)} className="icon-btn" style={{ width:28, height:28 }}>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
      <div onClick={() => onOpen(item)} style={{ cursor:'pointer', background:'#ffffff', minHeight: loaded ? 'auto' : 120, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        {!loaded && !errored && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:12 }}>Loading…</div>
        )}
        {errored ? (
          <div style={{ padding:'24px 12px', textAlign:'center', color:'var(--text3)', fontSize:12 }}>Preview unavailable · <span style={{ color:'var(--accent)' }}>open in paper →</span></div>
        ) : (
          <img src={sliceUrl(item.img)} alt={`Question ${item.question}`} loading="lazy"
            onLoad={() => setLoaded(true)} onError={() => setErrored(true)}
            style={{ width:'100%', display:'block', opacity: loaded ? 1 : 0, transition:'opacity 0.25s' }} />
        )}
      </div>
    </div>
  );
};

const TopicalsSidebar = ({ subjectCode, topicalDb, onClose, onSelectQuestion }) => {
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const subjName = subjectCode ? subjectName(subjectCode) : null;
  const db = topicalDb && subjectCode ? topicalDb[subjectCode] : null;
  const syllabus = subjectCode ? SYLLABUS_STRUCTURE[subjectCode] : null;
  const openInPaper = (item) => onSelectQuestion(item.paper_id, item.page_number);

  return (
    <div className="topicals-sidebar">
      <div style={{ padding:'20px 24px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Compass size={18} color="var(--text)"/>
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>Topical Questions</div>
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
            <p style={{ fontSize:13,lineHeight:1.6 }}>Choose a subject in the top navigation to browse questions by topic.</p>
          </div>
        ) : !syllabus ? (
           <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text3)' }}>
            <Compass size={48} style={{ opacity:0.2,marginBottom:16 }}/>
            <p style={{ fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)' }}>Coming Soon</p>
            <p style={{ fontSize:13,lineHeight:1.6 }}>Topical questions for this subject are being prepared.</p>
          </div>
        ) : (
          Object.keys(syllabus).sort().map(pNum => {
            const paperData = syllabus[pNum];
            return (
            <div key={pNum} style={{ background:'var(--surface)',border:'1px solid var(--line2)',borderRadius:14,overflow:'hidden',flexShrink:0 }}>
              <button onClick={() => { setExpandedPaper(expandedPaper === pNum ? null : pNum); setExpandedTopic(null); }}
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
                    const raw = db?.[pNum]?.topics?.[topic] || [];
                    const questions = [...raw].sort((a, b) =>
                      (b.score ?? 0) - (a.score ?? 0) ||
                      (b.season_year || '').localeCompare(a.season_year || '')
                    );
                    const count = questions.length;
                    return (
                    <div key={topic} style={{ background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:10,overflow:'hidden' }}>
                      <button onClick={() => setExpandedTopic(expandedTopic === topic ? null : topic)}
                        style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',background:'transparent',border:'none',color:'var(--text)',fontWeight:600,fontSize:13,cursor:'pointer' }}>
                        <span style={{ textAlign:'left', paddingRight:12, lineHeight:1.3 }}>{topic}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                           <span style={{ fontSize:11, background:'var(--surface3)', padding:'4px 8px', borderRadius:100, color:'var(--text2)' }}>{count}</span>
                           {expandedTopic === topic ? <ChevronUp size={16} color="var(--text3)"/> : <ChevronDown size={16} color="var(--text3)"/>}
                        </div>
                      </button>

                      {expandedTopic === topic && (
                        <div style={{ padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:10 }}>
                          {count === 0 ? (
                            <p style={{ fontSize:12, color:'var(--text3)', textAlign:'center', padding:'12px 0' }}>No questions indexed for this topic yet.</p>
                          ) : (
                            questions.map((item, idx) => (
                              <QuestionCard key={`${item.paper_id}-${item.question}-${idx}`} item={item} topic={topic} onOpen={openInPaper} />
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
