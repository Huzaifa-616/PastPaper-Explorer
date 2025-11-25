import React, { useState, useEffect, useMemo } from 'react';
// Imports are now active by default
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  BookOpen, ChevronDown, AlertTriangle, ZoomIn, ZoomOut, RotateCcw, RotateCw
} from 'lucide-react';

// Required CSS for the PDF viewer
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// --- Worker Setup ---
// This configures the worker to run locally without needing CDN links.
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

const YEARS = Array.from({ length: 15 }, (_, i) => (2025 - i).toString());
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

  // --- SERVER MODE: Automatic URL Generator ---
  const activeFileUrl = useMemo(() => {
    // Ensure your PDF files are in the 'public/papers' folder 
    // and named exactly: Subject_SeasonYear_Type_PaperVariant.pdf
    // Example: 9709_s23_qp_12.pdf
    const shortYear = year.slice(2);
    const fileName = `${subject}_${season}${shortYear}_${type}_${paper}${variant}.pdf`;
    return `/papers/${fileName}`;
  }, [subject, year, season, paper, variant, type]);

  // Reset state when file changes
  useEffect(() => {
    setPdfError(false);
    setNumPages(null);
    setRotation(0);
  }, [activeFileUrl]);

  // --- NEW: Set Browser Title ---
  useEffect(() => {
    document.title = "PastPaper Explorer";
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
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
              {/* Your Name Displayed Here */}
              <h1 className="font-bold text-white text-base leading-tight">:) <span className="text-blue-500">By: Muhammad Huzaifa Imran</span></h1>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-2 justify-center lg:justify-start w-full">
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
          
          {/* Server Mode Indicator */}
          <div className="flex items-center ml-auto pl-4 lg:border-l border-slate-800">
             <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${pdfError ? 'border-red-900/50 bg-red-900/20' : 'border-slate-700 bg-slate-800'}`}>
                <div className={`w-2 h-2 rounded-full ${pdfError ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></div>
                <span className="text-[10px] font-mono text-slate-400">SERVER MODE</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative bg-slate-950 flex flex-col items-center overflow-hidden">
        <div className="w-full h-full flex flex-col relative">
            
            {/* === VIEWER SWITCHER === */}
            
            {/* 1. IFRAME FALLBACK (Commented Out) */}
            {/* <iframe src={activeFileUrl} className="w-full h-full border-none bg-slate-200" title="PDF Preview" /> */}

            {/* 2. CUSTOM PDF VIEWER (Active) 
               ================================================ */}
            <div className="flex-1 overflow-auto flex justify-center p-8 bg-slate-900 custom-scrollbar">
               <div className="relative shadow-2xl shadow-black pb-20">
                 <Document
                    file={activeFileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => {
                        console.error("PDF Load Error:", error);
                        setPdfError(true);
                    }}
                    loading={<div className="text-white animate-pulse mt-10">Searching for Paper...</div>}
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
                    <div className="flex flex-col items-center gap-4 p-10 bg-slate-800 rounded-lg border border-red-900/50 mt-10">
                        <AlertTriangle className="text-red-500" size={32} />
                        <h3 className="text-xl font-bold text-white">Paper Not Found</h3>
                        <div className="text-slate-400 text-center text-sm">
                           We looked for: <br/>
                           <code className="text-blue-400 bg-slate-900 px-2 py-1 rounded mt-2 block">{activeFileUrl}</code>
                        </div>
                        <p className="text-slate-500 text-xs mt-2 max-w-xs text-center">
                           Ensure the file exists in the <span className="font-mono">public/papers</span> folder and is named correctly.
                        </p>
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
                 <div className={`w-2 h-2 rounded-full ${pdfError ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></div>
                 <span className="text-[11px] font-mono text-slate-300 max-w-[250px] truncate">
                    {activeFileUrl.replace('/papers/', '')}
                 </span>
            </div>

        </div>
      </main>
    </div>
  );
}
