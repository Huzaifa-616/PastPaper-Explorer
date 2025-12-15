import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, ChevronDown, Mail, X, Copy, Check, Play, AlertTriangle 
} from 'lucide-react';

// --- Configuration ---
const SUBJECTS = [
  { code: '9709', name: 'Mathematics' },
  { code: '9618', name: 'Computer Science' },
  { code: '9701', name: 'Chemistry' },
  { code: '9702', name: 'Physics' },
  { code: '9700', name: 'Biology' },
  { code: '9231', name: 'Further Mathematics' },
];

const YEARS = Array.from({ length: 15 }, (_, i) => (2025 - i).toString());
const SEASONS = [{ code: 'm', name: 'March' }, { code: 's', name: 'Summer' }, { code: 'w', name: 'Winter' }];
const PAPERS = ['1', '2', '3', '4', '5', '6'];
const VARIANTS = ['1', '2', '3'];

// --- Components ---

const Select = ({ label, value, onChange, options, minWidth = 'w-20' }) => (
  <div className="flex flex-col group flex-shrink-0">
    <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider group-hover:text-blue-400 transition-colors">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-md py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm ${minWidth}`}
      >
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lab = typeof opt === 'object' ? opt.label : opt;
          return <option key={`${val}-${idx}`} value={val}>{lab}</option>;
        })}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
    </div>
  </div>
);

const ContactModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = "huzaifa.bravo@gmail.com";

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail size={18} className="text-blue-500" /> Contact Me
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-slate-300 mb-6 text-sm">
            Have questions, feedback, or just want to say hi? Drop me an email!
          </p>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 pl-4 mb-2 group focus-within:border-blue-500/50 transition-colors">
            <span className="text-slate-200 font-mono text-sm truncate flex-1 text-left">{email}</span>
            <button 
              onClick={handleCopy}
              className={`p-2.5 rounded-lg transition-all duration-200 ${copied ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="Copy Email"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div className="text-xs text-slate-500 h-4">
            {copied ? "Copied to clipboard!" : "Click to copy"}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [showContact, setShowContact] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  // Filters
  const [subject, setSubject] = useState(SUBJECTS[0].code);
  const [year, setYear] = useState('2023');
  const [season, setSeason] = useState('s');
  const [paper, setPaper] = useState('1');
  const [variant, setVariant] = useState('2');
  const [type, setType] = useState('qp');

  // --- URL CONSTRUCTION ---
  const activeFileUrl = useMemo(() => {
    const shortYear = year.slice(2);
    const fileName = `${subject}_${season}${shortYear}_${type}_${paper}${variant}.pdf`;
    return `/papers/${fileName}`;
  }, [subject, year, season, paper, variant, type]);

  // --- VIEWER PATH ---
  // Points to the local folder in 'public'
  const viewerSrc = useMemo(() => {
    return `/pdf-viewer/web/viewer.html?file=${encodeURIComponent(activeFileUrl)}`;
  }, [activeFileUrl]);

  useEffect(() => {
    document.title = "PastPaper Explorer";
  }, []);

  const handleLoadPaper = () => {
    setIsViewing(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-200 font-sans">
      
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />

      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 shadow-xl z-20 relative">
        {/* CHANGED: px-6 py-4 gap-6 lg:h-20 (Bigger dimensions) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center px-6 py-4 gap-6 lg:h-20">
          
          {/* Logo Section */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-4 pr-6 lg:border-r border-slate-800 mr-2">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsViewing(false)}>
              {/* CHANGED: w-10 h-10 (Bigger Logo) */}
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                {/* CHANGED: text-lg (Bigger Text) */}
                <h1 className="font-bold text-white text-lg leading-tight whitespace-nowrap">:) <span className="text-blue-500">By: Muhammad Huzaifa Imran</span></h1>
              </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-3 lg:hidden">
               <button onClick={handleLoadPaper} className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${isViewing ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'}`}>
                  {isViewing ? 'Reload' : 'Load'}
               </button>
               <button onClick={() => setShowContact(true)} className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700">
                  <Mail size={16} className="text-slate-400" />
               </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 w-full overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {/* I slightly increased the minWidths here too for better spacing */}
            <Select label="Subject" value={subject} onChange={setSubject} options={SUBJECTS.map(s => ({ value: s.code, label: `${s.code} ${s.name}` }))} minWidth="w-36 lg:w-48"/>
            <div className="w-px h-8 bg-slate-800 hidden lg:block"></div>
            <Select label="Year" value={year} onChange={setYear} options={YEARS} minWidth="w-20 lg:w-24" />
            <Select label="Season" value={season} onChange={setSeason} options={SEASONS.map(s => ({ value: s.code, label: s.name }))} minWidth="w-28 lg:w-32" />
            <Select label="Paper" value={paper} onChange={setPaper} options={PAPERS} minWidth="w-14 lg:w-16" />
            <Select label="Variant" value={variant} onChange={setVariant} options={VARIANTS} minWidth="w-14 lg:w-16" />
            
            <div className="flex flex-col ml-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Type</span>
              {/* CHANGED: py-1 (Taller buttons) */}
              <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex shadow-sm">
                <button onClick={() => setType('qp')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${type === 'qp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>QP</button>
                <button onClick={() => setType('ms')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${type === 'ms' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>MS</button>
              </div>
            </div>

            {/* --- CUSTOM BUTTON FOR 9618 PAPER 2 AND 4 --- */}
            {subject === '9618' && (paper === '2' || paper === '4') && (
              <div className="flex flex-col ml-2 animate-in fade-in zoom-in duration-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Compiler</span>
                {/* CHANGED: h-[32px] (Bigger button) */}
                <button 
                  onClick={() => window.open('https://pseudocode-ide.netlify.app/', '_blank')}
                  className="h-[32px] px-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-900/20 border border-indigo-400/20 transition-all active:scale-95 flex items-center justify-center tracking-tighter"
                  title="Open Online Compiler"
                >
                  &lt;&gt;
                </button>
              </div>
            )}
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center ml-auto pl-6 lg:border-l border-slate-800 gap-4">
             {/* CHANGED: px-5 py-2 text-sm (Bigger Load Button) */}
             <button 
                onClick={handleLoadPaper} 
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
             >
                <Play size={12} fill="currentColor" /> Load
             </button>
             <button onClick={() => setShowContact(true)} className="p-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                <Mail size={18} />
             </button>
             
             {/* Info Indicator */}
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.6)]"></div>
                <span className="text-[10px] font-mono text-slate-400">PDF.JS ENGINE</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative bg-slate-950 flex flex-col items-center overflow-hidden">
        
        {/* === WELCOME SCREEN (Shown when no paper is loaded) === */}
        {!isViewing && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in-95 duration-300">
             <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-700 shadow-2xl shadow-blue-900/20">
                <BookOpen size={48} className="text-blue-500" />
             </div>
             <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">PastPaper Explorer</h1>
             <p className="text-slate-400 max-w-md text-lg leading-relaxed mb-8">
               Select your Subject, Year, and Paper code from the top bar, then click 
               <span className="text-blue-400 font-bold"> Load</span> to begin studying.
             </p>
             <div className="flex gap-4 text-xs font-mono text-slate-600">
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Annotations</span>
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Smooth Zoom</span>
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Offline Ready</span>
             </div>
          </div>
        )}

        {/* === CUSTOM PDF VIEWER IFRAME === */}
        {isViewing && (
          <div className="w-full h-full bg-slate-900">
             {/* This IFRAME loads the full-featured Google/Edge style viewer 
                 located in your public/pdf-viewer/web folder.
             */}
             <iframe 
                src={viewerSrc}
                className="w-full h-full border-none"
                title="PDF Viewer"
                allowFullScreen
             />
          </div>
        )}
      </main>
    </div>
  );
}