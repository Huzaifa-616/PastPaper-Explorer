import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, Mail, X, Copy, Check,
  Play, Github, Terminal, ArrowLeft, Layers, Sun, Moon,
  NotebookPen, Lock, Plus, Trash2, FileText, Eye, EyeOff,
  Paperclip, ExternalLink, ListChecks, AlertCircle,
  Code2, Library, Search, ChevronRight, Hash, Clock
} from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { code: '9709', name: 'Mathematics' },
  { code: '9618', name: 'Computer Science' },
  { code: '9701', name: 'Chemistry' },
  { code: '9702', name: 'Physics' },
  { code: '9700', name: 'Biology' },
  { code: '9231', name: 'Further Mathematics' },
];
const YEARS         = Array.from({ length: 16 }, (_, i) => (2026 - i).toString());
const SEASONS       = [{ code: 'm', name: 'March' }, { code: 's', name: 'Summer' }, { code: 'w', name: 'Winter' }];
const PAPERS        = ['1','2','3','4','5','6'];
const VARIANTS      = ['1','2','3'];
const MCQ_SUBJECTS  = ['9700','9701','9702'];
const MCQ_PAPER     = '1';
const MCQ_COUNT     = 40;
const MCQ_OPTS      = ['A','B','C','D'];
const GITHUB_REPO   = "https://github.com/Huzaifa-616/PastPaper-Explorer";
const NOTES_PW      = "bravo07";
const NOTES_KEY     = "nexus_notes_v1";
const MAX_FILE_B    = 1.5 * 1024 * 1024;

// Topicals paper definitions
const TOPICALS_PAPERS = [
  { id:'1', title:'Paper 1', sub:'Theory Fundamentals',       icon:BookOpen, color:'accent',  sections:'Sections 1–8',  desc:'1h 30min · 75 marks · Written', topics:['Data Representation','Networking & Internet','Hardware & Logic','System Software','Security & Ethics','Databases'] },
  { id:'2', title:'Paper 2', sub:'Problem-Solving & Programming', icon:Code2, color:'green',  sections:'Sections 9–12', desc:'2h · 75 marks · Pseudocode',    topics:['Algorithm Design','Data Structures','Programming & OOP','Software Development'] },
  { id:'3', title:'Paper 3', sub:'Advanced Theory',           icon:Layers,   color:'purple',  sections:'Sections 13–20',desc:'1h 30min · 75 marks · Written', topics:['Data Representation','Networking & Internet','Hardware & Logic','System Software','Security & Ethics','Artificial Intelligence','Algorithm Design','Programming & OOP'] },
  { id:'4', title:'Paper 4', sub:'Practical',                 icon:Terminal, color:'orange',  sections:'Sections 19–20',desc:'2h 30min · 75 marks · Computer', topics:['Programming & OOP','Algorithm Design','Software Development'] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const loadNotes   = () => { try { return JSON.parse(localStorage.getItem(NOTES_KEY)||'{}'); } catch { return {}; } };
const saveNotes   = n  => localStorage.setItem(NOTES_KEY, JSON.stringify(n));
const noteKey     = (c,p) => `${c}_${p}`;
const subjName    = c  => SUBJECTS.find(s=>s.code===c)?.name || c;
const fmtBytes    = b  => b<1024?`${b}B`:b<1048576?`${(b/1024).toFixed(1)}KB`:`${(b/1048576).toFixed(1)}MB`;

const openBlob = att => {
  try {
    const parts=att.data.split(','); const bin=atob(parts[1]);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    window.open(URL.createObjectURL(new Blob([bytes],{type:att.type})),'_blank');
  } catch { alert('Could not open file.'); }
};

const parseSY = sy => {
  const map={m:'March',s:'Summer',w:'Winter'};
  return `${map[sy[0]]||sy[0]} 20${sy.slice(1)}`;
};
const paperFromId = pid => { const m=pid.match(/_(\d)\d\.pdf$/); return m?m[1]:null; };

// ─── GlobalStyles ─────────────────────────────────────────────────────────────
const GlobalStyles = ({dark}) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;}
    :root{
      --bg:        ${dark?'#06060f':'#f4f6fb'};
      --bg2:       ${dark?'#0c0c1c':'#ffffff'};
      --surface:   ${dark?'#10101f':'#ffffff'};
      --surface2:  ${dark?'#181828':'#eef1f8'};
      --surface3:  ${dark?'#1f1f35':'#e4e9f4'};
      --line:      ${dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)'};
      --line2:     ${dark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'};
      --accent:    ${dark?'#4f8ef7':'#2563eb'};
      --accent-d:  ${dark?'rgba(79,142,247,0.15)':'rgba(37,99,235,0.1)'};
      --accent-g:  ${dark?'rgba(79,142,247,0.28)':'rgba(37,99,235,0.2)'};
      --blue:      ${dark?'#818cf8':'#6366f1'};
      --blue-d:    ${dark?'rgba(129,140,248,0.12)':'rgba(99,102,241,0.08)'};
      --green:     ${dark?'#34d399':'#059669'};
      --green-d:   ${dark?'rgba(52,211,153,0.12)':'rgba(5,150,105,0.08)'};
      --red:       ${dark?'#f87171':'#dc2626'};
      --red-d:     ${dark?'rgba(248,113,113,0.14)':'rgba(220,38,38,0.08)'};
      --orange:    ${dark?'#fb923c':'#ea580c'};
      --orange-d:  ${dark?'rgba(251,146,60,0.14)':'rgba(234,88,12,0.08)'};
      --purple:    ${dark?'#c084fc':'#9333ea'};
      --purple-d:  ${dark?'rgba(192,132,252,0.14)':'rgba(147,51,234,0.08)'};
      --text:      ${dark?'#e2e8f0':'#0f172a'};
      --text2:     ${dark?'#8a8aaa':'#64748b'};
      --text3:     ${dark?'#4a4a66':'#94a3b8'};
    }
    html,body,#root{height:100%;background:var(--bg);}
    body{font-family:'Roboto',sans-serif;color:var(--text);}
    ::selection{background:var(--accent-d);color:var(--text);}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:var(--line2);border-radius:2px;}

    .grid-bg{background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:52px 52px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}
    @keyframes pulse-ring{0%{transform:scale(0.95);opacity:0.6}50%{transform:scale(1.05);opacity:0.2}100%{transform:scale(0.95);opacity:0.6}}
    @keyframes spin{to{transform:rotate(360deg)}}

    .anim-0{animation:fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both;}
    .anim-1{animation:fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both;}
    .anim-2{animation:fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both;}
    .anim-3{animation:fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both;}
    .anim-4{animation:fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.4s both;}
    .anim-fade{animation:fadeIn 0.4s ease both;}

    .tool-card{background:var(--surface);border:1px solid var(--line2);border-radius:16px;padding:28px 24px;cursor:pointer;transition:transform 0.4s cubic-bezier(0.22,1,0.36,1),border-color 0.3s,box-shadow 0.4s;position:relative;overflow:hidden;text-align:left;}
    .tool-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:0;transition:opacity 0.3s;}
    .tool-card:hover{transform:translateY(-6px);border-color:var(--accent);}
    .tool-card:hover::before{opacity:1;}
    .tool-card.green:hover{border-color:var(--green);}
    .tool-card.green::before{background:linear-gradient(90deg,transparent,var(--green),transparent);}
    .tool-card.purple:hover{border-color:var(--purple);}
    .tool-card.purple::before{background:linear-gradient(90deg,transparent,var(--purple),transparent);}
    .tool-card:hover .cga{opacity:1;} .tool-card:hover .cgb{opacity:1;} .tool-card:hover .cgc{opacity:1;}
    .cga,.cgb,.cgc{position:absolute;inset:0;opacity:0;transition:opacity 0.4s;pointer-events:none;border-radius:16px;}
    .cga{box-shadow:0 0 60px var(--accent-g);} .cgb{box-shadow:0 0 60px var(--green-d);} .cgc{box-shadow:0 0 60px var(--purple-d);}
    .icon-badge{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;border:1px solid var(--line2);background:var(--surface2);transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);}
    .tool-card:hover .icon-badge{transform:scale(1.1) rotate(-3deg);}

    .nexus-select{appearance:none;background:var(--surface2);border:1px solid var(--line2);border-radius:8px;color:var(--text);font-family:'Roboto',sans-serif;font-size:11px;padding:7px 28px 7px 10px;cursor:pointer;transition:border-color 0.2s,box-shadow 0.2s;outline:none;}
    .nexus-select:hover{border-color:rgba(79,142,247,0.5);}
    .nexus-select:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-d);}
    .nexus-select option{background:var(--bg2);color:var(--text);}

    .tag{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;border:1px solid var(--line2);background:var(--surface2);font-size:10px;color:var(--text2);}
    .shimmer-text{background:linear-gradient(90deg,var(--accent) 0%,#93c5fd 50%,var(--accent) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}

    .nav-bar{background:${dark?'rgba(6,6,15,0.92)':'rgba(244,246,251,0.92)'};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--line2);}

    .seg-btn{padding:5px 14px;border-radius:6px;font-size:11px;font-family:'Roboto',sans-serif;font-weight:500;cursor:pointer;transition:all 0.2s;border:none;background:none;}
    .seg-btn.a-a{background:var(--accent);color:#fff;}
    .seg-btn.a-b{background:var(--blue);color:#fff;}
    .seg-btn.a-o{background:var(--orange);color:#fff;}
    .seg-btn.inactive{color:var(--text2);}
    .seg-btn.inactive:hover{color:var(--text);}

    .btn-load{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border-radius:8px;font-size:12px;font-weight:600;font-family:'Roboto',sans-serif;border:none;cursor:pointer;transition:all 0.25s;}
    .btn-load.ready{background:var(--accent);color:#fff;box-shadow:0 0 20px var(--accent-g);}
    .btn-load.ready:hover{filter:brightness(1.1);transform:translateY(-1px);}
    .btn-load.ready:active{transform:scale(0.97);}
    .btn-load.disabled{background:var(--surface2);color:var(--text3);cursor:not-allowed;}

    .icon-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;border:1px solid var(--line2);background:var(--surface2);color:var(--text2);cursor:pointer;transition:all 0.2s;}
    .icon-btn:hover{color:var(--text);background:var(--surface);}

    .pull-tab{display:flex;align-items:center;justify-content:center;width:100%;height:28px;border-bottom:1px solid var(--line2);background:var(--bg);cursor:pointer;gap:8px;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);transition:color 0.2s,background 0.2s;border:none;}
    .pull-tab:hover{color:var(--accent);background:var(--surface2);}

    .modal-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);animation:fadeIn 0.2s ease both;padding:12px;}
    .modal-box{background:var(--surface);border:1px solid var(--line2);border-radius:20px;width:100%;max-width:420px;position:relative;overflow:hidden;animation:fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both;}
    .modal-strip{height:2px;background:linear-gradient(90deg,var(--accent),var(--blue));}

    .notes-sidebar{position:absolute;left:0;top:0;bottom:0;width:340px;z-index:50;background:var(--surface);border-right:1px solid var(--line2);display:flex;flex-direction:column;box-shadow:4px 0 30px rgba(0,0,0,0.3);animation:slideInLeft 0.3s cubic-bezier(0.22,1,0.36,1) both;}
    .notes-backdrop{position:absolute;inset:0;z-index:49;background:rgba(0,0,0,0.3);}
    .note-card{background:var(--surface2);border:1px solid var(--line2);border-radius:10px;padding:14px 16px;transition:border-color 0.2s;}
    .note-card:hover{border-color:var(--accent);}
    .n-input{width:100%;background:var(--surface2);border:1px solid var(--line2);border-radius:8px;color:var(--text);font-family:'Roboto',sans-serif;font-size:13px;padding:10px 12px;outline:none;resize:vertical;transition:border-color 0.2s,box-shadow 0.2s;}
    .n-input:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-d);}
    .n-input::placeholder{color:var(--text3);}
    .attach-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px 4px 8px;border-radius:6px;border:1px solid var(--line2);background:var(--surface3);font-size:10px;color:var(--text2);cursor:pointer;transition:all 0.2s;text-decoration:none;}
    .attach-pill:hover{border-color:var(--accent);color:var(--accent);}

    .mcq-modal{background:var(--surface);border:1px solid var(--line2);border-radius:20px;width:100%;max-width:820px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;animation:fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both;}
    .mcq-bubble{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--line2);background:transparent;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;font-family:'Roboto',sans-serif;}
    .mcq-bubble:hover{border-color:var(--text2);color:var(--text);}
    .mcq-bubble.sel-mine{background:var(--accent);border-color:var(--accent);color:#fff;}
    .mcq-bubble.sel-key{background:var(--orange);border-color:var(--orange);color:#fff;}
    .mcq-bubble.correct{background:var(--green);border-color:var(--green);color:#fff;}
    .mcq-bubble.wrong{background:var(--red);border-color:var(--red);color:#fff;}
    .mcq-row{display:grid;grid-template-columns:28px 1fr 1px 1fr 20px;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--line);min-height:40px;}
    .mcq-row:last-child{border-bottom:none;}

    /* Topicals */
    .tp-paper-card{background:var(--surface);border:1px solid var(--line2);border-radius:14px;padding:20px;cursor:pointer;transition:all 0.3s cubic-bezier(0.22,1,0.36,1);position:relative;overflow:hidden;text-align:left;}
    .tp-paper-card:hover{transform:translateY(-4px);}
    .tp-paper-card.c-accent:hover{border-color:var(--accent);box-shadow:0 8px 32px var(--accent-d);}
    .tp-paper-card.c-green:hover{border-color:var(--green);box-shadow:0 8px 32px var(--green-d);}
    .tp-paper-card.c-purple:hover{border-color:var(--purple);box-shadow:0 8px 32px var(--purple-d);}
    .tp-paper-card.c-orange:hover{border-color:var(--orange);box-shadow:0 8px 32px var(--orange-d);}
    .tp-paper-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;opacity:0;transition:opacity 0.3s;}
    .tp-paper-card.c-accent::after{background:var(--accent);}
    .tp-paper-card.c-green::after{background:var(--green);}
    .tp-paper-card.c-purple::after{background:var(--purple);}
    .tp-paper-card.c-orange::after{background:var(--orange);}
    .tp-paper-card:hover::after{opacity:1;}

    .topic-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1px solid var(--line2);background:var(--surface2);cursor:pointer;transition:all 0.2s;font-size:12px;font-weight:500;color:var(--text);}
    .topic-chip:hover{border-color:var(--accent);background:var(--accent-d);color:var(--accent);}
    .topic-chip.selected{border-color:var(--accent);background:var(--accent-d);color:var(--accent);}

    .q-entry{background:var(--surface2);border:1px solid var(--line2);border-radius:10px;padding:12px 16px;transition:all 0.2s;cursor:pointer;display:flex;align-items:center;gap:12px;}
    .q-entry:hover{border-color:var(--accent);transform:translateX(3px);}

    .search-input{width:100%;background:var(--surface2);border:1px solid var(--line2);border-radius:9px;color:var(--text);font-family:'Roboto',sans-serif;font-size:13px;padding:9px 12px 9px 36px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
    .search-input:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-d);}
    .search-input::placeholder{color:var(--text3);}

    .breadcrumb-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:7px;border:none;background:var(--surface2);color:var(--text2);font-size:11px;cursor:pointer;transition:all 0.2s;}
    .breadcrumb-btn:hover{color:var(--text);background:var(--surface3);}
    .breadcrumb-active{color:var(--text);font-weight:600;}

    .spinner{width:28px;height:28px;border:2px solid var(--line2);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;}

    .logo-mark{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--accent) 0%,#93c5fd 100%);display:flex;align-items:center;justify-content:center;}
    .empty-icon-ring{width:110px;height:110px;border-radius:50%;border:1px solid var(--line2);display:flex;align-items:center;justify-content:center;position:relative;}
    .empty-icon-ring::before{content:'';position:absolute;inset:-10px;border-radius:50%;border:1px dashed var(--line2);animation:pulse-ring 3s ease-in-out infinite;}
    .deco-line{position:absolute;background:linear-gradient(90deg,transparent,var(--line2),transparent);height:1px;width:60%;}
    .no-sb{scrollbar-width:none;} .no-sb::-webkit-scrollbar{display:none;}

    @media(max-width:640px){
      .nav-inner{flex-direction:column!important;align-items:stretch!important;gap:10px!important;}
      .nav-divider{display:none!important;}
      .nav-brand-text{display:none!important;}
      .nav-filters{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:8px 10px!important;overflow:visible!important;flex:unset!important;padding-bottom:0!important;}
      .nav-filters>div{width:100%;}
      .nav-filters .nexus-select{width:100%;font-size:10px!important;padding:6px 22px 6px 8px!important;}
      .seg-btn{padding:5px 8px!important;font-size:10px!important;}
      .nav-actions{display:flex!important;width:100%!important;margin-left:0!important;justify-content:space-between!important;}
      .nav-actions .btn-load{flex:1!important;justify-content:center!important;}
      .notes-sidebar{width:100%!important;}
      .mcq-modal{max-height:95vh;border-radius:14px;}
      .mcq-row{grid-template-columns:22px 1fr 1px 1fr 18px;gap:4px;}
      .mcq-bubble{width:26px;height:26px;font-size:10px;}
      .tp-paper-card{padding:14px;}
    }
  `}</style>
);

// ─── NexusSelect ──────────────────────────────────────────────────────────────
const NexusSelect = ({label,value,onChange,options}) => (
  <div style={{display:'flex',flexDirection:'column',gap:5}}>
    <span style={{fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:2}}>{label}</span>
    <div style={{position:'relative'}}>
      <select value={value} onChange={e=>onChange(e.target.value)} className="nexus-select">
        <option value="" disabled>—</option>
        {options.map((opt,i)=>{const v=typeof opt==='object'?opt.value:opt;const l=typeof opt==='object'?opt.label:opt;return <option key={i} value={v}>{l}</option>;})}
      </select>
      <ChevronDown size={11} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',pointerEvents:'none'}}/>
    </div>
  </div>
);

// ─── ContactModal ─────────────────────────────────────────────────────────────
const ContactModal = ({isOpen,onClose}) => {
  const [copied,setCopied]=useState(false);
  const email="huzaifa.bravo@gmail.com";
  useEffect(()=>{if(copied){const t=setTimeout(()=>setCopied(false),2000);return()=>clearTimeout(t);}},[copied]);
  if(!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-strip"/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid var(--line)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:'var(--accent-d)',display:'flex',alignItems:'center',justifyContent:'center'}}><Mail size={15} color="var(--accent)"/></div>
            <span style={{fontSize:18,fontWeight:700,color:'var(--text)'}}>Contact</span>
          </div>
          <button className="icon-btn" onClick={onClose} style={{borderRadius:'50%',width:28,height:28}}><X size={14}/></button>
        </div>
        <div style={{padding:'28px 22px 24px',textAlign:'center'}}>
          <p style={{color:'var(--text2)',fontSize:14,lineHeight:1.6,marginBottom:22}}>Questions, feedback, or just want to say hi?<br/>Drop a line below.</p>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:10,padding:'6px 6px 6px 14px',marginBottom:8}}>
            <span style={{flex:1,fontSize:12,color:'var(--text)',textAlign:'left',fontFamily:'monospace'}}>{email}</span>
            <button onClick={()=>{navigator.clipboard.writeText(email);setCopied(true);}}
              style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:7,border:'none',cursor:'pointer',background:copied?'var(--accent)':'var(--surface)',color:copied?'#fff':'var(--text2)',fontSize:11,fontWeight:600,transition:'all 0.2s'}}>
              {copied?<><Check size={12}/> Copied</>:<><Copy size={12}/> Copy</>}
            </button>
          </div>
          <p style={{fontSize:9,color:'var(--text3)',letterSpacing:'0.08em'}}>{copied?'✦ COPIED TO CLIPBOARD':'CLICK TO COPY ADDRESS'}</p>
        </div>
      </div>
    </div>
  );
};

// ─── PasswordModal ────────────────────────────────────────────────────────────
const PasswordModal = ({isOpen,onClose,onSuccess}) => {
  const [pw,setPw]=useState('');const [show,setShow]=useState(false);const [err,setErr]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{if(isOpen){setPw('');setErr(false);setTimeout(()=>ref.current?.focus(),100);}},[isOpen]);
  const submit=()=>{if(pw===NOTES_PW){onSuccess();onClose();setPw('');setErr(false);}else{setErr(true);setPw('');}};
  if(!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
        <div className="modal-strip"/>
        <div style={{padding:'22px 24px 26px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:34,height:34,borderRadius:9,background:'var(--accent-d)',display:'flex',alignItems:'center',justifyContent:'center'}}><Lock size={16} color="var(--accent)"/></div>
              <div><div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Admin Access</div><div style={{fontSize:10,color:'var(--text3)'}}>Enter password to add notes</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} style={{width:28,height:28,borderRadius:'50%'}}><X size={13}/></button>
          </div>
          <div style={{position:'relative',marginBottom:err?8:16}}>
            <input ref={ref} type={show?'text':'password'} className="n-input" placeholder="Password" value={pw}
              onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==='Enter'&&submit()}
              style={{paddingRight:38,borderColor:err?'var(--red)':undefined}}/>
            <button onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:4}}>
              {show?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
          {err&&<p style={{fontSize:11,color:'var(--red)',marginBottom:12}}>Incorrect password. Try again.</p>}
          <button onClick={submit} style={{width:'100%',padding:'10px',borderRadius:8,border:'none',cursor:'pointer',background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,transition:'all 0.2s'}}>Unlock</button>
        </div>
      </div>
    </div>
  );
};

// ─── NotesSidebar ─────────────────────────────────────────────────────────────
const NotesSidebar = ({subjectCode,paperNum,onClose,isAdmin,onRequestAuth}) => {
  const key=noteKey(subjectCode,paperNum);const sn=subjName(subjectCode);
  const [notes,setNotes]=useState(()=>loadNotes()[key]||[]);
  const [showAdd,setShowAdd]=useState(false);const [noteTitle,setNoteTitle]=useState('');
  const [noteBody,setNoteBody]=useState('');const [delConfirm,setDelConfirm]=useState(null);
  const [pendingFiles,setPendingFiles]=useState([]);const [fileErr,setFileErr]=useState('');
  const fileRef=useRef(null);

  const persist=u=>{setNotes(u);const all=loadNotes();all[key]=u;saveNotes(all);};
  const handleAdd=()=>{
    if(!noteBody.trim()&&pendingFiles.length===0) return;
    const n={id:Date.now().toString(),title:noteTitle.trim()||`Note ${notes.length+1}`,content:noteBody.trim(),
      timestamp:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),attachments:pendingFiles};
    persist([n,...notes]);setNoteTitle('');setNoteBody('');setPendingFiles([]);setShowAdd(false);setFileErr('');
  };
  const handleFileChange=e=>{
    setFileErr('');
    Array.from(e.target.files).forEach(file=>{
      if(!['application/pdf','text/html'].includes(file.type)){setFileErr('Only PDF and HTML files are supported.');return;}
      if(file.size>MAX_FILE_B){setFileErr(`"${file.name}" exceeds 1.5 MB limit.`);return;}
      const r=new FileReader();
      r.onload=()=>setPendingFiles(pf=>[...pf,{id:Date.now().toString()+Math.random(),name:file.name,type:file.type,data:r.result,size:file.size}]);
      r.readAsDataURL(file);
    });
    e.target.value='';
  };
  const removeFile=id=>setPendingFiles(pf=>pf.filter(f=>f.id!==id));
  const handleDelete=id=>{persist(notes.filter(n=>n.id!==id));setDelConfirm(null);};

  return (
    <>
      <div className="notes-backdrop" onClick={onClose}/>
      <div className="notes-sidebar">
        <div style={{padding:'16px 18px',borderBottom:'1px solid var(--line2)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <div style={{width:30,height:30,borderRadius:8,background:'var(--accent-d)',display:'flex',alignItems:'center',justifyContent:'center'}}><NotebookPen size={14} color="var(--accent)"/></div>
              <div><div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>Notes</div><div style={{fontSize:10,color:'var(--text3)'}}>{sn} · Paper {paperNum}</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} style={{width:28,height:28,borderRadius:'50%'}}><X size={13}/></button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:10}}>
            <span style={{fontSize:10,color:'var(--text3)'}}>{notes.length} note{notes.length!==1?'s':''}</span>
            <span style={{flex:1}}/>
            {isAdmin?<button onClick={()=>setShowAdd(s=>!s)} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'none',cursor:'pointer',background:'var(--accent)',color:'#fff',fontSize:11,fontWeight:600}}><Plus size={12}/> Add Note</button>
            :<button onClick={onRequestAuth} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'1px solid var(--line2)',cursor:'pointer',background:'var(--surface2)',color:'var(--text2)',fontSize:11}}><Lock size={11}/> Unlock to add</button>}
          </div>
        </div>
        {showAdd&&isAdmin&&(
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--line2)',background:'var(--surface2)',flexShrink:0}}>
            <input className="n-input" placeholder="Title (optional)" value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} style={{marginBottom:8,height:36,resize:'none'}}/>
            <textarea className="n-input" placeholder="Write your note here…" value={noteBody} onChange={e=>setNoteBody(e.target.value)} rows={3} style={{marginBottom:8}}/>
            <input ref={fileRef} type="file" accept=".pdf,.html" multiple style={{display:'none'}} onChange={handleFileChange}/>
            <button onClick={()=>fileRef.current?.click()} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'1px dashed var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:11,width:'100%',justifyContent:'center',marginBottom:6}}>
              <Paperclip size={12}/> Attach PDF or HTML
            </button>
            {fileErr&&<p style={{fontSize:11,color:'var(--red)',marginBottom:6,display:'flex',alignItems:'center',gap:4}}><AlertCircle size={11}/>{fileErr}</p>}
            {pendingFiles.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:8}}>{pendingFiles.map(f=>(
              <div key={f.id} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px 3px 6px',borderRadius:6,background:'var(--surface3)',border:'1px solid var(--line2)',fontSize:10,color:'var(--text2)'}}>
                <FileText size={10} color="var(--accent)"/><span>{f.name}</span><span style={{color:'var(--text3)'}}>({fmtBytes(f.size)})</span>
                <button onClick={()=>removeFile(f.id)} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',color:'var(--text3)'}}><X size={10}/></button>
              </div>))}</div>}
            <div style={{display:'flex',gap:8}}>
              <button onClick={handleAdd} disabled={!noteBody.trim()&&pendingFiles.length===0}
                style={{flex:1,padding:'8px',borderRadius:7,border:'none',cursor:(noteBody.trim()||pendingFiles.length>0)?'pointer':'not-allowed',background:(noteBody.trim()||pendingFiles.length>0)?'var(--accent)':'var(--surface)',color:(noteBody.trim()||pendingFiles.length>0)?'#fff':'var(--text3)',fontSize:12,fontWeight:600}}>
                Save Note
              </button>
              <button onClick={()=>{setShowAdd(false);setNoteTitle('');setNoteBody('');setPendingFiles([]);setFileErr('');}}
                style={{padding:'8px 14px',borderRadius:7,border:'1px solid var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:12}}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{flex:1,overflowY:'auto',padding:'14px 18px',display:'flex',flexDirection:'column',gap:10}}>
          {notes.length===0?(
            <div style={{textAlign:'center',padding:'48px 0',color:'var(--text3)'}}>
              <FileText size={36} style={{opacity:0.3,marginBottom:12}}/><p style={{fontSize:13,marginBottom:6}}>No notes yet</p>
              <p style={{fontSize:11}}>{isAdmin?'Click "Add Note" to get started.':'Unlock to start adding notes.'}</p>
            </div>
          ):notes.map(note=>(
            <div key={note.id} className="note-card">
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:note.content?6:0}}>
                <span style={{fontSize:12,fontWeight:600,color:'var(--text)',lineHeight:1.3}}>{note.title}</span>
                {isAdmin&&(delConfirm===note.id?(
                  <div style={{display:'flex',gap:5,flexShrink:0}}>
                    <button onClick={()=>handleDelete(note.id)} style={{padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',background:'var(--red)',color:'#fff',fontSize:10,fontWeight:600}}>Delete</button>
                    <button onClick={()=>setDelConfirm(null)} style={{padding:'3px 8px',borderRadius:5,border:'1px solid var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:10}}>Cancel</button>
                  </div>
                ):<button onClick={()=>setDelConfirm(note.id)} className="icon-btn" style={{width:24,height:24,borderRadius:6,flexShrink:0,border:'none'}}><Trash2 size={11} color="var(--text3)"/></button>)}
              </div>
              {note.content&&<p style={{fontSize:12,color:'var(--text2)',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{note.content}</p>}
              {note.attachments?.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:8}}>{note.attachments.map(att=>(
                <button key={att.id} className="attach-pill" onClick={()=>openBlob(att)}>
                  <FileText size={11} color={att.type==='application/pdf'?'var(--red)':'var(--blue)'}/>
                  <span style={{maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{att.name}</span>
                  <ExternalLink size={9} style={{flexShrink:0}}/>
                </button>
              ))}</div>}
              <p style={{fontSize:10,color:'var(--text3)',marginTop:8}}>{note.timestamp}</p>
            </div>
          ))}
        </div>
        <div style={{padding:'10px 18px',borderTop:'1px solid var(--line2)',flexShrink:0}}>
          <p style={{fontSize:10,color:'var(--text3)',textAlign:'center'}}>{isAdmin?'🔓 Admin mode · auto-saved locally':'🔒 Read-only — unlock to add notes'}</p>
        </div>
      </div>
    </>
  );
};

// ─── MCQSolver ────────────────────────────────────────────────────────────────
const MCQSolver = ({subjectCode,paperNum,variant,onClose}) => {
  const N=MCQ_COUNT;const empty=()=>Array(N).fill('');
  const [mine,setMine]=useState(empty);const [key,setKey]=useState(empty);
  const [tab,setTab]=useState('mine');const [shown,setShown]=useState(false);
  const sn=subjName(subjectCode);const pl=`Paper 1${variant}`;
  const correct=useMemo(()=>mine.filter((a,i)=>a&&key[i]&&a===key[i]).length,[mine,key]);
  const mineCount=mine.filter(Boolean).length;const keyCount=key.filter(Boolean).length;
  const pct=keyCount>0&&mineCount>0?Math.round(correct/keyCount*100):null;
  const setBubble=useCallback((arr,setArr,qi,opt)=>{setArr(prev=>{const n=[...prev];n[qi]=prev[qi]===opt?'':opt;return n;});},[]);
  const clearAll=()=>{setMine(empty());setKey(empty());setShown(false);};
  const Bubble=({qi,opt,arr,setArr,mode})=>{
    const sel=arr[qi]===opt;let cls='mcq-bubble';
    if(shown&&mode==='mine'&&key[qi]){if(sel&&arr[qi]===key[qi])cls+=' correct';else if(sel&&arr[qi]!==key[qi])cls+=' wrong';}
    else{if(sel)cls+=(mode==='mine'?' sel-mine':' sel-key');}
    return <button className={cls} onClick={()=>setBubble(arr,setArr,qi,opt)} style={{color:sel?undefined:'var(--text3)'}}>{opt}</button>;
  };
  const ResultDot=({qi})=>{
    if(!shown||!mine[qi]||!key[qi]) return <span style={{width:16}}/>;
    return mine[qi]===key[qi]?<span style={{color:'var(--green)',fontSize:14}}>✓</span>:<span style={{color:'var(--red)',fontSize:14}}>✗</span>;
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mcq-modal" onClick={e=>e.stopPropagation()}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid var(--line2)',flexShrink:0,background:'var(--surface)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:34,height:34,borderRadius:9,background:'var(--orange-d)',display:'flex',alignItems:'center',justifyContent:'center'}}><ListChecks size={17} color="var(--orange)"/></div>
              <div><div style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>MCQ Solver</div><div style={{fontSize:10,color:'var(--text3)'}}>{sn} · {pl}</div></div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button onClick={clearAll} style={{padding:'5px 12px',borderRadius:7,border:'1px solid var(--line2)',cursor:'pointer',background:'var(--surface2)',color:'var(--text2)',fontSize:11}}>Reset</button>
              <button className="icon-btn" onClick={onClose} style={{width:28,height:28,borderRadius:'50%'}}><X size={13}/></button>
            </div>
          </div>
          {mineCount>0&&keyCount>0&&(
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'8px 12px',borderRadius:10,background:'var(--surface2)',border:'1px solid var(--line2)'}}>
              <div><span style={{fontSize:22,fontWeight:700,color:pct>=70?'var(--green)':pct>=50?'var(--orange)':'var(--red)'}}>{correct}</span><span style={{fontSize:13,color:'var(--text2)'}}>/{keyCount}</span></div>
              <div style={{flex:1}}><div style={{height:6,borderRadius:3,background:'var(--surface3)',overflow:'hidden'}}><div style={{height:'100%',width:`${(correct/keyCount)*100}%`,background:pct>=70?'var(--green)':pct>=50?'var(--orange)':'var(--red)',borderRadius:3,transition:'width 0.5s ease'}}/></div></div>
              <span style={{fontSize:13,fontWeight:600,color:'var(--text2)',minWidth:36,textAlign:'right'}}>{pct}%</span>
              {!shown&&<button onClick={()=>setShown(true)} style={{padding:'5px 12px',borderRadius:7,border:'none',cursor:'pointer',background:'var(--orange)',color:'#fff',fontSize:11,fontWeight:600,flexShrink:0}}>Check</button>}
              {shown&&<button onClick={()=>setShown(false)} style={{padding:'5px 12px',borderRadius:7,border:'1px solid var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:11,flexShrink:0}}>Hide</button>}
            </div>
          )}
          <div style={{display:'flex',gap:4,marginTop:10,background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:9,padding:3}}>
            <button className={`seg-btn ${tab==='mine'?'a-a':'inactive'}`} style={{flex:1}} onClick={()=>setTab('mine')}>My Answers {mineCount>0?`(${mineCount})`:''}</button>
            <button className={`seg-btn ${tab==='key'?'a-o':'inactive'}`}  style={{flex:1}} onClick={()=>setTab('key')}>Answer Key {keyCount>0?`(${keyCount})`:''}</button>
          </div>
        </div>
        <div className="no-sb" style={{flex:1,overflowY:'auto',padding:'8px 18px'}}>
          <div style={{display:'grid',gridTemplateColumns:'28px 1fr 1px 1fr 20px',gap:6,padding:'6px 0',borderBottom:'2px solid var(--line2)',marginBottom:2}}>
            <span style={{fontSize:9,color:'var(--text3)',textAlign:'center'}}>Q</span>
            <span style={{fontSize:9,color:'var(--accent)',textAlign:'center',letterSpacing:'0.08em'}}>{tab==='mine'?'MY ANSWER':'— — —'}</span>
            <span/>
            <span style={{fontSize:9,color:'var(--orange)',textAlign:'center',letterSpacing:'0.08em'}}>{tab==='key'?'ANSWER KEY':'— — —'}</span>
            <span/>
          </div>
          {Array.from({length:N},(_,qi)=>(
            <div key={qi} className="mcq-row">
              <span style={{fontSize:10,color:'var(--text3)',fontWeight:500,textAlign:'center'}}>{qi+1}</span>
              <div style={{display:'flex',gap:3,justifyContent:'center'}}>{MCQ_OPTS.map(opt=><Bubble key={opt} qi={qi} opt={opt} arr={mine} setArr={setMine} mode="mine"/>)}</div>
              <div style={{width:1,height:28,background:'var(--line2)',justifySelf:'center'}}/>
              <div style={{display:'flex',gap:3,justifyContent:'center'}}>{MCQ_OPTS.map(opt=><Bubble key={opt} qi={qi} opt={opt} arr={key} setArr={setKey} mode="key"/>)}</div>
              <ResultDot qi={qi}/>
            </div>
          ))}
        </div>
        <div style={{padding:'10px 18px',borderTop:'1px solid var(--line2)',flexShrink:0}}>
          <p style={{fontSize:10,color:'var(--text3)',textAlign:'center'}}>Blue = My Answer · Orange = Answer Key · {shown?'✓ green = correct · ✗ red = wrong':'Press "Check" to see results'}</p>
        </div>
      </div>
    </div>
  );
};

// ─── TopicalsExplorer ─────────────────────────────────────────────────────────
const PAPER_COLOR_VAR = {accent:'var(--accent)',green:'var(--green)',purple:'var(--purple)',orange:'var(--orange)'};
const PAPER_DIM_VAR   = {accent:'var(--accent-d)',green:'var(--green-d)',purple:'var(--purple-d)',orange:'var(--orange-d)'};

const TopicalsExplorer = ({onBack,toggleTheme,dark}) => {
  const [step,setStep]     = useState('paper');   // paper | topic | questions
  const [paper,setPaper]   = useState(null);
  const [topic,setTopic]   = useState(null);
  const [db,setDb]         = useState(null);
  const [loading,setLoading] = useState(true);
  const [err,setErr]       = useState(null);
  const [search,setSearch] = useState('');
  const [sort,setSort]     = useState('desc');     // desc = newest first

  useEffect(()=>{
    fetch('/topicals_db.json')
      .then(r=>{if(!r.ok)throw new Error('not found');return r.json();})
      .then(d=>{setDb(d);setLoading(false);})
      .catch(()=>{setErr('Topicals database not found. Run generate_topicals.py first to populate it.');setLoading(false);});
  },[]);

  // All entries for a given paper number and topic
  const getEntries = useCallback((paperNum,topicName)=>{
    if(!db?.['9618']?.[topicName]) return [];
    return db['9618'][topicName]
      .filter(e=>paperFromId(e.paper_id)===paperNum)
      .sort((a,b)=>{
        const ya=parseInt('20'+a.season_year.slice(1));const yb=parseInt('20'+b.season_year.slice(1));
        return sort==='desc'?yb-ya:ya-yb;
      });
  },[db,sort]);

  // Topics with counts for selected paper (dynamically computed)
  const topicsForPaper = useCallback(paperNum=>{
    if(!db?.['9618']) return [];
    return Object.keys(db['9618'])
      .map(name=>({name,count:getEntries(paperNum,name).length}))
      .filter(t=>t.count>0)
      .sort((a,b)=>b.count-a.count);
  },[db,getEntries]);

  // Total question count for a paper
  const paperTotalCount = useCallback(paperNum=>{
    if(!db?.['9618']) return 0;
    return Object.keys(db['9618']).reduce((sum,t)=>sum+getEntries(paperNum,t).length,0);
  },[db,getEntries]);

  const goBack = ()=>{
    if(step==='questions'){setStep('topic');setTopic(null);}
    else if(step==='topic'){setStep('paper');setPaper(null);}
    else onBack();
  };

  const selectedPaperInfo = TOPICALS_PAPERS.find(p=>p.id===paper);
  const currentEntries = step==='questions'&&paper&&topic ? getEntries(paper,topic) : [];
  const filteredTopics = step==='topic'&&paper
    ? topicsForPaper(paper).filter(t=>t.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const openEntry = e => {
    const url = `/pdf-viewer/web/viewer.html?file=${encodeURIComponent('/papers/'+e.paper_id)}&page=${e.page_number}`;
    window.open(url,'_blank');
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'var(--bg)',overflow:'hidden'}}>
      {/* Header */}
      <div className="nav-bar" style={{padding:'12px 20px',flexShrink:0,zIndex:30}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',gap:12}}>
          <button className="icon-btn" onClick={goBack} title="Back"><ArrowLeft size={14}/></button>

          {/* Breadcrumb */}
          <div style={{display:'flex',alignItems:'center',gap:4,flex:1,overflow:'hidden'}}>
            <div style={{width:28,height:28,borderRadius:7,background:'var(--purple-d)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Library size={13} color="var(--purple)"/>
            </div>
            <button className="breadcrumb-btn" onClick={()=>{setStep('paper');setPaper(null);setTopic(null);}}>
              CS 9618 Topicals
            </button>
            {paper&&<>
              <ChevronRight size={12} color="var(--text3)" style={{flexShrink:0}}/>
              <button className="breadcrumb-btn" onClick={()=>{setStep('topic');setTopic(null);}}>
                {selectedPaperInfo?.title}
              </button>
            </>}
            {topic&&<>
              <ChevronRight size={12} color="var(--text3)" style={{flexShrink:0}}/>
              <span className="breadcrumb-active" style={{fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text)'}}>{topic}</span>
            </>}
          </div>

          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            {step==='questions'&&(
              <div style={{display:'flex',background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:8,padding:3,gap:2}}>
                <button className={`seg-btn ${sort==='desc'?'a-a':'inactive'}`} style={{padding:'4px 10px',fontSize:10}} onClick={()=>setSort('desc')}>Newest</button>
                <button className={`seg-btn ${sort==='asc'?'a-a':'inactive'}`}  style={{padding:'4px 10px',fontSize:10}} onClick={()=>setSort('asc')}>Oldest</button>
              </div>
            )}
            <button className="icon-btn" onClick={toggleTheme}>{dark?<Sun size={13}/>:<Moon size={13}/>}</button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="no-sb" style={{flex:1,overflowY:'auto',padding:'24px 20px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>

          {/* Loading */}
          {loading&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingTop:80,gap:14}}>
              <div className="spinner"/>
              <p style={{fontSize:13,color:'var(--text2)'}}>Loading topicals database…</p>
            </div>
          )}

          {/* Error */}
          {!loading&&err&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingTop:80,gap:14,textAlign:'center'}}>
              <div style={{width:56,height:56,borderRadius:14,background:'var(--red-d)',display:'flex',alignItems:'center',justifyContent:'center'}}><AlertCircle size={24} color="var(--red)"/></div>
              <p style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>Database not available</p>
              <p style={{fontSize:13,color:'var(--text2)',maxWidth:400}}>{err}</p>
            </div>
          )}

          {/* Step: Paper Selection */}
          {!loading&&!err&&step==='paper'&&(
            <div className="anim-fade">
              <div style={{marginBottom:28}}>
                <h2 style={{fontSize:24,fontWeight:700,color:'var(--text)',marginBottom:6}}>Computer Science 9618</h2>
                <p style={{color:'var(--text2)',fontSize:14}}>Select a paper to browse topical questions organised by syllabus topic.</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
                {TOPICALS_PAPERS.map(p=>{
                  const total=paperTotalCount(p.id);
                  const topics=topicsForPaper(p.id);
                  const Icon=p.icon;
                  return (
                    <button key={p.id} className={`tp-paper-card c-${p.color}`} onClick={()=>{setPaper(p.id);setStep('topic');}}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                        <div style={{width:42,height:42,borderRadius:10,background:PAPER_DIM_VAR[p.color],display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${PAPER_COLOR_VAR[p.color]}30`}}>
                          <Icon size={20} color={PAPER_COLOR_VAR[p.color]}/>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                          {total>0&&<span style={{fontSize:11,fontWeight:600,color:PAPER_COLOR_VAR[p.color],background:PAPER_DIM_VAR[p.color],padding:'3px 9px',borderRadius:99}}>{total} questions</span>}
                          {total===0&&<span style={{fontSize:10,color:'var(--text3)'}}>No data yet</span>}
                        </div>
                      </div>
                      <div style={{fontSize:11,fontWeight:600,color:PAPER_COLOR_VAR[p.color],marginBottom:4,letterSpacing:'0.04em'}}>{p.title} · {p.sections}</div>
                      <div style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:4}}>{p.sub}</div>
                      <div style={{fontSize:11,color:'var(--text3)',marginBottom:12}}>{p.desc}</div>
                      {topics.length>0&&(
                        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                          {topics.slice(0,4).map(t=>(
                            <span key={t.name} style={{fontSize:9,padding:'3px 8px',borderRadius:99,background:'var(--surface3)',border:'1px solid var(--line2)',color:'var(--text2)'}}>{t.name}</span>
                          ))}
                          {topics.length>4&&<span style={{fontSize:9,padding:'3px 8px',borderRadius:99,background:'var(--surface3)',border:'1px solid var(--line2)',color:'var(--text2)'}}>+{topics.length-4} more</span>}
                        </div>
                      )}
                      {topics.length===0&&<p style={{fontSize:11,color:'var(--text3)'}}>Run the topicals generator to populate this paper.</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Topic Selection */}
          {!loading&&!err&&step==='topic'&&paper&&(
            <div className="anim-fade">
              <div style={{marginBottom:24}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:600,color:PAPER_COLOR_VAR[selectedPaperInfo?.color||'accent'],background:PAPER_DIM_VAR[selectedPaperInfo?.color||'accent'],padding:'4px 12px',borderRadius:99}}>{selectedPaperInfo?.title}</span>
                  <span style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>{selectedPaperInfo?.sub}</span>
                </div>
                <p style={{color:'var(--text2)',fontSize:13}}>Choose a topic to see all past paper questions on it.</p>
              </div>

              {/* Search */}
              <div style={{position:'relative',marginBottom:20,maxWidth:400}}>
                <Search size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',pointerEvents:'none'}}/>
                <input className="search-input" placeholder="Search topics…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>

              {filteredTopics.length===0?(
                <div style={{textAlign:'center',paddingTop:48,color:'var(--text3)'}}>
                  <Hash size={32} style={{opacity:0.3,marginBottom:10}}/><p style={{fontSize:13}}>{search?'No topics match your search.':'No topics found for this paper yet.'}</p>
                </div>
              ):(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
                  {filteredTopics.map(t=>(
                    <button key={t.name} className="topic-chip" onClick={()=>{setTopic(t.name);setStep('questions');}}>
                      <div style={{flex:1,textAlign:'left'}}>
                        <div style={{fontSize:13,fontWeight:500,color:'var(--text)',marginBottom:2}}>{t.name}</div>
                        <div style={{fontSize:10,color:'var(--text3)'}}>{t.count} question page{t.count!==1?'s':''}</div>
                      </div>
                      <ChevronRight size={14} color="var(--text3)"/>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step: Question List */}
          {!loading&&!err&&step==='questions'&&paper&&topic&&(
            <div className="anim-fade">
              <div style={{marginBottom:20,display:'flex',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <span style={{fontSize:12,fontWeight:600,color:PAPER_COLOR_VAR[selectedPaperInfo?.color||'accent'],background:PAPER_DIM_VAR[selectedPaperInfo?.color||'accent'],padding:'4px 12px',borderRadius:99}}>{selectedPaperInfo?.title}</span>
                    <span style={{fontSize:17,fontWeight:700,color:'var(--text)'}}>{topic}</span>
                  </div>
                  <p style={{color:'var(--text2)',fontSize:13}}>{currentEntries.length} result{currentEntries.length!==1?'s':''} · Click any entry to open the PDF at that exact page.</p>
                </div>
              </div>

              {currentEntries.length===0?(
                <div style={{textAlign:'center',paddingTop:48,color:'var(--text3)'}}>
                  <FileText size={32} style={{opacity:0.3,marginBottom:10}}/><p style={{fontSize:13}}>No questions found for this topic in this paper.</p>
                </div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {currentEntries.map((e,i)=>{
                    const pv=e.variant||e.paper_id.match(/_(\d\d)\.pdf$/)?.[1]||'?';
                    const sy=parseSY(e.season_year);
                    const qs=Array.isArray(e.questions)?e.questions.join(', '):'—';
                    return (
                      <button key={i} className="q-entry" onClick={()=>openEntry(e)}>
                        <div style={{width:40,height:40,borderRadius:10,background:PAPER_DIM_VAR[selectedPaperInfo?.color||'accent'],display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{fontSize:12,fontWeight:700,color:PAPER_COLOR_VAR[selectedPaperInfo?.color||'accent']}}>P{pv}</span>
                        </div>
                        <div style={{flex:1,textAlign:'left'}}>
                          <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{sy} &nbsp;<span style={{color:'var(--text3)',fontWeight:400,fontSize:11}}>· Paper {pv}</span></div>
                          <div style={{fontSize:11,color:'var(--text2)'}}>
                            Page {e.page_number}
                            {qs!=='—'&&<span style={{color:'var(--text3)'}}> · Q: {qs}</span>}
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:4,color:'var(--accent)',fontSize:11,fontWeight:600,flexShrink:0}}>
                          Open <ExternalLink size={12}/>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── StartupScreen ────────────────────────────────────────────────────────────
const StartupScreen = ({onSelectExplorer,onSelectTopicals,toggleTheme,dark}) => (
  <div className="grid-bg" style={{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:'-15%',left:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(79,142,247,0.07) 0%,transparent 70%)',pointerEvents:'none'}}/>
    <div style={{position:'absolute',bottom:'-15%',right:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(192,132,252,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>
    <div className="deco-line" style={{top:'15%',left:'20%'}}/><div className="deco-line" style={{bottom:'15%',right:'20%'}}/>
    <button className="icon-btn" onClick={toggleTheme} style={{position:'absolute',top:24,right:24,zIndex:10}}>{dark?<Sun size={15}/>:<Moon size={15}/>}</button>

    <div className="anim-0" style={{display:'flex',alignItems:'center',gap:8,marginBottom:48}}>
      <div style={{width:1,height:20,background:'var(--accent)'}}/>
      <span style={{fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text2)'}}>Study Tools Hub — CAIE A Level</span>
      <div style={{width:1,height:20,background:'var(--accent)'}}/>
    </div>

    <div className="anim-1" style={{textAlign:'center',marginBottom:52}}>
      <h1 className="shimmer-text" style={{fontFamily:'Roboto',fontWeight:700,fontSize:'clamp(56px,9vw,112px)',lineHeight:0.9,letterSpacing:'-0.02em',marginBottom:18}}>The Nexus</h1>
      <p style={{color:'var(--text2)',fontSize:16,fontWeight:300,letterSpacing:'0.06em'}}>Connect &nbsp;·&nbsp; Compile &nbsp;·&nbsp; Conquer</p>
    </div>

    <div className="anim-2" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,width:'100%',maxWidth:860}}>
      {/* PastPaper Explorer */}
      <button className="tool-card" onClick={onSelectExplorer}>
        <div className="cga"/>
        <div className="icon-badge" style={{background:'var(--accent-d)',borderColor:'rgba(79,142,247,0.25)'}}><Layers size={22} color="var(--accent)"/></div>
        <h2 style={{fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:8}}>PastPaper Explorer</h2>
        <p style={{color:'var(--text2)',fontSize:12,lineHeight:1.6,marginBottom:16}}>Access A-Level past papers & mark schemes with a built-in PDF engine, subject notes, and MCQ solver.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{['Math','Physics','CS','Bio','Chem'].map(t=><span className="tag" key={t}>{t}</span>)}</div>
      </button>

      {/* Programming IDE */}
      <button className="tool-card green" onClick={()=>window.open('https://programming-ide.netlify.app/','_blank')}>
        <div className="cgb"/>
        <div className="icon-badge" style={{background:'var(--green-d)',borderColor:'rgba(52,211,153,0.25)'}}><Terminal size={22} color="var(--green)"/></div>
        <h2 style={{fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:8}}>Programming IDE</h2>
        <p style={{color:'var(--text2)',fontSize:12,lineHeight:1.6,marginBottom:16}}>Write, compile, and run code directly in your browser. Designed for CS 9618 Paper 4 practice.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{['Python','C++','Java','Browser'].map(t=><span className="tag" key={t}>{t}</span>)}</div>
      </button>

      {/* Topicals */}
      <button className="tool-card purple" onClick={onSelectTopicals}>
        <div className="cgc"/>
        <div className="icon-badge" style={{background:'var(--purple-d)',borderColor:'rgba(192,132,252,0.25)'}}><Library size={22} color="var(--purple)"/></div>
        <h2 style={{fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:8}}>Topical Questions</h2>
        <p style={{color:'var(--text2)',fontSize:12,lineHeight:1.6,marginBottom:16}}>Browse past paper questions sorted by topic and syllabus chapter. Perfect for targeted revision.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{['Paper 1','Paper 2','Paper 3','Paper 4','CS 9618'].map(t=><span className="tag" key={t}>{t}</span>)}</div>
      </button>
    </div>

    <div className="anim-3" style={{marginTop:48,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
      <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer"
        className="icon-btn" style={{width:'auto',height:'auto',padding:'7px 14px',gap:7,display:'flex',alignItems:'center',borderRadius:8,textDecoration:'none'}}>
        <Github size={13} color="var(--text2)"/>
        <span style={{fontSize:10,color:'var(--text2)',letterSpacing:'0.06em'}}>View on GitHub</span>
      </a>
      <span style={{color:'var(--line2)',fontSize:18}}>·</span>
      <span style={{fontSize:10,color:'var(--text3)',letterSpacing:'0.06em'}}>Deployed on CloudFlare and Netlify · By Muhammad Huzaifa Imran</span>
    </div>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark,setDark]         = useState(()=>localStorage.getItem('nexusTheme')!=='light');
  useEffect(()=>{localStorage.setItem('nexusTheme',dark?'dark':'light');},[dark]);
  const toggleTheme = ()=>setDark(d=>!d);

  const [screen,setScreen]     = useState('startup');  // startup | explorer | topicals
  const [showContact,setShowContact] = useState(false);
  const [isViewing,setIsViewing]     = useState(false);
  const [showNav,setShowNav]         = useState(true);
  const [showNotes,setShowNotes]     = useState(false);
  const [showMCQ,setShowMCQ]         = useState(false);
  const [isAdmin,setIsAdmin]         = useState(false);
  const [showPwModal,setShowPwModal] = useState(false);

  const [subject,setSubject] = useState('');
  const [year,setYear]       = useState('');
  const [season,setSeason]   = useState('');
  const [paper,setPaper]     = useState('');
  const [variant,setVariant] = useState('');
  const [type,setType]       = useState('qp');

  const isComplete   = subject&&year&&season&&paper&&variant;
  const canShowNotes = !!subject&&!!paper;
  const canShowMCQ   = MCQ_SUBJECTS.includes(subject)&&paper===MCQ_PAPER;

  const activeFileUrl = useMemo(()=>{
    if(!isComplete) return '';
    return `/papers/${subject}_${season}${year.slice(2)}_${type}_${paper}${variant}.pdf`;
  },[subject,year,season,paper,variant,type,isComplete]);
  const viewerSrc = useMemo(()=>`/pdf-viewer/web/viewer.html?file=${encodeURIComponent(activeFileUrl)}`,[activeFileUrl]);

  useEffect(()=>{document.title="The Nexus | Study Tools";},[]);
  useEffect(()=>{setShowNotes(false);setShowMCQ(false);},[subject,paper]);

  const handleLoad = ()=>{if(!isComplete) return;setIsViewing(true);setShowNav(false);};
  const handleHome = ()=>{setIsViewing(false);setShowNav(true);};

  // ── Startup ──
  if(screen==='startup') return (
    <>
      <GlobalStyles dark={dark}/>
      <StartupScreen
        onSelectExplorer={()=>setScreen('explorer')}
        onSelectTopicals={()=>setScreen('topicals')}
        toggleTheme={toggleTheme} dark={dark}/>
    </>
  );

  // ── Topicals ──
  if(screen==='topicals') return (
    <>
      <GlobalStyles dark={dark}/>
      <TopicalsExplorer onBack={()=>setScreen('startup')} toggleTheme={toggleTheme} dark={dark}/>
    </>
  );

  // ── PastPaper Explorer ──
  return (
    <>
      <GlobalStyles dark={dark}/>
      <ContactModal isOpen={showContact} onClose={()=>setShowContact(false)}/>
      <PasswordModal isOpen={showPwModal} onClose={()=>setShowPwModal(false)} onSuccess={()=>setIsAdmin(true)}/>
      {showMCQ&&<MCQSolver subjectCode={subject} paperNum={paper} variant={variant} onClose={()=>setShowMCQ(false)}/>}

      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'var(--bg)',overflow:'hidden'}}>
        {/* Nav */}
        <div style={{display:'grid',gridTemplateRows:showNav?'1fr':'0fr',transition:'grid-template-rows 0.3s ease',flexShrink:0,zIndex:30}}>
          <div style={{overflow:'hidden',minHeight:0}}>
            <header className="nav-bar" style={{padding:'12px 20px'}}>
              <div className="nav-inner" style={{maxWidth:1600,margin:'0 auto',display:'flex',flexWrap:'wrap',alignItems:'center',gap:14}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginRight:4}}>
                  <button className="icon-btn" onClick={()=>{setScreen('startup');handleHome();setShowNotes(false);}} title="Back"><ArrowLeft size={14}/></button>
                  <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={handleHome}>
                    <div className="logo-mark"><Layers size={16} color="#fff" strokeWidth={2.2}/></div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.2}}>PastPaper Explorer</div>
                      <div className="nav-brand-text" style={{fontSize:9,color:'var(--text3)',letterSpacing:'0.1em'}}>BY M. HUZAIFA IMRAN</div>
                    </div>
                  </div>
                </div>
                <div className="nav-divider" style={{width:1,height:32,background:'var(--line2)',flexShrink:0}}/>
                <div className="nav-filters no-sb" style={{display:'flex',alignItems:'flex-end',gap:12,flex:1,overflowX:'auto',paddingBottom:2}}>
                  <NexusSelect label="Subject" value={subject} onChange={v=>{setSubject(v);setShowNotes(false);}} options={SUBJECTS.map(s=>({value:s.code,label:`${s.code} · ${s.name}`}))}/>
                  <NexusSelect label="Year"    value={year}    onChange={setYear}    options={YEARS}/>
                  <NexusSelect label="Season"  value={season}  onChange={setSeason}  options={SEASONS.map(s=>({value:s.code,label:s.name}))}/>
                  <NexusSelect label="Paper"   value={paper}   onChange={v=>{setPaper(v);setShowNotes(false);}} options={PAPERS}/>
                  <NexusSelect label="Variant" value={variant} onChange={setVariant} options={VARIANTS}/>
                  {/* QP/MS */}
                  <div className="seg-wrap" style={{display:'flex',flexDirection:'column',gap:5}}>
                    <span style={{fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:2}}>Type</span>
                    <div style={{display:'flex',background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:8,padding:3,gap:2}}>
                      <button className={`seg-btn ${type==='qp'?'a-a':'inactive'}`} onClick={()=>setType('qp')}>QP</button>
                      <button className={`seg-btn ${type==='ms'?'a-b':'inactive'}`} onClick={()=>setType('ms')}>MS</button>
                    </div>
                  </div>
                  {/* Notes */}
                  {canShowNotes&&(
                    <div style={{display:'flex',flexDirection:'column',gap:5}} className="anim-fade">
                      <span style={{fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:2}}>Notes</span>
                      <button onClick={()=>setShowNotes(s=>!s)}
                        style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showNotes?'var(--green)':'var(--green-d)',color:showNotes?'#fff':'var(--green)',fontSize:11,fontWeight:600}}>
                        <NotebookPen size={13}/> {showNotes?'Close':'Notes'}
                      </button>
                    </div>
                  )}
                  {/* MCQ */}
                  {canShowMCQ&&(
                    <div style={{display:'flex',flexDirection:'column',gap:5}} className="anim-fade">
                      <span style={{fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:2}}>MCQ</span>
                      <button onClick={()=>setShowMCQ(true)}
                        style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:'var(--orange-d)',color:'var(--orange)',fontSize:11,fontWeight:600}}>
                        <ListChecks size={13}/> Solver
                      </button>
                    </div>
                  )}
                  {/* CS IDE */}
                  {subject==='9618'&&(paper==='2'||paper==='4')&&(
                    <button onClick={()=>window.open('https://programming-ide.netlify.app/','_blank')} className="anim-fade"
                      style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'1px solid var(--blue-d)',background:'var(--blue-d)',color:'var(--blue)',fontSize:11,fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}>
                      <Terminal size={13}/> IDE
                    </button>
                  )}
                </div>
                <div className="nav-actions" style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto',flexShrink:0}}>
                  <button className={`btn-load ${isComplete?'ready':'disabled'}`} onClick={handleLoad} disabled={!isComplete}>
                    <Play size={11} fill="currentColor"/> {isViewing?'Reload':'Load Paper'}
                  </button>
                  {isViewing&&<button className="icon-btn" onClick={()=>setShowNav(false)}><ChevronUp size={13}/></button>}
                  <div style={{width:1,height:22,background:'var(--line2)'}}/>
                  <button className="icon-btn" onClick={toggleTheme}>{dark?<Sun size={13}/>:<Moon size={13}/>}</button>
                  <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{textDecoration:'none'}}><Github size={13}/></a>
                  <button className="icon-btn" onClick={()=>setShowContact(true)}><Mail size={13}/></button>
                </div>
              </div>
            </header>
          </div>
        </div>

        {isViewing&&!showNav&&(
          <button className="pull-tab" onClick={()=>setShowNav(true)} onMouseEnter={()=>setShowNav(true)}>
            <ChevronDown size={11}/> show navigation <ChevronDown size={11}/>
          </button>
        )}

        <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
          {isViewing&&showNav&&<div style={{position:'absolute',inset:0,zIndex:20,cursor:'pointer'}} onMouseEnter={()=>setShowNav(false)} onClick={()=>setShowNav(false)}/>}

          {showNotes&&canShowNotes&&(
            <NotesSidebar subjectCode={subject} paperNum={paper} onClose={()=>setShowNotes(false)} isAdmin={isAdmin} onRequestAuth={()=>setShowPwModal(true)}/>
          )}

          {!isViewing&&(
            <div className="grid-bg anim-fade" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center',background:'var(--bg)'}}>
              <div style={{position:'absolute',top:'20%',left:'25%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(79,142,247,0.04) 0%,transparent 70%)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:'20%',right:'25%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(192,132,252,0.04) 0%,transparent 70%)',pointerEvents:'none'}}/>
              <div className="empty-icon-ring" style={{marginBottom:32,zIndex:1}}><BookOpen size={38} color="var(--accent)" strokeWidth={1.5}/></div>
              <h2 style={{fontSize:34,fontWeight:700,color:'var(--text)',marginBottom:14,zIndex:1}}>Ready to study?</h2>
              <p style={{color:'var(--text2)',fontSize:15,lineHeight:1.7,maxWidth:420,marginBottom:32,fontWeight:300,zIndex:1}}>
                Configure your paper above, then hit&nbsp;
                <span style={{fontSize:12,color:'var(--accent)',background:'var(--accent-d)',padding:'2px 8px',borderRadius:5,whiteSpace:'nowrap'}}>Load Paper</span>
                &nbsp;to open the viewer.
              </p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',zIndex:1}}>
                {['Fast PDF Engine','Subject Notes','MCQ Solver','File Attachments','Topical Questions','16 Years of Papers'].map(t=>(
                  <span className="tag" key={t} style={{fontSize:11}}><span style={{color:'var(--accent)',fontSize:8}}>✦</span> {t}</span>
                ))}
              </div>
            </div>
          )}

          {isViewing&&(
            <div className="anim-fade" style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
              <iframe src={viewerSrc} style={{flex:1,width:'100%',border:'none',background:'#fff'}} title="PDF Viewer" allowFullScreen/>
            </div>
          )}
        </main>
      </div>
    </>
  );
}