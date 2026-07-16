import React from 'react';
import { X, Settings as SettingsIcon, RotateCcw, Check } from 'lucide-react';
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

const Section = ({ label, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>{label}</div>
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

        {/* Theme gallery */}
        <Section label="Theme">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Object.entries(THEMES).map(([id, t]) => (
              <ThemeSwatch key={id} id={id} theme={t} active={settings.themeId === id} onPick={v => setSetting('themeId', v)} />
            ))}
          </div>
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
