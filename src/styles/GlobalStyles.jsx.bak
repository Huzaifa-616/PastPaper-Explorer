import React from 'react';

import { THEMES } from '../config/themes';

const rgba = (hex, a) => {
  const h = hex.replace('#','');
  const n = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
};

const GlobalStyles = ({ dark, theme, fontScale = 1 }) => {
  const t = theme || (dark ? THEMES.midnight : THEMES.daylight);
  return (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap');
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; }
    
    :root {
      /* Base Colors */
      --bg:        ${t.bg};
      --bg2:       ${t.bg2};
      --surface:   ${t.surface};
      --surface2:  ${t.surface2};
      --surface3:  ${t.surface3};
      
      /* Borders & Lines */
      --line:      ${t.line};
      --line2:     ${t.line2};
      
      /* Typography */
      --text:      ${t.text};
      --text2:     ${t.text2};
      --text3:     ${t.text3};
      
      /* Vibrant Accents */
      --accent:    ${t.accent};
      --teal:      ${t.teal};
      --amber:     ${t.amber};
      --rose:      ${t.rose};
      --green:     ${t.green};
      --red:       ${t.red};
    }

    /* UI scale (Settings → Font size). zoom scales px-based layouts cleanly. */
    #root { zoom: ${fontScale}; }

    html, body, #root { height: 100%; background: var(--bg); }
    body { font-family: 'Outfit', sans-serif; color: var(--text); -webkit-font-smoothing: antialiased; }
    
    ::selection { background: ${rgba(t.accent, 0.3)}; color: var(--text); }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 10px; }

    /* Animations */
    @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes slideInLeft  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
    @keyframes slideInRight { from{transform:translateX(100%)}  to{transform:translateX(0)} }
    @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

    .anim-0 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .anim-1 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
    .anim-2 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
    .anim-3 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
    .anim-fade { animation: fadeIn 0.4s ease both; }

    .bg-grid {
      position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background-image: 
        linear-gradient(to right, var(--line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--line) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: radial-gradient(circle at center, black, transparent 80%);
      -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
    }

    .glass-panel {
      background: var(--surface);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--line2);
    }

    .icon-btn { display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;border:1px solid var(--line2);background:var(--surface2);color:var(--text2);cursor:pointer;transition:all 0.2s; }
    .icon-btn:hover { color:var(--text);background:var(--surface3); transform: translateY(-1px); }

    .shimmer-text { 
      background: linear-gradient(to right, var(--text) 20%, var(--text2) 40%, var(--text2) 60%, var(--text) 80%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 6s linear infinite;
    }

    .nexus-select { appearance:none;background:var(--surface2);border:1px solid var(--line2);border-radius:8px;color:var(--text);font-family:'Outfit',sans-serif;font-size:12px;font-weight:500;padding:8px 30px 8px 12px;cursor:pointer;transition:all 0.2s;outline:none; }
    .nexus-select:hover { border-color:var(--text3); }
    .nexus-select:focus { border-color:var(--accent); box-shadow:0 0 0 3px ${rgba(t.accent, 0.18)}; }
    .nexus-select option { background:var(--bg2);color:var(--text); }

    .seg-btn { padding:6px 16px;border-radius:6px;font-size:11px;font-family:'Outfit',sans-serif;font-weight:600;cursor:pointer;transition:all 0.2s;border:none;background:none; }
    .seg-btn.a-accent { background:var(--text);color:var(--bg); }
    .seg-btn.inactive { color:var(--text2); }
    .seg-btn.inactive:hover { color:var(--text); }

    .btn-load { display:inline-flex;align-items:center;gap:8px;padding:9px 24px;border-radius:10px;font-size:13px;font-weight:600;font-family:'Outfit',sans-serif;border:none;cursor:pointer;transition:all 0.2s; }
    .btn-load.ready { background:var(--text);color:var(--bg);box-shadow:0 4px 14px rgba(0,0,0,0.2); }
    .btn-load.ready:hover { transform:translateY(-2px); box-shadow:0 6px 20px ${t.glow}; }
    .btn-load.ready:active { transform:translateY(0); }
    .btn-load.disabled { background:var(--surface2);color:var(--text3);cursor:not-allowed; }

    .modal-overlay { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);animation:fadeIn 0.2s ease both;padding:16px; }
    .modal-box { background:var(--bg2);border:1px solid var(--line2);border-radius:24px;width:100%;max-width:420px;position:relative;overflow:hidden;animation:fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

    .mcq-bubble { width:32px;height:32px;border-radius:50%;border:1.5px solid var(--line2);background:transparent;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center; }
    .mcq-bubble:hover { border-color:var(--text2);color:var(--text); }
    .mcq-bubble.sel-mine { background:var(--text);border-color:var(--text);color:var(--bg); }
    .mcq-bubble.sel-key  { background:var(--amber);border-color:var(--amber);color:#fff; }
    .mcq-bubble.correct  { background:var(--green);border-color:var(--green);color:#fff; }
    .mcq-bubble.wrong    { background:var(--red);border-color:var(--red);color:#fff; }

    .custom-sb::-webkit-scrollbar { width: 4px; }
    .custom-sb::-webkit-scrollbar-track { background: transparent; }
    .custom-sb::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 4px; }
    .custom-sb:hover::-webkit-scrollbar-thumb { background: var(--text3); }
    
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; width: 100%; max-width: 1100px; }
    .featured-card { grid-column: 1 / -1; }
    
    .pull-tab-pill {
      position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; justify-content: center;
      width: 48px; height: 28px; border-radius: 14px;
      background: var(--surface2); border: 1px solid var(--line2);
      cursor: pointer; transition: all 0.2s; z-index: 40;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .pull-tab-pill:hover { background: var(--surface3); transform: translateX(-50%) translateY(2px); }

    /* SIDEBAR CLASSES */
    .library-sidebar, .topicals-sidebar { position: relative; width: 340px; flex-shrink: 0; background: var(--bg2); border-right: 1px solid var(--line2); display: flex; flex-direction: column; z-index: 10; animation: slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    .mcq-sidebar { position: relative; width: 340px; flex-shrink: 0; background: var(--bg2); border-left: 1px solid var(--line2); display: flex; flex-direction: column; animation: slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) both; }

    /* FULL PAGE LIBRARY & TOPICALS CLASSES */
    .full-lib-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; width: 100%; align-content: start; }
    .topicals-content { flex: 1; display: flex; overflow: hidden; position: relative; }
    .topicals-papers { width: 210px; flex-shrink: 0; border-right: 1px solid var(--line2); padding: 16px 10px; display: flex; flex-direction: column; gap: 6px; background: var(--bg2); overflow-y: auto; }
    .topicals-grid { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .topicals-grid-inner { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
    .topicals-questions { width: 320px; flex-shrink: 0; border-left: 1px solid var(--line2); display: flex; flex-direction: column; background: var(--bg2); animation: slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) both; }
    
    /* ── Nav bar base ── */
    .nav-bar {
      background: ${t.navBg};
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    }

    /* 📱 RESPONSIVE FIXES (Narrow Desktop, Tablets, Touch Devices) */
    .mobile-only { display: none !important; }
    
    @media (max-width: 1024px), (pointer: coarse) {
      .mobile-only { display: flex !important; }
      .desktop-only { display: none !important; }
      /* ── RESTORED: Nav 2-row layout & Grid ── */
      header.nav-bar { padding: 12px 16px !important; }

      .nav-inner { flex-wrap: wrap !important; gap: 10px 0 !important; align-items: center !important; }
      .nav-divider { display: none !important; }
      .nav-brand { flex: 1 !important; min-width: 0 !important; margin-right: 0 !important; }
      .nav-workspace-label { display: none !important; }

      .nav-actions { margin-left: 0 !important; flex-shrink: 0 !important; gap: 8px !important; }
      .nav-actions .btn-load { padding: 8px 14px !important; font-size: 11px !important; }
      .nav-actions .icon-btn { width: 32px !important; height: 32px !important; }

      .nav-filters {
        order: 9 !important; width: 100% !important; flex: none !important; overflow: visible !important;
        display: grid !important; 
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)) !important; 
        gap: 8px !important;
        padding: 0 !important; align-items: end !important;
      }
      .nav-filters > div { width: 100% !important; min-width: 0 !important; flex: none !important; }
      .nav-filters .nexus-select { width: 100% !important; font-size: 10px !important; padding: 7px 22px 7px 8px !important; }
      .nav-filters > div > span { font-size: 8px !important; }

      .nav-type-wrap .seg-btn { padding: 5px 9px !important; font-size: 10px !important; }

      .nav-tools-wrap { grid-column: 1 / -1 !important; }
      .nav-tools-wrap > div { flex-wrap: wrap !important; gap: 6px !important; }
      .nav-tools-wrap button { padding: 7px 12px !important; font-size: 11px !important; }
      /* ───────────────────────────────────────── */

      /* Bottom Sheet MCQ Solver (Fixes overlap & animation wobble) */
      .mcq-sidebar { 
        position: absolute !important; 
        bottom: 0; left: 0; right: 0; top: auto; 
        width: 100% !important; 
        height: var(--sheet-height, 50vh) !important; 
        border-left: none !important; 
        border-top: 1px solid var(--line2); 
        box-shadow: 0 -10px 40px rgba(0,0,0,0.8); 
        z-index: 50; 
        border-radius: 20px 20px 0 0; 
        /* FIX: Locks the entrance animation so it doesn't jump to the right when dragged */
        animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both !important; 
      }
      
      /* FIX: Only handles height transition, no animation re-triggering */
      .mcq-sidebar.snap-anim {
        transition: height 0.3s cubic-bezier(0.16,1,0.3,1) !important;
      }

      .drag-handle {
        width: 100%; height: 24px; align-items: center; justify-content: center; 
        cursor: grab; flex-shrink: 0; padding-top: 8px; touch-action: none;
      }
      .drag-bar {
        width: 40px; height: 5px; border-radius: 4px; background: var(--text3); opacity: 0.5;
      }
      .drag-handle:active .drag-bar { opacity: 0.8; }

      /* Mobile Topicals Expanded View */
      .topicals-content { flex-direction: column !important; display: flex !important; overflow-y: auto !important; }
      
      .topicals-papers { 
        width: 100% !important; height: auto !important; display: grid !important; 
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important; gap: 10px !important;
        border-right: none !important; border-bottom: 1px solid var(--line2) !important; 
        padding: 16px !important; overflow: visible !important; 
      }
      .topicals-papers > p { grid-column: 1 / -1; margin-bottom: 2px !important; padding-left: 2px !important; }
      .topicals-papers > button { flex: unset !important; width: 100% !important; height: 100% !important; padding: 12px !important; scroll-snap-align: none; }
      
      .topicals-grid { width: 100%; overflow: visible; }
      .topicals-grid-inner { grid-template-columns: 1fr; padding: 16px !important; }
      
      .topicals-questions { width: 100%; height: 100%; border-left: none; position: absolute; top: 0; left: 0; z-index: 10; }
      
      .mobile-hidden { display: none !important; }
      
      /* Full Page Mobile Headers */
      .full-lib-header { padding: 12px 16px !important; flex-wrap: wrap; }
      .full-lib-main { padding: 16px !important; }
      .full-lib-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
    }
  `}</style>
);
};

export default GlobalStyles;
