import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Check, FileText, Hash } from 'lucide-react';
import { sfUrl } from '../config/assets';

/* ═══════════════════════════════════════════════════════════════════════════
   SOURCE FILE VIEWER — CS Paper 4
   ═══════════════════════════════════════════════════════════════════════════
   A P4 question is meaningless without its data: "the file Blue.txt contains
   a list of colours...". CAIE ships those .txt files alongside the paper, and
   until now they lived in the library under "P4 Notes" — a different section
   of the site entirely. Most students never found them.

   COPY matters more than DOWNLOAD. A student wants that data in their code,
   not in their Downloads folder.
   ═══════════════════════════════════════════════════════════════════════════ */

const SourceFileViewer = ({ file, onClose }) => {
  const [text, setText] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) return;
    let alive = true;
    setText(null); setError(null); setCopied(false);

    // evidence.doc and friends are binary — fetching them as text renders
    // garbage. Those are download-only.
    if (file.text === false) return;

    fetch(sfUrl(file.path))
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.text(); })
      .then(t => { if (alive) setText(t); })
      .catch(() => { if (alive) setError('Could not load this file. It may not be uploaded yet.'); });

    return () => { alive = false; };
  }, [file]);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [onClose]);

  if (!file) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked — the Download button still works */ }
  };

  const lineCount = file.text === false ? null
    : text ? text.replace(/\n$/, '').split('\n').length : file.lines;

  return (
    <div className="sf-viewer" style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(420px, 100%)',
      background: 'var(--bg)', borderLeft: '1px solid var(--line2)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
      boxShadow: '-10px 0 40px rgba(0,0,0,0.4)',
      animation: 'sfIn 0.28s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <style>{`
        @keyframes sfIn { from { transform: translateX(24px); opacity: 0 } to { transform: none; opacity: 1 } }
        .sf-body::-webkit-scrollbar { width: 6px }
        .sf-btn { display:inline-flex; align-items:center; gap:7px; padding:8px 14px; border-radius:9px;
                  border:1px solid var(--line2); background:var(--surface2); color:var(--text2);
                  font-size:12.5px; font-weight:600; cursor:pointer; transition:.16s; font-family:inherit; }
        @media (hover: hover) { .sf-btn:hover { color:var(--text); border-color:var(--text3) } }
        .sf-btn.done { color:var(--green); border-color:var(--green) }
        @media (max-width: 700px) {
          .sf-viewer { width: 100% !important; }
        }
      `}</style>

      {/* header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderBottom:'1px solid var(--line2)' }}>
        <FileText size={15} color="var(--teal)" style={{ flexShrink:0 }} />
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {file.name}
          </div>
          <div style={{ fontSize:10.5, color:'var(--text3)', display:'flex', gap:8, marginTop:2 }}>
            <span>{file.size}</span>
            {lineCount != null && <span><Hash size={9} style={{ verticalAlign:-1 }} />{lineCount} lines</span>}
          </div>
        </div>
        <button className="sf-btn" onClick={onClose} style={{ padding:'6px 8px' }} title="Close (Esc)">
          <X size={14} />
        </button>
      </div>

      {/* content */}
      <div className="sf-body" style={{ flex:1, overflow:'auto', padding:'14px 16px', minHeight:0 }}>
        {file.text === false ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        height:'100%', textAlign:'center', color:'var(--text3)', gap:10 }}>
            <FileText size={34} strokeWidth={1.5} />
            <div style={{ fontSize:13, color:'var(--text2)', fontWeight:600 }}>Can't preview this one</div>
            <div style={{ fontSize:12, lineHeight:1.6, maxWidth:260 }}>
              {file.name.split('.').pop().toUpperCase()} is a document, not plain text.
              Save it and open it in Word — it's where your evidence goes.
            </div>
          </div>
        ) : error ? (
          <div style={{ color:'var(--rose)', fontSize:12.5, lineHeight:1.6 }}>{error}</div>
        ) : text === null ? (
          <div style={{ color:'var(--text3)', fontSize:12.5 }}>Loading…</div>
        ) : (
          <pre style={{
            margin:0, fontFamily:'"Roboto Mono", ui-monospace, monospace',
            fontSize:12.5, lineHeight:1.65, color:'var(--text2)',
            whiteSpace:'pre-wrap', wordBreak:'break-word',
          }}>{text}</pre>
        )}
      </div>

      {/* actions — Copy first, deliberately */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px', borderTop:'1px solid var(--line2)' }}>
        {file.text !== false && (
          <button className={`sf-btn ${copied ? 'done' : ''}`} onClick={copy} disabled={!text} style={{ flex:1, justifyContent:'center' }}>
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        )}
        <a className="sf-btn" href={sfUrl(file.path)} download={file.name}
           style={{ textDecoration:'none', flex: file.text === false ? 1 : 'none', justifyContent:'center' }}>
          <Download size={13} /> Save
        </a>
      </div>
    </div>
  );
};

export default SourceFileViewer;
