import React from 'react';
import { X, Settings as SettingsIcon, RotateCcw, Check, Droplets } from 'lucide-react';
import { THEMES, FONT_SCALES } from '../config/themes';
import { SUBJECTS } from '../config/constants';

// A theme swatch: mini preview of bg + accent + text tones.
const ThemeSwatch = ({ id, theme, active, onPick }) => (
  <button
    onClick={() => onPick(id)}
    style={{
      display: 'flex', flexDirection: 'column', gap: 8, padding: 10,
      borderRadius: 12, cursor: 'pointer', textAlign: 'left',
      background: 'var(--surface2)',
      border: active ? '2px solid var(--accent)' : '1px solid var(--line2)',
      transition: 'all 0.15s',
    }}
  >
    <div style={{
      height: 44, borderRadius: 8, background: theme.bg,
      border: '1px solid rgba(128,128,128,0.25)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 7, left: 8, right: 8, height: 7, borderRadius: 4, background: theme.surface3 }} />
      <div style={{ position: 'absolute', top: 20, left: 8, width: '55%', height: 7, borderRadius: 4, background: theme.accent }} />
      <div style={{ position: 'absolute', top: 32, left: 8, width: '38%', height: 5, borderRadius: 3, background: theme.text3 }} />
      {active && (
        <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={11} color={theme.bg} strokeWidth={3} />
        </div>
      )}
    </div>
    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{theme.name}</span>
  </button>
);

const Section = ({ label, badge, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>{label}</span>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--accent)',
                       border: '1px solid var(--accent)', borderRadius: 999, padding: '2px 8px' }}>ACTIVE</span>
      )}
    </div>
    {children}
  </div>
);

const SettingsModal = ({ isOpen, onClose, settings, setSetting, resetSettings }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="custom-sb"
        style={{ width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto', background: 'var(--bg2)', border: '1px solid var(--line2)', borderRadius: 20, padding: 24 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SettingsIcon size={18} color="var(--text)" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Settings</div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Theme galleries — dark and light chosen separately; the Sun/Moon
            toggle flips between YOUR two picks. The tick marks each side's
            remembered choice; ACTIVE marks the side you're on right now. */}
        {(() => {
          const activeDark = THEMES[settings.themeId]?.isDark;
          const darkPick = settings.lastDarkId || 'midnight';
          const lightPick = settings.lastLightId || 'daylight';
          return (
            <>
              <Section label="Dark theme" badge={activeDark}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                  {Object.entries(THEMES).filter(([, t]) => t.isDark).map(([id, t]) => (
                    <ThemeSwatch key={id} id={id} theme={t} active={darkPick === id} onPick={v => setSetting('themeId', v)} />
                  ))}
                </div>
              </Section>
              <Section label="Light theme" badge={!activeDark}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                  {Object.entries(THEMES).filter(([, t]) => !t.isDark).map(([id, t]) => (
                    <ThemeSwatch key={id} id={id} theme={t} active={lightPick === id} onPick={v => setSetting('themeId', v)} />
                  ))}
                </div>
              </Section>
            </>
          );
        })()}

        {/* Appearance — Liquid Glass on/off */}
        <Section label="Appearance">
          <button
            onClick={() => setSetting('glass', !(settings.glass !== false))}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                     borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                     background: 'var(--surface2)', border: '1px solid var(--line2)', transition: 'all .15s' }}>
            <Droplets size={17} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Liquid Glass</span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Frosted, translucent panels</span>
            </span>
            <span aria-hidden style={{
              width: 42, height: 24, borderRadius: 999, flexShrink: 0, position: 'relative', transition: 'background .18s',
              background: settings.glass !== false ? 'var(--accent)' : 'var(--surface3)',
              border: '1px solid var(--line2)',
            }}>
              <span style={{
                position: 'absolute', top: 2, left: settings.glass !== false ? 20 : 2,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.35)', transition: 'left .18s',
              }} />
            </span>
          </button>
        </Section>

        {/* Font size */}
        <Section label="Text size">
          <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--line2)', borderRadius: 10, padding: 4, gap: 4 }}>
            {FONT_SCALES.map(s => (
              <button
                key={s.id}
                onClick={() => setSetting('fontScale', s.id)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                  background: settings.fontScale === s.id ? 'var(--text)' : 'transparent',
                  color: settings.fontScale === s.id ? 'var(--bg)' : 'var(--text2)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5 }}>
            Scales the whole interface — helpful on small screens or for easier reading.
          </p>
        </Section>

        <Section label="Dashboard backdrop">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { id: 'off',     name: 'Off',      desc: 'A still page.' },
              { id: 'falling', name: 'Symbols',  desc: 'Notation drifting down.' },
              { id: 'torch',   name: 'Torchlight', desc: 'Revealed by your cursor.' },
              { id: 'papers',  name: 'Paper wall', desc: 'A grid of paper codes.' },
            ].map(o => {
              const on = (settings.backdrop || 'falling') === o.id;
              return (
                <button key={o.id} onClick={() => setSetting('backdrop', o.id)}
                  style={{
                    textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: on ? 'var(--surface3)' : 'transparent',
                    border: on ? '1px solid var(--accent)' : '1px solid var(--line2)',
                    transition: 'all .15s',
                  }}>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700,
                                 color: on ? 'var(--text)' : 'var(--text2)' }}>{o.name}</span>
                  <span style={{ display: 'block', fontSize: 10.5, color: 'var(--text3)', marginTop: 2 }}>{o.desc}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Default subject */}
        <Section label="Default subject">
          <select
            className="nexus-select"
            style={{ width: '100%' }}
            value={settings.defaultSubject}
            onChange={e => setSetting('defaultSubject', e.target.value)}
          >
            <option value="">None — ask every time</option>
            {SUBJECTS.map(s => (
              <option key={s.code} value={s.code}>{s.code} · {s.name}</option>
            ))}
          </select>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5 }}>
            Pre-selects this subject when you open the paper workspace.
          </p>
        </Section>

        {/* Reset */}
        <button
          onClick={resetSettings}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--line2)', background: 'transparent', color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          <RotateCcw size={13} /> Reset to defaults
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
