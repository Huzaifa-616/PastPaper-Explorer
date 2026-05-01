import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, Mail, X, Copy, Check,
  Play, Github, Terminal, ArrowLeft, Layers, Sun, Moon, Sparkles
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
const YEARS    = Array.from({ length: 15 }, (_, i) => (2025 - i).toString());
const SEASONS  = [{ code: 'm', name: 'March' }, { code: 's', name: 'Summer' }, { code: 'w', name: 'Winter' }];
const PAPERS   = ['1', '2', '3', '4', '5', '6'];
const VARIANTS = ['1', '2', '3'];
const GITHUB_REPO_URL = "https://github.com/Huzaifa-616/PastPaper-Explorer";

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
      --text:        ${dark ? '#e2e8f0' : '#0f172a'};
      --text2:       ${dark ? '#8a8aaa' : '#64748b'};
      --text3:       ${dark ? '#4a4a66' : '#94a3b8'};
    }

    html, body, #root { height: 100%; background: var(--bg); }

    body { font-family: 'Roboto', sans-serif; color: var(--text); }

    ::selection { background: var(--accent-dim); color: var(--text); }

    ::-webkit-scrollbar { width: 3px; height: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 2px; }

    .font-display { font-family: 'Roboto', sans-serif; font-weight: 700; }
    .font-mono    { font-family: 'Roboto', sans-serif; font-weight: 500; }

    /* ── Grid BG ── */
    .grid-bg {
      background-image:
        linear-gradient(var(--line) 1px, transparent 1px),
        linear-gradient(90deg, var(--line) 1px, transparent 1px);
      background-size: 52px 52px;
    }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center;  }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(0.95); opacity: 0.6; }
      50%  { transform: scale(1.05); opacity: 0.2; }
      100% { transform: scale(0.95); opacity: 0.6; }
    }
    @keyframes scanline {
      0%   { transform: translateY(-5px); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateY(4px);  opacity: 0; }
    }

    .anim-0 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-1 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
    .anim-2 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
    .anim-3 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.36s both; }
    .anim-fade { animation: fadeIn 0.5s ease both; }

    /* ── Cards ── */
    .tool-card {
      background: var(--surface);
      border: 1px solid var(--line2);
      border-radius: 16px;
      padding: 36px 32px;
      cursor: pointer;
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.3s, box-shadow 0.4s;
      position: relative;
      overflow: hidden;
      text-align: left;
    }
    .tool-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .tool-card:hover { transform: translateY(-8px); border-color: var(--accent); }
    .tool-card:hover::before { opacity: 1; }
    .tool-card.blue:hover { border-color: var(--blue); }
    .tool-card.blue::before { background: linear-gradient(90deg, transparent, var(--blue), transparent); }
    .tool-card:hover .card-glow-amber { box-shadow: 0 0 60px var(--accent-glow); opacity: 1; }
    .tool-card:hover .card-glow-blue  { box-shadow: 0 0 60px rgba(91,141,245,0.3); opacity: 1; }

    .card-glow-amber, .card-glow-blue {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
      border-radius: 16px;
    }

    /* ── Icon badge ── */
    .icon-badge {
      width: 56px; height: 56px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
      border: 1px solid var(--line2);
      background: var(--surface2);
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
    }
    .tool-card:hover .icon-badge { transform: scale(1.1) rotate(-3deg); }

    /* ── Nexus Select ── */
    .nexus-select {
      appearance: none;
      background: var(--surface2);
      border: 1px solid var(--line2);
      border-radius: 8px;
      color: var(--text);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      padding: 7px 28px 7px 10px;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .nexus-select:hover  { border-color: rgba(232,160,48,0.5); }
    .nexus-select:focus  { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
    .nexus-select option { background: var(--bg2); color: var(--text); }

    /* ── Tag pill ── */
    .tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 99px;
           border: 1px solid var(--line2); background: var(--surface2);
           font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--text2); }

    /* ── Amber shimmer text ── */
    .shimmer-text {
      background: linear-gradient(90deg, var(--accent) 0%, #93c5fd 50%, var(--accent) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 4s linear infinite;
    }

    /* ── Nav backdrop ── */
    .nav-bar {
      background: ${dark
        ? 'rgba(6,6,15,0.92)'
        : 'rgba(248,246,240,0.92)'};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--line2);
    }

    /* ── Segmented ── */
    .seg-btn {
      padding: 5px 14px; border-radius: 6px; font-size: 11px;
      font-family: 'IBM Plex Mono', monospace; font-weight: 500;
      cursor: pointer; transition: all 0.2s; border: none; background: none;
    }
    .seg-btn.active-amber { background: var(--accent); color: #fff; }
    .seg-btn.active-blue  { background: var(--blue);   color: #fff; }
    .seg-btn.inactive { color: var(--text2); }
    .seg-btn.inactive:hover { color: var(--text); }

    /* ── Action button ── */
    .btn-load {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 20px; border-radius: 8px;
      font-size: 12px; font-weight: 600; font-family: 'IBM Plex Mono', monospace;
      border: none; cursor: pointer; transition: all 0.25s;
    }
    .btn-load.ready {
      background: var(--accent);
      color: #ffffff;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .btn-load.ready:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-load.ready:active { transform: scale(0.97); }
    .btn-load.disabled {
      background: var(--surface2); color: var(--text3);
      cursor: not-allowed; box-shadow: none;
    }

    /* ── Icon button ── */
    .icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 8px;
      border: 1px solid var(--line2);
      background: var(--surface2);
      color: var(--text2); cursor: pointer;
      transition: all 0.2s;
    }
    .icon-btn:hover { border-color: var(--line2); color: var(--text); background: var(--surface); }

    /* ── Pull tab ── */
    .pull-tab {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 28px;
      border-bottom: 1px solid var(--line2);
      background: var(--bg);
      cursor: pointer; gap: 8px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text3); transition: color 0.2s, background 0.2s;
    }
    .pull-tab:hover { color: var(--accent); background: var(--surface2); }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      animation: fadeIn 0.2s ease both;
      padding: 16px;
    }
    .modal-box {
      background: var(--surface);
      border: 1px solid var(--line2);
      border-radius: 20px;
      width: 100%; max-width: 380px;
      position: relative; overflow: hidden;
      animation: fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both;
    }
    .modal-strip {
      height: 2px;
      background: linear-gradient(90deg, var(--accent), var(--blue));
    }

    /* ── Empty state ── */
    .empty-icon-ring {
      width: 110px; height: 110px;
      border-radius: 50%;
      border: 1px solid var(--line2);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .empty-icon-ring::before {
      content: '';
      position: absolute; inset: -10px;
      border-radius: 50%;
      border: 1px dashed var(--line2);
      animation: pulse-ring 3s ease-in-out infinite;
    }

    /* ── Logo mark ── */
    .logo-mark {
      width: 34px; height: 34px;
      border-radius: 9px;
      background: linear-gradient(135deg, var(--accent) 0%, #93c5fd 100%);
      display: flex; align-items: center; justify-content: center;
    }

    /* ── Startup decorative lines ── */
    .deco-line {
      position: absolute;
      background: linear-gradient(90deg, transparent, var(--line2), transparent);
      height: 1px; width: 60%;
    }

    /* ── Scrollbar-free horizontal scroll ── */
    .no-sb { scrollbar-width: none; }
    .no-sb::-webkit-scrollbar { display: none; }
  `}</style>
);

// ─── Select ───────────────────────────────────────────────────────────────────
const NexusSelect = ({ label, value, onChange, options }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--text3)', paddingLeft: 2
    }}>{label}</span>
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="nexus-select"
      >
        <option value="" disabled>—</option>
        {options.map((opt, i) => {
          const v = typeof opt === 'object' ? opt.value : opt;
          const l = typeof opt === 'object' ? opt.label : opt;
          return <option key={i} value={v}>{l}</option>;
        })}
      </select>
      <ChevronDown size={11} style={{
        position: 'absolute', right: 8, top: '50%',
        transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none'
      }} />
    </div>
  </div>
);

// ─── Contact Modal ────────────────────────────────────────────────────────────
const ContactModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = "huzaifa.bravo@gmail.com";
  useEffect(() => {
    if (copied) { const t = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t); }
  }, [copied]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-strip" />
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={15} color="var(--accent)" />
            </div>
            <span className="font-display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Contact</span>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ borderRadius: '50%', width: 28, height: 28 }}>
            <X size={14} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '28px 22px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
            Questions, feedback, or just want to say hi?<br />Drop a line below.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface2)', border: '1px solid var(--line2)',
            borderRadius: 10, padding: '6px 6px 6px 14px', marginBottom: 8
          }}>
            <span className="font-mono" style={{ flex: 1, fontSize: 12, color: 'var(--text)', textAlign: 'left' }}>{email}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(email); setCopied(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: copied ? 'var(--accent)' : 'var(--surface)',
                color: copied ? '#ffffff' : 'var(--text2)',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                fontWeight: 600, transition: 'all 0.2s',
                boxShadow: copied ? '0 0 14px var(--accent-glow)' : 'none'
              }}
            >
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <p className="font-mono" style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>
            {copied ? '✦ COPIED TO CLIPBOARD' : 'CLICK TO COPY ADDRESS'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Startup Screen ───────────────────────────────────────────────────────────
const StartupScreen = ({ onSelectExplorer, toggleTheme, dark }) => (
  <div className="grid-bg" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>

    {/* Ambient blobs */}
    <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,160,48,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,141,245,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

    {/* Decorative horizontal rules */}
    <div className="deco-line" style={{ top: '15%', left: '20%' }} />
    <div className="deco-line" style={{ bottom: '15%', right: '20%' }} />

    {/* Theme toggle */}
    <button className="icon-btn" onClick={toggleTheme}
      style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>

    {/* Header badge */}
    <div className="anim-0" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 56 }}>
      <div style={{ width: 1, height: 20, background: 'var(--accent)' }} />
      <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text2)' }}>Study Tools Hub — A Level</span>
      <div style={{ width: 1, height: 20, background: 'var(--accent)' }} />
    </div>

    {/* Hero title */}
    <div className="anim-1" style={{ textAlign: 'center', marginBottom: 64 }}>
      <h1 className="font-display shimmer-text" style={{ fontSize: 'clamp(64px, 10vw, 120px)', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: 20 }}>
        The Nexus
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: 16, fontWeight: 300, letterSpacing: '0.06em' }}>
        Connect &nbsp;·&nbsp; Compile &nbsp;·&nbsp; Conquer
      </p>
    </div>

    {/* Tool cards */}
    <div className="anim-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, width: '100%', maxWidth: 640 }}>

      {/* PastPaper Explorer */}
      <button className="tool-card" onClick={onSelectExplorer}>
        <div className="card-glow-amber" />
        <div className="icon-badge" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(232,160,48,0.25)' }}>
          <Layers size={24} color="var(--accent)" />
        </div>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.01em' }}>
          PastPaper Explorer
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
          Access, view, and navigate A-Level past papers with a built-in fast PDF engine.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Math', 'Physics', 'CS', 'Chemistry'].map(t => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
      </button>

      {/* Programming IDE */}
      <button className="tool-card blue" onClick={() => window.open('https://programming-ide.netlify.app/', '_blank')}>
        <div className="card-glow-blue" />
        <div className="icon-badge" style={{ background: 'var(--blue-dim)', borderColor: 'rgba(91,141,245,0.25)' }}>
          <Terminal size={24} color="var(--blue)" />
        </div>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.01em' }}>
          Programming IDE
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
          Write, compile, and run code directly in the browser. Tailored for CS 9618.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Python', 'C++', 'Java', 'Browser'].map(t => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
      </button>
    </div>

    {/* Footer */}
    <div className="anim-3" style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
      <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer"
        className="icon-btn" style={{ width: 'auto', height: 'auto', padding: '7px 14px', gap: 7, display: 'flex', alignItems: 'center', borderRadius: 8, textDecoration: 'none', fontSize: 11 }}>
        <Github size={13} color="var(--text2)" />
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: '0.06em' }}>Source Code</span>
      </a>
      <span style={{ color: 'var(--line2)', fontSize: 18 }}>·</span>
      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.06em' }}>By M. Huzaifa Imran</span>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('nexusTheme') !== 'light');
  useEffect(() => { localStorage.setItem('nexusTheme', dark ? 'dark' : 'light'); }, [dark]);
  const toggleTheme = () => setDark(d => !d);

  const [showStartup, setShowStartup] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [isViewing,   setIsViewing]   = useState(false);
  const [showNav,     setShowNav]      = useState(true);

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

  const handleLoad = () => { if (!isComplete) return; setIsViewing(true); setShowNav(false); };
  const handleHome = () => { setIsViewing(false); setShowNav(true); };

  if (showStartup) {
    return (
      <>
        <GlobalStyles dark={dark} />
        <StartupScreen onSelectExplorer={() => setShowStartup(false)} toggleTheme={toggleTheme} dark={dark} />
      </>
    );
  }

  return (
    <>
      <GlobalStyles dark={dark} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

        {/* ── Collapsible Nav ── */}
        <div style={{
          display: 'grid',
          gridTemplateRows: showNav ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
          flexShrink: 0, zIndex: 30
        }}>
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
            <header className="nav-bar" style={{ padding: '12px 20px' }}>
              <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>

                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 4 }}>
                  <button className="icon-btn" onClick={() => { setShowStartup(true); handleHome(); }} title="Back to Nexus" style={{ flexShrink: 0 }}>
                    <ArrowLeft size={14} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={handleHome}>
                    <div className="logo-mark">
                      <Layers size={16} color="#ffffff" strokeWidth={2.2} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>PastPaper Explorer</div>
                      <div className="font-mono" style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '0.1em' }}>BY M. HUZAIFA IMRAN</div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 32, background: 'var(--line2)', flexShrink: 0 }} />

                {/* Filters */}
                <div className="no-sb" style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flex: 1, overflowX: 'auto', paddingBottom: 2 }}>
                  <NexusSelect label="Subject" value={subject} onChange={setSubject}
                    options={SUBJECTS.map(s => ({ value: s.code, label: `${s.code} · ${s.name}` }))} />
                  <NexusSelect label="Year"    value={year}    onChange={setYear}    options={YEARS} />
                  <NexusSelect label="Season"  value={season}  onChange={setSeason}  options={SEASONS.map(s => ({ value: s.code, label: s.name }))} />
                  <NexusSelect label="Paper"   value={paper}   onChange={setPaper}   options={PAPERS} />
                  <NexusSelect label="Variant" value={variant} onChange={setVariant} options={VARIANTS} />

                  {/* Doc type segmented */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)', paddingLeft: 2 }}>Type</span>
                    <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--line2)', borderRadius: 8, padding: 3, gap: 2 }}>
                      <button className={`seg-btn ${type === 'qp' ? 'active-amber' : 'inactive'}`} onClick={() => setType('qp')}>QP</button>
                      <button className={`seg-btn ${type === 'ms' ? 'active-blue'  : 'inactive'}`} onClick={() => setType('ms')}>MS</button>
                    </div>
                  </div>

                  {/* CS IDE shortcut */}
                  {subject === '9618' && (paper === '2' || paper === '4') && (
                    <button
                      onClick={() => window.open('https://programming-ide.netlify.app/', '_blank')}
                      className="anim-fade"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8,
                        border: '1px solid var(--blue-dim)',
                        background: 'var(--blue-dim)', color: 'var(--blue)',
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <Terminal size={13} /> IDE
                    </button>
                  )}
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
                  <button className={`btn-load ${isComplete ? 'ready' : 'disabled'}`} onClick={handleLoad} disabled={!isComplete}>
                    <Play size={11} fill="currentColor" />
                    {isViewing ? 'Reload' : 'Load Paper'}
                  </button>

                  {isViewing && (
                    <button className="icon-btn" onClick={() => setShowNav(false)} title="Collapse">
                      <ChevronUp size={13} />
                    </button>
                  )}

                  <div style={{ width: 1, height: 22, background: 'var(--line2)' }} />

                  <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
                    {dark ? <Sun size={13} /> : <Moon size={13} />}
                  </button>
                  <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ textDecoration: 'none' }}>
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
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

          {/* Overlay when nav open over PDF */}
          {isViewing && showNav && (
            <div
              style={{ position: 'absolute', inset: 0, zIndex: 20, cursor: 'pointer' }}
              onMouseEnter={() => setShowNav(false)}
              onClick={() => setShowNav(false)}
            />
          )}

          {/* Empty state */}
          {!isViewing && (
            <div className="grid-bg anim-fade" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 40, textAlign: 'center', background: 'var(--bg)'
            }}>
              {/* ambient blobs */}
              <div style={{ position: 'absolute', top: '20%', left: '25%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,160,48,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '20%', right: '25%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,141,245,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div className="empty-icon-ring" style={{ marginBottom: 32, zIndex: 1 }}>
                <BookOpen size={38} color="var(--accent)" strokeWidth={1.5} />
              </div>

              <h2 className="font-display" style={{ fontSize: 36, fontWeight: 600, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.01em', zIndex: 1 }}>
                Ready to study?
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.7, maxWidth: 420, marginBottom: 32, fontWeight: 300, zIndex: 1 }}>
                Configure your paper above — subject, year, season, paper, and variant —
                then hit&nbsp;
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>
                  Load Paper
                </span>
                &nbsp;to open the viewer.
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>
                {['Fast PDF Engine', 'Full-Screen Viewer', '15 Years of Papers'].map(t => (
                  <span className="tag" key={t} style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--accent)', fontSize: 8 }}>✦</span> {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {isViewing && (
            <div className="anim-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <iframe
                src={viewerSrc}
                style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }}
                title="PDF Viewer"
                allowFullScreen
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
