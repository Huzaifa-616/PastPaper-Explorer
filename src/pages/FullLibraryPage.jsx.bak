import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Activity, ArrowLeft, Beaker, ChevronRight, ExternalLink, FileText, Folder, Library,
  Moon, Sun, Terminal, Zap, Search, X, LayoutGrid, List, Clock, CornerDownLeft,
  File, Image, Code2, BookOpen, Globe, Archive, Video, Music, Table, Presentation,
  FileType2, Sigma, Infinity as InfinityIcon, ArrowUpRight, Download,
} from 'lucide-react';
import { libraryUrl } from '../config/assets';

/* ═══════════════════════════════════════════════════════════════════════════
   THE NEXUS · RESOURCE LIBRARY
   Built around the real problem: ~400 files nested five folders deep. Browsing
   alone is punishing, so SEARCH is the headline feature — everything else
   supports it. Uses the `kind` tag the indexer writes for every file.
   ═══════════════════════════════════════════════════════════════════════════ */

const SUBJECTS = {
  '9618': { hex: 'var(--teal)',   name: 'Computer Science',   Icon: Terminal },
  '9702': { hex: 'var(--amber)',  name: 'Physics',            Icon: Zap },
  '9701': { hex: 'var(--rose)',   name: 'Chemistry',          Icon: Beaker },
  '9700': { hex: 'var(--green)',  name: 'Biology',            Icon: Activity },
  '9709': { hex: 'var(--accent)', name: 'Mathematics',        Icon: Sigma },
  '9231': { hex: 'var(--violet, #a78bfa)', name: 'Further Mathematics', Icon: InfinityIcon },
};

/* The indexer tags each file with `kind`. Old library_db.json files may not
   have it, so we derive it from the extension as a fallback — the page never
   depends on a re-index having happened. */
const EXT_KIND = {
  pdf:'pdf', doc:'doc', docx:'doc', odt:'doc', rtf:'doc',
  ppt:'slides', pptx:'slides', odp:'slides',
  xls:'sheet', xlsx:'sheet', csv:'sheet', ods:'sheet',
  png:'image', jpg:'image', jpeg:'image', gif:'image', webp:'image', svg:'image', bmp:'image',
  zip:'archive', rar:'archive', '7z':'archive', tar:'archive', gz:'archive',
  mp4:'video', mov:'video', mkv:'video', webm:'video',
  mp3:'audio', wav:'audio', m4a:'audio',
  txt:'text', md:'text', html:'web', htm:'web',
  py:'code', js:'code', java:'code', cpp:'code', c:'code',
  epub:'book', mobi:'book',
};
const kindOf = (item) =>
  item.kind || EXT_KIND[(item.name.split('.').pop() || '').toLowerCase()] || 'file';

const KIND = {
  pdf:     { Icon: FileText,     color: 'var(--rose)',   label: 'PDF' },
  doc:     { Icon: FileType2,    color: 'var(--accent)', label: 'Word' },
  slides:  { Icon: Presentation, color: 'var(--amber)',  label: 'Slides' },
  sheet:   { Icon: Table,        color: 'var(--green)',  label: 'Sheet' },
  image:   { Icon: Image,        color: 'var(--violet, #a78bfa)', label: 'Image' },
  archive: { Icon: Archive,      color: 'var(--text2)',  label: 'Archive' },
  video:   { Icon: Video,        color: 'var(--rose)',   label: 'Video' },
  audio:   { Icon: Music,        color: 'var(--teal)',   label: 'Audio' },
  code:    { Icon: Code2,        color: 'var(--teal)',   label: 'Code' },
  book:    { Icon: BookOpen,     color: 'var(--amber)',  label: 'Ebook' },
  text:    { Icon: FileText,     color: 'var(--text2)',  label: 'Text' },
  web:     { Icon: Globe,        color: 'var(--accent)', label: 'Web' },
  file:    { Icon: File,         color: 'var(--text3)',  label: 'File' },
};

const countFiles = (nodes) =>
  (nodes || []).reduce((n, x) => n + (x.type === 'folder' ? countFiles(x.children) : 1), 0);

const RECENT_KEY = 'nexus-lib-recent';

const FullLibraryPage = ({ initialSubject, libraryDb, onBackToHub, toggleTheme, dark }) => {
  const [subjectCode, setSubjectCode] = useState(initialSubject || '');
  const [currentPath, setCurrentPath] = useState([]);
  const [query, setQuery] = useState('');
  const [view, setView] = useState(() => localStorage.getItem('lib-view') || 'grid');
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });
  const [sel, setSel] = useState(0);
  const searchRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => { localStorage.setItem('lib-view', view); }, [view]);

  const brand = SUBJECTS[subjectCode] || { hex: 'var(--text)', name: 'Library' };

  /* ── cursor spotlight (eased, so it reads as light not a div) ── */
  useEffect(() => {
    let tx = innerWidth / 2, ty = innerHeight / 3, cx = tx, cy = ty, raf;
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    addEventListener('pointermove', move, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      if (stageRef.current)
        stageRef.current.style.background =
          `radial-gradient(520px 520px at ${cx}px ${cy}px, color-mix(in srgb, ${brand.hex} 12%, transparent), transparent 70%)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, [brand.hex]);

  /* ── flatten the whole tree ONCE — this is what makes search instant ── */
  const allFiles = useMemo(() => {
    const out = [];
    const walk = (nodes, trail) => {
      for (const n of nodes || []) {
        if (n.type === 'folder') walk(n.children, [...trail, n.name]);
        else out.push({ ...n, _trail: trail });
      }
    };
    walk(libraryDb, []);
    return out;
  }, [libraryDb]);

  /* Multi-term search: "9702 waves" finds Physics waves notes wherever they live. */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/);
    const scored = [];
    for (const f of allFiles) {
      const name = f.name.toLowerCase();
      const hay = (f._trail.join('/') + '/' + f.name).toLowerCase();
      if (!terms.every(t => hay.includes(t))) continue;
      // rank: name matches beat path-only matches; earlier matches beat later
      let score = 0;
      for (const t of terms) {
        const i = name.indexOf(t);
        score += i === 0 ? 100 : i > 0 ? 50 - Math.min(i, 40) : 0;
      }
      scored.push({ f, score });
    }
    scored.sort((a, b) => b.score - a.score || a.f.name.localeCompare(b.f.name));
    return scored.slice(0, 80).map(s => s.f);
  }, [query, allFiles]);

  const searching = query.trim().length > 0;
  useEffect(() => { setSel(0); }, [query]);

  const rootFolder = useMemo(
    () => libraryDb?.find(f => f.name === subjectCode) || null,
    [libraryDb, subjectCode]
  );

  const currentItems = useMemo(() => {
    if (!subjectCode) {
      // Every supported subject always appears, even with no files yet.
      const existing = new Map((libraryDb || []).map(f => [f.name, f]));
      return Object.keys(SUBJECTS).map(code =>
        existing.get(code) || { name: code, type: 'folder', children: [], _empty: true }
      );
    }
    let cur = rootFolder?.children || [];
    for (const step of currentPath) {
      const found = cur.find(c => c.name === step && c.type === 'folder');
      if (found) cur = found.children || []; else break;
    }
    return cur;
  }, [libraryDb, subjectCode, rootFolder, currentPath]);

  const openFile = useCallback((item, trail) => {
    const entry = {
      name: item.name, path: item.path, size: item.size,
      kind: kindOf(item), trail: trail || [], at: Date.now(),
    };
    setRecent(prev => {
      const next = [entry, ...prev.filter(r => r.path !== item.path)].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const navigateTo = (idx) => {
    if (idx === -1) { setSubjectCode(''); setCurrentPath([]); }
    else if (idx === 0) setCurrentPath([]);
    else setCurrentPath(prev => prev.slice(0, idx));
  };

  const goUp = useCallback(() => {
    if (searching) { setQuery(''); return; }
    if (currentPath.length) setCurrentPath(p => p.slice(0, -1));
    else if (subjectCode) setSubjectCode('');
    else onBackToHub?.();
  }, [searching, currentPath, subjectCode, onBackToHub]);

  /* ── keyboard: / to search, Esc to back out, ↑↓ + Enter through results ── */
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.key === 'Escape') { if (typing) e.target.blur(); goUp(); return; }
      if (searching && results.length) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(results.length - 1, s + 1)); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
        if (e.key === 'Enter') {
          const hit = results[sel];
          if (hit) { openFile(hit, hit._trail); window.open(libraryUrl(hit.path), '_blank', 'noopener'); }
        }
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [searching, results, sel, goUp, openFile]);

  const trackGlow = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`);
  };

  const totalFiles = allFiles.length;

  /* ── cards ───────────────────────────────────────────────────────────── */
  const FolderCard = ({ item, i }) => {
    const meta = SUBJECTS[item.name];
    const Icon = meta?.Icon || Folder;
    const color = item._empty ? 'var(--text3)' : (meta?.hex || brand.hex);
    const n = countFiles(item.children);
    return (
      <button
        className={`lib-card ${view === 'list' ? 'row' : ''}`}
        style={{ '--c': color, animationDelay: `${Math.min(i, 14) * 26}ms` }}
        onMouseMove={trackGlow}
        onClick={() => {
          if (!subjectCode) { setSubjectCode(item.name); setCurrentPath([]); }
          else setCurrentPath(prev => [...prev, item.name]);
        }}
      >
        <span className="lib-ico"><Icon size={view === 'list' ? 17 : 21} /></span>
        <span className="lib-body">
          <span className="lib-name">{meta?.name || item.name}</span>
          <span className="lib-sub">
            {item._empty ? 'Coming soon' : `${n} file${n === 1 ? '' : 's'}`}
            {meta && !item._empty && <span className="lib-code">{item.name}</span>}
          </span>
        </span>
        <ChevronRight className="lib-arrow" size={15} />
      </button>
    );
  };

  const FileCard = ({ item, i, trail, active }) => {
    const k = KIND[kindOf(item)] || KIND.file;
    const { Icon } = k;
    return (
      <a
        href={libraryUrl(item.path)} target="_blank" rel="noopener noreferrer"
        className={`lib-card ${view === 'list' || trail ? 'row' : ''} ${active ? 'active' : ''}`}
        style={{ '--c': k.color, animationDelay: `${Math.min(i, 14) * 26}ms` }}
        onMouseMove={trackGlow}
        onClick={() => openFile(item, trail)}
      >
        <span className="lib-ico"><Icon size={view === 'list' || trail ? 17 : 21} /></span>
        <span className="lib-body">
          <span className="lib-name">{item.name}</span>
          <span className="lib-sub">
            <span className="lib-tag">{k.label}</span>
            {item.size && <span>{item.size}</span>}
            {trail?.length > 0 && (
              <span className="lib-trail">
                {trail.map((t, j) => (
                  <React.Fragment key={j}>
                    {j > 0 && <span className="lib-slash">/</span>}
                    {SUBJECTS[t]?.name || t}
                  </React.Fragment>
                ))}
              </span>
            )}
          </span>
        </span>
        <ArrowUpRight className="lib-arrow" size={15} />
      </a>
    );
  };

  return (
    <div className="nx-lib">
      <style>{`
        .nx-lib{ min-height:100vh; display:flex; flex-direction:column; position:relative;
          background:var(--bg); color:var(--text); overflow-x:hidden; }
        .nx-lib-stage{ position:fixed; inset:0; z-index:0; pointer-events:none; }
        .nx-lib-grid-bg{ position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.5;
          background:linear-gradient(var(--line) 1px,transparent 1px),
                     linear-gradient(90deg,var(--line) 1px,transparent 1px);
          background-size:56px 56px;
          mask-image:radial-gradient(circle at 50% 0%, black, transparent 75%);
          -webkit-mask-image:radial-gradient(circle at 50% 0%, black, transparent 75%); }

        .nx-lib-head{ position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:14px;
          padding:16px clamp(16px,4vw,40px); border-bottom:1px solid var(--line2);
          background:color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter:blur(14px); }
        .nx-ib{ width:36px; height:36px; border-radius:10px; display:grid; place-items:center;
          background:var(--surface2); border:1px solid var(--line2); color:var(--text2);
          cursor:pointer; transition:.18s; flex-shrink:0; }
        .nx-ib:hover{ color:var(--text); border-color:var(--text3); transform:translateY(-1px); }
        .nx-logo{ width:36px; height:36px; border-radius:10px; background:var(--text);
          display:grid; place-items:center; flex-shrink:0; transition:transform .3s cubic-bezier(.34,1.56,.64,1); }
        .nx-logo:hover{ transform:rotate(-8deg) scale(1.06); }
        .nx-title b{ font-size:15px; font-weight:700; letter-spacing:-.02em; display:block; line-height:1.1; }
        .nx-title small{ font-size:9.5px; font-weight:600; letter-spacing:.14em; color:var(--text3);
          text-transform:uppercase; }

        /* search — the headline feature */
        .nx-search{ flex:1; max-width:460px; margin-left:8px; display:flex; align-items:center; gap:9px;
          background:var(--surface2); border:1px solid var(--line2); border-radius:11px;
          padding:0 12px; height:38px; transition:.2s; }
        .nx-search:focus-within{ border-color:var(--accent);
          box-shadow:0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }
        .nx-search input{ flex:1; background:none; border:none; outline:none; color:var(--text);
          font-size:13.5px; font-family:inherit; min-width:0; }
        .nx-search input::placeholder{ color:var(--text3); }
        .nx-kbd{ font-size:10px; border:1px solid var(--line2); border-radius:5px; padding:1px 6px;
          color:var(--text3); font-family:ui-monospace,monospace; flex-shrink:0; }
        .nx-seg{ display:flex; background:var(--surface2); border:1px solid var(--line2);
          border-radius:10px; padding:3px; gap:2px; flex-shrink:0; }
        .nx-seg button{ width:30px; height:28px; border-radius:7px; border:none; background:none;
          color:var(--text3); cursor:pointer; display:grid; place-items:center; transition:.15s; }
        .nx-seg button.on{ background:var(--surface3); color:var(--text); }

        .nx-lib-main{ flex:1; z-index:10; position:relative; width:100%; max-width:1400px;
          margin:0 auto; padding:26px clamp(16px,4vw,40px) 60px; }

        .nx-crumbs{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; margin-bottom:22px; }
        .nx-crumb{ background:none; border:none; cursor:pointer; font-size:15px; font-weight:600;
          color:var(--text3); transition:color .18s; padding:2px 0; font-family:inherit; }
        .nx-crumb:hover{ color:var(--text2); }
        .nx-crumb.on{ color:var(--text); }
        .nx-count{ margin-left:auto; font-size:12px; color:var(--text3); font-weight:500; }

        /* recents */
        .nx-recent{ margin-bottom:26px; }
        .nx-lbl{ display:flex; align-items:center; gap:7px; font-size:10.5px; font-weight:800;
          letter-spacing:.14em; color:var(--text3); margin-bottom:10px; text-transform:uppercase; }
        .nx-chips{ display:flex; gap:8px; flex-wrap:wrap; }
        .nx-chip{ display:inline-flex; align-items:center; gap:8px; padding:7px 13px; border-radius:99px;
          background:var(--surface2); border:1px solid var(--line2); color:var(--text2);
          font-size:12px; font-weight:600; text-decoration:none; transition:.18s; max-width:280px; }
        .nx-chip:hover{ color:var(--text); border-color:var(--c); transform:translateY(-2px);
          background:color-mix(in srgb, var(--c) 8%, var(--surface2)); }
        .nx-chip span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        /* cards */
        .lib-grid{ display:grid; gap:12px;
          grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); }
        .lib-grid.list{ grid-template-columns:1fr; gap:7px; }
        .lib-card{ --c:var(--accent); position:relative; display:flex; flex-direction:column;
          align-items:flex-start; gap:13px; padding:18px; border-radius:16px; cursor:pointer;
          background:var(--surface2); border:1px solid var(--line2); text-align:left;
          text-decoration:none; color:inherit; font-family:inherit; overflow:hidden;
          transition:transform .2s cubic-bezier(.16,1,.3,1), border-color .2s, background .2s;
          animation:libIn .45s cubic-bezier(.16,1,.3,1) both; }
        .lib-card::before{ content:""; position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(260px 180px at var(--gx,50%) var(--gy,50%),
            color-mix(in srgb, var(--c) 22%, transparent), transparent 70%);
          opacity:0; transition:opacity .3s; }
        .lib-card:hover{ transform:translateY(-4px); border-color:color-mix(in srgb, var(--c) 55%, transparent);
          background:var(--surface); }
        .lib-card:hover::before{ opacity:1; }
        .lib-card.active{ border-color:var(--c); background:color-mix(in srgb, var(--c) 10%, var(--surface)); }
        .lib-card.row{ flex-direction:row; align-items:center; padding:11px 14px; border-radius:12px; gap:12px; }
        .lib-card.row:hover{ transform:translateX(3px); }

        .lib-ico{ width:40px; height:40px; border-radius:11px; display:grid; place-items:center;
          flex-shrink:0; color:var(--c); background:color-mix(in srgb, var(--c) 13%, transparent);
          box-shadow:0 0 20px -8px var(--c); position:relative; z-index:1; transition:.2s; }
        .lib-card.row .lib-ico{ width:32px; height:32px; border-radius:9px; }
        .lib-card:hover .lib-ico{ transform:scale(1.06); }
        .lib-body{ display:flex; flex-direction:column; gap:5px; min-width:0; flex:1;
          position:relative; z-index:1; }
        .lib-name{ font-size:13.5px; font-weight:650; color:var(--text); line-height:1.4;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
          word-break:break-word; }
        .lib-card.row .lib-name{ -webkit-line-clamp:1; }
        .lib-sub{ display:flex; align-items:center; gap:8px; flex-wrap:wrap;
          font-size:11px; color:var(--text3); font-weight:500; }
        .lib-tag{ font-size:9.5px; font-weight:800; letter-spacing:.07em; color:var(--c);
          background:color-mix(in srgb, var(--c) 13%, transparent); padding:2px 7px; border-radius:5px; }
        .lib-code{ font-family:ui-monospace,monospace; opacity:.7; }
        .lib-trail{ display:flex; align-items:center; gap:5px; opacity:.75; min-width:0;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .lib-slash{ opacity:.4; }
        .lib-arrow{ color:var(--text3); flex-shrink:0; position:relative; z-index:1;
          transition:transform .2s, color .2s; align-self:center; }
        .lib-card:not(.row) .lib-arrow{ position:absolute; top:18px; right:16px; }
        .lib-card:hover .lib-arrow{ color:var(--c); transform:translate(3px,-3px); }
        .lib-card.row:hover .lib-arrow{ transform:translateX(3px); }

        .nx-empty{ display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:80px 20px; color:var(--text3); text-align:center; }
        .nx-empty b{ font-size:16px; font-weight:650; color:var(--text2); margin:16px 0 6px; }
        .nx-empty p{ font-size:13px; max-width:320px; line-height:1.6; }

        @keyframes libIn{ from{ opacity:0; transform:translateY(12px); } to{ opacity:1; transform:none; } }
        @media (prefers-reduced-motion: reduce){ .lib-card{ animation:none; } * { transition:none !important; } }
        @media(max-width:640px){
          .nx-search{ max-width:none; }
          .nx-title, .nx-kbd{ display:none; }
        }
      `}</style>

      <div className="nx-lib-stage" ref={stageRef} />
      <div className="nx-lib-grid-bg" />

      {/* ── header: back · logo · SEARCH · view · theme ── */}
      <header className="nx-lib-head">
        <button className="nx-ib" onClick={goUp} title="Back (Esc)"><ArrowLeft size={16} /></button>

        <div className="nx-logo"><Library size={18} color="var(--bg)" strokeWidth={2.5} /></div>
        <div className="nx-title">
          <b>Resource Library</b>
          <small>{totalFiles} files</small>
        </div>

        <div className="nx-search">
          <Search size={15} color="var(--text3)" style={{ flexShrink: 0 }} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search every file — try “waves” or “9701 kinetics”"
            spellCheck="false"
          />
          {query
            ? <button className="nx-ib" style={{ width: 24, height: 24, border: 'none', background: 'none' }}
                onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={14} /></button>
            : <span className="nx-kbd">/</span>}
        </div>

        <div className="nx-seg">
          <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} title="Grid"><LayoutGrid size={14} /></button>
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} title="List"><List size={14} /></button>
        </div>

        <button className="nx-ib" onClick={toggleTheme} title="Theme">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="nx-lib-main">
        {searching ? (
          /* ── SEARCH RESULTS — flat, path-aware, keyboard-driven ── */
          <>
            <div className="nx-crumbs">
              <span className="nx-crumb on">
                {results.length} result{results.length === 1 ? '' : 's'} for “{query.trim()}”
              </span>
              <span className="nx-count">
                <CornerDownLeft size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
                ↑↓ to move · Enter to open · Esc to clear
              </span>
            </div>

            {results.length === 0 ? (
              <div className="nx-empty">
                <Search size={44} strokeWidth={1.5} />
                <b>Nothing matches “{query.trim()}”</b>
                <p>Try fewer words, or a subject code — searching <b>9702 waves</b> looks in Physics only.</p>
              </div>
            ) : (
              <div className="lib-grid list">
                {results.map((f, i) => (
                  <FileCard key={f.path || i} item={f} i={i} trail={f._trail} active={i === sel} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── breadcrumbs ── */}
            <div className="nx-crumbs">
              <button className={`nx-crumb ${!subjectCode ? 'on' : ''}`} onClick={() => navigateTo(-1)}>
                All Subjects
              </button>
              {subjectCode && <ChevronRight size={15} color="var(--text3)" />}
              {subjectCode && (
                <button className={`nx-crumb ${currentPath.length === 0 ? 'on' : ''}`}
                  onClick={() => navigateTo(0)} style={currentPath.length === 0 ? { color: brand.hex } : undefined}>
                  {brand.name}
                </button>
              )}
              {currentPath.map((step, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={15} color="var(--text3)" />
                  <button className={`nx-crumb ${idx === currentPath.length - 1 ? 'on' : ''}`}
                    onClick={() => navigateTo(idx + 1)}>{step}</button>
                </React.Fragment>
              ))}
              <span className="nx-count">
                {currentItems.length} item{currentItems.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* ── recents (only at the top level, where they help most) ── */}
            {!subjectCode && recent.length > 0 && (
              <div className="nx-recent">
                <div className="nx-lbl"><Clock size={11} /> Jump back in</div>
                <div className="nx-chips">
                  {recent.map((r, i) => {
                    const k = KIND[r.kind] || KIND.file;
                    const { Icon } = k;
                    return (
                      <a key={i} className="nx-chip" style={{ '--c': k.color }}
                        href={libraryUrl(r.path)} target="_blank" rel="noopener noreferrer">
                        <Icon size={13} color={k.color} style={{ flexShrink: 0 }} />
                        <span>{r.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── grid ── */}
            {currentItems.length === 0 ? (
              <div className="nx-empty">
                <Folder size={44} strokeWidth={1.5} />
                <b>This folder is empty</b>
                <p>Nothing here yet. Press <b>/</b> to search the whole library instead.</p>
              </div>
            ) : (
              <div className={`lib-grid ${view === 'list' ? 'list' : ''}`}>
                {currentItems.map((item, i) =>
                  item.type === 'folder'
                    ? <FolderCard key={item.name + i} item={item} i={i} />
                    : <FileCard key={item.path || i} item={item} i={i} />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FullLibraryPage;
