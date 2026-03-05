import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, ChevronDown, Mail, X, Copy, Check, Play, Github, FileText, Terminal, RefreshCw, AlertCircle, ExternalLink, Cpu, Download 
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

const REPO_OWNER = "Huzaifa-616";
const REPO_NAME = "PastPaper-Explorer";
const GITHUB_REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const IDE_URL = "https://programming-ide.netlify.app/";

// --- Components ---

const Select = ({ label, value, onChange, options, minWidth = 'w-20', accentColor = 'blue', disabled = false }) => {
  const colorMap = {
    blue: 'text-blue-400 focus:ring-blue-500/50',
    orange: 'text-orange-400 focus:ring-orange-500/50 border-orange-500/30',
  };

  return (
    <div className={`flex flex-col group flex-shrink-0 ${disabled ? 'opacity-50' : ''}`}>
      <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider group-hover:text-slate-400 transition-colors">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`appearance-none bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded-md py-1.5 pl-2 pr-7 focus:outline-none focus:ring-2 transition-all shadow-sm ${minWidth} ${colorMap[accentColor] || colorMap.blue}`}
        >
          <option value="">Select...</option>
          {options.map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lab = typeof opt === 'object' ? opt.label : opt;
            return <option key={`${String(val)}-${idx}`} value={String(val)} className="bg-slate-900">{String(lab)}</option>;
          })}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
      </div>
    </div>
  );
};

const ContactModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = "huzaifa.bravo@gmail.com";
  useEffect(() => { if (copied) { const timer = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(timer); } }, [copied]);
  if (!isOpen) return null;
  const handleCopy = () => { navigator.clipboard.writeText(email); setCopied(true); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Mail size={18} className="text-blue-500" /> Contact Me</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👋</div>
          <p className="text-slate-300 mb-6 text-sm">Have questions or feedback? Drop me an email!</p>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 pl-4 mb-2 group focus-within:border-blue-500/50 transition-colors">
            <span className="text-slate-200 font-mono text-sm truncate flex-1 text-left">{email}</span>
            <button onClick={handleCopy} className={`p-2.5 rounded-lg transition-all duration-200 ${copied ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div className="text-xs text-slate-500 h-4">{copied ? "Copied to clipboard!" : "Click to copy"}</div>
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
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [season, setSeason] = useState('');
  const [paper, setPaper] = useState('');
  const [variant, setVariant] = useState('');
  const [type, setType] = useState('qp');

  // Source File Discovery State
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedSf, setSelectedSf] = useState('');
  const [sfContent, setSfContent] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [sfLoading, setSfLoading] = useState(false);
  const [sfCopied, setSfCopied] = useState(false);
  const [discoveryError, setDiscoveryError] = useState('');

  const isSelectionComplete = subject && year && season && paper && variant;

  // folderName follows strictly: 9618_w25_sf_42
  const folderName = useMemo(() => {
    if (!isSelectionComplete) return '';
    const shortYear = year.slice(2);
    return `${subject}_${season}${shortYear}_sf_${paper}${variant}`;
  }, [subject, year, season, paper, variant, isSelectionComplete]);

  // FEATURE: Dynamic GitHub Discovery
  // This "looks inside" the GitHub folder to see what files are actually there.
  useEffect(() => {
    if (type === 'sf' && folderName) {
      async function discoverFiles() {
        setIsDiscovering(true);
        setAvailableFiles([]);
        setSelectedSf('');
        setDiscoveryError('');

        try {
          // Navigating your GitHub repository structure
          const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/papers/${folderName}`;
          const response = await fetch(apiUrl);
          
          if (!response.ok) throw new Error(`Folder "${folderName}" not found on GitHub.`);
          
          const data = await response.json();
          // Filter out only files (txt, csv, etc) and map their names
          const files = data
            .filter(item => item.type === 'file')
            .map(item => item.name);
          
          setAvailableFiles(files);
          if (files.length > 0) setSelectedSf(files[0]);
        } catch (err) {
          setDiscoveryError(err.message);
        } finally {
          setIsDiscovering(false);
        }
      }
      discoverFiles();
    }
  }, [folderName, type]);

  const activeFileUrl = useMemo(() => {
    if (!isSelectionComplete) return '';
    const shortYear = year.slice(2);
    if (type === 'sf') {
      return selectedSf ? `/papers/${folderName}/${selectedSf}` : '';
    }
    return `/papers/${subject}_${season}${shortYear}_${type}_${paper}${variant}.pdf`;
  }, [folderName, type, selectedSf, subject, season, year, paper, variant, isSelectionComplete]);

  const viewerSrc = useMemo(() => {
    if (!activeFileUrl) return '';
    return `/pdf-viewer/web/viewer.html?file=${encodeURIComponent(activeFileUrl)}`;
  }, [activeFileUrl]);

  // Fetch file content
  useEffect(() => {
    if (isViewing && type === 'sf' && selectedSf && activeFileUrl) {
      setSfLoading(true);
      setSfContent('');
      fetch(activeFileUrl)
        .then(async res => {
          const contentType = res.headers.get('content-type');
          if (!res.ok || (contentType && contentType.includes('text/html'))) {
             throw new Error("File could not be found at the predicted URL.");
          }
          return res.text();
        })
        .then(text => { setSfContent(String(text)); setSfLoading(false); })
        .catch((err) => { 
          setSfContent(`// Error: ${err.message}\n// Path: ${activeFileUrl}\n// Ensure your files are uploaded to the folder "${folderName}" on GitHub.`); 
          setSfLoading(false); 
        });
    }
  }, [activeFileUrl, isViewing, type, selectedSf, folderName]);

  const handleLoadPaper = () => { if (isSelectionComplete) setIsViewing(true); };

  const handleDownload = () => {
    if (!sfContent) return;
    const blob = new Blob([sfContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = String(selectedSf);
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => { document.title = "PastPaper Explorer"; }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-200 font-sans overflow-hidden">
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />

      {/* Header Toolbar */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 shadow-xl z-20 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center px-3 py-3 gap-3 lg:h-14">
          
          {/* Logo Section - BRANDING PRESERVED */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-2 pr-4 lg:border-r border-slate-800 mr-1">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsViewing(false)}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                <BookOpen className="text-white" size={16} />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm lg:text-base leading-tight whitespace-nowrap">
                  <span className="hidden sm:inline">By: </span>Muhammad Huzaifa Imran
                </h1>
              </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
               <button onClick={handleLoadPaper} disabled={!isSelectionComplete} className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${isSelectionComplete ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                  {isViewing ? 'Reload' : 'Load'}
               </button>
               <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700 text-slate-400"><Github size={12} /></a>
               <button onClick={() => setShowContact(true)} className="p-1.5 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700"><Mail size={12} className="text-slate-400" /></button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <Select label="Subject" value={subject} onChange={setSubject} options={SUBJECTS.map(s => ({ value: s.code, label: `${s.code} ${s.name}` }))} minWidth="w-36 lg:w-44"/>
            <div className="w-px h-6 bg-slate-800 hidden lg:block"></div>
            <Select label="Year" value={year} onChange={setYear} options={YEARS} minWidth="w-20 lg:w-24" />
            <Select label="Season" value={season} onChange={setSeason} options={SEASONS.map(s => ({ value: s.code, label: s.name }))} minWidth="w-24 lg:w-28" />
            <Select label="Paper" value={paper} onChange={setPaper} options={PAPERS} minWidth="w-16 lg:w-20" />
            <Select label="Variant" value={variant} onChange={setVariant} options={VARIANTS} minWidth="w-16 lg:w-20" />
            
            <div className="flex flex-col ml-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Type</span>
              <div className="bg-slate-800 p-0.5 rounded-md border border-slate-700 flex shadow-sm">
                <button onClick={() => setType('qp')} className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${type === 'qp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>QP</button>
                <button onClick={() => setType('ms')} className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${type === 'ms' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>MS</button>
                {subject === '9618' && paper === '4' && (
                   <button onClick={() => setType('sf')} className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border-l border-slate-700 ml-0.5 ${type === 'sf' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}>SF</button>
                )}
              </div>
            </div>

            {/* GitHub Dynamic Resource Picker */}
            {type === 'sf' && (
              <div className="flex items-end gap-2 animate-in slide-in-from-left-2">
                <Select label="Discovered Files" value={selectedSf} onChange={setSelectedSf} options={availableFiles} minWidth="w-40 lg:w-56" accentColor="orange" disabled={isDiscovering}/>
                {isDiscovering && <RefreshCw size={12} className="animate-spin text-orange-500 mb-2" />}
              </div>
            )}
          </div>
          
          <div className="hidden lg:flex items-center ml-auto pl-4 lg:border-l border-slate-800 gap-3">
             <button onClick={handleLoadPaper} disabled={!isSelectionComplete} className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all active:scale-95 ${isSelectionComplete ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}><Play size={10} fill="currentColor" /> Load Paper</button>
             <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors" title="GitHub Repository"><Github size={14} /></a>
             <button onClick={() => setShowContact(true)} className="p-1.5 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400"><Mail size={14} /></button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
        
        {!isViewing && (
          <div className="w-full max-w-5xl px-6 py-12 flex flex-col items-center animate-in fade-in duration-500">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">Student Success Hub</h2>
            <p className="text-slate-400 text-lg mb-12 max-w-2xl text-center">Access full past papers and dynamically discovered source resources directly from GitHub.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="group bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/50 transition-all shadow-2xl">
                <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform"><BookOpen size={28} /></div>
                <h3 className="text-2xl font-bold text-white mb-3">PastPaper Explorer</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">PDF Past Papers and dynamic Source Files (SF). Use the toolbar to select and launch.</p>
                <button onClick={handleLoadPaper} disabled={!isSelectionComplete} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50">Launch Explorer</button>
              </div>
              <div className="group bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-indigo-500/50 transition-all shadow-2xl">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform"><Cpu size={28} /></div>
                <h3 className="text-2xl font-bold text-white mb-3">Programming IDE</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">Practice your coding directly in your browser with our integrated compiler tool.</p>
                <a href={IDE_URL} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg text-center">Open IDE <ExternalLink size={14} className="inline ml-1 mb-1"/></a>
              </div>
            </div>
            {discoveryError && <div className="mt-8 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs font-bold animate-pulse"><AlertCircle size={14} className="inline mr-2" /> {discoveryError}</div>}
          </div>
        )}

        {/* Viewing State */}
        {isViewing && (
          <div className="w-full h-full">
            {type === 'sf' ? (
              <div className="w-full h-full flex flex-col p-4 sm:p-8 bg-slate-950 overflow-auto">
                <div className="max-w-5xl w-full mx-auto flex flex-col h-full">
                  
                  {/* SF Resource Header */}
                  <div className="flex items-center justify-between mb-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-orange-500/10 rounded-lg"><FileText size={20} className="text-orange-500" /></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-100">{String(selectedSf || "Fetching list...")}</span>
                        <span className="text-[10px] font-mono text-slate-500 tracking-wider">GitHub Path: /papers/{folderName}/</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleDownload} disabled={!sfContent} className="text-[10px] font-bold px-4 py-2 rounded bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2 border border-slate-700 transition-all"><Download size={14} /> DOWNLOAD .TXT</button>
                      <button onClick={() => { navigator.clipboard.writeText(sfContent); setSfCopied(true); setTimeout(() => setSfCopied(false), 2000); }} className={`text-[10px] font-bold px-4 py-2 rounded border border-slate-700 transition-all ${sfCopied ? 'bg-green-600 text-white border-green-500' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                        {sfCopied ? <Check size={14} className="inline mr-1" /> : <Copy size={14} className="inline mr-1" />} {sfCopied ? 'COPIED' : 'COPY TEXT'}
                      </button>
                    </div>
                  </div>

                  {/* SF Content Viewer */}
                  <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
                    {sfLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                        <RefreshCw size={24} className="animate-spin text-orange-500 mb-2" />
                        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Reading GitHub Directory...</span>
                      </div>
                    ) : (
                      <pre className="flex-1 p-8 text-emerald-400 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                        {String(sfContent) || "// Select a resource file from the dropdown menu to view its content."}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <iframe src={viewerSrc} className="w-full h-full border-none" title="PDF Viewer" allowFullScreen />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
