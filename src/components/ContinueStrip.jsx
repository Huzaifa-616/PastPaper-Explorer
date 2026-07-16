import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, RotateCcw } from 'lucide-react';
import { studentSnapshot } from '../utils/performance';
import { useDatabases } from '../hooks/useDatabases';

/* ═══════════════════════════════════════════════════════════════════════════
   CONTINUE STRIP — the hub, for someone who's been here before
   ═══════════════════════════════════════════════════════════════════════════
   Every number here was ALREADY sitting in the student's localStorage:
   useMcqSession has been recording every bubbled answer, and performance.js
   has been able to compute per-topic accuracy this whole time. The hub just
   never read any of it — a returning student got the same marketing pitch as
   a stranger while their own weak topics sat in their browser doing nothing.

   Renders NOTHING for a first-time visitor, so the pitch still lands for
   people who need it. No backend, no account, no cost: it's their own device
   telling them about themselves.
   ═══════════════════════════════════════════════════════════════════════════ */

const SUBJECT_NAME = {
  '9618': 'Computer Science', '9702': 'Physics', '9701': 'Chemistry',
  '9700': 'Biology', '9709': 'Mathematics', '9231': 'Further Maths',
};
const SUBJECT_HUE = {
  '9618': 'var(--teal)', '9702': 'var(--amber)', '9701': 'var(--rose)',
  '9700': 'var(--green)', '9709': 'var(--accent)', '9231': 'var(--accent)',
};

const SEASON = { s: 'May/June', w: 'Oct/Nov', m: 'Feb/Mar' };
const prettySession = (s) => {
  if (!s || s.length < 3) return s || '';
  return `${SEASON[s[0]] || s[0]} 20${s.slice(1)}`;
};

const ContinueStrip = () => {
  /* Fetches its own data rather than being prop-drilled through HubRoute —
     HubPage has no topicalDb, and threading it through three components to
     reach one strip isn't worth it. useDatabases is already cached. */
  const { topicalDb } = useDatabases();
  const snap = useMemo(() => studentSnapshot(topicalDb), [topicalDb]);

  // First-timers see the marketing hero, untouched.
  if (!snap.hasHistory) return null;

  return (
    <div className="anim-0 continue-strip" style={{
      width: '100%', maxWidth: 1000, marginTop: 40,
      background: 'var(--surface2)', border: '1px solid var(--line2)',
      borderRadius: 20, padding: 20, backdropFilter: 'blur(20px)',
    }}>
      {/* header line */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text3)' }}>
          CONTINUE
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)' }}>
          <b style={{ color: 'var(--text2)' }}>{snap.answered}</b> questions answered
          {snap.accuracy != null && <> · <b style={{ color: 'var(--text2)' }}>{snap.accuracy}%</b> correct</>}
        </span>
      </div>

      {/* resume cards — the paper spines */}
      <div className="continue-papers" style={{
        display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(190px, 1fr))`, gap: 10,
      }}>
        {snap.recent.map((r) => {
          const hue = SUBJECT_HUE[r.subject] || 'var(--accent)';
          const pct = Math.round((r.answered / r.total) * 100);
          return (
            <Link key={r.key} to={r.href} className="continue-card" style={{
              display: 'block', textDecoration: 'none', padding: '13px 14px',
              background: 'var(--bg2, var(--bg))', border: '1px solid var(--line2)',
              borderLeft: `3px solid ${hue}`, borderRadius: 12,
              transition: 'transform .18s, border-color .18s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {r.subject}/{r.paper}{r.variant}
                </span>
                <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'var(--text3)' }} />
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 3 }}>
                {SUBJECT_NAME[r.subject] || r.subject} · {prettySession(r.session)}
              </div>
              {/* progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <div style={{ flex: 1, height: 4, background: 'var(--surface3)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(pct, 3)}%`, height: '100%', background: hue, borderRadius: 100 }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: '"Roboto Mono", monospace' }}>
                  {r.answered}/{r.total}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* weakest topics — the diagnose→fix loop, on the front door */}
      {snap.weakest.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
            <TrendingDown size={11} color="var(--rose)" />
            <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text3)' }}>
              WEAKEST RIGHT NOW
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {snap.weakest.map((t) => (
              <Link key={t.subject + t.topic} to={`/topicals/${t.subject}`} className="continue-weak" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                padding: '7px 12px', borderRadius: 100,
                background: 'var(--bg2, var(--bg))', border: '1px solid var(--line2)',
                transition: 'border-color .18s, transform .18s',
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{t.topic}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, fontFamily: '"Roboto Mono", monospace',
                  color: t.accuracy < 50 ? 'var(--rose)' : 'var(--amber)',
                }}>{t.accuracy}%</span>
                <RotateCcw size={11} color="var(--text3)" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (hover: hover) {
          .continue-card:hover { transform: translateY(-2px); border-color: var(--text3); }
          .continue-weak:hover { transform: translateY(-2px); border-color: var(--rose); }
        }
        @media (max-width: 640px) {
          .continue-strip { padding: 16px; border-radius: 16px; }
          .continue-papers { grid-template-columns: 1fr 1fr; gap: 8px; }
        }
        @media (max-width: 400px) {
          .continue-papers { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ContinueStrip;
