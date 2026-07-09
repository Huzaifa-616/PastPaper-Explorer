import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Eye, EyeOff, ListChecks, X } from 'lucide-react';
import { MCQ_COUNT, MCQ_OPTS, subjectName } from '../config/constants';
import { MCQ_ANSWER_KEYS } from '../config/answerKeys';

const MCQSolver = ({ subjectCode, paperNum, variant, year, season, onClose, mcqState, updateMcqState }) => {
  const N = MCQ_COUNT;
  const empty = () => Array(N).fill('');

  const msKey       = year && season ? `${subjectCode}_${season}${year.slice(2)}_1_${variant}` : null;
  const hardcodedKey = msKey ? (MCQ_ANSWER_KEYS[msKey] || null) : null;

  const mine        = mcqState.choices || empty();
  const keyRevealed = mcqState.revealed || false;

  const key = hardcodedKey || empty();

  const subjName   = subjectName(subjectCode);
  const paperLabel = `Paper 1${variant}`;

  const answered = mine.filter(Boolean).length;
  const correct  = useMemo(() => mine.filter((a,i) => a && key[i] && a===key[i]).length, [mine, key]);
  const keyCount = key.filter(Boolean).length;
  const pct      = keyRevealed && keyCount > 0 && answered > 0 ? Math.round(correct / keyCount * 100) : null;

  const [sheetHeight, setSheetHeight] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      let vh = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
      if (vh < 20) vh = 20; 
      if (vh > 90) vh = 90; 
      setSheetHeight(vh);
    };
    
    const handlePointerUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging]);

  const toggle = useCallback((qi, opt) => {
    if (keyRevealed) return;
    const newChoices = [...mine];
    newChoices[qi] = mine[qi] === opt ? '' : opt;
    updateMcqState({ choices: newChoices });
  }, [keyRevealed, mine, updateMcqState]);

  const clearAll = () => updateMcqState({ choices: empty(), revealed: false });
  const toggleReveal = () => updateMcqState({ revealed: !keyRevealed });

  const getBubbleCls = (qi, opt) => {
    const userPicked = mine[qi] === opt;
    const isCorrectAnswer = key[qi] === opt;
    if (!keyRevealed) return 'mcq-bubble' + (userPicked ? ' sel-mine' : '');
    if (userPicked && isCorrectAnswer) return 'mcq-bubble correct';
    if (userPicked && !isCorrectAnswer) return 'mcq-bubble wrong';
    if (!userPicked && isCorrectAnswer && mine[qi]) return 'mcq-bubble sel-key';
    return 'mcq-bubble';
  };

  return (
    <div className={`mcq-sidebar ${!isDragging ? 'snap-anim' : ''}`} style={{ '--sheet-height': `${sheetHeight}vh` }}>
      <div 
        className="drag-handle mobile-only" 
        onPointerDown={(e) => { 
          e.preventDefault(); 
          e.target.setPointerCapture(e.pointerId);
          setIsDragging(true); 
        }}
      >
        <div className="drag-bar" />
      </div>

      <div style={{ padding:'20px 24px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <ListChecks size={18} color="var(--text)"/>
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>MCQ Solver</div>
              <div style={{ fontSize:12,color:'var(--text3)' }}>{subjName} · {paperLabel}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16}/></button>
        </div>

        <div style={{ display:'flex',gap:8 }}>
          {hardcodedKey && (
            <button onClick={toggleReveal}
              style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px',borderRadius:10,
                border:`1px solid ${keyRevealed?'var(--line2)':'var(--text)'}`,cursor:'pointer',transition:'all 0.2s',
                background: keyRevealed ? 'var(--surface2)' : 'var(--text)',
                color:      keyRevealed ? 'var(--text2)'   : 'var(--bg)',
                fontSize:13,fontWeight:600 }}>
              {keyRevealed ? <><EyeOff size={14}/> Hide Key</> : <><Eye size={14}/> Check Answers</>}
            </button>
          )}
          <button onClick={clearAll}
            style={{ padding:'10px 16px',borderRadius:10,border:'1px solid var(--line2)',cursor:'pointer',background:'var(--surface2)',color:'var(--text2)',fontSize:13,fontWeight:600,transition:'all 0.2s' }}>
            Reset
          </button>
        </div>

        {keyRevealed && keyCount > 0 && (
          <div style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:12,background:'var(--surface2)',border:'1px solid var(--line2)',marginTop:12 }}>
            <span style={{ fontSize:24,fontWeight:800,color:pct>=70?'var(--green)':pct>=50?'var(--amber)':'var(--red)' }}>{correct}</span>
            <span style={{ fontSize:14,color:'var(--text2)',fontWeight:500 }}>/ {keyCount}</span>
            <div style={{ flex:1,height:6,borderRadius:4,background:'var(--surface3)',overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${pct??0}%`,background:pct>=70?'var(--green)':pct>=50?'var(--amber)':'var(--red)',borderRadius:4,transition:'width 0.5s ease' }}/>
            </div>
            <span style={{ fontSize:14,fontWeight:700,color:'var(--text2)' }}>{pct??'—'}%</span>
          </div>
        )}
      </div>

      <div className="custom-sb" style={{ flex:1,overflowY:'auto',padding:'8px 24px 24px' }}>
        <div style={{ display:'grid',gridTemplateColumns:'30px 1fr',gap:12,padding:'12px 0',borderBottom:'2px solid var(--line2)',marginBottom:8 }}>
          <span style={{ fontSize:11,fontWeight:600,color:'var(--text3)',textAlign:'center' }}>Q</span>
          <span style={{ fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:keyRevealed?'var(--text)':'var(--text2)',textAlign:'center' }}>
            {keyRevealed ? 'KEY REVEALED' : 'MY ANSWERS'}
          </span>
        </div>

        {Array.from({ length: N }, (_, qi) => (
          <div key={qi} style={{ display:'grid',gridTemplateColumns:'30px 1fr',gap:12,alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--line)',minHeight:44 }}>
            <span style={{ fontSize:13,color:'var(--text3)',fontWeight:600,textAlign:'center' }}>{qi+1}</span>
            <div style={{ display:'flex',gap:6,justifyContent:'center' }}>
              {MCQ_OPTS.map(opt => {
                const cls = getBubbleCls(qi, opt);
                const isSel = mine[qi]===opt || (keyRevealed && mine[qi] && key[qi]===opt);
                return (
                  <button key={opt} className={cls} onClick={() => toggle(qi, opt)}
                    style={{ color: isSel ? undefined : 'var(--text3)', cursor: keyRevealed ? 'default' : 'pointer' }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default MCQSolver;
