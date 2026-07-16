import React, { useState } from 'react';
import { SYLLABUS_STRUCTURE } from '../config/syllabus';
import { Activity, ArrowRight, Beaker, Code2, Compass, Github, Layers, Library, Moon, Omega, Search, Sun, Terminal, Zap } from 'lucide-react';
import { GITHUB_REPO_URL } from '../config/constants';
import DynamicLogo from '../components/DynamicLogo';
import SymbolField from '../components/SymbolField';

const StartupScreen = ({ onSelectExplorer, onSelectTopicals, onSelectLibrary, toggleTheme, dark, onOpenIndexer }) => {
  const [activeTab, setActiveTab] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('nexusSettings')); if (s?.defaultSubject) return s.defaultSubject; } catch { /* ignore */ }
    return '9618';
  });

  const brandColors = {
    '9618': { hex: 'var(--teal)', name: 'Computer Science', icon: <Terminal size={16}/> },
    '9702': { hex: 'var(--amber)', name: 'Physics', icon: <Zap size={16}/> },
    '9701': { hex: 'var(--rose)', name: 'Chemistry', icon: <Beaker size={16}/> },
    '9700': { hex: 'var(--green)', name: 'Biology', icon: <Activity size={16}/> },
    '9709': { hex: 'var(--accent)', name: 'Mathematics', icon: <Activity size={16}/> },
    '9231': { hex: 'var(--accent)', name: 'Further Mathematics', icon: <Omega size={16}/> }
  };

  const currentBrand = brandColors[activeTab] || brandColors['9709'];

  return (
    <div style={{ minHeight:'var(--app-h)', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <SymbolField />
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'60vh', background:`radial-gradient(ellipse at top, ${currentBrand.hex} 0%, transparent 60%)`, opacity: dark ? 0.12 : 0.08, pointerEvents:'none', zIndex: 0, transition:'background 0.5s ease' }}/>
      <div className="bg-grid" />

      <header style={{ padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <DynamicLogo size={20} color="var(--bg)" strokeWidth={2.5}/>
          </div>
          <div>
            <h1 style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text)' }}>The Nexus</h1>
            <p style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', color:'var(--text3)', textTransform:'uppercase' }}>Study Environment</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems: 'center', gap:12 }}>
          <button className="icon-btn" onClick={toggleTheme}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ textDecoration:'none' }}><Github size={16}/></a>
        </div>
      </header>

      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 20px', zIndex:10, position:'relative' }}>
        
        <div className="anim-0" style={{ textAlign:'center', marginBottom:48 }}>
          <h2 className="shimmer-text" style={{ fontSize:'clamp(48px, 8vw, 80px)', fontWeight:800, lineHeight:1, letterSpacing:'-0.03em', marginBottom:24 }}>
            From Prep to Perfection
          </h2>
          <p style={{ fontSize:18, color:'var(--text2)', fontWeight:400, maxWidth:600, margin:'0 auto', lineHeight:1.5 }}>
            A high-performance workspace engineered for Cambridge A-Level students. Search topics, extract papers, and acess notes.
          </p>
        </div>

        <div className="anim-1" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8, background:'var(--surface2)', padding:6, borderRadius:100, border:'1px solid var(--line2)', marginBottom:48, backdropFilter:'blur(20px)' }}>
          {Object.entries(brandColors).map(([code, data]) => {
            const isActive = activeTab === code;
            return (
              <button key={code} onClick={() => setActiveTab(code)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:100, border:'none', cursor:'pointer', transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  background: isActive ? 'var(--surface)' : 'transparent',
                  color: isActive ? 'var(--text)' : 'var(--text3)',
                  fontWeight: isActive ? 600 : 500,
                  boxShadow: isActive ? `0 4px 20px rgba(0,0,0,0.1), inset 0 0 0 1px ${data.hex}` : 'none'
                }}>
                <span style={{ color: isActive ? data.hex : 'currentColor' }}>{data.icon}</span>
                {data.name}
              </button>
            )
          })}
        </div>

        <div className="anim-3 tools-grid">
          
          {/* PastPaper Explorer */}
          <div className="glass-panel" style={{ padding:28, borderRadius:24, cursor:'pointer', transition:'all 0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
               onClick={() => onSelectExplorer(activeTab)}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; }}>
            <div>
              <div style={{ width:48, height:48, borderRadius:14, background:'var(--surface2)', border:'1px solid var(--line2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Layers size={20} color="var(--text)"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>PastPaper Explorer</h3>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>Search, filter, and load papers instantly with a built-in fast PDF engine.</p>
            </div>
            <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8 }}>
              {['QP & MS', '16 Years', 'File Attachments'].map(p => <span key={p} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', background:'var(--surface2)', borderRadius:100, border:'1px solid var(--line2)', color:'var(--text3)' }}>{p}</span>)}
            </div>
          </div>

          {/* IDE */}
          <div className="glass-panel" style={{ padding:28, borderRadius:24, cursor:'pointer', transition:'all 0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
               onClick={()=>window.open('https://coding-engine-9618.pages.dev/','_blank')}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; }}>
            <div>
              <div style={{ width:48, height:48, borderRadius:14, background:'var(--surface2)', border:'1px solid var(--line2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Code2 size={20} color="var(--text)"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8, display:'flex', alignItems:'center' }}>
                  Programming IDE
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'rgba(251, 191, 36, 0.1)', color:'var(--amber)', border:'1px solid var(--amber)', borderRadius:6, marginLeft:10, letterSpacing:'0.05em', textTransform:'uppercase' }}>In Development</span>
              </h3>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>Write, compile, and run code entirely in your browser. Built for 9618.</p>
            </div>
             <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8 }}>
              {['Python', 'Pseudocode'].map(p => <span key={p} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', background:'var(--surface2)', borderRadius:100, border:'1px solid var(--line2)', color:'var(--text3)' }}>{p}</span>)}
            </div>
          </div>

          {/* Resource Library */}
          <div className="glass-panel" style={{ padding:28, borderRadius:24, cursor:'pointer', transition:'all 0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
               onClick={() => onSelectLibrary(activeTab)}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; }}>
            <div>
              <div style={{ width:48, height:48, borderRadius:14, background:'var(--surface2)', border:'1px solid var(--line2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Library size={20} color="var(--text)"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Resource Library</h3>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>Access textbooks, revision notes, and formula sheets directly from your repository.</p>
            </div>
            <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', gap:8 }}>
                {['PDFs', 'Notes', 'Books'].map(p => <span key={p} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', background:'var(--surface2)', borderRadius:100, border:'1px solid var(--line2)', color:'var(--text3)' }}>{p}</span>)}
              </div>
              <button onClick={(e) => { e.stopPropagation(); onSelectLibrary(''); }}
                style={{ fontSize:11, fontWeight:600, padding:'6px 12px', background:'var(--text)', color:'var(--bg)', borderRadius:8, border:'none', cursor:'pointer' }}>
                Browse All
              </button>
            </div>
          </div>

          {/* Topical Database (FEATURED WIDE CARD) */}
          <div className="glass-panel featured-card" style={{ padding: 0, borderRadius: 24, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}
               onClick={() => onSelectTopicals(activeTab)}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = currentBrand.hex; e.currentTarget.querySelector('.feature-glow').style.opacity = '0.3'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.querySelector('.feature-glow').style.opacity = '0.1'; }}>
            
            <div className="feature-glow" style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', background:`radial-gradient(ellipse at right, ${currentBrand.hex}, transparent 70%)`, opacity:0.1, transition:'opacity 0.4s', pointerEvents:'none' }} />

            <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`var(--surface2)`, border:`1px solid var(--line2)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Compass size={20} color={currentBrand.hex}/>
              </div>
              <h3 style={{ fontSize:24, fontWeight:700, marginBottom:8, display:'flex', alignItems:'center' }}>
                Topical Database
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'rgba(251, 191, 36, 0.1)', color:'var(--amber)', border:'1px solid var(--amber)', borderRadius:6, marginLeft:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>In Development</span>
              </h3>
              <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.6, maxWidth:400, marginBottom: 24 }}>
                Don't just scan years—target your weaknesses. Dive into a massive database of past paper questions strictly indexed by the official syllabus structure.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                <span style={{ fontSize:13, fontWeight: 600, padding:'8px 16px', background:'var(--text)', borderRadius:10, color:'var(--bg)', display:'inline-flex', alignItems:'center' }}>
                  Explore Topics <ArrowRight size={14} style={{marginLeft:6}}/>
                </span>
              </div>
            </div>

            <div className="topical-visual" style={{ flex: 1, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1 }}>
              <div style={{ width: '100%', maxWidth: 320, background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--line2)', padding: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems:'center', gap: 6 }}>
                  <Layers size={14} color="var(--text3)"/> Paper 1 Topics
                </div>
                {(SYLLABUS_STRUCTURE[activeTab]?.['1']?.topics || SYLLABUS_STRUCTURE[activeTab]?.[Object.keys(SYLLABUS_STRUCTURE[activeTab]||{})[0]]?.topics || []).slice(0,3).map((t,i)=>({t, q: [42,28,35][i]})).map((mock, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{mock.t}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface3)', padding: '2px 8px', borderRadius: 12 }}>{mock.q} Qs</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
      {/* SEO & Context Block (Hidden elegantly but readable by Google) */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 40px 20px', zIndex: 10, position: 'relative' }}>
        <div style={{ padding: 24, borderRadius: 20, background: 'var(--surface2)', border: '1px solid var(--line2)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>About The Nexus: Cambridge A-Level Workspace</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
            The Nexus is an advanced, high-performance study environment specifically engineered for CAIE A-Level and AS-Level students. Designed to eliminate the friction of traditional study methods, it provides instant, zero-latency access to past papers, marking schemes, and an interactive Resource Library.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Supported Syllabuses</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
                {Object.keys(brandColors).map(code => (
                  <li key={code}>• {brandColors[code].name} ({code})</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Core Features</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
                <li>• Topical Database & Question Extraction</li>
                <li>• Automated MCQ Solver with Answer Keys</li>
                <li>• Built-in Programming IDE (Python, Pseudocode)</li>
                <li>• Fast PDF Rendering Engine</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <footer style={{ padding:'24px', textAlign:'center', zIndex:10 }}>
        <p style={{ fontSize:12, color:'var(--text3)', letterSpacing:'0.05em', fontWeight:500 }}>
          MUHAMMAD HUZAIFA IMRAN
        </p>
        <p style={{ fontSize:12, color:'var(--text3)', letterSpacing:'0.05em', fontWeight:500 }}>This is a non-profit, student-built educational tool and that all materials remain the property of CAIE.</p>
      </footer>
    </div>
  );
};


export default StartupScreen;
