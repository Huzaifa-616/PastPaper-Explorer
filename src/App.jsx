import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, ChevronDown, ChevronUp, Mail, X, Copy, Check, Play, Github, Terminal, ArrowLeft, Layers, Sun, Moon 
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

const GITHUB_REPO_URL = "https://github.com/Huzaifa-616/PastPaper-Explorer";

// --- Components ---

const Select = ({ label, value, onChange, options, minWidth = 'w-24', isDark }) => (
  <div className="flex flex-col gap-1.5 flex-shrink-0">
    <label className={`text-[10px] font-bold uppercase tracking-widest pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-xl py-2 pl-3 pr-8 focus:outline-none backdrop-blur-md transition-all shadow-sm cursor-pointer ${minWidth} 
          ${isDark 
            ? 'bg-slate-900/60 border border-slate-700/50 hover:border-blue-500/50 focus:ring-2 focus:ring-blue-500/40 ' + (value === '' ? 'text-slate-500 text-xs' : 'text-slate-200 text-sm')
            : 'bg-slate-50/80 border border-slate-200 hover:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 ' + (value === '' ? 'text-slate-400 text-xs' : 'text-slate-800 font-medium text-sm')
          }
        `}
      >
        <option value="" disabled>Select...</option>
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lab = typeof opt === 'object' ? opt.label : opt;
          return <option key={`${val}-${idx}`} value={val} className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800 font-medium'}>{lab}</option>;
        })}
      </select>
      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${isDark ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-emerald-500'}`} size={14} />
    </div>
  </div>
);

const ContactModal = ({ isOpen, onClose, isDark }) => {
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200 ${isDark ? 'bg-black/60' : 'bg-slate-900/20'}`}>
      <div className={`rounded-3xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200 relative ${isDark ? 'bg-slate-900 border border-slate-800 shadow-2xl' : 'bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'}`}>
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isDark ? 'from-blue-500 to-indigo-500' : 'from-emerald-400 to-teal-500'}`}></div>
        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Mail size={18} className={isDark ? 'text-blue-400' : 'text-emerald-500'} /> Contact Me
          </h3>
          <button onClick={onClose} className={`transition-colors p-1 rounded-full ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/20' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-inner'}`}>
            <span className="text-2xl">👋</span>
          </div>
          <p className={`mb-6 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-500 font-medium'}`}>
            Have questions, feedback, or just want to say hi? Drop me an email!
          </p>
          <div className={`flex items-center gap-2 rounded-xl p-1.5 pl-4 mb-2 group transition-all ${isDark ? 'bg-slate-950/50 border border-slate-700/50 focus-within:border-blue-500/50' : 'bg-slate-50 border border-slate-200 focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10'}`}>
            <span className={`font-mono text-sm truncate flex-1 text-left ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{email}</span>
            <button 
              onClick={handleCopy}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                copied 
                  ? (isDark ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20') 
                  : (isDark ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 shadow-sm')
              }`}
              title="Copy Email"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div className={`text-xs h-4 mt-3 ${isDark ? 'text-slate-500 font-medium' : 'text-slate-400 font-semibold uppercase tracking-wider'}`}>
            {copied ? "Copied to clipboard!" : "Click to copy"}
          </div>
        </div>
      </div>
    </div>
  );
};

const StartupScreen = ({ onSelectExplorer, isDark, toggleTheme }) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden w-full ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-3 rounded-full transition-all duration-300 z-50 ${isDark ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/50' : 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-300 shadow-sm'}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Background Gradients */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-blue-600/10' : 'bg-emerald-400/20'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-indigo-600/10' : 'bg-violet-400/20'}`}></div>

      <div className="text-center z-10 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className={`text-5xl md:text-6xl font-black mb-6 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          The <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-blue-400 to-indigo-400' : 'from-emerald-500 to-teal-500'}`}>Nexus</span>
        </h1>
        <p className={`text-lg md:text-xl max-w-md mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Connect. Compile. Conquer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10 px-4">
        <button
          onClick={onSelectExplorer}
          className={`group relative flex flex-col items-center text-center p-10 rounded-3xl transition-all duration-500 hover:-translate-y-2 ${isDark ? 'bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)]' : 'bg-white/60 backdrop-blur-xl border border-slate-200 hover:border-emerald-300 hover:bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-500/10'}`}
        >
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border shadow-inner ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/20' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'}`}>
            <Layers size={44} className={isDark ? 'text-blue-400' : 'text-emerald-500'} />
          </div>
          <h2 className={`text-2xl font-bold mb-3 tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>PastPaper Explorer</h2>
          <p className={`text-sm leading-relaxed max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>
            Access, view, and organize A-Level past papers with a built-in fast PDF engine.
          </p>
        </button>

        <button
          onClick={() => window.open('https://programming-ide.netlify.app/', '_blank')}
          className={`group relative flex flex-col items-center text-center p-10 rounded-3xl transition-all duration-500 hover:-translate-y-2 ${isDark ? 'bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]' : 'bg-white/60 backdrop-blur-xl border border-slate-200 hover:border-violet-300 hover:bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-violet-500/10'}`}
        >
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border shadow-inner ${isDark ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-100'}`}>
            <Terminal size={44} className={isDark ? 'text-indigo-400' : 'text-violet-500'} />
          </div>
          <h2 className={`text-2xl font-bold mb-3 tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>Programming IDE</h2>
          <p className={`text-sm leading-relaxed max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>
            Write, compile, and run your code directly in the browser. Perfect for CS 9618.
          </p>
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  // Theme State (Persists in localStorage, defaults to Dark Mode)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('nexusTheme');
    return saved !== 'light'; 
  });

  useEffect(() => {
    localStorage.setItem('nexusTheme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const [showStartup, setShowStartup] = useState(true);
  const [showContact, setShowContact] = useState(false);
  
  const [isViewing, setIsViewing] = useState(false);
  const [showNav, setShowNav] = useState(true);

  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [season, setSeason] = useState('');
  const [paper, setPaper] = useState('');
  const [variant, setVariant] = useState('');
  const [type, setType] = useState('qp');

  const isSelectionComplete = subject && year && season && paper && variant;

  const activeFileUrl = useMemo(() => {
    if (!isSelectionComplete) return '';
    const shortYear = year.slice(2);
    const fileName = `${subject}_${season}${shortYear}_${type}_${paper}${variant}.pdf`;
    return `/papers/${fileName}`;
  }, [subject, year, season, paper, variant, type, isSelectionComplete]);

  const viewerSrc = useMemo(() => {
    return `/pdf-viewer/web/viewer.html?file=${encodeURIComponent(activeFileUrl)}`;
  }, [activeFileUrl]);

  useEffect(() => {
    document.title = "The Nexus | Study Tools";
  }, []);

  const handleLoadPaper = () => {
    if (!isSelectionComplete) return;
    setIsViewing(true);
    setShowNav(false); 
  };

  const handleGoHome = () => {
    setIsViewing(false);
    setShowNav(true);
  };

  if (showStartup) {
    return <StartupScreen onSelectExplorer={() => setShowStartup(false)} isDark={isDark} toggleTheme={toggleTheme} />;
  }

  return (
    <div className={`flex flex-col h-screen w-full font-sans overflow-hidden ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} isDark={isDark} />

      {/* EXPANDABLE NAV CONTAINER */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out z-30 flex-shrink-0 ${showNav ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden min-h-0">
          <header className={`border-b px-4 py-4 lg:py-3 w-full ${isDark ? 'bg-slate-900/95 backdrop-blur-xl border-slate-800/60 shadow-lg' : 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm'}`}>
            <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-end gap-4 xl:gap-6">
              
              {/* Logo & Navigation Area */}
              <div className="flex items-center justify-between w-full xl:w-auto xl:pb-1">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setShowStartup(true); handleGoHome(); }}
                    className={`p-2 rounded-xl transition-all ${isDark ? 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700/30 hover:shadow-md' : 'bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 hover:shadow-sm'}`}
                    title="Back to Nexus"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={handleGoHome}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/30 group-hover:shadow-blue-500/20' : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-105'}`}>
                      <Layers className="text-white" size={18} />
                    </div>
                    <div>
                      <h1 className={`font-bold text-sm tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>PastPaper Explorer</h1>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-semibold uppercase tracking-wider'}`}>By M. Huzaifa Imran</p>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Actions */}
                <div className="flex items-center gap-2 xl:hidden">
                  <button 
                      onClick={handleLoadPaper} 
                      disabled={!isSelectionComplete}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                        isSelectionComplete 
                          ? (isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/30 border border-transparent') 
                          : (isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200')
                      }`}
                  >
                      {isViewing ? 'Reload' : 'Load'}
                  </button>
                  {isViewing && (
                    <button onClick={() => setShowNav(false)} className={`p-2 rounded-xl transition-all active:scale-95 ${isDark ? 'bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm'}`} title="Hide Menu">
                      <ChevronUp size={16} />
                    </button>
                  )}
                  {/* Mobile Theme Toggle */}
                  <button onClick={toggleTheme} className={`p-2 rounded-xl transition-all active:scale-95 ${isDark ? 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-amber-400' : 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 shadow-sm'}`}>
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>
              </div>

              {/* Filters Area */}
              <div className="flex flex-wrap items-end gap-3 xl:gap-4 flex-1 overflow-x-auto pb-2 xl:pb-0 no-scrollbar">
                <Select label="Subject" value={subject} onChange={setSubject} options={SUBJECTS.map(s => ({ value: s.code, label: `${s.code} - ${s.name}` }))} minWidth="w-40 lg:w-48" isDark={isDark} />
                <Select label="Year" value={year} onChange={setYear} options={YEARS} minWidth="w-20 lg:w-24" isDark={isDark} />
                <Select label="Season" value={season} onChange={setSeason} options={SEASONS.map(s => ({ value: s.code, label: s.name }))} minWidth="w-28 lg:w-32" isDark={isDark} />
                <Select label="Paper" value={paper} onChange={setPaper} options={PAPERS} minWidth="w-16" isDark={isDark} />
                <Select label="Variant" value={variant} onChange={setVariant} options={VARIANTS} minWidth="w-16" isDark={isDark} />
                
                {/* Segmented Control for Type */}
                <div className="flex flex-col gap-1.5 ml-1">
                  <span className={`text-[10px] font-bold uppercase tracking-widest pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Doc Type</span>
                  <div className={`p-1 rounded-xl border flex shadow-inner ${isDark ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-md' : 'bg-slate-100 border-slate-200'}`}>
                    <button 
                      onClick={() => setType('qp')} 
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                        type === 'qp' 
                          ? (isDark ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200') 
                          : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-500 hover:text-slate-700')
                      }`}
                    >
                      QP
                    </button>
                    <button 
                      onClick={() => setType('ms')} 
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                        type === 'ms' 
                          ? (isDark ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200') 
                          : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-500 hover:text-slate-700')
                      }`}
                    >
                      MS
                    </button>
                  </div>
                </div>

                {/* Custom Action for CS 9618 */}
                {subject === '9618' && (paper === '2' || paper === '4') && (
                  <div className="flex flex-col gap-1.5 ml-2 animate-in fade-in zoom-in slide-in-from-left-2 duration-300">
                    <span className="text-[10px] font-bold uppercase tracking-widest pl-1 text-transparent">&nbsp;</span>
                    <button 
                      onClick={() => window.open('https://programming-ide.netlify.app/', '_blank')}
                      className={`h-[34px] px-4 rounded-xl text-xs font-bold shadow-sm border transition-all active:scale-95 flex items-center justify-center gap-2 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border-indigo-500/30 hover:border-indigo-400/60' : 'bg-violet-50 hover:bg-violet-100 text-violet-600 border-violet-200'}`}
                      title="Open Online Compiler"
                    >
                      <Terminal size={14} /> IDE
                    </button>
                  </div>
                )}
              </div>
              
              {/* Desktop Right Actions */}
              <div className="hidden xl:flex items-center gap-3 xl:pb-1">
                <button 
                    onClick={handleLoadPaper}
                    disabled={!isSelectionComplete} 
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
                      isSelectionComplete 
                        ? (isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/30 border-blue-400/20' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-sm shadow-emerald-500/30 border-transparent') 
                        : (isDark ? 'bg-slate-800 text-slate-500 border-slate-700/50 cursor-not-allowed' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none')
                    }`}
                >
                    <Play size={14} fill="currentColor" /> {isViewing ? 'Reload Paper' : 'Load Paper'}
                </button>
                
                {isViewing && (
                  <button 
                    onClick={() => setShowNav(false)} 
                    className={`p-2 rounded-xl border transition-all group ${isDark ? 'border-slate-700/50 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'}`}
                    title="Hide Menu"
                  >
                    <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}

                <div className={`w-px h-8 mx-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

                {/* Theme Toggle Navbar Desktop */}
                <button 
                    onClick={toggleTheme}
                    className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-slate-700/50 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-amber-400' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-indigo-500 shadow-sm'}`}
                    title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                
                <a 
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-slate-700/50 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'}`}
                    title="Source Code"
                >
                    <Github size={16} />
                </a>
                <button 
                    onClick={() => setShowContact(true)} 
                    className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-slate-700/50 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'}`}
                    title="Contact Me"
                >
                    <Mail size={16} />
                </button>
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* PULL TAB / TRIGGER BAR */}
      {isViewing && !showNav && (
        <button 
          className={`w-full h-8 flex-shrink-0 border-b flex items-center justify-center cursor-pointer group transition-colors z-20 shadow-sm ${isDark ? 'bg-slate-950 border-slate-800/80 hover:bg-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
          onMouseEnter={() => setShowNav(true)}
          onClick={() => setShowNav(true)}
          title="Show Navigation"
        >
          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-slate-600 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-emerald-500'}`}>
            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" /> 
            Show Menu 
            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          </div>
        </button>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 w-full h-full relative flex flex-col z-10 overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        
        {/* THE MAGIC OVERLAY */}
        {isViewing && showNav && (
          <div 
            className={`absolute inset-0 z-50 backdrop-blur-[1px] cursor-pointer animate-in fade-in duration-200 ${isDark ? 'bg-black/5' : 'bg-slate-900/5'}`}
            onMouseEnter={() => setShowNav(false)} 
            onClick={() => setShowNav(false)}      
            title="Click to hide menu"
          />
        )}

        {/* Background Gradients (Only visible when empty) */}
        {!isViewing && (
          <>
            <div className={`absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-blue-600/5' : 'bg-emerald-400/10'}`}></div>
            <div className={`absolute bottom-[20%] right-[20%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-indigo-600/5' : 'bg-teal-400/10'}`}></div>
          </>
        )}

        {!isViewing && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in-95 duration-500 z-10 w-full max-w-2xl mx-auto bg-transparent">
             <div className="relative mb-10">
               <div className={`absolute inset-0 blur-2xl opacity-20 rounded-full animate-pulse bg-gradient-to-tr ${isDark ? 'from-blue-500 to-indigo-500' : 'from-emerald-400 to-teal-400'}`}></div>
               <div className={`w-28 h-28 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border relative z-10 ${isDark ? 'bg-slate-900/80 border-slate-700/50 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-xl'}`}>
                  <BookOpen size={56} className={`text-transparent bg-clip-text bg-gradient-to-br drop-shadow-sm ${isDark ? 'from-blue-400 to-indigo-400' : 'from-emerald-500 to-teal-500'}`} strokeWidth={1.5} />
               </div>
             </div>
             
             <h2 className={`text-3xl md:text-4xl font-extrabold mb-5 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to study?</h2>
             <p className={`text-lg md:text-xl leading-relaxed mb-10 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Configure your paper settings in the navigation bar above, then hit <span className={`px-2 py-0.5 rounded-md border font-bold ${isDark ? 'text-white bg-slate-800/80 border-slate-700' : 'text-slate-800 bg-white border-slate-200 shadow-sm'}`}>Load Paper</span> to open the document viewer.
             </p>
             
             <div className="flex flex-wrap justify-center gap-4 text-sm font-bold">
                <span className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-500 backdrop-blur-sm' : 'bg-white border-slate-200 text-slate-500 shadow-sm'}`}>
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-emerald-500'}`}></span> Fast PDF Engine
                </span>
                <span className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-500 backdrop-blur-sm' : 'bg-white border-slate-200 text-slate-500 shadow-sm'}`}>
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-teal-500'}`}></span> Full Screen Viewer
                </span>
             </div>
          </div>
        )}

        {isViewing && (
          <div className="w-full h-full relative z-10 animate-in fade-in duration-300">
             <iframe 
                src={viewerSrc}
                className="w-full h-full border-none bg-white"
                title="PDF Viewer"
                allowFullScreen
             />
          </div>
        )}
      </main>
    </div>
  );
}
