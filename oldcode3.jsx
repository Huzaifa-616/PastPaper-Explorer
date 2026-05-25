import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, Mail, X, Copy, Check,
  Play, Github, Terminal, ArrowLeft, Layers, Sun, Moon,
  NotebookPen, Lock, Plus, Trash2, FileText, Eye, EyeOff
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { code: '9709', name: 'Mathematics' },
  { code: '9618', name: 'Computer Science' },
  { code: '9701', name: 'Chemistry' },
  { code: '9702', name: 'Physics' },
  { code: '9700', name: 'Biology' },
  { code: '9231', name: 'Further Mathematics' },
];
const YEARS    = Array.from({ length: 16 }, (_, i) => (2026 - i).toString());
const SEASONS  = [{ code: 'm', name: 'March' }, { code: 's', name: 'Summer' }, { code: 'w', name: 'Winter' }];
const PAPERS   = ['1', '2', '3', '4', '5', '6'];
const VARIANTS = ['1', '2', '3'];
const GITHUB_REPO_URL = "https://github.com/Huzaifa-616/PastPaper-Explorer";
const NOTES_PASSWORD  = "bravo07";
const NOTES_KEY       = "nexus_notes_v1";

// ─── Notes helpers ────────────────────────────────────────────────────────────
const loadNotes = () => {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); }
  catch { return {}; }
};
const saveNotes = (notes) => localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
const noteKey   = (subjectCode, paperNum) => `${subjectCode}_${paperNum}`;
const subjectName = (code) => SUBJECTS.find(s => s.code === code)?.name || code;

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; }

    :root {
      --bg:          ${dark ? '#06060f' : '#f4f6fb'};
      --bg2:         ${dark ? '#0c0c1c' : '#ffffff'};
      --surface:     ${dark ? '#10101f' : '#ffffff'};
      --surface2:    ${dark ? '#181828' : '#eef1f8'};
      --line:        ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'};
      --line2:       ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'};
      --accent:      ${dark ? '#4f8ef7' : '#2563eb'};
      --accent-dim:  ${dark ? 'rgba(79,142,247,0.15)' : 'rgba(37,99,235,0.1)'};
      --accent-glow: ${dark ? 'rgba(79,142,247,0.28)' : 'rgba(37,99,235,0.2)'};
      --blue:        ${dark ? '#818cf8' : '#6366f1'};
      --blue-dim:    ${dark ? 'rgba(129,140,248,0.12)' : 'rgba(99,102,241,0.08)'};
      --green:       ${dark ? '#34d399' : '#059669'};
      --green-dim:   ${dark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)'};
      --red:         ${dark ? '#f87171' : '#dc2626'};
      --red-dim:     ${dark ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)'};
      --text:        ${dark ? '#e2e8f0' : '#0f172a'};
      --text2:       ${dark ? '#8a8aaa' : '#64748b'};
      --text3:       ${dark ? '#4a4a66' : '#94a3b8'};
    }

    html, body, #root { height: 100%; background: var(--bg); }
    body { font-family: 'Roboto', sans-serif; color: var(--text); }
    ::selection { background: var(--accent-dim); color: var(--text); }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 2px; }

    .font-display { font-family: 'Roboto', sans-serif; font-weight: 700; }
    .font-mono    { font-family: 'Roboto', sans-serif; font-weight: 500; }

    .grid-bg {
      background-image:
        linear-gradient(var(--line) 1px, transparent 1px),
        linear-gradient(90deg, var(--line) 1px, transparent 1px);
      background-size: 52px 52px;
    }

    @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes slideInLeft  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
    @keyframes slideOutLeft { from{transform:translateX(0)} to{transform:translateX(-100%)} }
    @keyframes pulse-ring {
      0%  { transform:scale(0.95); opacity:0.6; }
      50% { transform:scale(1.05); opacity:0.2; }
      100%{ transform:scale(0.95); opacity:0.6; }
    }

    .anim-0 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-1 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
    .anim-2 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
    .anim-3 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.36s both; }
    .anim-fade { animation: fadeIn 0.5s ease both; }

    /* ── Tool cards ── */
    .tool-card {
      background: var(--surface); border: 1px solid var(--line2);
      border-radius: 16px; padding: 36px 32px; cursor: pointer;
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.3s, box-shadow 0.4s;
      position: relative; overflow: hidden; text-align: left;
    }
    .tool-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      opacity:0; transition:opacity 0.3s;
    }
    .tool-card:hover { transform:translateY(-8px); border-color:var(--accent); }
    .tool-card:hover::before { opacity:1; }
    .tool-card.blue:hover { border-color:var(--blue); }
    .tool-card.blue::before { background:linear-gradient(90deg,transparent,var(--blue),transparent); }
    .tool-card:hover .card-glow-a { box-shadow:0 0 60px var(--accent-glow); opacity:1; }
    .tool-card:hover .card-glow-b { box-shadow:0 0 60px rgba(91,141,245,0.3); opacity:1; }
    .card-glow-a,.card-glow-b { position:absolute;inset:0;opacity:0;transition:opacity 0.4s;pointer-events:none;border-radius:16px; }

    .icon-badge {
      width:56px; height:56px; border-radius:14px;
      display:flex; align-items:center; justify-content:center;
      margin-bottom:24px; border:1px solid var(--line2); background:var(--surface2);
      transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);
    }
    .tool-card:hover .icon-badge { transform:scale(1.1) rotate(-3deg); }

    /* ── Selects ── */
    .nexus-select {
      appearance:none; background:var(--surface2); border:1px solid var(--line2);
      border-radius:8px; color:var(--text); font-family:'Roboto',sans-serif;
      font-size:11px; padding:7px 28px 7px 10px; cursor:pointer;
      transition:border-color 0.2s,box-shadow 0.2s; outline:none;
    }
    .nexus-select:hover { border-color:rgba(79,142,247,0.5); }
    .nexus-select:focus { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-dim); }
    .nexus-select option { background:var(--bg2); color:var(--text); }

    /* ── Tags ── */
    .tag {
      display:inline-flex; align-items:center; gap:6px; padding:4px 10px;
      border-radius:99px; border:1px solid var(--line2); background:var(--surface2);
      font-size:10px; color:var(--text2);
    }

    /* ── Shimmer ── */
    .shimmer-text {
      background:linear-gradient(90deg,var(--accent) 0%,#93c5fd 50%,var(--accent) 100%);
      background-size:200% auto; -webkit-background-clip:text;
      -webkit-text-fill-color:transparent; background-clip:text;
      animation:shimmer 4s linear infinite;
    }

    /* ── Nav ── */
    .nav-bar {
      background:${dark ? 'rgba(6,6,15,0.92)' : 'rgba(244,246,251,0.92)'};
      backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
      border-bottom:1px solid var(--line2);
    }

    /* ── Segmented ── */
    .seg-btn {
      padding:5px 14px; border-radius:6px; font-size:11px;
      font-family:'Roboto',sans-serif; font-weight:500;
      cursor:pointer; transition:all 0.2s; border:none; background:none;
    }
    .seg-btn.active-accent { background:var(--accent); color:#fff; }
    .seg-btn.active-blue   { background:var(--blue);   color:#fff; }
    .seg-btn.inactive { color:var(--text2); }
    .seg-btn.inactive:hover { color:var(--text); }

    /* ── Load button ── */
    .btn-load {
      display:inline-flex; align-items:center; gap:6px; padding:8px 20px;
      border-radius:8px; font-size:12px; font-weight:600;
      font-family:'Roboto',sans-serif; border:none; cursor:pointer; transition:all 0.25s;
    }
    .btn-load.ready { background:var(--accent); color:#fff; box-shadow:0 0 20px var(--accent-glow); }
    .btn-load.ready:hover { filter:brightness(1.1); transform:translateY(-1px); }
    .btn-load.ready:active { transform:scale(0.97); }
    .btn-load.disabled { background:var(--surface2); color:var(--text3); cursor:not-allowed; }

    /* ── Icon button ── */
    .icon-btn {
      display:flex; align-items:center; justify-content:center;
      width:34px; height:34px; border-radius:8px; border:1px solid var(--line2);
      background:var(--surface2); color:var(--text2); cursor:pointer; transition:all 0.2s;
    }
    .icon-btn:hover { color:var(--text); background:var(--surface); }

    /* ── Pull tab ── */
    .pull-tab {
      display:flex; align-items:center; justify-content:center;
      width:100%; height:28px; border-bottom:1px solid var(--line2); background:var(--bg);
      cursor:pointer; gap:8px; font-size:9px; letter-spacing:0.1em; text-transform:uppercase;
      color:var(--text3); transition:color 0.2s,background 0.2s; border:none;
    }
    .pull-tab:hover { color:var(--accent); background:var(--surface2); }

    /* ── Modals ── */
    .modal-overlay {
      position:fixed; inset:0; z-index:9999; display:flex; align-items:center;
      justify-content:center; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
      animation:fadeIn 0.2s ease both; padding:16px;
    }
    .modal-box {
      background:var(--surface); border:1px solid var(--line2); border-radius:20px;
      width:100%; max-width:400px; position:relative; overflow:hidden;
      animation:fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both;
    }
    .modal-strip { height:2px; background:linear-gradient(90deg,var(--accent),var(--blue)); }

    /* ── Notes sidebar ── */
    .notes-sidebar {
      position:absolute; left:0; top:0; bottom:0; width:340px; z-index:50;
      background:var(--surface);
      border-right:1px solid var(--line2);
      display:flex; flex-direction:column;
      box-shadow:4px 0 30px rgba(0,0,0,0.25);
      animation:slideInLeft 0.3s cubic-bezier(0.22,1,0.36,1) both;
    }
    .notes-sidebar-backdrop {
      position:absolute; inset:0; z-index:49; background:rgba(0,0,0,0.3);
    }
    .note-card {
      background:var(--surface2); border:1px solid var(--line2); border-radius:10px;
      padding:14px 16px; transition:border-color 0.2s;
    }
    .note-card:hover { border-color:var(--accent); }
    .note-input {
      width:100%; background:var(--surface2); border:1px solid var(--line2);
      border-radius:8px; color:var(--text); font-family:'Roboto',sans-serif;
      font-size:13px; padding:10px 12px; outline:none; resize:vertical;
      transition:border-color 0.2s, box-shadow 0.2s;
    }
    .note-input:focus { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-dim); }
    .note-input::placeholder { color:var(--text3); }

    /* ── Logo ── */
    .logo-mark {
      width:34px; height:34px; border-radius:9px;
      background:linear-gradient(135deg,var(--accent) 0%,#93c5fd 100%);
      display:flex; align-items:center; justify-content:center;
    }

    /* ── Empty state ring ── */
    .empty-icon-ring {
      width:110px; height:110px; border-radius:50%; border:1px solid var(--line2);
      display:flex; align-items:center; justify-content:center; position:relative;
    }
    .empty-icon-ring::before {
      content:''; position:absolute; inset:-10px; border-radius:50%;
      border:1px dashed var(--line2); animation:pulse-ring 3s ease-in-out infinite;
    }

    .deco-line {
      position:absolute; background:linear-gradient(90deg,transparent,var(--line2),transparent);
      height:1px; width:60%;
    }

    .no-sb { scrollbar-width:none; }
    .no-sb::-webkit-scrollbar { display:none; }

    /* ── Mobile nav ── */
    @media (max-width: 640px) {
      .nav-inner { flex-direction:column !important; align-items:stretch !important; gap:10px !important; }
      .nav-divider { display:none !important; }
      .nav-brand-text { display:none !important; }
      .nav-filters {
        display:grid !important; grid-template-columns:1fr 1fr 1fr !important;
        gap:8px 10px !important; overflow:visible !important;
        flex:unset !important; padding-bottom:0 !important;
      }
      .nav-filters > div { width:100%; }
      .nav-filters .nexus-select { width:100%; font-size:10px !important; padding:6px 22px 6px 8px !important; }
      .seg-btn { padding:5px 8px !important; font-size:10px !important; }
      .nav-actions { display:flex !important; width:100% !important; margin-left:0 !important; justify-content:space-between !important; }
      .nav-actions .btn-load { flex:1 !important; justify-content:center !important; }
      .notes-sidebar { width:100% !important; }
    }
  `}</style>
);

// ─── NexusSelect ──────────────────────────────────────────────────────────────
const NexusSelect = ({ label, value, onChange, options }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    <span style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:2 }}>{label}</span>
    <div style={{ position:'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} className="nexus-select">
        <option value="" disabled>—</option>
        {options.map((opt, i) => {
          const v = typeof opt === 'object' ? opt.value : opt;
          const l = typeof opt === 'object' ? opt.label : opt;
          return <option key={i} value={v}>{l}</option>;
        })}
      </select>
      <ChevronDown size={11} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', pointerEvents:'none' }} />
    </div>
  </div>
);

// ─── ContactModal ─────────────────────────────────────────────────────────────
const ContactModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = "huzaifa.bravo@gmail.com";
  useEffect(() => { if (copied) { const t = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t); } }, [copied]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-strip" />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid var(--line)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Mail size={15} color="var(--accent)" />
            </div>
            <span style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>Contact</span>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ borderRadius:'50%', width:28, height:28 }}><X size={14} /></button>
        </div>
        <div style={{ padding:'28px 22px 24px', textAlign:'center' }}>
          <p style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6, marginBottom:22 }}>
            Questions, feedback, or just want to say hi?<br />Drop a line below.
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface2)', border:'1px solid var(--line2)', borderRadius:10, padding:'6px 6px 6px 14px', marginBottom:8 }}>
            <span style={{ flex:1, fontSize:12, color:'var(--text)', textAlign:'left', fontFamily:'monospace' }}>{email}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(email); setCopied(true); }}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:7, border:'none', cursor:'pointer', background:copied ? 'var(--accent)' : 'var(--surface)', color:copied ? '#fff' : 'var(--text2)', fontSize:11, fontWeight:600, transition:'all 0.2s', boxShadow:copied ? '0 0 14px var(--accent-glow)' : 'none' }}
            >
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <p style={{ fontSize:9, color:'var(--text3)', letterSpacing:'0.08em' }}>
            {copied ? '✦ COPIED TO CLIPBOARD' : 'CLICK TO COPY ADDRESS'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── NotesSidebar ─────────────────────────────────────────────────────────────
const NotesSidebar = ({ subjectCode, paperNum, onClose, isAdmin, onRequestAuth }) => {
  const key         = noteKey(subjectCode, paperNum);
  const subjName    = subjectName(subjectCode);
  const [notes, setNotes]           = useState(() => loadNotes()[key] || []);
  const [showAdd,  setShowAdd]      = useState(false);
  const [noteTitle, setNoteTitle]   = useState('');
  const [noteBody,  setNoteBody]    = useState('');
  const [delConfirm, setDelConfirm] = useState(null); // id to confirm delete

  const persist = (updated) => {
    setNotes(updated);
    const all = loadNotes();
    all[key] = updated;
    saveNotes(all);
  };

  const handleAdd = () => {
    if (!noteBody.trim()) return;
    const newNote = {
      id: Date.now().toString(),
      title: noteTitle.trim() || `Note ${notes.length + 1}`,
      content: noteBody.trim(),
      timestamp: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
    };
    persist([newNote, ...notes]);
    setNoteTitle(''); setNoteBody(''); setShowAdd(false);
  };

  const handleDelete = (id) => {
    persist(notes.filter(n => n.id !== id));
    setDelConfirm(null);
  };

  return (
    <>
      <div className="notes-sidebar-backdrop" onClick={onClose} />
      <div className="notes-sidebar">

        {/* Header */}
        <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--line2)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <NotebookPen size={14} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>Notes</div>
                <div style={{ fontSize:10, color:'var(--text3)' }}>{subjName} · Paper {paperNum}</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} style={{ width:28, height:28, borderRadius:'50%' }}><X size={13} /></button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10 }}>
            <span style={{ fontSize:10, color:'var(--text3)' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
            <span style={{ flex:1 }} />
            {isAdmin ? (
              <button
                onClick={() => setShowAdd(s => !s)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:7, border:'none', cursor:'pointer', background:'var(--accent)', color:'#fff', fontSize:11, fontWeight:600, transition:'all 0.2s' }}
              >
                <Plus size={12} /> Add Note
              </button>
            ) : (
              <button
                onClick={onRequestAuth}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:7, border:'1px solid var(--line2)', cursor:'pointer', background:'var(--surface2)', color:'var(--text2)', fontSize:11, transition:'all 0.2s' }}
              >
                <Lock size={11} /> Unlock to add
              </button>
            )}
          </div>
        </div>

        {/* Add form */}
        {showAdd && isAdmin && (
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--line2)', background:'var(--surface2)', flexShrink:0 }}>
            <input
              className="note-input"
              placeholder="Title (optional)"
              value={noteTitle}
              onChange={e => setNoteTitle(e.target.value)}
              style={{ marginBottom:8, height:36, resize:'none' }}
            />
            <textarea
              className="note-input"
              placeholder="Write your note here…"
              value={noteBody}
              onChange={e => setNoteBody(e.target.value)}
              rows={4}
              style={{ marginBottom:10 }}
            />
            <div style={{ display:'flex', gap:8 }}>
              <button
                onClick={handleAdd}
                disabled={!noteBody.trim()}
                style={{ flex:1, padding:'8px', borderRadius:7, border:'none', cursor:noteBody.trim() ? 'pointer' : 'not-allowed', background:noteBody.trim() ? 'var(--accent)' : 'var(--surface)', color:noteBody.trim() ? '#fff' : 'var(--text3)', fontSize:12, fontWeight:600, transition:'all 0.2s' }}
              >
                Save Note
              </button>
              <button
                onClick={() => { setShowAdd(false); setNoteTitle(''); setNoteBody(''); }}
                style={{ padding:'8px 14px', borderRadius:7, border:'1px solid var(--line2)', cursor:'pointer', background:'transparent', color:'var(--text2)', fontSize:12, transition:'all 0.2s' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 18px', display:'flex', flexDirection:'column', gap:10 }}>
          {notes.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text3)' }}>
              <FileText size={36} style={{ opacity:0.3, marginBottom:12 }} />
              <p style={{ fontSize:13, marginBottom:6 }}>No notes yet</p>
              <p style={{ fontSize:11 }}>
                {isAdmin ? 'Click "Add Note" above to get started.' : 'Unlock to start adding notes.'}
              </p>
            </div>
          ) : notes.map(note => (
            <div key={note.id} className="note-card">
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:'var(--text)', lineHeight:1.3 }}>{note.title}</span>
                {isAdmin && (
                  delConfirm === note.id ? (
                    <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                      <button onClick={() => handleDelete(note.id)} style={{ padding:'3px 8px', borderRadius:5, border:'none', cursor:'pointer', background:'var(--red)', color:'#fff', fontSize:10, fontWeight:600 }}>Delete</button>
                      <button onClick={() => setDelConfirm(null)} style={{ padding:'3px 8px', borderRadius:5, border:'1px solid var(--line2)', cursor:'pointer', background:'transparent', color:'var(--text2)', fontSize:10 }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDelConfirm(note.id)} className="icon-btn" style={{ width:24, height:24, borderRadius:6, flexShrink:0, border:'none' }}><Trash2 size={11} color="var(--text3)" /></button>
                  )
                )}
              </div>
              <p style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{note.content}</p>
              <p style={{ fontSize:10, color:'var(--text3)', marginTop:8 }}>{note.timestamp}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 18px', borderTop:'1px solid var(--line2)', flexShrink:0 }}>
          <p style={{ fontSize:10, color:'var(--text3)', textAlign:'center' }}>
            {isAdmin ? '🔓 Admin mode · notes auto-saved' : '🔒 Read-only — unlock to edit'}
          </p>
        </div>
      </div>
    </>
  );
};

// ─── PasswordModal ────────────────────────────────────────────────────────────
const PasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [pw, setPw]         = useState('');
  const [show, setShow]     = useState(false);
  const [error, setError]   = useState(false);
  const inputRef            = useRef(null);

  useEffect(() => { if (isOpen) { setPw(''); setError(false); setTimeout(() => inputRef.current?.focus(), 100); } }, [isOpen]);

  const submit = () => {
    if (pw === NOTES_PASSWORD) { onSuccess(); onClose(); setPw(''); setError(false); }
    else { setError(true); setPw(''); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:340 }} onClick={e => e.stopPropagation()}>
        <div className="modal-strip" />
        <div style={{ padding:'22px 24px 26px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Lock size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>Admin Access</div>
                <div style={{ fontSize:10, color:'var(--text3)' }}>Enter password to add notes</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} style={{ width:28, height:28, borderRadius:'50%' }}><X size={13} /></button>
          </div>

          <div style={{ position:'relative', marginBottom:error ? 8 : 16 }}>
            <input
              ref={inputRef}
              type={show ? 'text' : 'password'}
              className="note-input"
              placeholder="Password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={{ paddingRight:38, borderColor: error ? 'var(--red)' : undefined }}
            />
            <button onClick={() => setShow(s => !s)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:4 }}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && <p style={{ fontSize:11, color:'var(--red)', marginBottom:12 }}>Incorrect password. Try again.</p>}

          <button
            onClick={submit}
            style={{ width:'100%', padding:'10px', borderRadius:8, border:'none', cursor:'pointer', background:'var(--accent)', color:'#fff', fontSize:13, fontWeight:600, transition:'all 0.2s' }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Startup Screen ───────────────────────────────────────────────────────────
const StartupScreen = ({ onSelectExplorer, toggleTheme, dark }) => (
  <div className="grid-bg" style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:'-15%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(79,142,247,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
    <div style={{ position:'absolute', bottom:'-15%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(129,140,248,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />
    <div className="deco-line" style={{ top:'15%', left:'20%' }} />
    <div className="deco-line" style={{ bottom:'15%', right:'20%' }} />

    <button className="icon-btn" onClick={toggleTheme} style={{ position:'absolute', top:24, right:24, zIndex:10 }}>
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>

    <div className="anim-0" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:56 }}>
      <div style={{ width:1, height:20, background:'var(--accent)' }} />
      <span style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text2)' }}>Study Tools Hub — A Level</span>
      <div style={{ width:1, height:20, background:'var(--accent)' }} />
    </div>

    <div className="anim-1" style={{ textAlign:'center', marginBottom:64 }}>
      <h1 className="font-display shimmer-text" style={{ fontSize:'clamp(64px,10vw,120px)', fontWeight:700, lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:20 }}>
        The Nexus
      </h1>
      <p style={{ color:'var(--text2)', fontSize:16, fontWeight:300, letterSpacing:'0.06em' }}>
        Connect &nbsp;·&nbsp; Compile &nbsp;·&nbsp; Conquer
      </p>
    </div>

    <div className="anim-2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, width:'100%', maxWidth:640 }}>
      <button className="tool-card" onClick={onSelectExplorer}>
        <div className="card-glow-a" />
        <div className="icon-badge" style={{ background:'var(--accent-dim)', borderColor:'rgba(79,142,247,0.25)' }}>
          <Layers size={24} color="var(--accent)" />
        </div>
        <h2 className="font-display" style={{ fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:10 }}>PastPaper Explorer</h2>
        <p style={{ color:'var(--text2)', fontSize:13, lineHeight:1.6, marginBottom:20 }}>
          Access, view, and navigate A-Level past papers with a built-in fast PDF engine.
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {['Math','Physics','CS','Chemistry'].map(t => <span className="tag" key={t}>{t}</span>)}
        </div>
      </button>

      <button className="tool-card blue" onClick={() => window.open('https://programming-ide.netlify.app/','_blank')}>
        <div className="card-glow-b" />
        <div className="icon-badge" style={{ background:'var(--blue-dim)', borderColor:'rgba(129,140,248,0.25)' }}>
          <Terminal size={24} color="var(--blue)" />
        </div>
        <h2 className="font-display" style={{ fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:10 }}>Programming IDE</h2>
        <p style={{ color:'var(--text2)', fontSize:13, lineHeight:1.6, marginBottom:20 }}>
          Write, compile, and run code directly in the browser. Tailored for CS 9618.
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {['Python','C++','Java','Browser'].map(t => <span className="tag" key={t}>{t}</span>)}
        </div>
      </button>
    </div>

    <div className="anim-3" style={{ marginTop:56, display:'flex', alignItems:'center', gap:16 }}>
      <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer"
        className="icon-btn" style={{ width:'auto', height:'auto', padding:'7px 14px', gap:7, display:'flex', alignItems:'center', borderRadius:8, textDecoration:'none', fontSize:11 }}>
        <Github size={13} color="var(--text2)" />
        <span style={{ fontSize:10, color:'var(--text2)', letterSpacing:'0.06em' }}>View on GitHub</span>
      </a>
      <span style={{ color:'var(--line2)', fontSize:18 }}>·</span>
      <span style={{ fontSize:10, color:'var(--text3)', letterSpacing:'0.06em' }}>Deployed on Netlify · By M. Huzaifa Imran</span>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]         = useState(() => localStorage.getItem('nexusTheme') !== 'light');
  useEffect(() => { localStorage.setItem('nexusTheme', dark ? 'dark' : 'light'); }, [dark]);
  const toggleTheme = () => setDark(d => !d);

  const [showStartup,   setShowStartup]   = useState(true);
  const [showContact,   setShowContact]   = useState(false);
  const [isViewing,     setIsViewing]     = useState(false);
  const [showNav,       setShowNav]       = useState(true);

  // Notes state
  const [showNotes,     setShowNotes]     = useState(false);
  const [isAdmin,       setIsAdmin]       = useState(false);
  const [showPwModal,   setShowPwModal]   = useState(false);

  const [subject, setSubject] = useState('');
  const [year,    setYear]    = useState('');
  const [season,  setSeason]  = useState('');
  const [paper,   setPaper]   = useState('');
  const [variant, setVariant] = useState('');
  const [type,    setType]    = useState('qp');

  const isComplete = subject && year && season && paper && variant;

  const activeFileUrl = useMemo(() => {
    if (!isComplete) return '';
    const sy = year.slice(2);
    return `/papers/${subject}_${season}${sy}_${type}_${paper}${variant}.pdf`;
  }, [subject, year, season, paper, variant, type, isComplete]);

  const viewerSrc = useMemo(() => `/pdf-viewer/web/viewer.html?file=${encodeURIComponent(activeFileUrl)}`, [activeFileUrl]);

  useEffect(() => { document.title = "The Nexus | Study Tools"; }, []);

  // Close notes sidebar when subject or paper changes
  useEffect(() => { setShowNotes(false); }, [subject, paper]);

  const handleLoad  = () => { if (!isComplete) return; setIsViewing(true); setShowNav(false); };
  const handleHome  = () => { setIsViewing(false); setShowNav(true); };

  // Notes button visible whenever subject + paper selected
  const canShowNotes = !!subject && !!paper;

  if (showStartup) return (
    <>
      <GlobalStyles dark={dark} />
      <StartupScreen onSelectExplorer={() => setShowStartup(false)} toggleTheme={toggleTheme} dark={dark} />
    </>
  );

  return (
    <>
      <GlobalStyles dark={dark} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      <PasswordModal
        isOpen={showPwModal}
        onClose={() => setShowPwModal(false)}
        onSuccess={() => setIsAdmin(true)}
      />

      <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg)', overflow:'hidden' }}>

        {/* ── Collapsible Nav ── */}
        <div style={{ display:'grid', gridTemplateRows: showNav ? '1fr' : '0fr', transition:'grid-template-rows 0.3s ease', flexShrink:0, zIndex:30 }}>
          <div style={{ overflow:'hidden', minHeight:0 }}>
            <header className="nav-bar" style={{ padding:'12px 20px' }}>
              <div className="nav-inner" style={{ maxWidth:1600, margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', gap:14 }}>

                {/* Brand */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:4 }}>
                  <button className="icon-btn" onClick={() => { setShowStartup(true); handleHome(); setShowNotes(false); }} title="Back to Nexus" style={{ flexShrink:0 }}>
                    <ArrowLeft size={14} />
                  </button>
                  <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={handleHome}>
                    <div className="logo-mark"><Layers size={16} color="#ffffff" strokeWidth={2.2} /></div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.2 }}>PastPaper Explorer</div>
                      <div className="nav-brand-text" style={{ fontSize:9, color:'var(--text3)', letterSpacing:'0.1em' }}>BY M. HUZAIFA IMRAN</div>
                    </div>
                  </div>
                </div>

                <div className="nav-divider" style={{ width:1, height:32, background:'var(--line2)', flexShrink:0 }} />

                {/* Filters */}
                <div className="nav-filters no-sb" style={{ display:'flex', alignItems:'flex-end', gap:12, flex:1, overflowX:'auto', paddingBottom:2 }}>
                  <NexusSelect label="Subject" value={subject} onChange={v => { setSubject(v); setShowNotes(false); }}
                    options={SUBJECTS.map(s => ({ value:s.code, label:`${s.code} · ${s.name}` }))} />
                  <NexusSelect label="Year"    value={year}    onChange={setYear}    options={YEARS} />
                  <NexusSelect label="Season"  value={season}  onChange={setSeason}  options={SEASONS.map(s => ({ value:s.code, label:s.name }))} />
                  <NexusSelect label="Paper"   value={paper}   onChange={v => { setPaper(v); setShowNotes(false); }} options={PAPERS} />
                  <NexusSelect label="Variant" value={variant} onChange={setVariant} options={VARIANTS} />

                  {/* QP / MS */}
                  <div className="seg-wrap" style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    <span style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:2 }}>Type</span>
                    <div style={{ display:'flex', background:'var(--surface2)', border:'1px solid var(--line2)', borderRadius:8, padding:3, gap:2 }}>
                      <button className={`seg-btn ${type === 'qp' ? 'active-accent' : 'inactive'}`} onClick={() => setType('qp')}>QP</button>
                      <button className={`seg-btn ${type === 'ms' ? 'active-blue'  : 'inactive'}`} onClick={() => setType('ms')}>MS</button>
                    </div>
                  </div>

                  {/* Notes button — appears when subject + paper selected */}
                  {canShowNotes && (
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }} className="anim-fade">
                      <span style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:2 }}>Notes</span>
                      <button
                        onClick={() => setShowNotes(s => !s)}
                        style={{
                          display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, border:'none', cursor:'pointer', transition:'all 0.2s',
                          background: showNotes ? 'var(--green)' : 'var(--green-dim)',
                          color:      showNotes ? '#fff'         : 'var(--green)',
                          fontSize:11, fontWeight:600,
                        }}
                      >
                        <NotebookPen size={13} />
                        {showNotes ? 'Close' : 'Notes'}
                      </button>
                    </div>
                  )}

                  {/* CS IDE shortcut */}
                  {subject === '9618' && (paper === '2' || paper === '4') && (
                    <button onClick={() => window.open('https://programming-ide.netlify.app/','_blank')} className="anim-fade"
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'1px solid var(--blue-dim)', background:'var(--blue-dim)', color:'var(--blue)', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
                      <Terminal size={13} /> IDE
                    </button>
                  )}
                </div>

                {/* Right actions */}
                <div className="nav-actions" style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto', flexShrink:0 }}>
                  <button className={`btn-load ${isComplete ? 'ready' : 'disabled'}`} onClick={handleLoad} disabled={!isComplete}>
                    <Play size={11} fill="currentColor" />
                    {isViewing ? 'Reload' : 'Load Paper'}
                  </button>

                  {isViewing && (
                    <button className="icon-btn" onClick={() => setShowNav(false)} title="Collapse"><ChevronUp size={13} /></button>
                  )}

                  <div style={{ width:1, height:22, background:'var(--line2)' }} />

                  <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
                    {dark ? <Sun size={13} /> : <Moon size={13} />}
                  </button>
                  <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ textDecoration:'none' }}>
                    <Github size={13} />
                  </a>
                  <button className="icon-btn" onClick={() => setShowContact(true)} title="Contact">
                    <Mail size={13} />
                  </button>
                </div>

              </div>
            </header>
          </div>
        </div>

        {/* ── Pull tab ── */}
        {isViewing && !showNav && (
          <button className="pull-tab" onClick={() => setShowNav(true)} onMouseEnter={() => setShowNav(true)}>
            <ChevronDown size={11} /> show navigation <ChevronDown size={11} />
          </button>
        )}

        {/* ── Main ── */}
        <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

          {/* Overlay when nav open over PDF */}
          {isViewing && showNav && (
            <div style={{ position:'absolute', inset:0, zIndex:20, cursor:'pointer' }}
              onMouseEnter={() => setShowNav(false)} onClick={() => setShowNav(false)} />
          )}

          {/* Notes Sidebar */}
          {showNotes && canShowNotes && (
            <NotesSidebar
              subjectCode={subject}
              paperNum={paper}
              onClose={() => setShowNotes(false)}
              isAdmin={isAdmin}
              onRequestAuth={() => setShowPwModal(true)}
            />
          )}

          {/* Empty state */}
          {!isViewing && (
            <div className="grid-bg anim-fade" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, textAlign:'center', background:'var(--bg)' }}>
              <div style={{ position:'absolute', top:'20%', left:'25%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(79,142,247,0.04) 0%,transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:'20%', right:'25%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(129,140,248,0.04) 0%,transparent 70%)', pointerEvents:'none' }} />

              <div className="empty-icon-ring" style={{ marginBottom:32, zIndex:1 }}>
                <BookOpen size={38} color="var(--accent)" strokeWidth={1.5} />
              </div>
              <h2 className="font-display" style={{ fontSize:36, fontWeight:700, color:'var(--text)', marginBottom:14, zIndex:1 }}>
                Ready to study?
              </h2>
              <p style={{ color:'var(--text2)', fontSize:15, lineHeight:1.7, maxWidth:420, marginBottom:32, fontWeight:300, zIndex:1 }}>
                Configure your paper above — subject, year, season, paper, and variant —
                then hit&nbsp;
                <span style={{ fontSize:12, color:'var(--accent)', background:'var(--accent-dim)', padding:'2px 8px', borderRadius:5, whiteSpace:'nowrap' }}>
                  Load Paper
                </span>
                &nbsp;to open the viewer.
              </p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', zIndex:1 }}>
                {['Fast PDF Engine','Full-Screen Viewer','16 Years of Papers','Subject Notes'].map(t => (
                  <span className="tag" key={t} style={{ fontSize:11 }}>
                    <span style={{ color:'var(--accent)', fontSize:8 }}>✦</span> {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {isViewing && (
            <div className="anim-fade" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <iframe src={viewerSrc} style={{ flex:1, width:'100%', border:'none', background:'#fff' }} title="PDF Viewer" allowFullScreen />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
