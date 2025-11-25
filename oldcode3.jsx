import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  FolderOpen, FileText, CheckCircle, Search, BookOpen, ChevronDown, 
  AlertTriangle, ZoomIn, ZoomOut, RotateCcw, RotateCw, FileUp
} from 'lucide-react';

// Required CSS for the PDF viewer
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// --- Worker Setup ---
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// --- Configuration ---
const SUBJECTS = [
  { code: '9709', name: 'Mathematics' },
  { code: '9618', name: 'Computer Science' },
  { code: '9701', name: 'Chemistry' },
  { code: '9702', name: 'Physics' },
];

const YEARS = Array.from({ length: 15 }, (_, i) => (2024 - i).toString());
const SEASONS = [{ code: 'm', name: 'March' }, { code: 's', name: 'Summer' }, { code: 'w', name: 'Winter' }];
const PAPERS = ['1', '2', '3', '4', '5', '6'];
const VARIANTS = ['1', '2', '3'];

// Slimmer Select Component
const Select = ({ label, value, onChange, options, minWidth = 'w-20' }) => (
  <div className="flex flex-col group">
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

export default function App() {
  const [fileList, setFileList] = useState([]);
  const [folderName, setFolderName] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [bypassFilters, setBypassFilters] = useState(false);
  
  // Custom PDF State
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0); 
  const [pdfError, setPdfError] = useState(false);

  // Filters
  const [subject, setSubject] = useState(SUBJECTS[0].code);
  const [year, setYear] = useState('2023');
  const [season, setSeason] = useState('s');
  const [paper, setPaper] = useState('1');
  const [variant, setVariant] = useState('2');
  const [type, setType] = useState('qp');

  const targetSignature = useMemo(() => {
    const shortYear = year.slice(2);
    return { subject, seasonYear: `${season}${shortYear}`, type, code: `${paper}${variant}` };
  }, [subject, year, season, paper, variant, type]);

  // Folder Scan Effect
  useEffect(() => {
    if (bypassFilters) return; 
    if (!fileList.length) return;
    
    const match = fileList.find(file => {
      const name = file.name.toLowerCase();
      const isQP = name.includes('qp') || name.includes('question');
      const isMS = name.includes('ms') || name.includes('mark');
      if (targetSignature.type === 'qp' && !isQP) return false;
      if (targetSignature.type === 'ms' && !isMS) return false;
      return name.includes(targetSignature.subject) && 
             name.includes(targetSignature.seasonYear) && 
             name.includes(targetSignature.code);
    });
    
    if (match !== activeFile) {
        setActiveFile(match || null);
        setPdfError(false);
        setNumPages(null);
        setRotation(0);
    }
  }, [fileList, targetSignature, activeFile, bypassFilters]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  // Handler for "Select Folder"
  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    if (files.length) {
      setBypassFilters(false);
      setFileList(files);
      const pathParts = files[0].webkitRelativePath.split('/');
      setFolderName(pathParts[0] || "Local Folder");
    }
  };

  // Handler for "Open Single File"
  const handleSingleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setBypassFilters(true);
      setActiveFile(file);
      setPdfError(false);
      setNumPages(null);
      setRotation(0);
      setFolderName(null); 
      setFileList([]); 
    }
  }

  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-200 font-sans">
      
      {/* Slim Header */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 shadow-xl z-20">
        <div className="flex flex-col lg:flex-row items-center px-3 py-2 gap-3 lg:h-14">
          <div className="flex items-center gap-2 pr-4 lg:border-r border-slate-800 mr-1 min-w-max">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
              <BookOpen className="text-white" size={16} />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">:) <span className="text-blue-500">By: Muhammad Huzaifa Imran</span></h1>
            </div>
          </div>

          {/* Filters */}
          <div className={`flex-1 flex flex-wrap items-center gap-x-3 gap-y-2 justify-center lg:justify-start w-full transition-opacity ${bypassFilters ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <Select label="Subject" value={subject} onChange={setSubject} options={SUBJECTS.map(s => ({ value: s.code, label: `${s.code} ${s.name}` }))} minWidth="w-40"/>
            <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
            <div className="flex gap-2">
              <Select label="Year" value={year} onChange={setYear} options={YEARS} minWidth="w-20" />
              <Select label="Season" value={season} onChange={setSeason} options={SEASONS.map(s => ({ value: s.code, label: s.name }))} minWidth="w-28" />
            </div>
            <div className="flex gap-2">
               <Select label="Paper" value={paper} onChange={setPaper} options={PAPERS} minWidth="w-14" />
               <Select label="Variant" value={variant} onChange={setVariant} options={VARIANTS} minWidth="w-14" />
            </div>
            <div className="flex flex-col ml-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Type</span>
              <div className="bg-slate-800 p-0.5 rounded-md border border-slate-700 flex shadow-sm">
                <button onClick={() => setType('qp')} className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold flex items-center gap-1 ${type === 'qp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>QP</button>
                <button onClick={() => setType('ms')} className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold flex items-center gap-1 ${type === 'ms' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>MS</button>
              </div>
            </div>
          </div>

          <div className="flex items-center ml-auto pl-4 lg:border-l border-slate-800 min-w-max gap-2">
            
            {/* Open Single File Button */}
            <label className="cursor-pointer group relative" title="Open a single PDF file">
              <input type="file" accept="application/pdf" onChange={handleSingleFileSelect} className="hidden" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 transition-all">
                <FileUp size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wide hidden sm:inline">Open File</span>
              </div>
            </label>

            {/* Select Folder Button */}
            <label className="cursor-pointer group relative">
              <input type="file" webkitdirectory="" directory="" multiple onChange={handleFolderSelect} className="hidden" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${folderName ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'}`}>
                <FolderOpen size={14} />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wide">{folderName ? 'Switch' : 'Select Folder'}</span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative bg-slate-950 flex flex-col items-center overflow-hidden">
        {!activeFile ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800 shadow-2xl rotate-3">
              <FolderOpen size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to View</h2>
            <p className="text-slate-400 max-w-sm text-sm">Select a Folder to browse automatically,<br/>or Open a File to view separately.</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col relative">
            
            {/* Scrollable PDF Viewer */}
            <div className="flex-1 overflow-auto flex justify-center p-8 bg-slate-900 custom-scrollbar">
               <div className="relative shadow-2xl shadow-black pb-20">
                 <Document
                    file={activeFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => {
                        console.error("PDF Load Error:", error);
                        setPdfError(true);
                    }}
                    loading={<div className="text-white animate-pulse mt-10">Loading Document...</div>}
                    className="flex flex-col gap-6"
                 >
                   {numPages && Array.from(new Array(numPages), (el, index) => (
                     <Page 
                        key={`page_${index + 1}`}
                        pageNumber={index + 1} 
                        scale={scale} 
                        rotate={rotation}
                        renderTextLayer={false} 
                        renderAnnotationLayer={false}
                        className="shadow-xl transition-transform duration-300" 
                        canvasBackground="#ffffff"
                        loading={
                          <div className="bg-white h-[800px] w-[600px] flex items-center justify-center text-slate-300">
                             Page {index + 1}...
                          </div>
                        }
                     />
                   ))}
                 </Document>
                 
                 {pdfError && (
                    <div className="flex flex-col items-center gap-4 p-10 bg-slate-800 rounded-lg border border-red-900/50">
                        <AlertTriangle className="text-red-500" size={32} />
                        <div className="text-red-200">Error rendering PDF</div>
                    </div>
                 )}
               </div>
            </div>

            {/* Vertical Left Toolbar */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/90 backdrop-blur text-white p-2 rounded-xl shadow-2xl border border-slate-700 flex flex-col items-center gap-3 z-30">
              
              {/* Zoom Controls */}
              <div className="flex flex-col items-center gap-1 bg-slate-900/50 rounded-lg p-1">
                <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors" title="Zoom In"><ZoomIn size={18}/></button>
                <span className="text-[10px] font-mono py-1">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors" title="Zoom Out"><ZoomOut size={18}/></button>
                <div className="h-px w-6 bg-slate-700 my-1"></div>
                <button onClick={() => setScale(1.0)} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors" title="Reset Zoom"><RotateCcw size={16}/></button>
              </div>

              {/* Rotation Control */}
              <div className="flex flex-col items-center gap-1 bg-slate-900/50 rounded-lg p-1">
                <button onClick={rotateClockwise} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-blue-300 hover:text-blue-100" title="Rotate 90°"><RotateCw size={18}/></button>
              </div>

            </div>

            {/* Bottom Info Pill */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-3 z-30">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                 <span className="text-[11px] font-mono text-slate-300 max-w-[200px] truncate">{activeFile.name}</span>
                 {bypassFilters && <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-bold">SINGLE FILE</span>}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
/*
```

---

### How to share this with others (The "Free" Way)

Since this app works by reading files from the **user's own computer**, you can easily publish the "Tool" part online. 
Your friends can visit your link, select *their* folder of past papers, and use your interface to browse them.

Here is the easiest way to make it a real website link:

#### Step 1: Build the App
In your VS Code terminal, stop the running server (`Ctrl + C`) and type:
```bash
npm run build*/