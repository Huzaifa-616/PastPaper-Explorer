import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderOpen, 
  FileText, 
  CheckCircle, 
  Search, 
  BookOpen, 
  ChevronDown,
  AlertTriangle
} from 'lucide-react';


// --- Configuration ---

const SUBJECTS = [
  { code: '9709', name: 'Mathematics' },
  { code: '9618', name: 'Computer Science' },
  { code: '9701', name: 'Chemistry' },
  { code: '9702', name: 'Physics' },
];

const YEARS = Array.from({ length: 15 }, (_, i) => (2024 - i).toString()); // 2024 back to 2010
const SEASONS = [
  { code: 'm', name: 'March (Feb/Mar)' },
  { code: 's', name: 'Summer (May/Jun)' },
  { code: 'w', name: 'Winter (Oct/Nov)' },
];
const PAPERS = ['1', '2', '3', '4', '5', '6'];
const VARIANTS = ['1', '2', '3'];

// --- UI Components ---

const Select = ({ label, value, onChange, options, minWidth = 'w-20' }) => (
  <div className="flex flex-col group">
    <label className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider group-hover:text-blue-400 transition-colors">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-sm rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm ${minWidth}`}
      >
        {options.map((opt, idx) => {
          // Handle both object format {value, label} and primitive strings
          const val = typeof opt === 'object' ? opt.value : opt;
          const lab = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={`${val}-${idx}`} value={val}>
              {lab}
            </option>
          );
        })}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
    </div>
  </div>
);

export default function App() {
  // --- State ---
  const [fileList, setFileList] = useState([]);
  const [folderName, setFolderName] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  // Filters
  const [subject, setSubject] = useState(SUBJECTS[0].code);
  const [year, setYear] = useState('2023');
  const [season, setSeason] = useState('s');
  const [paper, setPaper] = useState('1');
  const [variant, setVariant] = useState('2');
  const [type, setType] = useState('qp'); // 'qp' or 'ms'

  // --- Logic: File Matching ---
  
  // Create a signature to look for in filenames
  const targetSignature = useMemo(() => {
    const shortYear = year.slice(2); // 2023 -> 23
    return {
      subject,
      seasonYear: `${season}${shortYear}`, // s23
      type, // qp or ms
      code: `${paper}${variant}` // 12
    };
  }, [subject, year, season, paper, variant, type]);

  // Find the file in the loaded list
  const activeFile = useMemo(() => {
    if (!fileList.length) return null;

    return fileList.find(file => {
      const name = file.name.toLowerCase();
      
      // 1. Check Subject (e.g., 9709)
      if (!name.includes(targetSignature.subject)) return false;

      // 2. Check Season+Year (e.g., s23)
      if (!name.includes(targetSignature.seasonYear)) return false;
      
      // 3. Check Type (qp vs ms)
      const isQP = name.includes('qp') || name.includes('question');
      const isMS = name.includes('ms') || name.includes('mark');
      
      if (targetSignature.type === 'qp' && !isQP) return false;
      if (targetSignature.type === 'ms' && !isMS) return false;
      
      // 4. Check Paper Code (e.g., 12)
      if (!name.includes(targetSignature.code)) return false;

      return true;
    });
  }, [fileList, targetSignature]);

  // Update the PDF viewer when a new file is found
  useEffect(() => {
    if (activeFile) {
      const url = URL.createObjectURL(activeFile);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url); // Cleanup memory
    } else {
      setBlobUrl(null);
    }
  }, [activeFile]);

  // --- Handlers ---

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    if (files.length > 0) {
      setFileList(files);
      // Attempt to get folder name from the first file's path
      const pathParts = files[0].webkitRelativePath.split('/');
      setFolderName(pathParts[0] || "Local Folder");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- Top Navigation Bar --- */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 shadow-2xl z-20">
        <div className="flex flex-col lg:flex-row items-center px-4 py-3 gap-4 lg:h-20">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3 pr-6 lg:border-r border-slate-800 mr-2 min-w-max">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 ring-1 ring-white/10">
              <BookOpen className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-white text-lg leading-tight tracking-tight">Paper<span className="text-blue-500">Deck</span></h1>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Local Viewer</span>
            </div>
          </div>

          {/* Controls Container */}
          <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-2 justify-center lg:justify-start w-full">
            
            <Select 
              label="Subject" 
              value={subject} 
              onChange={setSubject} 
              options={SUBJECTS.map(s => ({ value: s.code, label: `${s.code} ${s.name}` }))}
              minWidth="w-48"
            />

            <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>

            <div className="flex gap-2">
              <Select label="Year" value={year} onChange={setYear} options={YEARS} minWidth="w-24" />
              <Select 
                label="Season" 
                value={season} 
                onChange={setSeason} 
                options={SEASONS.map(s => ({ value: s.code, label: s.name }))} 
                minWidth="w-32" 
              />
            </div>

            <div className="flex gap-2">
               <Select label="Paper" value={paper} onChange={setPaper} options={PAPERS} minWidth="w-16" />
               <Select label="Variant" value={variant} onChange={setVariant} options={VARIANTS} minWidth="w-16" />
            </div>

            {/* Type Toggle (QP/MS) */}
            <div className="flex flex-col ml-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Type</span>
              <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex shadow-sm">
                <button
                  onClick={() => setType('qp')}
                  className={`px-3 py-1 rounded-[4px] text-xs font-bold flex items-center gap-2 transition-all ${
                    type === 'qp' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <FileText size={14} /> QP
                </button>
                <button
                  onClick={() => setType('ms')}
                  className={`px-3 py-1 rounded-[4px] text-xs font-bold flex items-center gap-2 transition-all ${
                    type === 'ms' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle size={14} /> MS
                </button>
              </div>
            </div>

          </div>

          {/* Folder Upload Action */}
          <div className="flex items-center ml-auto pl-6 lg:border-l border-slate-800 min-w-max">
            <label className="cursor-pointer group relative">
              <input 
                type="file" 
                webkitdirectory="" 
                directory="" 
                multiple 
                onChange={handleFolderSelect} 
                className="hidden" 
              />
              <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-300 ${
                folderName 
                  ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500' 
                  : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
              }`}>
                <FolderOpen size={18} />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {folderName ? 'Switch Folder' : 'Select Folder'}
                  </span>
                  {folderName && <span className="text-[10px] text-slate-400 max-w-[100px] truncate opacity-75">{folderName}</span>}
                </div>
              </div>
            </label>
          </div>

        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 relative bg-slate-950 flex flex-col">
        {fileList.length === 0 ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3 hover:rotate-6 transition-transform duration-500">
              <FolderOpen size={48} className="text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Local Archive Mode</h2>
            <p className="text-slate-400 max-w-md leading-relaxed text-lg">
              Open the folder on your computer that contains your PDF papers. We'll automatically organize and display them here.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 text-xs font-mono text-slate-500">
              <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div> No Uploads
              </div>
              <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div> Instant Load
              </div>
            </div>
          </div>
        ) : !activeFile ? (
          // File Not Found State
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
              <AlertTriangle size={40} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Paper Not Found</h2>
            <p className="text-slate-500 max-w-lg mb-8">
              We couldn't find a file matching your selection in the loaded folder.
            </p>
            
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 max-w-lg w-full">
               <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">We searched for:</div>
               <div className="flex flex-wrap gap-2 justify-center font-mono text-sm">
                 <span className="bg-slate-800 text-blue-300 px-2 py-1 rounded">{targetSignature.subject}</span>
                 <span className="bg-slate-800 text-blue-300 px-2 py-1 rounded">{targetSignature.seasonYear}</span>
                 <span className="bg-slate-800 text-blue-300 px-2 py-1 rounded">{targetSignature.type}</span>
                 <span className="bg-slate-800 text-blue-300 px-2 py-1 rounded">{targetSignature.code}</span>
               </div>
               <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-600">
                 Ensure your files follow standard naming, e.g., <span className="text-slate-400">9709_s23_qp_12.pdf</span>
               </div>
            </div>
          </div>
        ) : (
          // PDF Viewer
          <div className="flex-1 w-full h-full flex flex-col relative bg-slate-800">
            <iframe
              src={blobUrl}
              className="w-full h-full border-none bg-slate-200"
              title="PDF Preview"
            />
            
            {/* Floating Status Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700/50 flex items-center gap-4 text-sm hover:scale-105 transition-transform duration-300 cursor-default">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="font-bold text-slate-200">Active</span>
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <span className="font-mono text-blue-300 tracking-tight">{activeFile.name}</span>
              <span className="text-slate-500 text-xs">{(activeFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}