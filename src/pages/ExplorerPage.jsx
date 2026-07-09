import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, ChevronDown, ChevronUp, Compass, Layers, Library,
  ListChecks, Mail, Moon, Play, Sun,
} from 'lucide-react';
import { SUBJECTS, YEARS, SEASONS, PAPERS, VARIANTS, MCQ_SUBJECTS, MCQ_PAPER } from '../config/constants';
import NexusSelect from '../components/NexusSelect';
import ContactModal from '../components/ContactModal';
import TopicalsSidebar from '../components/TopicalsSidebar';
import LibrarySidebar from '../components/LibrarySidebar';
import MCQSolver from '../components/MCQSolver';
import { useDatabases } from '../hooks/useDatabases';
import { useMcqSession } from '../hooks/useMcqSession';

// ─── URL helpers ──────────────────────────────────────────────────────────────
// Deep-link format:  /papers/9702/s23/qp/12?page=5
//   :subject = 9702   :session = s23 (season + 2-digit year)
//   :type    = qp|ms  :paperVariant = 12 (paper + variant)
export const buildPaperPath = ({ subject, season, year, type, paper, variant, page }) => {
  let path = `/papers/${subject}/${season}${year.slice(2)}/${type}/${paper}${variant}`;
  if (page && page > 1) path += `?page=${page}`;
  return path;
};

const parseParams = ({ subject, session, type, paperVariant }) => {
  if (!subject || !session || !type || !paperVariant) return null;
  if (session.length !== 3 || paperVariant.length !== 2) return null;
  return {
    subject,
    season: session[0],
    year: '20' + session.slice(1),
    type,
    paper: paperVariant[0],
    variant: paperVariant[1],
  };
};

// ─── ExplorerPage ─────────────────────────────────────────────────────────────
const ExplorerPage = ({ toggleTheme, dark }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const urlSelection = parseParams(params);
  const targetPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const initialSubject = searchParams.get('subject') || '';

  const { topicalDb, libraryDb } = useDatabases();

  const [showContact, setShowContact] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showMCQ, setShowMCQ] = useState(false);
  const [showTopicals, setShowTopicals] = useState(false);

  // Selection state. Seeded from the URL (deep link) or ?subject= (hub card).
  const [subject, setSubject] = useState(urlSelection?.subject || initialSubject);
  const [year, setYear] = useState(urlSelection?.year || '');
  const [season, setSeason] = useState(urlSelection?.season || '');
  const [paper, setPaper] = useState(urlSelection?.paper || '');
  const [variant, setVariant] = useState(urlSelection?.variant || '');
  const [type, setType] = useState(urlSelection?.type || 'qp');

  // The URL is the single source of truth for "is a paper open".
  const isViewing = !!urlSelection;

  // When the URL changes (deep link, topical jump, back/forward), sync the selects.
  useEffect(() => {
    if (!urlSelection) return;
    setSubject(urlSelection.subject);
    setYear(urlSelection.year);
    setSeason(urlSelection.season);
    setPaper(urlSelection.paper);
    setVariant(urlSelection.variant);
    setType(urlSelection.type);
    setShowNav(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.subject, params.session, params.type, params.paperVariant]);

  const isComplete = subject && year && season && paper && variant;
  const canShowLibrary = true;
  const canShowMCQ = MCQ_SUBJECTS.includes(subject) && paper === MCQ_PAPER;

  const paperKey = `${subject}_${season}${year ? year.slice(2) : ''}_${paper}_${variant}`;
  const { mcqState, updateMcqState } = useMcqSession(paperKey);

  const activeFileUrl = useMemo(() => {
    if (!isViewing) return '';
    return `/papers/${subject}_${season}${year.slice(2)}_${type}_${paper}${variant}.pdf`;
  }, [subject, year, season, paper, variant, type, isViewing]);

  const viewerSrc = useMemo(() => {
    if (!isViewing) return '';
    let url = `/pdf-viewer/web/viewer.html?file=${encodeURIComponent(activeFileUrl)}`;
    if (targetPage > 1) url += `#page=${targetPage}`;
    return url;
  }, [activeFileUrl, targetPage, isViewing]);

  useEffect(() => {
    document.title = isViewing
      ? `${subject} ${season}${year.slice(2)} ${type.toUpperCase()} ${paper}${variant} | The Nexus`
      : 'The Nexus | Workspace';
  }, [isViewing, subject, season, year, type, paper, variant]);

  useEffect(() => { setShowLibrary(false); setShowMCQ(false); }, [paper, variant, season, year, type]);

  const handleLoad = () => {
    if (!isComplete) return;
    navigate(buildPaperPath({ subject, season, year, type, paper, variant }));
  };

  const handleHome = () => { navigate('/papers'); setShowNav(true); };
  const handleBackToHub = () => navigate('/');

  const handleTopicalSelect = (paperId, pageNum) => {
    const parts = paperId.replace('.pdf', '').split('_');
    if (parts.length >= 4) {
      setShowTopicals(false);
      navigate(buildPaperPath({
        subject: parts[0],
        season: parts[1][0],
        year: '20' + parts[1].slice(1),
        type: parts[2],
        paper: parts[3][0],
        variant: parts[3][1],
        page: pageNum,
      }));
    }
  };

  return (
    <>
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

        <div
          style={{ display: 'grid', gridTemplateRows: showNav ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s cubic-bezier(0.16,1,0.3,1)', flexShrink: 0, zIndex: 30 }}
          onMouseLeave={(e) => { if (isViewing && e.clientY > 10) setShowNav(false); }}
        >
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
            <header className="nav-bar" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line2)' }}>

              <div className="nav-inner" style={{ maxWidth: 1800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>

                <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 16, marginRight: 8 }}>
                  <button className="icon-btn" onClick={handleBackToHub} title="Back to Hub" style={{ flexShrink: 0 }}><ArrowLeft size={16} /></button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={handleHome}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={16} color="var(--bg)" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>The Nexus</div>
                      <div className="nav-workspace-label" style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em' }}>WORKSPACE</div>
                    </div>
                  </div>
                </div>

                <div style={{ width: 1, height: 32, background: 'var(--line2)', flexShrink: 0 }} className="nav-divider" />

                <div className="custom-sb nav-filters" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flex: 1, overflowX: 'auto', paddingBottom: 4 }}>
                  <NexusSelect label="Subject" value={subject} onChange={v => { setSubject(v); setShowLibrary(false); setShowTopicals(false); }} options={SUBJECTS.map(s => ({ value: s.code, label: `${s.code} · ${s.name}` }))} />
                  <NexusSelect label="Year" value={year} onChange={setYear} options={YEARS} />
                  <NexusSelect label="Season" value={season} onChange={setSeason} options={SEASONS.map(s => ({ value: s.code, label: s.name }))} />
                  <NexusSelect label="Paper" value={paper} onChange={v => { setPaper(v); setShowLibrary(false); setShowTopicals(false); }} options={PAPERS} />
                  <NexusSelect label="Variant" value={variant} onChange={setVariant} options={VARIANTS} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', paddingLeft: 4 }}>Type</span>
                    <div className="nav-type-wrap" style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--line2)', borderRadius: 8, padding: 4, gap: 4 }}>
                      <button className={`seg-btn ${type === 'qp' ? 'a-accent' : 'inactive'}`} onClick={() => { setType('qp'); if (isViewing) navigate(buildPaperPath({ subject, season, year, type: 'qp', paper, variant })); }}>QP</button>
                      <button className={`seg-btn ${type === 'ms' ? 'a-accent' : 'inactive'}`} onClick={() => { setType('ms'); if (isViewing) navigate(buildPaperPath({ subject, season, year, type: 'ms', paper, variant })); }}>MS</button>
                    </div>
                  </div>

                  <div className="nav-tools-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', paddingLeft: 4 }}>Tools</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setShowTopicals(s => !s); setShowLibrary(false); setShowMCQ(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: showTopicals ? 'var(--text)' : 'var(--surface2)', color: showTopicals ? 'var(--bg)' : 'var(--text)', fontSize: 12, fontWeight: 600 }}>
                        <Compass size={14} /> Topicals
                      </button>

                      {canShowLibrary && (
                        <button onClick={() => { setShowLibrary(s => !s); setShowTopicals(false); setShowMCQ(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: showLibrary ? 'var(--text)' : 'var(--surface2)', color: showLibrary ? 'var(--bg)' : 'var(--text)', fontSize: 12, fontWeight: 600 }}>
                          <Library size={14} /> Library
                        </button>
                      )}

                      {canShowMCQ && (
                        <button onClick={() => { setShowMCQ(s => !s); setShowLibrary(false); setShowTopicals(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: showMCQ ? 'var(--text)' : 'var(--surface2)', color: showMCQ ? 'var(--bg)' : 'var(--text)', fontSize: 12, fontWeight: 600 }}>
                          <ListChecks size={14} /> Solver
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto', flexShrink: 0 }}>
                  {!isViewing && (
                    <button className={`btn-load ${isComplete ? 'ready' : 'disabled'}`} onClick={handleLoad} disabled={!isComplete}>
                      <Play size={14} fill="currentColor" /> Load Paper
                    </button>
                  )}
                  {isViewing && isComplete && !urlMatchesSelection(urlSelection, { subject, season, year, type, paper, variant }) && (
                    <button className="btn-load ready" onClick={handleLoad}>
                      <Play size={14} fill="currentColor" /> Load Paper
                    </button>
                  )}
                  {isViewing && <button className="icon-btn" onClick={() => setShowNav(false)} title="Collapse Navigation"><ChevronUp size={16} /></button>}
                  <div style={{ width: 1, height: 24, background: 'var(--line2)' }} />
                  <button className="icon-btn" onClick={toggleTheme}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
                  <button className="icon-btn" onClick={() => setShowContact(true)}><Mail size={16} /></button>
                </div>

              </div>
            </header>
          </div>
        </div>

        {isViewing && !showNav && (
          <>
            {/* Desktop horizontal hover trigger */}
            <div
              className="desktop-only"
              onMouseEnter={() => setShowNav(true)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', zIndex: 40, display: 'flex', justifyContent: 'center' }}
            >
              <div
                style={{ width: '80px', height: '4px', background: 'var(--text3)', opacity: 0.5, borderRadius: '0 0 4px 4px', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.width = '120px'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.width = '80px'; }}
              />
            </div>

            {/* Mobile pull tab trigger */}
            <div className="mobile-only" style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 40 }}>
              <button className="pull-tab-pill" onClick={() => setShowNav(true)} onTouchStart={() => setShowNav(true)}>
                <ChevronDown size={18} style={{ color: 'var(--text)' }} />
              </button>
            </div>
          </>
        )}

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

            {showTopicals && (
              <TopicalsSidebar subjectCode={subject} topicalDb={topicalDb} onClose={() => setShowTopicals(false)} onSelectQuestion={handleTopicalSelect} />
            )}

            {showLibrary && (
              <LibrarySidebar subjectCode={subject} libraryDb={libraryDb} onClose={() => setShowLibrary(false)} />
            )}

            {!isViewing ? (
              <div className="bg-grid anim-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '20%', left: '25%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)', opacity: 0.05, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '20%', right: '25%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--teal) 0%, transparent 60%)', opacity: 0.05, pointerEvents: 'none' }} />

                <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--surface2)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, zIndex: 1 }}>
                  <BookOpen size={40} color="var(--text3)" strokeWidth={1.5} />
                </div>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 16, zIndex: 1 }}>Workspace Ready</h2>
                <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.6, maxWidth: 460, marginBottom: 40, zIndex: 1 }}>
                  Configure your paper in the navigation bar above, then click <strong style={{ color: 'var(--text)' }}>Load Paper</strong> to open the viewer.
                </p>
              </div>
            ) : (
              <div className="anim-fade" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#e5e7eb' }}>
                  <iframe src={viewerSrc} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" allowFullScreen />
                </div>

                {showMCQ && canShowMCQ && (
                  <MCQSolver
                    subjectCode={subject} paperNum={paper} variant={variant} year={year} season={season}
                    onClose={() => setShowMCQ(false)}
                    mcqState={mcqState}
                    updateMcqState={updateMcqState}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

// True when the nav selection matches the currently-loaded URL paper.
function urlMatchesSelection(url, sel) {
  if (!url) return false;
  return url.subject === sel.subject && url.season === sel.season && url.year === sel.year
    && url.type === sel.type && url.paper === sel.paper && url.variant === sel.variant;
}

export default ExplorerPage;
