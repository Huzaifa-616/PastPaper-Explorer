import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FolderOpen, FileText, CheckCircle, Search, BookOpen, ChevronDown, 
  AlertTriangle, ZoomIn, ZoomOut, RotateCcw, RotateCw, FileUp, Mail, X, Copy, Check, Play, Code
} from 'lucide-react';

/* ========================================================================
   LOCAL MODE: CUSTOM PDF ENGINE ENABLED
   ======================================================================== */

// 1. IMPORTS (Active)
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// 2. WORKER SETUP (Active)
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

// Helper to track visible page
const PageWrapper = ({ pageNumber, setVisiblePage, children }) => {
  const ref = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisiblePage(pageNumber); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pageNumber, setVisiblePage]);
  return <div ref={ref} id={`page_${pageNumber}`} className="shadow-xl">{children}</div>;
};

// --- Main App ---

export default function App() {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0); 
  const [pdfError, setPdfError] = useState(false);
  const [showContact, setShowContact] = useState(false);
   
  // New State: Controls if we are viewing a paper or the welcome screen
  const [isViewing, setIsViewing] = useState(false);
  const [showZoomToast, setShowZoomToast] = useState(false);

  const [visiblePage, setVisiblePage] = useState(1);
   
  // Independent Memory for QP and MS { 'qp': 5, 'ms': 2 }
  const pageHistoryRef = useRef({ qp: 1, ms: 1 });
  const restorePageRef = useRef(1);
  const prevContextRef = useRef(null);

  // Filters
  const [subject, setSubject] = useState(SUBJECTS[0].code);
  const [year, setYear] = useState('2023');
  const [season, setSeason] = useState('s');
  const [paper, setPaper] = useState('1');
  const [variant, setVariant] = useState('2');
  const [type, setType] = useState('qp');

  const activeFileUrl = useMemo(() => {
    const shortYear = year.slice(2);
    const fileName = `${subject}_${season}${shortYear}_${type}_${paper}${variant}.pdf`;
    return `/papers/${fileName}`;
  }, [subject, year, season, paper, variant, type]);

  // --- SMART PAGE SYNC LOGIC ---
  useEffect(() => {
    if (!isViewing) return; 

    // 1. Save the position of the PREVIOUS document type
    if (prevContextRef.current) {
        const { type: prevType } = prevContextRef.current;
        // We save the 'visiblePage' state (which tracks what we were just looking at)
        pageHistoryRef.current[prevType] = visiblePage;
    }

    const currentContext = { subject, year, season, paper, variant, type };
    const prevContext = prevContextRef.current;

    // 2. Check if we are on the same paper (just switching QP/MS)
    const isSamePaper = prevContext && 
      prevContext.subject === subject &&
      prevContext.year === year &&
      prevContext.season === season &&
      prevContext.paper === paper &&
      prevContext.variant === variant;

    if (isSamePaper) {
      // Retrieve the memory for the NEW type we are switching TO
      restorePageRef.current = pageHistoryRef.current[type] || 1;
    } else {
      // New paper entirely -> Reset memories
      pageHistoryRef.current = { qp: 1, ms: 1 };
      restorePageRef.current = 1;
    }

    prevContextRef.current = currentContext;
    setPdfError(false);
    setNumPages(null);
    setRotation(0); 
  }, [activeFileUrl, subject, year, season, paper, variant, type, isViewing]); 

  useEffect(() => {
    document.title = "PastPaper Explorer";
  }, []);

  // Zoom Toast Logic
  useEffect(() => {
    if (isViewing && scale !== 1.0) { 
        setShowZoomToast(true);
        const timer = setTimeout(() => setShowZoomToast(false), 800);
        return () => clearTimeout(timer);
    }
  }, [scale]);

  const handleLoadPaper = () => {
    setIsViewing(true);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // Restore page position
    setTimeout(() => {
      const targetPage = Math.min(restorePageRef.current, numPages);
      const pageEl = document.getElementById(`page_${targetPage}`);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 100);
  };

  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);

  // --- HYBRID ZOOM ENGINE ---
  const containerRef = useRef(null);
  const contentRef = useRef(null); 
  const gestureState = useRef({ 
    startScale: 1, 
    currentVisualScale: 1, 
    isPinching: false 
  });
  const wheelTimeout = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Apply VISUAL transform immediately (Cheap)
    const applyVisualZoom = (visualScale) => {
        if (contentRef.current) {
            contentRef.current.style.transform = `scale(${visualScale / scale})`;
            contentRef.current.style.transformOrigin = 'top left';
        }
        setShowZoomToast(true);
        const toastVal = document.getElementById('zoom-toast-val');
        if(toastVal) toastVal.innerText = Math.round(visualScale * 100) + '%';
    };

    // Commit logic (Expensive Redraw)
    const commitZoom = (finalScale) => {
        const clamped = Math.min(Math.max(0.5, finalScale), 3.0);
        setScale(clamped); 
        
        setTimeout(() => {
            if(contentRef.current) contentRef.current.style.transform = 'none';
            setShowZoomToast(false);
        }, 100);
        
        gestureState.current.currentVisualScale = clamped;
    };

    // 1. Desktop Wheel
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (wheelTimeout.current) clearTimeout(wheelTimeout.current);

        const delta = -e.deltaY * 0.002;
        let newVisual = gestureState.current.currentVisualScale + delta;
        newVisual = Math.min(Math.max(0.5, newVisual), 3.0);
        
        gestureState.current.currentVisualScale = newVisual;
        applyVisualZoom(newVisual);

        wheelTimeout.current = setTimeout(() => {
            commitZoom(newVisual);
        }, 300); 
      }
    };

    // 2. Mobile Pinch
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        gestureState.current.startDist = dist;
        gestureState.current.startScale = gestureState.current.currentVisualScale; // Start from where we are
        gestureState.current.isPinching = true;
      }
    };

    const handleTouchMove = (e) => {
      if (gestureState.current.isPinching && e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        const factor = dist / gestureState.current.startDist;
        const newVisual = gestureState.current.startScale * factor;
        
        gestureState.current.currentVisualScale = newVisual;
        applyVisualZoom(newVisual);
      }
    };

    const handleTouchEnd = (e) => {
       if (gestureState.current.isPinching && e.touches.length < 2) {
           gestureState.current.isPinching = false;
           commitZoom(gestureState.current.currentVisualScale);
       }
    };

    gestureState.current.currentVisualScale = scale;

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, isViewing]); 

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-200 font-sans">
      
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />

      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 shadow-xl z-20 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center px-3 py-3 gap-3 lg:h-14">
          
          {/* Logo */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-2 pr-4 lg:border-r border-slate-800 mr-1">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsViewing(false)}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                <BookOpen className="text-white" size={16} />
              </div>
              <div>
                <h1 className="font-bold text-white text-base leading-tight whitespace-nowrap">:) <span className="text-blue-500">By: Muhammad Huzaifa Imran</span></h1>
              </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
               {/* Status Dot */}
               <div className={`w-1.5 h-1.5 rounded-full ${pdfError ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_5px_rgba(34,197,94,0.6)]`}></div>
               
               <button onClick={handleLoadPaper} className={`px-2.5 py-1 rounded-md font-bold text-[10px] transition-all ${isViewing ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'}`}>
                  {isViewing ? 'Reload' : 'Load'}
               </button>
               <button onClick={() => setShowContact(true)} className="p-1.5 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700">
                  <Mail size={12} className="text-slate-400" />
               </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <Select label="Subject" value={subject} onChange={setSubject} options={SUBJECTS.map(s => ({ value: s.code, label: `${s.code} ${s.name}` }))} minWidth="w-32 lg:w-40"/>
            <div className="w-px h-6 bg-slate-800 hidden lg:block"></div>
            <Select label="Year" value={year} onChange={setYear} options={YEARS} minWidth="w-16 lg:w-20" />
            <Select label="Season" value={season} onChange={setSeason} options={SEASONS.map(s => ({ value: s.code, label: s.name }))} minWidth="w-24 lg:w-28" />
            <Select label="Paper" value={paper} onChange={setPaper} options={PAPERS} minWidth="w-12 lg:w-14" />
            <Select label="Variant" value={variant} onChange={setVariant} options={VARIANTS} minWidth="w-12 lg:w-14" />
            
            <div className="flex flex-col ml-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Type</span>
              <div className="bg-slate-800 p-0.5 rounded-md border border-slate-700 flex shadow-sm">
                <button onClick={() => setType('qp')} className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold flex items-center gap-1 ${type === 'qp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>QP</button>
                <button onClick={() => setType('ms')} className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold flex items-center gap-1 ${type === 'ms' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>MS</button>
              </div>
            </div>

            {/* --- CUSTOM BUTTON FOR 9618 PAPER 2 --- */}
            {subject === '9618' && paper === '2' && (
              <div className="flex flex-col ml-1 animate-in fade-in zoom-in duration-300">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Compiler</span>
                <button 
                  onClick={() => window.open('https://pseudocode-ide.netlify.app/', '_blank')}
                  className="h-[26px] px-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-md text-[13px] font-bold shadow-md shadow-indigo-900/20 border border-indigo-400/20 transition-all active:scale-95 flex items-center justify-center tracking-tighter"
                  title="Open Online Compiler"
                >
                  &lt;&gt;
                </button>
              </div>
            )}
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center ml-auto pl-4 lg:border-l border-slate-800 gap-3">
             <button 
                onClick={handleLoadPaper} 
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/20 transition-all active:scale-95"
             >
                <Play size={10} fill="currentColor" /> Load
             </button>
             <button onClick={() => setShowContact(true)} className="p-1.5 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white">
                <Mail size={14} />
             </button>
             
             {/* Server Indicator */}
             <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${pdfError ? 'border-red-900/50 bg-red-900/20' : 'border-slate-700 bg-slate-800'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${pdfError ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_5px_rgba(34,197,94,0.6)]`}></div>
                <span className="text-[9px] font-mono text-slate-400">SERVER</span>
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
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Auto-Rotation</span>
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Smart Zoom</span>
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800">Page Sync</span>
             </div>
          </div>
        )}

        {/* === VIEWER CONTAINER === */}
        {isViewing && (
          <div className="w-full h-full flex flex-col relative">
            
            {/* 2. CUSTOM PDF VIEWER (ACTIVE) */}
            <div ref={containerRef} className="flex-1 overflow-auto flex justify-center p-4 md:p-8 bg-slate-900 custom-scrollbar pb-32 lg:pb-20 touch-pan-y">
               <div ref={contentRef} className="relative shadow-2xl shadow-black pb-20 origin-top-left transition-none">
                 <Document
                   file={activeFileUrl}
                   onLoadSuccess={onDocumentLoadSuccess}
                   onLoadError={() => setPdfError(true)}
                   loading={<div className="text-white animate-pulse mt-10">Loading Document...</div>}
                   className="flex flex-col gap-4 md:gap-6"
                 >
                   {numPages && Array.from(new Array(numPages), (el, index) => (
                     <PageWrapper 
                       key={`page_${index + 1}`}
                       pageNumber={index + 1}
                       setVisiblePage={setVisiblePage}
                     >
                       <Page 
                         pageNumber={index + 1} 
                         scale={scale} 
                         rotate={rotation}
                         renderTextLayer={false} 
                         renderAnnotationLayer={false}
                         className="shadow-xl" 
                         canvasBackground="#ffffff"
                         loading={<div className="bg-white h-[300px] w-[200px] flex items-center justify-center text-slate-300">Loading...</div>}
                       />
                     </PageWrapper>
                   ))}
                 </Document>
                 
                 {pdfError && (
                    <div className="flex flex-col items-center gap-4 p-10 bg-slate-800 rounded-lg border border-red-900/50 mt-10">
                        <AlertTriangle className="text-red-500" size={32} />
                        <h3 className="text-xl font-bold text-white">Paper Not Found</h3>
                        <div className="text-slate-400 text-center text-sm">
                           <code className="text-blue-400 bg-slate-900 px-2 py-1 rounded mt-2 block">{activeFileUrl}</code>
                        </div>
                    </div>
                 )}
               </div>
            </div> 

            {/* --- ZOOM TOAST (Feedback) --- */}
            {showZoomToast && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-full text-xl font-bold shadow-2xl z-50 pointer-events-none animate-in zoom-in-90 fade-in duration-200">
                    <span id="zoom-toast-val">{Math.round(scale * 100)}%</span>
                </div>
            )}

            {/* --- TOOLBARS --- */}
            
            {/* Desktop Toolbar (Vertical Left) */}
            <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/90 backdrop-blur text-white p-2 rounded-xl shadow-2xl border border-slate-700 flex-col items-center gap-3 z-30">
              <div className="flex flex-col items-center gap-1 bg-slate-900/50 rounded-lg p-1">
                <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors" title="Zoom In"><ZoomIn size={18}/></button>
                <span className="text-[10px] font-mono py-1">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors" title="Zoom Out"><ZoomOut size={18}/></button>
                <div className="h-px w-6 bg-slate-700 my-1"></div>
                <button onClick={() => setScale(1.0)} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors" title="Reset"><RotateCcw size={16}/></button>
              </div>
              <div className="flex flex-col items-center gap-1 bg-slate-900/50 rounded-lg p-1">
                <button onClick={rotateClockwise} className="p-1.5 hover:bg-slate-700 rounded-md transition-colors text-blue-300 hover:text-blue-100" title="Rotate"><RotateCw size={18}/></button>
              </div>
            </div>

            {/* Mobile Toolbar (Bottom Right - Fixed) */}
            <div className="lg:hidden fixed bottom-6 right-4 flex flex-col gap-2 z-40">
               <div className="bg-slate-800/90 backdrop-blur text-white p-2 rounded-xl shadow-2xl border border-slate-700 flex flex-col items-center gap-2">
                  <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="p-2 bg-slate-700/50 rounded-full hover:bg-slate-700 active:scale-95"><ZoomIn size={18}/></button>
                  <span className="text-[10px] font-mono py-1">{Math.round(scale * 100)}%</span>
                  <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 bg-slate-700/50 rounded-full hover:bg-slate-700 active:scale-95"><ZoomOut size={18}/></button>
                  <div className="h-px w-6 bg-slate-600"></div>
                  <button onClick={rotateClockwise} className="p-2 bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 active:scale-95"><RotateCw size={18}/></button>
               </div>
            </div>

            {/* Desktop Bottom Pill */}
             <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700 items-center gap-3 z-30">
                 {/* Re-added Green Dot */}
                 <div className={`w-2 h-2 rounded-full ${pdfError ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></div>
                 <span className="text-[11px] font-mono text-slate-300 max-w-[250px] truncate">
                    {activeFileUrl.replace('/papers/', '')}
                 </span>
                 <span className="text-[9px] text-slate-500 border-l border-slate-700 pl-3">
                    Page {visiblePage} {numPages ? `/ ${numPages}` : ''}
                 </span>
            </div>

        </div>
        )}
      </main>
    </div>
  );
}
